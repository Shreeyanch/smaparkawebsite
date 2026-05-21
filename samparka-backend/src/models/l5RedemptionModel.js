const mongoose = require("mongoose");

/**
 * L5Redemption Model
 * Tracks discount redemptions with outlet restrictions and stacking support
 */
const l5RedemptionSchema = new mongoose.Schema(
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
    // Points threshold redeemed (775, 1500, 2500, 5000, 8000, 10000, 50000)
    pointsThreshold: {
      type: Number,
      required: true,
    },
    // Points actually deducted from customer balance
    pointsDeducted: {
      type: Number,
      required: true,
      min: 0,
    },
    // Type of reward
    rewardType: {
      type: String,
      enum: ["discount", "voucher", "physical"],
      required: true,
    },
    // For discount rewards (percentage off)
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    // Reward name/description (e.g., "Free Americano", "Pokhara Tour")
    rewardName: {
      type: String,
    },
    // Redemption status
    status: {
      type: String,
      enum: ["active", "used", "expired", "pending"],
      default: "active",
      index: true,
    },
    // Dates
    redemptionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    // When the discount/reward was actually used
    usageDate: {
      type: Date,
    },
    // Where it was used (for vouchers, may differ from redemption outlet)
    usageOutlet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outlet",
    },
    billID: {
      type: String,
    },
    billAmount: {
      type: Number,
    },
    remarks: {
      type: String,
    },
    // For leaderboard prize tracking
    isLeaderboardPrize: {
      type: Boolean,
      default: false,
    },
    leaderboardMonth: {
      type: Number,
      min: 1,
      max: 12,
    },
    leaderboardYear: {
      type: Number,
    },
    leaderboardRank: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for customer's active redemptions at a store
l5RedemptionSchema.index({ store: 1, customer: 1, status: 1 });

// Index for expiry cleanup jobs
l5RedemptionSchema.index({ status: 1, expiryDate: 1 });

// Index for outlet-specific queries
l5RedemptionSchema.index({ outlet: 1, redemptionDate: -1 });

// Index for leaderboard prize queries
l5RedemptionSchema.index({
  store: 1,
  isLeaderboardPrize: 1,
  leaderboardYear: 1,
  leaderboardMonth: 1,
});

// Pre-save hook to calculate expiryDate (30 days from redemption)
l5RedemptionSchema.pre("save", function (next) {
  if (!this.expiryDate && this.redemptionDate) {
    const expiryDate = new Date(this.redemptionDate);
    expiryDate.setDate(expiryDate.getDate() + 30);
    this.expiryDate = expiryDate;
  }
  next();
});

module.exports = mongoose.model("L5Redemption", l5RedemptionSchema);
