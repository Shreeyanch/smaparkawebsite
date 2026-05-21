/**
 * Copy Store Data from Production to Development
 *
 * This script copies all data related to a specific store from production
 * to your development database.
 *
 * Usage: yarn copy:prod
 *
 * ⚠️  IMPORTANT: This script READS from production and WRITES to development.
 * It will NOT modify your production database.
 */

require("dotenv/config");
const mongoose = require("mongoose");

// Import all models
const User = require("../models/userModel");
const Store = require("../models/storeModel");
const Customer = require("../models/customerModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");
const Reward = require("../models/rewardModel");
const Points = require("../models/pointsModel");
const PointsHistory = require("../models/pointsHistoryModel");
const Redemption = require("../models/redemptionModel");
const Outlet = require("../models/outletModel");
const Offer = require("../models/offerModel");
const Reservation = require("../models/reservationModel");
const ReservationSetting = require("../models/reservationSettingModel");
const WheelSegment = require("../models/wheelSegment");
const Notification = require("../models/notificationModel");
const MailSMS = require("../models/mailSMSModel");

// ============================================
// CONFIGURATION
// ============================================
const STORE_NAME = "your store"; // The store to copy from production

// Get database URIs
const PROD_URI = process.env.MONGODBCONNECTIONSTRING;
const DEV_URI = process.env.MONGODB_DEV_URI;

if (!PROD_URI) {
  console.error("❌ MONGODBCONNECTIONSTRING (production) is not set in .env");
  process.exit(1);
}

if (!DEV_URI) {
  console.error("❌ MONGODB_DEV_URI (development) is not set in .env");
  process.exit(1);
}

// ============================================
// MAIN COPY FUNCTION
// ============================================
async function copyStoreFromProd() {
  console.log("═".repeat(60));
  console.log("🔄 COPY STORE DATA: Production → Development");
  console.log("═".repeat(60));
  console.log(`\n📦 Store to copy: "${STORE_NAME}"\n`);

  // Create two separate connections
  const prodConnection = await mongoose.createConnection(PROD_URI);
  const devConnection = await mongoose.createConnection(DEV_URI);

  console.log("✅ Connected to Production database");
  console.log("✅ Connected to Development database\n");

  try {
    // ============================================
    // PRODUCTION MODELS (Read Only)
    // ============================================
    const ProdUser = prodConnection.model("User", User.schema);
    const ProdStore = prodConnection.model("Store", Store.schema);
    const ProdCustomer = prodConnection.model("Customer", Customer.schema);
    const ProdProduct = prodConnection.model("Product", Product.schema);
    const ProdCategory = prodConnection.model("Category", Category.schema);
    const ProdOrder = prodConnection.model("Order", Order.schema);
    const ProdReward = prodConnection.model("Reward", Reward.schema);
    const ProdPoints = prodConnection.model("Points", Points.schema);
    const ProdPointsHistory = prodConnection.model("PointsHistory", PointsHistory.schema);
    const ProdRedemption = prodConnection.model("Redemption", Redemption.schema);
    const ProdOutlet = prodConnection.model("Outlet", Outlet.schema);
    const ProdOffer = prodConnection.model("Offer", Offer.schema);
    const ProdReservation = prodConnection.model("Reservation", Reservation.schema);
    const ProdReservationSetting = prodConnection.model("ReservationSetting", ReservationSetting.schema);
    const ProdWheelSegment = prodConnection.model("WheelSegment", WheelSegment.schema);
    const ProdNotification = prodConnection.model("Notification", Notification.schema);
    const ProdMailSMS = prodConnection.model("MailSMS", MailSMS.schema);

    // ============================================
    // DEVELOPMENT MODELS (Write)
    // ============================================
    const DevUser = devConnection.model("User", User.schema);
    const DevStore = devConnection.model("Store", Store.schema);
    const DevCustomer = devConnection.model("Customer", Customer.schema);
    const DevProduct = devConnection.model("Product", Product.schema);
    const DevCategory = devConnection.model("Category", Category.schema);
    const DevOrder = devConnection.model("Order", Order.schema);
    const DevReward = devConnection.model("Reward", Reward.schema);
    const DevPoints = devConnection.model("Points", Points.schema);
    const DevPointsHistory = devConnection.model("PointsHistory", PointsHistory.schema);
    const DevRedemption = devConnection.model("Redemption", Redemption.schema);
    const DevOutlet = devConnection.model("Outlet", Outlet.schema);
    const DevOffer = devConnection.model("Offer", Offer.schema);
    const DevReservation = devConnection.model("Reservation", Reservation.schema);
    const DevReservationSetting = devConnection.model("ReservationSetting", ReservationSetting.schema);
    const DevWheelSegment = devConnection.model("WheelSegment", WheelSegment.schema);
    const DevNotification = devConnection.model("Notification", Notification.schema);
    const DevMailSMS = devConnection.model("MailSMS", MailSMS.schema);

    // ============================================
    // STEP 1: Find the store in production
    // ============================================
    console.log(`🔍 Searching for store "${STORE_NAME}" in production...`);
    const prodStore = await ProdStore.findOne({
      name: { $regex: new RegExp(`^${STORE_NAME}$`, "i") },
    }).lean();

    if (!prodStore) {
      console.error(`❌ Store "${STORE_NAME}" not found in production database!`);
      console.log("\n📋 Available stores in production:");
      const allStores = await ProdStore.find({}, "name url").lean();
      allStores.forEach((s) => console.log(`   • ${s.name} (${s.url})`));
      process.exit(1);
    }

    console.log(`✅ Found store: ${prodStore.name} (ID: ${prodStore._id})\n`);
    const storeId = prodStore._id;

    // ============================================
    // STEP 2: Clear existing data in dev for this store
    // ============================================
    console.log("🗑️  Clearing existing data in development...");

    // Check if store already exists in dev
    const existingDevStore = await DevStore.findOne({ url: prodStore.url });
    if (existingDevStore) {
      const existingStoreId = existingDevStore._id;
      await Promise.all([
        DevCustomer.deleteMany({ store: existingStoreId }),
        DevProduct.deleteMany({ storeId: existingStoreId }),
        DevCategory.deleteMany({ store: existingStoreId }),
        DevOrder.deleteMany({ storeId: existingStoreId }),
        DevReward.deleteMany({ store: existingStoreId }),
        DevPoints.deleteMany({ store: existingStoreId }),
        DevPointsHistory.deleteMany({ store: existingStoreId }),
        DevRedemption.deleteMany({ store: existingStoreId }),
        DevOutlet.deleteMany({ store: existingStoreId }),
        DevOffer.deleteMany({ store: existingStoreId }),
        DevReservation.deleteMany({ store: existingStoreId }),
        DevReservationSetting.deleteMany({ store: existingStoreId }),
        DevWheelSegment.deleteMany({ store: existingStoreId }),
        DevNotification.deleteMany({ store: existingStoreId }),
        DevMailSMS.deleteMany({ store: existingStoreId }),
        DevStore.deleteOne({ _id: existingStoreId }),
      ]);
      console.log("✅ Cleared existing store data in development\n");
    }

    // ============================================
    // STEP 3: Copy Users (store owners)
    // ============================================
    console.log("👤 Copying users...");
    const userIds = prodStore.user || [];
    let copiedUsers = [];

    for (const userId of userIds) {
      const prodUser = await ProdUser.findById(userId).lean();
      if (prodUser) {
        // Check if user already exists in dev
        let devUser = await DevUser.findOne({ email: prodUser.email });
        if (!devUser) {
          delete prodUser._id;
          devUser = await DevUser.create(prodUser);
        }
        copiedUsers.push(devUser._id);
      }
    }
    console.log(`✅ Copied ${copiedUsers.length} users\n`);

    // ============================================
    // STEP 4: Copy Store
    // ============================================
    console.log("🏪 Copying store...");
    const storeData = { ...prodStore };
    delete storeData._id;
    storeData.user = copiedUsers;
    storeData.outlets = []; // Will update after copying outlets

    const newStore = await DevStore.create(storeData);
    const newStoreId = newStore._id;
    console.log(`✅ Copied store: ${newStore.name} (New ID: ${newStoreId})\n`);

    // ============================================
    // STEP 5: Copy Outlets
    // ============================================
    console.log("📍 Copying outlets...");
    const prodOutlets = await ProdOutlet.find({ store: storeId }).lean();
    const outletIdMap = new Map();

    for (const outlet of prodOutlets) {
      const oldId = outlet._id;
      delete outlet._id;
      outlet.store = newStoreId;
      const newOutlet = await DevOutlet.create(outlet);
      outletIdMap.set(oldId.toString(), newOutlet._id);
    }

    // Update store with outlet references
    await DevStore.findByIdAndUpdate(newStoreId, {
      outlets: Array.from(outletIdMap.values()),
    });
    console.log(`✅ Copied ${prodOutlets.length} outlets\n`);

    // ============================================
    // STEP 6: Copy Customers
    // ============================================
    console.log("👥 Copying customers...");
    const prodCustomers = await ProdCustomer.find({ store: storeId }).lean();
    const customerIdMap = new Map();

    for (const customer of prodCustomers) {
      const oldId = customer._id;
      delete customer._id;
      customer.store = newStoreId;
      const newCustomer = await DevCustomer.create(customer);
      customerIdMap.set(oldId.toString(), newCustomer._id);
    }
    console.log(`✅ Copied ${prodCustomers.length} customers\n`);

    // ============================================
    // STEP 7: Copy Categories
    // ============================================
    console.log("📂 Copying categories...");
    const prodCategories = await ProdCategory.find({ store: storeId }).lean();

    for (const category of prodCategories) {
      delete category._id;
      category.store = newStoreId;
      await DevCategory.create(category);
    }
    console.log(`✅ Copied ${prodCategories.length} categories\n`);

    // ============================================
    // STEP 8: Copy Products
    // ============================================
    console.log("📦 Copying products...");
    const prodProducts = await ProdProduct.find({ storeId: storeId }).lean();
    const productIdMap = new Map();
    let skippedProducts = 0;

    for (const product of prodProducts) {
      const oldId = product._id;
      delete product._id;
      product.storeId = newStoreId;

      // Handle missing/empty required fields
      if (!product.category || product.category === "") {
        product.category = "Uncategorized";
      }
      if (!product.description || product.description === "") {
        product.description = "No description";
      }
      if (!product.calculatedPrice) {
        product.calculatedPrice = product.price || 0;
      }

      try {
        const newProduct = await DevProduct.create(product);
        productIdMap.set(oldId.toString(), newProduct._id);
      } catch (err) {
        console.log(`   ⚠️  Skipped product "${product.name}": ${err.message}`);
        skippedProducts++;
      }
    }
    console.log(`✅ Copied ${prodProducts.length - skippedProducts} products${skippedProducts > 0 ? ` (${skippedProducts} skipped)` : ""}\n`);

    // ============================================
    // STEP 9: Copy Rewards
    // ============================================
    console.log("🎁 Copying rewards...");
    const prodRewards = await ProdReward.find({ store: storeId }).lean();
    const rewardIdMap = new Map();

    for (const reward of prodRewards) {
      const oldId = reward._id;
      delete reward._id;
      reward.store = newStoreId;
      const newReward = await DevReward.create(reward);
      rewardIdMap.set(oldId.toString(), newReward._id);
    }
    console.log(`✅ Copied ${prodRewards.length} rewards\n`);

    // ============================================
    // STEP 10: Copy Points Config
    // ============================================
    console.log("⭐ Copying points configuration...");
    const prodPoints = await ProdPoints.findOne({ store: storeId }).lean();

    if (prodPoints) {
      delete prodPoints._id;
      prodPoints.store = newStoreId;
      await DevPoints.create(prodPoints);
      console.log("✅ Copied points configuration\n");
    } else {
      console.log("⚠️  No points configuration found\n");
    }

    // ============================================
    // STEP 11: Copy Points History
    // ============================================
    console.log("📊 Copying points history...");
    const prodPointsHistory = await ProdPointsHistory.find({ store: storeId }).lean();

    for (const history of prodPointsHistory) {
      delete history._id;
      history.store = newStoreId;
      if (history.customer && customerIdMap.has(history.customer.toString())) {
        history.customer = customerIdMap.get(history.customer.toString());
      }
      await DevPointsHistory.create(history);
    }
    console.log(`✅ Copied ${prodPointsHistory.length} points history records\n`);

    // ============================================
    // STEP 12: Copy Redemptions
    // ============================================
    console.log("🎟️ Copying redemptions...");
    const prodRedemptions = await ProdRedemption.find({ store: storeId }).lean();
    let skippedRedemptions = 0;

    for (const redemption of prodRedemptions) {
      delete redemption._id;
      redemption.store = newStoreId;
      if (redemption.customer && customerIdMap.has(redemption.customer.toString())) {
        redemption.customer = customerIdMap.get(redemption.customer.toString());
      }
      if (redemption.reward && rewardIdMap.has(redemption.reward.toString())) {
        redemption.reward = rewardIdMap.get(redemption.reward.toString());
      }

      // Ensure expiryDate is set to avoid pre-save hook trying to look up reward
      if (!redemption.expiryDate) {
        redemption.expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days
      }

      try {
        // Use insertOne to bypass mongoose middleware/hooks
        await devConnection.collection("redemptions").insertOne(redemption);
      } catch (err) {
        console.log(`   ⚠️  Skipped redemption: ${err.message}`);
        skippedRedemptions++;
      }
    }
    console.log(`✅ Copied ${prodRedemptions.length - skippedRedemptions} redemptions${skippedRedemptions > 0 ? ` (${skippedRedemptions} skipped)` : ""}\n`);

    // ============================================
    // STEP 13: Copy Orders
    // ============================================
    console.log("🛒 Copying orders...");
    const prodOrders = await ProdOrder.find({ storeId: storeId }).lean();

    for (const order of prodOrders) {
      delete order._id;
      order.storeId = newStoreId;
      // Update product references in order
      if (order.products) {
        order.products = order.products.map((p) => ({
          ...p,
          productId: productIdMap.has(p.productId?.toString())
            ? productIdMap.get(p.productId.toString())
            : p.productId,
        }));
      }
      await DevOrder.create(order);
    }
    console.log(`✅ Copied ${prodOrders.length} orders\n`);

    // ============================================
    // STEP 14: Copy Offers
    // ============================================
    console.log("🏷️ Copying offers...");
    const prodOffers = await ProdOffer.find({ store: storeId }).lean();

    for (const offer of prodOffers) {
      delete offer._id;
      offer.store = newStoreId;
      await DevOffer.create(offer);
    }
    console.log(`✅ Copied ${prodOffers.length} offers\n`);

    // ============================================
    // STEP 15: Copy Reservation Settings
    // ============================================
    console.log("⚙️ Copying reservation settings...");
    const prodReservationSettings = await ProdReservationSetting.find({ store: storeId }).lean();

    for (const setting of prodReservationSettings) {
      delete setting._id;
      setting.store = newStoreId;
      await DevReservationSetting.create(setting);
    }
    console.log(`✅ Copied ${prodReservationSettings.length} reservation settings\n`);

    // ============================================
    // STEP 16: Copy Reservations
    // ============================================
    console.log("📅 Copying reservations...");
    const prodReservations = await ProdReservation.find({ store: storeId }).lean();
    let skippedReservations = 0;

    for (const reservation of prodReservations) {
      delete reservation._id;
      reservation.store = newStoreId;
      if (reservation.customer && customerIdMap.has(reservation.customer.toString())) {
        reservation.customer = customerIdMap.get(reservation.customer.toString());
      }

      // Handle missing required fields
      if (!reservation.time) {
        reservation.time = "12:00 PM";
      }
      if (!reservation.date) {
        reservation.date = new Date();
      }

      try {
        await DevReservation.create(reservation);
      } catch (err) {
        console.log(`   ⚠️  Skipped reservation: ${err.message}`);
        skippedReservations++;
      }
    }
    console.log(`✅ Copied ${prodReservations.length - skippedReservations} reservations${skippedReservations > 0 ? ` (${skippedReservations} skipped)` : ""}\n`);

    // ============================================
    // STEP 17: Copy Wheel Segments
    // ============================================
    console.log("🎡 Copying wheel segments...");
    const prodWheelSegments = await ProdWheelSegment.find({ store: storeId }).lean();

    for (const segment of prodWheelSegments) {
      delete segment._id;
      segment.store = newStoreId;
      if (segment.reward && rewardIdMap.has(segment.reward.toString())) {
        segment.reward = rewardIdMap.get(segment.reward.toString());
      }
      await DevWheelSegment.create(segment);
    }
    console.log(`✅ Copied ${prodWheelSegments.length} wheel segments\n`);

    // ============================================
    // STEP 18: Copy Notifications
    // ============================================
    console.log("🔔 Copying notifications...");
    const prodNotifications = await ProdNotification.find({ store: storeId }).lean();

    for (const notification of prodNotifications) {
      delete notification._id;
      notification.store = newStoreId;
      // Update customer references in receivers
      if (notification.receivers) {
        notification.receivers = notification.receivers.map((r) => ({
          ...r,
          customer: customerIdMap.has(r.customer?.toString())
            ? customerIdMap.get(r.customer.toString())
            : r.customer,
        }));
      }
      await DevNotification.create(notification);
    }
    console.log(`✅ Copied ${prodNotifications.length} notifications\n`);

    // ============================================
    // STEP 19: Copy Mail/SMS Settings
    // ============================================
    console.log("📧 Copying mail/SMS settings...");
    const prodMailSMS = await ProdMailSMS.findOne({ store: storeId }).lean();

    if (prodMailSMS) {
      delete prodMailSMS._id;
      prodMailSMS.store = newStoreId;
      await DevMailSMS.create(prodMailSMS);
      console.log("✅ Copied mail/SMS settings\n");
    } else {
      console.log("⚠️  No mail/SMS settings found\n");
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log("═".repeat(60));
    console.log("🎉 COPY COMPLETE!");
    console.log("═".repeat(60));
    console.log("\n📊 Summary:");
    console.log(`   • Store: ${prodStore.name}`);
    console.log(`   • Store URL: ${prodStore.url}`);
    console.log(`   • Users: ${copiedUsers.length}`);
    console.log(`   • Outlets: ${prodOutlets.length}`);
    console.log(`   • Customers: ${prodCustomers.length}`);
    console.log(`   • Categories: ${prodCategories.length}`);
    console.log(`   • Products: ${prodProducts.length}`);
    console.log(`   • Rewards: ${prodRewards.length}`);
    console.log(`   • Points History: ${prodPointsHistory.length}`);
    console.log(`   • Redemptions: ${prodRedemptions.length}`);
    console.log(`   • Orders: ${prodOrders.length}`);
    console.log(`   • Offers: ${prodOffers.length}`);
    console.log(`   • Reservations: ${prodReservations.length}`);
    console.log(`   • Wheel Segments: ${prodWheelSegments.length}`);
    console.log(`   • Notifications: ${prodNotifications.length}`);
    console.log("\n✅ Your production store data is now in your development database!");
    console.log("═".repeat(60));

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await prodConnection.close();
    await devConnection.close();
    console.log("\n✅ Database connections closed");
  }
}

// ============================================
// RUN
// ============================================
copyStoreFromProd()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Failed:", error);
    process.exit(1);
  });
