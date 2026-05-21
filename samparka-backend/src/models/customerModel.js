// import mongoose from "mongoose";
const mongoose = require("mongoose");

const customerModel = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    countryCode: { type: String, required: true, default: "+977" },
    phone: { type: Number, required: true },
    dob: { type: Date },
    gender: { type: String },
    termsAccepted: { type: Boolean, default: false },
    termsAcceptedAt: { type: Date },
    isNewCustomer: {
      type: Boolean,
      default: true,
    },
    tier: { type: String, default: "Bronze Tier" },
    lastTierChecked: {
      type: Date,
    },
    tierLockedByAdmin: { type: Boolean, default: false },
    // OTP verification fields
    otp: { type: String },
    otpExpiry: { type: Date },
    otpAttempts: { type: Number, default: 0 },
    otpLastSent: { type: Date },
    totalPoints: {
      type: Number,
      required: true,
      default: 0,
    },
    points: {
      type: Number,
      required: true,
      default: 0,
      set: (val) => parseFloat(val.toFixed(1)),
    },
    pointChangeDate: { type: Date },
    visitStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastVisitDate: { type: Date },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    // L5-specific data (only populated for L5 format stores)
    l5Data: {
      // Aggregate points across all outlets (for display purposes)
      totalPointsAllOutlets: {
        type: Number,
        default: 0,
        set: (val) => parseFloat(val.toFixed(1)),
      },
      // Track if customer qualifies for current month's leaderboard
      currentMonthQualified: {
        type: Boolean,
        default: false,
      },
      // Current month's total points earned (cached for performance)
      currentMonthPoints: {
        type: Number,
        default: 0,
      },
      // Current month's total points redeemed
      currentMonthRedeemed: {
        type: Number,
        default: 0,
      },
      // Coffee Hero status for current month
      isCoffeeHeroThisMonth: {
        type: Boolean,
        default: false,
      },
      // Current leaderboard rank (cached)
      currentRank: {
        type: Number,
      },
      // Last leaderboard update timestamp
      lastLeaderboardUpdate: {
        type: Date,
      },
      // Active discount count (stacked discounts)
      activeDiscountCount: {
        type: Number,
        default: 0,
      },
      // Total active discount percentage (sum of all stacked discounts)
      totalActiveDiscount: {
        type: Number,
        default: 0,
      },
    },
    // L6-specific data: per-customer mission progress
    // Structure: { missionProgress: { "<missionTitle>": { "<itemName>": <count> } } }
    l6Data: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
  },
  {
    timestamps: true,
  }
);
// Compound index to ensure unique email and phone per store
customerModel.index({ store: 1, email: 1 }, { unique: true });
customerModel.index({ store: 1, phone: 1 }, { unique: true });

// Index for leaderboard queries (sort by points descending, count by points)
customerModel.index({ store: 1, points: -1 });

// export default mongoose.model("Customer", customerModel);
module.exports = mongoose.model("Customer", customerModel);
