const { Router } = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const adminOrStoreMiddleware = require("../middlewares/adminOrStoreMiddleware");
const visitAnalyticsController = require("../controllers/visitAnalyticsController");

const router = new Router();

// Summary dashboard data
router.get(
  "/summary/:storeId",
  adminOrStoreMiddleware,
  visitAnalyticsController.getVisitSummary
);

// Customer segmentation data
router.get(
  "/segments/:storeId",
  adminOrStoreMiddleware,
  visitAnalyticsController.getCustomerSegments
);

// Last visit distribution
router.get(
  "/lastVisitDistribution/:storeId",
  adminOrStoreMiddleware,
  visitAnalyticsController.getLastVisitDistribution
);

// Retention metrics
router.get(
  "/retention/:storeId",
  adminOrStoreMiddleware,
  visitAnalyticsController.getRetentionMetrics
);

// Outlet performance
router.get(
  "/outlets/:storeId",
  adminOrStoreMiddleware,
  visitAnalyticsController.getOutletPerformance
);

// Visit trends over time
router.get(
  "/trends/:storeId",
  adminOrStoreMiddleware,
  visitAnalyticsController.getVisitTrends
);

// Points collected by time period
router.get(
  "/pointsCollected/:storeId",
  adminOrStoreMiddleware,
  visitAnalyticsController.getPointsCollected
);

// Segment-filtered customer list
router.get(
  "/customers/:storeId",
  adminOrStoreMiddleware,
  visitAnalyticsController.getCustomersBySegment
);

// Individual customer visit history
router.get(
  "/customer/:customerId",
  adminOrStoreMiddleware,
  visitAnalyticsController.getCustomerVisitHistory
);

// Backfill endpoint (admin only)
router.post(
  "/backfill/:storeId",
  authMiddleware,
  visitAnalyticsController.backfillAnalytics
);

// TEST endpoint - Manual analytics update
router.post(
  "/test/update",
  authMiddleware,
  visitAnalyticsController.testUpdateAnalytics
);

// DELETE endpoint - Delete outlet visit history (admin or store owner only)
router.delete(
  "/outlet/:storeId/:outletId/visit-history",
  authMiddleware,
  visitAnalyticsController.deleteOutletVisitHistory
);

module.exports = router;
