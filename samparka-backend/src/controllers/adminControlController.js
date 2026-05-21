const adminEventModel = require("../models/adminEventModel");
const adminSettingsModel = require("../models/adminSettingsModel");
const storeModel = require("../models/storeModel");
const userModel = require("../models/userModel");
const mailController = require("./mailController");
const { getDailyStoreSummary } = require("../services/visitAnalyticsService");
const responseHandler = require("../utils/responseHandler");

class AdminControlController {
  // GET /admin/control/events
  getEvents = async (req, res) => {
    try {
      const { status, type, page = 1, limit = 50 } = req.query;
      const filter = {};
      if (status) filter.status = status;
      if (type) filter.type = type;

      const skip = (Number(page) - 1) * Number(limit);
      const [events, total] = await Promise.all([
        adminEventModel
          .find(filter)
          .populate("targetStores", "name url type status")
          .populate("createdBy", "email name")
          .sort({ scheduledAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        adminEventModel.countDocuments(filter),
      ]);

      return responseHandler.success(res, { events, total, page: Number(page), limit: Number(limit) }, "Events fetched successfully");
    } catch (error) {
      console.error("❌ getEvents error:", error.message);
      return responseHandler.serverError(res, "Failed to fetch events");
    }
  };

  // GET /admin/control/events/store/:storeId — for store owners to view their events
  getStoreEvents = async (req, res) => {
    try {
      const { storeId } = req.params;
      const events = await adminEventModel
        .find({
          targetStores: storeId,
          status: { $in: ["scheduled", "sent"] },
        })
        .select("title description type scheduledAt status sentAt")
        .sort({ scheduledAt: -1 })
        .limit(20);

      return responseHandler.success(res, { events }, "Store events fetched successfully");
    } catch (error) {
      console.error("❌ getStoreEvents error:", error.message);
      return responseHandler.serverError(res, "Failed to fetch store events");
    }
  };

  // POST /admin/control/events/sendNow — create and immediately send an event
  sendEventNow = async (req, res) => {
    try {
      const { title, description, type, targetStores } = req.body;

      if (!title || !description || !type || !targetStores?.length) {
        return responseHandler.error(res, "All fields are required: title, description, type, targetStores");
      }

      const now = new Date();
      const event = await adminEventModel.create({
        title,
        description,
        type,
        scheduledAt: now,
        targetStores,
        status: "scheduled",
        createdBy: req.user._id,
      });

      // Populate target stores with user emails so we can send immediately
      const populated = await adminEventModel
        .findById(event._id)
        .populate({
          path: "targetStores",
          select: "name url type user",
          populate: { path: "user", select: "email name" },
        })
        .populate("createdBy", "email name");

      // Collect deduplicated recipient emails
      const emailSet = new Set();
      for (const store of populated.targetStores) {
        for (const u of store.user || []) {
          const email = typeof u === "object" ? u.email : null;
          if (email) emailSet.add(email);
        }
      }
      const toEmails = Array.from(emailSet);

      let finalStatus = "failed";
      let failureReason = null;

      if (!toEmails.length) {
        failureReason = "No recipient emails found for target stores";
        console.warn(`⚠️ sendEventNow: no recipient emails for event "${title}"`);
      } else {
        const sent = await mailController.sendEventNotification({
          toEmails,
          event: { title, description, type, scheduledAt: now },
        });
        if (sent) {
          finalStatus = "sent";
          console.log(`✅ Event "${title}" sent now to ${toEmails.length} recipient(s)`);
        } else {
          failureReason = "Mail transport returned false";
          console.error(`❌ sendEventNow: mail transport failed for event "${title}"`);
        }
      }

      event.status = finalStatus;
      event.sentAt = finalStatus === "sent" ? new Date() : undefined;
      if (failureReason) event.failureReason = failureReason;
      await event.save();

      // Re-populate for response (now with clean status)
      const result = await adminEventModel
        .findById(event._id)
        .populate("targetStores", "name url type status")
        .populate("createdBy", "email name");

      if (finalStatus === "sent") {
        return responseHandler.created(res, { event: result, recipients: toEmails.length }, "Event sent successfully");
      } else {
        return responseHandler.error(res, failureReason || "Failed to send event");
      }
    } catch (error) {
      console.error("❌ sendEventNow error:", error.message);
      return responseHandler.serverError(res, "Failed to send event");
    }
  };

  // POST /admin/control/events
  createEvent = async (req, res) => {
    try {
      const { title, description, type, scheduledAt, targetStores } = req.body;

      if (!title || !description || !type || !scheduledAt || !targetStores?.length) {
        return responseHandler.error(res, "All fields are required: title, description, type, scheduledAt, targetStores");
      }

      const event = await adminEventModel.create({
        title,
        description,
        type,
        scheduledAt: new Date(scheduledAt),
        targetStores,
        status: "scheduled",
        createdBy: req.user._id,
      });

      const populated = await adminEventModel
        .findById(event._id)
        .populate("targetStores", "name url type status")
        .populate("createdBy", "email name");

      console.log(`✅ Admin event created: "${title}" scheduled for ${scheduledAt}`);
      return responseHandler.created(res, { event: populated }, "Event created successfully");
    } catch (error) {
      console.error("❌ createEvent error:", error.message);
      return responseHandler.serverError(res, "Failed to create event");
    }
  };

  // PUT /admin/control/events/:eventId
  updateEvent = async (req, res) => {
    try {
      const { eventId } = req.params;
      const { title, description, type, scheduledAt, targetStores } = req.body;

      const event = await adminEventModel.findById(eventId);
      if (!event) return responseHandler.notFound(res, "Event not found");

      if (event.status === "sent") {
        return responseHandler.error(res, "Cannot edit an event that has already been sent");
      }

      if (title) event.title = title;
      if (description) event.description = description;
      if (type) event.type = type;
      if (scheduledAt) event.scheduledAt = new Date(scheduledAt);
      if (targetStores) event.targetStores = targetStores;

      await event.save();

      const populated = await adminEventModel
        .findById(event._id)
        .populate("targetStores", "name url type status")
        .populate("createdBy", "email name");

      console.log(`✅ Admin event updated: "${event.title}"`);
      return responseHandler.success(res, { event: populated }, "Event updated successfully");
    } catch (error) {
      console.error("❌ updateEvent error:", error.message);
      return responseHandler.serverError(res, "Failed to update event");
    }
  };

  // DELETE /admin/control/events/:eventId
  deleteEvent = async (req, res) => {
    try {
      const { eventId } = req.params;
      const event = await adminEventModel.findByIdAndDelete(eventId);
      if (!event) return responseHandler.notFound(res, "Event not found");

      console.log(`✅ Admin event deleted: "${event.title}"`);
      return responseHandler.success(res, null, "Event deleted successfully");
    } catch (error) {
      console.error("❌ deleteEvent error:", error.message);
      return responseHandler.serverError(res, "Failed to delete event");
    }
  };

  // POST /admin/control/sendDailyReport — manual trigger for testing
  triggerDailyReport = async (req, res) => {
    try {
      // Optional: array of store IDs to limit the report to specific stores
      const { storeIds } = req.body;
      console.log("⚙️ Manual daily report trigger initiated...", storeIds?.length ? `(${storeIds.length} stores selected)` : "(all stores)");
      const result = await this.runDailyReport(storeIds || null);
      return responseHandler.success(res, result, "Daily report triggered successfully");
    } catch (error) {
      console.error("❌ triggerDailyReport error:", error.message);
      return responseHandler.serverError(res, "Failed to trigger daily report");
    }
  };

  // Internal — called by cron at 8 PM daily, or manually with optional storeIds filter
  runDailyReport = async (storeIds = null) => {
    console.log("📊 Starting daily store report run...");
    console.log(`⏰ Execution time: ${new Date().toISOString()}`);

    const results = {
      sent: 0,
      failed: 0,
      skipped: 0,
      stores: [],
      filteringStats: {
        totalInDB: 0,
        activeStatus: 0,
        withSubscription: 0,
        subscriptionValid: 0,
        withUsers: 0,
        withEmails: 0,
        manualFilter: 0,
      },
    };

    try {
      // DIAGNOSTIC STEP 1: Count total stores
      const totalStores = await storeModel.countDocuments();
      results.filteringStats.totalInDB = totalStores;
      console.log(`📋 Total stores in database: ${totalStores}`);

      // DIAGNOSTIC STEP 2: Count active stores
      const activeCount = await storeModel.countDocuments({ status: "active" });
      results.filteringStats.activeStatus = activeCount;
      console.log(`✅ Stores with status='active': ${activeCount}`);

      // DIAGNOSTIC STEP 3: Check subscription status
      const now = new Date();
      const withSubscription = await storeModel.countDocuments({
        status: "active",
        subscriptionEndDate: { $exists: true },
      });
      results.filteringStats.withSubscription = withSubscription;
      console.log(`📅 Active stores with subscription: ${withSubscription}`);

      const validSubscription = await storeModel.countDocuments({
        status: "active",
        subscriptionEndDate: { $gte: now },
      });
      results.filteringStats.subscriptionValid = validSubscription;
      console.log(`✅ Active stores with valid subscription: ${validSubscription}`);

      // DIAGNOSTIC STEP 4: Check stores with users
      const withUsers = await storeModel.countDocuments({
        status: "active",
        user: { $exists: true, $ne: [] },
      });
      results.filteringStats.withUsers = withUsers;
      console.log(`👥 Active stores with users assigned: ${withUsers}`);

      // Build query — either all active stores, or a specific subset
      const query = { status: "active" };
      if (storeIds && storeIds.length > 0) {
        query._id = { $in: storeIds };
        results.filteringStats.manualFilter = storeIds.length;
      }

      const stores = await storeModel
        .find(query)
        .populate("user", "email name")
        .select("name type url user status subscriptionStartDate subscriptionEndDate");

      console.log(`📋 Found ${stores.length} store(s) after query (active + optional manual filter)`);

      // DIAGNOSTIC STEP 5: Analyze each store
      const skippedReasons = {
        noUsers: [],
        noEmails: [],
        expiredSubscription: [],
        deactivated: [],
      };

      for (const store of stores) {
        try {
          const storeInfo = {
            id: store._id.toString(),
            name: store.name,
            status: store.status,
            subscriptionEnd: store.subscriptionEndDate,
            userCount: store.user?.length || 0,
          };

          // Check 1: Status verification (should be caught by query, but double-check)
          if (store.status !== "active") {
            console.warn(`⚠️ Store "${store.name}" has status "${store.status}" - skipping`);
            skippedReasons.deactivated.push(store.name);
            results.skipped++;
            results.stores.push({
              store: store.name,
              status: "skipped",
              reason: `status is ${store.status}`,
              details: storeInfo,
            });
            continue;
          }

          // Check 2: Subscription expiry
          if (store.subscriptionEndDate && new Date(store.subscriptionEndDate) < now) {
            console.warn(`⚠️ Store "${store.name}" has expired subscription (${store.subscriptionEndDate}) - skipping`);
            skippedReasons.expiredSubscription.push(store.name);
            results.skipped++;
            results.stores.push({
              store: store.name,
              status: "skipped",
              reason: `subscription expired on ${store.subscriptionEndDate}`,
              details: storeInfo,
            });
            continue;
          }

          // Check 3: User array population
          if (!store.user || store.user.length === 0) {
            console.warn(`⚠️ Store "${store.name}" has no assigned users - skipping`);
            skippedReasons.noUsers.push(store.name);
            results.skipped++;
            results.stores.push({
              store: store.name,
              status: "skipped",
              reason: "no assigned users",
              details: storeInfo,
            });
            continue;
          }

          // Collect email addresses from assigned users
          const toEmails = (store.user || [])
            .map((u) => (typeof u === "object" ? u.email : null))
            .filter(Boolean);

          storeInfo.emails = toEmails;

          // Check 4: Email availability
          if (!toEmails.length) {
            console.warn(`⚠️ Store "${store.name}" has ${store.user.length} user(s) but no valid emails - skipping`);
            console.warn(`   Users: ${store.user.map((u) => u.name || u._id).join(", ")}`);
            skippedReasons.noEmails.push(store.name);
            results.skipped++;
            results.stores.push({
              store: store.name,
              status: "skipped",
              reason: "no user emails",
              details: storeInfo,
            });
            continue;
          }

          console.log(`✅ Processing store "${store.name}" - ${toEmails.length} recipient(s): ${toEmails.join(", ")}`);

          // Get today's analytics summary
          const stats = await getDailyStoreSummary(store._id);

          // Send email
          const sent = await mailController.sendDailyStoreReport({
            toEmails,
            storeName: store.name,
            storeType: store.type,
            stats,
          });

          if (sent) {
            results.sent++;
            results.stores.push({
              store: store.name,
              status: "sent",
              recipients: toEmails.length,
              emails: toEmails,
              details: storeInfo,
            });
            console.log(`✅ Report sent to "${store.name}"`);
          } else {
            results.failed++;
            results.stores.push({
              store: store.name,
              status: "failed",
              reason: "mail transport error",
              details: storeInfo,
            });
            console.error(`❌ Failed to send report to "${store.name}"`);
          }

          // Rate limiting: 1.5s delay between stores to avoid Gmail throttling
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } catch (storeError) {
          console.error(`❌ Failed to process store "${store.name}":`, storeError.message);
          results.failed++;
          results.stores.push({
            store: store.name,
            status: "failed",
            reason: storeError.message,
          });
        }
      }

      // DIAGNOSTIC SUMMARY
      console.log("\n" + "=".repeat(80));
      console.log("📊 DAILY REPORT EXECUTION SUMMARY");
      console.log("=".repeat(80));
      console.log(`Total stores in DB:              ${results.filteringStats.totalInDB}`);
      console.log(`Active status:                    ${results.filteringStats.activeStatus}`);
      console.log(`With subscription:                ${results.filteringStats.withSubscription}`);
      console.log(`With valid subscription:          ${results.filteringStats.subscriptionValid}`);
      console.log(`With assigned users:              ${results.filteringStats.withUsers}`);
      console.log(`Queried for processing:           ${stores.length}`);
      console.log("-".repeat(80));
      console.log(`✅ Successfully sent:             ${results.sent}`);
      console.log(`❌ Failed:                        ${results.failed}`);
      console.log(`⏭️  Skipped:                       ${results.skipped}`);
      console.log("-".repeat(80));

      if (skippedReasons.noUsers.length > 0) {
        console.log(`\n⚠️ Skipped (no users): ${skippedReasons.noUsers.length} stores`);
        console.log(skippedReasons.noUsers.join(", "));
      }
      if (skippedReasons.noEmails.length > 0) {
        console.log(`\n⚠️ Skipped (no emails): ${skippedReasons.noEmails.length} stores`);
        console.log(skippedReasons.noEmails.join(", "));
      }
      if (skippedReasons.expiredSubscription.length > 0) {
        console.log(`\n⚠️ Skipped (expired subscription): ${skippedReasons.expiredSubscription.length} stores`);
        console.log(skippedReasons.expiredSubscription.join(", "));
      }
      if (skippedReasons.deactivated.length > 0) {
        console.log(`\n⚠️ Skipped (deactivated): ${skippedReasons.deactivated.length} stores`);
        console.log(skippedReasons.deactivated.join(", "));
      }
      console.log("=".repeat(80) + "\n");

      return results;
    } catch (error) {
      console.error("❌ runDailyReport fatal error:", error.message);
      throw error;
    }
  };

  // GET /admin/control/reportSchedule — returns current daily report schedule setting
  getReportSchedule = async (req, res) => {
    try {
      const settings = await adminSettingsModel.getSettings();
      return responseHandler.success(
        res,
        { hour: settings.reportScheduleHour, minute: settings.reportScheduleMinute },
        "Report schedule fetched successfully"
      );
    } catch (error) {
      console.error("❌ getReportSchedule error:", error.message);
      return responseHandler.serverError(res, "Failed to fetch report schedule");
    }
  };

  // PUT /admin/control/reportSchedule — updates schedule and live-reschedules the cron
  updateReportSchedule = async (req, res) => {
    try {
      const { hour, minute } = req.body;

      if (
        hour === undefined ||
        minute === undefined ||
        typeof hour !== "number" ||
        typeof minute !== "number" ||
        hour < 0 || hour > 23 ||
        minute < 0 || minute > 59
      ) {
        return responseHandler.error(res, "Valid hour (0-23) and minute (0-59) are required");
      }

      const settings = await adminSettingsModel.getSettings();
      settings.reportScheduleHour = hour;
      settings.reportScheduleMinute = minute;
      await settings.save();

      // Live-reschedule the cron without restarting the server
      const { rescheduleReport } = require("../config/cornJob");
      rescheduleReport(hour, minute);

      const pad = (n) => String(n).padStart(2, "0");
      console.log(`✅ Daily report schedule updated to ${pad(hour)}:${pad(minute)}`);
      return responseHandler.success(
        res,
        { hour, minute },
        `Daily report rescheduled to ${pad(hour)}:${pad(minute)}`
      );
    } catch (error) {
      console.error("❌ updateReportSchedule error:", error.message);
      return responseHandler.serverError(res, "Failed to update report schedule");
    }
  };

  // GET /admin/control/expiryNotificationSchedule — returns current expiry notification schedule
  getExpiryNotificationSchedule = async (req, res) => {
    try {
      const settings = await adminSettingsModel.getSettings();
      return responseHandler.success(
        res,
        {
          hour: settings.expiryNotificationHour || 9,
          minute: settings.expiryNotificationMinute || 0,
        },
        "Expiry notification schedule fetched successfully"
      );
    } catch (error) {
      console.error("❌ getExpiryNotificationSchedule error:", error.message);
      return responseHandler.serverError(res, "Failed to fetch expiry notification schedule");
    }
  };

  // PUT /admin/control/expiryNotificationSchedule — updates schedule and live-reschedules the cron
  updateExpiryNotificationSchedule = async (req, res) => {
    try {
      const { hour, minute } = req.body;

      if (
        hour === undefined ||
        minute === undefined ||
        typeof hour !== "number" ||
        typeof minute !== "number" ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
      ) {
        return responseHandler.error(res, "Valid hour (0-23) and minute (0-59) are required");
      }

      const settings = await adminSettingsModel.getSettings();
      settings.expiryNotificationHour = hour;
      settings.expiryNotificationMinute = minute;
      await settings.save();

      // Live-reschedule the cron without restarting the server
      const { rescheduleExpiryNotification } = require("../config/cornJob");
      await rescheduleExpiryNotification(hour, minute);

      const pad = (n) => String(n).padStart(2, "0");
      console.log(`✅ Expiry notification schedule updated to ${pad(hour)}:${pad(minute)}`);
      return responseHandler.success(
        res,
        { hour, minute },
        `Expiry notification rescheduled to ${pad(hour)}:${pad(minute)}`
      );
    } catch (error) {
      console.error("❌ updateExpiryNotificationSchedule error:", error.message);
      return responseHandler.serverError(res, "Failed to update expiry notification schedule");
    }
  };

  // POST /admin/control/sendExpiryNotificationNow — manual trigger with optional store selection
  sendExpiryNotificationNow = async (req, res) => {
    try {
      const { storeIds } = req.body;
      console.log("📧 Manual expiry notification trigger requested", storeIds ? `for ${storeIds.length} store(s)` : "for all stores");

      const now = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(now.getDate() + 7);
      sevenDaysFromNow.setHours(23, 59, 59, 999);

      // Build query - filter by storeIds if provided
      const query = {
        status: "active",
        subscriptionEndDate: {
          $gte: now,
          $lte: sevenDaysFromNow,
        },
      };

      if (storeIds && storeIds.length > 0) {
        query._id = { $in: storeIds };
      }

      const expiringStores = await storeModel.find(query).populate("user", "email").lean();

      console.log(`Found ${expiringStores.length} stores with expiring subscriptions`);

      const results = {
        total: expiringStores.length,
        sent: 0,
        failed: 0,
        skipped: 0,
        stores: [],
      };

      for (const store of expiringStores) {
        try {
          const toEmails = (store.user || []).map((u) => u.email).filter(Boolean);

          if (toEmails.length === 0) {
            results.skipped++;
            results.stores.push({ store: store.name, status: "skipped", reason: "No email addresses" });
            continue;
          }

          const endDate = new Date(store.subscriptionEndDate);
          const timeDiff = endDate.getTime() - now.getTime();
          const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

          const visitAnalyticsService = require("../services/visitAnalyticsService");
          const storeMetrics = await visitAnalyticsService.getDailyStoreSummary(store._id);

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
          results.stores.push({
            store: store.name,
            status: "sent",
            recipients: toEmails.length,
            daysRemaining,
          });
        } catch (error) {
          console.error(`❌ Failed to send expiry notification for ${store.name}:`, error);
          results.failed++;
          results.stores.push({ store: store.name, status: "failed", reason: error.message });
        }
      }

      console.log("✅ Manual expiry notification completed:", JSON.stringify(results, null, 2));

      return responseHandler.success(res, results, "Expiry notifications processed successfully");
    } catch (error) {
      console.error("❌ sendExpiryNotificationNow error:", error.message);
      return responseHandler.serverError(res, "Failed to send expiry notifications");
    }
  };

  // Internal — called by cron every minute to process scheduled events
  processScheduledEvents = async () => {
    try {
      const now = new Date();
      const pendingEvents = await adminEventModel
        .find({
          status: "scheduled",
          scheduledAt: { $lte: now },
        })
        .populate({
          path: "targetStores",
          select: "name url type user",
          populate: { path: "user", select: "email name" },
        });

      if (!pendingEvents.length) return;

      console.log(`📅 Processing ${pendingEvents.length} scheduled event(s)...`);

      for (const event of pendingEvents) {
        try {
          // Collect all user emails across all target stores (deduplicated)
          const emailSet = new Set();
          for (const store of event.targetStores) {
            for (const u of store.user || []) {
              const email = typeof u === "object" ? u.email : null;
              if (email) emailSet.add(email);
            }
          }

          const toEmails = Array.from(emailSet);

          if (!toEmails.length) {
            console.warn(`⚠️ Event "${event.title}" has no recipient emails — marking failed`);
            event.status = "failed";
            event.failureReason = "No recipient emails found for target stores";
            await event.save();
            continue;
          }

          const sent = await mailController.sendEventNotification({
            toEmails,
            event: {
              title: event.title,
              description: event.description,
              type: event.type,
              scheduledAt: event.scheduledAt,
            },
          });

          if (sent) {
            event.status = "sent";
            event.sentAt = new Date();
            console.log(`✅ Event "${event.title}" sent to ${toEmails.length} recipient(s)`);
          } else {
            event.status = "failed";
            event.failureReason = "Mail transport returned false";
            console.error(`❌ Event "${event.title}" failed to send`);
          }

          await event.save();
        } catch (eventError) {
          console.error(`❌ Failed to process event "${event.title}":`, eventError.message);
          try {
            event.status = "failed";
            event.failureReason = eventError.message;
            await event.save();
          } catch (_) {}
        }
      }
    } catch (error) {
      console.error("❌ processScheduledEvents error:", error.message);
    }
  };
}

module.exports = new AdminControlController();
