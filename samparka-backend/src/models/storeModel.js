const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// L5 Configuration Schema
const l5ConfigSchema = new mongoose.Schema({
  // Point redemption thresholds (default HJ thresholds)
  redemptionThresholds: {
    type: [Number],
    default: [775, 1500, 2500, 5000, 8000, 10000, 50000],
  },
  // Reward configuration for each threshold
  rewards: [
    {
      threshold: { type: Number, required: true },
      rewardType: {
        type: String,
        enum: ["discount", "physical", "voucher"],
        required: true,
      },
      discountPercentage: { type: Number }, // For discount type
      rewardName: { type: String }, // e.g., "Free Americano (S)"
      rewardDescription: { type: String },
      image: { type: String }, // S3 image key
      validity: { type: String }, // "instant" or number of days
      evergreen: { type: Boolean, default: false },
    },
  ],
  // Discount validity in days
  discountValidityDays: {
    type: Number,
    default: 30,
    min: 1,
    max: 365,
  },
  // Leaderboard minimum qualification points
  leaderboardMinPoints: {
    type: Number,
    default: 3000,
  },
  // Coffee Hero minimum redeemed points
  coffeeHeroMinPoints: {
    type: Number,
    default: 5000,
  },
  // Monthly leaderboard prizes configuration
  leaderboardPrizes: [
    {
      rank: { type: Number, required: true }, // 1, 2, 3, or range start for 4-10
      rankEnd: { type: Number }, // For ranges like 4-10
      prizeType: {
        type: String,
        enum: ["cash_voucher", "movie_ticket", "coffee", "other"],
      },
      totalAmount: { type: Number }, // Total prize value
      splitCount: { type: Number, default: 1 }, // How many vouchers to split into
      splitAmount: { type: Number }, // Amount per voucher
      prizeDescription: { type: String },
    },
  ],
  // 3-month winner configuration
  threeMonthWinnerDiscount: {
    type: Number,
    default: 50,
    min: 0,
    max: 100,
  },
  threeMonthWinnerCategory: {
    type: String,
    default: "coffee",
    enum: ["coffee", "food", "all"],
  },
  threeMonthWinnerDuration: {
    type: Number,
    default: 30, // Days the discount is valid
  },
  // Coffee Hero prize configuration
  coffeeHeroDays: {
    type: Number,
    default: 30,
  },
  coffeeHeroReward: {
    type: String,
    default: "Free Americano (S)",
  },
  // Whether discounts can stack
  allowDiscountStacking: {
    type: Boolean,
    default: true,
  },
  // Maximum total discount when stacking (null = no limit)
  maxStackedDiscount: {
    type: Number,
    default: null,
  },
});

const loyaltySchema = new mongoose.Schema({
  format: {
    type: String,
    enum: ["L1", "L2", "L3", "L34HA", "L4", "L5", "L6"],
    default: "L2",
  },
  totalShapes: { type: Number, default: 9 },
  stampColor: { type: String, default: "#22C55E" },
  cardColor: { type: String, default: "#016e49" },
  cardImage: { type: String, default: "" },
  textColor: { type: String, default: "#ffffff" },
  stamp: { type: String, default: "" },
  stampShape: { type: String, default: "circle" },
  customStamp: { type: String, default: "" },
  tier: [
    {
      name: { type: String, default: "Bronze" },
      minPoints: { type: Number, default: 0 },
      maxPoints: { type: Number, default: 100 },
      maintain: { type: Number },
      color: { type: String, default: "#000000" },
      // L4-specific fields
      discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
      maintenancePeriod: { type: Number }, // Optional per-tier override (days)
      // L4 per-tier card appearance overrides
      cardColor: { type: String, default: "" },
      textColor: { type: String, default: "" },
      stamp: { type: String, default: "" },
      customStamp: { type: String, default: "" },
      cardImage: { type: String, default: "" },
    },
  ],
  // inactivity: { type: Number, default: 30 },
  demote: { type: Number, default: 365 },
  // L5 specific configuration
  l5Config: { type: l5ConfigSchema, default: () => ({}) },
  // L6 specific configuration (flexible key-value store)
  l6Config: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
});

const receiptScanSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  approvalMode: {
    type: String,
    enum: ["hold", "auto_flag", "fully_automated"],
    default: "hold",
  },
  pointsMode: {
    type: String,
    enum: ["total_based", "item_based"],
    default: "total_based",
  },
  maxReceiptAgeDays: { type: Number, default: 7 },
  maxAmountThreshold: { type: Number, default: null },
  ocrConfidenceMin: { type: Number, default: 0.6, min: 0, max: 1 },
  // Configurable smart auto-approval thresholds
  autoApproveMaxFraudScore: { type: Number, default: 40, min: 0, max: 100 },
  autoApproveMinConfidence: { type: Number, default: 0.6, min: 0, max: 1 },
  dailySubmitLimit: { type: Number, default: 3 },
  weeklySubmitLimit: { type: Number, default: 10 },
  // Alternate store name spellings for name-matching fraud check
  nameAliases: { type: [String], default: [] },
  // OCR provider preference: paddleocr | google_vision | openai | gemini
  ocrProvider: {
    type: String,
    enum: ["paddleocr", "google_vision", "openai", "gemini"],
    default: "paddleocr",
  },
});

const ecommerceSchema = new mongoose.Schema({
  status: { type: Boolean, default: false },
  storeDescription: { type: String },
  storeBanner: { type: String },
  deliveryCharge: { type: Number, default: 150 },
});

const servicesSchema = new mongoose.Schema({
  loyalty: { type: Boolean, default: true },
  reservation: { type: Boolean, default: false },
  ecommerce: { type: ecommerceSchema, default: () => ({}) },
  games: { type: Boolean, default: false },
  multipleOutlets: { type: Boolean, default: false },
  leaderboard: { type: Boolean, default: false },
  onGoingOffers: { type: Boolean, default: false },
  powered: { type: Boolean, default: true },
  l5: { type: Boolean, default: false },
});

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    timezone: { type: String, default: "Asia/Kathmandu", required: true },
    phone: { type: String, required: true },
    logo: { type: String, required: true },
    frontLogo: { type: String },
    qrStandBg: { type: String },
    url: { type: String, required: true, unique: true },
    needCustomerDOB: { type: Boolean, required: true, default: false },
    needCustomerGender: { type: Boolean, required: true, default: false },
    needBillID: { type: Boolean, required: true, default: false },
    needBillIDForReward: { type: Boolean, required: true, default: false },
    letSubAdminToGiveManualPoints: {
      type: Boolean,
      required: true,
      default: true,
    },
    letSubAdminToClaimRewards: {
      type: Boolean,
      required: true,
      default: false,
    },
    showPhoneNumberOnSubAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    showEmailOnSubAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    whatsapp: { type: Boolean, required: true, default: false },
    whatsappOrder: { type: Boolean, required: true, default: false },
    requireOTP: { type: Boolean, default: false },
    requireEmailOTP: { type: Boolean, default: true },
    requirePhoneOTP: { type: Boolean, default: false },
    limitPoints: { type: Boolean, required: true, default: false },
    givePointsOnRegister: { type: Boolean, required: true, default: true },
    hasExpiry: { type: Boolean, default: false },
    expireDuration: { type: Number },
    pin: {
      type: String,
      default: function () {
        return bcrypt.hashSync("1234", 10);
      },
    },
    // Double points days: 0=Sun, 1=Mon, ..., 6=Sat
    doublePoints: { type: Boolean, default: false },
    doublePointsDays: { type: [Number], default: [] },

    // Master customer code — when entered in place of an OTP it bypasses verification.
    // Allows merchants to log customers in without waiting for the real OTP to arrive.
    customerCode: { type: String, default: "666666" },
    email: { type: String },
    pass: { type: String },
    host: { type: String },
    port: { type: Number },
    secure: { type: String, enum: ['none', 'tls', 'ssl'], default: 'tls' },
    smsToken: { type: String },
    loyaltyCard: { type: loyaltySchema, default: () => ({}) },
    services: { type: servicesSchema, default: () => ({}) },
    receiptScan: { type: receiptScanSchema, default: () => ({}) },

    //Subscription
    subscriptionStartDate: {
      type: Date,
    },
    subscriptionEndDate: {
      type: Date,
    },
    type: {
      type: String,
      enum: ["retail", "food", "service"],
      required: true,
      default: "retail",
    },
    status: {
      type: String,
      enum: ["active", "deactive"],
      default: "active",
    },
    amount: {
      type: Boolean,
    },
    conversionRate: {
      type: String,
    },
    pointValue: {
      type: String,
    },
    isRounded: {
      type: Boolean,
      default: true,
    },
    hasExpiry: {
      type: Boolean,
      default: false,
    },
    expiryDays: {
      type: Number,
      min: 30,
      max: 365,
    },

    // L4 Loyalty Format Store-Level Settings
    pointEarnRate: {
      type: Number,
      default: 0.07,
      min: 0,
      max: 1,
    },

    // Checking for location notification
    lat: {
      type: Number,
      min: -90,
      max: 90,
    },
    lng: {
      type: Number,
      min: -180,
      max: 180,
    },

    // Admin-assigned price label for this store
    price: {
      type: Number,
      default: null,
    },

    //outlet
    outlets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Outlet",
      },
    ],

    user: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Normalize legacy boolean secure values before validation runs
storeSchema.pre('validate', function (next) {
  const validSecure = ['none', 'tls', 'ssl'];
  if (!validSecure.includes(this.secure)) {
    this.secure = (this.secure === true || this.secure === 'true') ? 'ssl' : 'tls';
  }
  next();
});

// Automatically mark store as deactive if subscription expired
storeSchema.pre("save", function (next) {
  if (this.subscriptionEndDate) {
    this.status = new Date(this.subscriptionEndDate) > new Date() ? "active" : "deactive";
  }
  next();
});

// Check and update expired stores on every query
storeSchema.post(/^find/, async function (docs) {
  if (!docs) return;
  
  const stores = Array.isArray(docs) ? docs : [docs];
  const now = new Date();
  
  for (const store of stores) {
    if (store && store.subscriptionEndDate && new Date(store.subscriptionEndDate) < now && store.status === "active") {
      await this.model.findByIdAndUpdate(store._id, { status: "deactive" });
      store.status = "deactive";
    }
  }
});

const storeModel = mongoose.model("Store", storeSchema);
module.exports = storeModel;
