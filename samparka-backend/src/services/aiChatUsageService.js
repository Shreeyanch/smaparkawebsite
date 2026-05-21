const moment = require("moment-timezone");
const AIChatUsage = require("../models/aiChatUsageModel");
const Store = require("../models/storeModel");

/**
 * Get today's date in the store's timezone (format: YYYY-MM-DD)
 * @param {string} timezone - IANA timezone string
 * @returns {string} - Date in YYYY-MM-DD format
 */
function getTodayDate(timezone) {
  return moment.tz(timezone).format("YYYY-MM-DD");
}

/**
 * Get the next midnight time in the store's timezone
 * @param {string} timezone - IANA timezone string
 * @returns {Date} - Next midnight in that timezone
 */
function getNextMidnight(timezone) {
  return moment.tz(timezone).add(1, "day").startOf("day").toDate();
}

/**
 * Check if a store has reached its daily question limit
 * Admins bypass this limit (get unlimited questions)
 * @param {string} storeId - Store ID
 * @param {boolean} isAdmin - Whether the user is an admin
 * @returns {Promise<{allowed: boolean, remaining: number, used: number, resetTime: Date, timezone: string}>}
 */
async function checkDailyLimit(storeId, isAdmin = false) {
  // Admins have unlimited access
  if (isAdmin) {
    return {
      allowed: true,
      remaining: 999,
      used: 0,
      resetTime: null,
      timezone: null,
      isAdmin: true,
    };
  }

  // Get store's timezone
  const store = await Store.findById(storeId).select("timezone").lean();
  if (!store) {
    throw new Error("Store not found");
  }

  const timezone = store.timezone || "Asia/Kathmandu";
  const todayDate = getTodayDate(timezone);

  // Find today's usage document
  const usage = await AIChatUsage.findOne({ storeId, date: todayDate }).lean();

  const used = usage?.questionCount || 0;
  const remaining = Math.max(0, 5 - used);
  const allowed = used < 5;
  const resetTime = getNextMidnight(timezone);

  return {
    allowed,
    remaining,
    used,
    resetTime,
    timezone,
    isAdmin: false,
  };
}

/**
 * Increment the question usage count for a store
 * @param {string} storeId - Store ID
 * @param {string} questionText - The question text (truncated to 200 chars)
 * @param {string} userId - User ID who asked the question
 * @param {boolean} isAdmin - Whether the user is an admin
 * @returns {Promise<Object>} - Updated usage document
 */
async function incrementUsage(storeId, questionText, userId = null, isAdmin = false) {
  // Get store's timezone
  const store = await Store.findById(storeId).select("timezone").lean();
  if (!store) {
    throw new Error("Store not found");
  }

  const timezone = store.timezone || "Asia/Kathmandu";
  const todayDate = getTodayDate(timezone);

  // Truncate question text to 200 characters for audit trail
  const truncatedQuestion = questionText.substring(0, 200);

  // Use findOneAndUpdate with upsert for atomic operation
  const usage = await AIChatUsage.findOneAndUpdate(
    { storeId, date: todayDate },
    {
      $inc: { questionCount: 1 },
      $push: {
        questions: {
          timestamp: new Date(),
          questionText: truncatedQuestion,
          userId,
          isAdmin,
        },
      },
      $setOnInsert: {
        storeId,
        date: todayDate,
        timezone,
      },
    },
    {
      upsert: true,
      new: true,
    }
  );

  return usage;
}

module.exports = {
  getTodayDate,
  getNextMidnight,
  checkDailyLimit,
  incrementUsage,
};
