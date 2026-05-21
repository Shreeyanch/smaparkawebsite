/**
 * MongoDB Backup to S3 Script
 * 
 * This script exports all MongoDB collections and uploads them to S3.
 * Designed for MongoDB Atlas Free Tier which doesn't support native backups.
 * 
 * Usage:
 *   node src/scripts/backupToS3.js
 *   NODE_ENV=production node src/scripts/backupToS3.js
 * 
 * Production:
 * cd backend
      NODE_ENV=production node src/scripts/backupToS3.js
 */

const mongoose = require("mongoose");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getDatabaseConfig } = require("../config/database");
const dotenv = require("dotenv");
const path = require("path");
const zlib = require("zlib");
const { promisify } = require("util");

const gzip = promisify(zlib.gzip);

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

// All models to backup
const modelsToBackup = [
  { name: "Store", model: require("../models/storeModel") },
  { name: "Customer", model: require("../models/customerModel") },
  { name: "Campaign", model: require("../models/campaignModel") },
  { name: "Category", model: require("../models/categoryModel") },
  { name: "MailSMS", model: require("../models/mailSMSModel") },
  { name: "Message", model: require("../models/messageModel") },
  { name: "Notification", model: require("../models/notificationModel") },
  { name: "NotificationLog", model: require("../models/NotificationLog") },
  { name: "Offer", model: require("../models/offerModel") },
  { name: "Order", model: require("../models/orderModel") },
  { name: "Outlet", model: require("../models/outletModel") },
  { name: "OutletPoints", model: require("../models/outletPointsModel") },
  { name: "Payment", model: require("../models/paymentModel") },
  { name: "PointsHistory", model: require("../models/pointsHistoryModel") },
  { name: "Points", model: require("../models/pointsModel") },
  { name: "PrintPoints", model: require("../models/printPointsModel") },
  { name: "Product", model: require("../models/productModel") },
  { name: "Redemption", model: require("../models/redemptionModel") },
  { name: "Reservation", model: require("../models/reservationModel") },
  { name: "ReservationSetting", model: require("../models/reservationSettingModel") },
  { name: "Reward", model: require("../models/rewardModel") },
  { name: "SmsFee", model: require("../models/smsFeeModel") },
  { name: "User", model: require("../models/userModel") },
  { name: "Subscription", model: require("../models/Subscription") },
  { name: "Vote", model: require("../models/Vote") },
  { name: "WhatsappChat", model: require("../models/WhatsappChat") },
  { name: "WhatsappMedia", model: require("../models/WhatsappMedia") },
  { name: "WhatsappOutgoing", model: require("../models/WhatsappOutgoing") },
  { name: "WhatsappAccount", model: require("../models/whatsappAccountModel") },
  { name: "WhatsappTemplate", model: require("../models/whatsappTemplate") },
  { name: "WheelSegment", model: require("../models/wheelSegment") },
  { name: "CustomerAnalytics", model: require("../models/analytics_model/customerAnalyticsModel") },
];

async function backupToS3() {
  const dbConfig = getDatabaseConfig();
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-");
  const dateFolder = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const backupFolder = `mongodb-backups/${dbConfig.env}/${dateFolder}/${timestamp}`;

  console.log("═══════════════════════════════════════════════════════════");
  console.log(`🚀 MongoDB Backup to S3`);
  console.log(`📅 Date: ${now.toISOString()}`);
  console.log(`🌍 Environment: ${dbConfig.name}`);
  console.log(`📦 S3 Bucket: ${process.env.S3_BUCKET_NAME}`);
  console.log("═══════════════════════════════════════════════════════════");

  // Create a separate connection for backup to avoid conflicts
  const backupConnection = mongoose.createConnection(dbConfig.uri);

  try {
    await backupConnection.asPromise();
    console.log(`✅ Connected to ${dbConfig.name} database for backup\n`);

    const backupSummary = {
      timestamp: now.toISOString(),
      environment: dbConfig.env,
      databaseName: dbConfig.name,
      collections: [],
      totalDocuments: 0,
      totalSize: 0,
      errors: [],
    };

    // Backup each collection using the backup connection
    for (const { name, model } of modelsToBackup) {
      try {
        process.stdout.write(`📦 ${name.padEnd(20)}`);

        // Use the backup connection's model
        const BackupModel = backupConnection.model(name, model.schema);
        
        // Fetch all documents
        const documents = await BackupModel.find({}).lean();

        if (documents.length === 0) {
          console.log(`⏭️  0 documents, skipped`);
          continue;
        }

        // Convert to JSON and compress
        const jsonData = JSON.stringify(documents, null, 2);
        const compressedData = await gzip(jsonData);

        // Upload to S3
        const key = `${backupFolder}/${name}.json.gz`;
        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Body: compressedData,
            ContentType: "application/gzip",
            ContentEncoding: "gzip",
            Metadata: {
              "original-size": jsonData.length.toString(),
              "document-count": documents.length.toString(),
              "backup-date": now.toISOString(),
            },
          })
        );

        const sizeKB = (compressedData.length / 1024).toFixed(2);
        console.log(`✅ ${documents.length} docs (${sizeKB} KB compressed)`);

        backupSummary.collections.push({
          name,
          documentCount: documents.length,
          originalSize: jsonData.length,
          compressedSize: compressedData.length,
          key,
        });
        backupSummary.totalDocuments += documents.length;
        backupSummary.totalSize += compressedData.length;

      } catch (err) {
        console.log(`❌ Error: ${err.message}`);
        backupSummary.errors.push({ collection: name, error: err.message });
      }
    }

    // Upload backup manifest
    const manifestJson = JSON.stringify(backupSummary, null, 2);
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${backupFolder}/manifest.json`,
        Body: manifestJson,
        ContentType: "application/json",
      })
    );

    // Summary
    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("📊 BACKUP SUMMARY");
    console.log("═══════════════════════════════════════════════════════════");
    console.log(`✅ Collections backed up: ${backupSummary.collections.length}`);
    console.log(`📄 Total documents: ${backupSummary.totalDocuments}`);
    console.log(`💾 Total size: ${(backupSummary.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📁 Location: s3://${process.env.S3_BUCKET_NAME}/${backupFolder}/`);
    
    if (backupSummary.errors.length > 0) {
      console.log(`⚠️  Errors: ${backupSummary.errors.length}`);
      backupSummary.errors.forEach((e) => console.log(`   - ${e.collection}: ${e.error}`));
    }
    
    console.log("═══════════════════════════════════════════════════════════");
    console.log("✅ Backup completed successfully!");

    return backupSummary;

  } catch (error) {
    console.error("\n❌ Backup failed:", error.message);
    throw error; // Re-throw for the controller to handle
  } finally {
    // Always close the backup connection
    await backupConnection.close();
    console.log("🔌 Closed backup database connection");
  }
}

// Run backup if executed directly
if (require.main === module) {
  backupToS3()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { backupToS3 };
