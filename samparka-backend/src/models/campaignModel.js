const mongoose = require("mongoose");

const recipientSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    customerName: { type: String },
    customerPhone: { type: String },
    customerEmail: { type: String },
  },
  { _id: false }
);

const campaignSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    // Campaign metadata
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Targeting
    targetType: {
      type: String,
      enum: ["segment", "individual", "mixed"],
      required: true,
    },
    segments: [
      {
        type: String,
        enum: [
          "first_visit",
          "second_visit",
          "third_visit",
          "fourth_visit",
          "5+_visits",
          "at_risk",
          "churned",
        ],
      },
    ],

    // Recipients snapshot (stored at creation time for history)
    recipients: [recipientSchema],
    recipientCount: {
      type: Number,
      required: true,
      default: 0,
    },

    // Message content
    channel: {
      type: String,
      enum: ["sms", "push", "email", "whatsapp"],
      required: true,
    },
    messageType: {
      type: String,
      enum: ["template", "custom"],
      required: true,
    },
    templateId: {
      type: String, // Reference to template key in MailSMS model (e.g., "smsAfterPointEarned")
    },
    customMessage: {
      title: { type: String }, // For push notifications
      body: { type: String }, // Message body for SMS/Push
      subject: { type: String }, // For email
      ctaText: { type: String },
      ctaUrl: { type: String },
    },
    campaignImageKey: { type: String }, // S3 key for optional email campaign image

    // Scheduling
    status: {
      type: String,
      enum: [
        "draft",
        "scheduled",
        "processing",
        "completed",
        "failed",
        "cancelled",
      ],
      default: "draft",
    },
    scheduledFor: {
      type: Date, // null = send immediately
    },
    sentAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },

    // Results (basic tracking for MVP)
    sendAttempted: {
      type: Number,
      default: 0,
    },
    sendSucceeded: {
      type: Number,
      default: 0,
    },
    sendFailed: {
      type: Number,
      default: 0,
    },

    // Error tracking
    lastError: {
      type: String,
    },

    // Audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
campaignSchema.index({ store: 1, status: 1 });
campaignSchema.index({ store: 1, scheduledFor: 1 });
campaignSchema.index({ store: 1, createdAt: -1 });

module.exports = mongoose.model("Campaign", campaignSchema);
