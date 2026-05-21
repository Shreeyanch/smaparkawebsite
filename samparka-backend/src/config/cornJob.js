const cron = require("node-cron");
const mongoose = require("mongoose");
const Store = require("../models/storeModel");
const Customer = require("../models/customerModel");
const CustomerOutletPoints = require("../models/customerOutletPointsModel");
const L5PointsTransaction = require("../models/l5PointsTransactionModel");
const MailSMS = require("../models/mailSMSModel");
const mailController = require("../controllers/mailController");
const smsController = require("../controllers/smsController");
const axios = require("axios");
const dotenv = require("dotenv");
const pointsHistoryModel = require("../models/pointsHistoryModel");
const notificationController = require("../controllers/notificationController");
const notificationModel = require("../models/notificationModel");
const Campaign = require("../models/campaignModel");
const campaignService = require("../services/campaignService");
const { backupToS3 } = require("../scripts/backupToS3");
const adminControlController = require("../controllers/adminControlController");
const distributedLock = require("../utils/distributedLock");
const adminSettingsModel = require("../models/adminSettingsModel");
const visitAnalyticsService = require("../services/visitAnalyticsService");

// Helper: Calculate days between two dates testing 2 switch
const getDaysBetween = (date1, date2) => {
  return Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
};

const handleInactivityAndDemotion = async () => {
  try {
    // Include both L34HA and L4 formats for tier maintenance
    const stores = await Store.find({ 
      "loyaltyCard.format": { $in: ["L34HA", "L4"] }
    });
    const storeIds = stores.map((store) => store._id.toString());

    const customers = await Customer.find({
      store: { $in: storeIds },
    }).populate("store");

    const now = new Date();

    for (const customer of customers) {
      const store = customer.store;
      if (!store || !store.loyaltyCard) continue;

      const tiers = store.loyaltyCard.tier || [];
      // const inactivityDays = store.loyaltyCard.inactivity || 30;
      const globalMaintainDays = store.loyaltyCard.demote || 365;

      // Get customer's current tier to check for per-tier maintenance period
      const currentTier = tiers.find((t) => t.name === customer.tier);
      // Use tier-specific maintenance period if available, otherwise use global
      const maintainDays = currentTier?.maintenancePeriod || globalMaintainDays;

      const joinedDate = new Date(customer.createdAt || now);
      const lastChecked = new Date(customer.lastTierChecked || 0);

      // Fetch latest activity
      const history = await pointsHistoryModel
        .find({ customer: customer._id })
        .sort({ createdAt: -1 })
        .limit(1);

      const lastActiveDate = history[0]
        ? new Date(history[0].createdAt)
        : joinedDate;

      // const inactive = getDaysBetween(lastActiveDate, now) > inactivityDays;
      const needsTierCheck =
        getDaysBetween(joinedDate, now) > maintainDays &&
        getDaysBetween(lastChecked, now) >= maintainDays;

      // // 1. Reset points due to inactivity
      // if (inactive && customer.points > 0) {
      //   customer.points = 0;
      //   console.log(`ℹ️ Reset points due to inactivity: ${customer._id}`);
      // }

      // 2. Tier demotion — skip customers whose tier is admin-locked
      if (needsTierCheck && !customer.tierLockedByAdmin) {
        const currentPoints = customer.points || 0;
        const currentTierIndex = tiers.findIndex(
          (t) => t.name === customer.tier
        );

        // Case: No points history in last maintainDays -> Demote to Bronze
        if (getDaysBetween(lastActiveDate, now) >= maintainDays) {
          const bronzeTier = tiers[0];
          if (bronzeTier) {
            customer.tier = bronzeTier.name;
            customer.points = 0;
            console.log(
              `⬇️ Demoted to Bronze due to 1 year inactivity: ${customer._id}`
            );
          }
        } else {
          // Try to find the tier the customer can maintain based on points
          let demotedTier = tiers[0]; // Start with Bronze (lowest tier)
          
          // For L4: Keep all points, just find appropriate tier based on point range
          if (store.loyaltyCard.format === "L4") {
            // Find tier based on point range (minPoints to maxPoints)
            for (let i = tiers.length - 1; i >= 0; i--) {
              const tier = tiers[i];
              if (currentPoints >= tier.minPoints && currentPoints <= tier.maxPoints) {
                demotedTier = tier;
                break;
              }
            }
            
            if (demotedTier.name !== customer.tier) {
              customer.tier = demotedTier.name;
              // L4: Keep all points - NO deduction
              console.log(
                `⬇️ [L4] Demoted customer ${customer._id} to ${demotedTier.name}, keeping ${customer.points} points`
              );
            }
          } else {
            // L34HA: Deduct maintain points on demotion
            for (let i = tiers.length - 1; i >= 0; i--) {
              const tier = tiers[i];
              if (tier.maintain && currentPoints > tier.maintain) {
                demotedTier = tier;
                const maintain = demotedTier.maintain || 0;
                const remaining = currentPoints - maintain;
                customer.points = remaining >= 0 ? remaining : 0;
                break;
              }
            }

            if (demotedTier.name !== customer.tier) {
              const maintain = demotedTier.maintain || 0;
              const remaining = currentPoints - maintain;
              customer.tier = demotedTier.name;
              customer.points = remaining >= 0 ? remaining : 0;
              console.log(
                `⬇️ [L34HA] Demoted customer ${customer._id} to ${demotedTier.name} with ${customer.points} points`
              );
            }
          }
        }

        customer.lastTierChecked = now;
      }

      await customer.save();
    }

    console.log("✅ Tier maintenance and inactivity check complete.");
  } catch (error) {
    console.error("❌ Cron job error:", error.message);
  }
};

// Check and deactivate stores with expired subscriptions
const checkExpiredSubscriptions = async () => {
  try {
    const now = new Date();
    
    // Find all active stores with expired subscriptions
    const expiredStores = await Store.find({
      status: "active",
      subscriptionEndDate: { $exists: true, $lt: now }
    });

    if (expiredStores.length === 0) {
      console.log("✅ No expired subscriptions found.");
      return;
    }

    console.log(`🔍 Found ${expiredStores.length} store(s) with expired subscriptions.`);

    // Deactivate all expired stores
    for (const store of expiredStores) {
      store.status = "deactive";
      await store.save();
      console.log(`🔴 Deactivated store: ${store.name} (${store._id}) - Subscription expired on ${store.subscriptionEndDate}`);
    }

    console.log("✅ Expired subscription check complete.");
  } catch (error) {
    console.error("❌ Expired subscription check error:", error.message);
  }
};

// Run daily at 5 AM
cron.schedule("0 1 * * *", () => {
  console.log("🕑 Running daily tier maintenance and inactivity check...");
  handleInactivityAndDemotion();
});

// Run expired subscription check at 12:01 AM daily
cron.schedule("1 0 * * *", () => {
  console.log("🕛 Running daily expired subscription check...");
  checkExpiredSubscriptions();
});

/////////////min/h/d/m/week(0-7)(Sunday-Saturday)
cron.schedule("0 9 * * *", async () => {
  console.log("🎉 Running Birthday Email/SMS Cron Job...");
  const today = new Date().toISOString().slice(5, 10); // MM-DD format
  try {
    const stores = await Store.find({ needCustomerDOB: true });
    const storeIds = stores.map((store) => store._id);
    const customers = await Customer.find({
      store: { $in: storeIds },
    }).populate("store");
    for (const customer of customers) {
      if (!customer.dob) continue;
      const customerBirthday = customer.dob.toISOString().slice(5, 10);
      if (customerBirthday !== today) continue;
      const store = customer.store;
      if (!store) {
        console.log(`❌ Store not found for customer: ${customer.name}`);
        continue;
      }
      if (!store.email || !store.pass) {
        console.log(`❌ Store don't have email and password for SMTP`);
        continue;
      }
      // Fetch store's email credentials
      const storeEmail = store.email;
      const storePass = store.pass;
      // Fetch Birthday Email Template from mailSMSModel
      const mailSMS = await MailSMS.findOne({ store: store._id });
      if (
        !mailSMS ||
        !mailSMS.mailOnBirthday ||
        !mailSMS.mailOnBirthday.subject
      ) {
        console.log(`⚠️ No birthday email template for store: ${store.name}`);
        continue;
      }
      const subject = mailSMS.mailOnBirthday.subject;
      const message = mailSMS.mailOnBirthday.message;
      // Call mailCustomers method to send email
      const emailSent = await mailController.mailCustomers({
        user: storeEmail,
        pass: storePass,
        host: store.host,
        port: store.port,
        secure: store.secure,
        email: customer.email,
        subject,
        message,
        storeName: store.name,
        storeURL: store.url || "",
        cardColor: store.loyaltyCard?.cardColor,
        textColor: store.loyaltyCard?.textColor,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
      });
      if (emailSent) {
        console.log(
          `✅ Birthday email sent to ${customer.email} from store ${store.name}`
        );
      } else {
        console.log(`❌ Failed to send email to ${customer.email}`);
      }

      // Send SMS if configured
      if (!store.smsToken) {
        console.log(`❌ Store don't have sms token.`);
        continue;
      }
      if (
        !mailSMS ||
        !mailSMS.smsOnBirthday ||
        !mailSMS.smsOnBirthday.message
      ) {
        console.log(`⚠️ No birthday sms template for store: ${store.name}`);
        continue;
      }
      let from = mailSMS.smsOnBirthday.from;
      const smsMessage = mailSMS.smsOnBirthday.message;
      const smsSent = await smsController.smsCustomer({
        token: store.smsToken,
        to: customer.phone,
        from,
        message: smsMessage,
        storeName: store.name,
        storeURL: store.url,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
      });
      if (smsSent) {
        console.log(
          `✅ Birthday sms sent to ${customer.phone} from store ${store.name}`
        );
      } else {
        console.log(`❌ Failed to send sms to ${customer.phone}`);
      }

      // Send Notification if configured
      if (
        !mailSMS ||
        !mailSMS.notificationOnBirthday ||
        !mailSMS.notificationOnBirthday.body
      ) {
        console.log(
          `⚠️ No birthday notification template for store: ${store.name}`
        );
        continue;
      }
      const title = mailSMS.smsOnBirthday.title;
      const body = mailSMS.smsOnBirthday.body;
      const notificationResponse =
        await notificationController.singleNotification({
          title,
          body,
          storeName: store.name,
          storeURL: store.url,
          userId: customer._id,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
        });
      if (notificationResponse.success) {
        const receivers = [
          { customer: customer._id, read: false, readAt: null },
        ];
        // Create a notification document
        const notification = new notificationModel({
          store: store._id,
          title: title || "Notification",
          message: body || "New notification received.",
          receivers,
        });
        await notification.save();

        console.log(
          `✅ Birthday notification sent to ${customer.phone} from store ${store.name}`
        );
      } else {
        console.log(`❌ Failed to send notification to ${customer.phone}`);
      }
    }
  } catch (error) {
    console.error("🚨 Error in Birthday Email/SMS Cron Job:", error);
  }
});

cron.schedule("0 8 * * *", async () => {
  // Runs every day at 8 AM
  console.log("------------------------------------------------------");
  console.log("Checking for expiring points...");
  console.log("------------------------------------------------------");

  const stores = await Store.find({ hasExpiry: true }); // loop through all stores
  for (const store of stores) {
    // Fetch notification settings for this store
    const mailSMS = await MailSMS.findOne({ store: store._id });
    const notificationSettings = mailSMS?.notificationOnPointExpire || {
      title: "Points Expiring Soon! ⏰",
      body: "Hi [customer_name], your loyalty points will expire in [days_remaining] day(s). Use them before they're gone!",
      daysBeforeExpiry: [7, 3, 1],
    };
    const daysToNotify = notificationSettings.daysBeforeExpiry || [7, 3, 1];

    const customers = await Customer.find({
      store,
      pointChangeDate: { $exists: true, $ne: null },
    });
    for (const customer of customers) {
      const lastUpdated = new Date(customer.pointChangeDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expirationDate = new Date(lastUpdated);
      expirationDate.setDate(lastUpdated.getDate() + store.expiryDays);
      expirationDate.setHours(0, 0, 0, 0);

      console.log("customerName: ", customer.name, lastUpdated, expirationDate);

      const diffInDays = Math.ceil(
        (expirationDate - today) / (1000 * 60 * 60 * 24)
      );

      console.log("customerName: ", customer.name, "expiry: ", diffInDays);

      if (daysToNotify.includes(diffInDays)) {
        // Notify the user using configured notification template
        try {
          // Replace placeholders in title and body
          let title = (notificationSettings.title || "Points Expiring Soon!")
            .replace(/\[customer_name\]/g, customer.name || "Customer")
            .replace(/\[store_name\]/g, store.name || "Store")
            .replace(/\[days_remaining\]/g, diffInDays.toString());

          let body = (notificationSettings.body || `Hi ${customer.name}, your loyalty points will expire in ${diffInDays} day(s). Use them soon!`)
            .replace(/\[customer_name\]/g, customer.name || "Customer")
            .replace(/\[store_name\]/g, store.name || "Store")
            .replace(/\[days_remaining\]/g, diffInDays.toString());

          const notificationResponse = await notificationController.singleNotification({
            title,
            body,
            storeName: store.name,
            storeURL: store.url,
            userId: customer._id,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
          });

          if (notificationResponse.success) {
            const receivers = [
              { customer: customer._id, read: false, readAt: null },
            ];
            // Create a notification document
            const notification = new notificationModel({
              store: store._id,
              title: title || "Notification",
              message: body || "New notification received.",
              receivers,
            });
            await notification.save();
            console.log(`✅ Point expiry notification sent to ${customer.name} for ${diffInDays} days remaining.`);
          } else {
            console.log(`❌ Failed to send point expiry notification to ${customer.name}`);
          }
        } catch (err) {
          console.error(`Failed to notify ${customer.name}:`, err.message);
        }
      } else if (diffInDays <= 0) {
        // 🗑️ Reset points - handle L5 format differently
        // Check if store uses L5 format
        if (store.loyaltyCard?.format === "L5") {
          // L5: Reset both Customer.points AND CustomerOutletPoints
          console.log(`🗑️ L5 points expiring for ${customer.name}...`);

          // First, get all outlet points before resetting (for transaction records)
          const expiredOutletPoints = await CustomerOutletPoints.find({
            customer: customer._id,
            store: store._id,
            currentPoints: { $gt: 0 }, // Only get outlets with points
          });

          // Reset Customer.points
          await Customer.findByIdAndUpdate(customer._id, {
            $set: {
              points: 0,
              pointChangeDate: null,
            },
          });

          // Reset all outlet-specific points for this customer
          await CustomerOutletPoints.updateMany(
            {
              customer: customer._id,
              store: store._id,
            },
            {
              $set: {
                currentPoints: 0,
                lastTransactionDate: new Date(),
              },
            }
          );

          // Create transaction records for audit trail
          for (const outletPoint of expiredOutletPoints) {
            try {
              await L5PointsTransaction.create({
                store: store._id,
                customer: customer._id,
                outlet: outletPoint.outlet,
                transactionType: "expiry",
                points: -outletPoint.currentPoints,
                balanceAfter: 0,
                description: `Points expired after ${store.expiryDays} days of inactivity`,
              });
            } catch (txnErr) {
              console.error(`❌ Failed to create expiry transaction for outlet ${outletPoint.outlet}:`, txnErr.message);
            }
          }

          console.log(`🗑️ L5 points reset for ${customer.name} (Customer.points and ${expiredOutletPoints.length} outlet(s))`);
        } else {
          // L4 and other formats: Reset only Customer.points
          await Customer.findByIdAndUpdate(customer._id, {
            $set: {
              points: 0,
              pointChangeDate: null,
            },
          });
          console.log(`🗑️ Points reset for ${customer.name} due to expiry.`);
        }
      }
    }
  }
});

console.log("🎯 Birthday Email/SMS Cron Job Scheduled...");
console.log("🔴 Expired Subscription Check Cron Job Scheduled (Daily at 12:01 AM)...");

// Scheduled Campaign Processing - Run every minute
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const pendingCampaigns = await Campaign.find({
      status: "scheduled",
      scheduledFor: { $lte: now },
    });

    if (pendingCampaigns.length > 0) {
      console.log(`📨 Processing ${pendingCampaigns.length} scheduled campaign(s)...`);

      for (const campaign of pendingCampaigns) {
        try {
          await campaignService.processCampaign(campaign._id);
          console.log(`✅ Campaign "${campaign.name}" processed successfully`);
        } catch (error) {
          console.error(`❌ Failed to process campaign "${campaign.name}":`, error.message);
        }
      }
    }
  } catch (error) {
    console.error("❌ Scheduled campaign cron job error:", error.message);
  }
});

console.log("📨 Scheduled Campaign Cron Job Scheduled...");

// Database Backup to S3 - Run twice a week (Sunday & Wednesday at 2 AM NPT)
cron.schedule("0 2 * * 0,3", async () => {
  const lockKey = "db-backup-cron";
  const instanceId = process.env.NODE_APP_INSTANCE || "0";

  const acquired = await distributedLock.acquire(lockKey, 3600);

  if (!acquired) {
    console.log(`⏭️ [Instance ${instanceId}] Backup already running in another instance, skipping.`);
    return;
  }

  console.log("🗄️ Running bi-weekly database backup to S3...");
  try {
    await backupToS3();
    console.log("✅ Bi-weekly database backup completed successfully");
  } catch (error) {
    console.error("❌ Bi-weekly database backup failed:", error.message);
  } finally {
    await distributedLock.release(lockKey);
  }
}, {
  timezone: "Asia/Kathmandu"
});

console.log("🗄️ Database Backup Cron Job Scheduled (Sunday & Wednesday at 2 AM)...");

// One-time Backfill Visit Analytics - Run on Jan 23, 2026 at 2 AM

// Daily 8 PM — Send nightly store performance report to all store-assigned users
// This task is dynamic: call rescheduleReport(hour, minute) to update it at runtime
const _dailyReportHandler = async () => {
  const lockKey = "daily-report-cron";
  const instanceId = process.env.NODE_APP_INSTANCE || "0";

  console.log(`📧 [Instance ${instanceId}] Daily report cron triggered at ${new Date().toISOString()}`);

  // Try to acquire distributed lock
  const acquired = await distributedLock.acquire(lockKey, 1800); // 30 min TTL

  if (!acquired) {
    console.log(`⏭️ [Instance ${instanceId}] Another instance is already running daily report - skipping`);
    return;
  }

  console.log(`🔒 [Instance ${instanceId}] Lock acquired - starting daily report execution`);

  try {
    await adminControlController.runDailyReport();
    console.log(`✅ [Instance ${instanceId}] Daily report completed successfully`);
  } catch (error) {
    console.error(`❌ [Instance ${instanceId}] Nightly store report cron error:`, error.message);
  } finally {
    // Always release lock when done
    await distributedLock.release(lockKey);
    console.log(`🔓 [Instance ${instanceId}] Lock released`);
  }
};

let _dailyReportTask = cron.schedule("0 20 * * *", _dailyReportHandler);
console.log("📧 Nightly Store Report Cron Job Scheduled (Daily at 8 PM)...");

const rescheduleReport = (hour, minute) => {
  if (_dailyReportTask) {
    _dailyReportTask.stop();
    _dailyReportTask = null;
  }
  const cronExpr = `${minute} ${hour} * * *`;
  _dailyReportTask = cron.schedule(cronExpr, _dailyReportHandler);
  const pad = (n) => String(n).padStart(2, "0");
  console.log(`📧 Daily report rescheduled to ${pad(hour)}:${pad(minute)} NPT (cron: "${cronExpr}")`);
};

// Store Expiry Notification Cron Job
// Sends daily alerts to stores with ≤7 days until subscription expires
const runExpiryNotification = async () => {
  const lockKey = "expiry-notification-cron";
  const instanceId = process.env.NODE_APP_INSTANCE || "0";

  console.log(`📧 [Instance ${instanceId}] Expiry notification cron triggered at ${new Date().toISOString()}`);

  // Try to acquire distributed lock
  const acquired = await distributedLock.acquire(lockKey, 1800); // 30 min TTL

  if (!acquired) {
    console.log(`⏭️ [Instance ${instanceId}] Another instance is already running expiry notification - skipping`);
    return;
  }

  console.log(`🔒 [Instance ${instanceId}] Lock acquired - starting expiry notification check`);

  try {
    const settings = await adminSettingsModel.getSettings();

    // Check if already run today (prevent duplicate sends)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
      settings.lastExpiryNotificationDate &&
      new Date(settings.lastExpiryNotificationDate).setHours(0, 0, 0, 0) >= today.getTime()
    ) {
      console.log("⏭️ Expiry notification already sent today, skipping");
      return;
    }

    console.log("📧 Starting expiry notification check...");

    // Calculate date range (today to today + 7 days)
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    sevenDaysFromNow.setHours(23, 59, 59, 999); // End of 7th day

    // Query stores with expiring subscriptions
    const expiringStores = await Store.find({
      status: "active",
      subscriptionEndDate: {
        $gte: now, // Not expired yet
        $lte: sevenDaysFromNow, // Within next 7 days
      },
    })
      .populate("user", "email")
      .lean();

    console.log(`Found ${expiringStores.length} stores with expiring subscriptions`);

    const results = {
      total: expiringStores.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      details: [],
    };

    for (const store of expiringStores) {
      try {
        // Skip stores without users or emails
        const toEmails = (store.user || []).map((u) => u.email).filter(Boolean);

        if (toEmails.length === 0) {
          results.skipped++;
          results.details.push({ store: store.name, reason: "No email addresses" });
          continue;
        }

        // Calculate days remaining
        const endDate = new Date(store.subscriptionEndDate);
        const timeDiff = endDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        // Get store metrics (reuse visitAnalyticsService)
        const storeMetrics = await visitAnalyticsService.getDailyStoreSummary(store._id);

        // Send notification
        await mailController.sendExpiryNotification({
          toEmails,
          storeName: store.name,
          storeUrl: store.url,
          daysRemaining,
          subscriptionEndDate: store.subscriptionEndDate,
          storeMetrics,
          storeServices: store.services,
        });

        results.sent++;
        results.details.push({
          store: store.name,
          emails: toEmails.length,
          daysRemaining,
        });
      } catch (error) {
        console.error(`❌ Failed to send expiry notification for ${store.name}:`, error);
        results.failed++;
        results.details.push({ store: store.name, error: error.message });
      }
    }

    // Update last run date
    await adminSettingsModel.updateOne({}, { lastExpiryNotificationDate: new Date() });

    console.log("✅ Expiry notification check completed:", JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("❌ Expiry notification cron failed:", error);
  } finally {
    // Always release lock when done
    await distributedLock.release(lockKey);
    console.log(`🔓 [Instance ${instanceId}] Lock released`);
  }
};

const scheduleExpiryNotification = async () => {
  try {
    const settings = await adminSettingsModel.getSettings();
    const hour = settings.expiryNotificationHour || 9;
    const minute = settings.expiryNotificationMinute || 0;

    const cronExpression = `${minute} ${hour} * * *`;

    if (_expiryNotificationTask) {
      _expiryNotificationTask.stop();
      _expiryNotificationTask = null;
    }

    _expiryNotificationTask = cron.schedule(cronExpression, runExpiryNotification);
    const pad = (n) => String(n).padStart(2, "0");
    console.log(`✅ Expiry notification scheduled at ${pad(hour)}:${pad(minute)} NPT (cron: "${cronExpression}")`);
  } catch (error) {
    console.error("❌ Failed to schedule expiry notification:", error);
  }
};

const rescheduleExpiryNotification = async (hour, minute) => {
  try {
    await adminSettingsModel.updateOne({}, { expiryNotificationHour: hour, expiryNotificationMinute: minute });
    await scheduleExpiryNotification();
    const pad = (n) => String(n).padStart(2, "0");
    console.log(`📧 Expiry notification rescheduled to ${pad(hour)}:${pad(minute)} NPT`);
  } catch (error) {
    console.error("❌ Failed to reschedule expiry notification:", error);
    throw error;
  }
};

// Initialize expiry notification on server start
let _expiryNotificationTask = null;
scheduleExpiryNotification();

// Every minute — Process scheduled admin events (send notifications to store users)
cron.schedule("* * * * *", async () => {
  try {
    await adminControlController.processScheduledEvents();
  } catch (error) {
    console.error("❌ Event scheduler cron error:", error.message);
  }
});

console.log("📅 Admin Event Scheduler Cron Job Scheduled (Every minute)...");

module.exports = { rescheduleReport, rescheduleExpiryNotification, runExpiryNotification };
