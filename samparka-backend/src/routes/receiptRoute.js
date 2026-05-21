"use strict";

const express = require("express");
const multer = require("multer");


const customerMiddleware = require("../middlewares/customerMiddleware");
const storeMiddleware = require("../middlewares/storeMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const receiptController = require("../controllers/receiptController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WEBP, and HEIC images are accepted"), false);
    }
  },
});

// ── Customer routes ────────────────────────────────────────────────────────────

// OCR-only extract (no DB write) — used by the confirm screen before final submit
router.post(
  "/extract",
  customerMiddleware,
  upload.single("receipt"),
  receiptController.extractOnly
);

router.post(
  "/submit/customer",
  customerMiddleware,
  upload.single("receipt"),
  receiptController.submitReceipt
);

router.get("/customer/history", customerMiddleware, receiptController.getCustomerHistory);

// ── Store staff / admin routes ────────────────────────────────────────────────

// OCR-only extract for staff (same logic as customer extract, different auth)
router.post(
  "/extract/staff",
  storeMiddleware,
  upload.single("receipt"),
  receiptController.extractOnly
);

router.post(
  "/submit/staff",
  storeMiddleware,
  upload.single("receipt"),
  receiptController.submitReceiptStaff
);

router.get("/submissions", storeMiddleware, receiptController.listSubmissions);

// ── Scan config update (storeMiddleware) ──────────────────────────────────────
router.put("/scan-config", storeMiddleware, receiptController.updateScanConfig);

// ── Portal routes (authMiddleware — admin portal user JWT) ────────────────────
// These must be BEFORE /:submissionId/* routes to avoid Express param conflicts
router.get("/portal/stores", authMiddleware, receiptController.listPortalStores);
router.get("/portal/submissions", authMiddleware, receiptController.listPortalSubmissions);
router.put("/portal/scan-config/:storeId", authMiddleware, receiptController.updatePortalScanConfig);
router.get("/portal/item-analytics", authMiddleware, receiptController.getItemAnalytics);
router.post("/portal/:submissionId/approve", authMiddleware, receiptController.approvePortalSubmission);
router.post("/portal/:submissionId/reject", authMiddleware, receiptController.rejectPortalSubmission);
router.post("/portal/:submissionId/reverse", authMiddleware, receiptController.reversePortalSubmission);

router.get(
  "/:submissionId/detail",
  storeMiddleware,
  receiptController.getSubmissionDetail
);

router.post("/:submissionId/approve", storeMiddleware, receiptController.approveSubmission);
router.post("/:submissionId/reject", storeMiddleware, receiptController.rejectSubmission);
router.post("/:submissionId/reverse", storeMiddleware, receiptController.reverseSubmission);

module.exports = router;
