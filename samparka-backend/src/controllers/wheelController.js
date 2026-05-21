const customerModel = require("../models/customerModel");
const redemptionModel = require("../models/redemptionModel");
const WheelSegment = require("../models/wheelSegment");

// Get all active segments
exports.getActiveSegments = async (req, res) => {
  try {
    storeID = req.params.storeID; // Get store ID from request params
    if (!storeID) {
      return res.status(400).json({ message: "Store ID is required" });
    }
    const segments = await WheelSegment.find({
      store: storeID,
      isActive: true,
    }).populate("reward", "name");
    res.json(segments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching segments", error });
  }
};

// Spin the wheel (random reward)
exports.spinWheel = async (req, res) => {
  try {
    const segments = await WheelSegment.find({ isActive: true });
    if (!segments.length) {
      return res.status(404).json({ message: "No active segments available" });
    }

    const randomIndex = Math.floor(Math.random() * segments.length);
    const selected = segments[randomIndex];

    // Optional: Save result to user's reward history here

    res.json({ reward: selected });
  } catch (error) {
    res.status(500).json({ message: "Error spinning wheel", error });
  }
};

exports.getReward = async (req, res) => {
  try {
    const { userId, pendingReward } = req.body;

    if (!userId || !pendingReward) {
      return res
        .status(400)
        .json({ message: "Missing userId or reward info." });
    }

    if (pendingReward.type === "points") {
      const customer = await customerModel.findById(userId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      customer.points += pendingReward.value;
      await customer.save();
    } else if (pendingReward.type === "rewards") {
      const redemption = await redemptionModel.create({
        store: pendingReward.store,
        customer: userId,
        reward: pendingReward.reward._id,
      });

      if (!redemption) {
        return res.status(400).json({ message: "Error creating redemption" });
      }
    }

    return res.status(200).json({
      message: "Reward processed successfully",
    });
  } catch (error) {
    console.error("Error in getReward:", error);
    return res.status(500).json({ message: "Error getting reward", error });
  }
};

// Admin: Create new segment
exports.createSegment = async (req, res) => {
  try {
    const segment = new WheelSegment(req.body);
    const saved = await segment.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: "Error creating segment", error });
  }
};

// Admin: Update segment
exports.updateSegment = async (req, res) => {
  try {
    const updated = await WheelSegment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updated) return res.status(404).json({ message: "Segment not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Error updating segment", error });
  }
};

// Admin: Delete segment
exports.deleteSegment = async (req, res) => {
  try {
    const deleted = await WheelSegment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Segment not found" });
    res.json({ message: "Segment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting segment", error });
  }
};
