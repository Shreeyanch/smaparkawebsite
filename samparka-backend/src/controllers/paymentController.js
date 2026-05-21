const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const Payment = require("../models/paymentModel");
const Store = require("../models/storeModel");

// Regional pricing — amounts in smallest currency unit (paise / cents)
// Must stay in sync with frontend pricingConfig.js
// NOTE: This is the authoritative backend source. Frontend prices are display-only.
const REGIONAL_PLANS = {
  NP: {
    currency: "NPR",
    growth: {
      monthly:   250000,  // NPR 2,500
      quarterly: 750000,  // NPR 7,500
      annual:    2560000, // NPR 25,600
    },
  },
  IN: {
    currency: "INR",
    growth: {
      monthly:   156500,  // INR 1,565
      quarterly: 469000,  // INR 4,690
      annual:    1600000, // INR 16,000
    },
  },
  GLOBAL: {
    currency: "USD",
    growth: {
      monthly:   4000,   // USD 40
      quarterly: 12000,  // USD 120
      annual:    48000,  // USD 480
    },
  },
};

// Fallback region when none is provided or region is unrecognised
const DEFAULT_REGION = "NP";

// Free trial duration in days
const FREE_TRIAL_DAYS = 7;

// Get subscription duration in days
const getDurationDays = (billingCycle) => {
  switch (billingCycle) {
    case "monthly":
      return 30;
    case "quarterly":
      return 90;
    case "annual":
      return 365;
    default:
      return 30;
  }
};

class PaymentController {
  // Get current subscription status
  async getSubscriptionStatus(req, res) {
    try {
      const store = await Store.findOne({ user: req.user._id });

      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      const now = new Date();
      const isActive =
        store.subscriptionEndDate && new Date(store.subscriptionEndDate) > now;

      // Get payment history (only successful transactions)
      const payments = await Payment.find({ store: store._id, status: "paid" })
        .sort({ createdAt: -1 })
        .limit(10);

      return res.status(200).json({
        success: true,
        data: {
          isActive,
          subscriptionStartDate: store.subscriptionStartDate,
          subscriptionEndDate: store.subscriptionEndDate,
          daysRemaining: isActive
            ? Math.ceil(
                (new Date(store.subscriptionEndDate) - now) /
                  (1000 * 60 * 60 * 24)
              )
            : 0,
          hasUsedFreeTrial: store.hasUsedFreeTrial || false,
          currentPlan: store.currentPlan || null,
          payments,
        },
      });
    } catch (error) {
      console.error("Error getting subscription status:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get subscription status",
      });
    }
  }

  // Create Razorpay order
  async createOrder(req, res) {
    try {
      const { plan, billingCycle, storeId, region } = req.body;

      // Validate plan
      const regionConfig = REGIONAL_PLANS[region] || REGIONAL_PLANS[DEFAULT_REGION];
      if (!regionConfig[plan]) {
        return res.status(400).json({
          success: false,
          message: "Invalid plan selected",
        });
      }

      // Validate billing cycle
      if (!["monthly", "quarterly", "annual"].includes(billingCycle)) {
        return res.status(400).json({
          success: false,
          message: "Invalid billing cycle",
        });
      }

      // Get store
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      const amount = regionConfig[plan][billingCycle];
      const currency = regionConfig.currency;

      // Create Razorpay order
      const order = await razorpay.orders.create({
        amount: amount,
        currency: currency,
        receipt: `receipt_${Date.now()}`,
        notes: {
          userId: req.user._id.toString(),
          storeId: storeId,
          plan: plan,
          billingCycle: billingCycle,
          region: region || DEFAULT_REGION,
        },
      });

      // Save payment record
      const payment = await Payment.create({
        user: req.user._id,
        store: storeId,
        razorpayOrderId: order.id,
        plan: plan,
        billingCycle: billingCycle,
        amount: amount / 100, // Store in base currency unit
        currency: currency,
        status: "created",
      });

      return res.status(200).json({
        success: true,
        data: {
          orderId: order.id,
          amount: amount,
          currency: currency,
          keyId: process.env.RAZORPAY_KEY_ID,
          paymentId: payment._id,
        },
      });
    } catch (error) {
      console.error("Error creating order:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create order",
      });
    }
  }

  // Verify payment and update subscription
  async verifyPayment(req, res) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;

      // Verify signature
      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign)
        .digest("hex");

      if (razorpay_signature !== expectedSign) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment signature",
        });
      }

      // Find and update payment record
      const payment = await Payment.findOne({
        razorpayOrderId: razorpay_order_id,
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment record not found",
        });
      }

      // Calculate subscription dates
      const now = new Date();
      const store = await Store.findById(payment.store);

      // If store has existing subscription, extend from end date
      let startDate = now;
      if (
        store.subscriptionEndDate &&
        new Date(store.subscriptionEndDate) > now
      ) {
        startDate = new Date(store.subscriptionEndDate);
      }

      const durationDays = getDurationDays(payment.billingCycle);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + durationDays);

      // Update payment record
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.status = "paid";
      payment.subscriptionStartDate = startDate;
      payment.subscriptionEndDate = endDate;
      await payment.save();

      // Update store subscription
      await Store.findByIdAndUpdate(payment.store, {
        subscriptionStartDate: store.subscriptionStartDate || startDate,
        subscriptionEndDate: endDate,
      });

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: {
          subscriptionEndDate: endDate,
        },
      });
    } catch (error) {
      console.error("Error verifying payment:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to verify payment",
      });
    }
  }

  // Razorpay webhook handler
  async webhook(req, res) {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

      // Get raw body for signature verification
      const rawBody = req.body instanceof Buffer ? req.body.toString() : JSON.stringify(req.body);
      
      // Verify webhook signature
      const signature = req.headers["x-razorpay-signature"];
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (signature !== expectedSignature) {
        console.error("Webhook signature verification failed");
        return res.status(400).json({ message: "Invalid signature" });
      }

      // Parse body if it's a Buffer
      const body = req.body instanceof Buffer ? JSON.parse(req.body.toString()) : req.body;
      const event = body.event;
      const payload = body.payload;

      switch (event) {
        case "payment.captured":
          // Payment successful - already handled by verifyPayment
          console.log("Payment captured:", payload.payment.entity.id);
          break;

        case "payment.failed":
          // Update payment status to failed
          const failedOrderId = payload.payment.entity.order_id;
          await Payment.findOneAndUpdate(
            { razorpayOrderId: failedOrderId },
            { status: "failed" }
          );
          console.log("Payment failed:", payload.payment.entity.id);
          break;

        case "refund.created":
          // Handle refund
          const refundPaymentId = payload.refund.entity.payment_id;
          await Payment.findOneAndUpdate(
            { razorpayPaymentId: refundPaymentId },
            { status: "refunded" }
          );
          console.log("Refund created:", payload.refund.entity.id);
          break;

        default:
          console.log("Unhandled webhook event:", event);
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      return res.status(500).json({ message: "Webhook processing failed" });
    }
  }

  // Activate free 7-day trial (Starter Plan)
  async activateFreeTrial(req, res) {
    try {
      const { storeId } = req.body;

      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      // Check if store already used free trial
      if (store.hasUsedFreeTrial) {
        return res.status(400).json({
          success: false,
          message: "Free trial has already been used for this store",
        });
      }

      // Check if store already has an active subscription
      if (store.subscriptionEndDate && new Date(store.subscriptionEndDate) > new Date()) {
        return res.status(400).json({
          success: false,
          message: "Store already has an active subscription",
        });
      }

      const now = new Date();
      const trialEndDate = new Date(now);
      trialEndDate.setDate(trialEndDate.getDate() + FREE_TRIAL_DAYS);

      // Update store with trial subscription
      await Store.findByIdAndUpdate(storeId, {
        subscriptionStartDate: now,
        subscriptionEndDate: trialEndDate,
        hasUsedFreeTrial: true,
        currentPlan: "starter",
      });

      return res.status(200).json({
        success: true,
        message: "Free trial activated successfully",
        data: {
          subscriptionStartDate: now,
          subscriptionEndDate: trialEndDate,
          daysRemaining: FREE_TRIAL_DAYS,
          plan: "starter",
        },
      });
    } catch (error) {
      console.error("Error activating free trial:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to activate free trial",
      });
    }
  }

  // Get payment history
  async getPaymentHistory(req, res) {
    try {
      const { storeId } = req.params;

      const payments = await Payment.find({ store: storeId })
        .sort({ createdAt: -1 })
        .populate("user", "name email");

      return res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error) {
      console.error("Error getting payment history:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get payment history",
      });
    }
  }
}

module.exports = new PaymentController();
