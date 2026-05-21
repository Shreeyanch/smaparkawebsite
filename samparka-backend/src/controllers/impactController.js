const mongoose = require("mongoose");
const response = require("../utils/responseHandler");
const Customer = require("../models/customerModel");
const PointsHistory = require("../models/pointsHistoryModel");
const Redemption = require("../models/redemptionModel");
const L5PointsTransaction = require("../models/l5PointsTransactionModel");
const L5Redemption = require("../models/l5RedemptionModel");
const L5MonthlyLeaderboard = require("../models/l5MonthlyLeaderboardModel");
const L5Voucher = require("../models/l5VoucherModel");
const Campaign = require("../models/campaignModel");
const Reservation = require("../models/reservationModel");
const Reward = require("../models/rewardModel");
const WhatsappOutgoing = require("../models/WhatsappOutgoing");
const Template = require("../models/whatsappTemplate");
const Notification = require("../models/notificationModel");
const Store = require("../models/storeModel");
const CustomerAnalytics = require("../models/analytics_model/customerAnalyticsModel");
const Order = require("../models/orderModel");
const Offer = require("../models/offerModel");
const WheelSegment = require("../models/wheelSegment");

/**
 * Fixed benchmark assumptions (industry standards, shown transparently in the UI).
 * These represent the average time/cost saved per automated action versus doing it manually.
 */
const BENCHMARKS = {
  minutesPerTransaction: 3, // Manual ledger recording + customer lookup per transaction
  minutesPerAutomatedMsg: 2, // Staff time to manually compose & send one message
  minutesPerCampaignMsg: 2.5, // Per campaign recipient if done manually
  minutesPerReservation: 5, // Average phone-call reservation handling time
  minutesPerRegistration: 5, // Paper form data entry per new customer
  minutesPerBirthday: 3, // Manual birthday outreach per customer
  costPerPhysicalCard: 5, // NPR — design + print + lamination per card
  costPerMessageNPR: 1.5, // NPR — blended SMS/WhatsApp unit cost
};

class ImpactController {
  /**
   * GET /api/store/impact/:storeId
   * Returns full impact metrics for a store owner's dashboard.
   * Protected: authMiddleware (store owner or admin only).
   */
  async getImpact(req, res) {
    try {
      const { storeId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(storeId)) {
        return response.error(res, "Invalid store ID", 400);
      }

      const storeObjId = new mongoose.Types.ObjectId(storeId);

      // Ownership check + fetch store config (pointValue needed for liability calc)
      const store = await Store.findById(storeId)
        .lean()
        .select("user conversionRate pointValue services format price");
      if (!store) return response.notFound(res, "Store not found");

      if (req.user && req.user.role !== "admin") {
        const owns = store.user.some((uid) => uid.equals(req.user._id));
        if (!owns) return response.error(res, "Access denied", 403);
      }

      const now = new Date();
      const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);
      const sixMonthsAgo = new Date(now - 180 * 24 * 60 * 60 * 1000);
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // ─── Run all aggregations concurrently ───────────────────────────────────
      const [
        totalCustomers,
        customersWithDOB,
        transactionAgg,
        standardRedemptionAgg,
        l5RedemptionAgg,
        campaignAgg,
        totalReservations,
        activeRewards,
        whatsappMessageCount,
        notificationAgg,
        l5BillAgg,
        tierDistribution,
        atRiskAgg,
        // New metric groups
        returnBehaviorAgg,
        pointsLiabilityAgg,
        redemptionStatusAgg,
        campaignChannelAgg,
        gamificationAgg,
        memberGrowthAgg,
        ecommerceAgg,
        rewardValueDeliveredAgg,
        l5DiscountValueAgg,
        repeatRevenueAgg,
        rewardCatalogAgg,
      ] = await Promise.all([
        // 1. Total loyalty members
        Customer.countDocuments({ store: storeObjId }),

        // 2. Customers with birthday (birthday automation reach)
        Customer.countDocuments({
          store: storeObjId,
          dob: { $exists: true, $ne: null },
        }),

        // 3. Points transaction history — count + total points issued + redeemed
        PointsHistory.aggregate([
          { $match: { store: storeObjId } },
          {
            $group: {
              _id: null,
              totalTransactions: { $sum: 1 },
              totalPointsIssued: {
                $sum: { $cond: [{ $gt: ["$points", 0] }, "$points", 0] },
              },
              totalPointsRedeemed: {
                $sum: {
                  $cond: [{ $lt: ["$points", 0] }, { $abs: "$points" }, 0],
                },
              },
            },
          },
        ]),

        // 4. Standard reward redemptions (claimed OR instant validity — instant rewards
        //    never transition to "claimed"; any redemption record counts as used)
        Redemption.aggregate([
          { $match: { store: storeObjId } },
          {
            $lookup: {
              from: "rewards",
              localField: "reward",
              foreignField: "_id",
              as: "rewardData",
            },
          },
          {
            $unwind: {
              path: "$rewardData",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              $or: [
                { status: "claimed" },
                { "rewardData.validity": "instant" },
              ],
            },
          },
          { $count: "count" },
        ]),

        // 5. L5 redemption stats
        L5Redemption.aggregate([
          { $match: { store: storeObjId } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              totalPointsDeducted: { $sum: "$pointsDeducted" },
            },
          },
        ]),

        // 6. Campaign delivery stats (completed campaigns)
        Campaign.aggregate([
          { $match: { store: storeObjId, status: "completed" } },
          {
            $group: {
              _id: null,
              totalCampaigns: { $sum: 1 },
              totalSent: { $sum: "$sendSucceeded" },
              totalAttempted: { $sum: "$sendAttempted" },
              totalFailed: { $sum: "$sendFailed" },
            },
          },
        ]),

        // 7. Total reservations handled
        Reservation.countDocuments({ store: storeObjId }),

        // 8. Active rewards configured
        Reward.countDocuments({ store: storeObjId }),

        // 9. WhatsApp messages sent (from this store's approved templates)
        (async () => {
          const templates = await Template.find({ storeId: storeObjId })
            .select("_id")
            .lean();
          if (!templates.length) return 0;
          const templateIds = templates.map((t) => t._id);
          return WhatsappOutgoing.countDocuments({
            templateId: { $in: templateIds },
          });
        })(),

        // 10. Push notifications: distinct sends + total receivers reached
        Notification.aggregate([
          { $match: { store: storeObjId } },
          {
            $group: {
              _id: null,
              totalNotifications: { $sum: 1 },
              totalReceiversReached: { $sum: { $size: "$receivers" } },
            },
          },
        ]),

        // 11. L5 real purchase volume that flowed through the system
        L5PointsTransaction.aggregate([
          {
            $match: {
              store: storeObjId,
              transactionType: "earn",
              billAmount: { $exists: true, $gt: 0 },
            },
          },
          {
            $group: {
              _id: null,
              totalBillAmount: { $sum: "$billAmount" },
              transactionCount: { $sum: 1 },
            },
          },
        ]),

        // 12. Customer tier distribution
        Customer.aggregate([
          { $match: { store: storeObjId } },
          { $group: { _id: "$tier", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),

        // 13. At-risk campaign reach (campaigns targeting at_risk segment)
        Campaign.aggregate([
          {
            $match: {
              store: storeObjId,
              status: "completed",
              segments: "at_risk",
            },
          },
          {
            $group: {
              _id: null,
              campaigns: { $sum: 1 },
              reached: { $sum: "$sendSucceeded" },
            },
          },
        ]),

        // 14. Customer return behavior — uses CustomerAnalytics model
        CustomerAnalytics.aggregate([
          { $match: { store: storeObjId } },
          {
            $facet: {
              overall: [
                {
                  $group: {
                    _id: null,
                    // avg ignores nulls — so cond: null skips first-visit customers
                    storeAvgReturnDays: {
                      $avg: {
                        $cond: [
                          { $gt: ["$avgDaysBetweenVisits", 0] },
                          "$avgDaysBetweenVisits",
                          null,
                        ],
                      },
                    },
                    totalTracked: { $sum: 1 },
                    multiVisit: {
                      $sum: {
                        $cond: [{ $gte: ["$visitCount", 2] }, 1, 0],
                      },
                    },
                  },
                },
              ],
              bySegment: [
                {
                  $group: {
                    _id: "$segment",
                    count: { $sum: 1 },
                    avgReturnDays: { $avg: "$avgDaysBetweenVisits" },
                  },
                },
                { $sort: { count: -1 } },
              ],
            },
          },
        ]),

        // 15. Points liability — outstanding balance + dormancy detection
        Customer.aggregate([
          { $match: { store: storeObjId } },
          {
            $group: {
              _id: null,
              totalOutstandingPoints: { $sum: "$points" },
              customersWithPoints: {
                $sum: { $cond: [{ $gt: ["$points", 0] }, 1, 0] },
              },
              dormantCustomers: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $ne: ["$pointChangeDate", null] },
                        { $lt: ["$pointChangeDate", ninetyDaysAgo] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ]),

        // 16. Redemption status funnel (pending / claimed / expired)
        Redemption.aggregate([
          { $match: { store: storeObjId } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),

        // 17. Campaign channel + segment breakdown
        Campaign.aggregate([
          { $match: { store: storeObjId, status: "completed" } },
          {
            $facet: {
              byChannel: [
                {
                  $group: {
                    _id: "$channel",
                    campaigns: { $sum: 1 },
                    sent: { $sum: "$sendSucceeded" },
                    attempted: { $sum: "$sendAttempted" },
                  },
                },
                { $sort: { sent: -1 } },
              ],
              bySegment: [
                {
                  $unwind: {
                    path: "$segments",
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $group: {
                    _id: "$segments",
                    campaigns: { $sum: 1 },
                    reached: { $sum: "$sendSucceeded" },
                  },
                },
                { $sort: { reached: -1 } },
              ],
            },
          },
        ]),

        // 18. Gamification: Wheel segments + Offers + L5 Leaderboard (nested parallel)
        Promise.all([
          WheelSegment.aggregate([
            { $match: { store: storeObjId } },
            {
              $group: {
                _id: "$type",
                count: { $sum: 1 },
                active: { $sum: { $cond: ["$isActive", 1, 0] } },
              },
            },
          ]),
          Offer.aggregate([
            { $match: { store: storeObjId } },
            {
              $group: {
                _id: null,
                totalOffers: { $sum: 1 },
                activeOffers: {
                  $sum: { $cond: ["$isActive", 1, 0] },
                },
              },
            },
          ]),
          L5MonthlyLeaderboard.aggregate([
            {
              $match: {
                store: storeObjId,
                isQualified: true,
                year: currentYear,
                month: currentMonth,
              },
            },
            {
              $group: {
                _id: null,
                qualifiedCount: { $sum: 1 },
                monthlyWinners: {
                  $sum: { $cond: ["$isMonthlyWinner", 1, 0] },
                },
                coffeeHeroes: {
                  $sum: { $cond: ["$isCoffeeHero", 1, 0] },
                },
              },
            },
          ]),
        ]),

        // 20. Member growth — new sign-ups per month (last 6 months)
        Customer.aggregate([
          { $match: { store: storeObjId, createdAt: { $gte: sixMonthsAgo } } },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),

        // 19. E-commerce: Orders + L5 Vouchers (nested parallel)
        // Note: Order uses `storeId` field (not `store`)
        Promise.all([
          Order.aggregate([
            { $match: { storeId: storeObjId } },
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" },
                completedOrders: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
                  },
                },
              },
            },
          ]),
          L5Voucher.aggregate([
            { $match: { store: storeObjId } },
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
                totalAmount: { $sum: "$voucherAmount" },
              },
            },
          ]),
        ]),

        // NEW-A. Reward monetary value delivered: sum reward points for qualifying redemptions.
        // L4 rewards store cost in `pointCost`; all other formats use `points`.
        // We sum both fields per record (one will always be 0/null) so this works for all formats.
        Redemption.aggregate([
          { $match: { store: storeObjId } },
          {
            $lookup: {
              from: "rewards",
              localField: "reward",
              foreignField: "_id",
              as: "rw",
            },
          },
          { $unwind: { path: "$rw", preserveNullAndEmptyArrays: true } },
          {
            $match: {
              $or: [
                { status: "claimed" },
                { "rw.validity": "instant" },
              ],
            },
          },
          {
            $group: {
              _id: null,
              totalRewardPoints: {
                $sum: {
                  $add: [
                    {
                      $convert: {
                        input: "$rw.points",
                        to: "double",
                        onError: 0,
                        onNull: 0,
                      },
                    },
                    {
                      $convert: {
                        input: "$rw.pointCost",
                        to: "double",
                        onError: 0,
                        onNull: 0,
                      },
                    },
                  ],
                },
              },
            },
          },
        ]),

        // NEW-B. L5 discount value: NPR saved via % discounts (only when used at POS)
        L5Redemption.aggregate([
          {
            $match: {
              store: storeObjId,
              status: "used",
              billAmount: { $exists: true, $gt: 0 },
              discountPercentage: { $exists: true, $gt: 0 },
            },
          },
          {
            $group: {
              _id: null,
              totalDiscountValue: {
                $sum: {
                  $multiply: [
                    "$billAmount",
                    { $divide: ["$discountPercentage", 100] },
                  ],
                },
              },
            },
          },
        ]),

        // NEW-C1. Repeat customer revenue: split points earned by visit segment
        // CustomerAnalytics already tracks totalPointsEarned per customer
        CustomerAnalytics.aggregate([
          { $match: { store: storeObjId } },
          {
            $group: {
              _id: null,
              // Points earned by customers who visited 2+ times
              repeatCustomerPoints: {
                $sum: {
                  $cond: [
                    { $gte: ["$visitCount", 2] },
                    "$totalPointsEarned",
                    0,
                  ],
                },
              },
              // Points earned by first-time customers
              firstTimeCustomerPoints: {
                $sum: {
                  $cond: [
                    { $eq: ["$visitCount", 1] },
                    "$totalPointsEarned",
                    0,
                  ],
                },
              },
              // Average points earned per repeat customer (for avg spend calc)
              avgRepeatCustomerPoints: {
                $avg: {
                  $cond: [
                    { $gte: ["$visitCount", 2] },
                    "$totalPointsEarned",
                    null,
                  ],
                },
              },
            },
          },
        ]),

        // NEW-C. Reward catalog potential: sum all reward point costs for this store.
        // L4 rewards use `pointCost`; all other formats use `points`.
        // Match any reward that has either field, then sum both (one is always 0/null).
        Reward.aggregate([
          {
            $match: {
              store: storeObjId,
              $or: [
                { points: { $exists: true, $ne: null, $ne: "" } },
                { pointCost: { $exists: true, $ne: null, $ne: "" } },
              ],
            },
          },
          {
            $group: {
              _id: null,
              totalCatalogPoints: {
                $sum: {
                  $add: [
                    {
                      $convert: {
                        input: "$points",
                        to: "double",
                        onError: 0,
                        onNull: 0,
                      },
                    },
                    {
                      $convert: {
                        input: "$pointCost",
                        to: "double",
                        onError: 0,
                        onNull: 0,
                      },
                    },
                  ],
                },
              },
            },
          },
        ]),
      ]);

      // ─── Parse aggregation results (with safe defaults) ──────────────────────
      const txStats = transactionAgg[0] || {
        totalTransactions: 0,
        totalPointsIssued: 0,
      };
      const l5Red = l5RedemptionAgg[0] || {
        count: 0,
        totalPointsDeducted: 0,
      };
      const camp = campaignAgg[0] || {
        totalCampaigns: 0,
        totalSent: 0,
        totalAttempted: 0,
        totalFailed: 0,
      };
      const notif = notificationAgg[0] || {
        totalNotifications: 0,
        totalReceiversReached: 0,
      };
      const l5Bill = l5BillAgg[0] || {
        totalBillAmount: 0,
        transactionCount: 0,
      };
      const atRisk = atRiskAgg[0] || { campaigns: 0, reached: 0 };
      const standardRedemptionCount = standardRedemptionAgg[0]?.count || 0;

      const totalTransactions = txStats.totalTransactions;
      const totalRedemptions = standardRedemptionCount + l5Red.count;

      // All automated touch points (campaign + push + whatsapp)
      const totalMessagesSent =
        camp.totalSent + notif.totalReceiversReached + whatsappMessageCount;

      // ─── Time Saved Calculations (in minutes → hours) ─────────────────────────
      const timeBreakdown = {
        transactions: {
          minutes: totalTransactions * BENCHMARKS.minutesPerTransaction,
          count: totalTransactions,
          label: "Digital transactions tracked",
          benchmark: `${BENCHMARKS.minutesPerTransaction} min each`,
        },
        automatedMessages: {
          minutes: totalMessagesSent * BENCHMARKS.minutesPerAutomatedMsg,
          count: totalMessagesSent,
          label: "Automated messages sent",
          benchmark: `${BENCHMARKS.minutesPerAutomatedMsg} min each`,
        },
        campaignMessages: {
          minutes: camp.totalSent * BENCHMARKS.minutesPerCampaignMsg,
          count: camp.totalSent,
          label: "Campaign messages delivered",
          benchmark: `${BENCHMARKS.minutesPerCampaignMsg} min each`,
        },
        reservations: {
          minutes: totalReservations * BENCHMARKS.minutesPerReservation,
          count: totalReservations,
          label: "Digital reservations handled",
          benchmark: `${BENCHMARKS.minutesPerReservation} min each`,
        },
        customerRegistrations: {
          minutes: totalCustomers * BENCHMARKS.minutesPerRegistration,
          count: totalCustomers,
          label: "Customers enrolled digitally",
          benchmark: `${BENCHMARKS.minutesPerRegistration} min each`,
        },
        birthdayOutreach: {
          minutes: customersWithDOB * BENCHMARKS.minutesPerBirthday,
          count: customersWithDOB,
          label: "Automated birthday messages",
          benchmark: `${BENCHMARKS.minutesPerBirthday} min each`,
        },
      };

      const totalMinutesSaved = Object.values(timeBreakdown).reduce(
        (sum, b) => sum + b.minutes,
        0
      );
      const totalHoursSaved = Math.round(totalMinutesSaved / 60);
      const workingDaysSaved = Math.round(totalHoursSaved / 8);

      // ─── Cost Saved Calculations (NPR) ────────────────────────────────────────
      const costBreakdown = {
        physicalCards: {
          amount: totalCustomers * BENCHMARKS.costPerPhysicalCard,
          count: totalCustomers,
          label: "Physical loyalty cards eliminated",
          benchmark: `रु ${BENCHMARKS.costPerPhysicalCard} per card`,
        },
        messagingEquivalent: {
          amount: totalMessagesSent * BENCHMARKS.costPerMessageNPR,
          count: totalMessagesSent,
          label: "Messaging cost equivalent",
          benchmark: `रु ${BENCHMARKS.costPerMessageNPR} per message`,
        },
      };

      const totalCostSaved = Object.values(costBreakdown).reduce(
        (sum, b) => sum + b.amount,
        0
      );

      // ─── Universal loyalty-driven revenue (works for all store formats) ──────
      // conversionRate = points earned per NPR spent (e.g. 0.1 = 1pt per ₹10)
      const pointValue = parseFloat(store.pointValue || 0);
      const conversionRate = parseFloat(store.conversionRate || 0);
      const totalPointsRedeemedFromHistory = Math.round(
        txStats.totalPointsRedeemed || 0
      );

      // For L5 stores that don't set conversionRate, derive an effective rate
      // from actual bill amounts vs points issued so all metrics work universally.
      const effectiveConversionRate =
        conversionRate > 0
          ? conversionRate
          : txStats.totalPointsIssued > 0 && l5Bill.totalBillAmount > 0
          ? txStats.totalPointsIssued / l5Bill.totalBillAmount
          : 0;

      // Primary revenue figure: points-based for standard stores, bill-amount for L5
      const loyaltyTrackedRevenueNPR =
        effectiveConversionRate > 0
          ? Math.round(txStats.totalPointsIssued / effectiveConversionRate)
          : l5Bill.totalBillAmount > 0
          ? Math.round(l5Bill.totalBillAmount)
          : 0;

      // Effective point value in NPR — works for ALL store formats:
      // If the store has pointValue configured, use it directly.
      // Otherwise derive it from the tracked revenue ÷ total points issued ratio
      // so that all point-value-backed metrics (liability, wallet, reward value, etc.)
      // produce meaningful numbers even when pointValue is left unconfigured (common for L5).
      const effectivePointValue =
        pointValue > 0
          ? pointValue
          : txStats.totalPointsIssued > 0 && loyaltyTrackedRevenueNPR > 0
          ? loyaltyTrackedRevenueNPR / txStats.totalPointsIssued
          : 0;

      const avgSpendPerTransaction =
        totalTransactions > 0 && loyaltyTrackedRevenueNPR > 0
          ? Math.round(loyaltyTrackedRevenueNPR / totalTransactions)
          : 0;
      const avgSpendPerMember =
        totalCustomers > 0 && loyaltyTrackedRevenueNPR > 0
          ? Math.round(loyaltyTrackedRevenueNPR / totalCustomers)
          : 0;
      // Redemption savings = what redeemed points were worth in NPR.
      // Uses effectivePointValue so this works even when pointValue is unconfigured.
      const redemptionSavingsNPR = Math.round(
        totalPointsRedeemedFromHistory * effectivePointValue
      );

      // ─── Campaign delivery rate ───────────────────────────────────────────────
      const deliveryRate =
        camp.totalAttempted > 0
          ? Math.round((camp.totalSent / camp.totalAttempted) * 100)
          : 0;

      // ─── Dormancy recovery rate ────────────────────────────────────────────────
      const dormancyRecoveryRate =
        (atRisk.reached || 0) > 0 && dormantCustomers > 0
          ? Math.round((atRisk.reached / dormantCustomers) * 100)
          : 0;

      // ─── Member growth by month ────────────────────────────────────────────────
      const memberGrowthByMonth = (memberGrowthAgg || []).map((m) => ({
        year: m._id.year,
        month: m._id.month,
        count: m.count,
      }));

      // ─── Parse NEW aggregation results ────────────────────────────────────────

      // 14. Return behavior
      const returnFacet = returnBehaviorAgg[0] || { overall: [], bySegment: [] };
      const returnOverall = returnFacet.overall[0] || {
        storeAvgReturnDays: 0,
        totalTracked: 0,
        multiVisit: 0,
      };
      const storeAvgReturnDays = Math.round(
        returnOverall.storeAvgReturnDays || 0
      );
      const totalTrackedCustomers = returnOverall.totalTracked || 0;
      const multiVisitCustomers = returnOverall.multiVisit || 0;
      // Use totalCustomers as denominator: "of all members, what % returned?"
      const retentionRate =
        totalCustomers > 0
          ? Math.round((multiVisitCustomers / totalCustomers) * 100)
          : 0;
      const visitSegmentBreakdown = (returnFacet.bySegment || []).map((s) => ({
        segment: s._id,
        count: s.count,
        avgReturnDays: s.avgReturnDays ? Math.round(s.avgReturnDays) : null,
      }));

      // 15. Points liability
      const liabilityData = pointsLiabilityAgg[0] || {
        totalOutstandingPoints: 0,
        customersWithPoints: 0,
        dormantCustomers: 0,
      };
      const totalOutstandingPoints = Math.round(
        liabilityData.totalOutstandingPoints || 0
      );
      const customersWithPoints = liabilityData.customersWithPoints || 0;
      const dormantCustomers = liabilityData.dormantCustomers || 0;
      const outstandingLiabilityNPR = Math.round(
        totalOutstandingPoints * effectivePointValue
      );

      // 16. Redemption status funnel
      const redemptionByStatus = (redemptionStatusAgg || []).reduce(
        (acc, r) => {
          acc[r._id] = r.count;
          return acc;
        },
        {}
      );
      const totalRedemptionAttempts =
        (redemptionByStatus.pending || 0) +
        (redemptionByStatus.claimed || 0) +
        (redemptionByStatus.expired || 0);
      const redemptionConversionRate =
        totalRedemptionAttempts > 0
          ? Math.round(
              ((redemptionByStatus.claimed || 0) / totalRedemptionAttempts) *
                100
            )
          : 0;

      // 17. Campaign channel breakdown
      const channelFacet = campaignChannelAgg[0] || {
        byChannel: [],
        bySegment: [],
      };
      const campaignChannelBreakdown = (channelFacet.byChannel || []).map(
        (ch) => ({
          channel: ch._id,
          campaigns: ch.campaigns,
          sent: ch.sent,
          attempted: ch.attempted,
          deliveryRate:
            ch.attempted > 0
              ? Math.round((ch.sent / ch.attempted) * 100)
              : 0,
        })
      );
      const campaignSegmentBreakdown = channelFacet.bySegment || [];

      // 18. Gamification
      const [wheelAgg, offerAgg, leaderboardAgg] = gamificationAgg;
      const wheelSegmentBreakdown = wheelAgg || [];
      const totalWheelSegments = wheelSegmentBreakdown.reduce(
        (s, w) => s + w.count,
        0
      );
      const activeWheelSegments = wheelSegmentBreakdown.reduce(
        (s, w) => s + (w.active || 0),
        0
      );
      const offerStats = offerAgg[0] || { totalOffers: 0, activeOffers: 0 };
      const totalOffers = offerStats.totalOffers || 0;
      const activeOffers = offerStats.activeOffers || 0;
      const leaderboardStats = leaderboardAgg[0] || null;

      // 19. E-commerce
      const [orderAgg, voucherAgg] = ecommerceAgg;
      const orderStats = orderAgg[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        completedOrders: 0,
      };
      const voucherByStatus = (voucherAgg || []).reduce((acc, v) => {
        acc[v._id] = { count: v.count, amount: v.totalAmount };
        return acc;
      }, {});
      const voucherUsed = voucherByStatus.used?.count || 0;
      const voucherUnused = voucherByStatus.unused?.count || 0;
      const voucherExpired = voucherByStatus.expired?.count || 0;
      const voucherTotalIssued = voucherUsed + voucherUnused + voucherExpired;
      const voucherUtilizationRate =
        voucherTotalIssued > 0
          ? Math.round((voucherUsed / voucherTotalIssued) * 100)
          : 0;
      const fulfillmentRate =
        orderStats.totalOrders > 0
          ? Math.round(
              (orderStats.completedOrders / orderStats.totalOrders) * 100
            )
          : 0;

      // ─── Monetary impact metrics (point-value-backed) ─────────────────────────
      const rewardValueAgg = rewardValueDeliveredAgg[0] || { totalRewardPoints: 0 };
      const l5DiscountAgg  = l5DiscountValueAgg[0]      || { totalDiscountValue: 0 };
      const catalogAgg     = rewardCatalogAgg[0]         || { totalCatalogPoints: 0 };

      const pointsIssuedValueNPR         = Math.round(txStats.totalPointsIssued * effectivePointValue);
      const totalRewardValueDeliveredNPR = Math.round((rewardValueAgg.totalRewardPoints || 0) * effectivePointValue);
      const l5TotalDiscountValueNPR      = Math.round(l5DiscountAgg.totalDiscountValue || 0);
      const avgCustomerWalletValueNPR    = totalCustomers > 0
        ? Math.round((totalOutstandingPoints / totalCustomers) * effectivePointValue)
        : 0;
      const rewardCatalogTotalValueNPR   = Math.round((catalogAgg.totalCatalogPoints || 0) * effectivePointValue);
      const loyaltyCostNPR = outstandingLiabilityNPR + redemptionSavingsNPR;
      const loyaltyProgramROI = loyaltyCostNPR > 0 && loyaltyTrackedRevenueNPR > 0
        ? parseFloat((loyaltyTrackedRevenueNPR / loyaltyCostNPR).toFixed(1))
        : 0;

      // ─── Repeat customer revenue (from CustomerAnalytics.totalPointsEarned) ───
      const repeatRevData = repeatRevenueAgg[0] || {
        repeatCustomerPoints: 0,
        firstTimeCustomerPoints: 0,
        avgRepeatCustomerPoints: 0,
      };

      // Primary path: use effectiveConversionRate if available (all standard formats + L5 with rate).
      // Fallback path: when no conversion rate can be derived (e.g. L5 with no billAmount history),
      // compute repeat revenue as a proportional share of loyaltyTrackedRevenueNPR based on
      // how many points repeat customers earned vs total points issued.
      const repeatCustomerRevenueNPR =
        effectiveConversionRate > 0
          ? Math.round((repeatRevData.repeatCustomerPoints || 0) / effectiveConversionRate)
          : loyaltyTrackedRevenueNPR > 0 && txStats.totalPointsIssued > 0
          ? Math.round(
              ((repeatRevData.repeatCustomerPoints || 0) / txStats.totalPointsIssued) *
                loyaltyTrackedRevenueNPR
            )
          : 0;
      const firstTimeCustomerRevenueNPR =
        effectiveConversionRate > 0
          ? Math.round((repeatRevData.firstTimeCustomerPoints || 0) / effectiveConversionRate)
          : loyaltyTrackedRevenueNPR > 0 && txStats.totalPointsIssued > 0
          ? Math.round(
              ((repeatRevData.firstTimeCustomerPoints || 0) / txStats.totalPointsIssued) *
                loyaltyTrackedRevenueNPR
            )
          : 0;
      const repeatRevenuePercentage = loyaltyTrackedRevenueNPR > 0
        ? Math.round((repeatCustomerRevenueNPR / loyaltyTrackedRevenueNPR) * 100)
        : 0;
      const avgSpendPerRepeatCustomer = multiVisitCustomers > 0
        ? Math.round(repeatCustomerRevenueNPR / multiVisitCustomers)
        : 0;

      // ─── Smart Rewards Control metrics ────────────────────────────────────────
      // Effective discount rate: what % of revenue actually went to rewards
      const actualRewardCostNPR = redemptionSavingsNPR + l5TotalDiscountValueNPR;
      const effectiveDiscountRate = loyaltyTrackedRevenueNPR > 0
        ? parseFloat(((actualRewardCostNPR / loyaltyTrackedRevenueNPR) * 100).toFixed(1))
        : 0;

      // ─── Samparka Returns (what Samparka earned for this business) ────────────
      // Staff time value: hours saved × Rs. 350/hr (conservative Nepal staff cost)
      const staffTimeSavedNPR = Math.round(totalHoursSaved * 350);

      // Dormancy recovery: re-engaged customers × avg spend per member
      const dormancyRecoveryValueNPR = Math.round(
        atRisk.reached * (avgSpendPerMember > 0 ? avgSpendPerMember : 0)
      );

      // Revenue component: L5 stores prefer real bill amounts; fall back to points-tracked
      // revenue if billAmount was not stored in transactions (depends on client flow).
      // All other formats use the points-derived loyaltyTrackedRevenueNPR.
      const samparkaRevenueNPR =
        store.format === "L5"
          ? l5Bill.totalBillAmount > 0
            ? Math.round(l5Bill.totalBillAmount)
            : loyaltyTrackedRevenueNPR
          : loyaltyTrackedRevenueNPR;

      // Grand total: revenue tracked + operational savings + time value + recovery
      const totalSamparkaValueNPR =
        samparkaRevenueNPR +
        Math.round(totalCostSaved) +
        staffTimeSavedNPR +
        dormancyRecoveryValueNPR;

      return response.success(
        res,
        {
          // ── Time ──────────────────────────────────────────────────────────────
          totalMinutesSaved,
          totalHoursSaved,
          workingDaysSaved,
          timeBreakdown,

          // ── Cost ──────────────────────────────────────────────────────────────
          totalCostSaved: Math.round(totalCostSaved),
          costBreakdown,

          // ── Revenue & Retention ───────────────────────────────────────────────
          totalTransactions,
          totalPointsIssued: Math.round(txStats.totalPointsIssued),
          totalRedemptions,
          standardRedemptionCount,
          l5RedemptionCount: l5Red.count,
          l5TotalBillAmount: Math.round(l5Bill.totalBillAmount),
          activeRewards,
          atRiskCampaigns: atRisk.campaigns,
          atRiskCustomersReached: atRisk.reached,

          // ── Engagement ────────────────────────────────────────────────────────
          totalCustomers,
          customersWithDOB,
          totalCampaigns: camp.totalCampaigns,
          totalCampaignsSent: camp.totalSent,
          totalCampaignsAttempted: camp.totalAttempted,
          deliveryRate,
          whatsappMessageCount,
          totalNotificationsSent: notif.totalReceiversReached,
          tierDistribution,

          // ── Loyalty Revenue (universal) ───────────────────────────────────────
          loyaltyTrackedRevenueNPR,
          avgSpendPerTransaction,
          avgSpendPerMember,
          redemptionSavingsNPR,
          totalPointsRedeemedFromHistory,

          // ── Monetary Impact (point-value-backed) ──────────────────────────────
          pointsIssuedValueNPR,
          totalRewardValueDeliveredNPR,
          l5TotalDiscountValueNPR,
          avgCustomerWalletValueNPR,
          rewardCatalogTotalValueNPR,
          loyaltyProgramROI,

          // ── Repeat Revenue Tracker ────────────────────────────────────────
          repeatCustomerRevenueNPR,
          firstTimeCustomerRevenueNPR,
          repeatRevenuePercentage,
          avgSpendPerRepeatCustomer,

          // ── Smart Rewards Control ─────────────────────────────────────────
          actualRewardCostNPR,
          effectiveDiscountRate,

          // ── Samparka Returns ──────────────────────────────────────────────────
          staffTimeSavedNPR,
          dormancyRecoveryValueNPR,
          samparkaRevenueNPR,
          totalSamparkaValueNPR,

          // ── Return Behavior ───────────────────────────────────────────────────
          storeAvgReturnDays,
          retentionRate,
          multiVisitCustomers,
          totalTrackedCustomers,
          visitSegmentBreakdown,
          dormancyRecoveryRate,

          // ── Member Growth ─────────────────────────────────────────────────────
          memberGrowthByMonth,

          // ── Points Liability ──────────────────────────────────────────────────
          totalOutstandingPoints,
          outstandingLiabilityNPR,
          customersWithPoints,
          dormantCustomers,
          redemptionStatusBreakdown: redemptionByStatus,
          redemptionConversionRate,

          // ── Campaign Channels ─────────────────────────────────────────────────
          campaignChannelBreakdown,
          campaignSegmentBreakdown,

          // ── Gamification ──────────────────────────────────────────────────────
          wheelSegmentBreakdown,
          totalWheelSegments,
          activeWheelSegments,
          totalOffers,
          activeOffers,
          leaderboardStats,

          // ── E-commerce ────────────────────────────────────────────────────────
          ecommerceOrders: {
            totalOrders: orderStats.totalOrders || 0,
            totalRevenue: Math.round(orderStats.totalRevenue || 0),
            completedOrders: orderStats.completedOrders || 0,
            fulfillmentRate,
          },
          voucherStats: {
            unused: voucherUnused,
            used: voucherUsed,
            expired: voucherExpired,
            totalIssued: voucherTotalIssued,
            utilizationRate: voucherUtilizationRate,
          },

          // ── Store Pricing ─────────────────────────────────────────────────────
          storePrice: store.price ?? null,

          // ── Benchmarks (for UI transparency) ─────────────────────────────────
          benchmarks: BENCHMARKS,
        },
        "Impact data fetched successfully"
      );
    } catch (error) {
      console.error("getImpact error:", error);
      return response.serverError(res, error.message);
    }
  }
}

module.exports = new ImpactController();
