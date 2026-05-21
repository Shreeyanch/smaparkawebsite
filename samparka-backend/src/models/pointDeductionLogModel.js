const mongoose = require("mongoose");

const pointDeductionLogSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    reward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reward",
      required: true,
    },
    redemption: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Redemption",
    },
    // Redemption outlet (string to match PointsHistory format)
    outlet: {
      type: String,
      index: true,
    },
    // Bill identifier for this redemption
    billID: {
      type: String,
    },
    pointsDeducted: {
      type: Number,
      required: true,
      min: 0,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    tier: {
      type: String,
    },
    reason: {
      type: String,
      enum: ["reward_redemption", "adjustment", "expiry", "other"],
      default: "reward_redemption",
    },
    // Proportional split breakdown - which outlets contributed to this redemption
    outletContributions: [
      {
        outlet: { type: String, required: true },
        pointsContributed: { type: Number, required: true },
        percentageContribution: { type: Number, required: true },
      },
    ],
    remarks: {
      type: String,
    },
  },
  { timestamps: true }
);

// Indexes for efficient reporting queries
pointDeductionLogSchema.index({ store: 1, createdAt: -1 });
pointDeductionLogSchema.index({ store: 1, outlet: 1, createdAt: -1 });

module.exports = mongoose.model("PointDeductionLog", pointDeductionLogSchema);
