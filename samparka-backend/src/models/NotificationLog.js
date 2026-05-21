const mongoose = require("mongoose");

const NotificationLogSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

NotificationLogSchema.index({ storeId: 1, customerId: 1 }, { unique: true });

module.exports = mongoose.model("NotificationLog", NotificationLogSchema);
