const { Router } = require("express");
const orderController = require("../controllers/orderController");
// const userMiddleware = require("../middlewares/")
const multer = require("multer");

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", upload.single("image"), orderController.makeOrder);
router.get("/:storeId", orderController.getOrder);
router.put("/status/:storeId", orderController.updateOrderStatus);
router.delete("/status/:orderId", orderController.deleteOrderStatus);
router.put("/update/:orderId", orderController.updateOrderDetails);
module.exports = router;
