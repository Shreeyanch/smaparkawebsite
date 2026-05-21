const mongoose = require("mongoose");

const outletPointsSchema = new mongoose.Schema(
  {
    points: {
      type: Number,
      required: true,
      default: 0,
    },
    billID: {
      type: String,
    },
    outlet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outlet",
      required: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness of (store, outlet)
outletPointsSchema.index({ store: 1, outlet: 1 }, { unique: true });

module.exports = mongoose.model("OutletPoints", outletPointsSchema);
