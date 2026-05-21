// import { Router } from "express";
// import customerMiddleware from "../middlewares/customerMiddleware.js";
// import CustomerController from "../controllers/customerController.js";
const { Router } = require("express");
const customerMiddleware = require("../middlewares/customerMiddleware");
const customerController = require("../controllers/customerController");
const storeController = require("../controllers/storeController");

const router = Router();

// const customerController = new CustomerController();

router.get("/check-phone/:storeURL", customerController.checkPhoneAvailability);
router.get("/check-email/:storeURL", customerController.checkEmailAvailability);
router.get("/", customerMiddleware, customerController.getCustomerData);
router.put("/edit", customerMiddleware, customerController.edit);
router.get(
  "/getCustomers/:storeID",
  customerMiddleware,
  customerController.getCustomers
);
router.post("/register/:storeURL", customerController.register);

// OTP routes
router.post("/send-otp/:storeURL", customerController.sendCustomerOTP);
router.post("/send-email-otp/:storeURL", customerController.sendCustomerEmailOTP);
router.post("/verify-and-register/:storeURL", customerController.verifyOTPAndRegister);

router.get(
  "/loyaltyCard/:storeURL",
  customerMiddleware,
  customerController.getLoyaltyCardData
);

router.put(
  "/getPoints/:pointsId",
  customerMiddleware,
  customerController.getPoints
);
router.put(
  "/getOutletPoints/:storeId/:outletId",
  customerMiddleware,
  customerController.getOutletPoints
);
router.put(
  "/getPrintPoints/:pointsId",
  customerMiddleware,
  customerController.getPrintPoints
);

router.get("/store/:storeURL", customerController.getStoreData);
router.get("/myRewards", customerMiddleware, customerController.getMyRewards);
router.put(
  "/redeemReward/:rewardID",
  customerMiddleware,
  customerController.redeemReward
);
router.put(
  "/redeemL3Reward/:rewardID",
  customerMiddleware,
  customerController.redeemL3Reward
);
router.put(
  "/redeemL4Reward/:rewardID",
  customerMiddleware,
  customerController.redeemL4Reward
);
router.put(
  "/redeemL6Reward/:rewardID",
  customerMiddleware,
  customerController.redeemL6Reward
);

//reservations
router.get(
  "/reservation-settings",
  customerMiddleware,
  storeController.getReservationSettings
);
router.get(
  "/reservation/:storeID",
  customerMiddleware,
  storeController.getReservation
);
router.get(
  "/getReservations",
  customerMiddleware,
  customerController.getReservations
);
router.post(
  "/reservation/:storeURL",
  customerMiddleware,
  customerController.reservation
);

// NOTIFICATIONS
router.get(
  "/customer-notifications/:customerId",
  customerMiddleware,
  customerController.getNotifications
);
router.put(
  "/mark-notification-read/:notificationId/:customerId",
  customerMiddleware,
  customerController.markNotificationAsRead
);
router.get(
  "/checkNotificationSubscription/:customerId",
  customerMiddleware,
  customerController.checkNotificationSubscription
);

router.post(
  "/check-proximity",
  customerMiddleware,
  customerController.checkLocation
);

// point history
router.get(
  "/pointsHistory",
  customerMiddleware,
  customerController.getPointsHistory
);

// on going offers fetching
router.get(
  "/offers/:storeId",
  customerMiddleware,
  storeController.getOffersByStore
);

// export default router;
module.exports = router;
