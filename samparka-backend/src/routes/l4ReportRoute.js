const express = require("express");
const router = express.Router();
const adminOrStoreMiddleware = require("../middlewares/adminOrStoreMiddleware");
const l4ReportController = require("../controllers/l4ReportController");

// Routes require admin OR store authentication (store owners can view their own reports)

// Get settlement report (JSON)
router.get(
  "/settlement/:storeId",
  adminOrStoreMiddleware,
  l4ReportController.getSettlementReport
);

// Export settlement report as CSV
router.get(
  "/settlement/:storeId/export/csv",
  adminOrStoreMiddleware,
  l4ReportController.exportSettlementCSV
);

// Export settlement report as PDF
router.get(
  "/settlement/:storeId/export/pdf",
  adminOrStoreMiddleware,
  l4ReportController.exportSettlementPDF
);

module.exports = router;
