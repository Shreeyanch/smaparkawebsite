const mongoose = require("mongoose");
const crypto = require("crypto");

/**
 * L5Voucher Model
 * Manages cash vouchers with split voucher support (e.g., 10,000 = 5x2,000)
 * Enforces one-voucher-per-visit rule
 */
const l5VoucherSchema = new mongoose.Schema(
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
    // Parent redemption record
    redemption: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "L5Redemption",
      required: true,
    },
    // Total voucher amount issued (e.g., 10000 for 1st place)
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // Individual voucher amount (e.g., 2000 for 5x2000 split)
    voucherAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // Voucher code/identifier for tracking
    voucherCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Voucher type
    voucherType: {
      type: String,
      enum: ["cash", "movie_ticket", "coffee", "discount"],
      default: "cash",
    },
    // Status tracking
    status: {
      type: String,
      enum: ["unused", "used", "expired"],
      default: "unused",
      index: true,
    },
    // Usage tracking
    usageDate: {
      type: Date,
    },
    usageOutlet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outlet",
    },
    billID: {
      type: String,
    },
    // Expiry (inherited from parent redemption, typically 30 days)
    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    // For leaderboard tracking
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
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for customer's voucher lookup
l5VoucherSchema.index({ customer: 1, status: 1 });

// Index for store's voucher tracking
l5VoucherSchema.index({ store: 1, status: 1, expiryDate: 1 });

// Index for redemption grouping (to find all vouchers from same redemption)
l5VoucherSchema.index({ redemption: 1 });

// Static method to generate unique voucher code
l5VoucherSchema.statics.generateVoucherCode = function (prefix = "HJ") {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

module.exports = mongoose.model("L5Voucher", l5VoucherSchema);
