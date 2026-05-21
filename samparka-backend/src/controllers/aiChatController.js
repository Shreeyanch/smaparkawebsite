const response = require("../utils/responseHandler");
const aiChatService = require("../services/aiChatService");

class AIChatController {
  // GET /api/aiChat/:storeId/limit
  getLimitStatus = async (req, res) => {
    try {
      const { storeId } = req.params;

      if (!storeId) {
        return response.error(res, "storeId is required");
      }

      if (req.store && req.store._id.toString() !== storeId) {
        return response.unauthorized(res, "Access denied to this store's data");
      }

      const isAdmin = !!req.admin;
      const data = await aiChatService.getDailyLimitStatus(storeId, isAdmin);
      return response.success(res, data, "AI daily limit status fetched");
    } catch (error) {
      console.error("❌ AI limit status error:", error);
      return response.serverError(res, "Failed to fetch AI daily limit status");
    }
  };

  // POST /api/aiChat/:storeId
  chat = async (req, res) => {
    try {
      const { storeId } = req.params;
      const { messages } = req.body;

      if (!storeId) {
        return response.error(res, "storeId is required");
      }
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return response.error(res, "messages must be a non-empty array");
      }

      // Store-level auth: ensure store owners can only query their own store
      if (req.store && req.store._id.toString() !== storeId) {
        return response.unauthorized(res, "Access denied to this store's data");
      }

      // Determine user and admin status
      const userId = req.admin?._id || req.store?.owner || null;
      const isAdmin = !!req.admin; // true if admin, false otherwise

      // Call service with admin flag
      const data = await aiChatService.getAIResponse(messages, storeId, userId, isAdmin);
      return response.success(res, data, "AI response generated");
    } catch (error) {
      console.error("❌ AI chat error:", error);

      // Handle daily limit errors
      if (error.message.startsWith("DAILY_LIMIT_REACHED:")) {
        const parts = error.message.split(":");
        const resetTimeFormatted = parts[3] || "midnight";
        return response.error(
          res,
          `Daily question limit reached (5/day). Resets at ${resetTimeFormatted}.`,
          429 // HTTP 429 Too Many Requests
        );
      }

      return response.serverError(res, "Failed to generate AI response");
    }
  };
}

module.exports = new AIChatController();
