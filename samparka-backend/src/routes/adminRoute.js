// import { Router } from "express";
// import adminMiddleware from "../middlewares/adminMiddleware.js";
// import AdminController from "../controllers/adminController.js";
const { Router } = require("express");
const adminMiddleware = require("../middlewares/adminMiddleware");
const adminController = require("../controllers/adminController");

const router = Router();

// const adminController = new AdminController();

router.post("/createUser", adminMiddleware, adminController.registerUser);
router.get("/getUsers", adminMiddleware, adminController.fetchUsers);
router.get("/getMessages", adminMiddleware, adminController.fetchMessages);
router.put("/changeSMSFee", adminMiddleware, adminController.changeSMSFee);

// user control
router.put(
  "/changeUserStatus/:userId/:status",
  adminMiddleware,
  adminController.changeUserStatus
);
router.put("/editUser/:userId", adminMiddleware, adminController.editUser);
router.delete(
  "/deleteUser/:userId",
  adminMiddleware,
  adminController.deleteUser
);
router.post("/forceLogout/:userId", adminMiddleware, adminController.forceLogoutUser);

router.put(
  "/changeMessageStatus",
  adminMiddleware,
  adminController.changeMessageStatus
);

// Backup script routes
router.post(
  "/runBackup",
  adminMiddleware,
  adminController.runBackupScript
);

// Restore script routes
router.post(
  "/runRestore",
  adminMiddleware,
  adminController.runRestoreScript
);

router.get(
  "/listBackups",
  adminMiddleware,
  adminController.listBackups
);

router.get(
  "/storeActivity",
  adminMiddleware,
  adminController.getStoreActivity
);

router.get(
  "/storeLastActivity/:storeId",
  adminMiddleware,
  adminController.getStoreLastActivity
);

// export default router;
module.exports = router;
