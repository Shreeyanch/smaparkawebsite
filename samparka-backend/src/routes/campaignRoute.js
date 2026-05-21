const express = require("express");
const multer = require("multer");
const router = express.Router();
const campaignController = require("../controllers/campaignController");
const verifyToken = require("../middlewares/authMiddleware");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max (frontend compresses before upload)
});

// All routes require authentication
router.use(verifyToken);

// Image upload — MUST be before /:storeId routes to avoid param collision
router.post("/upload-image", upload.single("image"), campaignController.uploadCampaignImage);

// Campaign CRUD
router.get("/:storeId", campaignController.listCampaigns);
router.get("/:storeId/campaign/:campaignId", campaignController.getCampaign);
router.post("/:storeId", campaignController.createCampaign);
router.delete("/:storeId/:campaignId", campaignController.cancelCampaign);
router.post("/:storeId/:campaignId/send", campaignController.triggerSend);

// Customer segments for selection
router.get("/:storeId/customers/at-risk", campaignController.getAtRiskCustomers);
router.get("/:storeId/customers/churned", campaignController.getChurnedCustomers);
router.get("/:storeId/customers/segment-counts", campaignController.getSegmentCounts);

// Templates
router.get("/:storeId/templates/:channel", campaignController.getTemplates);

// Preview
router.post("/:storeId/preview", campaignController.previewRecipients);

module.exports = router;
