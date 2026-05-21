const mongoose = require("mongoose");
const response = require("../utils/responseHandler");
const { getPaginationParams } = require("../utils/paginationHelper");
const visitAnalyticsService = require("../services/visitAnalyticsService");
const CustomerAnalytics = require("../models/analytics_model/customerAnalyticsModel");
const PointsHistory = require("../models/pointsHistoryModel");
const CustomerOutletPoints = require("../models/customerOutletPointsModel");
const L5PointsTransaction = require("../models/l5PointsTransactionModel");
const Customer = require("../models/customerModel");

class VisitAnalyticsController {
  // GET /api/visitAnalytics/summary/:storeId
  async getVisitSummary(req, res) {
    try {
      const { storeId } = req.params;
      const { startDate, endDate, outletId } = req.query;
      const data = await visitAnalyticsService.getSummaryStats(storeId, startDate, endDate, outletId);
      return response.success(res, data, "Summary fetched successfully");
    } catch (error) {
      console.error("getVisitSummary error:", error);
      return response.serverError(res, error.message);
    }
  }

  // GET /api/visitAnalytics/segments/:storeId
  async getCustomerSegments(req, res) {
    try {
      const { storeId } = req.params;
      const { outletId, startDate, endDate } = req.query;
      const data = await visitAnalyticsService.getSegmentBreakdown(storeId, outletId, startDate, endDate);
      return response.success(res, data, "Segments fetched successfully");
    } catch (error) {
      console.error("getCustomerSegments error:", error);
      return response.serverError(res, error.message);
    }
  }

  // GET /api/visitAnalytics/lastVisitDistribution/:storeId
  async getLastVisitDistribution(req, res) {
    try {
      const { storeId } = req.params;
      const { outletId, startDate, endDate } = req.query;
      const data = await visitAnalyticsService.getLastVisitDistribution(storeId, outletId, startDate, endDate);
      return response.success(res, data, "Last visit distribution fetched successfully");
    } catch (error) {
      console.error("getLastVisitDistribution error:", error);
      return response.serverError(res, error.message);
    }
  }

  // GET /api/visitAnalytics/retention/:storeId
  async getRetentionMetrics(req, res) {
    try {
      const { storeId } = req.params;
      const data = await visitAnalyticsService.getRetentionData(storeId);
      return response.success(res, data, "Retention metrics fetched successfully");
    } catch (error) {
      console.error("getRetentionMetrics error:", error);
      return response.serverError(res, error.message);
    }
  }

  // GET /api/visitAnalytics/outlets/:storeId
  async getOutletPerformance(req, res) {
    try {
      const { storeId } = req.params;
      const data = await visitAnalyticsService.getOutletStats(storeId);
      return response.success(res, data, "Outlet performance fetched successfully");
    } catch (error) {
      console.error("getOutletPerformance error:", error);
      return response.serverError(res, error.message);
    }
  }

  // GET /api/visitAnalytics/trends/:storeId
  async getVisitTrends(req, res) {
    try {
      const { storeId } = req.params;
      const { period = "30", startDate, endDate, outletId } = req.query;
      const data = await visitAnalyticsService.getVisitTrends(storeId, period, startDate, endDate, outletId);
      return response.success(res, data, "Visit trends fetched successfully");
    } catch (error) {
      console.error("getVisitTrends error:", error);
      return response.serverError(res, error.message);
    }
  }

  // GET /api/visitAnalytics/pointsCollected/:storeId
  async getPointsCollected(req, res) {
    try {
      const { storeId } = req.params;
      const { timePeriod, outletId } = req.query;

      // Calculate date range based on time period
      let startDate;
      let endDate;

      switch (timePeriod) {
        case "today":
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setHours(23, 59, 59, 999);
          break;
        case "yesterday":
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setDate(endDate.getDate() - 1);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "last7days":
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setHours(23, 59, 59, 999);
          break;
        case "last30days":
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setHours(23, 59, 59, 999);
      }

      // Build query for PointsHistory
      const query = {
        store: new mongoose.Types.ObjectId(storeId),
        createdAt: { $gte: startDate, $lte: endDate },
        points: { $gt: 0 },
      };

      if (outletId) {
        query.outlet = outletId; // outlet is stored as string
      }

      console.log('[getPointsCollected] Query:', JSON.stringify(query, null, 2));
      console.log('[getPointsCollected] Time period:', timePeriod, 'Start:', startDate, 'End:', endDate);

      // Aggregate total points
      const result = await Po3ate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalPoints: { $sum: "$points" },
          },
        },
      ]);

      console.log('[getPointsCollected] Aggregation result:', result);

      const totalPoints = result.length > 0 ? result[0].totalPoints : 0;

      return response.success(res, { totalPoints, timePeriod, startDate, endDate }, "Points collected fetched successfully");
    } catch (error) {
      console.error("getPointsCollected error:", error);
      return response.serverError(res, error.message);
    }
  }

  // GET /api/visitAnalytics/customers/:storeId
  async getCustomersBySegment(req, res) {
    try {
      const { storeId } = req.params;
      const { segment, search, lastVisitDays, outletId, includeAll, startDate, endDate } = req.query;
      const { page, limit, skip } = getPaginationParams(req);

      // If includeAll is true, fetch all customers including those without analytics
      // (i.e. registered customers who have never visited/earned points). This applies
      // to all store formats including L5, so "All Store Customers" in messaging always
      // selects every registered customer regardless of visit history.
      let customers, total;
      if (includeAll === 'true') {
        ({ customers, total } = await visitAnalyticsService.getAllCustomers(storeId, {
          segment,
          search,
          lastVisitDays,
          startDate,
          endDate,
          outletId,
          page,
          limit,
          skip,
        }));
      } else {
        ({ customers, total } = await visitAnalyticsService.getCustomerList(storeId, {
          segment,
          search,
          lastVisitDays,
          startDate,
          endDate,
          outletId,
          page,
          limit,
          skip,
        }));
      }

      return response.paginated(res, customers, page, limit, total, "Customers fetched successfully");
    } catch (error) {
      console.error("getCustomersBySegment error:", error);
      return response.serverError(res, error.message);
    }
  }

  // GET /api/visitAnalytics/customer/:customerId
  async getCustomerVisitHistory(req, res) {
    try {
      const { customerId } = req.params;
      const { page, limit, skip } = getPaginationParams(req);

      const data = await visitAnalyticsService.getCustomerHistory(customerId, { page, limit, skip });

      if (!data) {
        return response.notFound(res, "No analytics found for this customer");
      }

      return response.success(res, data, "Customer history fetched successfully");
    } catch (error) {
      console.error("getCustomerVisitHistory error:", error);
      return response.serverError(res, error.message);
    }
  }

  // POST /api/visitAnalytics/backfill/:storeId
  async backfillAnalytics(req, res) {
    try {
      const { storeId } = req.params;
      const storeObjectId = new mongoose.Types.ObjectId(storeId);

      // Get all unique customers with point transactions
      const customerTransactions = await PointsHistory.aggregate([
        { $match: { store: storeObjectId } },
        { $sort: { createdAt: 1 } },
        {
          $group: {
            _id: "$customer",
            transactions: {
              $push: { date: "$createdAt", points: "$points", outlet: "$outlet" },
            },
            totalPoints: { $sum: "$points" },
            visitCount: { $sum: 1 },
            firstVisit: { $first: "$createdAt" },
            lastVisit: { $last: "$createdAt" },
          },
        },
      ]);

      let processed = 0;
      let created = 0;
      let updated = 0;

      for (const ct of customerTransactions) {
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
        const result = await CustomerAnalytics.findOneAndUpdate(
          { customer: ct._id, store: storeObjectId },
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

        if (result.createdAt === result.updatedAt) created++;
        else updated++;
        processed++;
      }

      return response.success(res, { processed, created, updated }, "Backfill completed");
    } catch (error) {
      console.error("backfillAnalytics error:", error);
      return response.serverError(res, error.message);
    }
  }

  // TEST ENDPOINT - Manual analytics update trigger
  async testUpdateAnalytics(req, res) {
    try {
      const { customerId, storeId, outlet, points } = req.body;
      
      if (!customerId || !storeId || !points) {
        return response.badRequest(res, "customerId, storeId, and points are required");
      }

      console.log(`[TEST] Manually triggering updateVisitAnalytics:`, { customerId, storeId, outlet, points });
      
      const result = await visitAnalyticsService.updateVisitAnalytics(
        customerId,
        storeId,
        outlet || null,
        parseFloat(points)
      );

      if (result) {
        console.log(`[TEST] Success! Updated analytics:`, result);
        return response.success(res, result, "Analytics updated successfully");
      } else {
        console.log(`[TEST] Function returned null (points might be <= 0)`);
        return response.success(res, null, "Update skipped (points <= 0 or error)");
      }
    } catch (error) {
      console.error("[TEST] Error updating analytics:", error);
      return response.serverError(res, error.message);
    }
  }

  // DELETE /api/visitAnalytics/outlet/:storeId/:outletId/visit-history
  async deleteOutletVisitHistory(req, res) {
    try {
      const { storeId, outletId } = req.params;

      // Validate ObjectIds
      if (!mongoose.Types.ObjectId.isValid(storeId) || !mongoose.Types.ObjectId.isValid(outletId)) {
        return response.badRequest(res, "Invalid store or outlet ID");
      }

      // Check authorization (admin or store owner)
      const Store = require("../models/storeModel");
      const store = await Store.findById(storeId);
      
      if (!store) {
        return response.notFound(res, "Store not found");
      }

      // Check if user is admin or one of the store owners
      const isAdmin = req.user.role === "admin";
      const isOwner = store.user && store.user.some(userId => userId.equals(req.user._id));
      
      if (!isAdmin && !isOwner) {
        return response.unauthorized(res, "You are not authorized to reset points for this outlet");
      }

      // Verify store is L5 format
      if (store.loyaltyCard?.format !== "L5") {
        return response.badRequest(res, "This operation is only available for L5 format stores");
      }

      // Verify outlet belongs to store
      const outletExists = store.outlets?.some(outlet => outlet._id.toString() === outletId);
      if (!outletExists) {
        return response.notFound(res, "Outlet not found in this store");
      }

      console.log(`[RESET OUTLET] Starting reset for outlet ${outletId} in store ${storeId}`);

      // Get outlet details to get the location/name string identifier
      const Outlet = require("../models/outletModel");
      const outletDoc = await Outlet.findById(outletId);
      if (!outletDoc) {
        return response.notFound(res, "Outlet document not found");
      }
      const outletIdentifier = outletDoc.location || outletDoc.name;
      console.log(`[RESET OUTLET] Outlet identifier: ${outletIdentifier}`);

      // Step 1: Set points to 0 in L5PointsTransaction only (this affects the analytics display)
      console.log(`[RESET OUTLET] Step 1: Setting points to 0 in L5PointsTransaction records...`);
      const transactionUpdateResult = await L5PointsTransaction.updateMany(
        {
          store: storeId,
          outlet: outletId
        },
        {
          $set: { points: 0 }
        }
      );
      console.log(`[RESET OUTLET] Step 1 Complete: Updated ${transactionUpdateResult.modifiedCount} L5 transactions to 0`);

      // Step 2: Set totalPointsEarned to 0 in CustomerAnalytics (keep all visit data)
      console.log(`[RESET OUTLET] Step 2: Setting totalPointsEarned to 0 in CustomerAnalytics...`);
      const analyticsUpdateResult = await CustomerAnalytics.updateMany(
        {
          store: storeId
        },
        {
          $set: {
            totalPointsEarned: 0
          }
        }
      );
      console.log(`[RESET OUTLET] Step 2 Complete: Updated ${analyticsUpdateResult.modifiedCount} analytics records`);

      console.log(`[RESET OUTLET] SUMMARY: l5Transactions=${transactionUpdateResult.modifiedCount}, analyticsUpdated=${analyticsUpdateResult.modifiedCount}`);

      return response.success(res, {
        transactionsUpdated: transactionUpdateResult.modifiedCount,
        analyticsUpdated: analyticsUpdateResult.modifiedCount,
        storeId,
        outletId
      }, `Successfully reset L5 points earned display: ${transactionUpdateResult.modifiedCount} records updated`);
      
    } catch (error) {
      console.error("deleteOutletVisitHistory error:", error);
      return response.serverError(res, error.message);
    }
  }
}

module.exports = new VisitAnalyticsController();
