const mongoose = require("mongoose");
const customerModel = require("../models/customerModel.js");
const storeModel = require("../models/storeModel.js");
const outletModel = require("../models/outletModel.js");
const rewardModel = require("../models/rewardModel.js");
const CustomerOutletPoints = require("../models/customerOutletPointsModel.js");
const L5Redemption = require("../models/l5RedemptionModel.js");
const L5Voucher = require("../models/l5VoucherModel.js");
const L5MonthlyLeaderboard = require("../models/l5MonthlyLeaderboardModel.js");
const L5ThreeMonthWinner = require("../models/l5ThreeMonthWinnerModel.js");
const L5PointsTransaction = require("../models/l5PointsTransactionModel.js");
const notificationController = require("./notificationController.js");
const { updateVisitAnalytics } = require("../services/visitAnalyticsService.js");
const s3 = require("../config/s3Config.js");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { GetObjectCommand } = require("@aws-sdk/client-s3");

/**
 * L5 Loyalty Controller
 * Handles all L5 format loyalty operations
 */
class L5Controller {
  // ==================== POINTS MANAGEMENT ====================

  /**
   * Award points to customer at specific outlet
   * POST /api/l5/points/earn
   */
  async earnPoints(req, res) {
    try {
      console.log('[L5 earnPoints] ========== START ==========');
      console.log('[L5 earnPoints] Request body:', req.body);

      const { customerId, outletId, points, billID, billAmount, remarks } = req.body;

      if (!customerId || !outletId || !points) {
        console.log('[L5 earnPoints] Missing required fields:', { customerId, outletId, points });
        return res.status(400).json({
          success: false,
          message: "Customer ID, Outlet ID, and points are required",
        });
      }

      if (points <= 0) {
        console.log('[L5 earnPoints] Invalid points value:', points);
        return res.status(400).json({
          success: false,
          message: "Points must be a positive number",
        });
      }

      // Get customer and verify store
      console.log('[L5 earnPoints] Fetching customer:', customerId);
      const customer = await customerModel.findById(customerId).populate("store");
      if (!customer) {
        console.log('[L5 earnPoints] Customer not found');
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      console.log('[L5 earnPoints] Customer found:', customer.name);
      const store = customer.store;
      console.log('[L5 earnPoints] Store:', store.name, 'Format:', store.loyaltyCard?.format);
      if (store.loyaltyCard?.format !== "L5") {
        return res.status(400).json({
          success: false,
          message: "This store is not using L5 loyalty format",
        });
      }

      // Verify outlet belongs to store
      const outlet = await outletModel.findById(outletId);
      if (!outlet) {
        return res.status(400).json({
          success: false,
          message: "Outlet not found",
        });
      }

      // Check if outlet belongs to store (compare ObjectIds properly)
      const outletBelongsToStore = store.outlets.some(
        (storeOutletId) => storeOutletId.toString() === outlet._id.toString()
      );

      if (!outletBelongsToStore) {
        return res.status(400).json({
          success: false,
          message: "Invalid outlet for this store",
        });
      }

      // Find or create CustomerOutletPoints record
      console.log('[L5 earnPoints] Finding CustomerOutletPoints for:', {
        customer: customerId,
        store: store._id,
        outlet: outletId,
      });

      let outletPoints = await CustomerOutletPoints.findOne({
        customer: customerId,
        store: store._id,
        outlet: outletId,
      });

      if (!outletPoints) {
        console.log('[L5 earnPoints] Creating new CustomerOutletPoints record');
        outletPoints = new CustomerOutletPoints({
          customer: customerId,
          store: store._id,
          outlet: outletId,
          currentPoints: 0,
          totalPointsEarned: 0,
          totalPointsRedeemed: 0,
        });
      } else {
        console.log('[L5 earnPoints] Found existing CustomerOutletPoints:', {
          currentPoints: outletPoints.currentPoints,
          totalEarned: outletPoints.totalPointsEarned,
        });
      }

      // Double points check
      let effectivePoints = points;
      if (store?.doublePoints && Array.isArray(store.doublePointsDays) && store.doublePointsDays.length > 0) {
        const tz = store.timezone || 'Asia/Kathmandu';
        const dayIndex = new Date(new Date().toLocaleString('en-US', { timeZone: tz })).getDay();
        if (store.doublePointsDays.includes(dayIndex)) {
          effectivePoints = parseFloat((points * 2).toFixed(1));
          console.log(`✅ [L5 earnPoints] Double points: day=${dayIndex}, original=${points}, doubled=${effectivePoints}`);
        }
      }

      // Update points
      const previousPoints = outletPoints.currentPoints;
      outletPoints.currentPoints += effectivePoints;
      outletPoints.totalPointsEarned += effectivePoints;
      outletPoints.lastTransactionDate = new Date();

      console.log('[L5 earnPoints] Updating points:', {
        previous: previousPoints,
        adding: points,
        new: outletPoints.currentPoints,
      });

      await outletPoints.save();
      console.log('[L5 earnPoints] CustomerOutletPoints saved successfully');

      // Create L5 transaction record
      await L5PointsTransaction.create({
        store: store._id,
        customer: customerId,
        outlet: outletId,
        transactionType: "earn",
        points: effectivePoints,
        balanceAfter: outletPoints.currentPoints,
        billID,
        billAmount,
        description: `Earned ${effectivePoints} points at ${outlet.name || outlet.location || "outlet"}`,
        remarks,
        processedBy: req.store?._id,
      });

      // ALSO create regular points history record for compatibility with existing history page
      const pointsHistoryModel = require("../models/pointsHistoryModel");
      await pointsHistoryModel.create({
        points: effectivePoints,
        billID: billID,
        customer: customerId,
        store: store._id,
        remarks: remarks || "",
        outlet: outlet.location || outlet.name || "Unknown Outlet",
      });

      // Update visit analytics with outlet-specific tracking
      try {
        // Use consistent outlet identifier: prefer location, fallback to name
        const outletIdentifier = outlet.location || outlet.name;
        console.log('[L5 earnPoints] Outlet data:', {
          outletId: outlet._id?.toString(),
          location: outlet.location,
          name: outlet.name,
          finalIdentifier: outletIdentifier
        });
        console.log('[L5 earnPoints] Updating visit analytics:', {
          customerId: customerId?.toString(),
          storeId: store._id?.toString(),
          outlet: outletIdentifier,
          points: effectivePoints
        });
        const analyticsResult = await updateVisitAnalytics(
          customerId,
          store._id,
          outletIdentifier,
          effectivePoints
        );
        console.log('[L5 earnPoints] Visit analytics updated:', analyticsResult ? 'SUCCESS' : 'SKIPPED');
        if (analyticsResult) {
          console.log('[L5 earnPoints] Analytics visitCount:', analyticsResult.visitCount);
          console.log('[L5 earnPoints] Analytics visitsByOutlet:', analyticsResult.visitsByOutlet);
        }
      } catch (analyticsError) {
        console.error('[L5 earnPoints] Analytics update failed:', analyticsError.message);
        // Don't fail the main operation if analytics update fails
      }

      // Update customer's L5 aggregate data
      await l5ControllerInstance.updateCustomerL5Data(customerId, store._id);

      // Update customer's main points field by ADDING the earned points
      // Using $inc instead of overwriting to preserve any untracked points (like registration bonus)
      const allOutletPoints = await CustomerOutletPoints.find({
        customer: customerId,
        store: store._id,
      });
      const totalL5Points = allOutletPoints.reduce((sum, op) => sum + op.currentPoints, 0);

      console.log('[L5 earnPoints] Total L5 points across all outlets:', totalL5Points);
      console.log('[L5 earnPoints] All outlet points:', allOutletPoints.map(op => ({
        outlet: op.outlet,
        currentPoints: op.currentPoints,
      })));

      // Use $inc to add points instead of overwriting - preserves registration bonus points
      await customerModel.findByIdAndUpdate(customerId, {
        $inc: { points: effectivePoints },
        pointChangeDate: new Date(),
      });

      // Get updated customer points for response
      const updatedCustomer = await customerModel.findById(customerId);
      console.log('[L5 earnPoints] Customer main points field updated to:', updatedCustomer.points);

      // SEND PUSH NOTIFICATION
      try {
        const mailSMSModel = require("../models/mailSMSModel");
        
        const getMessage = await mailSMSModel.findOne({ store: store._id });
        
        if (
          getMessage &&
          getMessage.notificationAfterPointEarned &&
          getMessage.notificationAfterPointEarned.body
        ) {
          let title = getMessage.notificationAfterPointEarned.title;
          let body = getMessage.notificationAfterPointEarned.body;
          
          console.log('[L5 earnPoints] Sending push notification:', { title, body });
          
          const notificationResponse = await notificationController.singleNotification({
            title,
            body,
            userId: updatedCustomer._id,
            points: effectivePoints,
            storeName: store.name,
            storeURL: store.url,
            customerName: updatedCustomer.name,
            customerEmail: updatedCustomer.email,
            customerPhone: updatedCustomer.phone,
            storeId: store._id,
          });
          
          console.log('[L5 earnPoints] Notification response:', notificationResponse);
        } else {
          console.log('[L5 earnPoints] No notification configuration found');
        }
      } catch (notificationError) {
        console.error('[L5 earnPoints] Notification error:', notificationError);
        // Don't fail the main operation if notification fails
      }

      console.log('[L5 earnPoints] ========== SUCCESS ==========');

      return res.json({
        success: true,
        message: `${points} points awarded successfully`,
        data: {
          outletPoints: outletPoints.currentPoints,
          totalEarned: outletPoints.totalPointsEarned,
          outletName: outlet.name,
          totalL5Points: updatedCustomer.points,
        },
      });
    } catch (error) {
      console.error("L5 earnPoints error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get customer's outlet-wise point breakdown
   * GET /api/l5/points/:storeId
   */
  async getPointsBalance(req, res) {
    try {
      console.log('[L5 getPointsBalance] ========== START ==========');
      const { storeId } = req.params;
      const customerId = req.user._id;

      console.log('[L5 getPointsBalance] Customer ID:', customerId);
      console.log('[L5 getPointsBalance] Store ID:', storeId);

      const customer = await customerModel.findById(customerId).populate("store");
      if (!customer) {
        console.log('[L5 getPointsBalance] Customer not found');
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      const store = customer.store;
      console.log('[L5 getPointsBalance] Store:', store.name, 'Format:', store.loyaltyCard?.format);

      if (store.loyaltyCard?.format !== "L5") {
        console.log('[L5 getPointsBalance] Store is not using L5 format');
        return res.status(400).json({
          success: false,
          message: "This store is not using L5 loyalty format",
        });
      }

      // Get all outlet points for this customer
      console.log('[L5 getPointsBalance] Querying CustomerOutletPoints with:', {
        customer: customerId,
        store: store._id,
      });

      const outletPoints = await CustomerOutletPoints.find({
        customer: customerId,
        store: store._id,
      }).populate("outlet", "name location phone");

      console.log('[L5 getPointsBalance] Found outlet points records:', outletPoints.length);
      console.log('[L5 getPointsBalance] Outlet points details:', outletPoints.map(op => ({
        outlet: op.outlet?._id,
        outletName: op.outlet?.name,
        outletLocation: op.outlet?.location,
        currentPoints: op.currentPoints,
      })));

      // Calculate totals from outlet points
      const outletTotalPoints = outletPoints.reduce((sum, op) => sum + op.currentPoints, 0);
      const totalEarned = outletPoints.reduce((sum, op) => sum + op.totalPointsEarned, 0);
      const totalRedeemed = outletPoints.reduce((sum, op) => sum + op.totalPointsRedeemed, 0);

      // For L5, customer.points might include registration bonus (+1) that's not in outlet tracking
      // Use the higher value between customer.points and outlet total to ensure we don't miss the +1
      const totalPoints = Math.max(customer.points || 0, outletTotalPoints);
      
      console.log('[L5 getPointsBalance] Customer.points:', customer.points);
      console.log('[L5 getPointsBalance] Outlet total points:', outletTotalPoints);
      console.log('[L5 getPointsBalance] Final total points:', totalPoints);

      // Get available redemption thresholds from Reward collection
      const l5Config = store.loyaltyCard?.l5Config || {};
      
      // Query L5 rewards from Reward collection
      const l5Rewards = await rewardModel.find({ 
        store: store._id, 
        type: "l5" 
      }).sort({ threshold: 1 });
      
      const thresholds = l5Rewards.map(r => r.threshold).sort((a, b) => a - b);
      
      // Format rewards for response (compatible with old structure)
      const rewards = [];
      for (const reward of l5Rewards) {
        const rewardObj = {
          _id: reward._id,
          threshold: reward.threshold,
          rewardType: reward.rewardType,
          rewardName: reward.name,
          discountPercentage: reward.discountPercentage,
          image: reward.image,
          validity: reward.validity,
          evergreen: reward.evergreen,
          description: reward.description,
        };
        
        // Generate signed URL for image
        if (rewardObj.image && !rewardObj.image.startsWith("https://")) {
          try {
            const getObjectParams = {
              Bucket: "samparka",
              Key: rewardObj.image,
            };
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
            rewardObj.image = url;
          } catch (err) {
            console.error("[L5 getPointsBalance] Error generating signed URL for reward image:", err);
          }
        }
        
        rewards.push(rewardObj);
      }

      // Format outlet breakdown with available rewards
      const breakdown = outletPoints.map((op) => {
        const availableRewards = thresholds.filter((t) => op.currentPoints >= t);
        return {
          outletId: op.outlet._id,
          outletName: op.outlet.name || op.outlet.location, // Fallback to location if no name
          outletLocation: op.outlet.location,
          currentPoints: op.currentPoints,
          totalEarned: op.totalPointsEarned,
          totalRedeemed: op.totalPointsRedeemed,
          lastTransaction: op.lastTransactionDate,
          availableRewards: availableRewards,
          nextThreshold: thresholds.find((t) => t > op.currentPoints) || null,
          pointsToNextThreshold: thresholds.find((t) => t > op.currentPoints)
            ? thresholds.find((t) => t > op.currentPoints) - op.currentPoints
            : 0,
        };
      });

      console.log('[L5 getPointsBalance] Response data:', {
        totalPoints,
        totalEarned,
        totalRedeemed,
        outletsCount: breakdown.length,
        outlets: breakdown,
      });
      console.log('[L5 getPointsBalance] ========== SUCCESS ==========');

      return res.json({
        success: true,
        data: {
          customerId,
          customerName: customer.name,
          totalPoints,
          totalEarned,
          totalRedeemed,
          l5Data: customer.l5Data,
          outlets: breakdown,
          thresholds,
          rewards,
        },
      });
    } catch (error) {
      console.error("L5 getPointsBalance error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get customer's transaction history
   * GET /api/l5/points/:storeId/transactions
   */
  async getTransactions(req, res) {
    try {
      const { storeId } = req.params;
      const customerId = req.user._id;
      const { outletId, page = 1, limit = 20, type } = req.query;

      const customer = await customerModel.findById(customerId);
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      const query = {
        customer: customerId,
        store: customer.store,
      };

      if (outletId) {
        query.outlet = outletId;
      }

      if (type) {
        query.transactionType = type;
      }

      const skip = (page - 1) * limit;

      const transactions = await L5PointsTransaction.find(query)
        .populate("outlet", "name location")
        .populate("redemption", "rewardType discountPercentage rewardName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await L5PointsTransaction.countDocuments(query);

      return res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalRecords: total,
            hasMore: skip + transactions.length < total,
          },
        },
      });
    } catch (error) {
      console.error("L5 getTransactions error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==================== REDEMPTION MANAGEMENT ====================

  /**
   * Redeem discount reward at outlet
   * POST /api/l5/redemptions/:storeId
   */
  async redeemDiscount(req, res) {
    try {
      const { storeId } = req.params;
      const customerId = req.user._id;
      const { outletId, threshold: pointsThreshold } = req.body;

      if (!outletId || !pointsThreshold) {
        return res.status(400).json({
          success: false,
          message: "Outlet ID and points threshold are required",
        });
      }

      const customer = await customerModel.findById(customerId).populate("store");
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      const store = customer.store;
      if (store.loyaltyCard?.format !== "L5") {
        return res.status(400).json({
          success: false,
          message: "This store is not using L5 loyalty format",
        });
      }

      const l5Config = store.loyaltyCard?.l5Config || {};

      // Convert threshold to number for comparison
      const numericThreshold = Number(pointsThreshold);

      // Query L5 rewards from Reward collection
      const l5Rewards = await rewardModel.find({ 
        store: store._id, 
        type: "l5" 
      }).sort({ threshold: 1 });
      
      const thresholds = l5Rewards.map(r => r.threshold).sort((a, b) => a - b);

      console.log('[redeemDiscount] Threshold validation:');
      console.log('  - pointsThreshold:', pointsThreshold, typeof pointsThreshold);
      console.log('  - numericThreshold:', numericThreshold);
      console.log('  - configured thresholds:', thresholds);
      console.log('  - configured rewards from Reward collection:', l5Rewards.map(r => ({ threshold: r.threshold, name: r.name })));

      // Get reward config for this threshold from Reward collection
      const rewardConfig = l5Rewards.find((r) => Number(r.threshold) === numericThreshold);

      if (!rewardConfig) {
        console.log('[redeemDiscount] No reward config found for threshold:', numericThreshold);
        return res.status(400).json({
          success: false,
          message: l5Rewards.length > 0
            ? `No reward configured for ${numericThreshold} points. Available rewards: ${l5Rewards.map(r => r.threshold).join(', ')}`
            : `No rewards configured yet. Please ask the store to set up rewards.`,
        });
      }

      console.log('[redeemDiscount] Found reward config:', { 
        _id: rewardConfig._id,
        name: rewardConfig.name,
        threshold: rewardConfig.threshold,
        rewardType: rewardConfig.rewardType,
        discountPercentage: rewardConfig.discountPercentage,
      });

      // Check customer has sufficient points at this outlet
      console.log('[redeemDiscount] Checking outlet points for outletId:', outletId);
      const outletPoints = await CustomerOutletPoints.findOne({
        customer: customerId,
        store: store._id,
        outlet: outletId,
      });

      console.log('[redeemDiscount] Outlet points found:', {
        exists: !!outletPoints,
        currentPoints: outletPoints?.currentPoints,
        requiredPoints: numericThreshold
      });

      if (!outletPoints || outletPoints.currentPoints < numericThreshold) {
        return res.status(400).json({
          success: false,
          message: `Insufficient points. You have ${outletPoints?.currentPoints || 0} points, need ${numericThreshold}`,
        });
      }

      const outlet = await outletModel.findById(outletId);
      console.log('[redeemDiscount] Outlet found:', outlet?.location);

      // Deduct points
      console.log('[redeemDiscount] Deducting points from outlet points...');
      outletPoints.currentPoints -= numericThreshold;
      outletPoints.totalPointsRedeemed += numericThreshold;
      outletPoints.lastTransactionDate = new Date();
      await outletPoints.save();
      console.log('[redeemDiscount] Outlet points saved. New balance:', outletPoints.currentPoints);

      // Create redemption record
      // Use individual reward validity if set, otherwise fall back to global discount validity
      const expiryDate = new Date();
      let validityDays;
      
      if (rewardConfig.validity && rewardConfig.validity !== "instant") {
        // Use the individual reward's validity (in days)
        validityDays = parseInt(rewardConfig.validity) || l5Config.discountValidityDays || 30;
      } else if (rewardConfig.validity === "instant") {
        // Instant validity means 0 days (must be used immediately/same day)
        validityDays = 0;
      } else {
        // Fall back to global config
        validityDays = l5Config.discountValidityDays || 30;
      }
      
      expiryDate.setDate(expiryDate.getDate() + validityDays);
      console.log('[redeemDiscount] Reward validity:', rewardConfig.validity, '-> Expiry days:', validityDays);

      console.log('[redeemDiscount] Creating redemption record...');
      const redemption = await L5Redemption.create({
        store: store._id,
        customer: customerId,
        outlet: outletId,
        pointsThreshold: numericThreshold,
        pointsDeducted: numericThreshold,
        rewardType: rewardConfig.rewardType,
        discountPercentage: rewardConfig.discountPercentage,
        rewardName: rewardConfig.name,
        status: "active",
        expiryDate,
      });
      console.log('[redeemDiscount] Redemption created:', redemption._id);

      // Create transaction record
      console.log('[redeemDiscount] Creating transaction record...');
      await L5PointsTransaction.create({
        store: store._id,
        customer: customerId,
        outlet: outletId,
        transactionType: "redeem",
        points: -numericThreshold,
        balanceAfter: outletPoints.currentPoints,
        redemption: redemption._id,
        description: `Redeemed ${numericThreshold} points for ${rewardConfig.name || rewardConfig.discountPercentage + "% discount"}`,
      });
      console.log('[redeemDiscount] Transaction created');

      // Update customer's L5 aggregate data
      console.log('[redeemDiscount] Updating customer L5 data...');
      await l5ControllerInstance.updateCustomerL5Data(customerId, store._id);
      console.log('[redeemDiscount] Customer L5 data updated');

      // Update customer's main points field
      const allOutletPoints = await CustomerOutletPoints.find({
        customer: customerId,
        store: store._id,
      });
      const totalL5Points = allOutletPoints.reduce((sum, op) => sum + op.currentPoints, 0);
      await customerModel.findByIdAndUpdate(customerId, {
        points: totalL5Points,
        pointChangeDate: new Date(),
      });
      console.log('[redeemDiscount] Customer total points updated to:', totalL5Points);

      return res.json({
        success: true,
        message: "Reward redeemed successfully",
        data: {
          redemptionId: redemption._id,
          rewardType: rewardConfig.rewardType,
          discountPercentage: rewardConfig.discountPercentage,
          rewardName: rewardConfig.name,
          expiryDate,
          remainingPoints: outletPoints.currentPoints,
          outletName: outlet?.name || outlet?.location,
        },
      });
    } catch (error) {
      console.error("L5 redeemDiscount error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get customer's active discounts/redemptions
   * GET /api/l5/redemptions/:storeId/active
   */
  async getActiveRedemptions(req, res) {
    try {
      const { storeId } = req.params;
      const customerId = req.user._id;

      const customer = await customerModel.findById(customerId);
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      const activeRedemptions = await L5Redemption.find({
        customer: customerId,
        store: customer.store,
        status: "active",
        expiryDate: { $gt: new Date() },
      })
        .populate("outlet", "name location")
        .sort({ expiryDate: 1 });

      // Calculate total stacked discount
      const totalDiscount = activeRedemptions
        .filter((r) => r.rewardType === "discount")
        .reduce((sum, r) => sum + (r.discountPercentage || 0), 0);

      return res.json({
        success: true,
        data: {
          activeRedemptions,
          count: activeRedemptions.length,
          totalStackedDiscount: totalDiscount,
        },
      });
    } catch (error) {
      console.error("L5 getActiveRedemptions error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get customer's redemption history
   * GET /api/l5/redemptions/:storeId/history
   */
  async getRedemptionHistory(req, res) {
    try {
      const { storeId } = req.params;
      const customerId = req.user._id;
      const { page = 1, limit = 20, status } = req.query;

      const customer = await customerModel.findById(customerId);
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      const query = {
        customer: customerId,
        store: customer.store,
      };

      if (status) {
        query.status = status;
      }

      const skip = (page - 1) * limit;

      const redemptions = await L5Redemption.find(query)
        .populate("outlet", "name location")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await L5Redemption.countDocuments(query);

      return res.json({
        success: true,
        data: {
          redemptions,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalRecords: total,
          },
        },
      });
    } catch (error) {
      console.error("L5 getRedemptionHistory error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Use/apply a redemption (mark as used)
   * POST /api/l5/redemptions/:storeId/:redemptionId/use
   */
  async useRedemption(req, res) {
    try {
      const { storeId, redemptionId } = req.params;
      const { billID, billAmount, outletId } = req.body;

      const redemption = await L5Redemption.findById(redemptionId);
      if (!redemption) {
        return res.status(404).json({ success: false, message: "Redemption not found" });
      }

      if (redemption.status !== "active") {
        return res.status(400).json({
          success: false,
          message: `Redemption is ${redemption.status}`,
        });
      }

      if (new Date() > redemption.expiryDate) {
        redemption.status = "expired";
        await redemption.save();
        return res.status(400).json({
          success: false,
          message: "Redemption has expired",
        });
      }

      redemption.status = "used";
      redemption.usageDate = new Date();
      redemption.usageOutlet = outletId || redemption.outlet;
      redemption.billID = billID;
      redemption.billAmount = billAmount;
      await redemption.save();

      // Update customer's L5 data
      await l5ControllerInstance.updateCustomerL5Data(redemption.customer, redemption.store);

      return res.json({
        success: true,
        message: "Redemption applied successfully",
        data: redemption,
      });
    } catch (error) {
      console.error("L5 useRedemption error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==================== VOUCHER MANAGEMENT ====================

  /**
   * Get customer's vouchers
   * GET /api/l5/vouchers/:storeId
   */
  async getVouchers(req, res) {
    try {
      const { storeId } = req.params;
      const customerId = req.user._id;
      const { status } = req.query;

      const customer = await customerModel.findById(customerId);
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      const query = {
        customer: customerId,
        store: customer.store,
      };

      if (status) {
        query.status = status;
      }

      const vouchers = await L5Voucher.find(query)
        .populate("redemption")
        .sort({ createdAt: -1 });

      // Group by status
      const grouped = {
        unused: vouchers.filter((v) => v.status === "unused"),
        used: vouchers.filter((v) => v.status === "used"),
        expired: vouchers.filter((v) => v.status === "expired"),
      };

      const totalUnusedValue = grouped.unused.reduce((sum, v) => sum + v.voucherAmount, 0);

      return res.json({
        success: true,
        data: {
          vouchers,
          grouped,
          totalUnusedValue,
          unusedCount: grouped.unused.length,
        },
      });
    } catch (error) {
      console.error("L5 getVouchers error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Use a voucher
   * POST /api/l5/vouchers/:storeId/:voucherId/use
   */
  async useVoucher(req, res) {
    try {
      const { storeId, voucherId } = req.params;
      const { voucherCode, billID, outletId } = req.body;

      const voucher = await L5Voucher.findOne({ voucherCode });
      if (!voucher) {
        return res.status(404).json({ success: false, message: "Voucher not found" });
      }

      if (voucher.status !== "unused") {
        return res.status(400).json({
          success: false,
          message: `Voucher is already ${voucher.status}`,
        });
      }

      if (new Date() > voucher.expiryDate) {
        voucher.status = "expired";
        await voucher.save();
        return res.status(400).json({
          success: false,
          message: "Voucher has expired",
        });
      }

      voucher.status = "used";
      voucher.usageDate = new Date();
      voucher.usageOutlet = outletId;
      voucher.billID = billID;
      await voucher.save();

      return res.json({
        success: true,
        message: `Voucher worth Rs. ${voucher.voucherAmount} applied successfully`,
        data: voucher,
      });
    } catch (error) {
      console.error("L5 useVoucher error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==================== LEADERBOARD MANAGEMENT ====================

  /**
   * Get current month's leaderboard (REAL-TIME)
   * GET /api/l5/leaderboard/:storeId/current
   * 
   * OPTIMIZATIONS:
   * - Uses indexed queries (store + points) for fast sorting and counting
   * - Parallel fetching (Promise.all) for customer data when authenticated
   * - Limits redemption aggregation to top 10 instead of all records
   * - Uses .lean() for all queries (returns plain JS objects, not Mongoose docs)
   * - Only calculates user rank for authenticated requests
   * - Reuses already-fetched user data instead of duplicate queries
   */
  async getCurrentLeaderboard(req, res) {
    try {
      const { storeId } = req.params;
      const { limit = 50 } = req.query;

      const store = await storeModel.findById(storeId);
      if (!store || store.loyaltyCard?.format !== "L5") {
        return res.status(400).json({
          success: false,
          message: "Invalid store or not using L5 format",
        });
      }

      const { year, month, periodStart, periodEnd } = L5MonthlyLeaderboard.getCurrentMonthPeriod();
      const l5Config = store.loyaltyCard?.l5Config || {};
      const minPoints = l5Config.leaderboardMinPoints || 3000;
      const coffeeHeroMinPoints = l5Config.coffeeHeroMinPoints || 5000;

      // Fetch customers with points and build leaderboard from customer.points field
      // This matches what's shown in admin customers section
      // Optimized: Fetch both top customers AND current user's data in one query when authenticated
      let customers = [];
      let currentUserDoc = null;
      
      if (req.user) {
        // For authenticated users: fetch top N and user's data efficiently
        const [topCustomers, userDoc] = await Promise.all([
          customerModel
            .find({ 
              store: storeId,
              points: { $gt: 0 }
            })
            .select('name email phone points')
            .sort({ points: -1 })
            .limit(parseInt(limit))
            .lean(),
          customerModel
            .findById(req.user._id)
            .select('name email phone points')
            .lean()
        ]);
        customers = topCustomers;
        currentUserDoc = userDoc;
      } else {
        // For non-authenticated (admin view): just fetch top customers
        customers = await customerModel
          .find({ 
            store: storeId,
            points: { $gt: 0 }
          })
          .select('name email phone points')
          .sort({ points: -1 })
          .limit(parseInt(limit))
          .lean();
      }

      // Real-time aggregation of LIFETIME points redeemed (for Coffee Hero)
      // Optimized: Only fetch top redeemers since we only need Coffee Hero candidate
      const redeemedPoints = await L5PointsTransaction.aggregate([
        {
          $match: {
            store: new mongoose.Types.ObjectId(storeId),
            transactionType: "redeem",
          },
        },
        {
          $group: {
            _id: "$customer",
            totalPointsRedeemed: { $sum: { $abs: "$points" } },
          },
        },
        {
          $sort: { totalPointsRedeemed: -1 },
        },
        {
          $limit: 10, // Only need top 10 to find Coffee Hero and show redeemed points
        },
      ]);

      // Create redeemed points map
      const redeemedMap = new Map();
      redeemedPoints.forEach((r) => {
        redeemedMap.set(r._id.toString(), r.totalPointsRedeemed);
      });

      // Find Coffee Hero (top redeemer with minimum required points)
      const coffeeHeroEntry = redeemedPoints.find(
        (r) => r.totalPointsRedeemed >= coffeeHeroMinPoints
      );

      // Build leaderboard from customers array
      const leaderboard = customers
        .map((customer, index) => {
          const totalPointsRedeemed = redeemedMap.get(customer._id.toString()) || 0;
          const isQualified = customer.points >= minPoints;
          const isCoffeeHero = coffeeHeroEntry && coffeeHeroEntry._id.toString() === customer._id.toString();

          return {
            _id: customer._id,
            customer: {
              _id: customer._id,
              name: customer.name,
              email: customer.email,
              phone: customer.phone
            },
            totalPointsEarned: customer.points,
            totalPointsRedeemed,
            rank: index + 1,
            isQualified,
            isMonthlyWinner: isQualified && index < 10,
            isCoffeeHero,
          };
        });

      // Find Coffee Hero with customer details
      let coffeeHero = null;
      if (coffeeHeroEntry) {
        // Try to find in existing customers array first
        let heroCustomer = customers.find(c => c._id.toString() === coffeeHeroEntry._id.toString());
        
        // If not in top customers, fetch separately
        if (!heroCustomer) {
          heroCustomer = await customerModel.findById(coffeeHeroEntry._id).select('name email phone').lean();
        }
        
        if (heroCustomer && heroCustomer.name) {
          coffeeHero = {
            customer: {
              _id: heroCustomer._id,
              name: heroCustomer.name,
              email: heroCustomer.email,
              phone: heroCustomer.phone
            },
            totalPointsRedeemed: coffeeHeroEntry.totalPointsRedeemed,
            isCoffeeHero: true,
          };
        }
      }

      // Get prize configuration
      const prizes = l5Config.leaderboardPrizes || [];

      // Calculate current user's rank if authenticated (for customer view)
      let currentUserRank = null;
      let currentUserData = null;
      if (req.user && currentUserDoc) {
        // Check if user is already in the leaderboard
        const userInLeaderboard = leaderboard.find(entry => entry._id.toString() === req.user._id.toString());
        
        if (userInLeaderboard) {
          currentUserRank = userInLeaderboard.rank;
          currentUserData = userInLeaderboard;
        } else if (currentUserDoc.points > 0) {
          // User not in top results - calculate rank efficiently using indexed query
          const rank = await customerModel.countDocuments({
            store: storeId,
            points: { $gt: currentUserDoc.points }
          }) + 1;
          
          currentUserRank = rank;
          currentUserData = {
            _id: currentUserDoc._id,
            customer: {
              _id: currentUserDoc._id,
              name: currentUserDoc.name
            },
            totalPointsEarned: currentUserDoc.points,
            rank: rank,
            isQualified: currentUserDoc.points >= minPoints,
            isMonthlyWinner: false,
            isCoffeeHero: false,
          };
        }
      }

      return res.json({
        success: true,
        data: {
          year,
          month,
          periodStart,
          periodEnd,
          minQualifyPoints: minPoints,
          leaderboard,
          coffeeHero,
          prizes,
          totalParticipants: leaderboard.length,
          qualifiedCount: leaderboard.filter((l) => l.isQualified).length,
          currentUserRank,
          currentUserData,
        },
      });
    } catch (error) {
      console.error("L5 getCurrentLeaderboard error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get historical leaderboards
   * GET /api/l5/leaderboard/history/:storeId
   */
  async getLeaderboardHistory(req, res) {
    try {
      const { storeId } = req.params;
      const { year, month, limit = 50 } = req.query;

      const store = await storeModel.findById(storeId);
      if (!store || store.loyaltyCard?.format !== "L5") {
        return res.status(400).json({
          success: false,
          message: "Invalid store or not using L5 format",
        });
      }

      const query = { store: storeId };
      if (year) query.year = parseInt(year);
      if (month) query.month = parseInt(month);

      const leaderboard = await L5MonthlyLeaderboard.find(query)
        .populate("customer", "name email phone")
        .sort({ year: -1, month: -1, rank: 1 })
        .limit(parseInt(limit));

      return res.json({
        success: true,
        data: { leaderboard },
      });
    } catch (error) {
      console.error("L5 getLeaderboardHistory error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get monthly winners for admin review
   * GET /api/l5/leaderboard/winners/:storeId
   */
  async getMonthlyWinners(req, res) {
    try {
      const { storeId } = req.params;
      const { year, month } = req.query;

      const store = await storeModel.findById(storeId);
      if (!store || store.loyaltyCard?.format !== "L5") {
        return res.status(400).json({
          success: false,
          message: "Invalid store or not using L5 format",
        });
      }

      const targetYear = year ? parseInt(year) : new Date().getFullYear();
      const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;

      // Get top 10 winners
      const winners = await L5MonthlyLeaderboard.find({
        store: storeId,
        year: targetYear,
        month: targetMonth,
        isQualified: true,
        rank: { $lte: 10 },
      })
        .populate("customer", "name email phone")
        .sort({ rank: 1 });

      // Get Coffee Hero
      const coffeeHero = await L5MonthlyLeaderboard.findOne({
        store: storeId,
        year: targetYear,
        month: targetMonth,
        isCoffeeHero: true,
      }).populate("customer", "name email phone");

      // Get 3-month winners
      const threeMonthWinners = await L5ThreeMonthWinner.find({
        store: storeId,
        awardStatus: { $in: ["pending", "awarded"] },
      }).populate("customer", "name email phone");

      const l5Config = store.loyaltyCard?.l5Config || {};

      return res.json({
        success: true,
        data: {
          year: targetYear,
          month: targetMonth,
          winners,
          coffeeHero,
          threeMonthWinners,
          prizes: l5Config.leaderboardPrizes || [],
        },
      });
    } catch (error) {
      console.error("L5 getMonthlyWinners error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Award prizes to monthly winners (Admin action)
   * POST /api/l5/leaderboard/:storeId/award
   */
  async awardPrizes(req, res) {
    try {
      const { storeId } = req.params;
      const { year, month } = req.body;

      const store = await storeModel.findById(storeId);
      if (!store || store.loyaltyCard?.format !== "L5") {
        return res.status(400).json({
          success: false,
          message: "Invalid store or not using L5 format",
        });
      }

      const l5Config = store.loyaltyCard?.l5Config || {};
      const prizes = l5Config.leaderboardPrizes || [];

      // Get winners
      const winners = await L5MonthlyLeaderboard.find({
        store: storeId,
        year,
        month,
        isQualified: true,
        rank: { $lte: 10 },
        prizeAwarded: false,
      });

      const awardedPrizes = [];

      for (const winner of winners) {
        // Find prize config for this rank
        const prizeConfig = prizes.find((p) => {
          if (p.rankEnd) {
            return winner.rank >= p.rank && winner.rank <= p.rankEnd;
          }
          return p.rank === winner.rank;
        });

        if (!prizeConfig) continue;

        // Create redemption for prize
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        const redemption = await L5Redemption.create({
          store: storeId,
          customer: winner.customer,
          outlet: store.outlets[0], // Default to first outlet
          pointsThreshold: 0,
          pointsDeducted: 0,
          rewardType: "voucher",
          rewardName: prizeConfig.prizeDescription || `Leaderboard Prize - Rank ${winner.rank}`,
          status: "active",
          expiryDate,
          isLeaderboardPrize: true,
          leaderboardMonth: month,
          leaderboardYear: year,
          leaderboardRank: winner.rank,
        });

        // Create split vouchers if applicable
        if (prizeConfig.prizeType === "cash_voucher" && prizeConfig.splitCount > 1) {
          for (let i = 0; i < prizeConfig.splitCount; i++) {
            await L5Voucher.create({
              store: storeId,
              customer: winner.customer,
              redemption: redemption._id,
              totalAmount: prizeConfig.totalAmount,
              voucherAmount: prizeConfig.splitAmount,
              voucherCode: L5Voucher.generateVoucherCode("HJ"),
              voucherType: "cash",
              expiryDate,
              leaderboardMonth: month,
              leaderboardYear: year,
              leaderboardRank: winner.rank,
            });
          }
        }

        // Mark as awarded
        winner.prizeAwarded = true;
        winner.prizeAwardedDate = new Date();
        winner.prizeAwardedBy = req.store?._id;
        await winner.save();

        awardedPrizes.push({
          rank: winner.rank,
          customerId: winner.customer,
          prize: prizeConfig.prizeDescription,
        });
      }

      return res.json({
        success: true,
        message: `Prizes awarded to ${awardedPrizes.length} winners`,
        data: { awardedPrizes },
      });
    } catch (error) {
      console.error("L5 awardPrizes error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==================== 3-MONTH WINNER ====================

  /**
   * Get 3-month winners
   * GET /api/l5/three-month-winners/:storeId
   */
  async getThreeMonthWinners(req, res) {
    try {
      const { storeId } = req.params;
      const { status } = req.query;

      const query = { store: storeId };
      if (status) {
        query.awardStatus = status;
      }

      const winners = await L5ThreeMonthWinner.find(query)
        .populate("customer", "name email phone")
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        data: { winners },
      });
    } catch (error) {
      console.error("L5 getThreeMonthWinners error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Award 3-month winner prize (Admin action)
   * POST /api/l5/three-month-winners/:storeId/:winnerId/award
   */
  async awardThreeMonthPrize(req, res) {
    try {
      const { storeId, winnerId } = req.params;

      const winner = await L5ThreeMonthWinner.findById(winnerId);
      if (!winner) {
        return res.status(404).json({ success: false, message: "Winner not found" });
      }

      if (winner.awardStatus !== "pending") {
        return res.status(400).json({
          success: false,
          message: `Award is already ${winner.awardStatus}`,
        });
      }

      // Set discount validity period (next month)
      const now = new Date();
      const discountValidFrom = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const discountValidUntil = new Date(now.getFullYear(), now.getMonth() + 2, 0);

      winner.awardStatus = "awarded";
      winner.awardedDate = now;
      winner.awardedBy = req.store?._id;
      winner.discountValidFrom = discountValidFrom;
      winner.discountValidUntil = discountValidUntil;
      winner.expiryDate = discountValidUntil;
      await winner.save();

      return res.json({
        success: true,
        message: "3-month winner prize awarded successfully",
        data: winner,
      });
    } catch (error) {
      console.error("L5 awardThreeMonthPrize error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==================== ADMIN CONFIGURATION ====================

  /**
   * Get L5 configuration for a store
   * GET /api/l5/config/:storeId
   */
  async getConfig(req, res) {
    try {
      console.log('=== [L5 getConfig] START ===');
      const { storeId } = req.params;
      console.log('[L5 getConfig] Store ID:', storeId);

      const store = await storeModel.findById(storeId);
      if (!store) {
        console.log('[L5 getConfig] Store not found!');
        return res.status(404).json({ success: false, message: "Store not found" });
      }

      console.log('[L5 getConfig] Store found:', store.name);

      // Get base L5 config from store (without rewards)
      const baseL5Config = store.loyaltyCard?.l5Config ? JSON.parse(JSON.stringify(store.loyaltyCard.l5Config)) : {};
      
      // Query L5 rewards from Reward collection
      const l5Rewards = await rewardModel.find({ 
        store: store._id, 
        type: "l5" 
      }).sort({ threshold: 1 });
      
      console.log('[L5 getConfig] L5 Rewards from collection:', l5Rewards.length);
      
      // Format rewards for response (compatible with old structure) and generate signed URLs
      const rewards = [];
      for (const reward of l5Rewards) {
        const rewardObj = {
          _id: reward._id,
          threshold: reward.threshold,
          rewardType: reward.rewardType,
          rewardName: reward.name,
          discountPercentage: reward.discountPercentage,
          image: reward.image,
          validity: reward.validity,
          evergreen: reward.evergreen,
          description: reward.description,
        };
        
        console.log('[L5 getConfig] Processing reward:', rewardObj.rewardName, 'Image:', rewardObj.image);
        
        // Generate signed URL for image
        if (rewardObj.image && !rewardObj.image.startsWith("https://")) {
          try {
            const getObjectParams = {
              Bucket: "samparka",
              Key: rewardObj.image,
            };
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
            rewardObj.image = url;
            console.log('[L5 getConfig] Generated signed URL for:', rewardObj.rewardName);
          } catch (err) {
            console.error("[L5 getConfig] Error generating signed URL for L5 reward image:", err);
          }
        }
        
        rewards.push(rewardObj);
      }
      
      // Build l5Config with rewards from Reward collection
      const l5Config = {
        ...baseL5Config,
        rewards: rewards,
        redemptionThresholds: l5Rewards.map(r => r.threshold).sort((a, b) => a - b),
      };

      console.log('[L5 getConfig] Final rewards count:', rewards.length);

      const responseData = {
        success: true,
        data: {
          format: store.loyaltyCard?.format,
          l5Config: l5Config,
        },
      };

      console.log('[L5 getConfig] Sending response with', l5Config.rewards?.length, 'rewards');
      return res.json(responseData);
    } catch (error) {
      console.error("L5 getConfig error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Update L5 configuration for a store
   * PUT /api/l5/config/:storeId
   */
  async updateConfig(req, res) {
    try {
      const { storeId } = req.params;
      const { l5Config } = req.body;

      const store = await storeModel.findById(storeId);
      if (!store) {
        return res.status(404).json({ success: false, message: "Store not found" });
      }

      // Update L5 config
      store.loyaltyCard.l5Config = {
        ...store.loyaltyCard.l5Config,
        ...l5Config,
      };
      await store.save();

      return res.json({
        success: true,
        message: "L5 configuration updated successfully",
        data: { l5Config: store.loyaltyCard.l5Config },
      });
    } catch (error) {
      console.error("L5 updateConfig error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Enable L5 format for a store
   * POST /api/l5/enable/:storeId
   */
  async enableL5Format(req, res) {
    try {
      const { storeId } = req.params;
      const { l5Config } = req.body;

      const store = await storeModel.findById(storeId);
      if (!store) {
        return res.status(404).json({ success: false, message: "Store not found" });
      }

      // Set format to L5
      store.loyaltyCard.format = "L5";

      // Default L5 rewards to create in Reward collection
      const defaultRewards = [
        { threshold: 775, rewardType: "physical", name: "Free Americano (S) or Espresso" },
        { threshold: 1500, rewardType: "discount", discountPercentage: 5, name: "5% Off F&B" },
        { threshold: 2500, rewardType: "discount", discountPercentage: 7, name: "7% Off F&B" },
        { threshold: 5000, rewardType: "discount", discountPercentage: 10, name: "10% Off F&B" },
        { threshold: 8000, rewardType: "discount", discountPercentage: 15, name: "15% Off F&B" },
        { threshold: 10000, rewardType: "discount", discountPercentage: 20, name: "20% Off F&B" },
        { threshold: 50000, rewardType: "physical", name: "Pokhara Tour: 2 Nights / 3 Days for 2 People" },
      ];

      // Set L5 config (without rewards - those go to Reward collection)
      store.loyaltyCard.l5Config = l5Config || {
        // Removed redemptionThresholds - will be derived from Reward collection
        // Removed rewards - now stored in Reward collection
        discountValidityDays: 30,
        leaderboardMinPoints: 3000,
        coffeeHeroMinPoints: 5000,
        leaderboardPrizes: [
          { rank: 1, prizeType: "cash_voucher", totalAmount: 10000, splitCount: 5, splitAmount: 2000, prizeDescription: "10,000 Cash Voucher (5×2,000)" },
          { rank: 2, prizeType: "cash_voucher", totalAmount: 5000, splitCount: 5, splitAmount: 1000, prizeDescription: "5,000 Cash Voucher (5×1,000)" },
          { rank: 3, prizeType: "cash_voucher", totalAmount: 3000, splitCount: 3, splitAmount: 1000, prizeDescription: "3,000 Cash Voucher (3×1,000)" },
          { rank: 4, rankEnd: 10, prizeType: "movie_ticket", totalAmount: 0, prizeDescription: "2 QFX Movie Tickets" },
        ],
        threeMonthWinnerDiscount: 50,
        threeMonthWinnerCategory: "coffee",
        threeMonthWinnerDuration: 30,
        coffeeHeroDays: 30,
        coffeeHeroReward: "Free Americano (S) per day",
        allowDiscountStacking: true,
        maxStackedDiscount: null,
      };

      await store.save();

      // Check if store already has L5 rewards in Reward collection
      const existingL5Rewards = await rewardModel.countDocuments({ 
        store: storeId, 
        type: "l5" 
      });

      // Create default L5 rewards in Reward collection if none exist
      if (existingL5Rewards === 0) {
        console.log('[enableL5Format] Creating default L5 rewards for store:', storeId);
        for (const reward of defaultRewards) {
          await rewardModel.create({
            store: storeId,
            name: reward.name,
            type: "l5",
            threshold: reward.threshold,
            rewardType: reward.rewardType,
            discountPercentage: reward.discountPercentage,
            validity: "instant",
            evergreen: false,
          });
        }
        console.log('[enableL5Format] Created', defaultRewards.length, 'default L5 rewards');
      }

      // Get created rewards for response
      const l5Rewards = await rewardModel.find({ 
        store: storeId, 
        type: "l5" 
      }).sort({ threshold: 1 });

      // Format rewards for response
      const responseRewards = l5Rewards.map(r => ({
        _id: r._id,
        threshold: r.threshold,
        rewardType: r.rewardType,
        rewardName: r.name,
        discountPercentage: r.discountPercentage,
        validity: r.validity,
        evergreen: r.evergreen,
      }));

      const responseL5Config = {
        ...store.loyaltyCard.l5Config.toObject(),
        rewards: responseRewards,
        redemptionThresholds: l5Rewards.map(r => r.threshold).sort((a, b) => a - b),
      };

      return res.json({
        success: true,
        message: "L5 format enabled successfully",
        data: {
          format: store.loyaltyCard.format,
          l5Config: responseL5Config,
        },
      });
    } catch (error) {
      console.error("L5 enableL5Format error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Update customer's L5 aggregate data
   */
  async updateCustomerL5Data(customerId, storeId) {
    try {
      // Get all outlet points
      const outletPoints = await CustomerOutletPoints.find({
        customer: customerId,
        store: storeId,
      });

      const totalPoints = outletPoints.reduce((sum, op) => sum + op.currentPoints, 0);

      // Get active discounts
      const activeRedemptions = await L5Redemption.find({
        customer: customerId,
        store: storeId,
        status: "active",
        rewardType: "discount",
        expiryDate: { $gt: new Date() },
      });

      const totalDiscount = activeRedemptions.reduce(
        (sum, r) => sum + (r.discountPercentage || 0),
        0
      );

      // Get current month leaderboard data
      const { year, month } = L5MonthlyLeaderboard.getCurrentMonthPeriod();
      const leaderboardEntry = await L5MonthlyLeaderboard.findOne({
        customer: customerId,
        store: storeId,
        year,
        month,
      });

      // Update customer
      await customerModel.findByIdAndUpdate(customerId, {
        "l5Data.totalPointsAllOutlets": totalPoints,
        "l5Data.activeDiscountCount": activeRedemptions.length,
        "l5Data.totalActiveDiscount": totalDiscount,
        "l5Data.currentRank": leaderboardEntry?.rank || null,
        "l5Data.currentMonthPoints": leaderboardEntry?.totalPointsEarned || 0,
        "l5Data.currentMonthQualified": leaderboardEntry?.isQualified || false,
        "l5Data.isCoffeeHeroThisMonth": leaderboardEntry?.isCoffeeHero || false,
        "l5Data.lastLeaderboardUpdate": new Date(),
      });
    } catch (error) {
      console.error("updateCustomerL5Data error:", error);
    }
  }

  // ==================== STORE STAFF VIEW ====================

  /**
   * Look up a single customer's current points per outlet by phone number (store staff view)
   * GET /api/l5/customer-points/:storeId?phone=...
   */
  async getCustomerPointsByOutlet(req, res) {
    try {
      const { storeId } = req.params;
      const { phone } = req.query;

      if (!phone) {
        return res.status(400).json({ success: false, message: "Phone number is required" });
      }

      // Find the customer by phone within this store
      const customer = await customerModel.findOne(
        { store: storeId, phone: phone.trim() },
        "name phone email"
      );

      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      // Get only outlet points with currentPoints > 0 for this customer
      const outletPoints = await CustomerOutletPoints.find({
        customer: customer._id,
        store: storeId,
        currentPoints: { $gt: 0 },
      })
        .populate("outlet", "location")
        .select("outlet currentPoints totalPointsEarned");

      const outlets = outletPoints.map((op) => ({
        outletId: op.outlet._id,
        location: op.outlet.location,
        currentPoints: op.currentPoints,
        totalPointsEarned: op.totalPointsEarned,
      }));

      return res.json({
        success: true,
        data: {
          customer: {
            customerId: customer._id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
          },
          outlets,
        },
      });
    } catch (error) {
      console.error("L5 getCustomerPointsByOutlet error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

const l5ControllerInstance = new L5Controller();
module.exports = l5ControllerInstance;
