const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { getDatabaseConfig } = require("../config/database");
const Store = require("../models/storeModel");
const Customer = require("../models/customerModel");
const CustomerOutletPoints = require("../models/customerOutletPointsModel");
const L5PointsTransaction = require("../models/l5PointsTransactionModel");
const Outlet = require("../models/outletModel");
const MailSMS = require("../models/mailSMSModel");
const notificationController = require("../controllers/notificationController");
const notificationModel = require("../models/notificationModel");

dotenv.config();

/**
 * Test script for points expiry cron job
 * Run this manually to test expiry logic without waiting for scheduled cron
 */
async function testPointsExpiry() {
  try {
    console.log("=".repeat(60));
    console.log("🧪 TESTING POINTS EXPIRY LOGIC");
    console.log("=".repeat(60));

    // Connect to MongoDB
    const dbConfig = getDatabaseConfig();
    console.log(`\n🔄 Connecting to ${dbConfig.name} Database...`);
    await mongoose.connect(dbConfig.uri);
    console.log(`✅ Connected to ${dbConfig.name} Database`);

    console.log("\n------------------------------------------------------");
    console.log("Checking for expiring points...");
    console.log("------------------------------------------------------");

    const stores = await Store.find({ hasExpiry: true });
    console.log(`\n📊 Found ${stores.length} store(s) with expiry enabled\n`);

    for (const store of stores) {
      console.log(`\n🏪 Processing Store: ${store.name}`);
      console.log(`   Format: ${store.loyaltyCard?.format || "N/A"}`);
      console.log(`   Expiry Days: ${store.expiryDays}`);

      // Fetch notification settings for this store
      const mailSMS = await MailSMS.findOne({ store: store._id });
      const notificationSettings = mailSMS?.notificationOnPointExpire || {
        title: "Points Expiring Soon! ⏰",
        body: "Hi [customer_name], your loyalty points will expire in [days_remaining] day(s). Use them before they're gone!",
        daysBeforeExpiry: [7, 3, 1],
      };
      const daysToNotify = notificationSettings.daysBeforeExpiry || [7, 3, 1];

      const customers = await Customer.find({
        store: store._id,
        pointChangeDate: { $exists: true, $ne: null },
      });

      console.log(`   Customers with points: ${customers.length}`);

      for (const customer of customers) {
        const lastUpdated = new Date(customer.pointChangeDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expirationDate = new Date(lastUpdated);
        expirationDate.setDate(lastUpdated.getDate() + store.expiryDays);
        expirationDate.setHours(0, 0, 0, 0);

        console.log(`\n   👤 Customer: ${customer.name}`);
        console.log(`      Last Updated: ${lastUpdated.toLocaleDateString()}`);
        console.log(`      Expiration Date: ${expirationDate.toLocaleDateString()}`);
        console.log(`      Current Points: ${customer.points}`);

        const diffInDays = Math.ceil(
          (expirationDate - today) / (1000 * 60 * 60 * 24)
        );

        console.log(`      Days Until Expiry: ${diffInDays}`);

        if (daysToNotify.includes(diffInDays)) {
          // Notify the user using configured notification template
          console.log(`      ⏰ NOTIFICATION: ${diffInDays} days remaining`);
          try {
            let title = (notificationSettings.title || "Points Expiring Soon!")
              .replace(/\[customer_name\]/g, customer.name || "Customer")
              .replace(/\[store_name\]/g, store.name || "Store")
              .replace(/\[days_remaining\]/g, diffInDays.toString());

            let body = (notificationSettings.body || `Hi ${customer.name}, your loyalty points will expire in ${diffInDays} day(s). Use them soon!`)
              .replace(/\[customer_name\]/g, customer.name || "Customer")
              .replace(/\[store_name\]/g, store.name || "Store")
              .replace(/\[days_remaining\]/g, diffInDays.toString());

            const notificationResponse = await notificationController.singleNotification({
              title,
              body,
              storeName: store.name,
              storeURL: store.url,
              userId: customer._id,
              customerName: customer.name,
              customerEmail: customer.email,
              customerPhone: customer.phone,
            });

            if (notificationResponse.success) {
              const receivers = [
                { customer: customer._id, read: false, readAt: null },
              ];
              const notification = new notificationModel({
                store: store._id,
                title: title || "Notification",
                message: body || "New notification received.",
                receivers,
              });
              await notification.save();
              console.log(`      ✅ Notification sent successfully`);
            } else {
              console.log(`      ❌ Failed to send notification`);
            }
          } catch (err) {
            console.error(`      ❌ Notification error:`, err.message);
          }
        } else if (diffInDays <= 0) {
          // 🗑️ Reset points - handle L5 format differently
          console.log(`      🗑️ EXPIRING POINTS (${Math.abs(diffInDays)} days overdue)`);

          // Check if store uses L5 format
          if (store.loyaltyCard?.format === "L5") {
            // L5: Reset both Customer.points AND CustomerOutletPoints
            console.log(`      📍 L5 Format - Checking outlet points...`);

            // First, get all outlet points before resetting (for transaction records)
            const expiredOutletPoints = await CustomerOutletPoints.find({
              customer: customer._id,
              store: store._id,
              currentPoints: { $gt: 0 },
            }).populate("outlet", "name location");

            console.log(`         Outlets with points: ${expiredOutletPoints.length}`);
            expiredOutletPoints.forEach(op => {
              console.log(`         - ${op.outlet?.name || op.outlet?.location || 'Unknown'}: ${op.currentPoints} points`);
            });

            // Reset Customer.points
            await Customer.findByIdAndUpdate(customer._id, {
              $set: {
                points: 0,
                pointChangeDate: null,
              },
            });

            // Reset all outlet-specific points for this customer
            await CustomerOutletPoints.updateMany(
              {
                customer: customer._id,
                store: store._id,
              },
              {
                $set: {
                  currentPoints: 0,
                  lastTransactionDate: new Date(),
                },
              }
            );

            // Create transaction records for audit trail
            for (const outletPoint of expiredOutletPoints) {
              try {
                await L5PointsTransaction.create({
                  store: store._id,
                  customer: customer._id,
                  outlet: outletPoint.outlet._id,
                  transactionType: "expiry",
                  points: -outletPoint.currentPoints,
                  balanceAfter: 0,
                  description: `Points expired after ${store.expiryDays} days of inactivity`,
                });
                console.log(`         ✅ Transaction record created for ${outletPoint.outlet?.name || outletPoint.outlet?.location}`);
              } catch (txnErr) {
                console.error(`         ❌ Failed to create transaction:`, txnErr.message);
              }
            }

            console.log(`      ✅ L5 points reset (Customer + ${expiredOutletPoints.length} outlet(s))`);
          } else {
            // L4 and other formats: Reset only Customer.points
            await Customer.findByIdAndUpdate(customer._id, {
              $set: {
                points: 0,
                pointChangeDate: null,
              },
            });
            console.log(`      ✅ Points reset (${store.loyaltyCard?.format || 'standard'} format)`);
          }
        } else {
          console.log(`      ✓ No action needed (${diffInDays} days remaining)`);
        }
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ EXPIRY TEST COMPLETED");
    console.log("=".repeat(60) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Run the test
testPointsExpiry();
