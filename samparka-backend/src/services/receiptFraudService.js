"use strict";

const crypto = require("crypto");
const receiptSubmissionModel = require("../models/receiptSubmissionModel");

/**
 * Builds the SHA-256 content fingerprint for a receipt (Layer 2 duplicate detection).
 *
 * Fingerprint input: "<receiptNumber>|<YYYY-MM-DD>|<totalCents>|<storeId>"
 *
 * Normalization rules:
 * - receiptNumber: trimmed and lowercased; empty string if null
 * - receiptDate: UTC date only (no time) to avoid same-day re-submission variance; "unknown" if null
 * - totalAmount: converted to integer cents to avoid IEEE-754 float rounding differences
 * - storeId: raw ObjectId string to scope duplicates per store
 */
function buildReceiptHash(receiptNumber, receiptDate, totalAmount, storeId) {
  const number = (receiptNumber || "").trim().toLowerCase().replace(/\s+/g, " ");
  const date = receiptDate
    ? new Date(receiptDate).toISOString().slice(0, 10)
    : "unknown";
  const cents = Math.round((totalAmount || 0) * 100);
  const raw = `${number}|${date}|${cents}|${storeId}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

/**
 * Active statuses — submissions in these states block re-submission.
 * Rejected submissions are excluded so a customer can resubmit a legitimately rejected receipt.
 */
const ACTIVE_STATUSES = ["pending", "approved", "auto_approved", "flagged"];

/**
 * Runs all fraud signals against an extracted receipt for a given store config.
 *
 * Scoring table:
 *   Duplicate bill ID found          → +100 (hard block)
 *   Duplicate hash found             → +100 (hard block)
 *   Receipt older than maxAgeDays    → +40
 *   No date extracted                → +15
 *   Store name not in aliases        → +30
 *   No store name extracted          → +10
 *   OCR confidence < ocrConfidenceMin→ +25
 *   Total exceeds maxAmountThreshold → +20
 *   Daily or weekly velocity exceeded→ +35
 *
 * @param {object} params
 * @param {object} params.extracted    - OCR extracted data object
 * @param {object} params.store        - Mongoose store document
 * @param {string} params.customerId   - Customer ObjectId string
 * @param {string} params.receiptHash  - Pre-computed content hash
 * @returns {Promise<{ fraudScore: number, fraudFlags: object, isDuplicate: boolean }>}
 */
async function analyzeReceipt({ extracted, store, customerId, receiptHash }) {
  const config = store.receiptScan || {};
  const flags = {
    isDuplicate: false,
    isStale: false,
    storeMismatch: false,
    lowConfidence: false,
    amountAnomaly: false,
    velocityExceeded: false,
  };

  let score = 0;

  // ── 1. LAYER 1: Bill ID exact match ──────────────────────────────────────
  if (extracted.receiptNumber) {
    const billDuplicate = await receiptSubmissionModel.findOne({
      store: store._id,
      "extractedData.receiptNumber": extracted.receiptNumber.trim().toLowerCase(),
      status: { $in: ACTIVE_STATUSES },
    });
    if (billDuplicate) {
      flags.isDuplicate = true;
      score += 100;
    }
  }

  // ── 2. LAYER 2: Content hash duplicate ───────────────────────────────────
  if (!flags.isDuplicate) {
    const hashDuplicate = await receiptSubmissionModel.findOne({
      store: store._id,
      receiptHash,
      status: { $in: ACTIVE_STATUSES },
    });
    if (hashDuplicate) {
      flags.isDuplicate = true;
      score += 100;
    }
  }

  // ── 3. STALE RECEIPT ──────────────────────────────────────────────────────
  const maxAgeDays = config.maxReceiptAgeDays ?? 7;
  if (extracted.receiptDate) {
    const ageMs = Date.now() - new Date(extracted.receiptDate).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    if (ageDays > maxAgeDays) {
      flags.isStale = true;
      score += 40;
    }
  } else {
    // No date extracted — moderate suspicion
    score += 15;
  }

  // ── 4. STORE NAME MISMATCH ────────────────────────────────────────────────
  if (extracted.storeName) {
    const aliases = [store.name, ...(config.nameAliases || [])].map((n) =>
      (n || "").toLowerCase().trim()
    );
    const extractedName = extracted.storeName.toLowerCase().trim();
    const anyMatch = aliases.some(
      (alias) => alias && (extractedName.includes(alias) || alias.includes(extractedName))
    );
    if (!anyMatch) {
      flags.storeMismatch = true;
      score += 30;
    }
  } else {
    // No store name extracted
    score += 10;
  }

  // ── 5. LOW OCR CONFIDENCE ─────────────────────────────────────────────────
  const confidenceMin = config.ocrConfidenceMin ?? 0.6;
  if (typeof extracted.confidence === "number" && extracted.confidence < confidenceMin) {
    flags.lowConfidence = true;
    score += 25;
  }

  // ── 6. AMOUNT ANOMALY ─────────────────────────────────────────────────────
  if (
    config.maxAmountThreshold &&
    extracted.totalAmount &&
    extracted.totalAmount > config.maxAmountThreshold
  ) {
    flags.amountAnomaly = true;
    score += 20;
  }

  // ── 7. VELOCITY CHECK (daily + weekly) ───────────────────────────────────
  const now = new Date();

  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  const [dailyCount, weeklyCount] = await Promise.all([
    receiptSubmissionModel.countDocuments({
      customer: customerId,
      store: store._id,
      createdAt: { $gte: dayStart },
      status: { $nin: ["rejected"] },
    }),
    receiptSubmissionModel.countDocuments({
      customer: customerId,
      store: store._id,
      createdAt: { $gte: weekStart },
      status: { $nin: ["rejected"] },
    }),
  ]);

  const dailyLimit = config.dailySubmitLimit ?? 3;
  const weeklyLimit = config.weeklySubmitLimit ?? 10;

  if (dailyCount >= dailyLimit || weeklyCount >= weeklyLimit) {
    flags.velocityExceeded = true;
    score += 35;
  }

  return {
    fraudScore: Math.min(score, 100),
    fraudFlags: flags,
    isDuplicate: flags.isDuplicate,
  };
}

module.exports = { buildReceiptHash, analyzeReceipt };
