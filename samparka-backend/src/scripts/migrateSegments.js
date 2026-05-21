/**
 * Migration script to update customer segments from old to new format
 * Old: first_visit, 2-3_visits, 4-10_visits, 10+_visits
 * New: first_visit, second_visit, third_visit, fourth_visit, 5+_visits
 * 
 * Run this script once to update all existing customer analytics records
 */

require('dotenv').config();
const mongoose = require('mongoose');
const CustomerAnalytics = require('../models/analytics_model/customerAnalyticsModel.js');
const { getDatabaseConfig } = require('../config/database.js');

async function migrateSegments() {
  try {
    // Get database configuration
    const dbConfig = getDatabaseConfig();
    console.log(`🔌 Connecting to ${dbConfig.name} database...`);
    
    // Connect to MongoDB
    await mongoose.connect(dbConfig.uri);
    console.log('✅ Connected to MongoDB');

    // Get all customer analytics records
    const allRecords = await CustomerAnalytics.find({});
    console.log(`📊 Found ${allRecords.length} customer analytics records`);

    let updatedCount = 0;
    let errorCount = 0;

    // Update each record based on its visitCount
    for (const record of allRecords) {
      try {
        // Recalculate segment based on current visitCount
        const oldSegment = record.segment;
        let newSegment;

        if (record.visitCount === 1) {
          newSegment = 'first_visit';
        } else if (record.visitCount === 2) {
          newSegment = 'second_visit';
        } else if (record.visitCount === 3) {
          newSegment = 'third_visit';
        } else if (record.visitCount === 4) {
          newSegment = 'fourth_visit';
        } else {
          newSegment = '5+_visits';
        }

        // Only update if segment changed
        if (oldSegment !== newSegment) {
          record.segment = newSegment;
          await record.save();
          updatedCount++;
          
          if (updatedCount % 100 === 0) {
            console.log(`📝 Updated ${updatedCount} records...`);
          }
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error updating record ${record._id}:`, error.message);
      }
    }

    console.log('\n✅ Migration completed!');
    console.log(`   📊 Total records: ${allRecords.length}`);
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ⏭️  Unchanged: ${allRecords.length - updatedCount - errorCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
}

// Run the migration
migrateSegments();
