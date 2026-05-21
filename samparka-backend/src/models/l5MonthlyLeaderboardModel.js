const mongoose = require("mongoose");

/**
 * L5MonthlyLeaderboard Model
 * Tracks monthly rankings with historical data for 3-month winner detection
 */
const l5MonthlyLeaderboardSchema = new mongoose.Schema(
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
    // Month and year for the leaderboard period
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2020,
    },
    // Aggregate points EARNED during this month (across all outlets)
    totalPointsEarned: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    // Points REDEEMED in the month (for Coffee Hero tracking)
    totalPointsRedeemed: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    // Rank in the leaderboard (1 = first place)
    rank: {
      type: Number,
      min: 1,
      index: true,
    },
    // Qualification status (minimum 3,000 points required by default)
    isQualified: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    // Awards tracking
    isMonthlyWinner: {
      type: Boolean,
      default: false,
      index: true,
    },
    isCoffeeHero: {
      type: Boolean,
      default: false,
      index: true,
    },
    // 3-month consecutive winner tracking
    isThreeMonthWinner: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Prize awarded status
    prizeAwarded: {
      type: Boolean,
      default: false,
    },
    prizeAwardedDate: {
      type: Date,
    },
    prizeAwardedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Period start and end for precise tracking
    periodStart: {
      type: Date,
      required: true,
      index: true,
    },
    periodEnd: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one record per customer-store-month-year
l5MonthlyLeaderboardSchema.index(
  { store: 1, customer: 1, year: 1, month: 1 },
  { unique: true }
);

// Index for leaderboard ranking queries
l5MonthlyLeaderboardSchema.index({
  store: 1,
  year: 1,
  month: 1,
  rank: 1,
  isQualified: 1,
});

// Index for finding monthly winners
l5MonthlyLeaderboardSchema.index({
  store: 1,
  year: 1,
  month: 1,
  isMonthlyWinner: 1,
});

// Index for Coffee Hero tracking
l5MonthlyLeaderboardSchema.index({
  store: 1,
  year: 1,
  month: 1,
  isCoffeeHero: 1,
  totalPointsRedeemed: -1,
});

// Index for 3-month winner queries (finding consecutive #1 ranks)
l5MonthlyLeaderboardSchema.index({
  store: 1,
  customer: 1,
  year: 1,
  month: 1,
  rank: 1,
});

// Static method to get current month period
l5MonthlyLeaderboardSchema.statics.getCurrentMonthPeriod = function () {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12

  const periodStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const periodEnd = new Date(year, month, 0, 23, 59, 59, 999);

  return { year, month, periodStart, periodEnd };
};

// Static method to get previous N months
l5MonthlyLeaderboardSchema.statics.getPreviousMonths = function (n = 3) {
  const months = [];
  const now = new Date();

  for (let i = 1; i <= n; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    });
  }

  return months;
};

module.exports = mongoose.model("L5MonthlyLeaderboard", l5MonthlyLeaderboardSchema);
