// routes/whatsappRoutes.js

const express = require("express");
const multer = require("multer");
const router = express.Router();

const whatsappController = require("../controllers/whatsappController");

// memory upload for WhatsApp (small images only)
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Upload image (S3 + Whatsapp Media)
 */
router.post(
  "/upload-image",
  upload.single("image"),
  whatsappController.uploadImage
);

/**
 * Send template message
 */
router.post("/send-message", whatsappController.sendMessage);

/** Bulk send template messages
 */
router.post("/bulk-send", whatsappController.bulkSendMessage);

// Create WhatsApp Account
router.post("/create-account", whatsappController.createWhatsappAccount);

// Create Template
router.post("/create-template", whatsappController.createTemplate);

/**
 * List media
 */
router.get("/media/:storeId", whatsappController.getMedia);

/**
 * List templates
 */
router.get("/templates/:storeId", whatsappController.getTemplates);

/**
 * Get WhatsApp account
 */
router.get("/account/:storeId", whatsappController.getAccount);

// Get list of all chats (grouped by phone)
router.get("/chats/list", whatsappController.getChatList);

// Get all messages for a specific phone number
router.get("/chats/:phone", whatsappController.getChatMessages);

// Send a quick text message (without template)
router.post("/send-quick-message", whatsappController.sendQuickMessage);

module.exports = router;
