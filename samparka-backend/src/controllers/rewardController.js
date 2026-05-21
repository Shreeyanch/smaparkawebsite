// import rewardModel from "../models/rewardModel.js";
// import storeModel from "../models/storeModel.js";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import {
//   S3Client,
//   GetObjectCommand,
//   PutObjectCommand,
//   DeleteObjectCommand,
// } from "@aws-sdk/client-s3";
const rewardModel = require("../models/rewardModel");
const storeModel = require("../models/storeModel");
const pointsHistoryModel = require("../models/pointsHistoryModel.js");
const redemptionModel = require("../models/redemptionModel.js");
const customerModel = require("../models/customerModel.js");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} = require("@aws-sdk/client-s3");
const s3 = require("../config/s3Config.js");
const { default: mongoose } = require("mongoose");
const path = require("path");
const { BetaAnalyticsDataClient } = require("@google-analytics/data");

const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: path.join(__dirname, "../../google-analytics/credentials.json"),
});

const ensureMissionMetadata = (missions = []) => {
  const nowIso = new Date().toISOString();
  return (Array.isArray(missions) ? missions : []).map((mission) => ({
    ...mission,
    _missionId: mission?._missionId || new mongoose.Types.ObjectId().toString(),
    createdAt: mission?.createdAt || nowIso,
    updatedAt: nowIso,
  }));
};

class RewardController {
  async createReward(req, res) {
    try {
      const { storeId } = req.query;
      const { name, expiry, validity, points, evergreen } = req.body;

      if (!name || !validity || !points) {
        return res.json({ success: false, message: "All fields are required" });
      }
      const store = await storeModel.findById(storeId);
      if (!store) {
        return res.json({ success: false, message: "Cannot find the store" });
      }
      if (req.user._id.equals(store.user[0]) || req.user.role === "admin") {
        const reward = await rewardModel.create({
          store: storeId,
          ...req.body,
        });
        if (req.file) {
          // S3 upload
          const imageName = Date.now().toString() + "-" + req.file.originalname;
          const putObjectParams = {
            Bucket: "samparka",
            Key: imageName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
          };
          const putCommand = new PutObjectCommand(putObjectParams);
          await s3.send(putCommand);

          reward.template.image = imageName;
          await reward.save();
        }

        return res.json({
          success: true,
          message: "Reward Saved",
          reward,
        });
      } else {
        return res.json({ success: false, message: "You don't have access" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }

  async createConstantReward(req, res) {
    try {
      const { storeId } = req.query;
      const { name, description, tier, redeemable, redeemableTimes, pointCost, validity, evergreen } = req.body;
      console.log(req.body);

      if (!name) {
        return res.json({ success: false, message: "Reward name is required" });
      }

      const store = await storeModel.findById(storeId);
      if (!store) {
        return res.json({ success: false, message: "Cannot find the store" });
      }

      const constantFormats = ["L3", "L4", "L34HA"];
      const isConstantFormat = constantFormats.includes(store.loyaltyCard?.format);

      // Validate pointCost for L4 stores only (L3/L34HA are tier-based and don't use point cost)
      if (store.loyaltyCard?.format === "L4" && (!pointCost || Number(pointCost) <= 0)) {
        return res.json({
          success: false,
          message: "Point cost is required and must be greater than 0",
        });
      }

      if (req.user._id.equals(store.user[0]) || req.user.role === "admin") {
        // Determine reward type: L4 uses point-based redemption ("l4"), L3/L34HA are tier perks ("constant")
        const rewardType = store.loyaltyCard?.format === "L4" ? "l4" : "constant";

        // Build reward object
        const rewardData = {
          store: storeId,
          name,
          description: description || "",
          type: rewardType,
          ...(tier ? { tier } : {}),
          // For L4 rewards, default redeemable to true if not explicitly set
          redeemable: redeemable !== undefined ? redeemable : (isConstantFormat ? true : false),
          ...(redeemableTimes !== undefined ? { redeemableTimes } : {}),
          ...(validity ? { validity } : {}),
          ...(evergreen !== undefined ? { evergreen } : {}),
          ...(isConstantFormat && pointCost ? { pointCost: Number(pointCost) } : {}),
        };

        // Upload image to S3 if provided
        if (req.file) {
          const imageName = Date.now().toString() + "-" + req.file.originalname;
          const putObjectParams = {
            Bucket: "samparka",
            Key: imageName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
          };
          const putCommand = new PutObjectCommand(putObjectParams);
          await s3.send(putCommand);
          rewardData.image = imageName;
        }

        const reward = await rewardModel.create(rewardData);
        return res.json({
          success: true,
          message: "Reward Created",
          reward,
        });
      } else {
        return res.json({ success: false, message: "You don't have access" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }

  async createL6Reward(req, res) {
    try {
      const { storeId } = req.query;
      const { name, description, tier, pointCost, mission, isTierBased, isPointBased, isMissionBased, isStreakBased, streakGoal, streakIcon, validity, evergreen, l6Missions } = req.body;
      const tierBasedEnabled = isTierBased === "true" || isTierBased === true;
      const pointBasedEnabled = isPointBased === "true" || isPointBased === true;
      const missionBasedEnabled = isMissionBased === "true" || isMissionBased === true;
      const streakBasedEnabled = isStreakBased === "true" || isStreakBased === true;
      const enabledCategoryCount = [tierBasedEnabled, pointBasedEnabled, missionBasedEnabled, streakBasedEnabled].filter(Boolean).length;

      if (!name) {
        return res.json({ success: false, message: "Reward name is required" });
      }

      const store = await storeModel.findById(storeId);
      if (!store) {
        return res.json({ success: false, message: "Cannot find the store" });
      }

      if (store.loyaltyCard?.format !== "L6") {
        return res.json({ success: false, message: "This endpoint is only for L6 format stores" });
      }

      if (enabledCategoryCount !== 1) {
        return res.json({ success: false, message: "Please select exactly one reward category" });
      }

      if (pointBasedEnabled && (!pointCost || Number(pointCost) <= 0)) {
        return res.json({ success: false, message: "Point cost must be greater than 0" });
      }

      if (tierBasedEnabled && !tier) {
        return res.json({ success: false, message: "Please select a tier for tier-based reward" });
      }

      if (missionBasedEnabled && l6Missions) {
        try {
          const parsedMissions = JSON.parse(l6Missions);
          if (Array.isArray(parsedMissions) && parsedMissions.length > 0) {
            // Validate each mission
            for (const m of parsedMissions) {
              if (m.missionType === "multiItem") {
                if (!Array.isArray(m.items) || m.items.length === 0) {
                  return res.status(400).json({ success: false, message: `Multi-item mission "${m.title || ""}" must have at least one item` });
                }
                for (const item of m.items) {
                  if (!item.itemName || typeof item.itemName !== "string" || !item.itemName.trim()) {
                    return res.status(400).json({ success: false, message: "Each mission item must have a non-empty name" });
                  }
                  if (!item.goal || Number(item.goal) < 1) {
                    return res.status(400).json({ success: false, message: `Item "${item.itemName}" must have a goal of at least 1` });
                  }
                }
              } else {
                // Simple mission validation
                if (!m.goal || Number(m.goal) < 1) {
                  return res.status(400).json({ success: false, message: `Mission "${m.title || ""}" must have a goal of at least 1` });
                }
              }
            }
            const normalizedMissions = ensureMissionMetadata(parsedMissions);
            store.loyaltyCard = store.loyaltyCard || {};
            store.loyaltyCard.l6Config = {
              ...(store.loyaltyCard.l6Config || {}),
              missions: normalizedMissions,
            };
            await store.save();
          }
        } catch (parseError) {
          console.error("❌ Invalid l6Missions payload:", parseError);
          return res.status(400).json({ success: false, message: "Invalid mission configuration" });
        }
      }

      if (req.user._id.equals(store.user[0]) || req.user.role === "admin") {
        let parsedL6Missions = [];
        if (missionBasedEnabled && l6Missions) {
          try { parsedL6Missions = ensureMissionMetadata(JSON.parse(l6Missions)); } catch { parsedL6Missions = []; }
        }

        const rewardData = {
          store: storeId,
          name,
          description: description || "",
          type: "l6",
          isTierBased: tierBasedEnabled,
          isPointBased: pointBasedEnabled,
          isMissionBased: missionBasedEnabled,
          isStreakBased: streakBasedEnabled,
          ...(tier ? { tier } : {}),
          ...(pointCost ? { pointCost: Number(pointCost) } : {}),
          ...(streakBasedEnabled && streakGoal ? { streakGoal: Number(streakGoal) } : {}),
          ...(streakBasedEnabled && streakIcon ? { streakIcon } : {}),
          ...(missionBasedEnabled && parsedL6Missions.length > 0 ? { l6Missions: parsedL6Missions } : {}),
          redeemable: true,
          ...(validity ? { validity } : {}),
          ...(evergreen !== undefined ? { evergreen } : {}),
        };

        // Handle main reward image
        const mainImageFile = (req.files || []).find((f) => f.fieldname === "image");
        if (mainImageFile) {
          const imageName = Date.now().toString() + "-" + mainImageFile.originalname;
          await s3.send(new PutObjectCommand({
            Bucket: "samparka",
            Key: imageName,
            Body: mainImageFile.buffer,
            ContentType: mainImageFile.mimetype,
          }));
          rewardData.image = imageName;
        }

        // Handle streak icon image upload
        const streakIconFile = (req.files || []).find((f) => f.fieldname === "streakIconImage");
        if (streakBasedEnabled && streakIconFile) {
          const iconKey = Date.now().toString() + "-streakicon-" + streakIconFile.originalname;
          await s3.send(new PutObjectCommand({
            Bucket: "samparka",
            Key: iconKey,
            Body: streakIconFile.buffer,
            ContentType: streakIconFile.mimetype,
          }));
          rewardData.streakIcon = iconKey;
        }

        // Handle per-mission background images
        if (missionBasedEnabled && rewardData.l6Missions) {
          for (let i = 0; i < rewardData.l6Missions.length; i++) {
            const missionFile = (req.files || []).find((f) => f.fieldname === `missionImage_${i}`);
            if (missionFile) {
              const missionImageName = Date.now().toString() + "-mission-" + missionFile.originalname;
              await s3.send(new PutObjectCommand({
                Bucket: "samparka",
                Key: missionImageName,
                Body: missionFile.buffer,
                ContentType: missionFile.mimetype,
              }));
              rewardData.l6Missions[i].backgroundImage = missionImageName;
            }
          }
          // Also update store config missions with background images
          if (store.loyaltyCard?.l6Config?.missions) {
            store.loyaltyCard.l6Config.missions = ensureMissionMetadata(rewardData.l6Missions);
            await store.save();
          }
        }

        const reward = await rewardModel.create(rewardData);
        return res.json({
          success: true,
          message: "L6 Reward Created",
          reward,
        });
      } else {
        return res.json({ success: false, message: "You don't have access" });
      }
    } catch (error) {
      console.error("❌ Error creating L6 reward:", error);
      return res.status(500).send(error);
    }
  }

  async getRewards(req, res) {
    try {
      const { storeId } = req.params;
      const store = await storeModel.findById(storeId);
      if (!store) {
        return res.json({ success: false, message: "Cannot find the store" });
      }
      const rewards = await rewardModel
        .find({
          store: store._id,
          $or: [
            { type: { $in: ["standard", "constant", "l4", "l6"] } },
            { type: { $exists: false } }
          ]
        })
        .populate("store", "name")
        .sort({ priority: 1, createdAt: 1 });
      for (const reward of rewards) {
        if (!reward.template?.image || reward.template.image.startsWith("https://")) {
          continue;
        }
        const getObjectParams = {
          Bucket: "samparka",
          Key: reward.template.image,
        };
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        reward.template.image = url;
      }
      for (const reward of rewards) {
        if (reward.type == "standard") {
          continue;
        }
        if (!reward.image || reward.image.startsWith("https://")) {
          continue;
        }
        const getObjectParams = {
          Bucket: "samparka",
          Key: reward.image,
        };
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        reward.image = url;
      }
      
      // Sign mission backgroundImage URLs inside l6Missions
      for (const reward of rewards) {
        if (reward.type !== "l6" || !Array.isArray(reward.l6Missions)) continue;
        for (const mission of reward.l6Missions) {
          if (mission.backgroundImage && !mission.backgroundImage.startsWith("https://")) {
            try {
              const command = new GetObjectCommand({ Bucket: "samparka", Key: mission.backgroundImage });
              mission.backgroundImage = await getSignedUrl(s3, command, { expiresIn: 3600 });
            } catch {}
          }
        }
      }

      // Sign streakIcon if it's an S3 key (not a signed URL and longer than an emoji)
      for (const reward of rewards) {
        if (reward.type !== "l6" || !reward.streakIcon) continue;
        // Emojis are short (≤4 chars); S3 keys are long filenames — skip emojis, sign everything else
        if (reward.streakIcon.length > 4 && !reward.streakIcon.startsWith("https://")) {
          try {
            const command = new GetObjectCommand({ Bucket: "samparka", Key: reward.streakIcon });
            reward.streakIcon = await getSignedUrl(s3, command, { expiresIn: 3600 });
          } catch (err) {
            console.error("❌ Failed to sign streakIcon URL:", err.message);
          }
        }
      }

      // Get L5 rewards from Reward collection
      const l5Rewards = await rewardModel
        .find({ store: store._id, type: "l5" })
        .sort({ threshold: 1 });
      
      // Generate signed URLs for L5 reward images
      console.log('[getRewards] L5 Rewards count from collection:', l5Rewards.length);
      
      for (const l5Reward of l5Rewards) {
        console.log('[getRewards] L5 Reward:', l5Reward.name, 'Image:', l5Reward.image);
        if (l5Reward.image && !l5Reward.image.startsWith("https://")) {
          try {
            const getObjectParams = {
              Bucket: "samparka",
              Key: l5Reward.image,
            };
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
            console.log('[getRewards] Generated signed URL for:', l5Reward.name);
            l5Reward.image = url;
          } catch (err) {
            console.log("[getRewards] Error generating signed URL for L5 reward image:", err);
          }
        }
      }
      
      // Build l5Config response with rewards from Reward collection
      const l5Config = store.loyaltyCard?.l5Config ? {
        ...store.loyaltyCard.l5Config.toObject(),
        rewards: l5Rewards.map(r => ({
          _id: r._id,
          threshold: r.threshold,
          rewardType: r.rewardType,
          rewardName: r.name,
          description: r.description,
          discountPercentage: r.discountPercentage,
          image: r.image,
          validity: r.validity,
          evergreen: r.evergreen,
        })),
        redemptionThresholds: l5Rewards.map(r => r.threshold).sort((a, b) => a - b),
      } : null;
      
      console.log('[getRewards] Returning l5Config with', l5Rewards.length, 'rewards');
      return res.json({ success: true, rewards, l5Config });
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }

  async editReward(req, res) {
    try {
      const { rewardId } = req.query;
      const { storeId } = req.params;
      console.log(req.body);
      const store = await storeModel.findById(storeId);
      if (!store) {
        return res.json({ success: false, message: "Cannot find the store" });
      }

      const reward = await rewardModel.findById(rewardId);
      if (!reward) {
        return res.json({ success: false, message: "Cannot find the reward" });
      }

      if (!(req.user._id.equals(store.user[0]) || req.user.role === "admin")) {
        return res.json({ success: false, message: "You don't have access" });
      }

      const isL6 = reward.type === "l6";

      // ── Handle image upload ────────────────────────────────────
      const mainImageFile = (req.files || []).find((f) => f.fieldname === "image");
      if (mainImageFile) {
        const imageName = Date.now().toString() + "-" + mainImageFile.originalname;
        await s3.send(new PutObjectCommand({
          Bucket: "samparka",
          Key: imageName,
          Body: mainImageFile.buffer,
          ContentType: mainImageFile.mimetype,
        }));

        if (isL6) {
          const oldImage = reward.image;
          if (oldImage && !oldImage.startsWith("https://")) {
            try { await s3.send(new DeleteObjectCommand({ Bucket: "samparka", Key: oldImage })); } catch {}
          }
          reward.image = imageName;
        } else {
          const oldLogoKey = reward.template.image;
          if (oldLogoKey && !oldLogoKey.startsWith("https://")) {
            try { await s3.send(new DeleteObjectCommand({ Bucket: "samparka", Key: oldLogoKey })); } catch {}
          }
          reward.template.image = imageName;
        }
        await reward.save();
      }

      // ── Build update data ──────────────────────────────────────
      let updateData;

      if (isL6) {
        const { name, description, validity, evergreen, isTierBased, isPointBased, isMissionBased, isStreakBased, streakGoal, streakIcon, tier, pointCost, l6Missions } = req.body;
        const tierBasedEnabled = isTierBased === "true" || isTierBased === true;
        const pointBasedEnabled = isPointBased === "true" || isPointBased === true;
        const missionBasedEnabled = isMissionBased === "true" || isMissionBased === true;
        const streakBasedEnabled = isStreakBased === "true" || isStreakBased === true;

        updateData = {
          ...(name ? { name } : {}),
          description: description || "",
          isTierBased: tierBasedEnabled,
          isPointBased: pointBasedEnabled,
          isMissionBased: missionBasedEnabled,
          isStreakBased: streakBasedEnabled,
          ...(tierBasedEnabled && tier ? { tier } : {}),
          ...(pointBasedEnabled && pointCost ? { pointCost: Number(pointCost) } : {}),
          ...(streakBasedEnabled && streakGoal ? { streakGoal: Number(streakGoal) } : {}),
          ...(streakBasedEnabled && streakIcon ? { streakIcon } : {}),
          ...(validity ? { validity } : {}),
          ...(evergreen !== undefined ? { evergreen: evergreen === "true" || evergreen === true } : {}),
        };

        // Handle l6Missions — save on reward and update store config
        if (missionBasedEnabled && l6Missions) {
          try {
            const incomingMissions = JSON.parse(l6Missions);
            const existingById = {};
            if (Array.isArray(reward.l6Missions)) {
              for (const m of reward.l6Missions) {
                if (m?._missionId) existingById[m._missionId] = m;
              }
            }
            const parsedMissions = ensureMissionMetadata(incomingMissions).map((m) => ({
              ...m,
              createdAt: existingById[m._missionId]?.createdAt || m.createdAt,
            }));
            if (Array.isArray(parsedMissions) && parsedMissions.length > 0) {
              // Upload per-mission background images
              for (let i = 0; i < parsedMissions.length; i++) {
                const missionFile = (req.files || []).find((f) => f.fieldname === `missionImage_${i}`);
                if (missionFile) {
                  // Delete old mission background image if exists
                  const oldBg = parsedMissions[i].backgroundImage;
                  if (oldBg && !oldBg.startsWith("https://")) {
                    try { await s3.send(new DeleteObjectCommand({ Bucket: "samparka", Key: oldBg })); } catch {}
                  }
                  const missionImageName = Date.now().toString() + "-mission-" + missionFile.originalname;
                  await s3.send(new PutObjectCommand({
                    Bucket: "samparka",
                    Key: missionImageName,
                    Body: missionFile.buffer,
                    ContentType: missionFile.mimetype,
                  }));
                  parsedMissions[i].backgroundImage = missionImageName;
                }
              }
              updateData.l6Missions = parsedMissions;
              store.loyaltyCard = store.loyaltyCard || {};
              store.loyaltyCard.l6Config = {
                ...(store.loyaltyCard.l6Config || {}),
                missions: parsedMissions,
              };
              await store.save();
            }
          } catch (parseError) {
            console.error("❌ Invalid l6Missions payload:", parseError);
          }
        }
      } else {
        // Non-L6: pass body through as before
        updateData = { ...req.body };
      }

      // Handle streak icon image upload for edit
      if (updateData.isStreakBased || updateData.isStreakBased === "true") {
        const streakIconFile = (req.files || []).find((f) => f.fieldname === "streakIconImage");
        if (streakIconFile) {
          // Delete old streak icon image if it's an S3 key
          if (reward.streakIcon && reward.streakIcon.includes(".") && !reward.streakIcon.startsWith("https://")) {
            try { await s3.send(new DeleteObjectCommand({ Bucket: "samparka", Key: reward.streakIcon })); } catch {}
          }
          const iconKey = Date.now().toString() + "-streakicon-" + streakIconFile.originalname;
          await s3.send(new PutObjectCommand({
            Bucket: "samparka",
            Key: iconKey,
            Body: streakIconFile.buffer,
            ContentType: streakIconFile.mimetype,
          }));
          updateData.streakIcon = iconKey;
        }
      }

      const updatedReward = await rewardModel
        .findByIdAndUpdate(rewardId, updateData, { new: true })
        .populate("store", "name");

      return res.json({
        success: true,
        message: "Reward Saved",
        reward: updatedReward,
      });
    } catch (error) {
      console.error("❌ editReward error:", error);
      return res.status(500).send(error);
    }
  }
  async editConstantReward(req, res) {
    try {
      const { rewardId } = req.query;
      const { storeId } = req.params;
      console.log(req.body);
      const store = await storeModel.findById(storeId);
      if (!store) {
        return res.json({ success: false, message: "Cannot find the store" });
      }

      const reward = await rewardModel.findById(rewardId);
      if (!reward) {
        return res.json({ success: false, message: "Cannot find the reward" });
      }

      if (req.user._id.equals(store.user[0]) || req.user.role === "admin") {
        if (req.file) {
          const oldLogoKey = reward.image;

          // Skip deletion if the key starts with "https://"
          if (oldLogoKey && !oldLogoKey.startsWith("https://")) {
            const deleteObjectParams = {
              Bucket: "samparka",
              Key: oldLogoKey,
            };
            const deleteCommand = new DeleteObjectCommand(deleteObjectParams);
            await s3.send(deleteCommand);
          }

          // S3 upload
          const imageName = Date.now().toString() + "-" + req.file.originalname;
          const putObjectParams = {
            Bucket: "samparka",
            Key: imageName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
          };
          const putCommand = new PutObjectCommand(putObjectParams);
          await s3.send(putCommand);

          reward.image = imageName;
          await reward.save();
        }

        // Update reward with the new image in the template
        const updatedReward = await rewardModel.findByIdAndUpdate(
          rewardId,
          { ...req.body },
          { new: true }
        );

        return res.json({
          success: true,
          message: "Reward Updated",
          reward: updatedReward,
        });
      } else {
        return res.json({ success: false, message: "You don't have access" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }

  async deleteReward(req, res) {
    try {
      const { rewardID } = req.params;
      const reward = await rewardModel.findById(rewardID).populate("store");

      if (!reward) {
        return res.json({ success: false, message: "Cannot find the reward" });
      }
      if (
        req.user._id.equals(reward.store.user[0]) ||
        req.user.role === "admin"
      ) {
        // Delete template image (if it exists)
        if (reward.template?.image) {
          const deleteTemplateParams = {
            Bucket: "samparka",
            Key: reward.template.image,
          };
          await s3.send(new DeleteObjectCommand(deleteTemplateParams));
        }

        // Delete reward image (if it exists)
        if (reward.image) {
          const deleteRewardParams = {
            Bucket: "samparka",
            Key: reward.image,
          };
          await s3.send(new DeleteObjectCommand(deleteRewardParams));
        }

        const deleteReward = await rewardModel.findByIdAndDelete(rewardID);
        if (deleteReward) {
          console.log(rewardID);
          const rees = await redemptionModel.deleteMany({ reward: rewardID });
          console.log(rees);
          console.log("Related redemptions deleted.");
        } else {
          console.log("Reward not found.");
        }
        return res.json({
          success: true,
          message: "Reward Deleted Successfully",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }
  async rewardAnalytics(req, res) {
    const { storeId } = req.params;

    // Check if the store exists
    const store = await storeModel.findById(storeId);
    if (!store) {
      return res.json({
        success: false,
        message: "Cannot find store",
      });
    }

    try {
      // Count total customers for the store
      const totalCustomers = await customerModel.countDocuments({
        store: storeId,
      });

      const pointsConversion = {
        amount: store.amount,
        conversionRate: store.conversionRate,
        pointValue: store.pointValue,
      };

      // Count total rewards created for the store
      const totalRewardsCreated = await rewardModel.countDocuments({
        store: storeId,
      });

      // Count total rewards redeemed for the store
      const totalRewardsRedeemed = await redemptionModel.countDocuments({
        store: storeId,
        status: "claimed",
      });

      // Calculate total points given out
      const totalPointsGivenOut = await pointsHistoryModel.aggregate([
        { $match: { store: new mongoose.Types.ObjectId(storeId) } },
        { $group: { _id: null, totalPoints: { $sum: "$points" } } },
      ]);

      // 📊 Graph Analytics: Points Given Per Day (Last 7 Days)
      const pointsGraphData = await pointsHistoryModel.aggregate([
        {
          $match: { store: new mongoose.Types.ObjectId(storeId) },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            totalPoints: { $sum: "$points" },
          },
        },
        { $sort: { _id: 1 } }, // Sort by date ascending
      ]);

      // 📊 Graph Analytics: Rewards Redeemed Per Day (Last 7 Days)
      const rewardsGraphData = await redemptionModel.aggregate([
        {
          $match: {
            store: new mongoose.Types.ObjectId(storeId),
            status: "claimed",
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$redeemDate" },
            },
            totalRedeemed: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // 🏆 List of redeemed rewards with customer details
      const redeemedRewards = await redemptionModel
        .find({ store: storeId, status: "claimed" })
        .populate("reward", "name") // Get reward name
        .populate("customer", "name") // Get customer email (or other details)
        .select("redeemDate reward customer"); // Only return relevant fields

      return res.json({
        success: true,
        data: {
          totalCustomers,
          pointsConversion,
          totalRewardsCreated,
          totalRewardsRedeemed,
          totalPointsGivenOut:
            totalPointsGivenOut.length > 0
              ? totalPointsGivenOut[0].totalPoints
              : 0,
          graphData: {
            pointsGiven: pointsGraphData,
            rewardsRedeemed: rewardsGraphData,
          },
          redeemedRewards, // Added redeemed reward details
        },
      });
    } catch (error) {
      console.error(error);
      return res.json({
        success: false,
        message: "Error occurred while fetching analytics.",
      });
    }
  }

  static async getSubdomainStats(subdomain) {
    const [response] = await analyticsDataClient.runReport({
      property: "properties/484614304",
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      dimensions: [{ name: "hostName" }],
      metrics: [
        { name: "activeUsers" },
        { name: "screenPageViews" },
        { name: "newUsers" },
      ],
      dimensionFilter: {
        filter: { fieldName: "hostName", stringFilter: { value: subdomain } },
      },
    });

    const row = response.rows?.[0];
    return {
      activeUsers: row?.metricValues?.[0]?.value || "0",
      pageViews: row?.metricValues?.[1]?.value || "0",
      newUsers: row?.metricValues?.[2]?.value || "0",
    };
  }

  async customerAnalytics(req, res) {
    const { storeId } = req.params;

    const store = await storeModel.findById(storeId);

    if (!store) {
      return res.json({
        success: false,
        message: "Cannot find store",
      });
    }

    try {
      const totalCustomers = await customerModel.countDocuments({
        store: storeId,
      });
      const domain = `${store.url}.samparka.co`;
      const gaStats = await RewardController.getSubdomainStats(domain);

      return res.json({
        success: true,
        totalCustomers,
        ...gaStats,
      });
    } catch (error) {
      console.error("Analytics error: ", error.message);
      return res.status(500).json({
        success: false,
        message: "Error occured while fetchihng analytics",
      });
    }
  }

  async createRewardThreshold(req, res) {
    try {
      const { storeId } = req.query;
      const { threshold, rewardType, rewardName, description, discountPercentage, validity, evergreen } = req.body;

      console.log('[createRewardThreshold] Request body:', req.body);
      console.log('[createRewardThreshold] Has file:', !!req.file);
      console.log('[createRewardThreshold] File details:', req.file);

      if (!threshold || !rewardType || !rewardName) {
        return res.json({ 
          success: false, 
          message: "Threshold, reward type, and reward name are required" 
        });
      }

      if (rewardType === "discount" && !discountPercentage) {
        return res.json({ 
          success: false, 
          message: "Discount percentage is required for discount rewards" 
        });
      }

      const store = await storeModel.findById(storeId);
      if (!store) {
        return res.json({ success: false, message: "Cannot find the store" });
      }

      if (!req.user._id.equals(store.user[0]) && req.user.role !== "admin") {
        return res.json({ success: false, message: "You don't have access" });
      }

      // Check if threshold already exists in Reward collection
      const existingReward = await rewardModel.findOne({
        store: storeId,
        type: "l5",
        threshold: Number(threshold),
      });
      
      if (existingReward) {
        return res.json({ 
          success: false, 
          message: "A reward with this threshold already exists" 
        });
      }

      // Handle image upload
      let imageName = null;
      if (req.file) {
        imageName = Date.now().toString() + "-" + req.file.originalname;
        const putObjectParams = {
          Bucket: "samparka",
          Key: imageName,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        };
        const putCommand = new PutObjectCommand(putObjectParams);
        await s3.send(putCommand);
        console.log('[createRewardThreshold] Image uploaded to S3:', imageName);
      } else {
        console.log('[createRewardThreshold] No image file provided');
      }

      // Create new reward in Reward collection
      const newReward = await rewardModel.create({
        store: storeId,
        name: rewardName,
        description: description || "",
        type: "l5",
        threshold: Number(threshold),
        rewardType,
        discountPercentage: rewardType === "discount" ? Number(discountPercentage) : undefined,
        validity: validity || "instant",
        evergreen: evergreen === "true" || evergreen === true,
        image: imageName,
      });
      
      console.log('[createRewardThreshold] New reward created in Reward collection:', newReward._id);

      // Get all L5 rewards to return updated list
      const l5Rewards = await rewardModel.find({ store: storeId, type: "l5" }).sort({ threshold: 1 });

      return res.json({
        success: true,
        message: "Reward threshold created successfully",
        data: {
          reward: newReward,
          rewards: l5Rewards,
        },
      });
    } catch (error) {
      console.error("Create reward threshold error:", error);
      return res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async editRewardThreshold(req, res) {
    try {
      const { storeId } = req.query;
      const { rewardId, threshold, rewardType, rewardName, description, discountPercentage, validity, evergreen } = req.body;

      console.log('[editRewardThreshold] Request body:', req.body);
      console.log('[editRewardThreshold] Description value:', description);
      console.log('[editRewardThreshold] Has file:', !!req.file);

      if (!rewardId || !threshold || !rewardType || !rewardName) {
        return res.json({ 
          success: false, 
          message: "Reward ID, threshold, reward type, and reward name are required" 
        });
      }

      const store = await storeModel.findById(storeId);
      if (!store) {
        return res.json({ success: false, message: "Cannot find the store" });
      }

      if (!req.user._id.equals(store.user[0]) && req.user.role !== "admin") {
        return res.json({ success: false, message: "You don't have access" });
      }

      // Check if rewardId is a fake ID (like 'l5-111') - these are stored in store.l5Config
      const isFakeId = rewardId.startsWith('l5-');
      let existingReward;
      let oldThreshold;

      if (isFakeId) {
        // Extract threshold from fake ID (e.g., 'l5-111' -> 111)
        oldThreshold = parseInt(rewardId.replace('l5-', ''));
        
        console.log('[editRewardThreshold] Fake ID detected:', rewardId);
        console.log('[editRewardThreshold] Old threshold:', oldThreshold);
        console.log('[editRewardThreshold] Store loyaltyCard format:', store.loyaltyCard?.format);
        
        // Try to find reward in Reward collection first (this is where createRewardThreshold saves them)
        existingReward = await rewardModel.findOne({
          store: storeId,
          type: "l5",
          threshold: oldThreshold,
        });

        if (existingReward) {
          console.log('[editRewardThreshold] Found reward in Reward collection:', existingReward._id);
          // Reward found in collection, will update below
          oldThreshold = existingReward.threshold;
        } else {
          // Fallback: check store.l5Config.rewards array (legacy or alternate storage)
          console.log('[editRewardThreshold] Not found in Reward collection, checking store.l5Config');
          console.log('[editRewardThreshold] Store has l5Config:', !!store.l5Config);
          
          // Initialize l5Config if it doesn't exist (for backward compatibility)
          if (!store.l5Config) {
            store.l5Config = {
              redemptionThresholds: [775, 1500, 2500, 5000, 8000, 10000, 50000],
              rewards: [],
              discountValidityDays: 30,
              leaderboardMinPoints: 3000,
            };
          }
          
          if (!store.l5Config.rewards) {
            store.l5Config.rewards = [];
          }
          
          existingReward = store.l5Config.rewards.find(r => r.threshold === oldThreshold);
          
          if (!existingReward) {
            console.log('[editRewardThreshold] ERROR: Reward not found anywhere');
            return res.json({ 
              success: false, 
              message: "Reward not found. It may have been deleted or never created." 
            });
          }
          
          console.log('[editRewardThreshold] Found reward in store.l5Config');
        }
      } else {
        // Find the reward in Reward collection
        existingReward = await rewardModel.findOne({
          _id: rewardId,
          store: storeId,
          type: "l5",
        });

        if (!existingReward) {
          return res.json({ 
            success: false, 
            message: "Reward not found" 
          });
        }
        
        oldThreshold = existingReward.threshold;
      }

      // At this point, existingReward is either from Reward collection or store.l5Config
      const isInRewardCollection = existingReward._id !== undefined;
      console.log('[editRewardThreshold] Reward source:', isInRewardCollection ? 'Reward Collection' : 'store.l5Config');

      // Check if new threshold conflicts with another reward (if threshold changed)
      if (Number(oldThreshold) !== Number(threshold)) {
        // Check in Reward collection first
        const conflictingReward = await rewardModel.findOne({
          store: storeId,
          type: "l5",
          threshold: Number(threshold),
          _id: { $ne: existingReward._id || 'none' },
        });
        
        if (conflictingReward) {
          return res.json({ 
            success: false, 
            message: "A reward with this threshold already exists" 
          });
        }

        // Also check in store.l5Config if it exists
        if (store.l5Config && store.l5Config.rewards) {
          const configConflict = store.l5Config.rewards.find(
            r => r.threshold === Number(threshold) && r.threshold !== oldThreshold
          );
          
          if (configConflict) {
            return res.json({ 
              success: false, 
              message: "A reward with this threshold already exists in L5 config" 
            });
          }
        }
      }

      // Prepare update data
      const updateData = {
        rewardName: rewardName,
        description: description || "",
        threshold: Number(threshold),
        rewardType,
        validity: validity || "instant",
        evergreen: evergreen === "true" || evergreen === true,
      };

      if (rewardType === "discount") {
        updateData.discountPercentage = Number(discountPercentage);
      } else {
        delete updateData.discountPercentage;
      }

      // Handle image upload
      if (req.file) {
        // Delete old image if exists
        const oldImage = isFakeId ? existingReward.image : existingReward.image;
        if (oldImage && !oldImage.startsWith("https://")) {
          try {
            const deleteParams = {
              Bucket: "samparka",
              Key: oldImage,
            };
            const deleteCommand = new DeleteObjectCommand(deleteParams);
            await s3.send(deleteCommand);
            console.log('[editRewardThreshold] Deleted old image:', oldImage);
          } catch (err) {
            console.log("Error deleting old image:", err);
          }
        }

        const imageName = Date.now().toString() + "-" + req.file.originalname;
        const putObjectParams = {
          Bucket: "samparka",
          Key: imageName,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        };
        const putCommand = new PutObjectCommand(putObjectParams);
        await s3.send(putCommand);
        updateData.image = imageName;
        console.log('[editRewardThreshold] Uploaded new image:', imageName);
      }

      // Update the reward based on where it's stored
      if (isInRewardCollection) {
        // Update in Reward collection
        const rewardUpdateData = {
          name: updateData.rewardName,
          description: updateData.description,
          threshold: updateData.threshold,
          rewardType: updateData.rewardType,
          validity: updateData.validity,
          evergreen: updateData.evergreen,
        };
        
        if (updateData.discountPercentage !== undefined) {
          rewardUpdateData.discountPercentage = updateData.discountPercentage;
        }
        
        if (updateData.image) {
          rewardUpdateData.image = updateData.image;
        }
        
        console.log('[editRewardThreshold] About to update with data:', rewardUpdateData);
        
        const updatedReward = await rewardModel.findByIdAndUpdate(
          existingReward._id,
          rewardUpdateData,
          { new: true }
        );

        console.log('[editRewardThreshold] Reward updated in Reward collection:', updatedReward._id);
        console.log('[editRewardThreshold] Updated reward description:', updatedReward.description);

        return res.json({
          success: true,
          message: "Reward threshold updated successfully",
          data: updatedReward
        });
        
      } else {
        // Update in store.l5Config.rewards array
        const rewardIndex = store.l5Config.rewards.findIndex(r => r.threshold === oldThreshold);
        
        if (rewardIndex === -1) {
          return res.json({ 
            success: false, 
            message: "Reward not found in L5 config" 
          });
        }
        
        // Merge existing data with updates
        store.l5Config.rewards[rewardIndex] = {
          ...store.l5Config.rewards[rewardIndex],
          ...updateData
        };
        
        await store.save();
        console.log('[editRewardThreshold] Updated reward in store.l5Config');

        return res.json({
          success: true,
          message: "Reward threshold updated successfully",
          data: store.l5Config.rewards[rewardIndex]
        });
      }
    } catch (error) {
      console.error("Edit reward threshold error:", error);
      return res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async deleteRewardThreshold(req, res) {
    try {
      const { storeId, rewardId } = req.query;

      console.log('[deleteRewardThreshold] storeId:', storeId, 'rewardId:', rewardId);

      if (!rewardId) {
        return res.json({ 
          success: false, 
          message: "Reward ID is required" 
        });
      }

      const store = await storeModel.findById(storeId);
      if (!store) {
        return res.json({ success: false, message: "Cannot find the store" });
      }

      if (!req.user._id.equals(store.user[0]) && req.user.role !== "admin") {
        return res.json({ success: false, message: "You don't have access" });
      }

      // Check if rewardId is in format "l5-{threshold}" (frontend synthetic ID)
      let reward;
      if (rewardId.startsWith('l5-')) {
        const threshold = parseInt(rewardId.replace('l5-', ''));
        console.log('[deleteRewardThreshold] Extracted threshold:', threshold);
        
        // Find the reward by threshold
        reward = await rewardModel.findOne({
          store: storeId,
          type: "l5",
          threshold: threshold,
        });
      } else {
        // Find the reward by MongoDB _id
        reward = await rewardModel.findOne({
          _id: rewardId,
          store: storeId,
          type: "l5",
        });
      }

      if (!reward) {
        return res.json({ 
          success: false, 
          message: "Reward not found" 
        });
      }

      // Delete image from S3 if exists
      if (reward.image && !reward.image.startsWith("https://")) {
        try {
          const deleteParams = {
            Bucket: "samparka",
            Key: reward.image,
          };
          const deleteCommand = new DeleteObjectCommand(deleteParams);
          await s3.send(deleteCommand);
          console.log('[deleteRewardThreshold] Deleted image:', reward.image);
        } catch (err) {
          console.log("Error deleting image:", err);
        }
      }

      // Delete the reward from Reward collection using the actual MongoDB _id
      await rewardModel.findByIdAndDelete(reward._id);

      console.log('[deleteRewardThreshold] Reward deleted:', reward._id);

      // Get remaining L5 rewards
      const l5Rewards = await rewardModel.find({ store: storeId, type: "l5" }).sort({ threshold: 1 });

      return res.json({
        success: true,
        message: "Reward threshold deleted successfully",
        data: {
          rewards: l5Rewards,
        },
      });
    } catch (error) {
      console.error("Delete reward threshold error:", error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  duplicateReward = async (req, res) => {
    try {
      const { rewardId } = req.params;
      const original = await rewardModel.findById(rewardId);
      if (!original) {
        return res.status(404).json({ success: false, message: "Reward not found" });
      }
      const { _id, createdAt, updatedAt, __v, ...fields } = original.toObject();

      const copyS3Image = async (key) => {
        if (!key || key.startsWith("http")) return key;
        const newKey = `${Date.now()}-copy-${key}`;
        await s3.send(new CopyObjectCommand({
          Bucket: "samparka",
          CopySource: `samparka/${encodeURIComponent(key)}`,
          Key: newKey,
        }));
        return newKey;
      };

      const newImage = await copyS3Image(fields.image);
      const newTemplateImage = await copyS3Image(fields.template?.image);

      const duplicate = await rewardModel.create({
        ...fields,
        name: `Copy of ${original.name}`,
        priority: (fields.priority ?? 0) + 1,
        image: newImage,
        template: { ...fields.template, image: newTemplateImage },
      });
      res.json({ success: true, message: "Reward duplicated" });
    } catch (error) {
      console.error("❌ duplicateReward error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  reorderL6Rewards = async (req, res) => {
    try {
      const { storeId } = req.query;
      const { order } = req.body; // [{ rewardId, priority }]
      if (!storeId || !Array.isArray(order) || order.length === 0) {
        return res.status(400).json({ success: false, message: "Invalid request" });
      }
      const bulkOps = order.map(({ rewardId, priority }) => ({
        updateOne: {
          filter: { _id: rewardId, store: storeId },
          update: { $set: { priority } },
        },
      }));
      await rewardModel.bulkWrite(bulkOps, { ordered: false });
      res.json({ success: true, message: "Reward order updated" });
    } catch (error) {
      console.error("❌ reorderL6Rewards error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}

module.exports = new RewardController();
