const mongoose = require("mongoose");

/**
 * L5PointsTransaction Model
 * Comprehensive transaction log for all point movements with outlet-level granularity
 * Used for leaderboard calculations and audit trail
 */
const l5PointsTransactionSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    outlet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outlet",
      required: true,
      index: true,
    },
    // Transaction type
    transactionType: {
      type: String,
      enum: ["earn", "redeem", "adjustment", "expiry", "bonus"],
      required: true,
      index: true,
    },
    // Points involved (positive for earn/bonus, negative for redeem/expiry)
    points: {
      type: Number,
      required: true,
    },
    // Balance at this outlet after transaction
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    // Related redemption (if transactionType is "redeem")
    redemption: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "L5Redemption",
    },
    // Bill information
    billID: {
      type: String,
      index: true,
    },
    billAmount: {
      type: Number,
    },
    // Reason/description for the transaction
    description: {
      type: String,
    },
    remarks: {
      type: String,
    },
    // Manual transaction tracking
    isManual: {
      type: Boolean,
      default: false,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // For bonus points tracking
    bonusType: {
      type: String,
      enum: ["registration", "birthday", "referral", "promotion", "other"],
    },
    // Reference to related entities
    referenceType: {
      type: String,
      enum: ["bill", "redemption", "adjustment", "promotion", "other"],
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for customer transaction history at specific outlet
l5PointsTransactionSchema.index({
  customer: 1,
  outlet: 1,
  createdAt: -1,
});

// Index for store analytics
l5PointsTransactionSchema.index({
  store: 1,
  transactionType: 1,
  createdAt: -1,
});

// Index for monthly aggregations (leaderboard calculation)
l5PointsTransactionSchema.index({
  store: 1,
  customer: 1,
  transactionType: 1,
  createdAt: -1,
});

// Index for outlet performance tracking
l5PointsTransactionSchema.index({
  outlet: 1,
  transactionType: 1,
  createdAt: -1,
});

// Index for date range queries (used in monthly leaderboard)
l5PointsTransactionSchema.index({
  store: 1,
  transactionType: 1,
  createdAt: 1,
});

// Static method to calculate monthly points for a customer
l5PointsTransactionSchema.statics.getMonthlyPoints = async function (
  customerId,
  storeId,
  year,
  month
) {
  const periodStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const periodEnd = new Date(year, month, 0, 23, 59, 59, 999);

  const result = await this.aggregate([
    {
      $match: {
        customer: new mongoose.Types.ObjectId(customerId),
        store: new mongoose.Types.ObjectId(storeId),
        createdAt: { $gte: periodStart, $lte: periodEnd },
      },
    },
    {
      $group: {
        _id: "$transactionType",
        total: { $sum: "$points" },
      },
    },
  ]);

  const earned =
    result.find((r) => r._id === "earn" || r._id === "bonus")?.total || 0;
  const redeemed = Math.abs(
    result.find((r) => r._id === "redeem")?.total || 0
  );

  return { earned, redeemed };
};

// Static method to get leaderboard data for a month
l5PointsTransactionSchema.statics.getMonthlyLeaderboard = async function (
  storeId,
  year,
  month,
  limit = 100
) {
  const periodStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const periodEnd = new Date(year, month, 0, 23, 59, 59, 999);

  const result = await this.aggregate([
    {
      $match: {
        store: new mongoose.Types.ObjectId(storeId),
        transactionType: { $in: ["earn", "bonus"] },
        createdAt: { $gte: periodStart, $lte: periodEnd },
      },
    },
    {
      $group: {
        _id: "$customer",
        totalPointsEarned: { $sum: "$points" },
      },
    },
    {
      $sort: { totalPointsEarned: -1 },
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: "customers",
        localField: "_id",
        foreignField: "_id",
        as: "customerData",
      },
    },
    {
      $unwind: "$customerData",
    },
    {
      $project: {
        customer: "$_id",
        customerName: "$customerData.name",
        customerEmail: "$customerData.email",
        customerPhone: "$customerData.phone",
        totalPointsEarned: 1,
      },
    },
  ]);

  return result;
};

module.exports = mongoose.model("L5PointsTransaction", l5PointsTransactionSchema);
