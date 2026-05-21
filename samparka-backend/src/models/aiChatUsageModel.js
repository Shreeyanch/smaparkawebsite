const mongoose = require("mongoose");

const aiChatUsageSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    questionCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    questions: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        questionText: {
          type: String,
          maxlength: 200,
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        isAdmin: {
          type: Boolean,
          default: false,
        },
      },
    ],
    timezone: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one document per store per day
aiChatUsageSchema.index({ storeId: 1, date: 1 }, { unique: true });

// TTL index: auto-delete documents after 90 days
aiChatUsageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model("AIChatUsage", aiChatUsageSchema);
