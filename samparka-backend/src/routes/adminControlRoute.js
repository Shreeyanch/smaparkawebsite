const { Router } = require("express");
const adminMiddleware = require("../middlewares/adminMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const storeMiddleware = require("../middlewares/storeMiddleware");
const adminControlController = require("../controllers/adminControlController");

const router = Router();

// Admin-only routes
router.get("/events", adminMiddleware, adminControlController.getEvents);
router.post("/events/sendNow", adminMiddleware, adminControlController.sendEventNow);
router.post("/events", adminMiddleware, adminControlController.createEvent);
router.put("/events/:eventId", adminMiddleware, adminControlController.updateEvent);
router.delete("/events/:eventId", adminMiddleware, adminControlController.deleteEvent);
router.post("/sendDailyReport",       adminMiddleware, adminControlController.triggerDailyReport);
router.get("/reportSchedule",         adminMiddleware, adminControlController.getReportSchedule);
router.put("/reportSchedule",         adminMiddleware, adminControlController.updateReportSchedule);
router.get("/expiryNotificationSchedule", adminMiddleware, adminControlController.getExpiryNotificationSchedule);
router.put("/expiryNotificationSchedule", adminMiddleware, adminControlController.updateExpiryNotificationSchedule);
router.post("/sendExpiryNotificationNow", adminMiddleware, adminControlController.sendExpiryNotificationNow);

// Store owner route — authenticated store can fetch events for its store
router.get("/events/store/:storeId", storeMiddleware, adminControlController.getStoreEvents);

module.exports = router;
