const cron = require("node-cron");
const mongoose = require("mongoose");
const storeModel = require("../models/storeModel");
const customerModel = require("../models/customerModel");
const CustomerOutletPoints = require("../models/customerOutletPointsModel");
const L5Redemption = require("../models/l5RedemptionModel");
const L5Voucher = require("../models/l5VoucherModel");
const L5MonthlyLeaderboard = require("../models/l5MonthlyLeaderboardModel");
const L5ThreeMonthWinner = require("../models/l5ThreeMonthWinnerModel");
const L5PointsTransaction = require("../models/l5PointsTransactionModel");

/**
 * L5 Cron Jobs
 * Handles automated tasks for L5 loyalty format
 */
// testww
/**
 * Update leaderboard rankings for current month
 * Runs every hour at minute 0
 */
// async function updateCurrentMonthLeaderboard() {
//   console.log("[L5 CRON] Starting leaderboard update...");

//   try {
//     // Get all stores with L5 format
//     const l5Stores = await storeModel.find({
//       "loyaltyCard.format": "L5",
//       status: "active",
//     });

//     for (const store of l5Stores) {
//       await updateStoreLeaderboard(store);
//     }

//     console.log(`[L5 CRON] Leaderboard updated for ${l5Stores.length} stores`);
//   } catch (error) {
//     console.error("[L5 CRON] Leaderboard update error:", error);
//   }
// }

/**
 * Update leaderboard for a specific store
 */
// async function updateStoreLeaderboard(store) {
//   const { year, month, periodStart, periodEnd } =
//     L5MonthlyLeaderboard.getCurrentMonthPeriod();

//   const l5Config = store.loyaltyCard?.l5Config || {};
//   const minPoints = l5Config.leaderboardMinPoints || 3000;
//   const coffeeHeroMinPoints = l5Config.coffeeHeroMinPoints || 5000;

//   // Aggregate points earned during current month
//   // Include "adjustment" transactions (which have negative points for reductions)
//   // This ensures manual corrections are reflected in leaderboard
//   const earnedPoints = await L5PointsTransaction.aggregate([
//     {
//       $match: {
//         store: store._id,
//         transactionType: { $in: ["earn", "bonus", "adjustment"] },
//         createdAt: { $gte: periodStart, $lte: periodEnd },
//       },
//     },
//     {
//       $group: {
//         _id: "$customer",
//         totalPointsEarned: { $sum: "$points" },
//       },
//     },
//     {
//       // Filter out customers with 0 or negative total (fully adjusted out)
//       $match: {
//         totalPointsEarned: { $gt: 0 },
//       },
//     },
//     {
//       $sort: { totalPointsEarned: -1 },
//     },
//   ]);

//   // Aggregate points redeemed during current month (for Coffee Hero)
//   const redeemedPoints = await L5PointsTransaction.aggregate([
//     {
//       $match: {
//         store: store._id,
//         transactionType: "redeem",
//         createdAt: { $gte: periodStart, $lte: periodEnd },
//       },
//     },
//     {
//       $group: {
//         _id: "$customer",
//         totalPointsRedeemed: { $sum: { $abs: "$points" } },
//       },
//     },
//     {
//       $sort: { totalPointsRedeemed: -1 },
//     },
//   ]);

//   // Create a map of redeemed points
//   const redeemedMap = new Map();
//   redeemedPoints.forEach((r) => {
//     redeemedMap.set(r._id.toString(), r.totalPointsRedeemed);
//   });

//   // Find Coffee Hero (top redeemer with 5000+ points)
//   const coffeeHero = redeemedPoints.find(
//     (r) => r.totalPointsRedeemed >= coffeeHeroMinPoints
//   );

//   // Update leaderboard entries
//   for (let i = 0; i < earnedPoints.length; i++) {
//     const { _id: customerId, totalPointsEarned } = earnedPoints[i];
//     const totalPointsRedeemed = redeemedMap.get(customerId.toString()) || 0;
//     const rank = i + 1;
//     const isQualified = totalPointsEarned >= minPoints;
//     const isMonthlyWinner = isQualified && rank <= 10;
//     const isCoffeeHero =
//       coffeeHero && coffeeHero._id.toString() === customerId.toString();

//     await L5MonthlyLeaderboard.findOneAndUpdate(
//       {
//         store: store._id,
//         customer: customerId,
//         year,
//         month,
//       },
//       {
//         totalPointsEarned,
//         totalPointsRedeemed,
//         rank,
//         isQualified,
//         isMonthlyWinner,
//         isCoffeeHero,
//         periodStart,
//         periodEnd,
//       },
//       { upsert: true }
//     );

//     // Update customer's cached leaderboard data
//     await customerModel.findByIdAndUpdate(customerId, {
//       "l5Data.currentRank": rank,
//       "l5Data.currentMonthPoints": totalPointsEarned,
//       "l5Data.currentMonthRedeemed": totalPointsRedeemed,
//       "l5Data.currentMonthQualified": isQualified,
//       "l5Data.isCoffeeHeroThisMonth": isCoffeeHero,
//       "l5Data.lastLeaderboardUpdate": new Date(),
//     });
//   }
// }

/**
 * Detect 3-month consecutive winners
 * Runs daily at 1 AM
 */
// async function detect3MonthWinners() {
//   console.log("[L5 CRON] Starting 3-month winner detection...");

//   try {
//     const l5Stores = await storeModel.find({
//       "loyaltyCard.format": "L5",
//       status: "active",
//     });

//     for (const store of l5Stores) {
//       await detectStore3MonthWinners(store);
//     }

//     console.log(
//       `[L5 CRON] 3-month winner detection completed for ${l5Stores.length} stores`
//     );
//   } catch (error) {
//     console.error("[L5 CRON] 3-month winner detection error:", error);
//   }
// }

/**
 * Detect 3-month winners for a specific store
 */
// async function detectStore3MonthWinners(store) {
//   const l5Config = store.loyaltyCard?.l5Config || {};
//   const minPoints = l5Config.leaderboardMinPoints || 3000;

//   // Get last 3 completed months
//   const last3Months = L5MonthlyLeaderboard.getPreviousMonths(3);

//   // Find customers who were #1 in all 3 months
//   const winnersPerMonth = await Promise.all(
//     last3Months.map(async ({ year, month }) => {
//       const winner = await L5MonthlyLeaderboard.findOne({
//         store: store._id,
//         year,
//         month,
//         rank: 1,
//         isQualified: true,
//       });
//       return { year, month, winner };
//     })
//   );

//   // Check if same customer won all 3 months
//   const allMonthsHaveWinner = winnersPerMonth.every((m) => m.winner);
//   if (!allMonthsHaveWinner) return;

//   const firstWinnerId = winnersPerMonth[0].winner.customer.toString();
//   const allSameCustomer = winnersPerMonth.every(
//     (m) => m.winner.customer.toString() === firstWinnerId
//   );

//   if (!allSameCustomer) return;

//   // Check if already awarded for this period
//   const existingAward = await L5ThreeMonthWinner.findOne({
//     store: store._id,
//     customer: firstWinnerId,
//     "winningMonths.0.year": last3Months[2].year,
//     "winningMonths.0.month": last3Months[2].month,
//   });

//   if (existingAward) return;

//   // Create 3-month winner record
//   const winningMonths = winnersPerMonth.map((m) => ({
//     month: m.month,
//     year: m.year,
//     totalPoints: m.winner.totalPointsEarned,
//   }));

//   const periodStart = new Date(last3Months[2].year, last3Months[2].month - 1, 1);
//   const periodEnd = new Date(last3Months[0].year, last3Months[0].month, 0);

//   await L5ThreeMonthWinner.create({
//     store: store._id,
//     customer: firstWinnerId,
//     winningMonths,
//     periodStart,
//     periodEnd,
//     discountPercentage: l5Config.threeMonthWinnerDiscount || 50,
//     discountCategory: l5Config.threeMonthWinnerCategory || "coffee",
//     awardStatus: "pending",
//   });

//   // Mark leaderboard entries
//   await L5MonthlyLeaderboard.updateMany(
//     {
//       store: store._id,
//       customer: firstWinnerId,
//       $or: last3Months.map((m) => ({ year: m.year, month: m.month })),
//     },
//     { isThreeMonthWinner: true }
//   );

//   console.log(
//     `[L5 CRON] New 3-month winner detected for store ${store.name}: Customer ${firstWinnerId}`
//   );
// }

/**
 * Mark expired redemptions and vouchers
 * Runs daily at 2 AM
 */
async function markExpiredItems() {
  console.log("[L5 CRON] Starting expiry check...");

  try {
    const now = new Date();

    // Expire L5Redemptions
    const expiredRedemptions = await L5Redemption.updateMany(
      { status: "active", expiryDate: { $lt: now } },
      { status: "expired" }
    );

    // Expire L5Vouchers
    const expiredVouchers = await L5Voucher.updateMany(
      { status: "unused", expiryDate: { $lt: now } },
      { status: "expired" }
    );

    // Expire 3-month winner awards
    const expiredAwards = await L5ThreeMonthWinner.updateMany(
      {
        awardStatus: { $in: ["awarded", "active"] },
        discountValidUntil: { $lt: now },
      },
      { awardStatus: "expired" }
    );

    console.log(
      `[L5 CRON] Expiry check completed - Redemptions: ${expiredRedemptions.modifiedCount}, Vouchers: ${expiredVouchers.modifiedCount}, Awards: ${expiredAwards.modifiedCount}`
    );
  } catch (error) {
    console.error("[L5 CRON] Expiry check error:", error);
  }
}

/**
 * Update customer L5 aggregate data
 * Runs every 6 hours
 */
async function updateCustomerAggregates() {
  console.log("[L5 CRON] Starting customer aggregate update...");

  try {
    const l5Stores = await storeModel.find({
      "loyaltyCard.format": "L5",
      status: "active",
    });

    let totalUpdated = 0;

    for (const store of l5Stores) {
      // Get all customers with outlet points in this store
      const customerIds = await CustomerOutletPoints.distinct("customer", {
        store: store._id,
      });

      for (const customerId of customerIds) {
        await updateCustomerL5Data(customerId, store._id);
        totalUpdated++;
      }
    }

    console.log(`[L5 CRON] Customer aggregate update completed: ${totalUpdated} customers`);
  } catch (error) {
    console.error("[L5 CRON] Customer aggregate update error:", error);
  }
}

/**
 * Helper: Update single customer's L5 data
 */
async function updateCustomerL5Data(customerId, storeId) {
  try {
    const outletPoints = await CustomerOutletPoints.find({
      customer: customerId,
      store: storeId,
    });

    const totalPoints = outletPoints.reduce((sum, op) => sum + op.currentPoints, 0);

    const activeRedemptions = await L5Redemption.find({
      customer: customerId,
      store: storeId,
      status: "active",
      rewardType: "discount",
      expiryDate: { $gt: new Date() },
    });

    const totalDiscount = activeRedemptions.reduce(
      (sum, r) => sum + (r.discountPercentage || 0),
      0
    );

    await customerModel.findByIdAndUpdate(customerId, {
      "l5Data.totalPointsAllOutlets": totalPoints,
      "l5Data.activeDiscountCount": activeRedemptions.length,
      "l5Data.totalActiveDiscount": totalDiscount,
    });
  } catch (error) {
    console.error(`[L5 CRON] Error updating customer ${customerId}:`, error);
  }
}

/**
 * Initialize L5 cron jobs
 */
function initL5CronJobs() {
  console.log("[L5 CRON] Initializing L5 cron jobs...");

  // COMMENTED OUT: Leaderboard is now calculated in real-time, not via cron
  // Update leaderboard every hour at minute 0
  // cron.schedule("0 * * * *", updateCurrentMonthLeaderboard);

  // COMMENTED OUT: 3-month winner detection disabled for now
  // Detect 3-month winners daily at 1 AM
  // cron.schedule("0 1 * * *", detect3MonthWinners);

  // Mark expired items daily at 2 AM
  cron.schedule("0 2 * * *", markExpiredItems);

  // Update customer aggregates every 6 hours
  cron.schedule("0 */6 * * *", updateCustomerAggregates);

  console.log("[L5 CRON] L5 cron jobs initialized");
}

module.exports = {
  initL5CronJobs,
  // COMMENTED OUT: These functions are no longer used by cron
  // updateCurrentMonthLeaderboard,
  // detect3MonthWinners,
  markExpiredItems,
  updateCustomerAggregates,
};
