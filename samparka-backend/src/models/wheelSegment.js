const mongoose = require("mongoose");

const wheelSegmentSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store", // Reference to the Store model
      required: true, // Ensure store is always provided
    },
    label: {
      type: String,
      trim: true, // Trim whitespace from the label
    },
    reward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reward", // Reference to the Reward model
    },
    color: {
      type: String,
      default: "#000000", // Default color if not provided
    },
    value: {
      type: Number,
      required: true, // Ensure value is always provided
    },
    type: {
      type: String,
      enum: ["points", "rewards", "neutral"], // Define allowed types
    },
    isActive: {
      type: Boolean,
      default: true, // Default to active
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WheelSegment", wheelSegmentSchema);
