// import { Router } from "express";
// import ProductController from "../controllers/productController.js";
// import authMiddleware from "../middlewares/authMiddleware.js";
// import customerMiddleware from "../middlewares/customerMiddleware.js";

// import multer from "multer";

const { Router } = require("express");
const multer = require("multer");
const productController = require("../controllers/productController");
const customerMiddleware = require("../middlewares/customerMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

// const productController = new ProductController();

router.post(
  "/addProduct/:storeId",
  authMiddleware,
  upload.array("images", 5),
  productController.addProduct
);
router.post(
  "/addCategory/:storeId",
  authMiddleware,
  productController.addCategory
);
router.get(
  "/getCategoryS/:storeId",
  authMiddleware,
  productController.getCategory
);
router.get(
  "/getCategoryC/:storeId",
  // customerMiddleware,
  productController.getCategory
);
router.get(
  "/categoriesWithProductCount/:storeId",productController.productCount
);
router.put(
  "/categories/edit/:storeId",productController.editCategory
);
router.delete(
  "/categories/delete/:storeId",productController.deleteCategory
)
router.get("/getProducts/:storeId", productController.getProduct);
router.get("/getProduct/:productId", productController.getSingleProduct);
router.put(
  "/update/:id",
  authMiddleware,
  upload.array("images"),
  productController.editProduct
);
router.delete("/delete/:id", authMiddleware, productController.deleteProduct);

// export default router;
module.exports = router;
