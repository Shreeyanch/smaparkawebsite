"use strict";

const mongoose = require("mongoose");

const extractedItemSchema = new mongoose.Schema(
  {
    name: { type: String },
    quantity: { type: Number },
    price: { type: Number },
    matched: { type: Boolean, default: false }, // matched against store's product list
  },
  { _id: false }
);

const fraudFlagsSchema = new mongoose.Schema(
  {
    isDuplicate: { type: Boolean, default: false },
    isStale: { type: Boolean, default: false }, // receipt older than maxReceiptAgeDays
    storeMismatch: { type: Boolean, default: false }, // extracted store name doesn't match
    lowConfidence: { type: Boolean, default: false }, // OCR confidence below threshold
    amountAnomaly: { type: Boolean, default: false }, // total exceeds store threshold
    velocityExceeded: { type: Boolean, default: false }, // customer over daily/weekly limit
  },
  { _id: false }
);

const receiptSubmissionSchema = new mongoose.Schema(
  {
    // Who submitted
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    outlet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outlet",
    },
    // How it was submitted
    submittedBy: {
      type: String,
      enum: ["customer", "staff"],
      required: true,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store", // store staff who uploaded (if submittedBy === "staff")
    },

    // Receipt image — stored permanently in S3 for audit, reprocessing, and evidence
    imageKey: { type: String, required: true },

    // OCR / AI extracted data — stored in full for future analytics and data mining
    extractedData: {
      receiptNumber: { type: String }, // maps to billID; used for Layer 1 duplicate check
      receiptDate: { type: Date },
      storeName: { type: String },
      customerName: { type: String }, // bill-to / customer name printed on receipt (AI providers only)
      totalAmount: { type: Number }, // maps to billAmount
      items: { type: [extractedItemSchema], default: [] }, // full line-items for analytics
      rawText: { type: String }, // complete OCR text preserved for data mining
      ocrProvider: { type: String }, // which provider processed this receipt
      confidence: { type: Number, min: 0, max: 1 }, // 0–1 OCR confidence score
    },

    // Layer 2 duplicate detection fingerprint
    // SHA-256 of: normalize(receiptNumber) | YYYY-MM-DD | totalCents | storeId
    receiptHash: { type: String, index: true },

    // Points calculation
    calculatedPoints: { type: Number, default: 0 },
    pointsMode: {
      type: String,
      enum: ["total_based", "item_based"],
      default: "total_based",
    },

    // Workflow status
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "flagged",
        "auto_approved",
        "reversed",
      ],
      default: "pending",
      index: true,
    },
    approvalMode: {
      type: String,
      enum: ["hold", "auto_flag", "fully_automated"],
    },

    // Fraud analysis
    fraudScore: { type: Number, default: 0, min: 0, max: 100 },
    fraudFlags: { type: fraudFlagsSchema, default: () => ({}) },

    // Admin review
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    reviewedAt: { type: Date },
    reviewNotes: { type: String },
    rejectionReason: { type: String },

    // Points awarded (set on approval / auto-approval)
    pointsAwarded: { type: Number },
    // Polymorphic link to L5PointsTransaction or PointsHistory
    transactionRef: { type: mongoose.Schema.Types.ObjectId },
    transactionRefModel: {
      type: String,
      enum: ["L5PointsTransaction", "PointsHistory"],
    },

    // Reversal tracking
    reversedAt: { type: Date },
    reversedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
  },
  { timestamps: true }
);

// Admin review queue — most common query: list by store + status, sorted newest first
receiptSubmissionSchema.index({ store: 1, status: 1, createdAt: -1 });

// Customer history
receiptSubmissionSchema.index({ customer: 1, store: 1, createdAt: -1 });

// Layer 2 duplicate detection — compound per store
receiptSubmissionSchema.index({ store: 1, receiptHash: 1 });

// Layer 1 duplicate detection — bill ID per store (sparse: only indexed when field exists)
receiptSubmissionSchema.index(
  { store: 1, "extractedData.receiptNumber": 1 },
  { sparse: true }
);

module.exports = mongoose.model("ReceiptSubmission", receiptSubmissionSchema);
