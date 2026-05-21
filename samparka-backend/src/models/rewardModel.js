const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
  image: {
    type: String,
    default:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Latte_and_dark_coffee.jpg/1200px-Latte_and_dark_coffee.jpg",
  },
  bgColor: { type: String, default: "#111827" },
  textColor: { type: String, default: "#10B981" },
  buttonColor: { type: String, default: "#1F2937" },
});

const rewardSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String },
    validity: { type: String },
    points: { type: String },
    evergreen: { type: Boolean },
    tier: { type: String },
    image: { type: String },
    type: {
      type: String,
      enum: ["standard", "constant", "l5", "l4", "l6"],
      required: true,
      default: "standard",
    },
    redeemable: { type: Boolean, default: false },
    redeemableTimes: { type: Number, default: 1 },
    template: { type: templateSchema, default: () => ({}) },
    
    // L5-specific fields
    threshold: { type: Number },  // Points required for L5 rewards
    rewardType: { 
      type: String, 
      enum: ["discount", "physical", "voucher"],
    },
    discountPercentage: { type: Number },  // For discount type rewards
    
    // L4-specific fields
    pointCost: { type: Number },  // Points to deduct for L4 reward redemption

    // L6-specific fields
    isTierBased: { type: Boolean, default: false },
    isPointBased: { type: Boolean, default: false },
    isMissionBased: { type: Boolean, default: false },
    isStreakBased: { type: Boolean, default: false },
    streakGoal: { type: Number },  // Required consecutive days streak to unlock
    streakIcon: { type: String },  // Emoji icon shown on last day of streak tracker
    mission: { type: String },  // Mission name this reward is linked to
    l6Missions: { type: mongoose.Schema.Types.Mixed },  // Missions array for mission-based L6 rewards
    priority: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Index for efficient L5 reward queries
rewardSchema.index({ store: 1, type: 1 });
rewardSchema.index({ store: 1, type: 1, threshold: 1 });

module.exports = mongoose.model("Reward", rewardSchema);
