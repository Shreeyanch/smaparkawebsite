const mongoose = require("mongoose");

/**
 * CustomerOutletPoints Model
 * Tracks outlet-specific point balances for L5 loyalty format
 * Points earned at Outlet A can only be redeemed at Outlet A
 */
const customerOutletPointsSchema = new mongoose.Schema(
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
    outlet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outlet",
      required: true,
      index: true,
    },
    // Current available points at this outlet (earned - redeemed)
    currentPoints: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      set: (val) => parseFloat(val.toFixed(1)),
    },
    // Lifetime points earned at this outlet (never decreases)
    totalPointsEarned: {
      type: Number,
      required: true,
      default: 0,
      set: (val) => parseFloat(val.toFixed(1)),
    },
    // Lifetime points redeemed at this outlet (for Coffee Hero tracking)
    totalPointsRedeemed: {
      type: Number,
      required: true,
      default: 0,
      set: (val) => parseFloat(val.toFixed(1)),
    },
    // Last transaction date for this outlet
    lastTransactionDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one record per customer-store-outlet combination
customerOutletPointsSchema.index(
  { customer: 1, store: 1, outlet: 1 },
  { unique: true }
);

// Index for leaderboard queries (store + monthly aggregation)
customerOutletPointsSchema.index({ store: 1, totalPointsEarned: -1 });

// Index for Coffee Hero queries (store + monthly redeemed points)
customerOutletPointsSchema.index({ store: 1, totalPointsRedeemed: -1 });

// Index for customer's outlet breakdown query
customerOutletPointsSchema.index({ customer: 1, store: 1 });

module.exports = mongoose.model("CustomerOutletPoints", customerOutletPointsSchema);
