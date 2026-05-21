const mongoose = require("mongoose");

const pointsHistorySchema = new mongoose.Schema(
  {
    points: {
      type: Number,
      required: true,
    },
    billID: {
      type: String,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    outlet: {
      type: String,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    remarks: {
      type: String,
    },
  },
  { timestamps: true }
);

// Indexes for query optimization
pointsHistorySchema.index({ customer: 1 }); // Customer history lookups
pointsHistorySchema.index({ store: 1, createdAt: -1 }); // Store trends by date
pointsHistorySchema.index({ store: 1, customer: 1 }); // Store-customer lookups

module.exports = mongoose.model("PointsHistory", pointsHistorySchema);
