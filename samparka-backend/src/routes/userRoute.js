// import { Router } from "express";
// import UserController from "../controllers/userController.js";
// import authMiddleware from "../middlewares/authMiddleware.js";
const { Router } = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = Router();

// const userController = new UserController();

router.post("/login", userController.login);
router.post("/forgotPassword", userController.forgotPassword);
router.post("/resetPassword/:token", userController.changePassword);
router.post("/scheduleMessage", authMiddleware, userController.scheduleMessage);
router.get("/getMessages", authMiddleware, userController.fetchMessageHistory);
router.get("/getSMSFee", authMiddleware, userController.getSMSFee);

// export default router;
module.exports = router;
