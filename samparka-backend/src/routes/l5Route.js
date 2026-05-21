const express = require("express");
const router = express.Router();
const customerMiddleware = require("../middlewares/customerMiddleware");
const storeMiddleware = require("../middlewares/storeMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const l5Controller = require("../controllers/l5Controller");

// ==================== POINTS ====================
// Award points to customer at outlet (Store/Admin only)
router.post("/points/earn", storeMiddleware, l5Controller.earnPoints);

// Get customer's outlet-wise point breakdown
router.get("/points/:storeId", customerMiddleware, l5Controller.getPointsBalance);

// Get customer's transaction history
router.get("/points/:storeId/transactions", customerMiddleware, l5Controller.getTransactions);

// ==================== REDEMPTIONS ====================
// Redeem discount reward at outlet
router.post("/redemptions/:storeId", customerMiddleware, l5Controller.redeemDiscount);

// Get customer's active discounts/redemptions
router.get("/redemptions/:storeId/active", customerMiddleware, l5Controller.getActiveRedemptions);

// Get customer's redemption history
router.get("/redemptions/:storeId/history", customerMiddleware, l5Controller.getRedemptionHistory);

// Use/apply a redemption (Store/Admin only)
router.post("/redemptions/:storeId/:redemptionId/use", storeMiddleware, l5Controller.useRedemption);

// ==================== VOUCHERS ====================
// Get customer's vouchers
router.get("/vouchers/:storeId", customerMiddleware, l5Controller.getVouchers);

// Use a voucher (Store/Admin only)
router.post("/vouchers/:storeId/:voucherId/use", storeMiddleware, l5Controller.useVoucher);

// ==================== LEADERBOARD ====================
// Get current month's leaderboard (for customers)
router.get("/leaderboard/:storeId/current", customerMiddleware, l5Controller.getCurrentLeaderboard);

// Get current month's leaderboard (for admin users)
router.get("/leaderboard/:storeId/admin", adminMiddleware, l5Controller.getCurrentLeaderboard);

// Get historical leaderboards
router.get("/leaderboard/:storeId/history", customerMiddleware, l5Controller.getLeaderboardHistory);

// Get monthly winners for admin review
router.get("/leaderboard/:storeId/winners", storeMiddleware, l5Controller.getMonthlyWinners);

// Award prizes to monthly winners (Admin)
router.post("/leaderboard/:storeId/award", storeMiddleware, l5Controller.awardPrizes);

// ==================== 3-MONTH WINNERS ====================
// Get 3-month winners
router.get("/three-month-winners/:storeId", customerMiddleware, l5Controller.getThreeMonthWinners);

// Award 3-month winner prize (Admin)
router.post("/three-month-winners/:storeId/:winnerId/award", storeMiddleware, l5Controller.awardThreeMonthPrize);

// ==================== STORE STAFF VIEW ====================
// Get all customers' points by outlet (store staff view)
router.get("/customer-points/:storeId", storeMiddleware, l5Controller.getCustomerPointsByOutlet);

// ==================== CONFIGURATION ====================
// Get L5 configuration (public for customer view)
router.get("/config/:storeId", customerMiddleware, l5Controller.getConfig);

// Update L5 configuration (Admin only)
router.put("/config/:storeId", storeMiddleware, l5Controller.updateConfig);

// Enable L5 format for a store (Admin only)
router.post("/config/:storeId/enable", storeMiddleware, l5Controller.enableL5Format);

module.exports = router;
