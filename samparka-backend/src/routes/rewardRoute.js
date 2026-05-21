// import { Router } from "express";
// import authMiddleware from "../middlewares/authMiddleware.js";
// import RewardController from "../controllers/rewardController.js";
// import multer from "multer";
const { Router } = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const rewardController = require("../controllers/rewardController");
const multer = require("multer");

const router = new Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// const rewardController = new RewardController();

router.post(
  "/createReward",
  upload.single("image"),
  authMiddleware,
  rewardController.createReward
);
router.post(
  "/createRewardThreshold",
  upload.single("image"),
  authMiddleware,
  rewardController.createRewardThreshold
);
router.post(
  "/createConstantReward",
  upload.single("image"),
  authMiddleware,
  rewardController.createConstantReward
);
router.post(
  "/createL6Reward",
  upload.any(),
  authMiddleware,
  rewardController.createL6Reward
);
router.get("/getRewards/:storeId", rewardController.getRewards);
router.delete(
  "/deleteReward/:rewardID",
  authMiddleware,
  rewardController.deleteReward
);
router.put(
  "/editReward/:storeId",
  upload.any(),
  authMiddleware,
  (req, res) => {
    rewardController.editReward(req, res);
  }
);
router.put(
  "/editRewardThreshold",
  upload.single("image"),
  authMiddleware,
  rewardController.editRewardThreshold
);
router.delete(
  "/deleteRewardThreshold",
  authMiddleware,
  rewardController.deleteRewardThreshold
);
router.put(
  "/editConstantReward/:storeId",
  upload.single("image"),
  authMiddleware,
  rewardController.editConstantReward
);
router.get(
  "/getAnalytics/:storeId",
  authMiddleware,
  rewardController.rewardAnalytics
);
router.get(
  "/getCustomerAnalytics/:storeId",
  authMiddleware,
  rewardController.customerAnalytics
);
router.put(
  "/reorderL6Rewards",
  authMiddleware,
  rewardController.reorderL6Rewards
);
router.post(
  "/duplicateReward/:rewardId",
  authMiddleware,
  rewardController.duplicateReward
);

// export default router;
module.exports = router;
