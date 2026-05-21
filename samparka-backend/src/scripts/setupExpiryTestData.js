const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { getDatabaseConfig } = require("../config/database");
const Store = require("../models/storeModel");
const Customer = require("../models/customerModel");
const CustomerOutletPoints = require("../models/customerOutletPointsModel");
const Outlet = require("../models/outletModel");

dotenv.config();

/**
 * Helper script to set up test data for points expiry testing
 * This will find customers and manually set their pointChangeDate to past dates
 */
async function setupTestData() {
  try {
    console.log("=".repeat(60));
    console.log("🔧 SETTING UP EXPIRY TEST DATA");
    console.log("=".repeat(60));

    const dbConfig = getDatabaseConfig();
    console.log(`\n🔄 Connecting to ${dbConfig.name} Database...`);
    await mongoose.connect(dbConfig.uri);
    console.log(`✅ Connected to ${dbConfig.name} Database\n`);

    // Get store ID from command line or use first store with expiry
    const storeId = process.argv[2];
    let store;

    if (storeId) {
      store = await Store.findById(storeId);
      if (!store) {
        console.log("❌ Store not found with ID:", storeId);
        process.exit(1);
      }
    } else {
      store = await Store.findOne({ hasExpiry: true });
      if (!store) {
        console.log("❌ No store found with hasExpiry: true");
        console.log("💡 Enable expiry on a store first or provide a store ID");
        process.exit(1);
      }
    }

    console.log(`📍 Store: ${store.name}`);
    console.log(`   Format: ${store.loyaltyCard?.format || "N/A"}`);
    console.log(`   Expiry Enabled: ${store.hasExpiry}`);
    console.log(`   Expiry Days: ${store.expiryDays}\n`);

    // Get customer phone from command line
    const customerPhone = process.argv[3];
    let customer;

    if (customerPhone) {
      customer = await Customer.findOne({ store: store._id, phone: customerPhone });
      if (!customer) {
        console.log(`❌ Customer not found with phone: ${customerPhone}`);
        process.exit(1);
      }
    } else {
      // Find first customer with points
      customer = await Customer.findOne({
        store: store._id,
        points: { $gt: 0 }
      });
      if (!customer) {
        console.log("❌ No customer found with points");
        console.log("💡 Provide a customer phone number as the third argument");
        process.exit(1);
      }
    }

    console.log(`👤 Customer: ${customer.name}`);
    console.log(`   Phone: ${customer.phone}`);
    console.log(`   Current Points: ${customer.points}`);
    console.log(`   Current pointChangeDate: ${customer.pointChangeDate || "Not set"}\n`);

    // Ask what to do
    console.log("📅 Choose a test scenario:");
    console.log("   1. Set points to expire TOMORROW (1 day remaining - triggers notification)");
    console.log("   2. Set points to expire in 3 DAYS (triggers notification)");
    console.log("   3. Set points to expire in 7 DAYS (triggers notification)");
    console.log("   4. Set points ALREADY EXPIRED (will reset points immediately)");
    console.log("   5. Set custom days ago (manual input)\n");

    const scenario = process.argv[4] || "4"; // Default to already expired

    let daysAgo;
    const expiryDays = store.expiryDays || 30;

    switch(scenario) {
      case "1":
        daysAgo = expiryDays - 1; // 1 day remaining
        break;
      case "2":
        daysAgo = expiryDays - 3; // 3 days remaining
        break;
      case "3":
        daysAgo = expiryDays - 7; // 7 days remaining
        break;
      case "4":
        daysAgo = expiryDays + 1; // Already expired
        break;
      case "5":
        daysAgo = parseInt(process.argv[5]) || expiryDays + 1;
        break;
      default:
        daysAgo = expiryDays + 1;
    }

    const newPointChangeDate = new Date();
    newPointChangeDate.setDate(newPointChangeDate.getDate() - daysAgo);

    console.log(`⏰ Setting pointChangeDate to ${daysAgo} days ago: ${newPointChangeDate.toLocaleString()}`);

    const daysUntilExpiry = expiryDays - daysAgo;
    if (daysUntilExpiry > 0) {
      console.log(`   → Points will expire in ${daysUntilExpiry} day(s)`);
    } else {
      console.log(`   → Points are ALREADY EXPIRED by ${Math.abs(daysUntilExpiry)} day(s)`);
    }

    // Update customer
    await Customer.findByIdAndUpdate(customer._id, {
      pointChangeDate: newPointChangeDate
    });

    // If L5 format, also update outlet points lastTransactionDate
    if (store.loyaltyCard?.format === "L5") {
      const outletPoints = await CustomerOutletPoints.find({
        customer: customer._id,
        store: store._id,
      }).populate("outlet", "name location");

      console.log(`\n📍 L5 Format - Updating ${outletPoints.length} outlet(s):`);

      for (const op of outletPoints) {
        await CustomerOutletPoints.findByIdAndUpdate(op._id, {
          lastTransactionDate: newPointChangeDate
        });
        console.log(`   ✅ ${op.outlet?.name || op.outlet?.location || 'Unknown'}: ${op.currentPoints} points`);
      }
    }

    console.log("\n✅ Test data setup complete!");
    console.log("\n💡 Next steps:");
    console.log("   1. Run: npm run test:expiry");
    console.log("   2. Check the output to verify expiry logic\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
}

// Usage instructions
if (process.argv.includes("--help")) {
  console.log(`
Usage: node src/scripts/setupExpiryTestData.js [storeId] [customerPhone] [scenario] [customDays]

Arguments:
  storeId        (optional) MongoDB ObjectId of store. Uses first store with hasExpiry=true if not provided
  customerPhone  (optional) Customer phone number. Uses first customer with points if not provided
  scenario       (optional) Test scenario: 1-5 (default: 4 - already expired)
  customDays     (optional) For scenario 5, specify custom days ago

Examples:
  # Use defaults (first store with expiry, first customer with points, already expired)
  node src/scripts/setupExpiryTestData.js

  # Specific store and customer
  node src/scripts/setupExpiryTestData.js 507f1f77bcf86cd799439011 9841234567

  # Set to expire in 1 day (scenario 1)
  node src/scripts/setupExpiryTestData.js 507f1f77bcf86cd799439011 9841234567 1

  # Custom: set to 50 days ago (scenario 5)
  node src/scripts/setupExpiryTestData.js 507f1f77bcf86cd799439011 9841234567 5 50
  `);
  process.exit(0);
}

setupTestData();
