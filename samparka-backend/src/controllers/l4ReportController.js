const mongoose = require("mongoose");
const Store = require("../models/storeModel");
const Outlet = require("../models/outletModel");
const PointDeductionLog = require("../models/pointDeductionLogModel");
const PointsHistory = require("../models/pointsHistoryModel");
const { calculateSettlement } = require("../services/l4SettlementService");
const { format } = require("@fast-csv/format");

class L4ReportController {
  constructor() {
    // Bind all methods to maintain 'this' context
    this.getSettlementReport = this.getSettlementReport.bind(this);
    this.exportSettlementCSV = this.exportSettlementCSV.bind(this);
    this.exportSettlementPDF = this.exportSettlementPDF.bind(this);
    this._calculateDateRange = this._calculateDateRange.bind(this);
  }

  /**
   * Get settlement report with filters
   * GET /api/l4-reports/settlement/:storeId?period=monthly&year=2024&month=3
   * Periods: daily, weekly, monthly, yearly, all, custom
   */
  async getSettlementReport(req, res) {
    try {
      const { storeId } = req.params;
      const {
        period = "monthly",
        year,
        month,
        week,
        day,
        startDate,
        endDate,
      } = req.query;

      console.log(`[L4 Report] Generating report for store ${storeId}, period: ${period}, year: ${year}, month: ${month}`);

      // Verify store
      const store = await Store.findById(storeId).populate("outlets");
      if (!store) {
        console.log(`[L4 Report] Store not found: ${storeId}`);
        return res
          .status(404)
          .json({ success: false, message: "Store not found" });
      }

      // Access control: admin can view any store; store token can only view its own store
      if (req.store && req.store._id.toString() !== storeId) {
        return res.status(403).json({ success: false, message: "Access Denied" });
      }

      console.log(`[L4 Report] Store found: ${store.name}, format: ${store.loyaltyCard?.format}, multipleOutlets: ${store.services?.multipleOutlets}`);

      if (store.loyaltyCard?.format !== "L4") {
        return res.status(400).json({
          success: false,
          message: "This store is not using L4 loyalty format",
        });
      }

      if (!store.services?.multipleOutlets) {
        return res.status(400).json({
          success: false,
          message: "This store does not have multiple outlets enabled",
        });
      }

      // Calculate date range based on period
      let dateRange;
      try {
        dateRange = this._calculateDateRange(period, {
          year,
          month,
          week,
          day,
          startDate,
          endDate,
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      // Get settlement data (from PointDeductionLog — only claimed rewards are logged here)
      const settlements = await calculateSettlement(
        storeId,
        dateRange.start,
        dateRange.end
      );

      // Get detailed transactions (only claimed rewards appear here)
      const transactions = await PointDeductionLog.find({
        store: storeId,
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      })
        .populate("customer", "name email phone tier points")
        .populate("reward", "name pointCost")
        .sort({ createdAt: -1 });

      // Get points earning summary per outlet (from PointsHistory — bill scan awards)
      const earningSummary = await PointsHistory.aggregate([
        {
          $match: {
            store: new mongoose.Types.ObjectId(storeId),
            outlet: { $exists: true, $ne: null, $ne: "" },
            points: { $gt: 0 }, // only positive earnings (not deductions)
            createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          },
        },
        {
          $group: {
            _id: "$outlet",
            totalPointsAwarded: { $sum: "$points" },
            transactionCount: { $sum: 1 },
          },
        },
      ]);

      // Build outlet summary: start from ALL known outlets so every outlet appears
      // even if it had no redemptions in this period
      const allOutletLocations = store.outlets.map((o) => o.location).filter(Boolean);
      const settlementMap = {};
      for (const s of settlements) {
        settlementMap[s.outlet] = s;
      }
      const earningMap = {};
      for (const e of earningSummary) {
        earningMap[e._id] = e;
      }

      const outletSummary = allOutletLocations.map((outletName) => {
        const s = settlementMap[outletName] || {
          pointsDistributed: 0,
          pointsRedeemed: 0,
          redemptionCount: 0,
          netSettlement: 0,
          status: "balanced",
        };
        const e = earningMap[outletName] || {};
        return {
          outlet: outletName,
          pointsAwarded: e.totalPointsAwarded || 0,
          earningTransactions: e.transactionCount || 0,
          pointsDistributed: s.pointsDistributed,
          pointsRedeemed: s.pointsRedeemed,
          redemptionCount: s.redemptionCount,
          netSettlement: s.netSettlement,
          status: s.status,
        };
      });

      // Build comprehensive report
      const report = {
        store: {
          id: store._id,
          name: store.name,
          outlets: store.outlets.map((o) => ({
            id: o._id,
            location: o.location,
          })),
        },
        period: {
          type: period,
          startDate: dateRange.start,
          endDate: dateRange.end,
        },
        summary: {
          totalOutlets: store.outlets.length,
          totalPointsAwarded: outletSummary.reduce((sum, s) => sum + s.pointsAwarded, 0),
          totalPointsDistributed: outletSummary.reduce(
            (sum, s) => sum + s.pointsDistributed,
            0
          ),
          totalPointsRedeemed: outletSummary.reduce(
            (sum, s) => sum + s.pointsRedeemed,
            0
          ),
          totalRedemptions: outletSummary.reduce(
            (sum, s) => sum + s.redemptionCount,
            0
          ),
        },
        outletSummary,
        detailedTransactions: transactions.map((t) => ({
          date: t.createdAt,
          billID: t.billID,
          customer: {
            name: t.customer?.name,
            email: t.customer?.email,
            phone: t.customer?.phone,
          },
          reward: t.reward?.name,
          pointsDeducted: t.pointsDeducted,
          claimedAtOutlet: t.outlet,
          outletContributions: t.outletContributions,
          balanceBefore: t.balanceBefore,
          balanceAfter: t.balanceAfter,
        })),
      };

      return res.json({
        success: true,
        report,
      });
    } catch (error) {
      console.error("Error generating settlement report:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to generate report",
        error: error.message,
      });
    }
  }

  /**
   * Export settlement report as CSV
   */
  async exportSettlementCSV(req, res) {
    try {
      const { storeId } = req.params;
      const {
        period = "monthly",
        year,
        month,
        week,
        day,
        startDate,
        endDate,
      } = req.query;

      // Get report data (reuse logic from getSettlementReport)
      const store = await Store.findById(storeId).populate("outlets");
      if (!store) {
        return res
          .status(404)
          .json({ success: false, message: "Store not found" });
      }

      // Access control
      if (req.store && req.store._id.toString() !== storeId) {
        return res.status(403).json({ success: false, message: "Access Denied" });
      }

      let dateRange;
      try {
        dateRange = this._calculateDateRange(period, {
          year,
          month,
          week,
          day,
          startDate,
          endDate,
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      const settlements = await calculateSettlement(
        storeId,
        dateRange.start,
        dateRange.end
      );

      // Get detailed transactions
      const transactions = await PointDeductionLog.find({
        store: storeId,
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      })
        .populate("customer", "name email phone")
        .populate("reward", "name pointCost")
        .sort({ createdAt: -1 });

      // Get earning summary (only awarded points, per outlet)
      const earningSummary = await PointsHistory.aggregate([
        {
          $match: {
            store: new mongoose.Types.ObjectId(storeId),
            outlet: { $exists: true, $ne: null, $ne: "" },
            points: { $gt: 0 },
            createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          },
        },
        {
          $group: {
            _id: "$outlet",
            totalPointsAwarded: { $sum: "$points" },
            transactionCount: { $sum: 1 },
          },
        },
      ]);

      // Build outlet summary from all known outlets
      const allOutletLocations = store.outlets.map((o) => o.location).filter(Boolean);
      const settlementMap = {};
      for (const s of settlements) { settlementMap[s.outlet] = s; }
      const earningMap = {};
      for (const e of earningSummary) { earningMap[e._id] = e; }

      const outletRows = allOutletLocations.map((outletName) => {
        const s = settlementMap[outletName] || {};
        const e = earningMap[outletName] || {};
        return {
          Outlet: outletName,
          "Points Awarded": e.totalPointsAwarded || 0,
          "Points Distributed": s.pointsDistributed || 0,
          "Points Redeemed": s.pointsRedeemed || 0,
          "Net Settlement": s.netSettlement || 0,
          "Redemption Count": s.redemptionCount || 0,
          Status: s.status || "balanced",
        };
      });

      // Prepare CSV data - Detailed Transactions
      const transactionData = transactions.map((t) => {
        const contributingOutlets = t.outletContributions
          ? t.outletContributions
              .map(
                (oc) =>
                  `${oc.outlet}:${oc.pointsContributed}pts(${oc.percentageContribution}%)`
              )
              .join("; ")
          : "";

        return {
          Date: t.createdAt.toISOString().split("T")[0],
          "Bill ID": t.billID || "N/A",
          "Customer Name": t.customer?.name || "Unknown",
          "Customer Phone": t.customer?.phone || "N/A",
          Reward: t.reward?.name || "Unknown",
          "Points Deducted": t.pointsDeducted,
          "Claimed At Outlet": t.outlet || "N/A",
          "Contributing Outlets": contributingOutlets,
        };
      });

      // Set headers for CSV download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=l4-settlement-${storeId}-${Date.now()}.csv`
      );

      // Create CSV stream
      const csvStream = format({ headers: true });
      csvStream.pipe(res);

      // Write outlet summary section
      csvStream.write([
        "OUTLET SUMMARY",
        "",
        "",
        "",
        "",
        "",
        "",
      ]);
      outletRows.forEach((row) => csvStream.write(row));

      // Add separator
      csvStream.write(["", "", "", "", "", "", ""]);
      csvStream.write(["", "", "", "", "", "", ""]);

      // Write detailed transactions section
      csvStream.write([
        "DETAILED TRANSACTIONS",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]);
      transactionData.forEach((row) => csvStream.write(row));

      csvStream.end();
    } catch (error) {
      console.error("Error exporting CSV:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to export CSV",
        error: error.message,
      });
    }
  }

  /**
   * Export settlement report as PDF
   * Note: Requires pdfkit to be installed
   */
  async exportSettlementPDF(req, res) {
    try {
      const PDFDocument = require("pdfkit");
      const { storeId } = req.params;
      const {
        period = "monthly",
        year,
        month,
        week,
        day,
        startDate,
        endDate,
      } = req.query;

      // Get report data
      const store = await Store.findById(storeId).populate("outlets");
      if (!store) {
        return res
          .status(404)
          .json({ success: false, message: "Store not found" });
      }

      // Access control
      if (req.store && req.store._id.toString() !== storeId) {
        return res.status(403).json({ success: false, message: "Access Denied" });
      }

      let dateRange;
      try {
        dateRange = this._calculateDateRange(period, {
          year,
          month,
          week,
          day,
          startDate,
          endDate,
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      const settlements = await calculateSettlement(
        storeId,
        dateRange.start,
        dateRange.end
      );

      // Get earning summary (only positive points, per outlet)
      const earningSummary = await PointsHistory.aggregate([
        {
          $match: {
            store: new mongoose.Types.ObjectId(storeId),
            outlet: { $exists: true, $ne: null, $ne: "" },
            points: { $gt: 0 },
            createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          },
        },
        {
          $group: {
            _id: "$outlet",
            totalPointsAwarded: { $sum: "$points" },
          },
        },
      ]);

      const settlementMap = {};
      for (const s of settlements) { settlementMap[s.outlet] = s; }
      const earningMap = {};
      for (const e of earningSummary) { earningMap[e._id] = e; }

      const allOutletLocations = store.outlets.map((o) => o.location).filter(Boolean);

      // Create PDF
      const doc = new PDFDocument({ margin: 50 });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=l4-settlement-${storeId}-${Date.now()}.pdf`
      );

      doc.pipe(res);

      // Header
      doc.fontSize(20).text("L4 Outlet Settlement Report", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Store: ${store.name}`, { align: "center" });
      doc
        .fontSize(10)
        .text(
          `Period: ${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`,
          { align: "center" }
        );
      doc.moveDown(2);

      // Outlet Summary Table
      doc.fontSize(14).text("Outlet Summary", { underline: true });
      doc.moveDown();

      allOutletLocations.forEach((outletName) => {
        const settlement = settlementMap[outletName] || {};
        const earning = earningMap[outletName] || {};

        doc.fontSize(10);
        doc.text(`Outlet: ${outletName}`, { continued: false });
        doc.text(`  Points Awarded: ${earning.totalPointsAwarded || 0}`);
        doc.text(`  Points Distributed: ${settlement.pointsDistributed || 0}`);
        doc.text(`  Points Redeemed: ${settlement.pointsRedeemed || 0}`);
        doc.text(`  Net Settlement: ${settlement.netSettlement || 0} (${settlement.status || "balanced"})`);
        doc.text(`  Redemptions: ${settlement.redemptionCount || 0}`);
        doc.moveDown();
      });

      doc.end();
    } catch (error) {
      console.error("Error exporting PDF:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to export PDF",
        error: error.message,
      });
    }
  }

  /**
   * Helper: Calculate date range based on period
   */
  _calculateDateRange(period, params) {
    const now = new Date();
    let start, end;

    switch (period) {
      case "daily":
        const targetDay = params.day
          ? new Date(params.year, params.month - 1, params.day)
          : now;
        start = new Date(targetDay.setHours(0, 0, 0, 0));
        end = new Date(targetDay);
        end.setHours(23, 59, 59, 999);
        break;

      case "weekly":
        if (!params.year || !params.week) {
          throw new Error("Weekly period requires year and week parameters");
        }
        // Week of year calculation
        const weekStart = new Date(
          params.year,
          0,
          1 + (params.week - 1) * 7
        );
        start = new Date(weekStart.setHours(0, 0, 0, 0));
        end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
        break;

      case "monthly":
        const targetYear = params.year || now.getFullYear();
        const targetMonth = params.month ? params.month - 1 : now.getMonth();
        start = new Date(targetYear, targetMonth, 1, 0, 0, 0, 0);
        end = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
        break;

      case "yearly":
        const year = params.year || now.getFullYear();
        start = new Date(year, 0, 1, 0, 0, 0, 0);
        end = new Date(year, 11, 31, 23, 59, 59, 999);
        break;

      case "custom":
        if (!params.startDate || !params.endDate) {
          throw new Error(
            "Custom period requires startDate and endDate parameters"
          );
        }
        start = new Date(params.startDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(params.endDate);
        end.setHours(23, 59, 59, 999);
        break;

      case "all":
      default:
        start = new Date(0); // Unix epoch
        end = new Date();
        break;
    }

    return { start, end };
  }
}

module.exports = new L4ReportController();
