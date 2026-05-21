/**
 * Fix Duplicate Points for Specific Store
 * 
 * This script identifies and removes duplicate point entries caused by 
 * the QR race condition bug (QR-RACE-001) for a specific store.
 * 
 * Usage: 
 *   node src/scripts/fixDuplicatePointsForStore.js <STORE_ID>
 *   NODE_ENV=production node src/scripts/fixDuplicatePointsForStore.js <STORE_ID>
 * 
 * Example: 
 *   node src/scripts/fixDuplicatePointsForStore.js 507f1f77bcf86cd799439011
 *   NODE_ENV=production node src/scripts/fixDuplicatePointsForStore.js 6798b5994dfc04de9e55a3c1
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const storeModel = require('../models/storeModel');
const customerModel = require('../models/customerModel');
const pointsHistoryModel = require('../models/pointsHistoryModel');
const customerAnalyticsModel = require('../models/analytics_model/customerAnalyticsModel');

// Configuration
const CONFIG = {
  // Date range to check for duplicates (adjust as needed)
  START_DATE: new Date('2026-01-20T00:00:00Z'),
  END_DATE: new Date('2026-01-30T23:59:59Z'),
  
  // Time window to consider entries as duplicates (milliseconds)
  DUPLICATE_WINDOW: 5000, // 5 seconds
  
  // Dry run mode - if true, only shows what would be done without making changes
  DRY_RUN: false
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60));
}

async function findDuplicates(storeId) {
  log('\n🔍 Analyzing point history for duplicates...', 'cyan');
  
  const duplicates = await pointsHistoryModel.aggregate([
    {
      $match: {
        store: new mongoose.Types.ObjectId(storeId),
        createdAt: {
          $gte: CONFIG.START_DATE,
          $lte: CONFIG.END_DATE
        }
      }
    },
    {
      $group: {
        _id: {
          customer: '$customer',
          points: '$points',
          billID: '$billID',
          outlet: '$outlet'
        },
        count: { $sum: 1 },
        entries: { 
          $push: { 
            id: '$_id', 
            timestamp: '$createdAt',
            points: '$points'
          } 
        }
      }
    },
    {
      $match: { count: { $gt: 1 } }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  return duplicates;
}

async function getCustomerInfo(customerId) {
  const customer = await customerModel.findById(customerId);
  return customer ? {
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    currentPoints: customer.points,
    totalPoints: customer.totalPoints
  } : null;
}

async function processCleanup(storeId, storeName) {
  logSection('STEP 2: FINDING DUPLICATES');
  
  const duplicates = await findDuplicates(storeId);
  
  if (duplicates.length === 0) {
    log('✅ No duplicate entries found! This store is clean.', 'green');
    return {
      processed: 0,
      removed: 0,
      pointsDeducted: 0,
      customers: []
    };
  }

  log(`📊 Found ${duplicates.length} duplicate groups`, 'yellow');
  
  // Calculate totals
  let totalDuplicateEntries = 0;
  let totalPointsToDeduct = 0;
  
  duplicates.forEach(dup => {
    const duplicateCount = dup.count - 1; // Keep first, count rest as duplicates
    totalDuplicateEntries += duplicateCount;
    totalPointsToDeduct += dup._id.points * duplicateCount;
  });

  log(`   📍 Total duplicate entries: ${totalDuplicateEntries}`, 'yellow');
  log(`   💰 Total points to deduct: ${totalPointsToDeduct}`, 'yellow');

  if (CONFIG.DRY_RUN) {
    log('\n⚠️  DRY RUN MODE - No changes will be made\n', 'yellow');
  }

  logSection('STEP 3: PROCESSING DUPLICATES');

  const results = {
    processed: duplicates.length,
    removed: 0,
    pointsDeducted: 0,
    analyticsFixed: 0,
    customers: []
  };

  for (let i = 0; i < duplicates.length; i++) {
    const dup = duplicates[i];
    const { customer: customerId, points, outlet } = dup._id;
    
    // Get customer info
    const customerInfo = await getCustomerInfo(customerId);
    if (!customerInfo) {
      log(`❌ Customer ${customerId} not found, skipping...`, 'red');
      continue;
    }

    // Sort entries by timestamp (keep earliest)
    const entries = dup.entries.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    const toRemove = entries.slice(1); // Remove all except first
    const duplicateCount = toRemove.length;
    const pointsToDeduct = points * duplicateCount;

    log(`\n${'─'.repeat(60)}`, 'blue');
    log(`👤 Customer ${i + 1}/${duplicates.length}`, 'bright');
    log(`   Name: ${customerInfo.name}`, 'cyan');
    log(`   Email: ${customerInfo.email}`, 'cyan');
    log(`   Phone: ${customerInfo.phone}`, 'cyan');
    log(`   Current Points: ${customerInfo.currentPoints}`, 'yellow');
    log(`   Duplicate Entries: ${duplicateCount}`, 'red');
    log(`   Points to Deduct: ${pointsToDeduct}`, 'red');

    if (!CONFIG.DRY_RUN) {
      // Remove duplicate history entries
      let removedCount = 0;
      for (const entry of toRemove) {
        await pointsHistoryModel.findByIdAndDelete(entry.id);
        removedCount++;
      }
      log(`   ✅ Removed ${removedCount} duplicate entries`, 'green');

      // Update customer balance
      const updatedCustomer = await customerModel.findByIdAndUpdate(
        customerId,
        {
          $inc: { 
            points: -pointsToDeduct,
            totalPoints: -pointsToDeduct 
          }
        },
        { new: true }
      );

      const newPoints = updatedCustomer.points;
      log(`   💰 Adjusted Points: ${customerInfo.currentPoints} → ${newPoints}`, 'green');

      // Fix visit analytics
      const analytics = await customerAnalyticsModel.findOne({
        customer: customerId,
        store: storeId
      });

      if (analytics) {
        const oldVisitCount = analytics.visitCount;
        const newVisitCount = Math.max(0, oldVisitCount - duplicateCount);
        
        // Update overall visit count
        analytics.visitCount = newVisitCount;
        
        // Update outlet-specific visit count if outlet exists
        if (outlet) {
          const outletIndex = analytics.visitsByOutlet.findIndex(
            v => v.outlet === outlet
          );
          if (outletIndex !== -1) {
            const oldOutletCount = analytics.visitsByOutlet[outletIndex].visitCount;
            analytics.visitsByOutlet[outletIndex].visitCount = Math.max(0, oldOutletCount - duplicateCount);
            log(`   📍 Outlet visit count: ${oldOutletCount} → ${analytics.visitsByOutlet[outletIndex].visitCount}`, 'green');
          }
        }
        
        // Deduct duplicate points from totalPointsEarned
        analytics.totalPointsEarned = Math.max(0, analytics.totalPointsEarned - pointsToDeduct);
        
        // Recalculate segment based on new visit count
        analytics.segment = analytics.calculateSegment();
        
        await analytics.save();
        
        log(`   📊 Visit count adjusted: ${oldVisitCount} → ${newVisitCount}`, 'green');
        log(`   🏷️  Segment updated: ${analytics.segment}`, 'green');
        results.analyticsFixed++;
      } else {
        log(`   ⚠️  No analytics found for this customer`, 'yellow');
      }

      results.removed += removedCount;
      results.pointsDeducted += pointsToDeduct;
      results.customers.push({
        name: customerInfo.name,
        email: customerInfo.email,
        oldPoints: customerInfo.currentPoints,
        newPoints: newPoints,
        duplicatesRemoved: removedCount,
        pointsDeducted: pointsToDeduct
      });
    } else {
      log(`   ⚠️  Would remove ${duplicateCount} entries`, 'yellow');
      log(`   ⚠️  Would deduct ${pointsToDeduct} points`, 'yellow');
      log(`   ⚠️  Would adjust visit analytics by -${duplicateCount}`, 'yellow');
    }
  }

  return results;
}

async function generateReport(storeId, storeName, results) {
  logSection('STEP 4: CLEANUP REPORT');

  log(`\n📊 Summary for Store: ${storeName}`, 'bright');
  log(`   Store ID: ${storeId}`, 'cyan');
  log(`   Date Range: ${CONFIG.START_DATE.toISOString()} to ${CONFIG.END_DATE.toISOString()}`, 'cyan');
  
  if (CONFIG.DRY_RUN) {
    log(`\n⚠️  DRY RUN - No changes were made`, 'yellow');
  }

  log(`\n📈 Statistics:`, 'bright');
  log(`   Duplicate Groups Processed: ${results.processed}`, 'cyan');
  log(`   Duplicate Entries Removed: ${results.removed}`, results.removed > 0 ? 'green' : 'cyan');
  log(`   Total Points Deducted: ${results.pointsDeducted}`, results.pointsDeducted > 0 ? 'red' : 'cyan');
  log(`   Analytics Records Fixed: ${results.analyticsFixed}`, results.analyticsFixed > 0 ? 'green' : 'cyan');
  log(`   Affected Customers: ${results.customers.length}`, 'cyan');

  if (results.customers.length > 0) {
    log(`\n👥 Affected Customers:`, 'bright');
    results.customers.forEach((customer, i) => {
      log(`\n   ${i + 1}. ${customer.name} (${customer.email})`, 'cyan');
      log(`      Points: ${customer.oldPoints} → ${customer.newPoints} (-${customer.pointsDeducted})`, 'yellow');
      log(`      Duplicates Removed: ${customer.duplicatesRemoved}`, 'yellow');
    });
  }

  log(`\n✅ Cleanup completed successfully!`, 'green');
  log(`\n💡 Next Steps:`, 'bright');
  log(`   1. Review the changes above`, 'cyan');
  log(`   2. Monitor customer complaints`, 'cyan');
  log(`   3. Consider notifying affected customers if changes are significant`, 'cyan');
  log(`   4. Run verification query to confirm no duplicates remain`, 'cyan');
}

async function main() {
  try {
    // Get store ID from command line
    const storeId = process.argv[2];

    if (!storeId) {
      log('❌ Error: Store ID is required', 'red');
      log('\nUsage: node scripts/fixDuplicatePointsForStore.js <STORE_ID>', 'yellow');
      log('Example: node scripts/fixDuplicatePointsForStore.js 507f1f77bcf86cd799439011\n', 'yellow');
      process.exit(1);
    }

    // Validate store ID format
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      log('❌ Error: Invalid Store ID format', 'red');
      process.exit(1);
    }

    logSection('QR POINTS RACE CONDITION - DATA CLEANUP');
    log('Issue ID: QR-RACE-001', 'cyan');
    log('Script Version: 1.0', 'cyan');
    log(`Date: ${new Date().toISOString()}`, 'cyan');
    
    if (CONFIG.DRY_RUN) {
      log('\n⚠️  RUNNING IN DRY RUN MODE - No changes will be made', 'yellow');
    }

    // Connect to database
    log('\n📡 Connecting to database...', 'cyan');
    
    // Determine which database to use based on NODE_ENV
    const dbUri = process.env.NODE_ENV === 'production' 
      ? process.env.MONGODBCONNECTIONSTRING 
      : process.env.MONGODB_DEV_URI;
    
    if (!dbUri) {
      log('❌ Database connection string not found in .env', 'red');
      log('   For dev: MONGODB_DEV_URI', 'yellow');
      log('   For prod: MONGODBCONNECTIONSTRING', 'yellow');
      process.exit(1);
    }
    
    const envName = process.env.NODE_ENV === 'production' ? 'Production' : 'Development';
    log(`   Environment: ${envName}`, 'cyan');
    
    await mongoose.connect(dbUri);
    log('✅ Connected to database', 'green');

    // Step 1: Verify store exists
    logSection('STEP 1: VERIFYING STORE');
    
    const store = await storeModel.findById(storeId);
    
    if (!store) {
      log('❌ Store not found!', 'red');
      await mongoose.disconnect();
      process.exit(1);
    }

    log('✅ Store found!', 'green');
    log(`   Name: ${store.name}`, 'cyan');
    log(`   URL: ${store.url}`, 'cyan');
    log(`   Email: ${store.email || 'N/A'}`, 'cyan');

    // Get customer count
    const customerCount = await customerModel.countDocuments({ store: storeId });
    log(`   Total Customers: ${customerCount}`, 'cyan');

    // Confirm before proceeding (unless in dry run)
    if (!CONFIG.DRY_RUN) {
      log('\n⚠️  This will modify customer point balances!', 'yellow');
      log('⚠️  Make sure you have a database backup!', 'yellow');
      log('\nPress Ctrl+C to cancel or wait 5 seconds to continue...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Step 2-3: Find and process duplicates
    const results = await processCleanup(storeId, store.name);

    // Step 4: Generate report
    await generateReport(storeId, store.name, results);

    // Disconnect from database
    log('\n📡 Disconnecting from database...', 'cyan');
    await mongoose.disconnect();
    log('✅ Disconnected from database', 'green');

    log('\n' + '='.repeat(60) + '\n', 'green');
    process.exit(0);

  } catch (error) {
    log('\n❌ ERROR OCCURRED:', 'red');
    console.error(error);
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    
    process.exit(1);
  }
}

// Run the script
main();
