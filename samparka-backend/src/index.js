const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");

// Config & background jobs
const { getDatabaseConfig } = require("./config/database");
const { rescheduleReport } = require("./config/cornJob");
const { initL5CronJobs } = require("./config/l5CronJobs.js");
require("./queue/worker");

// testinggi

// Models
const storeModel = require("./models/storeModel");
const mailSMSModel = require("./models/mailSMSModel");
const WhatsappOutgoing = require("./models/WhatsappOutgoing.js");
const adminSettingsModel = require("./models/adminSettingsModel");

// Routes
const manifestRoute = require("./routes/manifestRoute");
const userRoute = require("./routes/userRoute");
const googleAuthRoute = require("./routes/googleAuthRoute");
const adminRoute = require("./routes/adminRoute");
const storeRoute = require("./routes/storeRoute");
const rewardRoute = require("./routes/rewardRoute");
const customerRoute = require("./routes/customerRoute");
const productRoute = require("./routes/productRoute");
const ecomRoute = require("./routes/ecomRoute");
const orderRoute = require("./routes/orderRoute");
const wheelRoute = require("./routes/wheelRoute");
const voteRoute = require("./routes/vote.route.js");
const whatsappRoutes = require("./routes/whatsappRoutes.js");
const whatsappWebhook = require("./routes/whatsappWebhook.js");
const visitAnalyticsRoute = require("./routes/visitAnalyticsRoute.js");
const campaignRoute = require("./routes/campaignRoute.js");
const paymentRoute = require("./routes/paymentRoute.js");
const l5Route = require("./routes/l5Route.js");
const adminControlRoute = require("./routes/adminControlRoute.js");
const l4ReportRoute = require("./routes/l4ReportRoute.js");
const receiptRoute = require("./routes/receiptRoute.js");
const aiChatRoute = require("./routes/aiChatRoute.js");

// ─── App setup ───────────────────────────────────────────────────────────────

const app = express();
const port = process.env.PORT || 8000;

// Razorpay webhook needs the raw body for HMAC signature verification — must
// be registered before the JSON body parsers below.
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

// SEO: noindex all merchant subdomain requests
app.use((req, res, next) => {
  const host = req.hostname || '';
  const isMain = host === 'samparka.co' || host === 'www.samparka.co';
  if (!isMain) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── CORS ────────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  "https://samparka.co",
  "https://www.samparka.co",
  "http://localhost:5173",
  "http://localhost:5174",
  /^http:\/\/[a-z0-9-]+\.localhost:5173$/,
  /^http:\/\/[a-z0-9-]+\.localhost:5174$/,
  /^https:\/\/[a-z0-9-]+\.samparka\.info$/,
  /^https:\/\/[a-z0-9-]+\.samparka\.co$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed =
        !origin ||
        ALLOWED_ORIGINS.some((o) =>
          o instanceof RegExp ? o.test(origin) : o === origin
        );
      allowed
        ? callback(null, true)
        : callback(new Error("Not allowed by CORS"));
    },
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);
app.options("*", cors());

// ─── Web Push (VAPID) ────────────────────────────────────────────────────────

const webpush = require("web-push");
const publicVapidKey = process.env.NOTIFICATION_PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.NOTIFICATION_PRIVATE_VAPID_KEY;

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(
    `mailto:${process.env.EMAIL_USER || "your-email@example.com"}`,
    publicVapidKey,
    privateVapidKey
  );
  console.log("✅ Web Push VAPID configured");
} else {
  console.warn("⚠️  VAPID keys not configured — push notifications disabled");
}

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use("/", manifestRoute);
app.use("/user", userRoute);
app.use("/auth/google", googleAuthRoute);
app.use("/admin", adminRoute);
app.use("/store", storeRoute);
app.use("/reward", rewardRoute);
app.use("/customer", customerRoute);
app.use("/product", productRoute);
app.use("/ecom", ecomRoute);
app.use("/order", orderRoute);
app.use("/api/wheel", wheelRoute);
app.use("/vote", voteRoute);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/webhook", whatsappWebhook);
app.use("/api/visitAnalytics", visitAnalyticsRoute);
app.use("/api/campaigns", campaignRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/l5", l5Route);
app.use("/api/adminControl", adminControlRoute);
app.use("/api/l4-reports", l4ReportRoute);
app.use("/api/receipts", receiptRoute);
app.use("/api/aiChat", aiChatRoute);

// ─── Utility endpoints ───────────────────────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/", (_req, res) => {
  res.send("Samparka API is running.");
});

// ─── Database ────────────────────────────────────────────────────────────────

async function connectDB() {
  const dbConfig = getDatabaseConfig();
  console.log(`🔄 Connecting to ${dbConfig.name} database (${dbConfig.env})...`);

  const mongoOptions = {
    maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE || 20),
    minPoolSize: Number(process.env.MONGODB_MIN_POOL_SIZE || 2),
    maxIdleTimeMS: Number(process.env.MONGODB_MAX_IDLE_TIME_MS || 30000),
    serverSelectionTimeoutMS: Number(
      process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 5000
    ),
    socketTimeoutMS: Number(process.env.MONGODB_SOCKET_TIMEOUT_MS || 45000),
    connectTimeoutMS: Number(process.env.MONGODB_CONNECT_TIMEOUT_MS || 10000),
  };

  const conn = await mongoose.connect(dbConfig.uri, mongoOptions);
  console.log(`✅ MongoDB connected: ${conn.connection.host} / ${conn.connection.name}`);
}

// ─── Migrations ──────────────────────────────────────────────────────────────

// One-time field backfills. Safe to run on every boot — updateMany with no
// filter is idempotent once the fields already exist.
async function runMigrations() {
  try {
    await WhatsappOutgoing.updateMany({}, { $set: { owner: "Unknown", establishedYear: 2000 } });
    await mailSMSModel.updateMany({}, { $set: { owner: "Unknown", establishedYear: 2000 } });
    await storeModel.updateMany({}, { $set: { owner: "Unknown", establishedYear: 2000 } });

    // Migrate: split requireOTP (phone-only) into requireEmailOTP + requirePhoneOTP
    await storeModel.updateMany(
      { requireEmailOTP: { $exists: false } },
      { $set: { requireEmailOTP: true } }
    );
    await storeModel.updateMany(
      { requireOTP: true, requirePhoneOTP: { $exists: false } },
      { $set: { requirePhoneOTP: true } }
    );

    console.log("✅ Migrations complete");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
}

// ─── Daily report schedule ───────────────────────────────────────────────────

// cornJob.js defaults to 20:00 NPT. If the admin last saved a different time
// via the UI, that value is persisted in adminSettingsModel. We restore it here
// on every boot so the saved schedule survives server restarts.
async function restoreReportSchedule() {
  const pad = (n) => String(n).padStart(2, "0");
  try {
    const settings = await adminSettingsModel.getSettings();
    const h = settings.reportScheduleHour;
    const m = settings.reportScheduleMinute;
    if (h !== 20 || m !== 0) {
      rescheduleReport(h, m);
      console.log(`✅ Daily report schedule restored from DB: ${pad(h)}:${pad(m)} NPT`);
    } else {
      console.log(`✅ Daily report schedule: ${pad(h)}:${pad(m)} NPT (default)`);
    }
  } catch (err) {
    console.error("⚠️ Could not restore daily report schedule from DB — keeping default 20:00 NPT:", err.message);
  }
}

// ─── Boot ────────────────────────────────────────────────────────────────────

async function startServer() {
  try {
    await connectDB();
    await runMigrations();
    await restoreReportSchedule();
    // initL5CronJobs();
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  }
}

startServer();
