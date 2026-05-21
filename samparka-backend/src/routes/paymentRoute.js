const { Router } = require("express");
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = Router();

// Protected routes (require authentication)
router.get("/subscription-status", authMiddleware, paymentController.getSubscriptionStatus);
router.post("/create-order", authMiddleware, paymentController.createOrder);
router.post("/verify", authMiddleware, paymentController.verifyPayment);
router.post("/activate-trial", authMiddleware, paymentController.activateFreeTrial);
router.get("/history/:storeId", authMiddleware, paymentController.getPaymentHistory);

// Webhook route (no auth - Razorpay calls this)
router.post("/webhook", paymentController.webhook);

module.exports = router;
