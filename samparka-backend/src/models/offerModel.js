// models/offerModel.js
const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String, // URL from Cloudinary or local path
      default: null,
    },
    startDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    targetAudience: {
      type: String,
    },
    display: {
      type: Boolean,
      default: false,
    },

    // optional — if you want to target specific users or show only in certain services
    // targetAudience: {
    //   type: [String],
    //   enum: ["all", "loyaltyMembers", "newUsers", "premium"], // example options
    //   default: ["all"],
    // },
  },
  { timestamps: true }
);

// Automatically mark offer inactive if expired
offerSchema.pre("save", function (next) {
  if (this.expiryDate) {
    this.isActive = this.expiryDate > new Date();
  } else {
    this.isActive = true; // default if no expiry date
  }
  next();
});
// setInterval(async () => {
//   await offerSchema.updateMany(
//     { expiryDate: { $lt: new Date() }, isActive: true },
//     { isActive: false }
//   );
// }, 60 * 60 * 1000); // every hour

module.exports = mongoose.model("Offer", offerSchema);
