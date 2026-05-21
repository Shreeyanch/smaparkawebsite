const mongoose = require("mongoose");

/**
 * L5ThreeMonthWinner Model
 * Tracks customers who won 1st place for 3 consecutive months
 * Manages their 50% coffee discount award
 */
const l5ThreeMonthWinnerSchema = new mongoose.Schema(
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
    // Three consecutive months where customer was #1
    winningMonths: [
      {
        month: { type: Number, required: true, min: 1, max: 12 },
        year: { type: Number, required: true, min: 2020 },
        totalPoints: { type: Number, required: true },
      },
    ],
    // Start and end dates of the 3-month winning period
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    // Discount eligibility
    discountPercentage: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    // Which category does this discount apply to
    discountCategory: {
      type: String,
      default: "coffee",
      enum: ["coffee", "food", "all"],
    },
    // Award status
    awardStatus: {
      type: String,
      enum: ["pending", "awarded", "active", "expired", "revoked"],
      default: "pending",
      index: true,
    },
    // When the award was approved/given by admin
    awardedDate: {
      type: Date,
    },
    awardedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Discount validity period (typically the following month)
    discountValidFrom: {
      type: Date,
    },
    discountValidUntil: {
      type: Date,
    },
    // Usage tracking
    usageCount: {
      type: Number,
      default: 0,
    },
    totalDiscountGiven: {
      type: Number,
      default: 0,
    },
    // Expiry date for the award (e.g., 90 days from award date)
    expiryDate: {
      type: Date,
      index: true,
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for customer lookup
l5ThreeMonthWinnerSchema.index({ customer: 1, store: 1 });

// Index for active awards
l5ThreeMonthWinnerSchema.index({
  store: 1,
  awardStatus: 1,
  expiryDate: 1,
});

// Index for finding awards by month period
l5ThreeMonthWinnerSchema.index({
  store: 1,
  periodStart: 1,
  periodEnd: 1,
});

// Pre-save hook to set expiry date (90 days from award)
l5ThreeMonthWinnerSchema.pre("save", function (next) {
  if (
    this.awardStatus === "awarded" &&
    !this.expiryDate &&
    this.awardedDate
  ) {
    const expiryDate = new Date(this.awardedDate);
    expiryDate.setDate(expiryDate.getDate() + 90);
    this.expiryDate = expiryDate;
  }
  next();
});

// Static method to check if customer has active 3-month winner discount
l5ThreeMonthWinnerSchema.statics.hasActiveDiscount = async function (
  customerId,
  storeId
) {
  const now = new Date();
  const activeAward = await this.findOne({
    customer: customerId,
    store: storeId,
    awardStatus: { $in: ["awarded", "active"] },
    discountValidFrom: { $lte: now },
    discountValidUntil: { $gte: now },
  });

  return activeAward;
};

module.exports = mongoose.model("L5ThreeMonthWinner", l5ThreeMonthWinnerSchema);
