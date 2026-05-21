// Script to check CustomerAnalytics vs PointsHistory discrepancy
const mongoose = require("mongoose");
const CustomerAnalytics = require("../models/customerAnalyticsModel");
const PointsHistory = require("../models/pointsHistoryModel");
const Customer = require("../models/customerModel");

async function checkDiscrepancy() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/your-db-name");
    console.log("Connected to database");

    // Get customer ID from command line args or use a default
    const customerId = process.argv[2];
    
    if (!customerId) {
      console.log("Usage: node checkCustomerAnalytics.js <customerId>");
      process.exit(1);
    }

    console.log(`\n=== Checking Customer: ${customerId} ===\n`);

    // Fetch CustomerAnalytics
    const analytics = await CustomerAnalytics.findOne({ customer: customerId });
    console.log("CustomerAnalytics:");
    console.log({
      visitCount: analytics?.visitCount,
      segment: analytics?.segment,
      firstVisit: analytics?.firstVisit,
      lastVisit: analytics?.lastVisit,
      totalPointsEarned: analytics?.totalPointsEarned,
    });

    // Fetch PointsHistory count and records
    const pointsHistory = await PointsHistory.find({ customer: customerId })
      .sort({ createdAt: -1 })
      .select("points createdAt billID outlet");
    
    console.log(`\nPointsHistory (${pointsHistory.length} records):`);
    pointsHistory.forEach((record, idx) => {
      console.log(`  ${idx + 1}. ${record.createdAt.toISOString()} - ${record.points} pts (Bill: ${record.billID || "N/A"})`);
    });

    // Count positive points (should match visitCount)
    const positivePointsCount = pointsHistory.filter(p => p.points > 0).length;
    console.log(`\n=== ANALYSIS ===`);
    console.log(`Total PointsHistory records: ${pointsHistory.length}`);
    console.log(`Positive points transactions: ${positivePointsCount}`);
    console.log(`CustomerAnalytics visitCount: ${analytics?.visitCount || 0}`);
    console.log(`\nDiscrepancy: ${positivePointsCount !== analytics?.visitCount ? "YES ❌" : "NO ✅"}`);
    
    if (positivePointsCount !== analytics?.visitCount) {
      console.log(`Expected: ${positivePointsCount}, Got: ${analytics?.visitCount || 0}`);
      console.log(`Difference: ${positivePointsCount - (analytics?.visitCount || 0)} visits missing`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkDiscrepancy();
