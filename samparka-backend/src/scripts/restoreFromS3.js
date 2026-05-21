/**
 * MongoDB Restore from S3 Script
 * 
 * This script downloads backup files from S3 and restores them to MongoDB.
 * 
 * Usage:
 *   node src/scripts/restoreFromS3.js <backup-folder-path>
 *   
 * Example:
 *   node src/scripts/restoreFromS3.js mongodb-backups/production/2026-01-22/2026-01-22T02-00-00-000Z
 * 
 * Options:
 *   --dry-run    Show what would be restored without making changes
 *   --collection <name>   Restore only a specific collection
 */

const mongoose = require("mongoose");
const { S3Client, GetObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { getDatabaseConfig } = require("../config/database");
const dotenv = require("dotenv");
const path = require("path");
const zlib = require("zlib");
const { promisify } = require("util");
const readline = require("readline");

const gunzip = promisify(zlib.gunzip);

dotenv.config({ path: path.join(__dirname, "../../.env") });

// S3 Configuration
const s3 = new S3Client({
  region: "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Collection to Model mapping
const collectionModelMap = {
  Store: require("../models/storeModel"),
  Customer: require("../models/customerModel"),
  Campaign: require("../models/campaignModel"),
  Category: require("../models/categoryModel"),
  MailSMS: require("../models/mailSMSModel"),
  Message: require("../models/messageModel"),
  Notification: require("../models/notificationModel"),
  NotificationLog: require("../models/NotificationLog"),
  Offer: require("../models/offerModel"),
  Order: require("../models/orderModel"),
  Outlet: require("../models/outletModel"),
  OutletPoints: require("../models/outletPointsModel"),
  Payment: require("../models/paymentModel"),
  PointsHistory: require("../models/pointsHistoryModel"),
  Points: require("../models/pointsModel"),
  PrintPoints: require("../models/printPointsModel"),
  Product: require("../models/productModel"),
  Redemption: require("../models/redemptionModel"),
  Reservation: require("../models/reservationModel"),
  ReservationSetting: require("../models/reservationSettingModel"),
  Reward: require("../models/rewardModel"),
  SmsFee: require("../models/smsFeeModel"),
  User: require("../models/userModel"),
  Subscription: require("../models/Subscription"),
  Vote: require("../models/Vote"),
  WhatsappChat: require("../models/WhatsappChat"),
  WhatsappMedia: require("../models/WhatsappMedia"),
  WhatsappOutgoing: require("../models/WhatsappOutgoing"),
  WhatsappAccount: require("../models/whatsappAccountModel"),
  WhatsappTemplate: require("../models/whatsappTemplate"),
  WheelSegment: require("../models/wheelSegment"),
  CustomerAnalytics: require("../models/analytics_model/customerAnalyticsModel"),
};

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function listBackups() {
  console.log("📋 Available backups:\n");
  
  const response = await s3.send(
    new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: "mongodb-backups/",
      Delimiter: "/",
    })
  );

  // List environments
  for (const prefix of response.CommonPrefixes || []) {
    const env = prefix.Prefix.replace("mongodb-backups/", "").replace("/", "");
    console.log(`🌍 ${env}:`);
    
    // List dates for this environment
    const datesResponse = await s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.S3_BUCKET_NAME,
        Prefix: prefix.Prefix,
        Delimiter: "/",
      })
    );

    for (const datePrefix of datesResponse.CommonPrefixes || []) {
      const date = datePrefix.Prefix.split("/")[2];
      
      // List timestamps for this date
      const timestampResponse = await s3.send(
        new ListObjectsV2Command({
          Bucket: process.env.S3_BUCKET_NAME,
          Prefix: datePrefix.Prefix,
          Delimiter: "/",
        })
      );

      for (const tsPrefix of timestampResponse.CommonPrefixes || []) {
        const fullPath = tsPrefix.Prefix.slice(0, -1); // Remove trailing /
        console.log(`   📁 ${fullPath}`);
      }
    }
  }
}

async function confirmRestore(backupPath, dbConfig) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log("\n⚠️  WARNING: This will REPLACE existing data!");
    console.log(`   Database: ${dbConfig.name} (${dbConfig.env})`);
    console.log(`   Backup: ${backupPath}\n`);
    
    rl.question("Are you sure you want to continue? (yes/no): ", (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "yes");
    });
  });
}

async function restoreFromS3(backupPath, options = {}) {
  const { dryRun = false, collection = null } = options;
  const dbConfig = getDatabaseConfig();

  console.log("═══════════════════════════════════════════════════════════");
  console.log(`🔄 MongoDB Restore from S3${dryRun ? " (DRY RUN)" : ""}`);
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log(`🌍 Target: ${dbConfig.name} database`);
  console.log(`📁 Backup: ${backupPath}`);
  console.log("═══════════════════════════════════════════════════════════");

  let restoreConnection;

  try {
    // List files in backup folder
    const listResponse = await s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.S3_BUCKET_NAME,
        Prefix: backupPath + "/",
      })
    );

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      console.error("❌ No backup files found at the specified path");
      console.log("\nUse 'node src/scripts/restoreFromS3.js --list' to see available backups");
      return {
        timestamp: new Date().toISOString(),
        backupPath,
        collections: [],
        errors: [{ error: "No backup files found at the specified path" }],
      };
    }

    // Filter for .json.gz files
    const backupFiles = listResponse.Contents.filter(
      (obj) => obj.Key.endsWith(".json.gz")
    );

    if (backupFiles.length === 0) {
      console.error("❌ No valid backup files (.json.gz) found");
      return {
        timestamp: new Date().toISOString(),
        backupPath,
        collections: [],
        errors: [{ error: "No valid backup files (.json.gz) found" }],
      };
    }

    console.log(`\n📋 Found ${backupFiles.length} collections to restore:\n`);
    backupFiles.forEach((file) => {
      const name = path.basename(file.Key, ".json.gz");
      console.log(`   - ${name}`);
    });

    if (dryRun) {
      console.log("\n✅ Dry run complete. No changes were made.");
      return {
        timestamp: new Date().toISOString(),
        backupPath,
        collections: [],
        errors: [],
      };
    }

    // Create separate mongoose connection for restore
    console.log(`\n🔌 Creating restore connection to ${dbConfig.name} database...`);
    restoreConnection = mongoose.createConnection(dbConfig.uri);
    
    await new Promise((resolve, reject) => {
      restoreConnection.once('open', resolve);
      restoreConnection.once('error', reject);
    });

    console.log(`✅ Connected to ${dbConfig.name} database\n`);

    const restoreSummary = {
      timestamp: new Date().toISOString(),
      backupPath,
      collections: [],
      errors: [],
    };

    // Restore each collection
    for (const file of backupFiles) {
      const collectionName = path.basename(file.Key, ".json.gz");

      // Skip if specific collection requested and this isn't it
      if (collection && collectionName !== collection) {
        continue;
      }

      const originalModel = collectionModelMap[collectionName];
      if (!originalModel) {
        console.log(`⏭️  ${collectionName}: No model found, skipping`);
        continue;
      }

      try {
        process.stdout.write(`🔄 ${collectionName.padEnd(20)}`);

        // Create model from restore connection
        const model = restoreConnection.model(collectionName, originalModel.schema);

        // Download and decompress
        const getResponse = await s3.send(
          new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: file.Key,
          })
        );

        const compressedData = await streamToBuffer(getResponse.Body);
        const jsonData = await gunzip(compressedData);
        const documents = JSON.parse(jsonData.toString());

        if (documents.length === 0) {
          console.log(`⏭️  0 documents, skipped`);
          continue;
        }

        // Clear existing data and insert backup
        await model.deleteMany({});
        await model.insertMany(documents, { ordered: false });

        console.log(`✅ ${documents.length} documents restored`);
        restoreSummary.collections.push({
          name: collectionName,
          documentCount: documents.length,
        });

      } catch (err) {
        console.log(`❌ Error: ${err.message}`);
        restoreSummary.errors.push({ collection: collectionName, error: err.message });
      }
    }

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("📊 RESTORE SUMMARY");
    console.log("═══════════════════════════════════════════════════════════");
    console.log(`✅ Collections restored: ${restoreSummary.collections.length}`);
    console.log(`📄 Total documents: ${restoreSummary.collections.reduce((sum, c) => sum + c.documentCount, 0)}`);
    
    if (restoreSummary.errors.length > 0) {
      console.log(`⚠️  Errors: ${restoreSummary.errors.length}`);
      restoreSummary.errors.forEach((e) => console.log(`   - ${e.collection}: ${e.error}`));
    }
    
    console.log("═══════════════════════════════════════════════════════════");
    console.log("✅ Restore completed!");

    return restoreSummary;

  } catch (error) {
    console.error("\n❌ Restore failed:", error.message);
    return {
      timestamp: new Date().toISOString(),
      backupPath,
      collections: [],
      errors: [{ error: error.message }],
    };
  } finally {
    if (restoreConnection) {
      await restoreConnection.close();
      console.log("🔌 Closed restore connection");
    }
  }
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--list") || args.length === 0) {
    listBackups().then(() => process.exit(0));
  } else {
    const backupPath = args.find((a) => !a.startsWith("--"));
    const dryRun = args.includes("--dry-run");
    const collectionIndex = args.indexOf("--collection");
    const collection = collectionIndex !== -1 ? args[collectionIndex + 1] : null;

    if (!backupPath) {
      console.error("❌ Please provide a backup path");
      console.log("\nUsage: node src/scripts/restoreFromS3.js <backup-folder-path>");
      console.log("       node src/scripts/restoreFromS3.js --list");
      process.exit(1);
    }

    restoreFromS3(backupPath, { dryRun, collection })
      .then(() => process.exit(0))
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
  }
}

module.exports = { restoreFromS3, listBackups };
