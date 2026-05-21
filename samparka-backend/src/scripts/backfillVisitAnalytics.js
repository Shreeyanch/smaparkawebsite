/**
 * Backfill Visit Analytics Script
 * Populates CustomerAnalytics collection from existing PointsHistory data
 *
 * Usage:
 *   node src/scripts/backfillVisitAnalytics.js
 *   node src/scripts/backfillVisitAnalytics.js --store=<storeId>
 *   node src/scripts/backfillVisitAnalytics.js --env=production
 *   node src/scripts/backfillVisitAnalytics.js --env=production --store=<storeId>
 */

require("dotenv/config");
const mongoose = require("mongoose");
const { getDatabaseConfig } = require("../config/database");

const PointsHistory = require("../models/pointsHistoryModel");
const CustomerAnalytics = require("../models/analytics_model/customerAnalyticsModel");
const Store = require("../models/storeModel");

const BATCH_SIZE = 100;

async function backfillStore(storeId) {
  console.log(`\n📊 Processing store: ${storeId}`);

  const customerTransactions = await PointsHistory.aggregate([
    { $match: { store: new mongoose.Types.ObjectId(storeId) } },
    { $sort: { createdAt: 1 } },
    {
      $group: {
        _id: "$customer",
        transactions: {
          $push: {
            date: "$createdAt",
            points: "$points",
            outlet: "$outlet",
          },
        },
        totalPoints: { $sum: "$points" },
        visitCount: { $sum: 1 },
        firstVisit: { $first: "$createdAt" },
        lastVisit: { $last: "$createdAt" },
      },
    },
  ]);

  console.log(`   Found ${customerTransactions.length} customers with transactions`);

  let processed = 0;
  let created = 0;
  let updated = 0;

  for (const ct of customerTransactions) {
    try {
      // Calculate visit gaps (last 10)
      const visitGaps = [];
      for (let i = 1; i < ct.transactions.length && visitGaps.length < 10; i++) {
        const gap = Math.floor(
          (new Date(ct.transactions[i].date) - new Date(ct.transactions[i - 1].date)) /
            (1000 * 60 * 60 * 24)
        );
        visitGaps.push({ gap, visitDate: ct.transactions[i].date });
      }

      // Calculate average days between visits
      let avgDaysBetweenVisits = null;
      if (visitGaps.length > 0) {
        avgDaysBetweenVisits =
          Math.round((visitGaps.reduce((sum, v) => sum + v.gap, 0) / visitGaps.length) * 10) / 10;
      }

      // Build outlet breakdown
      const outletMap = new Map();
      for (const tx of ct.transactions) {
        if (tx.outlet) {
          if (!outletMap.has(tx.outlet)) {
            outletMap.set(tx.outlet, {
              outlet: tx.outlet,
              visitCount: 0,
              firstVisit: tx.date,
              lastVisit: tx.date,
            });
          }
          const o = outletMap.get(tx.outlet);
          o.visitCount += 1;
          o.lastVisit = tx.date;
        }
      }

      // Build monthly visits (last 12 months)
      const monthlyVisits = new Map();
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      for (const tx of ct.transactions) {
        if (new Date(tx.date) >= twelveMonthsAgo) {
          const d = new Date(tx.date);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          monthlyVisits.set(key, (monthlyVisits.get(key) || 0) + 1);
        }
      }

      // Calculate segment
      let segment = "first_visit";
      if (ct.visitCount >= 2 && ct.visitCount <= 3) segment = "2-3_visits";
      else if (ct.visitCount >= 4 && ct.visitCount <= 10) segment = "4-10_visits";
      else if (ct.visitCount > 10) segment = "10+_visits";

      // Upsert analytics record
      const existingRecord = await CustomerAnalytics.findOne({
        customer: ct._id,
        store: storeId,
      });

      await CustomerAnalytics.findOneAndUpdate(
        { customer: ct._id, store: storeId },
        {
          $set: {
            visitCount: ct.visitCount,
            firstVisit: ct.firstVisit,
            lastVisit: ct.lastVisit,
            segment,
            visitsByOutlet: Array.from(outletMap.values()),
            avgDaysBetweenVisits,
            visitGaps,
            totalPointsEarned: ct.totalPoints,
            monthlyVisits,
          },
        },
        { upsert: true, new: true }
      );

      if (!existingRecord) created++;
      else updated++;
      processed++;

      if (processed % BATCH_SIZE === 0) {
        console.log(`   Processed ${processed}/${customerTransactions.length} customers...`);
      }
    } catch (error) {
      console.error(`   Error processing customer ${ct._id}:`, error.message);
    }
  }

  console.log(`   ✅ Store complete: ${created} created, ${updated} updated`);
  return { processed, created, updated };
}

async function runBackfill() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const envArg = args.find((a) => a.startsWith("--env="));
  
  // Override NODE_ENV if --env flag is provided
  if (envArg) {
    const envValue = envArg.split("=")[1];
    if (envValue === "production" || envValue === "development") {
      process.env.NODE_ENV = envValue;
      console.log(`⚙️  Environment overridden to: ${envValue}`);
    } else {
      console.error(`❌ Invalid environment: ${envValue}. Use 'production' or 'development'`);
      process.exit(1);
    }
  }

  const dbConfig = getDatabaseConfig();
  console.log(`🔄 Connecting to ${dbConfig.name} Database...`);
  console.log(`   Environment: ${dbConfig.env}`);
  await mongoose.connect(dbConfig.uri);
  console.log(`✅ Connected\n`);

  const storeArg = args.find((a) => a.startsWith("--store="));

  let stores;
  if (storeArg) {
    const storeId = storeArg.split("=")[1];
    stores = [{ _id: storeId }];
  } else {
    stores = await Store.find({ status: "active" }).select("_id name");
  }

  console.log(`📊 Backfilling ${stores.length} store(s)...`);

  let totalProcessed = 0;
  let totalCreated = 0;
  let totalUpdated = 0;

  for (const store of stores) {
    const result = await backfillStore(store._id);
    totalProcessed += result.processed;
    totalCreated += result.created;
    totalUpdated += result.updated;
  }

  console.log("\n" + "═".repeat(50));
  console.log("🎉 BACKFILL COMPLETE!");
  console.log("═".repeat(50));
  console.log(`\n📊 Summary:`);
  console.log(`   • Stores processed: ${stores.length}`);
  console.log(`   • Total customers: ${totalProcessed}`);
  console.log(`   • Records created: ${totalCreated}`);
  console.log(`   • Records updated: ${totalUpdated}`);

  await mongoose.connection.close();
  process.exit(0);
}

runBackfill().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});
