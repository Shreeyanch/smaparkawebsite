const PointsHistory = require("../models/pointsHistoryModel");
const PointDeductionLog = require("../models/pointDeductionLogModel");

/**
 * Calculate proportional split of points for L4 redemption
 * @param {ObjectId} customerId - Customer ID
 * @param {ObjectId} storeId - Store ID
 * @param {Number} pointsToRedeem - Points being redeemed
 * @returns {Array} Array of {outlet, pointsContributed, percentageContribution}
 */
async function calculateProportionalSplit(customerId, storeId, pointsToRedeem) {
  try {
    // Get all point earning history for this customer at this store
    const pointsHistory = await PointsHistory.find({
      customer: customerId,
      store: storeId,
      outlet: { $exists: true, $ne: null, $ne: "" },
      points: { $gt: 0 }, // Only positive points (earnings)
    }).sort({ createdAt: 1 });

    // Aggregate points by outlet
    const outletTotals = {};
    let totalPoints = 0;

    for (const record of pointsHistory) {
      const outlet = record.outlet.trim(); // Normalize outlet name
      if (!outletTotals[outlet]) {
        outletTotals[outlet] = 0;
      }
      outletTotals[outlet] += record.points;
      totalPoints += record.points;
    }

    // Handle edge case: No outlet-tracked points
    if (totalPoints === 0 || Object.keys(outletTotals).length === 0) {
      console.warn(
        `[L4 Settlement] No outlet-tracked points found for customer ${customerId} at store ${storeId}`
      );
      return [];
    }

    // Calculate proportional split
    const contributions = [];
    let allocatedPoints = 0;

    const outlets = Object.keys(outletTotals);

    for (let i = 0; i < outlets.length; i++) {
      const outlet = outlets[i];
      const outletTotal = outletTotals[outlet];
      const percentage = (outletTotal / totalPoints) * 100;

      let pointsFromOutlet;

      // For last outlet, use remaining points to avoid rounding errors
      if (i === outlets.length - 1) {
        pointsFromOutlet = pointsToRedeem - allocatedPoints;
      } else {
        // Round to 2 decimal places
        pointsFromOutlet =
          Math.round(((outletTotal / totalPoints) * pointsToRedeem * 100)) / 100;
        allocatedPoints += pointsFromOutlet;
      }

      contributions.push({
        outlet: outlet,
        pointsContributed: pointsFromOutlet,
        percentageContribution: Math.round(percentage * 100) / 100,
      });
    }

    return contributions;
  } catch (error) {
    console.error("[L4 Settlement] Error calculating proportional split:", error);
    throw error;
  }
}

/**
 * Calculate settlement summary for date range
 * Returns: For each outlet, calculate net settlement (redeemed_by_others - used_from_others)
 * @param {ObjectId} storeId - Store ID
 * @param {Date} startDate - Start date for report
 * @param {Date} endDate - End date for report
 * @returns {Array} Settlement data per outlet
 */
async function calculateSettlement(storeId, startDate, endDate) {
  try {
    // Get all deduction logs in date range
    const logs = await PointDeductionLog.find({
      store: storeId,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Track for each outlet:
    // - Points distributed (earned by customers, later redeemed elsewhere)
    // - Points redeemed (redemptions that happened at this outlet)
    const outletData = {};

    for (const log of logs) {
      const redemptionOutlet = log.outlet;

      // Initialize outlet data if needed
      if (redemptionOutlet && !outletData[redemptionOutlet]) {
        outletData[redemptionOutlet] = {
          pointsRedeemed: 0,
          pointsDistributed: 0,
          redemptionCount: 0,
        };
      }

      // This outlet hosted the redemption
      if (redemptionOutlet) {
        outletData[redemptionOutlet].pointsRedeemed += log.pointsDeducted;
        outletData[redemptionOutlet].redemptionCount += 1;
      }

      // Track which outlets contributed to this redemption
      if (log.outletContributions && log.outletContributions.length > 0) {
        for (const contribution of log.outletContributions) {
          const contributingOutlet = contribution.outlet;

          if (!outletData[contributingOutlet]) {
            outletData[contributingOutlet] = {
              pointsRedeemed: 0,
              pointsDistributed: 0,
              redemptionCount: 0,
            };
          }

          // This outlet's points were used elsewhere
          outletData[contributingOutlet].pointsDistributed +=
            contribution.pointsContributed;
        }
      }
    }

    // Calculate net settlement for each outlet
    const settlements = Object.keys(outletData).map((outlet) => {
      const data = outletData[outlet];
      // Positive = outlet received more points (owes money)
      // Negative = outlet gave more points (is owed money)
      const netSettlement = data.pointsRedeemed - data.pointsDistributed;

      return {
        outlet: outlet,
        pointsDistributed: Math.round(data.pointsDistributed * 100) / 100,
        pointsRedeemed: Math.round(data.pointsRedeemed * 100) / 100,
        netSettlement: Math.round(netSettlement * 100) / 100,
        redemptionCount: data.redemptionCount,
        status:
          netSettlement > 0 ? "owes" : netSettlement < 0 ? "owed" : "balanced",
      };
    });

    return settlements;
  } catch (error) {
    console.error("[L4 Settlement] Error calculating settlement:", error);
    throw error;
  }
}

module.exports = {
  calculateProportionalSplit,
  calculateSettlement,
};
