const mongoose = require("mongoose");

const visitByOutletSchema = new mongoose.Schema(
  {
    outlet: { type: String, required: true },
    visitCount: { type: Number, default: 0 },
    firstVisit: { type: Date },
    lastVisit: { type: Date },
  },
  { _id: false }
);

const visitGapSchema = new mongoose.Schema(
  {
    gap: { type: Number, required: true }, // Days between visits
    visitDate: { type: Date, required: true },
  },
  { _id: false }
);

const customerAnalyticsSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    // Core visit metrics
    visitCount: { type: Number, default: 0 },
    firstVisit: { type: Date },
    lastVisit: { type: Date },
    // Auto-calculated segment
    segment: {
      type: String,
      enum: ["first_visit", "second_visit", "third_visit", "fourth_visit", "5+_visits"],
      default: "first_visit",
    },
    // Outlet breakdown
    visitsByOutlet: [visitByOutletSchema],
    // Retention metrics
    avgDaysBetweenVisits: { type: Number, default: null },
    visitGaps: [visitGapSchema], // Last 10 gaps
    // Aggregated data
    totalPointsEarned: { type: Number, default: 0 },
    monthlyVisits: {
      type: Map,
      of: Number, // "YYYY-MM" -> count
      default: new Map(),
    },
  },
  { timestamps: true }
);

// Indexes for query optimization
customerAnalyticsSchema.index({ store: 1, customer: 1 }, { unique: true });
customerAnalyticsSchema.index({ store: 1, segment: 1 });
customerAnalyticsSchema.index({ store: 1, lastVisit: -1 });
customerAnalyticsSchema.index({ store: 1, visitCount: -1 });
customerAnalyticsSchema.index({ customer: 1 }); // For customer-only lookups

// Calculate segment based on visitCount
customerAnalyticsSchema.methods.calculateSegment = function () {
  if (this.visitCount === 1) return "first_visit";
  if (this.visitCount === 2) return "second_visit";
  if (this.visitCount === 3) return "third_visit";
  if (this.visitCount === 4) return "fourth_visit";
  return "5+_visits";
};

// Pre-save hook to auto-calculate segment
customerAnalyticsSchema.pre("save", function (next) {
  this.segment = this.calculateSegment();
  next();
});

module.exports = mongoose.model("CustomerAnalytics", customerAnalyticsSchema);
