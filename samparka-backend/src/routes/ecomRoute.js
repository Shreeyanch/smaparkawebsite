const { Router } = require("express");
const multer = require("multer");

const upload= multer({storage:multer.memoryStorage()});
const authMiddleware = require("../middlewares/authMiddleware");
const ecommerceController =
  require("../controllers/ecommerceController");

const router = Router();

router.post(
  "/store/info/:storeId",
  authMiddleware,
  upload.single("image"),
  ecommerceController.saveOrEditInfo
);
module.exports = router;