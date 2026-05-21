// import express from "express";
// import Store from "../models/storeModel.js";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
const express = require("express");
const Store = require("../models/storeModel");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3Config.js");
const Subscription = require("../models/Subscription.js");

const router = express.Router();

// Helper: stream an image (S3 key or public URL) directly to the response
const streamImageToResponse = async (logoKey, res, cacheMaxAge = 86400) => {
  res.setHeader("Cache-Control", `public, max-age=${cacheMaxAge}`);
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (logoKey.startsWith("http")) {
    const axios = require("axios");
    const imgRes = await axios.get(logoKey, { responseType: "stream" });
    res.setHeader("Content-Type", imgRes.headers["content-type"] || "image/png");
    imgRes.data.pipe(res);
    return;
  }

  const command = new GetObjectCommand({ Bucket: "samparka", Key: logoKey });
  const s3Resp = await s3.send(command);
  res.setHeader("Content-Type", s3Resp.ContentType || "image/png");
  for await (const chunk of s3Resp.Body) {
    res.write(chunk);
  }
  res.end();
};

// Logo proxy endpoint - serves logos with stable URLs for PWA
router.get("/logo/:storeUrl", async (req, res) => {
  try {
    const { storeUrl } = req.params;
    const store = await Store.findOne({ url: storeUrl }).lean();

    if (!store || !store.logo) {
      return res.status(404).send("Logo not found");
    }

    await streamImageToResponse(store.logo, res, 86400);
  } catch (error) {
    console.error("Logo proxy error:", error);
    if (!res.headersSent) return res.status(500).send("Error fetching logo");
  }
});

// Apple touch icon endpoint - iOS and Android icon serving
router.get("/apple-touch-icon/:storeUrl.png", async (req, res) => {
  try {
    const { storeUrl } = req.params;
    const store = await Store.findOne({ url: storeUrl }).lean();

    if (!store || !store.logo) {
      return res.status(404).send("Logo not found");
    }

    await streamImageToResponse(store.logo, res, 86400);
  } catch (error) {
    console.error("Apple touch icon error:", error);
    if (!res.headersSent) return res.status(500).send("Error fetching icon");
  }
});

// Helper: fetch an image (S3 key or URL) and return as base64 data URL
const fetchImageAsBase64 = async (key) => {
  if (!key) return null;
  try {
    if (key.startsWith("http")) {
      const axios = require("axios");
      const resp = await axios.get(key, { responseType: "arraybuffer" });
      const mime = resp.headers["content-type"] || "image/png";
      return `data:${mime};base64,${Buffer.from(resp.data).toString("base64")}`;
    }
    const command = new GetObjectCommand({ Bucket: "samparka", Key: key });
    const s3Resp = await s3.send(command);
    const chunks = [];
    for await (const chunk of s3Resp.Body) chunks.push(chunk);
    const buf = Buffer.concat(chunks);
    const mime = s3Resp.ContentType || "image/png";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch (err) {
    console.error("❌ fetchImageAsBase64 error:", key, err.message);
    return null;
  }
};

// Returns all store images needed for the QR flyer as base64
router.get("/flyer-images/:storeUrl", async (req, res) => {
  try {
    const { storeUrl } = req.params;
    const store = await Store.findOne({ url: storeUrl }).lean();
    if (!store) return res.status(404).json({ error: "Store not found" });

    const lc = store.loyaltyCard || {};
    const [logo, customStamp, cardImage, qrStandBg] = await Promise.all([
      fetchImageAsBase64(store.frontLogo || store.logo),
      fetchImageAsBase64(lc.customStamp),
      fetchImageAsBase64(lc.cardImage),
      fetchImageAsBase64(store.qrStandBg),
    ]);

    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.json({ logo, customStamp, cardImage, qrStandBg });
  } catch (error) {
    console.error("❌ Flyer images error:", error);
    return res.status(500).json({ error: "Failed to fetch images" });
  }
});

// Proxy an image URL as base64 — restricted to trusted S3 domains to prevent open-proxy abuse
router.get("/proxy-image", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "url param required" });

    let hostname;
    try {
      hostname = new URL(url).hostname;
    } catch {
      return res.status(400).json({ error: "Invalid URL" });
    }

    const trusted = ["s3-np1.datahub.com.np", "amazonaws.com", "s3.amazonaws.com"];
    if (!trusted.some((d) => hostname === d || hostname.endsWith(`.${d}`))) {
      return res.status(403).json({ error: "Untrusted domain" });
    }

    const base64 = await fetchImageAsBase64(url);
    if (!base64) return res.status(502).json({ error: "Could not fetch image" });

    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.json({ data: base64 });
  } catch (error) {
    console.error("❌ proxy-image error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Dynamic manifest.json route
router.get("/manifest.json", async (req, res) => {
  try {
    const { subdomain, type = "user", outletId } = req.query;

    const store = await Store.findOne({ url: subdomain });
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    // Use stable proxy URL — never expires, no redirect chain, has CORS headers
    const logoUrl = `https://server.samparka.co/logo/${subdomain}`;

    const isAdmin = type === "admin";
    const baseUrl = `https://${subdomain}.samparka.co`;

    const startUrl = isAdmin
      ? outletId
        ? `${baseUrl}/store/points?outlet=${outletId}`
        : `${baseUrl}/store/points`
      : `${baseUrl}/loyality`;

    const manifest = {
      name: isAdmin ? "Admin" : store.name,
      short_name: isAdmin ? "Admin" : store.name,
      start_url: startUrl,
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
      scope: "/",
      orientation: "portrait",
      prefer_related_applications: false,
      icons: [
        {
          src: logoUrl,
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: logoUrl,
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    };

    res.setHeader("Content-Type", "application/manifest+json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.status(200).json(manifest);
  } catch (error) {
    console.error("Manifest error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// SUBSCRIBE NOTIFICATION
router.post("/subscribe", async (req, res) => {
  const { userId, subscription } = req.body;
  try {
    // Check if user already has a subscription
    let existingSubscription = await Subscription.findOne({ userId });
    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.subscription = subscription;
      await existingSubscription.save();
    } else {
      // Create new subscription
      await Subscription.create({ userId, subscription });
    }
    res.status(201).json({ message: "Subscription saved!" });
  } catch (error) {
    console.error("Error saving subscription:", error);
    res.status(500).json({ message: "Failed to save subscription" });
  }
});

// UN-SUBSCRIBE NOTIFICATION
router.delete("/unsubscribe/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  try {
    const deletedSubscription = await Subscription.findOneAndDelete({ userId });

    if (!deletedSubscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }
    res.status(204).send(); // No content response
  } catch (error) {
    console.error("Error unsubscribing:", error);
    res.status(500).json({ message: "Failed to unsubscribe" });
  }
});

//check subscription
router.get("/checkSub/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const sub = await Subscription.findOne({ userId });
    if (!sub) {
      return res.send(false);
    }
    return res.send(true);
  } catch (error) {
    console.log("check error: ", error);
    return res.status(500).send("Internal Server Error", error);
  }
});

// export default router;
module.exports = router;
