const mongoose = require("mongoose");
const CustomerAnalytics = require("../models/analytics_model/customerAnalyticsModel.js");
const PointsHistory = require("../models/pointsHistoryModel.js");
const Customer = require("../models/customerModel.js");
const Outlet = require("../models/outletModel.js");
const Store = require("../models/storeModel.js");

const SEGMENT_LABELS = {
  no_visits: "New Signups",
  first_visit: "First-Time Visitors",
  second_visit: "Second-Time Visitors",
  third_visit: "Third-Time Visitors",
  fourth_visit: "Fourth-Time Visitors",
  "5+_visits": "Loyal Champions",
};

/**
 * Updates visit analytics for a customer when they earn points.
 * Called after each point transaction to maintain real-time analytics.
 * @param {boolean} isSignup - Whether this is a signup/welcome point (should not count as a visit)
 */
async function updateVisitAnalytics(customerId, storeId, outlet, points, isSignup = false) {
  console.log('[updateVisitAnalytics] START - Called with:', {
    customerId: customerId?.toString(),
    storeId: storeId?.toString(),
    outlet,
    points,
    isSignup
  });
  
  try {
    // Skip visit counting for signup/welcome points
    // new comment
    if (isSignup) {
      console.log('[updateVisitAnalytics] Skipping visit count - signup/welcome point');
      return null;
    }
    
    // Only count positive point transactions as visits
    // Negative points (refunds/corrections) should not increment visit count
    if (points <= 0) {
      console.log('[updateVisitAnalytics] Points <= 0, returning null');
      return null;
    }

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    console.log('[updateVisitAnalytics] Searching for existing analytics...');
    let analytics = await CustomerAnalytics.findOne({
      customer: customerId,
      store: storeId,
    });
    console.log('[updateVisitAnalytics] Existing analytics found:', analytics ? 'YES' : 'NO');

    if (!analytics) {
      analytics = new CustomerAnalytics({
        customer: customerId,
        store: storeId,
        visitCount: 1,
        firstVisit: now,
        lastVisit: now,
        totalPointsEarned: points,
        visitsByOutlet: outlet ? [{ outlet, visitCount: 1, firstVisit: now, lastVisit: now }] : [],
        monthlyVisits: new Map([[monthKey, 1]]),
      });
    } else {
      const daysSinceLastVisit = Math.floor((now - analytics.lastVisit) / (1000 * 60 * 60 * 24));

      analytics.visitGaps.push({ gap: daysSinceLastVisit, visitDate: now });
      if (analytics.visitGaps.length > 10) analytics.visitGaps.shift();

      if (analytics.visitGaps.length > 0) {
        const totalGaps = analytics.visitGaps.reduce((sum, v) => sum + v.gap, 0);
        analytics.avgDaysBetweenVisits = Math.round((totalGaps / analytics.visitGaps.length) * 10) / 10;
      }

      analytics.visitCount += 1;
      analytics.lastVisit = now;
      analytics.totalPointsEarned += points;

      if (outlet) {
        const outletIndex = analytics.visitsByOutlet.findIndex((v) => v.outlet === outlet);
        if (outletIndex >= 0) {
          analytics.visitsByOutlet[outletIndex].visitCount += 1;
          analytics.visitsByOutlet[outletIndex].lastVisit = now;
        } else {
          analytics.visitsByOutlet.push({ outlet, visitCount: 1, firstVisit: now, lastVisit: now });
        }
      }

      const currentMonthCount = analytics.monthlyVisits.get(monthKey) || 0;
      analytics.monthlyVisits.set(monthKey, currentMonthCount + 1);

      const sortedKeys = Array.from(analytics.monthlyVisits.keys()).sort();
      while (sortedKeys.length > 12) analytics.monthlyVisits.delete(sortedKeys.shift());
    }

    console.log('[updateVisitAnalytics] About to save analytics:', {
      id: analytics._id?.toString(),
      visitCount: analytics.visitCount,
      totalPointsEarned: analytics.totalPointsEarned,
      lastVisit: analytics.lastVisit
    });
    
    const savedAnalytics = await analytics.save();
    
    console.log('[updateVisitAnalytics] SAVED successfully:', {
      id: savedAnalytics._id?.toString(),
      visitCount: savedAnalytics.visitCount,
      totalPointsEarned: savedAnalytics.totalPointsEarned
    });
    
    return savedAnalytics;
  } catch (error) {
    console.error("[updateVisitAnalytics] ERROR:", error.message);
    console.error("[updateVisitAnalytics] Stack:", error.stack);
    throw error; // Re-throw to let caller know it failed
  }
}

/**
 * Get summary statistics for a store
 */
async function getSummaryStats(storeId, startDate, endDate, outletId = null) {
  const storeObjectId = new mongoose.Types.ObjectId(storeId);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Fetch store to determine loyalty format
  let store;
  let isL5Format = false;
  try {
    store = await Store.findById(storeObjectId).select('loyaltyCard');
    isL5Format = store?.loyaltyCard?.format === 'L5';
    console.log('[getSummaryStats] Store format:', store?.loyaltyCard?.format, '| isL5Format:', isL5Format);
  } catch (error) {
    console.error('[getSummaryStats] Error fetching store:', error.message);
    // Default to non-L5 if store fetch fails
  }

  // Build date filter for visits if dates provided
  let visitDateFilter = {};
  if (startDate && endDate) {
    // Add one day to endDate to include the entire end date (up to 23:59:59.999)
    const endDatePlusOne = new Date(endDate);
    endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);

    visitDateFilter = {
      $or: [
        { firstVisit: { $gte: new Date(startDate), $lt: endDatePlusOne } },
        { lastVisit: { $gte: new Date(startDate), $lt: endDatePlusOne } },
      ],
    };
  }

  // Build outlet filter for L5 format
  // Need to convert outletId (ObjectId) to outlet location/name (string) for matching
  let outletFilter = {};
  let outletIdentifier = null;
  if (outletId) {
    try {
      const outlet = await Outlet.findById(outletId);
      if (outlet) {
        // Use consistent outlet identifier: prefer location, fallback to name (same as l5Controller)
        outletIdentifier = outlet.location || outlet.name;
        console.log('[getSummaryStats] Outlet lookup:', {
          outletId,
          location: outlet.location,
          name: outlet.name,
          finalIdentifier: outletIdentifier
        });
        // Dual-match: accept both location string (new records) and raw ObjectId string (legacy records)
        const outletMatchValues = [outletIdentifier, outletId].filter(Boolean);
        outletFilter = {
          "visitsByOutlet.outlet": { $in: outletMatchValues }
        };
      } else {
        console.warn('[getSummaryStats] Outlet not found for ID:', outletId);
      }
    } catch (error) {
      console.error('[getSummaryStats] Error finding outlet:', error.message);
    }
  }

  const baseFilter = { store: storeObjectId, ...visitDateFilter, ...outletFilter };

  // Additional filters for new metrics
  const now = new Date();
  const thirtyDaysAgoDate = new Date(now);
  thirtyDaysAgoDate.setDate(thirtyDaysAgoDate.getDate() - 30);

  // Total registered customers (dynamic by selected date range when provided)
  const customerDateFilter = { store: storeObjectId };
  if (startDate || endDate) {
    customerDateFilter.createdAt = {};
    if (startDate) {
      customerDateFilter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      customerDateFilter.createdAt.$lte = end;
    }
  }
  const totalRegisteredCustomers = await Customer.countDocuments(customerDateFilter);
  console.log('[getSummaryStats] Total registered customers:', totalRegisteredCustomers);

  // --- Outlet-specific: use transaction models (same source as getVisitTrends) ---
  // CustomerAnalytics.visitsByOutlet was historically never populated, so we query
  // L5PointsTransaction (L5) or PointsHistory (non-L5) directly for outlet metrics.
  if (outletId) {
    let totalCustomers = 0, totalVisits = 0, avgVisitsPerCustomer = 0, repeatRate = 0;

    if (isL5Format) {
      const L5PointsTransaction = require('../models/l5PointsTransactionModel');
      const outletObjectId = new mongoose.Types.ObjectId(outletId);
      const txnMatch = {
        store: storeObjectId,
        outlet: outletObjectId,
        transactionType: { $in: ['earn', 'bonus', 'adjustment'] },
        points: { $gt: 0 },
      };
      if (startDate && endDate) {
        const endD = new Date(endDate);
        endD.setDate(endD.getDate() + 1);
        txnMatch.createdAt = { $gte: new Date(startDate), $lt: endD };
      }
      const [uniqueIds, txnCount, repeatData] = await Promise.all([
        L5PointsTransaction.distinct('customer', txnMatch),
        L5PointsTransaction.countDocuments(txnMatch),
        L5PointsTransaction.aggregate([
          { $match: txnMatch },
          { $group: { _id: '$customer', cnt: { $sum: 1 } } },
          { $match: { cnt: { $gte: 2 } } },
          { $count: 'total' },
        ]),
      ]);
      totalCustomers = uniqueIds.length;
      totalVisits = txnCount;
      avgVisitsPerCustomer = totalCustomers > 0 ? parseFloat((totalVisits / totalCustomers).toFixed(1)) : 0;
      repeatRate = totalCustomers > 0
        ? parseFloat(((repeatData[0]?.total || 0) / totalCustomers * 100).toFixed(1)) : 0;
    } else {
      // Non-L5: use PointsHistory (outlet stored as location string)
      const outletMatchValues = [outletIdentifier, outletId].filter(Boolean);
      const phMatch = {
        store: storeObjectId,
        outlet: { $in: outletMatchValues },
        points: { $gt: 0 },
      };
      if (startDate && endDate) {
        const endD = new Date(endDate);
        endD.setDate(endD.getDate() + 1);
        phMatch.createdAt = { $gte: new Date(startDate), $lt: endD };
      }
      const [uniqueIds, txnCount, repeatData] = await Promise.all([
        PointsHistory.distinct('customer', phMatch),
        PointsHistory.countDocuments(phMatch),
        PointsHistory.aggregate([
          { $match: phMatch },
          { $group: { _id: '$customer', cnt: { $sum: 1 } } },
          { $match: { cnt: { $gte: 2 } } },
          { $count: 'total' },
        ]),
      ]);
      totalCustomers = uniqueIds.length;
      totalVisits = txnCount;
      avgVisitsPerCustomer = totalCustomers > 0 ? parseFloat((totalVisits / totalCustomers).toFixed(1)) : 0;
      repeatRate = totalCustomers > 0
        ? parseFloat(((repeatData[0]?.total || 0) / totalCustomers * 100).toFixed(1)) : 0;
    }

    console.log('[getSummaryStats] Outlet-specific (txn-based) result:', { outletId, outletIdentifier, totalCustomers, totalVisits, repeatRate });
    return {
      totalCustomers,
      totalVisits,
      avgVisitsPerCustomer,
      avgDaysBetweenVisits: null,
      repeatRate,
      atRiskCount: 0,
      newCustomers: 0,
      activeCustomers: 0,
      oneTimeVisitors: 0,
      vipCustomers: 0,
      totalRegisteredCustomers,
      segmentBreakdown: {},
    };
  }
  // --- End outlet-specific early return ---

  // Customers who have visited: those with CustomerAnalytics entries
  let totalCustomersCount;

  if (isL5Format) {
    // L5 Format: Count from CustomerAnalytics
    if (outletId) {
      // Outlet-specific count for L5 — dual-match location string and raw ObjectId string
      const outletCountMatchValues = [outletIdentifier, outletId].filter(Boolean);
      const outletCountPipeline = [
        { $match: baseFilter },
        { $unwind: "$visitsByOutlet" },
        { $match: { "visitsByOutlet.outlet": { $in: outletCountMatchValues } } },
        { $count: "count" }
      ];
      const result = await CustomerAnalytics.aggregate(outletCountPipeline);
      totalCustomersCount = result[0]?.count || 0;
      console.log('[getSummaryStats] L5 outlet-specific visited customer count:', totalCustomersCount);
    } else {
      // All outlets or overall for L5
      totalCustomersCount = await CustomerAnalytics.countDocuments(baseFilter);
      console.log('[getSummaryStats] L5 overall visited customer count:', totalCustomersCount);
    }
  } else {
    // Non-L5 Formats: Count from CustomerAnalytics (customers who have actually visited)
    totalCustomersCount = await CustomerAnalytics.countDocuments(baseFilter);
    console.log('[getSummaryStats] Non-L5 visited customer count from CustomerAnalytics:', totalCustomersCount);
  }

  // Build aggregation pipeline based on whether outlet filtering is applied
  // Note: totalCustomers is calculated separately above, so we exclude it from aggregation
  let totalsPipeline = [{ $match: baseFilter }];

  if (outletId) {
    // For outlet-specific stats, unwind visitsByOutlet and match the specific outlet
    // totalCustomers is calculated separately above, excluded from this aggregation
    const totalsMatchValues = [outletIdentifier, outletId].filter(Boolean);
    totalsPipeline.push(
      { $unwind: "$visitsByOutlet" },
      { $match: { "visitsByOutlet.outlet": { $in: totalsMatchValues } } },
      {
        $group: {
          _id: null,
          totalVisits: { $sum: "$visitsByOutlet.visitCount" },
          avgVisitsPerCustomer: { $avg: "$visitsByOutlet.visitCount" },
          avgDaysBetweenVisits: { $avg: "$avgDaysBetweenVisits" },
        },
      }
    );
  } else {
    // For store-wide stats, use total visitCount
    // totalCustomers is calculated separately above, excluded from this aggregation
    totalsPipeline.push({
      $group: {
        _id: null,
        totalVisits: { $sum: "$visitCount" },
        avgVisitsPerCustomer: { $avg: "$visitCount" },
        avgDaysBetweenVisits: { $avg: "$avgDaysBetweenVisits" },
      },
    });
  }

  console.log('[getSummaryStats] Running aggregation with baseFilter:', JSON.stringify(baseFilter));
  console.log('[getSummaryStats] totalsPipeline:', JSON.stringify(totalsPipeline));

  const [totals, segmentBreakdown, atRiskCount, repeatCustomers, newCustomers, activeCustomers, oneTimeVisitors, vipCustomers] = await Promise.all([
    CustomerAnalytics.aggregate(totalsPipeline),
    CustomerAnalytics.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: "$segment",
          count: { $sum: 1 },
          avgVisits: { $avg: "$visitCount" },
          avgPoints: { $avg: "$totalPointsEarned" },
        },
      },
    ]),
    CustomerAnalytics.countDocuments({
      ...baseFilter,
      visitCount: { $gte: 2 },
      lastVisit: { $lt: thirtyDaysAgo },
    }),
    CustomerAnalytics.countDocuments({
      ...baseFilter,
      visitCount: { $gte: 2 },
    }),
    // New Customers: Created within the specified date range
    startDate && endDate
      ? CustomerAnalytics.countDocuments({
          store: storeObjectId,
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        })
      : Promise.resolve(0),
    // Active Customers: Last visit within 30 days
    CustomerAnalytics.countDocuments({
      store: storeObjectId,
      lastVisit: { $gte: thirtyDaysAgoDate },
    }),
    // One-Time Visitors: First visit segment
    CustomerAnalytics.countDocuments({
      store: storeObjectId,
      segment: "first_visit",
    }),
    // VIP Customers: 5+ visits segment
    CustomerAnalytics.countDocuments({
      store: storeObjectId,
      segment: "5+_visits",
    }),
  ]);

  console.log('[getSummaryStats] Aggregation results:', {
    totals,
    totalCount: totals.length,
    outletId,
    outletIdentifier
  });

  const totalStats = totals[0] || {
    totalVisits: 0,
    avgVisitsPerCustomer: 0,
    avgDaysBetweenVisits: null,
  };

  // Use the separately calculated totalCustomersCount based on loyalty format
  totalStats.totalCustomers = totalCustomersCount;

  const repeatRate = totalStats.totalCustomers > 0
    ? parseFloat(((repeatCustomers / totalStats.totalCustomers) * 100).toFixed(1))
    : 0;

  return {
    ...totalStats,
    repeatRate,
    atRiskCount,
    newCustomers,
    activeCustomers,
    oneTimeVisitors,
    vipCustomers,
    totalRegisteredCustomers,
    segmentBreakdown: segmentBreakdown.reduce((acc, seg) => {
      acc[seg._id] = {
        count: seg.count,
        avgVisits: Math.round(seg.avgVisits * 10) / 10,
        avgPoints: Math.round(seg.avgPoints * 10) / 10,
      };
      return acc;
    }, {}),
  };
}

/**
 * Get customer segments breakdown
 */
async function getSegmentBreakdown(storeId, outletId = null, startDate = null, endDate = null) {
  const storeObjectId = new mongoose.Types.ObjectId(storeId);

  // Outlet-specific path keeps existing analytics-based logic
  if (outletId) {
    let matchFilter = { store: storeObjectId };
    let outletIdentifier = null;

    try {
      const outlet = await Outlet.findById(outletId);
      if (outlet) {
        outletIdentifier = outlet.location || outlet.name;
        // Dual-match: location string (new records) and raw ObjectId string (legacy records)
        const outletMatchValues = [outletIdentifier, outletId].filter(Boolean);
        matchFilter["visitsByOutlet.outlet"] = { $in: outletMatchValues };
        console.log('[getSegmentBreakdown] Filtering by outlet:', outletIdentifier);
      }
    } catch (error) {
      console.error('[getSegmentBreakdown] Error finding outlet:', error.message);
    }

    // Fallback: if outlet lookup failed but outletId is provided, still filter by raw ID
    if (!matchFilter["visitsByOutlet.outlet"] && outletId) {
      matchFilter["visitsByOutlet.outlet"] = { $in: [outletId] };
    }

    const outletPipeline = [
      { $match: matchFilter },
      { $unwind: "$visitsByOutlet" },
      { $match: { "visitsByOutlet.outlet": { $in: [outletIdentifier, outletId].filter(Boolean) } } },
      {
        $addFields: {
          outletVisitCount: "$visitsByOutlet.visitCount",
          outletLastVisit: "$visitsByOutlet.lastVisit",
          outletSegment: {
            $switch: {
              branches: [
                { case: { $eq: ["$visitsByOutlet.visitCount", 1] }, then: "first_visit" },
                { case: { $eq: ["$visitsByOutlet.visitCount", 2] }, then: "second_visit" },
                { case: { $eq: ["$visitsByOutlet.visitCount", 3] }, then: "third_visit" },
                { case: { $eq: ["$visitsByOutlet.visitCount", 4] }, then: "fourth_visit" },
              ],
              default: "5+_visits"
            }
          }
        }
      },
      ...(startDate || endDate
        ? [
            {
              $match: {
                outletLastVisit: {
                  ...(startDate ? { $gte: new Date(startDate) } : {}),
                  ...(endDate
                    ? (() => {
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);
                        return { $lte: end };
                      })()
                    : {}),
                },
              },
            },
          ]
        : []),
      {
        $group: {
          _id: "$outletSegment",
          count: { $sum: 1 },
          avgVisits: { $avg: "$outletVisitCount" },
          avgPoints: { $avg: "$totalPointsEarned" },
          avgDaysBetweenVisits: { $avg: "$avgDaysBetweenVisits" },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const outletSegments = await CustomerAnalytics.aggregate(outletPipeline);
    const outletTotalCustomers = outletSegments.reduce((sum, s) => sum + s.count, 0);

    const formattedOutletSegments = outletSegments.map((seg) => ({
      name: seg._id,
      label: SEGMENT_LABELS[seg._id] || seg._id,
      count: seg.count,
      percentage: outletTotalCustomers > 0 ? parseFloat(((seg.count / outletTotalCustomers) * 100).toFixed(1)) : 0,
      avgVisits: Math.round(seg.avgVisits * 10) / 10,
      avgPointsEarned: Math.round(seg.avgPoints || 0),
      avgDaysBetweenVisits: seg.avgDaysBetweenVisits
        ? Math.round(seg.avgDaysBetweenVisits * 10) / 10
        : null,
    }));

    return { segments: formattedOutletSegments, totalCustomers: outletTotalCustomers };
  }

  // Store-wide path uses Customer as source of truth so chips and recipients stay consistent
  const pipeline = [{ $match: { store: storeObjectId } }];

  pipeline.push(
    {
      $lookup: {
        from: "customeranalytics",
        let: { customerId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$customer", "$$customerId"] },
                  { $eq: ["$store", storeObjectId] },
                ],
              },
            },
          },
          {
            $project: {
              segment: 1,
              visitCount: 1,
              totalPointsEarned: 1,
              avgDaysBetweenVisits: 1,
              firstVisit: 1,
            },
          },
        ],
        as: "analytics",
      },
    },
    {
      $unwind: {
        path: "$analytics",
        preserveNullAndEmptyArrays: true,
      },
    }
  );

  pipeline.push(
    {
      $addFields: {
        effectiveSegment: { $ifNull: ["$analytics.segment", "no_visits"] },
        effectiveLastVisit: { $ifNull: ["$analytics.lastVisit", "$createdAt"] },
        effectiveVisitCount: { $ifNull: ["$analytics.visitCount", 0] },
        effectivePoints: { $ifNull: ["$analytics.totalPointsEarned", 0] },
        effectiveAvgDaysBetweenVisits: "$analytics.avgDaysBetweenVisits",
      },
    },
    ...(startDate || endDate
      ? [
          {
            $match: {
              effectiveLastVisit: {
                ...(startDate ? { $gte: new Date(startDate) } : {}),
                ...(endDate
                  ? (() => {
                      const end = new Date(endDate);
                      end.setHours(23, 59, 59, 999);
                      return { $lte: end };
                    })()
                  : {}),
              },
            },
          },
        ]
      : []),
    {
      $group: {
        _id: "$effectiveSegment",
        count: { $sum: 1 },
        avgVisits: { $avg: "$effectiveVisitCount" },
        avgPoints: { $avg: "$effectivePoints" },
        avgDaysBetweenVisits: { $avg: "$effectiveAvgDaysBetweenVisits" },
      },
    },
    { $sort: { _id: 1 } }
  );

  const segments = await Customer.aggregate(pipeline);

  const totalCustomers = segments.reduce((sum, s) => sum + s.count, 0);

  const formattedSegments = segments.map((seg) => ({
    name: seg._id,
    label: SEGMENT_LABELS[seg._id] || seg._id,
    count: seg.count,
    percentage: totalCustomers > 0 ? parseFloat(((seg.count / totalCustomers) * 100).toFixed(1)) : 0,
    avgVisits: Math.round(seg.avgVisits * 10) / 10,
    avgPointsEarned: Math.round(seg.avgPoints || 0),
    avgDaysBetweenVisits: seg.avgDaysBetweenVisits
      ? Math.round(seg.avgDaysBetweenVisits * 10) / 10
      : null,
  }));

  return { segments: formattedSegments, totalCustomers };
}

/**
 * Get last visit distribution breakdown
 */
async function getLastVisitDistribution(storeId, outletId = null, startDate = null, endDate = null) {
  const storeObjectId = new mongoose.Types.ObjectId(storeId);
  const now = new Date();

  // Get outlet identifier if filtering by outlet
  let outletIdentifier = null;
  if (outletId) {
    try {
      const outlet = await Outlet.findById(outletId);
      if (outlet) {
        outletIdentifier = outlet.location || outlet.name;
        console.log('[getLastVisitDistribution] Filtering by outlet:', outletIdentifier);
      }
    } catch (error) {
      console.error('[getLastVisitDistribution] Error finding outlet:', error.message);
    }
  }

  // For outlet-specific views, apply date range filter on firstVisit (via dateRangeFilter)
  // For store-wide view, date range filter is applied on effectiveLastVisit inside the aggregation below
  const dateRangeFilter = {};
  if (outletId && (startDate || endDate)) {
    dateRangeFilter.firstVisit = {};
    if (startDate) dateRangeFilter.firstVisit.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateRangeFilter.firstVisit.$lte = end;
    }
  }

  // Define time ranges: 1 week, 1 month, 2 months, 3 months, 4 months+
  const ranges = [
    { range: "7", days: 7 },
    { range: "30", days: 30 },
    { range: "60", days: 60 },
    { range: "90", days: 90 },
    { range: "120+", days: null },
  ];

  const results = await Promise.all(
    ranges.map(async ({ range, days }) => {
      let filter = { store: storeObjectId, ...dateRangeFilter };
      const now = new Date();
      
      if (range === "7") {
        // Within last 7 days
        const date = new Date(now);
        date.setDate(date.getDate() - 7);
        filter.lastVisit = { $gte: date };
      } else if (range === "30") {
        // Between 7 and 30 days ago
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(now);
        monthAgo.setDate(monthAgo.getDate() - 30);
        filter.lastVisit = { $gte: monthAgo, $lt: weekAgo };
      } else if (range === "60") {
        // Between 30 and 60 days ago
        const monthAgo = new Date(now);
        monthAgo.setDate(monthAgo.getDate() - 30);
        const twoMonthsAgo = new Date(now);
        twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);
        filter.lastVisit = { $gte: twoMonthsAgo, $lt: monthAgo };
      } else if (range === "90") {
        // Between 60 and 90 days ago
        const twoMonthsAgo = new Date(now);
        twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
        filter.lastVisit = { $gte: threeMonthsAgo, $lt: twoMonthsAgo };
      } else if (range === "120+") {
        // More than 90 days ago (4 months+)
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
        filter.lastVisit = { $lt: threeMonthsAgo };
      }

      let count;
      if (outletIdentifier || outletId) {
        // Dual-match: location string (new records) and raw ObjectId string (legacy records)
        const outletMatchValues = [outletIdentifier, outletId].filter(Boolean);
        // For outlet-specific filtering, use aggregation to extract outlet's lastVisit
        const pipeline = [
          { $match: { store: storeObjectId, "visitsByOutlet.outlet": { $in: outletMatchValues }, ...dateRangeFilter } },
          { $unwind: "$visitsByOutlet" },
          { $match: { "visitsByOutlet.outlet": { $in: outletMatchValues } } },
        ];

        // Add date filter based on visitsByOutlet.lastVisit
        if (filter.lastVisit) {
          pipeline.push({ $match: { "visitsByOutlet.lastVisit": filter.lastVisit } });
        }

        pipeline.push({ $count: "count" });

        const result = await CustomerAnalytics.aggregate(pipeline);
        count = result[0]?.count || 0;
      } else {
        // For all outlets, use Customer model aggregation with createdAt fallback.
        // This ensures customers with no lastVisit use their registration date
        // instead of being incorrectly bucketed as "120+" (MongoDB treats null < any date).
        const aggPipeline = [
          { $match: { store: storeObjectId } },
          {
            $lookup: {
              from: "customeranalytics",
              let: { custId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$customer", "$$custId"] },
                        { $eq: ["$store", storeObjectId] },
                      ],
                    },
                  },
                },
              ],
              as: "analytics",
            },
          },
          { $unwind: { path: "$analytics", preserveNullAndEmptyArrays: true } },
        ];

        aggPipeline.push({
          $addFields: {
            effectiveLastVisit: { $ifNull: ["$analytics.lastVisit", "$createdAt"] },
          },
        });

        // Apply date range filter on effectiveLastVisit so the distribution
        // responds to the date picker — consistent with getSegmentBreakdown()
        if (startDate || endDate) {
          const dateFilter = {};
          if (startDate) dateFilter.$gte = new Date(startDate);
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter.$lte = end;
          }
          aggPipeline.push({ $match: { effectiveLastVisit: dateFilter } });
        }

        aggPipeline.push(
          { $match: { effectiveLastVisit: filter.lastVisit } },
          { $count: "count" }
        );

        const aggResult = await Customer.aggregate(aggPipeline);
        count = aggResult[0]?.count || 0;
      }

      return { range, count };
    })
  );

  const totalCustomers = results.reduce((sum, r) => sum + r.count, 0);

  return results.map(item => ({
    ...item,
    percentage: totalCustomers > 0 ? parseFloat(((item.count / totalCustomers) * 100).toFixed(1)) : 0,
  }));
}

/**
 * Get retention metrics
 */
async function getRetentionData(storeId) {
  const storeObjectId = new mongoose.Types.ObjectId(storeId);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const retentionData = await CustomerAnalytics.aggregate([
    { $match: { store: storeObjectId } },
    {
      $facet: {
        conversionRates: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              visit2Plus: { $sum: { $cond: [{ $gte: ["$visitCount", 2] }, 1, 0] } },
              visit3Plus: { $sum: { $cond: [{ $gte: ["$visitCount", 3] }, 1, 0] } },
              visit4Plus: { $sum: { $cond: [{ $gte: ["$visitCount", 4] }, 1, 0] } },
              visit10Plus: { $sum: { $cond: [{ $gte: ["$visitCount", 10] }, 1, 0] } },
            },
          },
        ],
        atRisk: [
          { $match: { visitCount: { $gte: 2 }, lastVisit: { $lt: thirtyDaysAgo } } },
          { $count: "count" },
        ],
        churned: [
          { $match: { visitCount: { $gte: 2 }, lastVisit: { $lt: ninetyDaysAgo } } },
          { $count: "count" },
        ],
        avgGapBySegment: [
          { $match: { avgDaysBetweenVisits: { $ne: null } } },
          { $group: { _id: "$segment", avgGap: { $avg: "$avgDaysBetweenVisits" } } },
        ],
      },
    },
  ]);

  const data = retentionData[0];
  const rates = data.conversionRates[0] || { total: 0 };

  return {
    conversionRates: {
      visit1to2: rates.total > 0 ? parseFloat(((rates.visit2Plus / rates.total) * 100).toFixed(1)) : 0,
      visit2to3: rates.visit2Plus > 0 ? parseFloat(((rates.visit3Plus / rates.visit2Plus) * 100).toFixed(1)) : 0,
      visit3to4: rates.visit3Plus > 0 ? parseFloat(((rates.visit4Plus / rates.visit3Plus) * 100).toFixed(1)) : 0,
      visit4to10Plus: rates.visit4Plus > 0 ? parseFloat(((rates.visit10Plus / rates.visit4Plus) * 100).toFixed(1)) : 0,
    },
    atRiskCount: data.atRisk[0]?.count || 0,
    churnedCount: data.churned[0]?.count || 0,
    avgGapBySegment: data.avgGapBySegment.reduce((acc, seg) => {
      acc[seg._id] = Math.round(seg.avgGap * 10) / 10;
      return acc;
    }, {}),
  };
}

/**
 * Get outlet performance stats
 */
async function getOutletStats(storeId) {
  const storeObjectId = new mongoose.Types.ObjectId(storeId);

  const [outletStats, crossOutlet] = await Promise.all([
    CustomerAnalytics.aggregate([
      { $match: { store: storeObjectId } },
      { $unwind: "$visitsByOutlet" },
      {
        $group: {
          _id: "$visitsByOutlet.outlet",
          totalVisits: { $sum: "$visitsByOutlet.visitCount" },
          uniqueCustomers: { $sum: 1 },
        },
      },
      {
        $project: {
          outlet: "$_id",
          totalVisits: 1,
          uniqueCustomers: 1,
          avgVisitsPerCustomer: { $round: [{ $divide: ["$totalVisits", "$uniqueCustomers"] }, 1] },
        },
      },
      { $sort: { totalVisits: -1 } },
    ]),
    CustomerAnalytics.aggregate([
      { $match: { store: storeObjectId } },
      { $project: { outletCount: { $size: "$visitsByOutlet" } } },
      { $match: { outletCount: { $gte: 2 } } },
      { $count: "count" },
    ]),
  ]);

  return {
    outlets: outletStats,
    crossOutletVisitors: crossOutlet[0]?.count || 0,
  };
}

/**
 * Get visit trends over time
 */
async function getVisitTrends(storeId, period = 30, startDate, endDate, outletId = null) {
  const storeObjectId = new mongoose.Types.ObjectId(storeId);

  // Check if store is L5 format and fetch store createdAt for all-time filter
  let isL5Format = false;
  let store = null;
  try {
    store = await Store.findById(storeObjectId).select('loyaltyCard createdAt');
    isL5Format = store?.loyaltyCard?.format === 'L5';
    console.log('[getVisitTrends] Store format:', store?.loyaltyCard?.format, '| isL5Format:', isL5Format);
  } catch (error) {
    console.error('[getVisitTrends] Error fetching store:', error.message);
  }

  let dateFilter = {};
  if (startDate && endDate) {
    const endDatePlusOne = new Date(endDate);
    endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
    dateFilter = { createdAt: { $gte: new Date(startDate), $lt: endDatePlusOne } };
  } else {
    // Period-based calculation (fallback for legacy requests)
    const periodDays = parseInt(period);

    // period >= 10000 means all-time — use store creation date as start
    if (periodDays >= 10000 && store?.createdAt) {
      dateFilter = { createdAt: { $gte: new Date(store.createdAt) } };
    } else {
      const start = new Date();
      start.setDate(start.getDate() - periodDays);
      dateFilter = { createdAt: { $gte: start } };
    }
  }

  let trends;

  if (isL5Format) {
    // For L5 format, use L5PointsTransaction with ObjectId outlet matching
    const L5PointsTransaction = require("../models/l5PointsTransactionModel");
    const matchFilter = {
      store: storeObjectId,
      transactionType: { $in: ["earn", "bonus", "adjustment"] },
      points: { $gt: 0 },
      ...dateFilter
    };
    
    if (outletId) {
      // For L5, outlet is stored as ObjectId
      matchFilter.outlet = new mongoose.Types.ObjectId(outletId);
      console.log('[getVisitTrends] L5 format - Filtering by outlet ObjectId:', outletId);
    }

    console.log('[getVisitTrends] L5 format - Using L5PointsTransaction');
    trends = await L5PointsTransaction.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          visitCount: { $sum: 1 },
          uniqueCustomers: { $addToSet: "$customer" },
          totalPoints: { $sum: "$points" },
        },
      },
      {
        $project: {
          date: "$_id",
          visitCount: 1,
          uniqueCustomers: { $size: "$uniqueCustomers" },
          totalPoints: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);
  } else {
    // For non-L5 formats, use PointsHistory with string outlet matching
    const matchFilter = { store: storeObjectId, points: { $gt: 0 }, ...dateFilter };
    if (outletId) {
      try {
        const outlet = await Outlet.findById(outletId);
        if (outlet) {
          // Use consistent outlet identifier: prefer location, fallback to name
          const outletIdentifier = outlet.location || outlet.name;
          matchFilter.outlet = { $in: [outletIdentifier, outletId] };
          console.log('[getVisitTrends] Non-L5 format - Filtering by outlet:', outletIdentifier);
        }
      } catch (error) {
        console.error('[getVisitTrends] Error finding outlet:', error.message);
      }
    }

    console.log('[getVisitTrends] Non-L5 format - Using PointsHistory');
    trends = await PointsHistory.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          visitCount: { $sum: 1 },
          uniqueCustomers: { $addToSet: "$customer" },
          totalPoints: { $sum: "$points" },
        },
      },
      {
        $project: {
          date: "$_id",
          visitCount: 1,
          uniqueCustomers: { $size: "$uniqueCustomers" },
          totalPoints: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);
  }

  return trends;
}

/**
 * Get paginated customer list with filters
 */
async function getCustomerList(storeId, { segment, search, lastVisitDays, startDate, endDate, outletId, page, limit, skip }) {
  const storeObjectId = new mongoose.Types.ObjectId(storeId);
  const filter = { store: storeObjectId };

  // Get outlet identifier if filtering by outlet
  let outletIdentifier = null;
  if (outletId) {
    try {
      const outlet = await Outlet.findById(outletId);
      if (outlet) {
        outletIdentifier = outlet.location || outlet.name;
        console.log('[getCustomerList] Filtering by outlet:', outletIdentifier);
      }
    } catch (error) {
      console.error('[getCustomerList] Error finding outlet:', error.message);
    }
  }

  const pipeline = [{ $match: filter }];

  // If filtering by outlet, unwind visitsByOutlet and match the outlet
  // Dual-match: location string (new records) and raw ObjectId string (legacy records)
  if (outletIdentifier || outletId) {
    const outletMatchValues = [outletIdentifier, outletId].filter(Boolean);
    pipeline.push(
      { $unwind: "$visitsByOutlet" },
      { $match: { "visitsByOutlet.outlet": { $in: outletMatchValues } } }
    );

    // Add outlet-specific fields
    pipeline.push({
      $addFields: {
        outletVisitCount: "$visitsByOutlet.visitCount",
        outletFirstVisit: "$visitsByOutlet.firstVisit",
        outletLastVisit: "$visitsByOutlet.lastVisit",
        outletSegment: {
          $switch: {
            branches: [
              { case: { $eq: ["$visitsByOutlet.visitCount", 1] }, then: "first_visit" },
              { case: { $eq: ["$visitsByOutlet.visitCount", 2] }, then: "second_visit" },
              { case: { $eq: ["$visitsByOutlet.visitCount", 3] }, then: "third_visit" },
              { case: { $eq: ["$visitsByOutlet.visitCount", 4] }, then: "fourth_visit" },
            ],
            default: "5+_visits"
          }
        }
      }
    });

    if (startDate || endDate) {
      const dateCondition = {};
      if (startDate) {
        dateCondition.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateCondition.$lte = end;
      }
      pipeline.push({ $match: { outletLastVisit: dateCondition } });
    }

    // Apply segment filter based on outlet-specific segment
    if (segment) {
      pipeline.push({ $match: { outletSegment: segment } });
    }

    // Apply lastVisitDays filter based on outlet-specific lastVisit
    if (lastVisitDays) {
      try {
        const days = JSON.parse(lastVisitDays);
        if (days && days.length > 0) {
          const now = new Date();
          const conditions = days.map((range) => {
            if (range === "7") {
              const date = new Date(now);
              date.setDate(date.getDate() - 7);
              return { outletLastVisit: { $gte: date } };
            } else if (range === "30") {
              const weekAgo = new Date(now);
              weekAgo.setDate(weekAgo.getDate() - 7);
              const monthAgo = new Date(now);
              monthAgo.setDate(monthAgo.getDate() - 30);
              return { outletLastVisit: { $gte: monthAgo, $lt: weekAgo } };
            } else if (range === "60") {
              const monthAgo = new Date(now);
              monthAgo.setDate(monthAgo.getDate() - 30);
              const twoMonthsAgo = new Date(now);
              twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);
              return { outletLastVisit: { $gte: twoMonthsAgo, $lt: monthAgo } };
            } else if (range === "90") {
              const twoMonthsAgo = new Date(now);
              twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);
              const threeMonthsAgo = new Date(now);
              threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
              return { outletLastVisit: { $gte: threeMonthsAgo, $lt: twoMonthsAgo } };
            } else if (range === "120+") {
              const threeMonthsAgo = new Date(now);
              threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
              return { outletLastVisit: { $lt: threeMonthsAgo } };
            }
          }).filter(Boolean);

          if (conditions.length > 0) {
            pipeline.push({ $match: { $or: conditions } });
          }
        }
      } catch (error) {
        console.error('Error parsing lastVisitDays:', error);
      }
    }
    // Lookup customer info for outlet path
    pipeline.push(
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customerInfo",
        },
      },
      { $unwind: "$customerInfo" }
    );
  } else {
    // No outlet filter - use overall segment and lastVisit.
    // Lookup customer info EARLY to access createdAt for lastVisit fallback.
    pipeline.push(
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customerInfo",
        },
      },
      { $unwind: "$customerInfo" }
    );

    // Compute effectiveLastVisit: use createdAt as fallback when lastVisit is null.
    // This prevents customers with no visit history from being incorrectly
    // bucketed as "120+" (MongoDB treats null < any date in $lt comparisons).
    pipeline.push({
      $addFields: {
        effectiveLastVisit: { $ifNull: ["$lastVisit", "$customerInfo.createdAt"] },
      },
    });

    if (startDate || endDate) {
      const dateCondition = {};
      if (startDate) {
        dateCondition.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateCondition.$lte = end;
      }
      pipeline.push({ $match: { effectiveLastVisit: dateCondition } });
    }

    if (segment) {
      pipeline.push({ $match: { segment } });
    }

    // Apply lastVisitDays filter based on effectiveLastVisit (not lastVisit)
    if (lastVisitDays) {
      try {
        const days = JSON.parse(lastVisitDays);
        if (days && days.length > 0) {
          const now = new Date();
          const conditions = days.map((range) => {
            if (range === "7") {
              const date = new Date(now);
              date.setDate(date.getDate() - 7);
              return { effectiveLastVisit: { $gte: date } };
            } else if (range === "30") {
              const weekAgo = new Date(now);
              weekAgo.setDate(weekAgo.getDate() - 7);
              const monthAgo = new Date(now);
              monthAgo.setDate(monthAgo.getDate() - 30);
              return { effectiveLastVisit: { $gte: monthAgo, $lt: weekAgo } };
            } else if (range === "60") {
              const monthAgo = new Date(now);
              monthAgo.setDate(monthAgo.getDate() - 30);
              const twoMonthsAgo = new Date(now);
              twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);
              return { effectiveLastVisit: { $gte: twoMonthsAgo, $lt: monthAgo } };
            } else if (range === "90") {
              const twoMonthsAgo = new Date(now);
              twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);
              const threeMonthsAgo = new Date(now);
              threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
              return { effectiveLastVisit: { $gte: threeMonthsAgo, $lt: twoMonthsAgo } };
            } else if (range === "120+") {
              const threeMonthsAgo = new Date(now);
              threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
              return { effectiveLastVisit: { $lt: threeMonthsAgo } };
            }
          }).filter(Boolean);

          if (conditions.length > 0) {
            pipeline.push({ $match: { $or: conditions } });
          }
        }
      } catch (error) {
        console.error('Error parsing lastVisitDays:', error);
      }
    }
  }

  // Apply search filter
  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    const searchConditions = [
      { "customerInfo.name": { $regex: escapedSearch, $options: "i" } },
      { "customerInfo.email": { $regex: escapedSearch, $options: "i" } },
    ];
    
    // Handle phone search based on whether it's numeric
    if (/^\d+$/.test(search)) {
      searchConditions.push({ "customerInfo.phone": { $regex: search } });
    } else {
      // For non-numeric searches, convert phone to string and search
      searchConditions.push({ 
        $expr: { 
          $regexMatch: { 
            input: { $toString: "$customerInfo.phone" }, 
            regex: escapedSearch, 
            options: "i" 
          } 
        } 
      });
    }
    
    pipeline.push({
      $match: {
        $or: searchConditions,
      },
    });
  }

  // Count total before pagination
  const countPipeline = [...pipeline, { $count: "total" }];
  const countResult = await CustomerAnalytics.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  // Add sorting, pagination and projection
  const sortField = (outletIdentifier || outletId) ? "outletLastVisit" : "effectiveLastVisit";
  pipeline.push(
    { $sort: { [sortField]: -1 } },
    { $skip: skip },
    { $limit: limit }
  );

  if (outletIdentifier || outletId) {
    // For outlet-specific view, add outlet-specific fields
    pipeline.push({
      $addFields: {
        daysSinceLastVisit: {
          $cond: {
            if: { $ne: ["$outletLastVisit", null] },
            then: {
              $floor: {
                $divide: [{ $subtract: [new Date(), "$outletLastVisit"] }, 1000 * 60 * 60 * 24],
              },
            },
            else: null,
          },
        },
      },
    });

    pipeline.push({
      $project: {
        _id: 1,
        customer: 1,
        visitCount: "$outletVisitCount",
        segment: "$outletSegment",
        firstVisit: "$outletFirstVisit",
        lastVisit: "$outletLastVisit",
        totalPointsEarned: 1,
        avgDaysBetweenVisits: 1,
        daysSinceLastVisit: 1,
        customerName: "$customerInfo.name",
        customerEmail: "$customerInfo.email",
        customerPhone: "$customerInfo.phone",
        customerTier: "$customerInfo.tier",
        customerPoints: "$customerInfo.points",
      },
    });
  } else {
    // For overall view, use overall fields
    pipeline.push({
      $addFields: {
        // effectiveLastVisit is always non-null (falls back to createdAt), so compute directly
        daysSinceLastVisit: {
          $floor: {
            $divide: [{ $subtract: [new Date(), "$effectiveLastVisit"] }, 1000 * 60 * 60 * 24],
          },
        },
      },
    });

    pipeline.push({
      $project: {
        _id: 1,
        customer: 1,
        visitCount: 1,
        segment: 1,
        firstVisit: 1,
        lastVisit: 1,
        totalPointsEarned: 1,
        avgDaysBetweenVisits: 1,
        daysSinceLastVisit: 1,
        customerName: "$customerInfo.name",
        customerEmail: "$customerInfo.email",
        customerPhone: "$customerInfo.phone",
        customerTier: "$customerInfo.tier",
        customerPoints: "$customerInfo.points",
      },
    });
  }

  const customers = await CustomerAnalytics.aggregate(pipeline);

  return { customers, total };
}

/**
 * Get customer visit history with analytics
 */
async function getCustomerHistory(customerId, { page, limit, skip }) {
  const customerObjectId = new mongoose.Types.ObjectId(customerId);

  const [analytics, customer, visitHistory, totalVisits] = await Promise.all([
    CustomerAnalytics.findOne({ customer: customerObjectId }).lean(),
    Customer.findById(customerObjectId).select("name email phone tier points countryCode").lean(),
    PointsHistory.find({ customer: customerObjectId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("createdAt points billID outlet remarks")
      .lean(),
    PointsHistory.countDocuments({ customer: customerObjectId }),
  ]);

  if (!analytics) {
    return null;
  }

  return {
    customer,
    analytics: {
      visitCount: analytics.visitCount,
      segment: analytics.segment,
      firstVisit: analytics.firstVisit,
      lastVisit: analytics.lastVisit,
      avgDaysBetweenVisits: analytics.avgDaysBetweenVisits,
      totalPointsEarned: analytics.totalPointsEarned,
      visitsByOutlet: analytics.visitsByOutlet,
    },
    visitHistory,
    totalVisits,
  };
}

/**
 * Get all customers for a store (including those without analytics/points)
 */
async function getAllCustomers(storeId, { segment, search, lastVisitDays, startDate, endDate, outletId, page, limit, skip }) {
  try {
    const storeObjectId = new mongoose.Types.ObjectId(storeId);
    const matchStage = { store: storeObjectId };

    // Build aggregation pipeline
    const pipeline = [{ $match: matchStage }];

    // Lookup analytics early (so we can filter by lastVisit)
    pipeline.push(
      {
        $lookup: {
          from: "customeranalytics",
          localField: "_id",
          foreignField: "customer",
          as: "analytics",
        },
      },
      {
        $unwind: {
          path: "$analytics",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          effectiveLastVisit: { $ifNull: ["$analytics.lastVisit", "$createdAt"] },
          effectiveSegment: { $ifNull: ["$analytics.segment", "no_visits"] },
        },
      }
    );

    if (segment) {
      pipeline.push({ $match: { effectiveSegment: segment } });
    }

    if (startDate || endDate) {
      const dateCondition = {};
      if (startDate) {
        dateCondition.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateCondition.$lte = end;
      }
      pipeline.push({ $match: { effectiveLastVisit: dateCondition } });
    }

    // Apply search filter with escaped regex in aggregation pipeline
    if (search && search.trim()) {
      // Escape special regex characters
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Build search conditions
      const searchConditions = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
      ];
      
      // If search contains only digits, search phone field by converting to string
      if (/^\d+$/.test(search)) {
        searchConditions.push({ 
          $expr: { 
            $regexMatch: { 
              input: { $toString: "$phone" }, 
              regex: search
            } 
          } 
        });
      } else {
        // For non-numeric searches, convert phone to string and search
        searchConditions.push({ 
          $expr: { 
            $regexMatch: { 
              input: { $toString: "$phone" }, 
              regex: escapedSearch, 
              options: "i" 
            } 
          } 
        });
      }
      
      pipeline.push({ $match: { $or: searchConditions } });
    }

    // Apply lastVisitDays filter
    if (lastVisitDays) {
      try {
        const days = JSON.parse(lastVisitDays);
        if (days && days.length > 0) {
          const now = new Date();
          const conditions = days.map((range) => {
            if (range === "7") {
              // Last 7 days
              const date = new Date(now);
              date.setDate(date.getDate() - 7);
              return { effectiveLastVisit: { $gte: date } };
            } else if (range === "30") {
              // 8-30 days ago
              const weekAgo = new Date(now);
              weekAgo.setDate(weekAgo.getDate() - 7);
              const monthAgo = new Date(now);
              monthAgo.setDate(monthAgo.getDate() - 30);
              return { effectiveLastVisit: { $gte: monthAgo, $lt: weekAgo } };
            } else if (range === "60") {
              // 31-60 days ago
              const monthAgo = new Date(now);
              monthAgo.setDate(monthAgo.getDate() - 30);
              const twoMonthsAgo = new Date(now);
              twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);
              return { effectiveLastVisit: { $gte: twoMonthsAgo, $lt: monthAgo } };
            } else if (range === "90") {
              // 61-90 days ago
              const twoMonthsAgo = new Date(now);
              twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);
              const threeMonthsAgo = new Date(now);
              threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
              return { effectiveLastVisit: { $gte: threeMonthsAgo, $lt: twoMonthsAgo } };
            } else if (range === "120+") {
              // 90+ days ago
              const threeMonthsAgo = new Date(now);
              threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
              return { effectiveLastVisit: { $lt: threeMonthsAgo } };
            }
          }).filter(Boolean);

          if (conditions.length > 0) {
            pipeline.push({ $match: { $or: conditions } });
          }
        }
      } catch (error) {
        console.error('❌ Error parsing lastVisitDays:', error);
      }
    }

    // Count total using aggregation AFTER all filters
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Customer.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Continue with main pipeline - add fields for display
    pipeline.push(
      {
        $addFields: {
          visitCount: { $ifNull: ["$analytics.visitCount", 0] },
          segment: "$effectiveSegment",
          firstVisit: "$analytics.firstVisit",
          // Use createdAt as fallback when lastVisit is null (customers with no visit points)
          lastVisit: { $ifNull: ["$analytics.lastVisit", "$createdAt"] },
          totalPointsEarned: { $ifNull: ["$analytics.totalPointsEarned", 0] },
          avgDaysBetweenVisits: "$analytics.avgDaysBetweenVisits",
          daysSinceLastVisit: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), { $ifNull: ["$analytics.lastVisit", "$createdAt"] }] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          customer: "$_id",
          visitCount: 1,
          segment: 1,
          firstVisit: 1,
          lastVisit: 1,
          totalPointsEarned: 1,
          avgDaysBetweenVisits: 1,
          daysSinceLastVisit: 1,
          customerName: "$name",
          customerEmail: "$email",
          customerPhone: "$phone",
          customerTier: "$tier",
          customerPoints: "$points",
        },
      }
    );

    // Fetch customers
    const customers = await Customer.aggregate(pipeline);

    return { customers, total };
  } catch (error) {
    console.error("❌ getAllCustomers error:", error);
    throw error;
  }
}

/**
 * Get a daily summary for a store for use in the 8PM nightly email report.
 * Aggregates: new customers today, total visits today, points earned/redeemed today,
 * segment breakdown, top customers, retention rate, active customers.
 * @param {string|ObjectId} storeId
 * @param {Date} [date] - The date to report on (defaults to today)
 */
async function getDailyStoreSummary(storeId, date = new Date()) {
  try {
    const storeObjectId = new mongoose.Types.ObjectId(storeId);

    // Build today's date range (midnight to midnight UTC)
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // New customers: CustomerAnalytics docs created today (first visit today)
    const newCustomers = await CustomerAnalytics.countDocuments({
      store: storeObjectId,
      firstVisit: { $gte: startOfDay, $lte: endOfDay },
    });

    // Total visits today: sum of PointsHistory entries with positive points today
    const visitsTodayAgg = await PointsHistory.aggregate([
      {
        $match: {
          store: storeObjectId,
          points: { $gt: 0 },
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      { $count: "total" },
    ]);
    const totalVisits = visitsTodayAgg[0]?.total || 0;

    // Points earned today (positive transactions)
    const earnedAgg = await PointsHistory.aggregate([
      {
        $match: {
          store: storeObjectId,
          points: { $gt: 0 },
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]);
    const pointsEarned = earnedAgg[0]?.total || 0;

    // Points redeemed today (negative transactions — stored as negative numbers)
    const redeemedAgg = await PointsHistory.aggregate([
      {
        $match: {
          store: storeObjectId,
          points: { $lt: 0 },
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]);
    const pointsRedeemed = Math.abs(redeemedAgg[0]?.total || 0);

    // Segment breakdown from CustomerAnalytics
    const segmentAgg = await CustomerAnalytics.aggregate([
      { $match: { store: storeObjectId } },
      {
        $group: {
          _id: "$segment",
          count: { $sum: 1 },
        },
      },
    ]);
    const segments = {};
    for (const seg of segmentAgg) {
      if (seg._id) {
        segments[seg._id] = { count: seg.count };
      }
    }

    // Top 5 customers by visits today (from PointsHistory)
    const topCustomerAgg = await PointsHistory.aggregate([
      {
        $match: {
          store: storeObjectId,
          points: { $gt: 0 },
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: "$customer",
          visits: { $sum: 1 },
        },
      },
      { $sort: { visits: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customerInfo",
        },
      },
      { $unwind: { path: "$customerInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          visits: 1,
          name: { $ifNull: ["$customerInfo.name", "Unknown"] },
          phone: "$customerInfo.phone",
        },
      },
    ]);
    const topCustomers = topCustomerAgg.map((c) => ({
      name: c.name,
      phone: c.phone,
      visits: c.visits,
    }));

    // Active customers in last 30 days
    const activeCustomers = await CustomerAnalytics.countDocuments({
      store: storeObjectId,
      lastVisit: { $gte: thirtyDaysAgo },
    });

    // Retention rate: customers with 2+ visits / total customers
    const totalCustomers = await CustomerAnalytics.countDocuments({ store: storeObjectId });
    const repeatCustomers = await CustomerAnalytics.countDocuments({
      store: storeObjectId,
      visitCount: { $gte: 2 },
    });
    const retentionRate =
      totalCustomers > 0
        ? parseFloat(((repeatCustomers / totalCustomers) * 100).toFixed(1))
        : 0;

    const totalRegisteredCustomers = await Customer.countDocuments({ store: storeObjectId });

    return {
      newCustomers,
      totalVisits,
      pointsEarned,
      pointsRedeemed,
      segments,
      topCustomers,
      activeCustomers,
      retentionRate,
      totalRegisteredCustomers,
      totalCustomers,
      repeatCustomers,
    };
  } catch (error) {
    console.error("❌ getDailyStoreSummary error:", error.message);
    throw error;
  }
}

module.exports = {
  updateVisitAnalytics,
  getSummaryStats,
  getSegmentBreakdown,
  getLastVisitDistribution,
  getRetentionData,
  getOutletStats,
  getVisitTrends,
  getCustomerList,
  getAllCustomers,
  getCustomerHistory,
  getDailyStoreSummary,
};
