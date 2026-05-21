const storeModel = require("../models/storeModel.js");
const pointsModel = require("../models/pointsModel.js");
const mailSMSModel = require("../models/mailSMSModel.js");
const customerModel = require("../models/customerModel.js");
const redemptionModel = require("../models/redemptionModel.js");
const reservationModel = require("../models/reservationModel.js");
const pointsHistoryModel = require("../models/pointsHistoryModel.js");
const l5PointsTransactionModel = require("../models/l5PointsTransactionModel.js");
const { updateVisitAnalytics } = require("../services/visitAnalyticsService.js");
const generateToken = require("../config/generateToken.js");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const s3 = require("../config/s3Config.js");
const mailController = require("./mailController.js");
const smsController = require("./smsController.js");
const fs = require("fs");
const csv = require("fast-csv");
const streamifier = require("streamifier");
const outletModel = require("../models/outletModel.js");
const outletPointsModel = require("../models/outletPointsModel.js");
const printPointsModel = require("../models/printPointsModel.js");
const upgradeTier = require("../config/upgradeTier.js");
const reservationSettingModel = require("../models/reservationSettingModel.js");
const notificationController = require("./notificationController.js");
const offerModel = require("../models/offerModel.js");
const notificationModel = require("../models/notificationModel.js");
const axios = require("axios");

const ensureMissionMetadata = (missions = []) => {
  const nowIso = new Date().toISOString();
  return (Array.isArray(missions) ? missions : []).map((mission) => ({
    ...mission,
    _missionId: mission?._missionId || new mongoose.Types.ObjectId().toString(),
    createdAt: mission?.createdAt || nowIso,
    updatedAt: nowIso,
  }));
};

// Parse lat/lng from a Google Maps URL string
function parseCoordsFromUrl(url) {
  if (!url) return null;
  const patterns = [
    /@(-?\d+\.?\d+),(-?\d+\.?\d+)/,
    /place\/(-?\d+\.?\d+),(-?\d+\.?\d+)/,
    /[?&]q=(-?\d+\.?\d+),(-?\d+\.?\d+)/,
    /[?&]query=(-?\d+\.?\d+),(-?\d+\.?\d+)/,
    /ll=(-?\d+\.?\d+),(-?\d+\.?\d+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }
  }
  return null;
}

class StoreController {
  async checkStore(req, res) {
    try {
      const { storeURL } = req.params;

      // Find store and exclude sensitive fields
      const store = await storeModel
        .findOne({ url: storeURL })
        .lean()
        .select("-pin -user -email -pass -smsToken")
        .populate("outlets");
      
      if (!store) {
        return res.json({ success: false, message: "Store not found" });
      }

      // Check if subscription has expired FIRST (before checking status)
      const hasExpiredSubscription = store.subscriptionEndDate && new Date(store.subscriptionEndDate) < new Date();
      
      if (hasExpiredSubscription) {
        // Automatically deactivate the store if subscription expired and still active
        if (store.status === "active") {
          await storeModel.findByIdAndUpdate(store._id, { status: "deactive" });
        }
        return res.json({ success: false, message: "Store subscription has expired" });
      }

      // Check if store is active (for other reasons)
      if (store.status !== "active") {
        return res.json({ success: false, message: "Store unavailable" });
      }

      // ✅ Generate signed URL for store logo if it exists
      if (store.logo && !store.logo.startsWith("http")) {
        const logoCommand = new GetObjectCommand({
          Bucket: "samparka",
          Key: store.logo,
        });
        store.logo = await getSignedUrl(s3, logoCommand, { expiresIn: 3600 });
      }

      // ✅ Generate signed URL for front logo if it exists
      if (store.frontLogo && !store.frontLogo.startsWith("http")) {
        const frontLogoCommand = new GetObjectCommand({
          Bucket: "samparka",
          Key: store.frontLogo,
        });
        store.frontLogo = await getSignedUrl(s3, frontLogoCommand, {
          expiresIn: 3600,
        });
      }

      // ✅ Generate signed URL for QR stand background if it exists
      if (store.qrStandBg && !store.qrStandBg.startsWith("http")) {
        const qrStandBgCommand = new GetObjectCommand({
          Bucket: "samparka",
          Key: store.qrStandBg,
        });
        store.qrStandBg = await getSignedUrl(s3, qrStandBgCommand, {
          expiresIn: 3600,
        });
      }

      // ✅ Signed URL for customStamp if it exists
      if (
        store.loyaltyCard?.customStamp &&
        !store.loyaltyCard.customStamp.startsWith("http")
      ) {
        const customStampCommand = new GetObjectCommand({
          Bucket: "samparka",
          Key: store.loyaltyCard.customStamp,
        });
        store.loyaltyCard.customStamp = await getSignedUrl(
          s3,
          customStampCommand,
          {
            expiresIn: 3600,
          }
        );
      } else if (store.loyaltyCard) {
        store.loyaltyCard.customStamp = null;
      }

      // ✅ Signed URL for cardImage if it exists
      if (
        store.loyaltyCard?.cardImage &&
        !store.loyaltyCard.cardImage.startsWith("http")
      ) {
        const customStampCommand = new GetObjectCommand({
          Bucket: "samparka",
          Key: store.loyaltyCard.cardImage,
        });
        store.loyaltyCard.cardImage = await getSignedUrl(
          s3,
          customStampCommand,
          {
            expiresIn: 3600,
          }
        );
      } else if (store.loyaltyCard) {
        store.loyaltyCard.cardImage = null;
      }

      // ✅ Normalize tier maxPoints and sign per-tier S3 images (for L4 card design)
      if (store.loyaltyCard?.tier) {
        store.loyaltyCard.tier = await Promise.all(
          store.loyaltyCard.tier.map(async (tier, index, arr) => {
            const isLast = index === arr.length - 1;

            let customStamp = tier.customStamp || null;
            let cardImage = tier.cardImage || null;

            if (customStamp && !customStamp.startsWith("https://")) {
              try {
                const cmd = new GetObjectCommand({ Bucket: "samparka", Key: customStamp });
                customStamp = await getSignedUrl(s3, cmd, { expiresIn: 3600 });
              } catch (e) {
                console.warn("⚠️ Failed to sign tier customStamp:", customStamp, e.message);
                customStamp = null;
              }
            }
            if (cardImage && !cardImage.startsWith("https://")) {
              try {
                const cmd = new GetObjectCommand({ Bucket: "samparka", Key: cardImage });
                cardImage = await getSignedUrl(s3, cmd, { expiresIn: 3600 });
              } catch (e) {
                console.warn("⚠️ Failed to sign tier cardImage:", cardImage, e.message);
                cardImage = null;
              }
            }

            return {
              ...tier,
              maxPoints:
                isLast &&
                (tier.maxPoints === null || tier.maxPoints === Infinity)
                  ? "Infinity"
                  : tier.maxPoints,
              customStamp,
              cardImage,
            };
          })
        );
      }

      // ✅ Sign backgroundImage URLs inside l6Config.missions
      const missions = store.loyaltyCard?.l6Config?.missions;
      if (Array.isArray(missions)) {
        await Promise.all(
          missions.map(async (mission) => {
            if (mission.backgroundImage && !mission.backgroundImage.startsWith("https://")) {
              try {
                const cmd = new GetObjectCommand({ Bucket: "samparka", Key: mission.backgroundImage });
                mission.backgroundImage = await getSignedUrl(s3, cmd, { expiresIn: 3600 });
              } catch (e) {
                console.warn("⚠️ Failed to sign mission backgroundImage:", mission.backgroundImage, e.message);
              }
            }
          })
        );
      }

      return res.json({
        success: true,
        message: "Store Available",
        store,
      });
    } catch (error) {
      console.error("checkStore error:", error);
      return res.status(500).send(error);
    }
  }

  // First-time store creation for onboarding (minimal fields, auto-assign user, 7-day trial)
  async createFirstStore(req, res) {
    try {
      const { name, location, phone, url, type } = req.body;
      const { logo } = req.files;

      // Validate required fields
      if (!logo || !name || !location || !phone || !url || !type) {
        return res.json({ success: false, message: "All fields are required" });
      }

      // URL validation
      if (/[^a-z0-9.-]/.test(url)) {
        return res.json({ success: false, message: "Invalid URL format" });
      }

      // Check if URL is already taken
      const existingStore = await storeModel.findOne({ url });
      if (existingStore) {
        return res.json({ success: false, message: "URL already taken" });
      }

      // Check if user already has a store
      const userStores = await storeModel.find({ user: req.user._id });
      if (userStores.length > 0) {
        return res.json({
          success: false,
          message: "You already have a store. Please use the dashboard.",
        });
      }

      // S3 upload for logo
      const imageName = Date.now().toString() + "-" + logo[0].originalname;
      const putObjectParams = {
        Bucket: "samparka",
        Key: imageName,
        Body: logo[0].buffer,
        ContentType: logo[0].mimetype,
      };
      const command = new PutObjectCommand(putObjectParams);
      await s3.send(command);

      // Calculate 7-day free trial dates based on store creation date
      // IMPORTANT: Users cannot control these dates - backend enforces them
      const storeCreationDate = new Date();
      const subscriptionStartDate = new Date(storeCreationDate);
      const subscriptionEndDate = new Date(storeCreationDate);
      subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 7);

      // Create store with defaults
      const store = await storeModel.create({
        name,
        location,
        phone,
        url,
        type,
        logo: imageName,
        user: [req.user._id], // Auto-assign current user

        // Default values for customer settings
        givePointsOnRegister: true,
        limitPoints: false,
        needCustomerDOB: false,
        needCustomerGender: false,
        needBillID: false,
        needBillIDForReward: false,
        letSubAdminToGiveManualPoints: true,
        showPhoneNumberOnSubAdmin: true,
        showEmailOnSubAdmin: true,

        // WhatsApp defaults
        whatsapp: false,
        whatsappOrder: false,

        // Points system defaults
        amount: false, // Points mode
        isRounded: true,
        hasExpiry: false,

        // Subscription (7-day free trial)
        subscriptionStartDate,
        subscriptionEndDate,

        // Status
        status: "active",
      });

      // Create points entry for the store
      await pointsModel.create({ store: store._id });

      // Auto-create notification settings with defaults so push notifications
      // work immediately without requiring manual configuration per store
      await mailSMSModel.create({ store: store._id });

      return res.json({
        success: true,
        message: "Store created successfully! Your 7-day free trial has started.",
        store,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async createStore(req, res) {
    try {
      const { name, location, phone, url, user } = req.body;

      const { logo, frontLogo } = req.files;

      if (!logo || !name || !location || !phone || !url || !user) {
        return res.json({ success: false, message: "All fields are required" });
      }
      if (/[^a-z0-9.-]/.test(url)) {
        return res.json({ success: false, message: "Invalid URL" });
      }

      // If amount is 'undefined' (as string), set it to false
      if (req.body.amount === "undefined" || req.body.amount === undefined) {
        req.body.amount = false;
      }

      // If conversionRate is 'undefined' (as string), set it to an empty string
      if (
        req.body.conversionRate === "undefined" ||
        req.body.conversionRate === undefined
      ) {
        req.body.conversionRate = "";
      }

      // 🛠️ Fixing hasExpiry and expiryDays
      req.body.hasExpiry = req.body.hasExpiry === "true"; // ensure Boolean
      req.body.expiryDays =
        req.body.expiryDays && req.body.expiryDays !== "undefined"
          ? Number(req.body.expiryDays)
          : undefined;

      // 🛠️ Fixing requireOTP
      if ("requireOTP" in req.body) {
        const requireOTPVal = req.body.requireOTP;
        req.body.requireOTP = requireOTPVal === true || requireOTPVal === "true";
      }
      if ("requireEmailOTP" in req.body) {
        const v = req.body.requireEmailOTP;
        req.body.requireEmailOTP = v === true || v === "true";
      }
      if ("requirePhoneOTP" in req.body) {
        const v = req.body.requirePhoneOTP;
        req.body.requirePhoneOTP = v === true || v === "true";
      }

      const checkStore = await storeModel.find({ url });
      if (checkStore.length > 0) {
        return res.json({ success: false, message: "URL already taken" });
      }

      // S3 upload
      const uploadToS3 = async (file) => {
        const imageName = Date.now().toString() + "-" + file.originalname;
        const putObjectParams = {
          Bucket: "samparka",
          Key: imageName,
          Body: file.buffer,
          ContentType: file.mimetype,
        };
        const command = new PutObjectCommand(putObjectParams);
        await s3.send(command);
        return imageName;
      };

      const logoName = await uploadToS3(logo[0]);
      let frontLogoName;
      if (frontLogo) {
        frontLogoName = await uploadToS3(frontLogo[0]);
      }

      const store = await storeModel.create({
        ...req.body,
        logo: logoName,
        frontLogo: frontLogoName || null,
        user,
      });

      await pointsModel.create({ store });

      // Auto-create notification settings with defaults
      await mailSMSModel.create({ store: store._id });

      return res.json({ success: true, message: "New Store Created", store });
    } catch (error) {
      console.error(error);
      return res.status(500).send(error.message);
    }
  }

  async getAllStores(req, res) {
    try {
      const stores = await storeModel.find().populate("outlets");

      for (const store of stores) {
        const getObjectParams = {
          Bucket: "samparka",
          Key: store.logo,
        };
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        store.logo = url;
        
        // Generate signed URL for frontLogo if it exists
        if (store.frontLogo) {
          const frontLogoParams = {
            Bucket: "samparka",
            Key: store.frontLogo,
          };
          const frontLogoCommand = new GetObjectCommand(frontLogoParams);
          const frontLogoUrl = await getSignedUrl(s3, frontLogoCommand, { expiresIn: 3600 });
          store.frontLogo = frontLogoUrl;
        }

        // Generate signed URL for qrStandBg if it exists
        if (store.qrStandBg) {
          const qrStandBgParams = {
            Bucket: "samparka",
            Key: store.qrStandBg,
          };
          const qrStandBgCommand = new GetObjectCommand(qrStandBgParams);
          const qrStandBgUrl = await getSignedUrl(s3, qrStandBgCommand, { expiresIn: 3600 });
          store.qrStandBg = qrStandBgUrl;
        }

        if (store.loyaltyCard.customStamp) {
          const getObjectParams1 = {
            Bucket: "samparka",
            Key: store.loyaltyCard.customStamp,
          };
          const command1 = new GetObjectCommand(getObjectParams1);
          const url1 = await getSignedUrl(s3, command1, { expiresIn: 3600 });
          store.loyaltyCard.customStamp = url1;
        } else {
          store.loyaltyCard.customStamp = null; // or set a default value
        }
        if (store.loyaltyCard.cardImage) {
          const getObjectParams1 = {
            Bucket: "samparka",
            Key: store.loyaltyCard.cardImage,
          };
          const command1 = new GetObjectCommand(getObjectParams1);
          const url1 = await getSignedUrl(s3, command1, { expiresIn: 3600 });
          store.loyaltyCard.cardImage = url1;
        } else {
          store.loyaltyCard.cardImage = null; // or set a default value
        }
      }

      return res.json({ success: true, stores });
    } catch (error) {
      console.error(error);
      return res.status(500).send(error.message);
    }
  }

  async getMyStore(req, res) {
    try {
      const stores = await storeModel
        .find({ user: req.user })
        .populate("outlets");
      for (const store of stores) {
        const getObjectParams = {
          Bucket: "samparka",
          Key: store.logo,
        };
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        store.logo = url;
        
        // Generate signed URL for frontLogo if it exists
        if (store.frontLogo) {
          const frontLogoParams = {
            Bucket: "samparka",
            Key: store.frontLogo,
          };
          const frontLogoCommand = new GetObjectCommand(frontLogoParams);
          const frontLogoUrl = await getSignedUrl(s3, frontLogoCommand, { expiresIn: 3600 });
          store.frontLogo = frontLogoUrl;
        }

        // Generate signed URL for qrStandBg if it exists
        if (store.qrStandBg) {
          const qrStandBgParams = {
            Bucket: "samparka",
            Key: store.qrStandBg,
          };
          const qrStandBgCommand = new GetObjectCommand(qrStandBgParams);
          const qrStandBgUrl = await getSignedUrl(s3, qrStandBgCommand, { expiresIn: 3600 });
          store.qrStandBg = qrStandBgUrl;
        }

        if (store.loyaltyCard.customStamp) {
          const getObjectParams1 = {
            Bucket: "samparka",
            Key: store.loyaltyCard.customStamp,
          };
          const command1 = new GetObjectCommand(getObjectParams1);
          const url1 = await getSignedUrl(s3, command1, { expiresIn: 3600 });
          store.loyaltyCard.customStamp = url1;
        } else {
          store.loyaltyCard.customStamp = null; // or set a default value
        }
        if (store.loyaltyCard.cardImage) {
          const getObjectParams1 = {
            Bucket: "samparka",
            Key: store.loyaltyCard.cardImage,
          };
          const command1 = new GetObjectCommand(getObjectParams1);
          const url1 = await getSignedUrl(s3, command1, { expiresIn: 3600 });
          store.loyaltyCard.cardImage = url1;
        } else {
          store.loyaltyCard.cardImage = null; // or set a default value
        }
      }
      return res.json({ success: true, stores });
    } catch (error) {
      console.error(error);
      return res.status(500).send(error.message);
    }
  }

  async getLoyaltyCardDetail(req, res) {
    try {
      const { storeId } = req.params;

      const store = await storeModel.findById(storeId).lean(); // use .lean() to simplify the returned object

      if (!store) {
        return res
          .status(404)
          .json({ success: false, message: "Store not found" });
      }

      if (store.loyaltyCard.customStamp) {
        const getObjectParams1 = {
          Bucket: "samparka",
          Key: store.loyaltyCard.customStamp,
        };
        const command1 = new GetObjectCommand(getObjectParams1);
        const url1 = await getSignedUrl(s3, command1, { expiresIn: 3600 });
        store.loyaltyCard.customStamp = url1;
      } else {
        store.loyaltyCard.customStamp = null; // or set a default value
      }

      if (store.loyaltyCard.cardImage) {
        const getObjectParams1 = {
          Bucket: "samparka",
          Key: store.loyaltyCard.cardImage,
        };
        const command1 = new GetObjectCommand(getObjectParams1);
        const url1 = await getSignedUrl(s3, command1, { expiresIn: 3600 });
        store.loyaltyCard.cardImage = url1;
      } else {
        store.loyaltyCard.cardImage = null; // or set a default value
      }

      const tiers = await Promise.all(
        (store?.loyaltyCard?.tier || []).map(async (tier, index, arr) => {
          const isLast = index === arr.length - 1;
          const transformedMaxPoints =
            isLast &&
            (tier.maxPoints === null ||
              tier.maxPoints === Infinity ||
              tier.maxPoints >= 9999999)
              ? "Infinity"
              : tier.maxPoints;

          let customStamp = tier.customStamp || null;
          let cardImage = tier.cardImage || null;

          if (customStamp && !customStamp.startsWith("https://")) {
            const cmd = new GetObjectCommand({ Bucket: "samparka", Key: customStamp });
            customStamp = await getSignedUrl(s3, cmd, { expiresIn: 3600 });
          }
          if (cardImage && !cardImage.startsWith("https://")) {
            const cmd = new GetObjectCommand({ Bucket: "samparka", Key: cardImage });
            cardImage = await getSignedUrl(s3, cmd, { expiresIn: 3600 });
          }

          return {
            ...tier,
            maxPoints: transformedMaxPoints,
            customStamp,
            cardImage,
          };
        })
      );

      res.json({
        success: true,
        _id: store._id,
        name: store.name,
        // logo: store.logo,
        loyaltyCard: {
          ...store.loyaltyCard,
          tier: tiers,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  }

  async customizeLoyaltyCard(req, res) {
    try {
      const { storeId } = req.query;
      const { removeStampImage, removeCardImage } = req.body;
      const store = await storeModel.findById(storeId);
      if (!store) {
        return res.json({ success: false, message: "Cannot find the store" });
      }

      if (req.user._id.equals(store.user[0]) || req.user.role === "admin") {
        // upload.any() returns a flat array — group by fieldname so we can
        // access files.cardImage[0], files.customStamp[0], etc.
        const filesArray = req.files || [];
        const files = {};
        filesArray.forEach((f) => {
          if (!files[f.fieldname]) files[f.fieldname] = [];
          files[f.fieldname].push(f);
        });
        if (removeStampImage) {
          // If removeStampImage is true, delete the customStamp image
          if (
            store.loyaltyCard.customStamp &&
            !store.loyaltyCard.customStamp.startsWith("https://")
          ) {
            const deleteParams = {
              Bucket: "samparka",
              Key: store.loyaltyCard.customStamp,
            };
            await s3.send(new DeleteObjectCommand(deleteParams));
          }
          store.loyaltyCard.customStamp = null;
        }
        if (removeCardImage === "true") {
          // If removeCardImage is true, delete the cardImage
          if (
            store.loyaltyCard.cardImage &&
            !store.loyaltyCard.cardImage.startsWith("https://")
          ) {
            const deleteParams = {
              Bucket: "samparka",
              Key: store.loyaltyCard.cardImage,
            };
            await s3.send(new DeleteObjectCommand(deleteParams));
          }
          store.loyaltyCard.cardImage = null;
        }

        // === Handle customStamp image ===
        const customStampFile = filesArray.find(f => f.fieldname === "customStamp");
        if (customStampFile) {
          const file = customStampFile;
          const oldLogoKey = store.loyaltyCard.customStamp;
          if (oldLogoKey && !oldLogoKey.startsWith("https://")) {
            const deleteParams = {
              Bucket: "samparka",
              Key: oldLogoKey,
            };
            await s3.send(new DeleteObjectCommand(deleteParams));
          }

          const imageName = `${Date.now()}-${file.originalname}`;
          const uploadParams = {
            Bucket: "samparka",
            Key: imageName,
            Body: file.buffer,
            ContentType: file.mimetype,
          };
          await s3.send(new PutObjectCommand(uploadParams));
          store.loyaltyCard.customStamp = imageName;
        }

        // === Handle cardImage ===
        const cardImageFile = filesArray.find(f => f.fieldname === "cardImage");
        if (cardImageFile) {
          const file = cardImageFile;
          const oldCardImageKey = store.loyaltyCard.cardImage;
          if (oldCardImageKey && !oldCardImageKey.startsWith("https://")) {
            const deleteParams = {
              Bucket: "samparka",
              Key: oldCardImageKey,
            };
            await s3.send(new DeleteObjectCommand(deleteParams));
          }

          const imageName = `${Date.now()}-${file.originalname}`;
          const uploadParams = {
            Bucket: "samparka",
            Key: imageName,
            Body: file.buffer,
            ContentType: file.mimetype,
          };
          await s3.send(new PutObjectCommand(uploadParams));
          store.loyaltyCard.cardImage = imageName;
        }

        // Update loyaltyCard fields (text data)
        // Explicitly pick known fields to avoid passing unparsed JSON strings
        // Normalize tier maxPoints: frontend encodes Infinity as 9999999 (or the old
        // "Infinity" string). Convert both to the sentinel 9999999 so MongoDB stores a
        // plain Number and the schema validator is satisfied.
        const rawTiers = JSON.parse(req.body.tier);
        const normalizedTiers = rawTiers.map((t) => ({
          ...t,
          maxPoints:
            t.maxPoints === "Infinity" || t.maxPoints >= 9999999
              ? 9999999
              : t.maxPoints,
        }));

        // === Handle per-tier stamp and card images ===
        // Field naming: tierStamp_{index} and tierCardImage_{index}
        const tierStampFiles = {};
        const tierCardImageFiles = {};
        filesArray.forEach((file) => {
          const stampMatch = file.fieldname.match(/^tierStamp_(\d+)$/);
          const cardImageMatch = file.fieldname.match(/^tierCardImage_(\d+)$/);
          if (stampMatch) tierStampFiles[parseInt(stampMatch[1])] = file;
          if (cardImageMatch) tierCardImageFiles[parseInt(cardImageMatch[1])] = file;
        });

        for (let i = 0; i < normalizedTiers.length; i++) {
          const oldTier = store.loyaltyCard.tier.find((t) => t.name === normalizedTiers[i].name);

          // Per-tier custom stamp
          if (req.body[`removeTierStamp_${i}`] === "true") {
            const oldKey = oldTier?.customStamp;
            if (oldKey && !oldKey.startsWith("https://")) {
              await s3.send(new DeleteObjectCommand({ Bucket: "samparka", Key: oldKey }));
            }
            normalizedTiers[i].customStamp = "";
          } else if (tierStampFiles[i]) {
            const oldKey = oldTier?.customStamp;
            if (oldKey && !oldKey.startsWith("https://")) {
              await s3.send(new DeleteObjectCommand({ Bucket: "samparka", Key: oldKey }));
            }
            const file = tierStampFiles[i];
            const imageName = `tier-stamp-${Date.now()}-${file.originalname}`;
            await s3.send(new PutObjectCommand({
              Bucket: "samparka",
              Key: imageName,
              Body: file.buffer,
              ContentType: file.mimetype,
            }));
            normalizedTiers[i].customStamp = imageName;
          } else {
            // Preserve existing S3 key (don't overwrite with signed URL from frontend)
            normalizedTiers[i].customStamp = oldTier?.customStamp || normalizedTiers[i].customStamp || "";
          }

          // Per-tier card image
          if (req.body[`removeTierCardImage_${i}`] === "true") {
            const oldKey = oldTier?.cardImage;
            if (oldKey && !oldKey.startsWith("https://")) {
              await s3.send(new DeleteObjectCommand({ Bucket: "samparka", Key: oldKey }));
            }
            normalizedTiers[i].cardImage = "";
          } else if (tierCardImageFiles[i]) {
            const oldKey = oldTier?.cardImage;
            if (oldKey && !oldKey.startsWith("https://")) {
              await s3.send(new DeleteObjectCommand({ Bucket: "samparka", Key: oldKey }));
            }
            const file = tierCardImageFiles[i];
            const imageName = `tier-card-${Date.now()}-${file.originalname}`;
            await s3.send(new PutObjectCommand({
              Bucket: "samparka",
              Key: imageName,
              Body: file.buffer,
              ContentType: file.mimetype,
            }));
            normalizedTiers[i].cardImage = imageName;
          } else {
            // Preserve existing S3 key
            normalizedTiers[i].cardImage = oldTier?.cardImage || normalizedTiers[i].cardImage || "";
          }
        }

        const updateData = {
          format: req.body.format,
          totalShapes: req.body.totalShapes,
          stampColor: req.body.stampColor,
          cardColor: req.body.cardColor,
          textColor: req.body.textColor,
          stamp: req.body.stamp,
          stampShape: req.body.stampShape,
          demote: req.body.demote,
          tier: normalizedTiers,
        };

        // Handle removeStampImage flag
        if (req.body.removeStampImage === "true") {
          updateData.customStamp = "";
        }

        // Handle removeCardImage flag
        if (req.body.removeCardImage === "true") {
          updateData.cardImage = "";
        }

        // Parse l5Config if it exists and is not empty
        if (req.body.l5Config) {
          try {
            const parsedL5Config = JSON.parse(req.body.l5Config);
            // Only set l5Config if it has content
            if (parsedL5Config && Object.keys(parsedL5Config).length > 0) {
              updateData.l5Config = parsedL5Config;
            }
          } catch (parseError) {
            console.error("Error parsing l5Config:", parseError);
            return res.status(400).json({
              success: false,
              message: "Invalid L5 configuration format",
            });
          }
        }

        // Parse l6Config if it exists and is not empty
        if (req.body.l6Config) {
          try {
            const parsedL6Config = JSON.parse(req.body.l6Config);
            if (parsedL6Config && Object.keys(parsedL6Config).length > 0) {
              if (Array.isArray(parsedL6Config.missions)) {
                parsedL6Config.missions = ensureMissionMetadata(parsedL6Config.missions);
              }
              updateData.l6Config = parsedL6Config;
            }
          } catch (parseError) {
            console.error("❌ Error parsing l6Config:", parseError);
            return res.status(400).json({
              success: false,
              message: "Invalid L6 configuration format",
            });
          }
        }

        Object.assign(store.loyaltyCard, updateData);

        await store.save();

        return res.json({
          success: true,
          message: "Loyalty Card Saved",
          store,
        });
      } else {
        return res.json({ success: false, message: "You don't have access" });
      }
    } catch (error) {
      console.error("Error in customizeLoyaltyCard:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to save loyalty card",
        error: process.env.NODE_ENV === "development" ? error.toString() : undefined,
      });
    }
  }

  async editStore(req, res) {
    try {
      const { storeId } = req.query;
      const store = await storeModel.findById(storeId);
      if (!store) {
        return res.json({ success: false, message: "Cannot find the store" });
      }

      if (req.user.role !== "admin" && req.user.id != store.user[0]) {
        return res.json({ success: false, message: "You don't have access" });
      }

      const { logo, frontLogo, qrStandBg } = req.files || {};

      const uploadToS3 = async (file) => {
        const imageName = Date.now().toString() + "-" + file.originalname;
        const putObjectParams = {
          Bucket: "samparka",
          Key: imageName,
          Body: file.buffer,
          ContentType: file.mimetype,
        };
        const putCommand = new PutObjectCommand(putObjectParams);
        await s3.send(putCommand);
        return imageName;
      };

      const deleteFromS3 = async (key) => {
        if (key && !key.startsWith("https://")) {
          const deleteParams = {
            Bucket: "samparka",
            Key: key,
          };
          const deleteCommand = new DeleteObjectCommand(deleteParams);
          await s3.send(deleteCommand);
        }
      };

      // Replace logo if provided
      if (logo && logo[0]) {
        await deleteFromS3(store.logo);
        const newLogo = await uploadToS3(logo[0]);
        store.logo = newLogo;
      }

      // Replace frontLogo if provided
      if (frontLogo && frontLogo[0]) {
        await deleteFromS3(store.frontLogo);
        const newFrontLogo = await uploadToS3(frontLogo[0]);
        store.frontLogo = newFrontLogo;
      }

      // Replace qrStandBg if provided
      if (qrStandBg && qrStandBg[0]) {
        await deleteFromS3(store.qrStandBg);
        const newQrStandBg = await uploadToS3(qrStandBg[0]);
        store.qrStandBg = newQrStandBg;
      }

      // Remove qrStandBg if requested
      if (req.body.removeQrStandBg === "true") {
        await deleteFromS3(store.qrStandBg);
        store.qrStandBg = null;
        delete req.body.removeQrStandBg;
      }

      // Update non-image fields
      if ("hasExpiry" in req.body) {
        const hasExpiryVal = req.body.hasExpiry;
        req.body.hasExpiry = hasExpiryVal === true || hasExpiryVal === "true";
      }
      if ("expiryDays" in req.body) {
        req.body.expiryDays =
          req.body.expiryDays && req.body.expiryDays !== "undefined"
            ? Number(req.body.expiryDays)
            : undefined;
      }
      if ("requireOTP" in req.body) {
        const requireOTPVal = req.body.requireOTP;
        req.body.requireOTP = requireOTPVal === true || requireOTPVal === "true";
      }
      if ("requireEmailOTP" in req.body) {
        const v = req.body.requireEmailOTP;
        req.body.requireEmailOTP = v === true || v === "true";
      }
      if ("requirePhoneOTP" in req.body) {
        const v = req.body.requirePhoneOTP;
        req.body.requirePhoneOTP = v === true || v === "true";
      }
      // L4 Format Settings
      if ("pointEarnRate" in req.body) {
        req.body.pointEarnRate = Number(req.body.pointEarnRate) || 0.07;
      }
      // Double points
      if ("doublePoints" in req.body) {
        const v = req.body.doublePoints;
        req.body.doublePoints = v === true || v === "true";
      }
      if ("doublePointsDays" in req.body) {
        const d = req.body.doublePointsDays;
        req.body.doublePointsDays = Array.isArray(d)
          ? d.map(Number).filter((n) => n >= 0 && n <= 6)
          : [];
      }

      // Admin-assigned price label
      if ("price" in req.body) {
        req.body.price =
          req.body.price !== "" && req.body.price !== "undefined"
            ? Number(req.body.price)
            : null;
      }

      if (req.body.logo?.startsWith("https://")) {
        delete req.body.logo;
      }
      if (req.body.frontLogo?.startsWith("https://")) {
        delete req.body.frontLogo;
      }
      if (req.body.qrStandBg?.startsWith("https://")) {
        delete req.body.qrStandBg;
      }

      // Sanitize String fields that Mongoose would cast null → "null"
      if ("conversionRate" in req.body) {
        const cr = req.body.conversionRate;
        req.body.conversionRate = (cr == null || cr === "null" || cr === "undefined") ? "" : String(cr);
      }
      if ("pointValue" in req.body) {
        const pv = req.body.pointValue;
        req.body.pointValue = (pv == null || pv === "null" || pv === "undefined") ? "" : String(pv);
      }

      // Save other changes
      await store.set(req.body);
      await store.save();

      // Generate signed URLs for response
      if (store.logo && !store.logo.startsWith("http")) {
        const logoCmd = new GetObjectCommand({ Bucket: "samparka", Key: store.logo });
        store.logo = await getSignedUrl(s3, logoCmd, { expiresIn: 3600 });
      }
      if (store.frontLogo && !store.frontLogo.startsWith("http")) {
        const frontLogoCmd = new GetObjectCommand({ Bucket: "samparka", Key: store.frontLogo });
        store.frontLogo = await getSignedUrl(s3, frontLogoCmd, { expiresIn: 3600 });
      }
      if (store.qrStandBg && !store.qrStandBg.startsWith("http")) {
        const qrBgCmd = new GetObjectCommand({ Bucket: "samparka", Key: store.qrStandBg });
        store.qrStandBg = await getSignedUrl(s3, qrBgCmd, { expiresIn: 3600 });
      }

      return res.json({ success: true, message: "Store Updated", store });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteStore(req, res) {
    try {
      const { storeId } = req.query;

      const store = await storeModel.findById(storeId);

      if (!store) {
        return res.json({ success: false, message: "Cannot find the store" });
      }
      if (req.user._id.equals(store.user[0]) || req.user.role === "admin") {
        const deleteObjectParams = {
          Bucket: "samparka",
          Key: store.logo,
        };
        const command = new DeleteObjectCommand(deleteObjectParams);
        await s3.send(command);
        const deleteStore = await storeModel.findByIdAndDelete(storeId);

        return res.json({
          success: true,
          message: "Store Deleted Successfully",
        });
      } else {
        return res.json({ success: false, message: "Access Denied" });
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  }

  async editStoreStatus(req, res) {
    try {
      const { storeId } = req.params;
      const { status } = req.body;

      // Validate status value
      if (!["active", "deactive"].includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status value. Must be either 'active' or 'deactive'",
        });
      }

      // Find and update the store
      const store = await storeModel.findByIdAndUpdate(
        storeId,
        { status },
        { new: true }
      );

      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: `Store status updated to ${status}`,
        store,
      });
    } catch (error) {
      console.error("Error updating store status:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating store status",
        error: error.message,
      });
    }
  }

  async editStoreServices(req, res) {
    try {
      const { storeID } = req.params;
      const { service, ocrProvider } = req.body;
      if (!service) {
        return res.status(400).json({ message: "No service data provided" });
      }
      // Find the store first
      const store = await storeModel.findById(storeID);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      // Prepare the update object
      let updateField = {};
      if (service === "ecommerce") {
        updateField = {
          "services.ecommerce.status": !store.services.ecommerce.status,
        };
      } else if (service === "receiptScan" && ocrProvider) {
        // Update OCR provider preference without toggling enabled state
        const validProviders = ["paddleocr", "google_vision", "openai", "gemini"];
        if (!validProviders.includes(ocrProvider)) {
          return res.status(400).json({ message: "Invalid OCR provider" });
        }
        updateField = { "receiptScan.ocrProvider": ocrProvider };
      } else if (service === "receiptScan") {
        updateField = {
          "receiptScan.enabled": !(store.receiptScan?.enabled || false),
        };
      } else {
        updateField = {
          [`services.${service}`]: !store.services[service],
        };
      }
      // Update the store
      const updatedStore = await storeModel.findByIdAndUpdate(
        storeID,
        { $set: updateField },
        { new: true }
      );
      return res.status(200).json(updatedStore);
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  }

  async reservationSettings(req, res) {
    try {
      const storeId = req.body.store;
      let { removedImages, existingImageUrls, timeSlots } = req.body;
      if (!storeId) {
        return res
          .status(400)
          .json({ success: false, message: "Store ID missing" });
      }

      // Parse services
      const services = JSON.parse(req.body.services || "[]");
      // const rawTimeSlots = req.body.needTimeSlots
      //   ? JSON.parse(req.body.timeSlots || "[]")
      //   : [];

      // // Extract the values (convert [{ value: '12:00' }] → ['12:00'])
      // const timeSlots = rawTimeSlots.map((slot) => slot.value);

      if (!Array.isArray(services)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid services data" });
      }

      if (typeof timeSlots === "string") {
        timeSlots = JSON.parse(timeSlots);
      }

      const uploadedImageKeys = [];
      const files = req.files || []; // multiple files

      // Upload new images to S3
      for (const file of files) {
        const imageKey = `${Date.now()}-${file.originalname}`;
        const uploadParams = {
          Bucket: "samparka",
          Key: imageKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        };
        await s3.send(new PutObjectCommand(uploadParams));
        uploadedImageKeys.push(imageKey);
      }

      // Fetch existing setting
      const existing = await reservationSettingModel.findOne({
        store: storeId,
      });

      if (existing) {
        const removedImagesArray = JSON.parse(removedImages);
        const existingImagesArray = JSON.parse(existingImageUrls);

        function getImageNameFromS3Url(url) {
          const s3Url = new URL(url);
          return s3Url.pathname.substring(1);
        }

        const imageNames = removedImagesArray.map((url) =>
          getImageNameFromS3Url(url)
        );

        const existingImages = existingImagesArray.map((url) =>
          getImageNameFromS3Url(url)
        );

        // Decode the URL-encoded image names
        const decodedImageNames = imageNames.map(
          (name) => decodeURIComponent(name.replace(/^samparka\//, "")) // Remove "samparka/"
        );
        const decodedExistingImagesName = existingImages.map(
          (name) => decodeURIComponent(name.replace(/^samparka\//, "")) // Remove "samparka/"
        );

        // Delete images from S3
        for (const img of decodedImageNames) {
          const deleteParams = {
            Bucket: "samparka",
            Key: img, // Ensure `img` is the S3 key, not URL
          };
          const deleteCommand = new DeleteObjectCommand(deleteParams);
          await s3.send(deleteCommand);
        }

        if (uploadedImageKeys.length > 0) {
          existing.images = [
            ...decodedExistingImagesName,
            ...uploadedImageKeys,
          ];
        } else {
          existing.images = decodedExistingImagesName;
        }

        existing.services = services;
        existing.autoConfirmation = req.body.autoConfirmation === "true";
        existing.timeSlots = req.body.needTimeSlots ? timeSlots : [];
        existing.needTimeSlots = req.body.needTimeSlots === "true";
        await existing.save();
        return res
          .status(200)
          .json({ success: true, message: "Reservation settings updated" });
      }

      // Create new setting
      const newSetting = new reservationSettingModel({
        store: storeId,
        services,
        autoConfirmation: req.body.autoConfirmation === "true",
        timeSlots: req.body.needTimeSlots ? timeSlots : [],
        needTimeSlots: req.body.needTimeSlots === "true",
        images: uploadedImageKeys,
      });

      await newSetting.save();

      return res
        .status(201)
        .json({ success: true, message: "Reservation settings created" });
    } catch (error) {
      console.error("Error in reservationSettings:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async reservationService(req, res) {
    try {
      const { storeID } = req.params;
      const {
        name,
        description,
        price,
        autoConfirmation,
        needTimeSlots,
        timeSlots,
      } = req.body;

      const files = req.files || [];
      const uploadedImageKeys = [];

      // Validate required fields
      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Name is required",
        });
      }

      // This is how we Upload new images to S3
      for (const file of files) {
        const imageKey = `${Date.now()}-${file.originalname}`;
        const uploadParams = {
          Bucket: "samparka",
          Key: imageKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        };
        await s3.send(new PutObjectCommand(uploadParams));
        uploadedImageKeys.push(imageKey);
      }
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async getReservationSettings(req, res) {
    try {
      const { store } = req.query;
      if (!store) return res.status(400).json({ message: "Store ID required" });

      const data = await reservationSettingModel.findOne({ store });
      if (!data) return res.status(404).json({ message: "No settings found" });

      // Generate signed URLs for all main images
      if (data.images && Array.isArray(data.images)) {
        const signedUrls = await Promise.all(
          data.images.map(async (key) => {
            const getObjectParams = {
              Bucket: "samparka",
              Key: key,
            };
            const command = new GetObjectCommand(getObjectParams);
            return await getSignedUrl(s3, command);
          })
        );
        data.images = signedUrls;
      }

      // Generate signed URLs for service images
      if (data.services && Array.isArray(data.services)) {
        data.services = await Promise.all(
          data.services.map(async (service) => {
            if (service.images && Array.isArray(service.images)) {
              const signedServiceImages = await Promise.all(
                service.images.map(async (key) => {
                  const getObjectParams = {
                    Bucket: "samparka",
                    Key: key,
                  };
                  const command = new GetObjectCommand(getObjectParams);
                  return await getSignedUrl(s3, command);
                })
              );
              return { ...service.toObject(), images: signedServiceImages };
            }
            return service.toObject();
          })
        );
      }

      res.json(data);
    } catch (error) {
      console.error("Error fetching reservation settings:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async manualReservation(req, res) {
    try {
      const {
        customer, // customer ID (if existing)
        name,
        email,
        phone,
        outlet,
        date,
        time,
        services,
        tableNumber,
        numberOfGuest,
      } = req.body;

      if (!services || !date || !time) {
        return res.json({ success: false, message: "Required fields missing" });
      }

      const { storeURL } = req.params;
      const store = await storeModel.findOne({ url: storeURL });

      if (!store) {
        return res.json({ success: false, message: "Store Not Found" });
      }

      // ✅ Fetch the reservation settings for the store
      const reservationSetting = await reservationSettingModel.findOne({
        store: store._id,
      });

      if (reservationSetting?.needTimeSlots) {
        // Find the specific time slot based on time and outlet (if applicable)
        const selectedSlot = reservationSetting.timeSlots.find(
          (slot) =>
            slot.time === time &&
            (!store.services.multipleOutlets || slot.outlet === outlet)
        );

        if (!selectedSlot) {
          return res.json({
            success: false,
            message: "Invalid time slot selected",
          });
        }

        // Build the query conditionally
        const query = {
          store: store._id,
          date: new Date(date),
          time,
        };

        if (store.services.multipleOutlets) {
          query.outlet = outlet;
        }

        const count = await reservationModel.countDocuments(query);

        if (count >= selectedSlot.numberOfSlots) {
          return res.json({
            success: false,
            message: "No more slots available for the selected time.",
          });
        }
      }

      let customerId = customer;

      // If no customer ID, create a new customer
      if (!customerId) {
        // Optional: Check if customer already exists with same email or phone
        const existingCustomer = await customerModel.findOne({
          store,
          $or: [{ phone }, { email }],
        });

        if (existingCustomer) {
          customerId = existingCustomer._id;
        } else {
          const newCustomer = await customerModel.create({
            store: store._id,
            name,
            email,
            phone,
          });
          customerId = newCustomer._id;
        }
      }

      // Create reservation
      const newReservation = await reservationModel.create({
        customer: customerId,
        store: store._id,
        outlet,
        date,
        time,
        services,
        tableNumber,
        numberOfGuest,
        status: reservationSetting?.autoConfirmation ? "confirmed" : "pending",
      });

      // Checking store Email and Pass to mail customer
      const getMessage = await mailSMSModel.findOne({ store });
      if (store.email && store.pass) {
        if (
          getMessage &&
          getMessage.mailAfterReservation_Admin &&
          getMessage.mailAfterReservation_Admin.subject
        ) {
          let adminEmail = getMessage.mailAfterReservation_Admin.to;
          let subject = getMessage.mailAfterReservation_Admin.subject;
          let message = getMessage.mailAfterReservation_Admin.message;
          const mailResponse = await mailController.mailCustomers({
            user: store.email,
            pass: store.pass,
            host: store.host,
            port: store.port,
            secure: store.secure,
            email: adminEmail,
            subject,
            message,
            storeName: store.name,
            storeURL: store.url,
            storeLogo: store.logo,
            cardColor: store.loyaltyCard?.cardColor,
            textColor: store.loyaltyCard?.textColor,
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
          });
          console.log(mailResponse);
        }
      }

      // Checking store SMS Token to send SMS to customer
      if (store.smsToken) {
        // const getSMS = await mailSMSModel.findOne({ store });
        if (
          getMessage &&
          getMessage.smsAfterReservation_Admin &&
          getMessage.smsAfterReservation_Admin.message
        ) {
          let to = getMessage.smsAfterReservation_Admin.to;
          let from = getMessage.smsAfterReservation_Admin.from;
          let message = getMessage.smsAfterReservation_Admin.message;
          const smsResponse = await smsController.smsCustomer({
            token: store.smsToken,
            to,
            from,
            message,
            storeName: store.name,
            storeURL: store.url,
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
          });
          console.log(smsResponse);
        }
      }

      // Notification to admin after notification
      if (
        getMessage &&
        getMessage.notificationAfterReservation_Admin &&
        getMessage.notificationAfterReservation_Admin.title
      ) {
        let title = getMessage.notificationAfterReservation_Admin.title;
        let body = getMessage.notificationAfterReservation_Admin.body;
        const notificationResponse =
          await notificationController.singleNotification({
            title,
            body,
            userId: store._id,
            storeName: store.name,
            storeURL: store.url,
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
          });
        console.log(notificationResponse);
        if (notificationResponse.success) {
          const receivers = [
            { customer: customerId, read: false, readAt: null },
          ];
          // Create a notification document
          const notification = new notificationModel({
            store: store._id,
            title: title || "Notification",
            message: notificationResponse.formattedMessage || body || "New notification received.",
            receivers,
          });
          await notification.save();
        }
      }

      // confirmation notification to customer
      if (reservationSetting?.autoConfirmation) {
        if (store.email && store.pass) {
          if (
            getMessage &&
            getMessage.mailAfterReservationConfirm &&
            getMessage.mailAfterReservationConfirm.subject
          ) {
            let subject = getMessage.mailAfterReservationConfirm.subject;
            let message = getMessage.mailAfterReservationConfirm.message;
            const mailResponse = await mailController.mailCustomers({
              user: store.email,
              pass: store.pass,
              host: store.host,
              port: store.port,
              secure: store.secure,
              email: email,
              subject,
              message,
              storeName: store.name,
              storeURL: store.url,
              storeLogo: store.logo,
              cardColor: store.loyaltyCard?.cardColor,
              textColor: store.loyaltyCard?.textColor,
              customerName: name,
              customerEmail: email,
              customerPhone: phone,
            });
            console.log(mailResponse);
          }
        }

        // Checking store SMS Token to send SMS to customer
        if (store.smsToken) {
          // const getSMS = await mailSMSModel.findOne({ store });
          if (
            getMessage &&
            getMessage.smsAfterReservationConfirm &&
            getMessage.smsAfterReservationConfirm.message
          ) {
            let from = getMessage.smsAfterReservationConfirm.from;
            let message = getMessage.smsAfterReservationConfirm.message;
            const smsResponse = await smsController.smsCustomer({
              token: store.smsToken,
              to: phone,
              from,
              message,
              storeName: store.name,
              storeURL: store.url,
              customerName: name,
              customerEmail: email,
              customerPhone: phone,
            });
            console.log(smsResponse);
          }
        }

        if (
          getMessage &&
          getMessage.notificationAfterReservationConfirm &&
          getMessage.notificationAfterReservationConfirm.body
        ) {
          let title = getMessage.notificationAfterReservationConfirm.title;
          let body = getMessage.notificationAfterReservationConfirm.body;
          const notificationResponse =
            await notificationController.singleNotification({
              title,
              body,
              userId: customerId,
              storeName: store.name,
              storeURL: store.url,
              customerName: name,
              customerEmail: email,
              customerPhone: phone,
            });
          console.log(notificationResponse);
          if (notificationResponse.success) {
            const receivers = [
              { customer: customerId, read: false, readAt: null },
            ];
            // Create a notification document
            const notification = new notificationModel({
              store: store._id,
              title: title || "Notification",
              message: notificationResponse.formattedMessage || body || "New notification received.",
              receivers,
            });
            await notification.save();
          }
        }
      }

      return res.status(201).json({
        success: true,
        message: "Reservation created successfully",
        reservation: newReservation,
      });
    } catch (error) {
      console.error("Error in manualReservation:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async getReservation(req, res) {
    try {
      const { storeID } = req.params;

      // Step 1: Find the store owned by the user
      const store = await storeModel.findOne({ _id: storeID });
      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found.",
        });
      }

      // Step 2: Get all reservations for that store
      const reservations = await reservationModel
        .find({ store: storeID })
        .sort({ createdAt: -1 })
        .populate("customer", "name email countryCode phone");

      return res.status(200).json({
        success: true,
        message: "Reservations fetched successfully",
        reservations,
      });
    } catch (error) {
      console.error("Error fetching reservation:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async confirmReservation(req, res) {
    try {
      const reservation = await reservationModel
        .findByIdAndUpdate(
          req.params.id,
          { status: "confirmed" },
          { new: true }
        )
        .populate("store customer");

      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }

      const store = reservation.store;
      const customer = reservation.customer;

      // Checking store Email and Pass to mail customer
      const getMessage = await mailSMSModel.findOne({ store });
      if (store.email && store.pass) {
        if (
          getMessage &&
          getMessage.mailAfterReservationConfirm &&
          getMessage.mailAfterReservationConfirm.subject
        ) {
          let subject = getMessage.mailAfterReservationConfirm.subject;
          let message = getMessage.mailAfterReservationConfirm.message;
          const mailResponse = await mailController.mailCustomers({
            user: store.email,
            pass: store.pass,
            host: store.host,
            port: store.port,
            secure: store.secure,
            email: customer.email,
            subject,
            message,
            storeName: store.name,
            storeURL: store.url,
            storeLogo: store.logo,
            cardColor: store.loyaltyCard?.cardColor,
            textColor: store.loyaltyCard?.textColor,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
          });
          console.log(mailResponse);
        }
      }

      // Checking store SMS Token to send SMS to customer
      if (store.smsToken) {
        // const getSMS = await mailSMSModel.findOne({ store });
        if (
          getMessage &&
          getMessage.smsAfterReservationConfirm &&
          getMessage.smsAfterReservationConfirm.message
        ) {
          let from = getMessage.smsAfterReservationConfirm.from;
          let message = getMessage.smsAfterReservationConfirm.message;
          const smsResponse = await smsController.smsCustomer({
            token: store.smsToken,
            to: customer.phone,
            from,
            message,
            storeName: store.name,
            storeURL: store.url,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
          });
          console.log(smsResponse);
        }
      }

      if (
        getMessage &&
        getMessage.notificationAfterReservationConfirm &&
        getMessage.notificationAfterReservationConfirm.body
      ) {
        let title = getMessage.notificationAfterReservationConfirm.title;
        let body = getMessage.notificationAfterReservationConfirm.body;
        const notificationResponse =
          await notificationController.singleNotification({
            title,
            body,
            userId: customer._id,
            storeName: store.name,
            storeURL: store.url,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
          });
        console.log(notificationResponse);
        if (notificationResponse.success) {
          const receivers = [
            { customer: customer._id, read: false, readAt: null },
          ];
          // Create a notification document
          const notification = new notificationModel({
            store: store._id,
            title: title || "Notification",
            message: notificationResponse.formattedMessage || body || "New notification received.",
            receivers,
          });
          await notification.save();
        }
      }

      res.status(200).json({ success: true, data: reservation });
    } catch (err) {
      console.error("Error confirming reservation:", err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async cancelReservation(req, res) {
    try {
      const reservation = await reservationModel.findByIdAndUpdate(
        req.params.id,
        { status: "cancelled" },
        { new: true }
      );

      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }

      res.status(200).json({ success: true, data: reservation });
    } catch (err) {
      console.error("Error cancelling reservation:", err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async noShow(req, res) {
    try {
      const reservation = await reservationModel.findByIdAndUpdate(
        req.params.id,
        { status: "noShow" },
        { new: true }
      );

      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }

      res.status(200).json({ success: true, data: reservation });
    } catch (err) {
      console.error("Error updating reservation status to No Show:", err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async completedReservation(req, res) {
    try {
      const reservation = await reservationModel.findByIdAndUpdate(
        req.params.id,
        { status: "completed" },
        { new: true }
      );

      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }

      res.status(200).json({ success: true, data: reservation });
    } catch (err) {
      console.error("Error updating reservation status to completed:", err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async editDelivery(req, res) {
    try {
      const { storeID } = req.params;
      const { deliveryType } = req.body;
      if (!deliveryType) {
        return res.status(400).json({ message: "Invalid deliveryType data" });
      }

      const store = await storeModel.findById(storeID);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      let updateField = {};
      updateField = {
        [`services.ecommerce.deliveryType.${deliveryType}`]:
          !store.services.ecommerce.deliveryType[deliveryType],
      };
      const updatedStore = await storeModel.findByIdAndUpdate(
        storeID,
        { $set: updateField },
        { new: true }
      );
      return res.status(200).json({
        message: "Delivery options updated successfully",
        updatedStore,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  //Create Outlet
  // Get all outlets for a store
  async getOutlets(req, res) {
    try {
      const { storeID } = req.params;
      const outlets = await outletModel.find({ store: storeID });
      return res.json({ success: true, outlets });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch outlets" });
    }
  }

  // Resolve a (possibly shortened) map link and return coordinates
  resolveMapLink = async (req, res) => {
    try {
      const { url } = req.query;
      if (!url) {
        return res.status(400).json({ success: false, message: "url is required" });
      }

      // First try parsing coords directly from the given URL
      let coords = parseCoordsFromUrl(url);

      if (!coords) {
        // Follow redirects to get the final URL (handles maps.app.goo.gl etc.)
        try {
          const response = await axios.get(url, {
            maxRedirects: 10,
            timeout: 8000,
            headers: { "User-Agent": "Mozilla/5.0" },
          });
          const finalUrl = response.request?.res?.responseUrl || response.config?.url || url;
          coords = parseCoordsFromUrl(finalUrl);
        } catch (err) {
          // axios may throw on non-2xx; try extracting from the error's redirect URL
          const redirectUrl = err?.request?._redirectable?._currentUrl || err?.config?.url;
          if (redirectUrl) coords = parseCoordsFromUrl(redirectUrl);
        }
      }

      if (!coords) {
        return res.json({ success: false, message: "Could not extract coordinates from this link" });
      }

      return res.json({ success: true, ...coords });
    } catch (error) {
      console.error("❌ resolveMapLink error:", error);
      return res.status(500).json({ success: false, message: "Failed to resolve map link" });
    }
  };

  async createOutlet(req, res) {
    try {
      const { storeID } = req.params;
      const { location, phone, mapLink, lat, lng } = req.body;
      const store = await storeModel.findById(storeID);
      if (!store) {
        return res.json({ success: false, message: "Store Not Found" });
      }
      if (!location) {
        return res
          .status(400)
          .json({ success: false, message: "Location is required" });
      }
      if (!phone) {
        return res
          .status(400)
          .json({ success: false, message: "Phone is required" });
      }

      const outletData = { location, phone, store: storeID };
      if (mapLink) outletData.mapLink = mapLink;
      if (lat != null) outletData.lat = lat;
      if (lng != null) outletData.lng = lng;

      const outlet = await outletModel.create(outletData);
      // Push new outlet to store's outlets array
      store.outlets.push(outlet._id);
      await store.save(); // Save updated store

      await outletPointsModel.create({ store, outlet });

      return res.json({ success: true, message: "New Outlet Created", outlet });
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  }

  // Edit Outlet
  async editOutlet(req, res) {
    try {
      const { outletId } = req.params;
      const { location, phone, mapLink, lat, lng } = req.body;

      if (!location) {
        return res
          .status(400)
          .json({ success: false, message: "Location is required" });
      }

      if (!phone) {
        return res
          .status(400)
          .json({ success: false, message: "Phone is required" });
      }

      const updateData = { location, phone };
      if (mapLink) updateData.mapLink = mapLink;
      if (lat != null) updateData.lat = lat;
      if (lng != null) updateData.lng = lng;

      const outlet = await outletModel.findByIdAndUpdate(outletId, updateData, {
        new: true,
      });

      if (!outlet) {
        return res
          .status(404)
          .json({ success: false, message: "Outlet not found" });
      }

      return res.json({
        success: true,
        message: "Outlet updated successfully",
        outlet,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to update outlet" });
    }
  }

  // Delete Outlet
  async deleteOutlet(req, res) {
    try {
      const { outletId } = req.params;

      // Step 1: Delete the outlet
      const outlet = await outletModel.findByIdAndDelete(outletId);

      if (!outlet) {
        return res
          .status(404)
          .json({ success: false, message: "Outlet not found" });
      }

      // Step 2: Remove outlet ID from its store's outlets array
      await storeModel.findByIdAndUpdate(outlet.store, {
        $pull: { outlets: outlet._id },
      });

      // Step 3: Delete related outlet points
      await outletPointsModel.deleteMany({ outlet: outletId });

      return res
        .status(200)
        .json({ success: true, message: "Outlet deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  }

  // SMTP CONFIG
  async configSMTP(req, res) {
    try {
      const { storeID } = req.params;
      // const { email, pass } = req.body;
      const store = await storeModel.findById(storeID);
      if (!store) {
        return res.json({ success: false, message: "Store Not Found" });
      }
      // if (!validator.isEmail(email)) {
      //   return res.json({ success: false, message: "Invalid email address" });
      // }
      if (req.user._id.equals(store.user[0]) || req.user.role === "admin") {
        const config = await storeModel.findByIdAndUpdate(
          storeID,
          { ...req.body },
          { new: true }
        );
        const mailSMS = await mailSMSModel.findOne({ store });
        if (!mailSMS) {
          await mailSMSModel.create({ store });
        }
        return res.json({
          success: true,
          message: "SMTP Configured Successfully.",
          config,
        });
      } else {
        return res.json({ success: false, message: "Access Denied" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  }
  // SMTP TEST
  async testSMTP(req, res) {
    try {
      const { storeID } = req.params;
      const { to } = req.body;

      if (!to) {
        return res.json({ success: false, message: "Recipient email address is required." });
      }

      const store = await storeModel.findById(storeID);
      if (!store) {
        return res.json({ success: false, message: "Store not found." });
      }

      if (req.user._id.equals(store.user[0]) || req.user.role === "admin") {
        if (!store.email || !store.pass) {
          return res.json({ success: false, message: "SMTP is not configured for this store. Please save your SMTP settings first." });
        }

        const nodemailer = require("nodemailer");

        const transportConfig =
          store.host && store.port
            ? {
                host: store.host,
                port: Number(store.port),
                secure: store.secure === "ssl",
                ...(store.secure === "none" && { ignoreTLS: true }),
                auth: { user: store.email, pass: store.pass },
              }
            : {
                service: "gmail",
                auth: { user: store.email, pass: store.pass },
              };

        const transporter = nodemailer.createTransport(transportConfig);

        try {
          await transporter.verify();
        } catch (verifyError) {
          console.error("❌ SMTP verify failed:", verifyError.message);
          return res.json({
            success: false,
            message: `SMTP connection failed: ${verifyError.message}`,
          });
        }

        try {
          await transporter.sendMail({
            from: store.email,
            to,
            subject: `SMTP Test — ${store.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb;">
                <h2 style="color: #16a34a; margin-bottom: 8px;">✅ SMTP Test Successful</h2>
                <p style="color: #374151; margin-bottom: 4px;">This is a test email sent from <strong>${store.name}</strong> via Samparka.</p>
                <p style="color: #374151; margin-bottom: 4px;">Your SMTP configuration is working correctly.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                <p style="color: #9ca3af; font-size: 12px;">SMTP Host: ${store.host || "Gmail"} &nbsp;|&nbsp; Port: ${store.port || "N/A"} &nbsp;|&nbsp; Security: ${store.secure || "tls"}</p>
              </div>
            `,
          });

          console.log(`✅ SMTP test email sent for store ${store.name} to ${to}`);
          return res.json({ success: true, message: `Test email sent successfully to ${to}. Check your inbox (and spam folder).` });
        } catch (sendError) {
          console.error("❌ SMTP test send failed:", sendError.message);
          return res.json({
            success: false,
            message: `SMTP connected but failed to send: ${sendError.message}`,
          });
        }
      } else {
        return res.json({ success: false, message: "Access Denied" });
      }
    } catch (error) {
      console.error("❌ testSMTP error:", error);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
  }

  // SMS CONFIG
  async configSMS(req, res) {
    try {
      const { storeID } = req.params;
      const { smsToken } = req.body;
      const store = await storeModel.findById(storeID);
      if (!store) {
        return res.json({ success: false, message: "Store Not Found" });
      }
      if (req.user._id.equals(store.user[0]) || req.user.role === "admin") {
        const config = await storeModel.findByIdAndUpdate(
          storeID,
          { smsToken },
          { new: true }
        );
        const mailSMS = await mailSMSModel.findOne({ store });
        if (!mailSMS) {
          await mailSMSModel.create({ store });
        }
        return res.json({
          success: true,
          message: "SMS Configured Successfully.",
          config,
        });
      } else {
        return res.json({ success: false, message: "Access Denied" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  }

  //STORE SIDE APIS
  /**
   * Verifies store PIN with multi-phase lockout protection.
   * 
   * Security flow:
   * 1. Middleware checks if device is locked/blocked (runs before this)
   * 2. This controller validates the PIN
   * 3. On failure: records attempt with phase-based lockout
   * 4. On success: clears all lockout data
   */
  async verifyPIN(req, res) {
    try {
      const { pin } = req.body;
      const { storeURL } = req.params;
      
      // Import lockout service functions
      const { 
        recordFailedAttempt, 
        clearLockoutOnSuccess,
        getLockoutInfo,
        CONFIG 
      } = require("../middlewares/pinLockoutMiddleware.js");

      // Find the store by URL
      const store = await storeModel.findOne({ url: storeURL });
      if (!store) {
        return res.json({ success: false, message: "Store not found" });
      }

      // Validate PIN - check if custom PIN is set or use default
      let isPINValid = false;
      if (store.pin && store.pin !== "1234") {
        // Custom PIN is set - compare with bcrypt hash
        isPINValid = bcrypt.compareSync(pin, store.pin);
      } else {
        // Default PIN check
        isPINValid = pin === "1234";
      }

      // Handle invalid PIN - record failed attempt with phase-based lockout
      if (!isPINValid) {
        const lockoutInfo = await recordFailedAttempt(store._id, req);
        
        return res.json({
          success: false,
          message: lockoutInfo.message,
          locked: lockoutInfo.locked || false,
          blocked: lockoutInfo.blocked || false,
          remainingTime: lockoutInfo.remainingTime || null,
          attemptsRemaining: lockoutInfo.attemptsRemaining,
          lockPhase: lockoutInfo.lockPhase,
          warning: lockoutInfo.warning || false,
        });
      }

      // PIN is valid - clear all lockout data for this device
      await clearLockoutOnSuccess(store._id, req);

      return res.json({
        success: true,
        message: "PIN Verified",
        token: generateToken(store._id, "1d"),
        attemptsRemaining: CONFIG.PHASE_0_MAX_ATTEMPTS,
      });
    } catch (error) {
      console.error("[verifyPIN] Error:", error);
      return res.status(500).json({ 
        success: false, 
        message: "An error occurred. Please try again." 
      });
    }
  }
  async changeCustomerCode(req, res) {
    try {
      const { storeID } = req.params;
      const { customerCode } = req.body;

      if (!/^\d{6}$/.test(String(customerCode || ""))) {
        return res.json({
          success: false,
          message: "Customer code must be exactly 6 digits",
        });
      }

      const store = await storeModel.findById(storeID);
      if (!store) {
        return res.json({ success: false, message: "Store not found" });
      }

      store.customerCode = String(customerCode);
      await store.save();
      return res.json({
        success: true,
        message: "Customer code updated",
        customerCode: store.customerCode,
      });
    } catch (error) {
      console.error("❌ changeCustomerCode error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update customer code",
      });
    }
  }
  async changePIN(req, res) {
    try {
      const { storeID } = req.params;
      const { oldPIN, newPIN } = req.body;
      const store = await storeModel.findById(storeID);
      if (!/^\d{4}$/.test(oldPIN) || !/^\d{4}$/.test(newPIN)) {
        return res.json({
          success: false,
          message: "PIN must be exactly 4 digits",
        });
      }

      if (!store) {
        return res.json({ success: false, message: "Store not found" });
      }
      if (store.pin && store.pin !== "1234") {
        const isPINValid = bcrypt.compareSync(oldPIN, store.pin);
        if (!isPINValid) {
          return res.json({ success: false, message: "Invalid PIN" });
        }
      } else {
        if (oldPIN !== "1234") {
          return res.json({ success: false, message: "Invalid PIN" });
        }
      }
      const hashedPIN = bcrypt.hashSync(newPIN, 10);
      store.pin = hashedPIN;
      await store.save();
      return res.json({ success: true, message: "PIN Changed" });
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  }
  async getRedeemedRewards(req, res) {
    try {
      const { storeURL } = req.params;
      const store = await storeModel.findOne({ url: storeURL });
      if (!store) {
        return res.json({ success: false, message: "Store not found" });
      }

      console.log('[getRedeemedRewards] Store format:', store.loyaltyCard?.format);

      // Fetch regular redemptions
      const redeemedRewards = await redemptionModel
        .find({ store })
        .sort({
          createdAt: -1,
        })
        .populate("reward customer");

      if (redeemedRewards.length > 0) {
        await Promise.all(
          redeemedRewards.map(async (reward) => {
            if (
              reward.expiryDate &&
              (reward.expiryDate <= reward.redeemDate ||
              reward.expiryDate < new Date())
            ) {
              reward.status = "expired";
              await reward.save();
            }
          })
        );
      }

      // If store has L5 format, also fetch L5 redemptions
      let allRedemptions = [...redeemedRewards];

      if (store.loyaltyCard?.format === "L5") {
        console.log('[getRedeemedRewards] L5 format detected, fetching L5 redemptions');

        const L5Redemption = require("../models/l5RedemptionModel");
        const l5Redemptions = await L5Redemption
          .find({ store: store._id })
          .sort({ redemptionDate: -1 })
          .populate("customer outlet")
          .lean();

        console.log('[getRedeemedRewards] Found L5 redemptions:', l5Redemptions.length);

        // Transform L5 redemptions to match regular redemption structure
        const transformedL5Redemptions = l5Redemptions.map((l5Redemption) => {
          // Map L5 status to regular redemption status
          let mappedStatus = "pending";
          if (l5Redemption.status === "used") {
            mappedStatus = "claimed";
          } else if (l5Redemption.status === "expired") {
            mappedStatus = "expired";
          } else if (l5Redemption.status === "active" || l5Redemption.status === "pending") {
            mappedStatus = "pending";
          }

          // Check if expired based on date
          if (
            l5Redemption.expiryDate <= l5Redemption.redemptionDate ||
            l5Redemption.expiryDate < new Date()
          ) {
            mappedStatus = "expired";
            // Update in database
            L5Redemption.findByIdAndUpdate(l5Redemption._id, { status: "expired" }).exec();
          }

          // Create reward name display
          let rewardDisplayName = l5Redemption.rewardName || "L5 Reward";
          if (l5Redemption.rewardType === "discount" && l5Redemption.discountPercentage) {
            rewardDisplayName = `${l5Redemption.discountPercentage}% Discount - ${rewardDisplayName}`;
          }
          rewardDisplayName += ` (${l5Redemption.pointsThreshold} pts)`;

          // Add outlet location to display
          const outletInfo = l5Redemption.outlet?.location || l5Redemption.outlet?.name || "Unknown Outlet";
          rewardDisplayName += ` at ${outletInfo}`;

          return {
            _id: l5Redemption._id,
            reward: {
              name: rewardDisplayName,
              _id: `l5-${l5Redemption._id}`, // Prefix to indicate L5 reward
            },
            customer: l5Redemption.customer,
            billID: l5Redemption.billID || "",
            redeemDate: l5Redemption.redemptionDate,
            expiryDate: l5Redemption.expiryDate,
            status: mappedStatus,
            createdAt: l5Redemption.redemptionDate,
            // Additional L5-specific fields for reference
            isL5Reward: true,
            outlet: l5Redemption.outlet,
            pointsThreshold: l5Redemption.pointsThreshold,
            rewardType: l5Redemption.rewardType,
          };
        });

        // Combine regular and L5 redemptions
        allRedemptions = [...redeemedRewards, ...transformedL5Redemptions];

        // Sort combined array by date (most recent first)
        allRedemptions.sort((a, b) => {
          const dateA = a.redeemDate || a.createdAt || new Date(0);
          const dateB = b.redeemDate || b.createdAt || new Date(0);
          return dateB - dateA;
        });

        console.log('[getRedeemedRewards] Total redemptions (regular + L5):', allRedemptions.length);
      }

      return res.json({ success: true, redeemedRewards: allRedemptions });
    } catch (error) {
      console.error('[getRedeemedRewards] Error:', error);
      return res.status(500).send(error);
    }
  }
  async claimReward(req, res) {
    try {
      const { storeURL } = req.params;
      const { rewardID, billID, outletLocation } = req.query;
      const store = await storeModel.findOne({ url: storeURL });

      if (!store) {
        return res.json({ success: false, message: "Store not found" });
      }

      console.log('[claimReward] Attempting to claim reward:', rewardID);

      // Try to find regular redemption first
      let redemption = await redemptionModel
        .findById(rewardID)
        .populate("reward customer");

      let isL5Reward = false;
      let customer, reward;

      // If not found in regular redemptions, check L5 redemptions
      if (!redemption) {
        const L5Redemption = require("../models/l5RedemptionModel");
        redemption = await L5Redemption
          .findById(rewardID)
          .populate("customer outlet");

        if (redemption) {
          isL5Reward = true;
          console.log('[claimReward] Found L5 redemption');
        }
      }

      if (!redemption) {
        return res.json({ success: false, message: "Reward not found" });
      }

      // Handle L5 redemption
      if (isL5Reward) {
        // Map L5 status to check conditions
        if (redemption.status === "used") {
          return res.json({ success: false, message: "Reward already claimed" });
        }
        if (redemption.status === "expired") {
          return res.json({ success: false, message: "Reward Expired" });
        }
        if (
          redemption.expiryDate &&
          (redemption.expiryDate <= redemption.redemptionDate ||
          redemption.expiryDate < new Date())
        ) {
          redemption.status = "expired";
          await redemption.save();
          return res.json({ success: false, message: "Reward Expired" });
        }

        // Update L5 redemption status
        redemption.status = "used"; // L5 uses "used" instead of "claimed"
        redemption.billID = billID;
        redemption.usageDate = new Date();
        await redemption.save();

        customer = redemption.customer;

        // Create reward object for notifications (L5 doesn't have a separate reward model)
        let rewardDisplayName = redemption.rewardName || "L5 Reward";
        if (redemption.rewardType === "discount" && redemption.discountPercentage) {
          rewardDisplayName = `${redemption.discountPercentage}% Discount - ${rewardDisplayName}`;
        }
        const outletInfo = redemption.outlet?.location || redemption.outlet?.name || "Unknown Outlet";
        rewardDisplayName += ` at ${outletInfo}`;

        reward = { name: rewardDisplayName };

        console.log('[claimReward] L5 reward claimed successfully');
      } else {
        // Handle regular redemption
        if (redemption.status == "claimed") {
          return res.json({ success: false, message: "Reward already claimed" });
        }
        if (redemption.status == "expired") {
          return res.json({ success: false, message: "Reward Expired" });
        }
        if (
          redemption.expiryDate &&
          (redemption.expiryDate <= redemption.redeemDate ||
          redemption.expiryDate < new Date())
        ) {
          redemption.status = "expired";
          await redemption.save();
          return res.json({ success: false, message: "Reward Expired" });
        }
        redemption.status = "claimed";
        redemption.billID = billID;
        await redemption.save();

        customer = redemption.customer;
        reward = redemption.reward;

        console.log('[claimReward] Regular reward claimed successfully');
      }

      // Checking store Email and Pass to mail customer
      const getMessage = await mailSMSModel.findOne({ store });
      if (store.email && store.pass) {
        if (
          getMessage &&
          getMessage.mailAfterRewardClaimed &&
          getMessage.mailAfterRewardClaimed.subject
        ) {
          let subject = getMessage.mailAfterRewardClaimed.subject;
          let message = getMessage.mailAfterRewardClaimed.message;
          const mailResponse = await mailController.mailCustomers({
            user: store.email,
            pass: store.pass,
            host: store.host,
            port: store.port,
            secure: store.secure,
            email: customer.email,
            subject,
            message,
            reward: reward.name,
            storeName: store.name,
            storeURL: store.url,
            storeLogo: store.logo,
            cardColor: store.loyaltyCard?.cardColor,
            textColor: store.loyaltyCard?.textColor,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
          });
          console.log(mailResponse);
        }
      }

      // Checking store SMS Token to send SMS to customer
      if (store.smsToken) {
        // const getSMS = await mailSMSModel.findOne({ store });
        if (
          getMessage &&
          getMessage.smsAfterRewardClaimed &&
          getMessage.smsAfterRewardClaimed.message
        ) {
          let from = getMessage.smsAfterRewardClaimed.from;
          let message = getMessage.smsAfterRewardClaimed.message;
          const smsResponse = await smsController.smsCustomer({
            token: store.smsToken,
            to: customer.phone,
            from,
            message,
            reward: reward.name,
            storeName: store.name,
            storeURL: store.url,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
          });
          console.log(smsResponse);
        }
      }

      if (
        getMessage &&
        getMessage.notificationAfterRewardClaimed &&
        getMessage.notificationAfterRewardClaimed.body
      ) {
        let title = getMessage.notificationAfterRewardClaimed.title;
        let body = getMessage.notificationAfterRewardClaimed.body;
        const notificationResponse =
          await notificationController.singleNotification({
            title,
            body,
            reward: reward.name,
            userId: customer._id,
            storeName: store.name,
            storeURL: store.url,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
          });
        console.log(notificationResponse);
        if (notificationResponse.success) {
          const receivers = [
            { customer: customer._id, read: false, readAt: null },
          ];
          // Create a notification document
          const notification = new notificationModel({
            store: store._id,
            title: title || "Notification",
            message: notificationResponse.formattedMessage || body || "New notification received.",
            receivers,
          });
          await notification.save();
        }
      }

      // For L4 format: create PointDeductionLog now that staff has physically confirmed the reward.
      // This ensures the settlement report only shows claimed rewards, not just customer-initiated ones.
      if (!isL5Reward && store.loyaltyCard?.format === "L4") {
        try {
          const claimingOutlet = outletLocation || null;
          const pointDeductionLogModel = require("../models/pointDeductionLogModel");
          const { calculateProportionalSplit } = require("../services/l4SettlementService");
          const rewardDoc = reward; // already populated above
          const pointCost = rewardDoc?.pointCost || 0;

          let outletContributions = [];
          if (store.services?.multipleOutlets && pointCost > 0) {
            try {
              outletContributions = await calculateProportionalSplit(
                customer._id,
                store._id,
                pointCost
              );
            } catch (splitError) {
              console.error("❌ [L4 claimReward] proportional split error:", splitError);
            }
          }

          await pointDeductionLogModel.create({
            customer: customer._id,
            store: store._id,
            reward: rewardDoc?._id || null,
            redemption: redemption._id,
            outlet: claimingOutlet,
            billID: billID || redemption.billID || null,
            pointsDeducted: pointCost,
            balanceBefore: customer.points + pointCost, // approximate — points were deducted at redeem time
            balanceAfter: customer.points,
            tier: customer.tier,
            reason: "reward_redemption",
            outletContributions: outletContributions,
          });

          console.log(`✅ [L4 claimReward] PointDeductionLog created for ${customer.name} — ${pointCost} pts claimed at outlet: ${claimingOutlet || "unknown"}`);
        } catch (logError) {
          // Non-fatal: log the error but still return success to staff
          console.error("❌ [L4 claimReward] Failed to create PointDeductionLog:", logError);
        }
      }

      return res.json({ success: true, message: "Reward Claimed" });
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  }

  async claimRewardForCustomer(req, res) {
    try {
      const { storeURL } = req.params;
      const { customerId, rewardId, outletId } = req.body;

      const store = await storeModel.findOne({ url: storeURL });
      if (!store) {
        return res.json({ success: false, message: "Store not found" });
      }

      if (store.letSubAdminToClaimRewards === false) {
        return res.json({ success: false, message: "Sub-admin reward claiming is disabled" });
      }

      const customer = await customerModel.findById(customerId);
      if (!customer) {
        return res.json({ success: false, message: "Customer not found" });
      }

      const storeFormat = store.loyaltyCard?.format;
      let redemption, reward, rewardName, pointsDeducted = 0;

      // L5 Format
      if (storeFormat === "L5") {
        console.log('[claimRewardForCustomer L5] Received:', { customerId, rewardId, outletId, customerPoints: customer.points });
        const CustomerOutletPoints = require("../models/customerOutletPointsModel");
        const L5Redemption = require("../models/l5RedemptionModel");
        const rewardModel = require("../models/rewardModel");
        const outletModel = require("../models/outletModel");
        const l5ControllerInstance = require("./l5Controller");
        const L5PointsTransaction = require("../models/l5PointsTransactionModel");

        if (!outletId) {
          return res.json({ success: false, message: "Outlet ID is required for L5 format" });
        }

        const rewardDoc = await rewardModel.findById(rewardId);
        if (!rewardDoc || rewardDoc.type !== "l5") {
          return res.json({ success: false, message: "Reward not found or invalid for L5" });
        }

        const numericThreshold = Number(rewardDoc.threshold);
        console.log('[claimRewardForCustomer L5] Querying CustomerOutletPoints:', {
          customer: customerId,
          store: store._id.toString(),
          outlet: outletId,
        });
        const outletPoints = await CustomerOutletPoints.findOne({
          customer: customerId,
          store: store._id,
          outlet: outletId,
        });
        console.log('[claimRewardForCustomer L5] Found outletPoints:', outletPoints);

        if (!outletPoints || outletPoints.currentPoints < numericThreshold) {
          // Get all outlet points for better error message
          const allOutletPoints = await CustomerOutletPoints.find({
            customer: customerId,
            store: store._id,
          }).populate('outlet', 'name location');
          const totalAllOutlets = allOutletPoints.reduce((sum, op) => sum + op.currentPoints, 0);
          const currentOutlet = allOutletPoints.find(op => op.outlet?._id?.toString() === outletId);
          const outletName = currentOutlet?.outlet?.name || currentOutlet?.outlet?.location || 'this outlet';
          return res.json({
            success: false,
            message: `${customer.name} doesn't have enough points at ${outletName} to claim ${rewardDoc.name || 'this reward'}. ${customer.name} has ${outletPoints?.currentPoints || 0} points at this outlet (total across all outlets: ${totalAllOutlets}). ${rewardDoc.name || 'This reward'} requires ${numericThreshold} points.`,
          });
        }

        const outlet = await outletModel.findById(outletId);
        outletPoints.currentPoints -= numericThreshold;
        outletPoints.totalPointsRedeemed += numericThreshold;
        outletPoints.lastTransactionDate = new Date();
        await outletPoints.save();

        const l5Config = store.loyaltyCard?.l5Config || {};
        const validityDays = rewardDoc.validity && rewardDoc.validity !== "instant"
          ? parseInt(rewardDoc.validity) || l5Config.discountValidityDays || 30
          : (rewardDoc.validity === "instant" ? 0 : l5Config.discountValidityDays || 30);
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + validityDays);

        redemption = await L5Redemption.create({
          store: store._id,
          customer: customerId,
          outlet: outletId,
          pointsThreshold: numericThreshold,
          pointsDeducted: numericThreshold,
          rewardType: rewardDoc.rewardType,
          discountPercentage: rewardDoc.discountPercentage,
          rewardName: rewardDoc.name,
          status: "used",
          expiryDate,
          usageDate: new Date(),
          usageOutlet: outletId,
        });

        await L5PointsTransaction.create({
          store: store._id,
          customer: customerId,
          outlet: outletId,
          transactionType: "redeem",
          points: -numericThreshold,
          balanceAfter: outletPoints.currentPoints,
          redemption: redemption._id,
          description: `Staff claimed ${rewardDoc.name || rewardDoc.discountPercentage + "% discount"} for customer`,
        });

        const allOutletPoints = await CustomerOutletPoints.find({ customer: customerId, store: store._id });
        const totalL5Points = allOutletPoints.reduce((sum, op) => sum + op.currentPoints, 0);
        await customerModel.findByIdAndUpdate(customerId, { points: totalL5Points, pointChangeDate: new Date() });

        await l5ControllerInstance.updateCustomerL5Data(customerId, store._id);

        rewardName = rewardDoc.name || "L5 Reward";
        pointsDeducted = numericThreshold;
        reward = rewardDoc;
      }
      // Standard / L3 / L4 / L6 Format
      else {
        const rewardModel = require("../models/rewardModel");
        const rewardDoc = await rewardModel.findById(rewardId);
        if (!rewardDoc) {
          return res.json({ success: false, message: "Reward not found" });
        }

        if (storeFormat === "L4" && rewardDoc.type !== "l4") {
          return res.json({ success: false, message: "Invalid reward type for L4 store" });
        }
        if (storeFormat === "L6" && rewardDoc.type !== "l6") {
          return res.json({ success: false, message: "Invalid reward type for L6 store" });
        }
        if ((storeFormat === "L3" || storeFormat === "L34HA") && rewardDoc.type !== "constant") {
          return res.json({ success: false, message: "Invalid reward type for L3 store" });
        }
        if (!storeFormat || storeFormat === "standard") {
          if (rewardDoc.type && rewardDoc.type !== "standard") {
            return res.json({ success: false, message: "Invalid reward type for standard store" });
          }
        }

        if (rewardDoc.tier && customer.tier !== rewardDoc.tier) {
          return res.json({ success: false, message: `This reward is only available for ${rewardDoc.tier} tier members` });
        }

        const redemptionCount = await redemptionModel.countDocuments({ customer: customerId, reward: rewardId });
        if (!rewardDoc.evergreen && redemptionCount >= (rewardDoc.redeemableTimes || 1)) {
          return res.json({ success: false, message: "Redemption limit reached for this reward" });
        }

        const pointCost = rewardDoc.points || rewardDoc.pointCost || 0;
        if (pointCost > 0 && customer.points < pointCost) {
          return res.json({ success: false, message: `Not enough points. Needs ${pointCost}, has ${customer.points}` });
        }

        if (pointCost > 0) {
          customer.points -= pointCost;
          customer.pointChangeDate = new Date();
          await customer.save();
          pointsDeducted = pointCost;
        }

        const outletLocation = store.services?.multipleOutlets
          ? (store.outlets?.find(o => o._id.toString() === outletId)?.location || "")
          : "";

        redemption = await redemptionModel.create({
          store: store._id,
          customer: customerId,
          reward: rewardId,
          status: "claimed",
          initiatedBy: "staff",
          outlet: outletLocation || null,
        });

        if (storeFormat === "L4" && pointCost > 0) {
          try {
            const pointDeductionLogModel = require("../models/pointDeductionLogModel");
            const { calculateProportionalSplit } = require("../services/l4SettlementService");
            let outletContributions = [];
            if (store.services?.multipleOutlets) {
              try {
                outletContributions = await calculateProportionalSplit(customerId, store._id, pointCost);
              } catch (splitError) {
                console.error("❌ [claimRewardForCustomer L4] proportional split error:", splitError);
              }
            }
            await pointDeductionLogModel.create({
              customer: customerId,
              store: store._id,
              reward: rewardDoc._id,
              redemption: redemption._id,
              outlet: outletLocation || null,
              pointsDeducted: pointCost,
              balanceBefore: customer.points + pointCost,
              balanceAfter: customer.points,
              tier: customer.tier,
              reason: "reward_redemption",
              outletContributions,
            });
          } catch (logError) {
            console.error("❌ [claimRewardForCustomer] Failed to create PointDeductionLog:", logError);
          }
        }

        rewardName = rewardDoc.name;
        reward = rewardDoc;
      }

      // Notifications
      const mailSMSModel = require("../models/mailSMSModel");
      const getMessage = await mailSMSModel.findOne({ store });

      if (store.email && store.pass && getMessage?.mailAfterRewardClaimed?.subject) {
        try {
          await mailController.mailCustomers({
            user: store.email, pass: store.pass,
            host: store.host, port: store.port, secure: store.secure,
            email: customer.email,
            subject: getMessage.mailAfterRewardClaimed.subject,
            message: getMessage.mailAfterRewardClaimed.message,
            reward: rewardName, storeName: store.name, storeURL: store.url,
            storeLogo: store.logo,
            cardColor: store.loyaltyCard?.cardColor,
            textColor: store.loyaltyCard?.textColor,
            customerName: customer.name, customerEmail: customer.email, customerPhone: customer.phone,
          });
        } catch (e) { console.error("❌ Email notification error:", e); }
      }

      if (store.smsToken && getMessage?.smsAfterRewardClaimed?.message) {
        try {
          await smsController.smsCustomer({
            token: store.smsToken, to: customer.phone,
            from: getMessage.smsAfterRewardClaimed.from,
            message: getMessage.smsAfterRewardClaimed.message,
            reward: rewardName, storeName: store.name, storeURL: store.url,
            customerName: customer.name, customerEmail: customer.email, customerPhone: customer.phone,
          });
        } catch (e) { console.error("❌ SMS notification error:", e); }
      }

      if (getMessage?.notificationAfterRewardClaimed?.body) {
        try {
          const notificationResponse = await notificationController.singleNotification({
            title: getMessage.notificationAfterRewardClaimed.title,
            body: getMessage.notificationAfterRewardClaimed.body,
            reward: rewardName, userId: customer._id,
            storeName: store.name, storeURL: store.url,
            customerName: customer.name, customerEmail: customer.email, customerPhone: customer.phone,
          });
          if (notificationResponse.success) {
            const notificationModel = require("../models/notificationModel");
            await new notificationModel({
              store: store._id,
              title: notificationResponse.formattedTitle || getMessage.notificationAfterRewardClaimed.title || "Notification",
              message: notificationResponse.formattedMessage || getMessage.notificationAfterRewardClaimed.body || "New notification received.",
              receivers: [{ customer: customer._id, read: false, readAt: null }],
            }).save();
          }
        } catch (e) { console.error("❌ Push notification error:", e); }
      }

      return res.json({ success: true, message: "Reward claimed successfully", redemption, pointsDeducted });
    } catch (error) {
      console.error("❌ claimRewardForCustomer error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  //POINTS
  async changePoints(req, res) {
    try {
      const { storeURL } = req.params;
      const store = await storeModel.findOne({ url: storeURL });
      if (!store._id.equals(req.store._id)) {
        return res.json({ success: false, message: "Access Denied" });
      }
      const changedPoints = await pointsModel.findOneAndUpdate(
        { store: store._id },
        { ...req.body },
        { new: true }
      );
      return res.json({
        success: true,
        message: "Points Changed",
        changedPoints,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  }

  async getPointsDetail(req, res) {
    try {
      const { storeURL } = req.params;
      const store = await storeModel.findOne({ url: storeURL });
      if (!store._id.equals(req.store._id)) {
        return res.json({ success: false, message: "Access Denied" });
      }
      const points = await pointsModel.findOne({ store });

      return res.json({
        success: true,
        points,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  }

  //POINTS for Multiple Outlets
  async changeOutletsPoints(req, res) {
    try {
      const { storeID } = req.params;
      const { outletID } = req.query;
      const store = await storeModel.findById(storeID);
      if (!store._id.equals(req.store._id)) {
        return res.json({ success: false, message: "Access Denied" });
      }
      const outlet = await outletModel.findById(outletID);
      const changedPoints = await outletPointsModel.findOneAndUpdate(
        { store: store._id, outlet: outlet._id },
        { ...req.body },
        { new: true }
      );
      return res.json({
        success: true,
        message: "Points Changed",
        changedPoints,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  }

  async getOutletsPointsDetail(req, res) {
    try {
      const { storeID } = req.params;
      const { outletID } = req.query;
      const store = await storeModel.findById(storeID);
      if (!store._id.equals(req.store._id)) {
        return res.json({ success: false, message: "Access Denied" });
      }
      const outlet = await outletModel.findById(outletID);
      const points = await outletPointsModel
        .findOne({ store, outlet })
        .populate("outlet");

      return res.json({
        success: true,
        points,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  }

  // POINTS to PRINT
  async createPrintPoints(req, res) {
    try {
      const { storeID } = req.params;
      const store = await storeModel.findById(storeID);
      if (!store._id.equals(req.store._id)) {
        return res.json({ success: false, message: "Access Denied" });
      }
      const points = await printPointsModel.create({
        ...req.body,
        store,
      });
      return res.json({
        success: true,
        message: "Points Created",
        points,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  }

  //GET CUSTOMERS
  async getCustomers(req, res) {
    try {
      if (!req.user && !req.store) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const { storeID } = req.params;
      const { lite, page, limit, search } = req.query;
      const store = await storeModel.findById(storeID);

      if (!store) {
        return res.json({ success: false, message: "Store not found" });
      }

      let isAdmin, isStoreOwner, isSameStore;

      if (req.user) {
        isAdmin = req.user.role === "admin";
        isStoreOwner = req.user._id.equals(store.user[0]);
      } else {
        isSameStore = store._id.equals(req.store._id);
      }

      if (!isAdmin && !isStoreOwner && !isSameStore) {
        return res
          .status(403)
          .json({ success: false, message: "Access Denied" });
      }

      if (lite !== "true") {
        await customerModel.updateMany(
          { store: storeID, points: { $lt: 0 } },
          { $set: { points: 0 } }
        );
      }

      const query = { store: storeID };
      if (search) {
        const regex = new RegExp(search, "i");
        query.$or = [
          { name: regex },
          { email: regex },
          { phone: regex },
        ];
      }

      const isLite = lite === "true";
      const selectFields = "_id name email phone countryCode points dob createdAt tier store";
      const pageNumber = page ? Math.max(parseInt(page, 10) || 1, 1) : null;
      const limitNumber = limit ? Math.min(Math.max(parseInt(limit, 10) || 10, 1), 200) : null;

      let customerQuery = customerModel.find(query).sort({ points: -1 });
      if (isLite) {
        customerQuery = customerQuery.select(selectFields).lean();
      } else {
        customerQuery = customerQuery.populate(
          "store",
          "_id name url loyaltyCard services conversionRate isRounded amount needBillID needCustomerDOB needCustomerGender"
        );
      }

      if (pageNumber && limitNumber) {
        const skip = (pageNumber - 1) * limitNumber;
        const [customers, total] = await Promise.all([
          customerQuery.skip(skip).limit(limitNumber),
          customerModel.countDocuments(query),
        ]);

        return res.json({
          success: true,
          customers,
          pagination: {
            page: pageNumber,
            limit: limitNumber,
            total,
            pages: Math.ceil(total / limitNumber),
          },
        });
      }

      const customers = await customerQuery;
      return res.json({ success: true, customers });
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  }

  // Get leaderboard ranked by points earned in a time period
  getLeaderboardByPeriod = async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { storeID } = req.params;
      const { period, startDate, endDate } = req.query;

      const store = await storeModel.findById(storeID).lean();
      if (!store) {
        return res.json({ success: false, message: "Store not found" });
      }

      const isAdmin = req.user.role === "admin";
      const isStoreOwner = req.user._id.equals(store.user[0]);
      if (!isAdmin && !isStoreOwner) {
        return res.status(403).json({ success: false, message: "Access Denied" });
      }

      // All Time: return current balance from customerModel
      if (!period || period === "all") {
        const customers = await customerModel
          .find({ store: storeID })
          .select("_id name points phone email")
          .lean();
        const sorted = customers
          .map((c) => ({
            _id: c._id,
            name: c.name,
            phone: c.phone,
            email: c.email,
            periodPoints: c.points > 0 ? c.points : 0,
          }))
          .sort((a, b) => b.periodPoints - a.periodPoints);
        return res.json({ success: true, customers: sorted, period: "all" });
      }

      // Compute date range
      let start, end;
      const now = new Date();

      if (period === "week") {
        const day = now.getDay(); // 0=Sun
        const diffToMonday = day === 0 ? -6 : 1 - day;
        start = new Date(now);
        start.setDate(now.getDate() + diffToMonday);
        start.setHours(0, 0, 0, 0);
        end = new Date();
        end.setHours(23, 59, 59, 999);
      } else if (period === "month") {
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        end = new Date();
        end.setHours(23, 59, 59, 999);
      } else if (period === "custom") {
        if (!startDate || !endDate) {
          return res.status(400).json({ success: false, message: "startDate and endDate required for custom period" });
        }
        start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      } else {
        return res.status(400).json({ success: false, message: "Invalid period" });
      }

      const isL5 = store.loyaltyCard?.format === "L5";
      const storeObjectId = new mongoose.Types.ObjectId(storeID);

      let aggregationResult;

      if (isL5) {
        aggregationResult = await l5PointsTransactionModel.aggregate([
          {
            $match: {
              store: storeObjectId,
              createdAt: { $gte: start, $lte: end },
            },
          },
          { $group: { _id: "$customer", periodPoints: { $sum: "$points" } } },
          { $match: { periodPoints: { $gt: 0 } } },
          { $sort: { periodPoints: -1 } },
          {
            $lookup: {
              from: "customers",
              localField: "_id",
              foreignField: "_id",
              as: "customerData",
            },
          },
          { $unwind: "$customerData" },
          {
            $project: {
              _id: "$customerData._id",
              name: "$customerData.name",
              phone: "$customerData.phone",
              email: "$customerData.email",
              periodPoints: 1,
            },
          },
        ]);
      } else {
        aggregationResult = await pointsHistoryModel.aggregate([
          {
            $match: {
              store: storeObjectId,
              createdAt: { $gte: start, $lte: end },
            },
          },
          { $group: { _id: "$customer", periodPoints: { $sum: "$points" } } },
          { $match: { periodPoints: { $gt: 0 } } },
          { $sort: { periodPoints: -1 } },
          {
            $lookup: {
              from: "customers",
              localField: "_id",
              foreignField: "_id",
              as: "customerData",
            },
          },
          { $unwind: "$customerData" },
          {
            $project: {
              _id: "$customerData._id",
              name: "$customerData.name",
              phone: "$customerData.phone",
              email: "$customerData.email",
              periodPoints: 1,
            },
          },
        ]);
      }

      return res.json({
        success: true,
        customers: aggregationResult,
        period,
        startDate: start,
        endDate: end,
      });
    } catch (error) {
      console.error("❌ getLeaderboardByPeriod error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  //Create New Customer
  async createCustomer(req, res) {
    try {
      const { storeID } = req.params;
      const { name, phone, email, countryCode } = req.body;
      const store = await storeModel.findById(storeID);
      if (!store) {
        return res.json({ success: false, message: "Store not found" });
      }

      let isAdmin, isStoreOwner, isSameStore;

      if (req.user) {
        isAdmin = req.user.role === "admin";
        isStoreOwner = req.user._id.equals(store.user[0]);
      } else {
        isSameStore = store._id.equals(req.store._id);
      }

      if (!isAdmin && !isStoreOwner && !isSameStore) {
        return res
          .status(403)
          .json({ success: false, message: "Access Denied" });
      }

      // Check if a customer already exists in the specific store
      const existingCustomer = await customerModel.findOne({
        store,
        $or: [{ phone }, { email }],
      });
      if (existingCustomer) {
        return res.json({
          success: false,
          message: "Customer already exists",
        });
      }
      if (!email || !phone || !name) {
        return res.json({
          success: false,
          message: "All fields are required",
        });
      }
      if (!validator.isEmail(email)) {
        return res.json({ success: false, message: "Invalid Email" });
      }
      if (!validator.isMobilePhone(phone)) {
        return res.json({ success: false, message: "Invalid Phone Number" });
      }
      const tier = store?.loyaltyCard?.tier?.[0]?.name || "Bronze Tier";

      const customer = await customerModel.create({
        name,
        countryCode,
        phone,
        email,
        store,
        tier,
      });

      const getMessage = await mailSMSModel.findOne({ store });
      if (store.email && store.pass) {
        if (
          getMessage &&
          getMessage.mailAfterCreateCustomer &&
          getMessage.mailAfterCreateCustomer.subject
        ) {
          let subject = getMessage.mailAfterCreateCustomer.subject;
          let message = getMessage.mailAfterCreateCustomer.message;
          const mailResponse = await mailController.mailCustomers({
            user: store.email,
            pass: store.pass,
            host: store.host,
            port: store.port,
            secure: store.secure,
            email: customer.email,
            subject,
            message,
            storeName: store.name,
            storeURL: store.url,
            storeLogo: store.logo,
            cardColor: store.loyaltyCard?.cardColor,
            textColor: store.loyaltyCard?.textColor,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
          });
          console.log(mailResponse);
        }
      }

      if (store.smsToken) {
        // const getSMS = await mailSMSModel.findOne({ store });
        if (
          getMessage &&
          getMessage.smsAfterCreateCustomer &&
          getMessage.smsAfterCreateCustomer.message
        ) {
          let from = getMessage.smsAfterCreateCustomer.from;
          let message = getMessage.smsAfterCreateCustomer.message;
          const smsResponse = await smsController.smsCustomer({
            token: store.smsToken,
            to: customer.phone,
            from,
            message,
            storeName: store.name,
            storeURL: store.url,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
          });
          console.log(smsResponse);
        }
      }

      return res.json({
        success: true,
        message: "New Customer Created",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  }

  //DELETE CUSTOMER
  async deleteCustomer(req, res) {
    try {
      const { customerID } = req.params;
      const { storeID } = req.query;
      const store = await storeModel.findById(storeID);
      if (!store) {
        return res.json({ success: false, message: "Store not found" });
      }
      const customer = await customerModel.findById(customerID);
      if (!customer) {
        return res.json({ success: false, message: "Customer not found" });
      }
      if (req.user._id.equals(store.user[0]) || req.user.role === "admin") {
        await customerModel.findByIdAndDelete(customerID);
        await pointsHistoryModel.deleteMany({ customer: customerID });
        await redemptionModel.deleteMany({ customer: customerID });
        await reservationModel.deleteMany({ customer: customerID });
        return res.json({ success: true, message: "Customer Deleted" });
      } else {
        return res.json({ success: false, message: "Access Denied" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  }

  //Give Points to Customer
  // async givePoints(req, res) {
  //   try {
  //     const { storeID } = req.params;
  //     const { phone, points } = req.body;
  //     const store = await storeModel.findById(storeID);
  //     if (!store) {
  //       return res.json({ success: false, message: "Store not found" });
  //     }
  //     const customer = await customerModel.findOne({ store, phone });
  //     if (!customer) {
  //       return res.json({ success: false, message: "Customer not found" });
  //     }
  //     const givePoints = await customerModel.findOneAndUpdate(
  //       { store, phone },
  //       { $inc: { points } },
  //       { new: true }
  //     );
  //     if (store.smsToken) {
  //       const getSMS = await mailSMSModel.findOne({ store });
  //       if (
  //         getSMS &&
  //         getSMS.smsAfterPointEarned &&
  //         getSMS.smsAfterPointEarned.message
  //       ) {
  //         let from = getSMS.smsAfterPointEarned.from;
  //         let message = getSMS.smsAfterPointEarned.message;
  //         const smsResponse = await smsController.smsCustomer({
  //           token: store.smsToken,
  //           to: customer.phone,
  //           from,
  //           message,
  //           storeName: store.name,
  //           customerName: customer.name,
  //           points,
  //         });
  //         console.log(smsResponse);
  //       }
  //     }
  //     return res.json({
  //       success: true,
  //       message: "Points Added",
  //       givePoints,
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).send(error);
  //   }
  // }

  async editUserPoints(req, res) {
    console.log('[editUserPoints] ==================== REQUEST START ====================');
    console.log('[editUserPoints] REQUEST RECEIVED - customerId:', req.params.customerId, 'hasUser:', !!req.user, 'hasStore:', !!req.store);
    try {
      const { customerId } = req.params;
      let { points, billID, remarks, outlet } = req.body;

      // Resolve outlet ID to location name for consistent storage across non-L5 formats
      if (outlet && typeof outlet === 'string' && outlet.match(/^[0-9a-fA-F]{24}$/)) {
        const outletModel = require("../models/outletModel");
        const foundOutlet = await outletModel.findById(outlet);
        if (foundOutlet) {
          outlet = foundOutlet.location || foundOutlet.name;
        }
      }

      console.log('[editUserPoints] Body:', { points, billID, remarks, outlet });
      console.log('[editUserPoints] Points type:', typeof points, 'value:', points);

      const customer = await customerModel
        .findById(customerId)
        .populate("store");

      if (!customer) {
        return res.json({ success: false, message: "Customer not found" });
      }

      const store = customer.store;

      let isAdmin, isStoreOwner, isSameStore;

      if (req.user) {
        isAdmin = req.user.role === "admin";
        isStoreOwner = req.user._id.equals(store.user[0]);
      } else {
        isSameStore = store._id.equals(req.store._id);
      }

      if (!isAdmin && !isStoreOwner && !isSameStore) {
        return res
          .status(403)
          .json({ success: false, message: "Access Denied" });
      }

      // CHECK IF L5 FORMAT - USE L5 API
      console.log('[editUserPoints] Store format:', store?.loyaltyCard?.format);
      if (store?.loyaltyCard?.format === "L5") {
        console.log('[editUserPoints] ========== L5 FORMAT DETECTED ==========');

        const previousPoints = customer.points || 0;
        console.log('[editUserPoints] Validating points...');

        if (points === undefined || points === null) {
          console.log('[editUserPoints] ERROR: Points is undefined/null');
          return res.status(400).json({
            success: false,
            message: "Points value is required"
          });
        }

        if (isNaN(points)) {
          console.log('[editUserPoints] ERROR: Points is NaN');
          return res.status(400).json({
            success: false,
            message: "Points must be a valid number"
          });
        }

        const receivedPoints = points - previousPoints;
        console.log('[editUserPoints] Validation passed');
        console.log('[editUserPoints] Points calculation:', {
          previousPoints,
          newPoints: points,
          receivedPoints
        });

        // Handle point decrease - manually update L5 data
        if (receivedPoints < 0) {
          console.log('[editUserPoints] L5 point decrease detected:', receivedPoints);

          try {
            // Find all outlet points for this customer
            const CustomerOutletPoints = require("../models/customerOutletPointsModel");
            const allOutletPoints = await CustomerOutletPoints.find({
              customer: customer._id,
              store: store._id,
            });
            console.log('[editUserPoints] Found outlet points:', allOutletPoints.length);

            // Calculate total current points
            const totalCurrentPoints = allOutletPoints.reduce((sum, op) => sum + op.currentPoints, 0);
            console.log('[editUserPoints] Total current points:', totalCurrentPoints);

            // Calculate the reduction amount
            const reductionAmount = Math.abs(receivedPoints);
            console.log('[editUserPoints] Reduction amount:', reductionAmount);

            // If reducing more than available, set to 0
            if (reductionAmount >= totalCurrentPoints) {
              console.log('[editUserPoints] Reducing all points to 0');

              // Import L5PointsTransaction model
              const L5PointsTransaction = require("../models/l5PointsTransactionModel");

              // When reducing to 0, also decrease totalPointsEarned by the current balance
              const allOutletPointsForZero = await CustomerOutletPoints.find({
                customer: customer._id,
                store: store._id,
              });

              for (const outletPoint of allOutletPointsForZero) {
                const reduction = outletPoint.currentPoints;
                outletPoint.totalPointsEarned = Math.max(0, outletPoint.totalPointsEarned - reduction);
                outletPoint.currentPoints = 0;
                await outletPoint.save();

                // Create L5PointsTransaction record
                if (reduction > 0) {
                  await L5PointsTransaction.create({
                    store: store._id,
                    customer: customer._id,
                    outlet: outletPoint.outlet,
                    transactionType: "adjustment",
                    points: -reduction,
                    balanceAfter: 0,
                    billID: billID || "",
                    description: `Manual point adjustment: reduced all points to 0`,
                    remarks: remarks || "Manual correction",
                    isManual: true,
                    processedBy: req.user?._id,
                  });
                  console.log('[editUserPoints] Created L5PointsTransaction for outlet:', outletPoint.outlet);
                }
              }

              // Update customer points and totalPoints
              const currentCustomer = await customerModel.findById(customer._id);
              await customerModel.findByIdAndUpdate(customer._id, {
                points: 0,
                totalPoints: Math.max(0, (currentCustomer.totalPoints || 0) - totalCurrentPoints),
                pointChangeDate: new Date(),
              });
              console.log('[editUserPoints] Updated customer points to 0');

              // Get outlet location for history record
              let outletLocation = null;
              console.log('[editUserPoints] Fetching outlet location, outlet param:', outlet);
              if (outlet) {
                // If outlet is a location string, use it directly
                if (typeof outlet === 'string' && !outlet.match(/^[0-9a-fA-F]{24}$/)) {
                  outletLocation = outlet;
                  console.log('[editUserPoints] Outlet is location string:', outletLocation);
                } else {
                  // If outlet is an ID, fetch the outlet to get location
                  const outletModel = require("../models/outletModel");
                  const foundOutlet = await outletModel.findOne({
                    $or: [
                      { _id: outlet },
                      { location: outlet }
                    ],
                    _id: { $in: store.outlets }
                  });
                  if (foundOutlet) {
                    outletLocation = foundOutlet.location || foundOutlet.name;
                    console.log('[editUserPoints] Found outlet:', outletLocation);
                  } else {
                    console.log('[editUserPoints] Outlet not found');
                  }
                }
              }

              // Create points history record
              console.log('[editUserPoints] Creating points history record');
              await pointsHistoryModel.create({
                points: -reductionAmount,
                billID: billID,
                customer: customer._id,
                store: store._id,
                remarks: remarks || "",
                outlet: outletLocation,
              });
              console.log('[editUserPoints] Points history created successfully');

              // Update customer L5 aggregated data
              try {
                const l5Controller = require("./l5Controller");
                await l5Controller.updateCustomerL5Data(customer._id, store._id);
                console.log('[editUserPoints] Updated customer L5 aggregated data');
              } catch (l5Error) {
                console.error('[editUserPoints] Error updating L5 data:', l5Error.message);
              }

              return res.json({
                success: true,
                message: "Points reduced to 0",
                data: { newPoints: 0 },
              });
            }

            // Distribute the reduction across outlets — current outlet first, then highest balance
            console.log('[editUserPoints] Distributing reduction across outlets');
            let remainingReduction = reductionAmount;
            const outletReductions = []; // Track reductions for L5PointsTransaction
            const sortedOutletPoints = [...allOutletPoints].sort((a, b) => {
              const aIsTarget = outlet && a.outlet?.toString() === outlet?.toString();
              const bIsTarget = outlet && b.outlet?.toString() === outlet?.toString();
              if (aIsTarget && !bIsTarget) return -1;
              if (!aIsTarget && bIsTarget) return 1;
              return b.currentPoints - a.currentPoints;
            });
            for (const outletPoint of sortedOutletPoints) {
              if (remainingReduction <= 0) break;

              const reduction = Math.min(outletPoint.currentPoints, remainingReduction);
              console.log('[editUserPoints] Reducing', reduction, 'from outlet:', outletPoint.outlet);
              // Decrease both current points AND total earned (this is a correction, not redemption)
              const balanceAfter = outletPoint.currentPoints - reduction;
              outletPoint.currentPoints = balanceAfter;
              outletPoint.totalPointsEarned = Math.max(0, outletPoint.totalPointsEarned - reduction);
              // Do NOT touch totalPointsRedeemed - this is not a redemption
              remainingReduction -= reduction;
              await outletPoint.save();
              console.log('[editUserPoints] Reduced currentPoints and totalPointsEarned by', reduction, 'at outlet:', outletPoint.outlet);
              
              // Track for L5PointsTransaction creation
              if (reduction > 0) {
                outletReductions.push({ outlet: outletPoint.outlet, reduction, balanceAfter });
              }
            }
            console.log('[editUserPoints] Reduction distributed successfully');

            // Update customer's main points and totalPoints
            const currentCustomer = await customerModel.findById(customer._id);
            const newTotalPoints = Math.max(0, totalCurrentPoints - reductionAmount);
            const newTotalPointsLifetime = Math.max(0, (currentCustomer.totalPoints || 0) - reductionAmount);
            console.log('[editUserPoints] Updating customer total points to:', newTotalPoints);
            await customerModel.findByIdAndUpdate(customer._id, {
              points: newTotalPoints,
              totalPoints: newTotalPointsLifetime,
              pointChangeDate: new Date(),
            });
            console.log('[editUserPoints] Customer updated successfully - points:', newTotalPoints, 'totalPoints:', newTotalPointsLifetime);

            // Create L5PointsTransaction records for each outlet that had points reduced
            const L5PointsTransaction = require("../models/l5PointsTransactionModel");
            console.log('[editUserPoints] Creating L5PointsTransaction records for', outletReductions.length, 'outlets');

            // Create transaction records
            for (const { outlet, reduction, balanceAfter } of outletReductions) {
              await L5PointsTransaction.create({
                store: store._id,
                customer: customer._id,
                outlet: outlet,
                transactionType: "adjustment",
                points: -reduction,
                balanceAfter: balanceAfter,
                billID: billID || "",
                description: `Manual point adjustment: reduced by ${reduction}`,
                remarks: remarks || "Manual correction",
                isManual: true,
                processedBy: req.user?._id,
              });
              console.log('[editUserPoints] Created L5PointsTransaction for outlet:', outlet);
            }

            // Get outlet location for history record
            let outletLocation = null;
            console.log('[editUserPoints] Fetching outlet location, outlet param:', outlet);
            if (outlet) {
              // If outlet is a location string, use it directly
              if (typeof outlet === 'string' && !outlet.match(/^[0-9a-fA-F]{24}$/)) {
                outletLocation = outlet;
                console.log('[editUserPoints] Outlet is location string:', outletLocation);
              } else {
                // If outlet is an ID, fetch the outlet to get location
                const outletModel = require("../models/outletModel");
                const foundOutlet = await outletModel.findOne({
                  $or: [
                    { _id: outlet },
                    { location: outlet }
                  ],
                  _id: { $in: store.outlets }
                });
                if (foundOutlet) {
                  outletLocation = foundOutlet.location || foundOutlet.name;
                  console.log('[editUserPoints] Found outlet:', outletLocation);
                } else {
                  console.log('[editUserPoints] Outlet not found');
                }
              }
            }

            // Create points history record for the decrease
            console.log('[editUserPoints] Creating points history record');
            await pointsHistoryModel.create({
              points: -reductionAmount,
              billID: billID,
              customer: customer._id,
              store: store._id,
              remarks: remarks || "",
              outlet: outletLocation,
            });
            console.log('[editUserPoints] Points history created successfully');

            // Update customer L5 aggregated data
            try {
              const l5Controller = require("./l5Controller");
              await l5Controller.updateCustomerL5Data(customer._id, store._id);
              console.log('[editUserPoints] Updated customer L5 aggregated data');
            } catch (l5Error) {
              console.error('[editUserPoints] Error updating L5 data:', l5Error.message);
              // Don't fail the request if this fails
            }

            console.log('[editUserPoints] ========== DECREASE COMPLETED SUCCESSFULLY ==========');

            return res.json({
              success: true,
              message: `${reductionAmount} points deducted successfully`,
              data: { newPoints: Math.max(0, newTotalPoints) },
            });
          } catch (decreaseError) {
            console.error('[editUserPoints] ========== DECREASE ERROR ==========');
            console.error('[editUserPoints] Error in decrease logic:', decreaseError);
            console.error('[editUserPoints] Error stack:', decreaseError.stack);
            return res.status(500).json({
              success: false,
              message: `Failed to decrease points: ${decreaseError.message}`,
            });
          }
        }

        // For increasing points, outlet is required
        if (!outlet) {
          return res.status(400).json({
            success: false,
            message: "Outlet is required for L5 loyalty system when adding points"
          });
        }

        // Find outlet ID - outlet param might be location string or ID
        let outletId = outlet;

        // If outlet is a location string, find the outlet by location
        if (outlet && !outlet.match(/^[0-9a-fA-F]{24}$/)) {
          console.log('[editUserPoints] Outlet is location string, finding by location:', outlet);
          const outletModel = require("../models/outletModel");
          const foundOutlet = await outletModel.findOne({
            location: outlet,
            _id: { $in: store.outlets }
          });

          if (!foundOutlet) {
            return res.status(400).json({
              success: false,
              message: `Outlet not found: ${outlet}`
            });
          }

          outletId = foundOutlet._id;
          console.log('[editUserPoints] Found outlet ID:', outletId);
        }

        // Import L5 controller
        const l5Controller = require("./l5Controller");

        // Call L5 earnPoints function
        const l5Request = {
          body: {
            customerId: customer._id,
            outletId: outletId,
            points: receivedPoints,
            billID,
            billAmount: req.body.billAmount,
            remarks,
          },
          store: req.store,
        };

        const l5Response = {
          status: (code) => ({
            json: (data) => res.status(code).json(data),
          }),
          json: (data) => res.json(data),
        };

        // Delegate to L5 controller
        return await l5Controller.earnPoints(l5Request, l5Response);
      }

      // CHECK IF L4 FORMAT - USE L4 LOGIC WITH BILL AMOUNT
      if (store?.loyaltyCard?.format === "L4") {
        console.log('[editUserPoints] ========== L4 FORMAT DETECTED ==========');
        
        const { billAmount } = req.body;
        const previousPoints = customer.points || 0;
        
        // If no billAmount provided, this is a decrease — validate points and process
        if (!billAmount || Number(billAmount) <= 0) {
          // Validate points parameter for decrease
          if (points === undefined || points === null) {
            console.log('[editUserPoints] ERROR: Points is undefined/null');
            return res.status(400).json({
              success: false,
              message: "Points value is required for decreasing points"
            });
          }

          if (isNaN(points)) {
            console.log('[editUserPoints] ERROR: Points is NaN');
            return res.status(400).json({
              success: false,
              message: "Points must be a valid number"
            });
          }

          const receivedPoints = points - previousPoints;
          console.log('[editUserPoints] L4 Points calculation:', {
            previousPoints,
            newPoints: points,
            receivedPoints
          });

          // Handle point decrease - direct manual adjustment
          if (receivedPoints < 0) {
            console.log('[editUserPoints] L4 point decrease detected:', receivedPoints);

            try {
              const reductionAmount = Math.abs(receivedPoints);
              const newPoints = Math.max(0, points);

              // Update customer points
              customer.points = newPoints;
              customer.pointChangeDate = new Date();

              // Update total points earned (reduce it since this is a correction)
              const newTotalPoints = Math.max(0, (customer.totalPoints || 0) - reductionAmount);
              customer.totalPoints = newTotalPoints;

              await customer.save();

              // Create points history record for the decrease
              await pointsHistoryModel.create({
                points: receivedPoints,
                billID: billID || "",
                customer: customer._id,
                store: store._id,
                remarks: remarks || "Manual point adjustment",
                outlet: store?.services?.multipleOutlets ? outlet : null,
              });

              console.log('[editUserPoints] L4 points decreased successfully:', {
                previousPoints,
                reductionAmount,
                newBalance: customer.points,
                newTotalPoints: customer.totalPoints
              });

              console.log('[editUserPoints] ========== L4 DECREASE COMPLETED SUCCESSFULLY ==========');

              return res.json({
                success: true,
                message: `${reductionAmount} points deducted successfully`,
                data: {
                  newBalance: customer.points,
                  tier: customer.tier,
                },
              });
            } catch (decreaseError) {
              console.error('[editUserPoints] ========== L4 DECREASE ERROR ==========');
              console.error('[editUserPoints] Error in L4 decrease logic:', decreaseError);
              console.error('[editUserPoints] Error stack:', decreaseError.stack);
              return res.status(500).json({
                success: false,
                message: `Failed to decrease points: ${decreaseError.message}`,
              });
            }
          }

          // points provided but not a decrease, and no billAmount
          return res.status(400).json({
            success: false,
            message: "Bill amount is required for L4 loyalty system when adding points"
          });
        }

        // billAmount is provided — this is a point increase
        // For point increase, we need bill amount for automatic point calculation
        if (!billAmount || billAmount <= 0) {
          return res.status(400).json({
            success: false,
            message: "Bill amount is required for L4 loyalty system when adding points"
          });
        }

        // Import tier helpers
        const { getTierEarnRate } = require("../config/tierHelpers");
        const upgradeTierL4 = require("../config/upgradeTierL4");

        // Get customer's current tier earn rate
        const earnRate = getTierEarnRate(customer, store);
        
        console.log('[editUserPoints] L4 Config:', {
          tier: customer.tier,
          earnRate: earnRate,
          billAmount,
        });

        // Calculate points earned directly from bill amount (no automatic discount — staff applies discount manually)
        const rawPoints = Number(billAmount) * earnRate;
        let pointsEarned = store.isRounded
          ? Math.round(rawPoints)
          : parseFloat(rawPoints.toFixed(2));

        // Double points check
        if (store?.doublePoints && Array.isArray(store.doublePointsDays) && store.doublePointsDays.length > 0) {
          const tz = store.timezone || 'Asia/Kathmandu';
          const dayIndex = new Date(new Date().toLocaleString('en-US', { timeZone: tz })).getDay();
          if (store.doublePointsDays.includes(dayIndex)) {
            pointsEarned = parseFloat((pointsEarned * 2).toFixed(2));
            console.log(`✅ [editUserPoints L4] Double points: day=${dayIndex}, doubled to ${pointsEarned}`);
          }
        }
        
        console.log('[editUserPoints] L4 Calculation:', {
          billAmount,
          earnRate,
          rawPoints,
          isRounded: store.isRounded,
          pointsEarned
        });

        // Add points to customer (previousPoints already declared above)
        customer.points = parseFloat((previousPoints + pointsEarned).toFixed(2));
        customer.pointChangeDate = new Date();

        // Update total points earned
        const totalPoints = parseFloat((customer.totalPoints + pointsEarned).toFixed(2));
        customer.totalPoints = totalPoints < 0 ? 0 : totalPoints;

        // Trigger tier upgrade check — only if admin has not manually locked the tier
        if (customer.tierLockedByAdmin) {
          // Admin locked: only allow natural upgrades ABOVE the locked tier; never demote
          const tiers = store.loyaltyCard.tier || [];
          const currentTierIndex = tiers.findIndex((t) => t.name === customer.tier);
          const naturalTierIndex = tiers.reduce((highest, t, i) =>
            customer.points >= t.minPoints ? i : highest, -1);
          if (naturalTierIndex > currentTierIndex) {
            // Customer earned past the locked tier — unlock and let the auto-logic run
            customer.tierLockedByAdmin = false;
            const upgraded = upgradeTierL4(customer, tiers);
            customer.tier = upgraded.tier;
            customer.lastTierChecked = upgraded.lastTierChecked;
          }
          // else: keep the admin-set tier exactly as-is
        } else {
          const upgraded = upgradeTierL4(customer, store.loyaltyCard.tier);
          customer.tier = upgraded.tier;
          customer.lastTierChecked = upgraded.lastTierChecked;
        }

        await customer.save();

        // Normalize outlet to location string for analytics consistency
        let outletLocL4 = null;
        if (outlet && store?.services?.multipleOutlets) {
          if (typeof outlet === 'string' && !outlet.match(/^[0-9a-fA-F]{24}$/)) {
            outletLocL4 = outlet;
          } else {
            try {
              const outletModel = require('../models/outletModel');
              const foundOutlet = await outletModel.findOne({ $or: [{ _id: outlet }, { location: outlet }], _id: { $in: store.outlets } });
              if (foundOutlet) outletLocL4 = foundOutlet.location || foundOutlet.name;
            } catch {}
          }
        }

        // Create points history record
        await pointsHistoryModel.create({
          points: pointsEarned,
          billID: billID,
          customer: customer._id,
          store: store._id,
          remarks: remarks || "",
          outlet: outletLocL4,
        });

        console.log('[editUserPoints] L4 points added successfully:', {
          previousPoints,
          pointsEarned,
          newBalance: customer.points,
          tier: customer.tier
        });

        // Update visit analytics
        try {
          await updateVisitAnalytics(
            customer._id,
            customer.store._id,
            outletLocL4,
            pointsEarned
          );
        } catch (analyticsError) {
          console.error('[editUserPoints] Analytics update failed:', analyticsError.message);
        }

        // Send notifications if configured
        const getMessage = await mailSMSModel.findOne({ store });
        if (store.email && store.pass && getMessage?.mailAfterPointEarned?.subject) {
          try {
            await mailController.mailCustomers({
              user: store.email,
              pass: store.pass,
              host: store.host,
              port: store.port,
              secure: store.secure,
              email: customer.email,
              subject: getMessage.mailAfterPointEarned.subject,
              message: getMessage.mailAfterPointEarned.message,
              points: pointsEarned,
              storeName: store.name,
              storeURL: store.url,
              storeLogo: store.logo,
              cardColor: store.loyaltyCard?.cardColor,
              textColor: store.loyaltyCard?.textColor,
              customerName: customer.name,
              customerEmail: customer.email,
              customerPhone: customer.phone,
            });
          } catch (mailError) {
            console.error('[editUserPoints] Mail notification failed:', mailError.message);
          }
        }

        console.log('[editUserPoints] ========== L4 COMPLETED SUCCESSFULLY ==========');

        return res.json({
          success: true,
          message: `${pointsEarned} points added successfully`,
          data: {
            pointsEarned,
            newBalance: customer.points,
            tier: customer.tier,
            billAmount,
          },
        });
      }

      const previousPoints = customer.points || 0; // Default to 0 if points are not set

      if (!points) {
        return res.json({ success: false, message: "Points not specified" });
      }

      // Double points check: if points are increasing and double points is active today, double the delta
      let finalPoints = points;
      const delta = points - previousPoints;
      if (delta > 0 && store?.doublePoints && Array.isArray(store.doublePointsDays) && store.doublePointsDays.length > 0) {
        const tz = store.timezone || 'Asia/Kathmandu';
        const dayIndex = new Date(new Date().toLocaleString('en-US', { timeZone: tz })).getDay();
        if (store.doublePointsDays.includes(dayIndex)) {
          finalPoints = previousPoints + delta * 2;
          console.log(`✅ [editUserPoints] Double points: day=${dayIndex}, delta=${delta}, new total=${finalPoints}`);
        }
      }

      const pointsForPointsHistory = parseFloat(
        finalPoints - customer.points
      ).toFixed(2);

      customer.points = finalPoints < 0 ? 0 : finalPoints;
      customer.pointChangeDate = new Date();

      const receivedPoints = finalPoints - previousPoints;
      const totalPoints =
        customer.totalPoints < previousPoints
          ? customer.points
          : parseFloat((customer.totalPoints + receivedPoints).toFixed(1));
      customer.totalPoints = totalPoints < 0 ? 0 : totalPoints;

      // Streak calculation
      if (receivedPoints > 0) {
        const streakToday = new Date();
        const streakTodayStr = streakToday.toISOString().split("T")[0];
        const streakLastStr = customer.lastVisitDate
          ? customer.lastVisitDate.toISOString().split("T")[0]
          : null;
        if (!streakLastStr) {
          customer.visitStreak = 1;
        } else if (streakLastStr === streakTodayStr) {
          // Already visited today — streak unchanged
        } else {
          const streakYesterday = new Date(streakToday);
          streakYesterday.setDate(streakYesterday.getDate() - 1);
          const streakYesterdayStr = streakYesterday.toISOString().split("T")[0];
          customer.visitStreak =
            streakLastStr === streakYesterdayStr
              ? (customer.visitStreak || 0) + 1
              : 1;
        }
        customer.lastVisitDate = streakToday;
        customer.longestStreak = Math.max(
          customer.longestStreak || 0,
          customer.visitStreak || 0
        );
        console.log("✅ Streak updated:", { visitStreak: customer.visitStreak, longestStreak: customer.longestStreak });
      }

      // Upgrade Tier if applicable
      if (store?.loyaltyCard?.format == "L34HA") {
        const updated = upgradeTier(customer, store.loyaltyCard.tier);
        customer.points = updated.points < 0 ? 0 : updated.points;
        customer.tier = updated.tier;
        customer.lastTierChecked = updated.lastTierChecked;

        await customer.save();
      }

      await customer.save();

      // Normalize outlet to location string for analytics consistency
      let outletLocNonL5 = null;
      if (outlet && store?.services?.multipleOutlets) {
        if (typeof outlet === 'string' && !outlet.match(/^[0-9a-fA-F]{24}$/)) {
          outletLocNonL5 = outlet;
        } else {
          try {
            const outletModel = require('../models/outletModel');
            const foundOutlet = await outletModel.findOne({ $or: [{ _id: outlet }, { location: outlet }], _id: { $in: store.outlets } });
            if (foundOutlet) outletLocNonL5 = foundOutlet.location || foundOutlet.name;
          } catch {}
        }
      }

      await pointsHistoryModel.create({
        points: pointsForPointsHistory,
        billID: billID,
        customer: customer._id,
        store: customer.store._id,
        remarks,
        outlet: outletLocNonL5,
      });

      console.log('[editUserPoints] PointsHistory created. pointsForPointsHistory:', pointsForPointsHistory, 'type:', typeof pointsForPointsHistory);

      // Update visit analytics
      const pointsDiff = parseFloat(pointsForPointsHistory);
      console.log('[editUserPoints] pointsDiff:', pointsDiff, 'isPositive:', pointsDiff > 0);

      if (pointsDiff > 0) {
        console.log('[editUserPoints] Calling updateVisitAnalytics for customer:', customer._id.toString());
        try {
          await updateVisitAnalytics(
            customer._id,
            customer.store._id,
            outletLocNonL5,
            pointsDiff
          );
          console.log('[editUserPoints] updateVisitAnalytics completed successfully');
        } catch (analyticsError) {
          console.error('[editUserPoints] Analytics update failed:', analyticsError.message);
        }
      } else {
        console.log('[editUserPoints] Skipping analytics update - points not positive');
      }

      if (receivedPoints > 0) {
        // Checking store Email and Pass to mail customer
        const getMessage = await mailSMSModel.findOne({ store });
        if (store.email && store.pass) {
          if (
            getMessage &&
            getMessage.mailAfterPointEarned &&
            getMessage.mailAfterPointEarned.subject
          ) {
            let subject = getMessage.mailAfterPointEarned.subject;
            let message = getMessage.mailAfterPointEarned.message;
            const mailResponse = await mailController.mailCustomers({
              user: store.email,
              pass: store.pass,
              host: store.host,
              port: store.port,
              secure: store.secure,
              email: customer.email,
              subject,
              message,
              points: receivedPoints,
              storeName: store.name,
              storeURL: store.url,
              storeLogo: store.logo,
              cardColor: store.loyaltyCard?.cardColor,
              textColor: store.loyaltyCard?.textColor,
              customerName: customer.name,
              customerEmail: customer.email,
              customerPhone: customer.phone,
            });
            console.log(mailResponse);
          }
        }

        // Checking store SMS Token to send SMS to customer
        if (store.smsToken) {
          // const getSMS = await mailSMSModel.findOne({ store });
          if (
            getMessage &&
            getMessage.smsAfterPointEarned &&
            getMessage.smsAfterPointEarned.message
          ) {
            let from = getMessage.smsAfterPointEarned.from;
            let message = getMessage.smsAfterPointEarned.message;
            const smsResponse = await smsController.smsCustomer({
              token: store.smsToken,
              to: customer.phone,
              from,
              message,
              points: receivedPoints,
              storeName: store.name,
              storeURL: store.url,
              customerName: customer.name,
              customerEmail: customer.email,
              customerPhone: customer.phone,
            });
            console.log(smsResponse);
          }
        }

        // // PUSH NOTIFICATION
        // // if (store._id == "6798b5994dfc04de9e55a3c1") {
        // await fetch(
        //   // `https://server.samparka.co/send-notification/${customer._id}`,
        //   `${process.env.SERVER_ORIGIN}/send-notification/${customer._id}`,
        //   {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //       title: "Points Received",
        //       body: `Congratulations ${customer.name}. You have received ${receivedPoints} points`,
        //     }),
        //   }
        // )
        //   .then(() => console.log("User notified!"))
        //   .catch((err) => console.log("Error sending notification"));
        // // }

        // // if (customer.store._id == "6798b5994dfc04de9e55a3c1") {
        // //   await fetch(
        // //     `${process.env.SERVER_ORIGIN}/send-notification/${customer._id}`,
        // //     {
        // //       method: "POST",
        // //       headers: {
        // //         "Content-Type": "application/json",
        // //       },
        // //       body: JSON.stringify({
        // //         title: "Points Received",
        // //         body: `Congratulations ${customer.name}. Your total points is ${points}`,
        // //       }),
        // //     }
        // //   )
        // //     .then(() => console.log("User notified!"))
        // //     .catch((err) => console.log("Error sending notification"));
        // // }
        if (
          getMessage &&
          getMessage.notificationAfterPointEarned &&
          getMessage.notificationAfterPointEarned.body
        ) {
          let title = getMessage.notificationAfterPointEarned.title;
          let body = getMessage.notificationAfterPointEarned.body;
          const notificationResponse =
            await notificationController.singleNotification({
              title,
              body,
              userId: customer._id,
              points: receivedPoints,
              storeName: store.name,
              storeURL: store.url,
              customerName: customer.name,
              customerEmail: customer.email,
              customerPhone: customer.phone,
            });
          console.log(notificationResponse);
          if (notificationResponse.success) {
            const receivers = [
              { customer: customer._id, read: false, readAt: null },
            ];
            // Create a notification document
            const notification = new notificationModel({
              store: store._id,
              title: title || "Notification",
              message: notificationResponse.formattedMessage || body || "New notification received.",
              receivers,
            });
            await notification.save();
          }
        }
      }
      return res.json({
        success: true,
        message: "Points updated successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        success: false,
        message: "Error updating customer points",
      });
    }
  }

  //Change TIer
  async editUserTier(req, res) {
    try {
      const { customerId } = req.params;
      const { tier } = req.body;

      // Validate the tier input
      if (!tier || typeof tier !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid tier value",
        });
      }

      // Fetch customer without populate — only need store ID to look up format
      const customer = await customerModel.findById(customerId);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      // Fetch store separately using the stored ObjectId (avoids populate + save issue)
      const store = await storeModel.findById(customer.store);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      // Build the update object
      const updateFields = {
        tier,
      };

      if (store.loyaltyCard.format === "L3") {
        // L3: snap points to the selected tier's minPoints
        const matchedTier = store.loyaltyCard.tier.find((t) => t.name === tier);
        updateFields.points = matchedTier?.minPoints || 0;
      }

      if (store.loyaltyCard.format === "L4") {
        // L4: lock the tier so auto-upgrade won't override it; points unchanged
        updateFields.tierLockedByAdmin = true;
      }

      console.log(`✅ [editUserTier] Updating customer ${customerId} → tier: ${tier}, format: ${store.loyaltyCard.format}`, updateFields);

      const updatedCustomer = await customerModel.findByIdAndUpdate(
        customerId,
        { $set: updateFields },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Customer tier updated successfully",
        customer: updatedCustomer,
      });
    } catch (error) {
      console.error("❌ [editUserTier] Error:", error);
      return res.status(400).json({
        success: false,
        message: "Error updating customer tier",
      });
    }
  }

  async editCustomer(req, res) {
    try {
      const { customerId } = req.params;
      const { name, email, phone, countryCode, dob, gender } = req.body;

      const customer = await customerModel.findById(customerId);
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      const store = await storeModel.findById(customer.store);
      if (!store) {
        return res.status(404).json({ success: false, message: "Store not found" });
      }

      if (!req.user._id.equals(store.user[0]) && req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Access Denied" });
      }

      if (email && email !== customer.email) {
        const existingEmail = await customerModel.findOne({
          store: store._id,
          email,
          _id: { $ne: customerId },
        });
        if (existingEmail) {
          return res.json({ success: false, message: "Email already in use by another customer" });
        }
      }

      if (phone && String(phone) !== String(customer.phone)) {
        const existingPhone = await customerModel.findOne({
          store: store._id,
          phone,
          _id: { $ne: customerId },
        });
        if (existingPhone) {
          return res.json({ success: false, message: "Phone already in use by another customer" });
        }
      }

      const updateFields = {};
      if (name) updateFields.name = name;
      if (email) updateFields.email = email;
      if (phone) updateFields.phone = phone;
      if (countryCode) updateFields.countryCode = countryCode;
      if (dob) updateFields.dob = dob;
      if (gender !== undefined) updateFields.gender = gender;

      const updated = await customerModel.findByIdAndUpdate(
        customerId,
        { $set: updateFields },
        { new: true }
      );

      console.log(`✅ [editCustomer] Updated customer ${customerId}`);
      return res.json({ success: true, message: "Customer updated successfully", customer: updated });
    } catch (error) {
      console.error("❌ [editCustomer] Error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  async editCustomerByStore(req, res) {
    try {
      const { customerId } = req.params;
      const { name, email, phone, countryCode, dob, gender } = req.body;

      const customer = await customerModel.findById(customerId);
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      // Ensure the customer belongs to the authenticated store
      if (!customer.store.equals(req.store._id)) {
        return res.status(403).json({ success: false, message: "Access Denied" });
      }

      if (email && email !== customer.email) {
        const existingEmail = await customerModel.findOne({
          store: req.store._id,
          email,
          _id: { $ne: customerId },
        });
        if (existingEmail) {
          return res.json({ success: false, message: "Email already in use by another customer" });
        }
      }

      if (phone && String(phone) !== String(customer.phone)) {
        const existingPhone = await customerModel.findOne({
          store: req.store._id,
          phone,
          _id: { $ne: customerId },
        });
        if (existingPhone) {
          return res.json({ success: false, message: "Phone already in use by another customer" });
        }
      }

      const updateFields = {};
      if (name) updateFields.name = name;
      if (email) updateFields.email = email;
      if (phone) updateFields.phone = phone;
      if (countryCode) updateFields.countryCode = countryCode;
      if (dob) updateFields.dob = dob;
      if (gender !== undefined) updateFields.gender = gender;

      const updated = await customerModel.findByIdAndUpdate(
        customerId,
        { $set: updateFields },
        { new: true }
      );

      console.log(`✅ [editCustomerByStore] Updated customer ${customerId}`);
      return res.json({ success: true, message: "Customer updated successfully", customer: updated });
    } catch (error) {
      console.error("❌ [editCustomerByStore] Error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  //GET POINTS HISTORY
  async getPointsHistory(req, res) {
    try {
      const { customerId } = req.params;
      const history = await pointsHistoryModel
        .find({ customer: customerId })
        .populate("outlet")
        .sort({ createdAt: -1 });
      return res.send(history);
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  }

  async awardPoints(req, res) {
    try {
      const { customerId } = req.params; // Extract customerId correctly
      const { points, billID, storeId } = req.body; // Including storeId in the request body

      const store = await storeModel.findById(storeId);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      let isAdmin, isStoreOwner, isSameStore;

      if (req.user) {
        isAdmin = req.user.role === "admin";
        isStoreOwner = req.user._id.equals(store.user[0]);
      } else {
        isSameStore = store._id.equals(req.store._id);
      }

      if (!isAdmin && !isStoreOwner && !isSameStore) {
        return res
          .status(403)
          .json({ success: false, message: "Access Denied" });
      }

      // Validate the necessary fields
      const numericPoints = parseFloat(points);
      if (!customerId || !storeId || isNaN(numericPoints) || numericPoints <= 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide all necessary details",
        });
      }

      // Validate customerId format
      if (!customerId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: "Invalid customer ID format",
        });
      }

      // Find Store

      let finalPoints = points;

      if (store.isRounded) {
        finalPoints = Math.round(points);
      } else {
        finalPoints = Number(points);
      }

      // Find the customer by ID
      const customer = await customerModel
        .findById(customerId)
        .populate("store");
      if (!customer || customer.store.id !== storeId) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      const totalPoints =
        customer.totalPoints < customer.points
          ? parseFloat(customer.points + finalPoints).toFixed(1)
          : parseFloat((customer.totalPoints + finalPoints).toFixed(1));

      // Normalize outlet to location string for analytics consistency
      let outletLocAward = null;
      const rawOutlet = req.body.outlet;
      if (rawOutlet) {
        if (typeof rawOutlet === 'string' && !rawOutlet.match(/^[0-9a-fA-F]{24}$/)) {
          outletLocAward = rawOutlet;
        } else {
          try {
            const outletModel = require('../models/outletModel');
            const foundOutlet = await outletModel.findOne({ $or: [{ _id: rawOutlet }, { location: rawOutlet }], _id: { $in: store.outlets } });
            if (foundOutlet) outletLocAward = foundOutlet.location || foundOutlet.name;
          } catch {}
        }
      }

      await pointsHistoryModel.create({
        points: finalPoints,
        billID,
        customer,
        store: storeId,
        outlet: outletLocAward,
      });

      // Update visit analytics
      try {
        await updateVisitAnalytics(customerId, storeId, outletLocAward, finalPoints);
      } catch (analyticsError) {
        console.error('[awardPoints] Analytics update failed:', analyticsError.message);
      }

      // Award points by incrementing the customer's points field
      const updatedCustomer = await customerModel.findByIdAndUpdate(
        customerId, // Customer ID
        {
          $inc: { points: finalPoints },
          $set: { pointChangeDate: new Date(), totalPoints: totalPoints },
        }, // Increment the points by the provided amount
        { new: true } // Returns the updated document
      );

      // Send push notification after awarding points
      if (updatedCustomer) {
        try {
          console.log('[awardPoints] Attempting to send notification for customer:', customer._id);

          const getMessage = await mailSMSModel.findOne({ store: storeId });

          if (!getMessage) {
            console.error('[awardPoints] NO MAILSMS DOCUMENT FOUND for store:', storeId);
            console.error('[awardPoints] Notification skipped - store needs mailSMS configuration');
          } else if (!getMessage.notificationAfterPointEarned) {
            console.error('[awardPoints] NO notificationAfterPointEarned field in mailSMS for store:', storeId);
          } else if (!getMessage.notificationAfterPointEarned.body) {
            console.error('[awardPoints] notificationAfterPointEarned.body is EMPTY for store:', storeId);
          } else {
            // Template exists - send notification
            let title = getMessage.notificationAfterPointEarned.title;
            let body = getMessage.notificationAfterPointEarned.body;

            console.log('[awardPoints] Sending notification:', {
              userId: customer._id,
              points: finalPoints,
              storeName: store.name,
              title,
              bodyTemplate: body
            });

            const notificationResponse = await notificationController.singleNotification({
              title,
              body,
              userId: customer._id,
              points: finalPoints,
              storeName: store.name,
              storeURL: store.url,
              customerName: customer.name,
              customerEmail: customer.email,
              customerPhone: customer.phone,
              storeId: store._id,
            });

            console.log('[awardPoints] Notification response:', notificationResponse);

            // Save notification to database regardless of push success
            // (DB notification still useful even if push fails)
            const notification = new notificationModel({
              store: store._id,
              title: title || "Notification",
              message: notificationResponse.formattedMessage || body,
              receivers: [{ customer: customer._id, read: false, readAt: null }],
            });
            await notification.save();
            console.log('[awardPoints] Notification saved to DB');

            if (!notificationResponse.success) {
              console.warn('[awardPoints] Push notification failed but DB notification saved:', notificationResponse.error);
            }
          }
        } catch (notificationError) {
          // Don't fail the entire request if notification fails
          console.error('[awardPoints] Notification error:', notificationError);
        }
      }

      if (updatedCustomer) {
        return res.status(200).json({
          success: true,
          message: "Awarded points successfully",
          customer: updatedCustomer,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to update points",
      });
    } catch (error) {
      console.error("Error awarding points:", error);
      return res.status(500).json({
        success: false,
        message: `Error: ${error.message}`,
      });
    }
  }

  async testNotification(req, res) {
    try {
      const { customerId, storeId } = req.body;

      const customer = await customerModel.findById(customerId);
      const store = await storeModel.findById(storeId);

      if (!customer || !store) {
        return res.status(404).json({ success: false, message: "Customer or store not found" });
      }

      const notificationResponse = await notificationController.singleNotification({
        title: "Test Notification",
        body: "Test: You earned [points_earned] points from [store_name]!",
        userId: customer._id,
        points: 10,
        storeName: store.name,
        storeURL: store.url,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        storeId: store._id,
      });

      return res.json({
        success: true,
        notificationResponse,
        customerHasSubscription: !!notificationResponse.success
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async fetchPointsHistory(req, res) {
    try {
      const { storeId } = req.params;

      // Check if the store exists
      const store = await storeModel.findById(storeId);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store Not found",
        });
      }

      let isAdmin, isStoreOwner, isSameStore;

      if (req.user) {
        isAdmin = req.user.role === "admin";
        isStoreOwner = req.user._id.equals(store.user[0]);
      } else {
        isSameStore = store._id.equals(req.store._id);
      }

      if (!isAdmin && !isStoreOwner && !isSameStore) {
        return res
          .status(403)
          .json({ success: false, message: "Access Denied" });
      }

      // Fetch all points history for the store and populate customer
      const points = await pointsHistoryModel
        .find({ store: storeId })
        .populate("customer")
        .sort({ createdAt: -1 })
        .lean();

      if (!points.length) {
        return res.status(404).json({
          success: false,
          message: "No points history found",
        });
      }

      // Get all unique outlet identifiers — both ObjectId references and ID strings
      const outletModel = require("../models/outletModel");
      const allOutletValues = [...new Set(points.map(p => p.outlet).filter(Boolean))];
      const outletIds = allOutletValues.filter(o => typeof o !== 'string' || o.match(/^[0-9a-fA-F]{24}$/));

      // Fetch all outlets at once
      const outlets = await outletModel.find({ _id: { $in: outletIds } }).lean();
      const outletMap = {};
      outlets.forEach(outlet => {
        outletMap[outlet._id.toString()] = outlet;
      });

      // Transform outlet data
      const transformedPoints = points.map(point => {
        if (!point.outlet) {
          return point;
        }

        // If outlet is a string that looks like an ObjectId, resolve it
        if (typeof point.outlet === 'string' && point.outlet.match(/^[0-9a-fA-F]{24}$/)) {
          const found = outletMap[point.outlet];
          if (found) {
            point.outlet = {
              _id: found._id,
              location: found.location,
              name: found.name
            };
          } else {
            point.outlet = null;
          }
          return point;
        }

        // If outlet is already a non-ObjectId string (location name), create object
        if (typeof point.outlet === 'string') {
          point.outlet = { location: point.outlet };
          return point;
        }

        // If outlet is an ObjectId reference, replace with outlet data
        const outletId = point.outlet.toString();
        if (outletMap[outletId]) {
          point.outlet = {
            _id: outletMap[outletId]._id,
            location: outletMap[outletId].location,
            name: outletMap[outletId].name
          };
        } else {
          // Outlet not found, set to null
          point.outlet = null;
        }

        return point;
      });

      return res.status(200).json({
        success: true,
        points: transformedPoints,
      });
    } catch (error) {
      console.error("Error fetching points history:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch points history",
        error: error.message,
      });
    }
  }

  async undoPointsHistoryEntry(req, res) {
    try {
      const { entryId } = req.params;
      const { pin } = req.body;

      // Verify outlet PIN
      if (!pin) {
        return res.status(400).json({ success: false, message: "PIN is required" });
      }
      const store = req.store;
      let isPINValid = false;
      if (store.pin && store.pin !== "1234") {
        isPINValid = bcrypt.compareSync(pin, store.pin);
      } else {
        isPINValid = pin === "1234";
      }
      if (!isPINValid) {
        return res.status(401).json({ success: false, message: "Incorrect PIN" });
      }

      const entry = await pointsHistoryModel.findById(entryId);
      if (!entry) {
        return res.status(404).json({ success: false, message: "Points history entry not found" });
      }

      if (!entry.store.equals(store._id)) {
        return res.status(403).json({ success: false, message: "Access Denied" });
      }

      const customer = await customerModel.findById(entry.customer);
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      // Reverse the points change
      const reversedPoints = -entry.points;
      const newPoints = Math.max(0, customer.points + reversedPoints);
      customer.points = newPoints;
      customer.pointChangeDate = new Date();
      await customer.save();

      // Delete the original entry
      await pointsHistoryModel.findByIdAndDelete(entryId);

      console.log(`✅ [undoPointsHistoryEntry] Entry ${entryId} undone. Customer ${customer._id} points: ${customer.points}`);
      return res.json({ success: true, message: "Points entry reverted successfully", newPoints });
    } catch (error) {
      console.error("❌ [undoPointsHistoryEntry] Error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  async importCSV(req, res) {
    const { storeID } = req.body;

    if (!storeID) {
      return res
        .status(400)
        .json({ error: "Missing store ID (selectedValue)." });
    }

    try {
      const records = [];
      const uniqueCustomers = new Set();
      let headerLogged = false;

      const stream = streamifier
        .createReadStream(req.file.buffer)
        .pipe(csv.parse({ headers: true, trim: true }));

      for await (const row of stream) {
        try {
          if (!headerLogged) {
            headerLogged = true;
          }

          const name = row["Name"] || row["name"];
          const email = (row["Email"] || row["email"] || "")
            .trim()
            .toLowerCase();
          const phone = row["Phone"] || row["phone"];
          const points =
            parseInt(row["Total Points"] || row["points"], 10) || 0;

          if (!name || !email || !phone || isNaN(points)) {
            console.warn("⚠ Skipping invalid row:", row);
            continue;
          }

          const normalizedPhone = parseInt(phone.replace(/^\+977/, ""), 10);

          const existingCustomer = await customerModel.findOne({
            $or: [
              { $and: [{ email }, { store: storeID }] },
              { $and: [{ phone: normalizedPhone }, { store: storeID }] },
            ],
          });

          if (existingCustomer) {
            existingCustomer.points += points;
            await existingCustomer.save();
          } else {
            const uniqueKey = `${storeID}_${email}`;
            if (uniqueCustomers.has(uniqueKey)) {
              continue;
            }

            uniqueCustomers.add(uniqueKey);

            records.push({
              name: name.trim(),
              email,
              phone: normalizedPhone,
              points,
              store: new mongoose.Types.ObjectId(storeID),
            });
          }
        } catch (err) {
          console.error("❌ Error processing row:", row, err);
        }
      }

      if (records.length > 0) {
        await customerModel.insertMany(records);
      }

      res.status(200).json({
        message: "CSV import complete.",
        insertedCount: records.length,
      });
    } catch (error) {
      console.error("❌ Import failed:", error);
      res
        .status(500)
        .json({ error: "CSV import failed.", details: error.message });
    }
  }

  async changeDeliveryCharge(req, res) {
    try {
      const { storeId } = req.params;
      const { deliveryCharge } = req.body;
      const store = await storeModel.findById(storeId);
      if (!store) {
        return res.json({ success: false, message: "Store not found" });
      }
      if (req.user._id.equals(store.user[0]) || req.user.role === "admin") {
        store.services.ecommerce.deliveryCharge = deliveryCharge;
        await store.save();
        return res.json({
          success: true,
          message: "Delivery Charge Updated",
          store,
        });
      } else {
        return res.json({ success: false, message: "Access Denied" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  }

  // offer controllers //

  // CREATE
  async createOffer(req, res) {
    try {
      const { storeId } = req.params;
      const { title, description, startDate, expiryDate } = req.body;
      // FormData sends booleans as strings; coerce explicitly
      const display = req.body.display === true || req.body.display === "true";

      if (!storeId || !title || !description || !startDate || !expiryDate) {
        return res
          .status(400)
          .json({ message: "All required fields must be provided." });
      }

      const offer = new offerModel({
        store: storeId,
        title,
        description,
        startDate,
        expiryDate,
        display,
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

        offer.image = imageName;
      }

      await offer.save();

      return res.status(201).json({
        message: "Offer created successfully",
        offer,
      });
    } catch (error) {
      console.error("Error creating offer:", error);
      return res.status(500).json({ message: "Server error", error });
    }
  }

  // READ (Get offers by store)
  async getOffersByStore(req, res) {
    try {
      const { storeId } = req.params;
      const offers = await offerModel.find({ store: storeId });

      const offersWithUrls = await Promise.all(
        offers.map(async (offer) => {
          const offerObj = offer.toObject();
          if (offerObj.image) {
            const getObjectParams = {
              Bucket: "samparka",
              Key: offerObj.image,
            };
            const command = new GetObjectCommand(getObjectParams);
            offerObj.image = await getSignedUrl(s3, command, {
              expiresIn: 3600,
            });
          }
          return offerObj;
        })
      );

      return res.status(200).json(offersWithUrls);
    } catch (error) {
      console.error("Error fetching store offers:", error);
      return res.status(500).json({ message: "Server error", error });
    }
  }

  // READ (Get single offer)
  async getOfferById(req, res) {
    try {
      const offer = await offerModel.findById(req.params.id).populate("store");
      if (!offer) return res.status(404).json({ message: "Offer not found" });

      const offerObj = offer.toObject();
      if (offerObj.image) {
        const getObjectParams = {
          Bucket: "samparka",
          Key: offerObj.image,
        };
        const command = new GetObjectCommand(getObjectParams);
        offerObj.image = await getSignedUrl(s3, command, { expiresIn: 3600 });
      }

      return res.status(200).json(offerObj);
    } catch (error) {
      console.error("Error fetching offer:", error);
      return res.status(500).json({ message: "Server error", error });
    }
  }

  // UPDATE OFFER

  async updateOffer(req, res) {
    try {
      const { id } = req.params;
      const offer = await offerModel.findById(id).populate("store");

      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }

      const isOwner =
        offer.store &&
        offer.store.user &&
        offer.store.user[0] &&
        req.user._id.equals(offer.store.user[0]);

      if (!isOwner && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access Denied" });
      }

      // Update only allowed fields
      const allowedFields = [
        "title",
        "description",
        "startDate",
        "expiryDate",
        "display",
      ];
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          if (field.includes("Date")) {
            offer[field] = new Date(req.body[field]);
          } else if (field === "display") {
            // FormData always sends booleans as strings; coerce explicitly
            offer[field] = req.body[field] === true || req.body[field] === "true";
          } else {
            offer[field] = req.body[field];
          }
        }
      });

      // Handle new image upload
      if (req.file) {
        // Delete previous image from S3 if it exists
        if (offer.image) {
          const deleteParams = {
            Bucket: "samparka",
            Key: offer.image, // previous image key
          };
          await s3.send(new DeleteObjectCommand(deleteParams));
        }

        // Upload new image
        const imageName = Date.now().toString() + "-" + req.file.originalname;
        const putParams = {
          Bucket: "samparka",
          Key: imageName,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        };
        await s3.send(new PutObjectCommand(putParams));

        // Update offer with new key
        offer.image = imageName;
      }

      // Update isActive based on expiryDate
      // offer.isActive = offer.expiryDate >= new Date();

      await offer.save();

      return res.status(200).json({
        message: "Offer updated successfully",
        offer,
      });
    } catch (error) {
      console.error("Error updating offer:", error);
      return res.status(500).json({ message: "Server error", error });
    }
  }

  // DELETE
  async deleteOffer(req, res) {
    try {
      const { id } = req.params;
      const offer = await offerModel.findById(id).populate("store");
      if (
        req.user._id.equals(offer.store.user[0]) ||
        req.user.role === "admin"
      ) {
        const offer = await offerModel.findByIdAndDelete(id);

        if (!offer) {
          return res.status(404).json({ message: "Offer not found" });
        }

        return res.status(200).json({ message: "Offer deleted successfully" });
      } else {
        return res.json({ success: false, message: "Access Denied" });
      }
    } catch (error) {
      console.error("Error deleting offer:", error);
      return res.status(500).json({ message: "Server error", error });
    }
  }
}

module.exports = new StoreController();
