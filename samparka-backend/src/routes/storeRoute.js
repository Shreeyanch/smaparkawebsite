// import { Router } from "express";
// import StoreController from "../controllers/storeController.js";
// import adminMiddleware from "../middlewares/adminMiddleware.js";
// import authMiddleware from "../middlewares/authMiddleware.js";
// import multer from "multer";
// import MailSMSController from "../controllers/mailSMSController.js";
const { Router } = require("express");
const storeController = require("../controllers/storeController");
const adminMiddleware = require("../middlewares/adminMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const mailSMSController = require("../controllers/mailSMSController");
const storeMiddleware = require("../middlewares/storeMiddleware");
const customerController = require("../controllers/customerController");
const reservationSettingController = require("../controllers/reservationSettingController");
const notificationController = require("../controllers/notificationController");
const impactController = require("../controllers/impactController");

const router = new Router();

// const storeController = new StoreController();
// const mailSMSController = new MailSMSController();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//ADMIN CONTROL
router.get("/", adminMiddleware, storeController.getAllStores);
router.delete("/deleteStore", adminMiddleware, storeController.deleteStore);

// First-time store creation for onboarding (user self-service)
router.post(
  "/createFirstStore",
  authMiddleware,
  upload.fields([{ name: "logo", maxCount: 1 }]),
  storeController.createFirstStore
);

router.post(
  "/addStore",
  adminMiddleware,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "frontLogo", maxCount: 1 },
  ]),
  storeController.createStore
);
router.put(
  "/editStore",
  authMiddleware,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "frontLogo", maxCount: 1 },
    { name: "qrStandBg", maxCount: 1 },
  ]),
  storeController.editStore
);
router.put(
  "/editServices/:storeID",
  adminMiddleware,
  storeController.editStoreServices
);
router.get("/getOutlets/:storeID", storeController.getOutlets);
router.get("/resolveMapLink", storeController.resolveMapLink);
router.post(
  "/createOutlet/:storeID",
  adminMiddleware,
  storeController.createOutlet
);
router.put(
  "/editOutlet/:outletId",
  adminMiddleware,
  storeController.editOutlet
);
router.delete(
  "/deleteOutlet/:outletId",
  adminMiddleware,
  storeController.deleteOutlet
);
router.put(
  "/editDelivery/:storeID",
  adminMiddleware,
  storeController.editDelivery
);

//USER CONTROL
router.get("/myStores", authMiddleware, storeController.getMyStore);
router.get(
  "/reservation/:storeID",
  authMiddleware,
  storeController.getReservation
);
router.get(
  "/reservationS/:storeID",
  storeMiddleware,
  storeController.getReservation
);
router.get(
  "/reservation-settings",
  // authMiddleware,
  storeController.getReservationSettings
);
router.post(
  "/reservation-settings",
  authMiddleware,
  upload.array("images"),
  storeController.reservationSettings
);
router.get(
  "/reservationService/:storeID",
  authMiddleware,
  reservationSettingController.getServices
);
router.post(
  "/reservationService/:storeID",
  authMiddleware,
  upload.array("images"),
  reservationSettingController.createService
);
router.put(
  "/reservationService/:storeID/:serviceID",
  authMiddleware,
  upload.array("images"),
  reservationSettingController.updateService
);
router.delete(
  "/reservationService/:storeID/:serviceID",
  authMiddleware,
  reservationSettingController.deleteService
);

router.post("/manualReservation/:storeURL", storeController.manualReservation);
router.put("/reservation/confirm/:id", storeController.confirmReservation);
router.put("/reservation/cancel/:id", storeController.cancelReservation);
router.put("/reservation/noShow/:id", storeController.noShow);
router.put("/reservation/completed/:id", storeController.completedReservation);

// PIN verification with lockout middleware for security
const { checkPinLockout } = require("../middlewares/pinLockoutMiddleware.js");
router.post("/verifyPIN/:storeURL", checkPinLockout, storeController.verifyPIN);
router.post("/changePIN/:storeID", storeController.changePIN);
router.post(
  "/changeCustomerCode/:storeID",
  authMiddleware,
  storeController.changeCustomerCode
);
router.get("/checkStore/:storeURL", storeController.checkStore);

// ro

router.put(
  "/changePoints/:storeURL",
  storeMiddleware,
  storeController.changePoints
);
router.get(
  "/getPointsDetail/:storeURL",
  storeMiddleware,
  storeController.getPointsDetail
);
router.put(
  "/changeOutletPoints/:storeID",
  storeMiddleware,
  storeController.changeOutletsPoints
);
router.get(
  "/getOutletPointsDetail/:storeID",
  storeMiddleware,
  storeController.getOutletsPointsDetail
);
router.post(
  "/createPrintPoints/:storeID",
  storeMiddleware,
  storeController.createPrintPoints
);

// for email setting
router.put("/config/:storeID", authMiddleware, storeController.configSMTP);
router.post("/testSMTP/:storeID", authMiddleware, storeController.testSMTP);
router.get(
  "/getMessage/:storeID",
  authMiddleware,
  mailSMSController.getConfigMessage
);
router.put(
  "/configMessage/:storeID",
  authMiddleware,
  mailSMSController.configMessage
);

// for sms setting
router.put("/configSMS/:storeID", authMiddleware, storeController.configSMS);
router.get("/getSMS/:storeID", authMiddleware, mailSMSController.getConfigSMS);
router.put(
  "/configSMSMessage/:storeID",
  authMiddleware,
  mailSMSController.configSMSMessage
);
router.put(
  "/configNotifications/:storeID",
  authMiddleware,
  mailSMSController.configNotifications
);
router.post(
  "/initializeAllNotifications",
  authMiddleware,
  mailSMSController.initializeAllNotifications
);
router.post(
  "/send-notification/:userId",
  authMiddleware,
  notificationController.sendNotification
);
router.post(
  "/sendNotifications/multiple",
  authMiddleware,
  notificationController.multipleNotification
);
router.get(
  "/notifications/:storeId",
  authMiddleware,
  notificationController.getNotifications
);

router.get(
  "/getLoyaltyCard/:storeId",
  authMiddleware,
  storeController.getLoyaltyCardDetail
);
router.put(
  "/customizeLoyaltyCard",
  authMiddleware,
  upload.any(), // accepts customStamp, cardImage, and per-tier tierStamp_N / tierCardImage_N fields
  storeController.customizeLoyaltyCard
);

router.put(
  "/changeStoreStatus/:storeId",
  authMiddleware,
  storeController.editStoreStatus
);
router.get(
  "/getCustomers/:storeID",
  authMiddleware,
  storeController.getCustomers
);
router.get(
  "/getCustomersS/:storeID",
  storeMiddleware,
  storeController.getCustomers
);
router.get(
  "/leaderboardByPeriod/:storeID",
  authMiddleware,
  storeController.getLeaderboardByPeriod
);
router.post(
  "/createCustomer/:storeID",
  authMiddleware,
  storeController.createCustomer
);
router.post(
  "/createCustomerS/:storeID",
  storeMiddleware,
  storeController.createCustomer
);
router.delete(
  "/deleteCustomer/:customerID",
  authMiddleware,
  storeController.deleteCustomer
);
router.put(
  "/editCustomer/:customerId",
  authMiddleware,
  storeController.editCustomer
);
router.put(
  "/editCustomerS/:customerId",
  storeMiddleware,
  storeController.editCustomerByStore
);
// router.put("/givePoints/:storeID", authMiddleware, storeController.givePoints);
router.get("/getRedeemedRewards/:storeURL", storeController.getRedeemedRewards);
router.put("/claimReward/:storeURL", storeController.claimReward);
router.post(
  "/claimRewardForCustomer/:storeURL",
  storeMiddleware,
  storeController.claimRewardForCustomer
);

router.post(
  "/awardPoints/:customerId",
  authMiddleware,
  storeController.awardPoints
);
router.post(
  "/awardPointsS/:customerId",
  storeMiddleware,
  storeController.awardPoints
);
router.post(
  "/test-notification",
  authMiddleware,
  storeController.testNotification
);
router.get(
  "/getPointsHistoryStore/:storeId",
  storeMiddleware,
  storeController.fetchPointsHistory
);
router.delete(
  "/undoPointsHistory/:entryId",
  storeMiddleware,
  storeController.undoPointsHistoryEntry
);
router.get(
  "/getPointsHistoryDash/:storeId",
  authMiddleware,
  storeController.fetchPointsHistory
);
router.put(
  "/updatePoints/:customerId",
  authMiddleware,
  storeController.editUserPoints
);
router.put(
  "/editUserTier/:customerId",
  authMiddleware,
  storeController.editUserTier
);
router.put(
  "/updatePointsS/:customerId",
  storeMiddleware,
  storeController.editUserPoints
);

router.get(
  "/getPointsHistory/:customerId",
  authMiddleware,
  storeController.getPointsHistory
);

router.put(
  "/changeDeliveryCharge/:storeId",
  authMiddleware,
  storeController.changeDeliveryCharge
);

router.post("/import", upload.single("file"), storeController.importCSV);

// routes for ongoing offers //
router.post(
  "/createOffer/:storeId",
  authMiddleware,
  upload.single("image"),
  storeController.createOffer
);
router.put(
  "/offer/:id",
  authMiddleware,
  upload.single("image"),
  storeController.updateOffer
);
router.get("/offers/:id", authMiddleware, storeController.getOfferById);
router.get(
  "/offers/store/:storeId",
  authMiddleware,
  storeController.getOffersByStore
);
router.delete("/offer/:id", authMiddleware, storeController.deleteOffer);

// Impact / ROI dashboard
router.get("/impact/:storeId", authMiddleware, impactController.getImpact);

// export default router;
module.exports = router;
