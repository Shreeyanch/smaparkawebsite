const mongoose = require("mongoose");

// Singleton document — only one settings record exists for the entire platform.
// Use adminSettingsModel.getSettings() to retrieve or create it on first access.
const adminSettingsSchema = new mongoose.Schema(
  {
    // Daily report cron schedule (hour and minute in 24-hour format, NPT/server timezone)
    reportScheduleHour: {
      type: Number,
      default: 20,
      min: 0,
      max: 23,
    },
    reportScheduleMinute: {
      type: Number,
      default: 0,
      min: 0,
      max: 59,
    },
    // Expiry notification cron schedule (hour and minute in 24-hour format, NPT/server timezone)
    expiryNotificationHour: {
      type: Number,
      default: 9, // 9 AM default
      min: 0,
      max: 23,
    },
    expiryNotificationMinute: {
      type: Number,
      default: 0,
      min: 0,
      max: 59,
    },
    // Track last run date to prevent duplicate sends within the same day
    lastExpiryNotificationDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Static helper — always returns the single settings document, creating it if absent
adminSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
    console.log("✅ Admin settings document initialised with defaults");
  }
  return settings;
};

module.exports = mongoose.model("AdminSettings", adminSettingsSchema);
