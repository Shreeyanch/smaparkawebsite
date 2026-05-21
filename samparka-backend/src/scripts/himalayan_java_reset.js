/**
 * DATA CLEANUP SCRIPT FOR HIMALAYAN JAVA EXPRESS
 * 
 * This script removes transaction/activity data while preserving:
 * - Store configuration
 * - Customer accounts
 * - Rewards definitions
 * - Products & Categories
 * - Outlet definitions
 * - Outlet points records (reset to 0) ✅
 * - Loyalty card layouts
 * 
 * RESETS:
 * - Customer points (reset to 1 point each)
 * - Outlet points (reset to 0) ✅
 * 
 * DELETES ONLY:
 * - Points history transactions
 * - Customer analytics data
 * - Redemptions
 * - Orders
 * 
 * ✅ QR codes and outlet display will continue to work after cleanup!
 * ✅ No need to run init-himalayan-outlet-points.js script!
 * 
 * Usage:
 *   node src/scripts/himalayan_java_reset.js <storeId>
 * 
 * Example:
 *   node src/scripts/himalayan_java_reset.js 69070b7a4e79b999bd743369
 */

require('dotenv/config');
const mongoose = require('mongoose');

// Import only models we need to clean
const customerModel = require('../models/customerModel');
const pointsHistoryModel = require('../models/pointsHistoryModel');
const redemptionModel = require('../models/redemptionModel');
const orderModel = require('../models/orderModel');
const customerAnalyticsModel = require('../models/analytics_model/customerAnalyticsModel');
const outletPointsModel = require('../models/outletPointsModel');
const storeModel = require('../models/storeModel');

// L5-specific models
const customerOutletPointsModel = require('../models/customerOutletPointsModel');
const l5MonthlyLeaderboardModel = require('../models/l5MonthlyLeaderboardModel');
const l5PointsTransactionModel = require('../models/l5PointsTransactionModel');
const l5ThreeMonthWinnerModel = require('../models/l5ThreeMonthWinnerModel');
const l5RedemptionModel = require('../models/l5RedemptionModel');

// Get store ID from command line or use default
const STORE_ID = process.argv[2] || '69070b7a4e79b999bd743369';

// Determine if we're in dry-run mode (default: true for safety)
const DRY_RUN = process.argv.includes('--execute') ? false : true;

async function cleanupStoreData() {
  try {
    console.log('═'.repeat(70));
    console.log('STORE DATA CLEANUP SCRIPT');
    console.log('═'.repeat(70));
    console.log(`Store ID: ${STORE_ID}`);
    console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN (no data will be deleted)' : '⚠️  EXECUTE MODE (data will be deleted)'}\n`);

    // Connect to database
    const dbUri = process.env.MONGODBCONNECTIONSTRING;
    //Change database in here: MONGODB_DEV_URI for dev, MONGODBCONNECTIONSTRING for prod

    await mongoose.connect(dbUri);
    console.log('✓ Connected to database\n');

    // Verify store exists
    const store = await storeModel.findById(STORE_ID);
    if (!store) {
      console.error(`❌ Store with ID "${STORE_ID}" not found!`);
      process.exit(1);
    }
    console.log(`✓ Found store: ${store.name}`);
    console.log(`  URL: ${store.url}\n`);

    // Count records before deletion
    console.log('📊 Counting records...\n');
    
    const storeIdObj = new mongoose.Types.ObjectId(STORE_ID);
    
    const counts = {
      customers: await customerModel.countDocuments({ store: storeIdObj }),
      pointsHistory: await pointsHistoryModel.countDocuments({ store: storeIdObj }),
      redemptions: await redemptionModel.countDocuments({ store: storeIdObj }),
      orders: await orderModel.countDocuments({ storeId: storeIdObj }),
      analytics: await customerAnalyticsModel.countDocuments({ store: storeIdObj }),
      outletPoints: await outletPointsModel.countDocuments({ store: storeIdObj }),
      // L5-specific counts
      customerOutletPoints: await customerOutletPointsModel.countDocuments({ store: storeIdObj }),
      l5MonthlyLeaderboard: await l5MonthlyLeaderboardModel.countDocuments({ store: storeIdObj }),
      l5PointsTransactions: await l5PointsTransactionModel.countDocuments({ store: storeIdObj }),
      l5ThreeMonthWinners: await l5ThreeMonthWinnerModel.countDocuments({ store: storeIdObj }),
      l5Redemptions: await l5RedemptionModel.countDocuments({ store: storeIdObj }),
    };

    // Calculate total points
    const customersWithPoints = await customerModel.find({ store: storeIdObj }, 'points totalPoints');
    const totalPointsSum = customersWithPoints.reduce((sum, c) => sum + (c.points || 0), 0);

    console.log('📋 Records to be cleaned:');
    console.log(`   Customers: ${counts.customers} (Total points: ${totalPointsSum.toFixed(1)})`);
    console.log(`   Points History: ${counts.pointsHistory}`);
    console.log(`   Redemptions: ${counts.redemptions}`);
    console.log(`   Orders: ${counts.orders}`);
    console.log(`   Customer Analytics: ${counts.analytics}`);
    console.log(`   Outlet Points: ${counts.outletPoints}`);
    console.log(`   \n   L5-Specific Data:`);
    console.log(`   Customer Outlet Points: ${counts.customerOutletPoints}`);
    console.log(`   L5 Monthly Leaderboard: ${counts.l5MonthlyLeaderboard}`);
    console.log(`   L5 Points Transactions: ${counts.l5PointsTransactions}`);
    console.log(`   L5 Three Month Winners: ${counts.l5ThreeMonthWinners}`);
    console.log(`   L5 Redemptions: ${counts.l5Redemptions}\n`);

    if (DRY_RUN) {
      console.log('═'.repeat(70));
      console.log('🔍 DRY RUN MODE - No data will be deleted');
      console.log('═'.repeat(70));
      console.log('\n⚠️  The following data WOULD BE RESET/DELETED:');
      console.log('   ✗ Customer points (reset to 1 point each)');
      console.log('   ✗ Points history transactions');
      console.log('   ✗ Customer analytics data');
      console.log('   ✗ Redemptions');
      console.log('   ✗ Orders');
      console.log('   ✗ Outlet points (reset to 0) ✅');
      console.log('   ✗ Customer Outlet Points (L5)');
      console.log('   ✗ L5 Monthly Leaderboard entries');
      console.log('   ✗ L5 Points Transactions');
      console.log('   ✗ L5 Three Month Winners');
      console.log('   ✗ L5 Redemptions\n');
      
      console.log('✓ The following WOULD BE PRESERVED:');
      console.log('   ✓ Store configuration');
      console.log('   ✓ Customer accounts');
      console.log('   ✓ Rewards definitions');
      console.log('   ✓ Products & Categories');
      console.log('   ✓ Outlets');
      console.log('   ✓ Outlet points records');
      console.log('   ✓ Loyalty card layout');
      console.log('   ✓ Campaigns, reservations, notifications\n');

      console.log('📝 To actually reset/delete the data, run:');
      console.log(`   node src/scripts/himalayan_java_reset.js ${STORE_ID} --execute\n`);
      
      return;
    }

    // EXECUTE MODE - Actually reset/delete data
    console.log('═'.repeat(70));
    console.log('⚠️  EXECUTE MODE - Data will be reset/deleted!');
    console.log('═'.repeat(70));
    console.log('\n🗑️  Starting cleanup process...\n');

    const results = {};

    // 1. Reset Customer Points to 1
    console.log('[1/10] Resetting customer points to 1...');
    results.customerPointsReset = await customerModel.updateMany(
      { store: storeIdObj },
      { 
        $set: { 
          points: 1,
          totalPoints: 1,
          pointChangeDate: new Date()
        } 
      }
    );
    console.log(`✓ Reset points to 1 for ${results.customerPointsReset.modifiedCount} customers\n`);

    // 2. Delete Customer Analytics
    console.log('[2/6] Deleting customer analytics...');
    results.analytics = await customerAnalyticsModel.deleteMany({ store: storeIdObj });
    console.log(`✓ Deleted ${results.analytics.deletedCount} analytics records\n`);

    // 3. Delete Points History
    console.log('[3/6] Deleting points history...');
    results.pointsHistory = await pointsHistoryModel.deleteMany({ store: storeIdObj });
    console.log(`✓ Deleted ${results.pointsHistory.deletedCount} points history records\n`);

    // 4. Delete Redemptions
    console.log('[4/6] Deleting redemptions...');
    results.redemptions = await redemptionModel.deleteMany({ store: storeIdObj });
    console.log(`✓ Deleted ${results.redemptions.deletedCount} redemption records\n`);

    // 5. Delete Orders
    console.log('[5/6] Deleting orders...');
    results.orders = await orderModel.deleteMany({ storeId: storeIdObj });
    console.log(`✓ Deleted ${results.orders.deletedCount} order records\n`);

    // 6. Reset Outlet Points to 0 (preserves records for QR codes)
    console.log('[6/11] Resetting outlet points to 0...');
    results.outletPoints = await outletPointsModel.updateMany(
      { store: storeIdObj },
      { $set: { points: 0 } }
    );
    console.log(`✓ Reset points for ${results.outletPoints.modifiedCount} outlet records\n`);

    // 7. Delete Customer Outlet Points (L5-specific)
    console.log('[7/11] Deleting customer outlet points (L5)...');
    results.customerOutletPoints = await customerOutletPointsModel.deleteMany({ store: storeIdObj });
    console.log(`✓ Deleted ${results.customerOutletPoints.deletedCount} customer outlet point records\n`);

    // 8. Delete L5 Monthly Leaderboard
    console.log('[8/11] Deleting L5 monthly leaderboard entries...');
    results.l5MonthlyLeaderboard = await l5MonthlyLeaderboardModel.deleteMany({ store: storeIdObj });
    console.log(`✓ Deleted ${results.l5MonthlyLeaderboard.deletedCount} leaderboard entries\n`);

    // 9. Delete L5 Points Transactions
    console.log('[9/11] Deleting L5 points transactions...');
    results.l5PointsTransactions = await l5PointsTransactionModel.deleteMany({ store: storeIdObj });
    console.log(`✓ Deleted ${results.l5PointsTransactions.deletedCount} L5 transaction records\n`);

    // 10. Delete L5 Three Month Winners
    console.log('[10/11] Deleting L5 three month winners...');
    results.l5ThreeMonthWinners = await l5ThreeMonthWinnerModel.deleteMany({ store: storeIdObj });
    console.log(`✓ Deleted ${results.l5ThreeMonthWinners.deletedCount} three month winner records\n`);

    // 11. Delete L5 Redemptions
    console.log('[11/11] Deleting L5 redemptions...');
    results.l5Redemptions = await l5RedemptionModel.deleteMany({ store: storeIdObj });
    console.log(`✓ Deleted ${results.l5Redemptions.deletedCount} L5 redemption records\n`);


    console.log('\n📊 Cleanup Summary:');
    console.log(`   Customer points reset: ${results.customerPointsReset.modifiedCount}`);
    console.log(`   Points history deleted: ${results.pointsHistory.deletedCount}`);
    console.log(`   Redemptions deleted: ${results.redemptions.deletedCount}`);
    console.log(`   Orders deleted: ${results.orders.deletedCount}`);
    console.log(`   Customer analytics deleted: ${results.analytics.deletedCount}`);
    console.log(`   Outlet points reset: ${results.outletPoints.modifiedCount}`);
    console.log(`   \n   L5-Specific Deletions:`);
    console.log(`   Customer Outlet Points: ${results.customerOutletPoints.deletedCount}`);
    console.log(`   L5 Monthly Leaderboard: ${results.l5MonthlyLeaderboard.deletedCount}`);
    console.log(`   L5 Points Transactions: ${results.l5PointsTransactions.deletedCount}`);
    console.log(`   L5 Three Month Winners: ${results.l5ThreeMonthWinners.deletedCount}`);
    console.log(`   L5 Redemptions: ${results.l5Redemptions.deletedCount}`);
    console.log('');

    console.log('✅ Preserved:');
    console.log('   ✓ Store configuration and settings');
    console.log('   ✓ Customer accounts');
    console.log('   ✓ Rewards, products, categories');
    console.log('   ✓ Outlet records and QR codes');
    console.log('   ✓ Lration and settings');
    console.log('   ✓ Customer accounts');
    console.log('   ✓ Rewards, products, categories');
    console.log('   ✓ Outlets and loyalty card layout\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed\n');
  }
}

// Run the script
cleanupStoreData()
  .then(() => {
    console.log('✅ Script completed successfully\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });