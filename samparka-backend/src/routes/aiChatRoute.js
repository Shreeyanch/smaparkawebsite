const { Router } = require("express");
const adminOrStoreMiddleware = require("../middlewares/adminOrStoreMiddleware");
const aiChatController = require("../controllers/aiChatController");

const router = new Router();

// POST /api/aiChat/:storeId
router.get("/:storeId/limit", adminOrStoreMiddleware, aiChatController.getLimitStatus);
router.post("/:storeId", adminOrStoreMiddleware, aiChatController.chat);

module.exports = router;
