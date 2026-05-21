// import mongoose from "mongoose";
const mongoose = require("mongoose");

const redemptionSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    reward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reward",
      required: true,
    },
    outlet: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "claimed", "expired"],
      default: "pending",
    },
    billID: { type: String },
    initiatedBy: {
      type: String,
      enum: ["customer", "staff"],
      default: "customer",
    },
    redeemDate: { type: Date, default: Date.now },
    expiryDate: { type: Date }, // Auto-calculated below
  },
  { timestamps: true }
);

// Pre-save hook to calculate expiryDate before saving
redemptionSchema.pre("save", async function (next) {
  if (!this.expiryDate) {
    const reward = await mongoose.model("Reward").findById(this.reward);
    if (reward && reward.validity && reward.validity !== "none") {
      if (reward.validity === "instant") {
        const redeemDate = new Date(this.redeemDate);
        redeemDate.setHours(redeemDate.getHours() + 2);
        this.expiryDate = redeemDate;
      } else {
        // Initialize expiryDate to now or to redeemDate
        const baseDate = this.redeemDate
          ? new Date(this.redeemDate)
          : new Date();
        baseDate.setDate(baseDate.getDate() + Number(reward.validity));
        this.expiryDate = baseDate;
      }
    }
  }
  next();
});

// export default mongoose.model("Redemption", redemptionSchema);
module.exports = mongoose.model("Redemption", redemptionSchema);
