const express = require("express");
const router = express.Router();
const wheelController = require("../controllers/wheelController");

// Public routes
router.get("/:storeID", wheelController.getActiveSegments);
router.post("/spin", wheelController.spinWheel);
router.post("/getReward", wheelController.getReward);

// Admin routes (add auth middleware later)
router.post("/", wheelController.createSegment);
router.put("/:id", wheelController.updateSegment);
router.delete("/:id", wheelController.deleteSegment);

module.exports = router;
