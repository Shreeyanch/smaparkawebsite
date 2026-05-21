const mongoose = require("mongoose");

const adminEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "marketing_campaign",
        "seasonal_promotion",
        "customer_followup",
        "general_announcement",
        "billing_reminder",
      ],
      required: true,
    },
    scheduledAt: { type: Date, required: true },
    targetStores: [{ type: mongoose.Schema.Types.ObjectId, ref: "Store" }],
    status: {
      type: String,
      enum: ["scheduled", "sent", "failed"],
      default: "scheduled",
    },
    sentAt: { type: Date },
    failureReason: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const adminEventModel = mongoose.model("AdminEvent", adminEventSchema);
module.exports = adminEventModel;
