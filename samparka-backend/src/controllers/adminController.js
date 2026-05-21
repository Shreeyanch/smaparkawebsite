// import userModel from "../models/userModel.js";
// import messageModel from "../models/messageModel.js";
// import smsFeeModel from "../models/smsFeeModel.js";
// import validator from "validator";
// import bcrypt from "bcrypt";
const userModel = require("../models/userModel");
const messageModel = require("../models/messageModel");
const smsFeeModel = require("../models/smsFeeModel");
const validator = require("validator");
const bcrypt = require("bcrypt");
const { mailCreatedUser } = require("./mailController");
const storeController = require("./storeController");
const storeModel = require("../models/storeModel");
const PointsHistory = require("../models/pointsHistoryModel");
const s3 = require("../config/s3Config");

class AdminController {
  async registerUser(req, res) {
    try {
      const { email, password, confirm_password } = req.body.newUser;
      if (!email || !password || !confirm_password) {
        return res.json({ success: false, message: "All fields are required" });
      }
      if (!validator.isEmail(email)) {
        return res.json({ success: false, message: "Invalid email address" });
      }

      const existingEmail = await userModel.findOne({ email });
      if (existingEmail) {
        return res.json({
          success: false,
          message: "User already exists with this email address",
        });
      }

      if (password === confirm_password) {
        const hashedPassword = bcrypt.hashSync(password, 10);
        let newUser = await userModel.create({
          email,
          password: hashedPassword,
        });
        newUser = await userModel.findById(newUser._id).select("-password");
        await mailCreatedUser(email, password);
        res.status(200).json({
          success: true,
          message: "User Registered Successful",
          userData: newUser,
        });
      } else {
        return res.json({ success: false, message: "Password didn't match" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  }

  async fetchUsers(req, res) {
    try {
      const users = await userModel.find({}).select("-password -resetPasswordToken -verificationCode -verificationCodeExpire -tokenVersion");
      return res.status(200).json({ success: true, users });
    } catch (error) {
      return res.status(500).json({ message: "Error fetching users", error });
    }
  }

  async forceLogoutUser(req, res) {
    try {
      const { userId } = req.params;
      const user = await userModel.findByIdAndUpdate(
        userId,
        { $inc: { tokenVersion: 1 } },
        { new: true }
      );
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }
      console.log(`✅ Force logout: ${user.email}`);
      return res.json({ success: true, message: "User logged out from all sessions." });
    } catch (error) {
      console.error("❌ forceLogoutUser error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  async fetchMessages(req, res) {
    try {
      const messages = await messageModel
        .find()
        .sort({ createdAt: -1 })
        .populate("createdBy", "email");

      return res.status(200).json({ success: true, messages });
    } catch (error) {
      return res.status(500).json({ message: "Error fetching users", error });
    }
  }

  async changeMessageStatus(req, res) {
    try {
      const { messageId, status } = req.body;
      let updatedMessage = await messageModel.findByIdAndUpdate(messageId, {
        status,
      });
      updatedMessage = await messageModel.populate(updatedMessage, {
        path: "createdBy",
        select: "email",
      });
      return res.json({
        success: true,
        message: "Message Status Updated Successfuly",
        updatedMessage,
      });
    } catch (error) {
      return res.status(500).send(error);
    }
  }

  async changeSMSFee(req, res) {
    try {
      const { fee } = req.body;
      if (!fee || fee <= 0) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid fee amount." });
      }

      let smsFee = await smsFeeModel.findOne();
      if (!smsFee) {
        smsFee = new smsFeeModel();
      }

      smsFee.amount = fee;

      await smsFee.save();
      res.json({ success: true, message: "SMS fee updated successfully." });
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  }

  async changeUserStatus(req, res) {
    try {
      const { userId, status } = req.params;
      if (!userId || !status) {
        return res.status(400).json({
          success: false,
          message: "User ID and status are required.",
        });
      }

      const validStatuses = ["active", "inactive"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Use 'active' or 'inactive'.",
        });
      }

      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { status },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User status updated successfully.",
        user: updatedUser,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  }

  async editUser(req, res) {
    try {
      const { userId } = req.params;
      const { email, password, confirm_password } = req.body;

      if (!validator.isEmail(email)) {
        return res.json({
          success: false,
          message: "Invalid email address",
        });
      }

      const existingUser = await userModel.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.json({
          success: false,
          message: "User already exists with this email address",
        });
      }

      let updatedUser;
      if (!password && !confirm_password) {
        updatedUser = await userModel
          .findByIdAndUpdate(
            userId,
            { email },
            { new: true }
          )
          .select("-password");
      } else {
        if (password !== confirm_password) {
          return res.json({
            success: false,
            message: "Password didn't match",
          });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        updatedUser = await userModel
          .findByIdAndUpdate(
            userId,
            { email, password: hashedPassword },
            { new: true }
          )
          .select("-password");
      }

      if (!updatedUser) {
        return res.json({
          success: false,
          message: "User not found",
        });
      }

      return res.json({
        success: true,
        message: "User updated successfully",
        userData: updatedUser,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  }

  async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required.",
        });
      }
      const deletedUser = await userModel.findByIdAndDelete(userId);
      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      // Remove the deleted user from all stores that had them assigned
      await storeModel.updateMany(
        { user: deletedUser._id },
        { $pull: { user: deletedUser._id } }
      );

      return res.status(200).json({
        success: true,
        message: "User deleted successfully.",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  }

  async runBackupScript(req, res) {
    try {
      console.log("=== Backup endpoint hit ===");
      console.log("Request body:", req.body);
      console.log("User:", req.user?.email);
      
      const { environment } = req.body;
      
      if (!environment || !['dev', 'prod'].includes(environment)) {
        return res.status(400).json({
          success: false,
          message: "Invalid environment. Must be 'dev' or 'prod'."
        });
      }

      console.log(`Starting backup for ${environment} environment...`);

      // Import the backup function
      const { backupToS3 } = require("../scripts/backupToS3");
      
      // Set the environment
      const originalEnv = process.env.NODE_ENV;
      if (environment === 'prod') {
        process.env.NODE_ENV = 'production';
      } else {
        process.env.NODE_ENV = 'development';
      }

      // Run the backup
      const backupSummary = await backupToS3();
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv;

      return res.status(200).json({
        success: true,
        message: `Backup for ${environment} environment completed successfully`,
        data: backupSummary
      });
    } catch (error) {
      console.error("Backup error:", error);
      return res.status(500).json({
        success: false,
        message: "Backup failed: " + error.message
      });
    }
  }

  async runRestoreScript(req, res) {
    const originalEnv = process.env.NODE_ENV; // Save at the start
    try {
      console.log("\n═══════════════════════════════════════════════════════════");
      console.log("🔄 RESTORE REQUEST RECEIVED");
      console.log("═══════════════════════════════════════════════════════════");
      console.log("Request body:", req.body);
      console.log("Admin user:", req.user?.email);
      console.log("Current NODE_ENV:", process.env.NODE_ENV);
      
      const { environment, backupPath } = req.body;
      
      // Validate environment parameter
      if (!environment || !['dev', 'prod'].includes(environment)) {
        return res.status(400).json({
          success: false,
          message: "Invalid environment. Must be 'dev' or 'prod'."
        });
      }

      if (!backupPath) {
        return res.status(400).json({
          success: false,
          message: "Backup path is required."
        });
      }

      // CRITICAL VALIDATION: Ensure backup path matches target environment
      const expectedEnvFolder = environment === 'prod' ? 'production' : 'development';
      const backupEnvFolder = backupPath.split('/')[1]; // Extract environment from path
      
      console.log(`\n🔍 ENVIRONMENT VALIDATION:`);
      console.log(`   Target environment: ${environment}`);
      console.log(`   Expected folder: ${expectedEnvFolder}`);
      console.log(`   Backup path: ${backupPath}`);
      console.log(`   Backup environment folder: ${backupEnvFolder}`);
      
      if (backupEnvFolder !== expectedEnvFolder) {
        console.error("\n❌ VALIDATION FAILED: Environment mismatch!");
        console.error(`   Cannot restore ${backupEnvFolder} backup to ${environment} database`);
        return res.status(400).json({
          success: false,
          message: `Environment mismatch! Cannot restore ${backupEnvFolder} backup to ${environment} database. Please select a ${expectedEnvFolder} backup.`
        });
      }

      console.log("✅ Environment validation passed");
      console.log(`\n🚀 Starting restore for ${environment.toUpperCase()} environment...`);
      console.log(`📁 Backup path: ${backupPath}`);

      // Import the restore function
      const { restoreFromS3 } = require("../scripts/restoreFromS3");
      const { getDatabaseConfig } = require("../config/database");
      
      // Set the environment for database selection
      if (environment === 'prod') {
        process.env.NODE_ENV = 'production';
      } else {
        process.env.NODE_ENV = 'development';
      }

      // Get and log the target database config
      const targetDbConfig = getDatabaseConfig();
      console.log(`\n🎯 TARGET DATABASE:`);
      console.log(`   Environment: ${targetDbConfig.env}`);
      console.log(`   Database: ${targetDbConfig.name}`);
      console.log(`   URI: ${targetDbConfig.uri?.substring(0, 50)}...`);

      // Run the restore
      console.log(`\n⏳ Executing restore operation...`);
      const restoreSummary = await restoreFromS3(backupPath, { dryRun: false });
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv;
      console.log(`\n✅ NODE_ENV restored to: ${originalEnv}`);

      // Log success
      console.log("\n═══════════════════════════════════════════════════════════");
      console.log("✅ RESTORE COMPLETED SUCCESSFULLY");
      console.log("═══════════════════════════════════════════════════════════");
      console.log(`Collections restored: ${restoreSummary.collections?.length || 0}`);
      console.log(`Total documents: ${restoreSummary.collections?.reduce((sum, c) => sum + c.documentCount, 0) || 0}`);
      if (restoreSummary.errors?.length > 0) {
        console.log(`Errors: ${restoreSummary.errors.length}`);
      }
      console.log("═══════════════════════════════════════════════════════════\n");

      return res.status(200).json({
        success: true,
        message: `✅ Restore for ${environment.toUpperCase()} environment completed successfully. ${restoreSummary.collections?.length || 0} collections restored.`,
        data: restoreSummary
      });
    } catch (error) {
      // Ensure environment is restored even on error
      process.env.NODE_ENV = originalEnv;
      
      console.error("\n═══════════════════════════════════════════════════════════");
      console.error("❌ RESTORE FAILED");
      console.error("═══════════════════════════════════════════════════════════");
      console.error("Error:", error);
      console.error("Stack:", error.stack);
      console.error("═══════════════════════════════════════════════════════════\n");
      
      return res.status(500).json({
        success: false,
        message: "❌ Restore failed: " + error.message
      });
    }
  }

  async listBackups(req, res) {
    try {
      const { environment } = req.query;
      
      if (!environment || !['dev', 'prod'].includes(environment)) {
        return res.status(400).json({
          success: false,
          message: "Invalid environment. Must be 'dev' or 'prod'."
        });
      }

      const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
      
      const s3 = new S3Client({
        region: "us-east-1",
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });

      const envFolder = environment === 'prod' ? 'production' : 'development';
      const prefix = `mongodb-backups/${envFolder}/`;

      // First, list all date folders
      const dateListCommand = new ListObjectsV2Command({
        Bucket: process.env.S3_BUCKET_NAME,
        Prefix: prefix,
        Delimiter: '/',
      });

      const dateResponse = await s3.send(dateListCommand);
      
      // Now for each date folder, list timestamp folders
      const backups = [];
      if (dateResponse.CommonPrefixes) {
        for (const datePrefix of dateResponse.CommonPrefixes) {
          // List timestamp folders within this date
          const timestampListCommand = new ListObjectsV2Command({
            Bucket: process.env.S3_BUCKET_NAME,
            Prefix: datePrefix.Prefix,
            Delimiter: '/',
          });
          
          const timestampResponse = await s3.send(timestampListCommand);
          
          if (timestampResponse.CommonPrefixes) {
            for (const timestampPrefix of timestampResponse.CommonPrefixes) {
              const parts = timestampPrefix.Prefix.split('/');
              // parts: ['mongodb-backups', 'development', '2026-02-12', '2026-02-12T08-30-00-000Z', '']
              if (parts.length >= 4) {
                const date = parts[2];
                const timestamp = parts[3];
                const displayName = `${date} ${timestamp.replace(/T/, ' ').replace(/-/g, ':')}`;
                
                backups.push({ 
                  date: displayName,
                  prefix: timestampPrefix.Prefix.replace(/\/$/, ''), // Remove trailing slash
                  timestamp: timestamp
                });
              }
            }
          }
        }
      }

      return res.status(200).json({
        success: true,
        backups: backups.reverse() // Most recent first
      });
    } catch (error) {
      console.error("List backups error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to list backups: " + error.message
      });
    }
  }

  async getStoreLastActivity(req, res) {
    try {
      const { storeId } = req.params;
      const lastRecord = await PointsHistory.findOne({ store: storeId })
        .sort({ createdAt: -1 })
        .populate("customer", "name phone countryCode")
        .lean();

      if (!lastRecord) {
        return res.json({ success: true, data: null });
      }

      return res.json({ success: true, data: lastRecord });
    } catch (error) {
      console.error("getStoreLastActivity error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getStoreActivity(req, res) {
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

      // Get most recent points distribution per store
      const activityMap = await PointsHistory.aggregate([
        { $group: { _id: "$store", lastActivity: { $max: "$createdAt" } } },
      ]);
      const activityByStore = Object.fromEntries(
        activityMap.map((a) => [a._id.toString(), a.lastActivity])
      );

      const stores = await storeModel.find({}, "name status phone email user createdAt").populate("user", "name email");
      const recently_active = [];
      const cooling_down = [];
      const inactive = [];

      for (const store of stores) {
        const lastActivity = activityByStore[store._id.toString()] || null;
        const entry = {
          _id: store._id,
          name: store.name,
          status: store.status,
          lastActivity,
          phone: store.phone,
          email: store.email,
          createdAt: store.createdAt,
          user: store.user,
        };
        if (!lastActivity || lastActivity < thirtyDaysAgo) {
          inactive.push(entry);
        } else if (lastActivity < sevenDaysAgo) {
          cooling_down.push(entry);
        } else {
          recently_active.push(entry);
        }
      }

      const sortFn = (a, b) => (b.lastActivity || 0) - (a.lastActivity || 0);
      recently_active.sort(sortFn);
      cooling_down.sort(sortFn);
      inactive.sort(sortFn);

      return res.json({
        success: true,
        data: {
          recently_active,
          cooling_down,
          inactive,
          summary: {
            total: stores.length,
            recentlyActiveCount: recently_active.length,
            coolingDownCount: cooling_down.length,
            inactiveCount: inactive.length,
          },
        },
      });
    } catch (error) {
      console.error("getStoreActivity error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AdminController();
