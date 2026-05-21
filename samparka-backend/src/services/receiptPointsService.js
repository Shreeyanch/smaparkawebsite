"use strict";

const productModel = require("../models/productModel");

/**
 * Calculate loyalty points for a submitted receipt.
 *
 * @param {object} params
 * @param {object} params.store         - Populated store Mongoose document
 * @param {object} params.extractedData - OCR extracted data (totalAmount, items[])
 * @param {string} params.pointsMode    - "total_based" | "item_based"
 * @returns {Promise<{ points: number, details: string }>}
 */
async function calculateReceiptPoints({ store, extractedData, pointsMode }) {
  if (pointsMode === "item_based" && extractedData.items && extractedData.items.length > 0) {
    return _calculateItemBased(store, extractedData.items);
  }
  return _calculateTotalBased(store, extractedData.totalAmount);
}

/**
 * Total-based: convert bill total to points.
 * L4/L34HA: points = totalAmount × pointEarnRate (percentage-based)
 * L1-L3 / standard: points = totalAmount / conversionRate (divisor-based)
 */
async function _calculateTotalBased(store, totalAmount) {
  if (!totalAmount) {
    return { points: 0, details: "No total amount extracted from receipt" };
  }

  // L4/L34HA format: use pointEarnRate percentage instead of conversionRate
  const format = store.loyaltyCard?.format;
  if (format === "L4" || format === "L34HA") {
    const earnRate = store.pointEarnRate || 0.07;
    const rawPoints = totalAmount * earnRate;
    const points = store.isRounded
      ? Math.round(rawPoints)
      : Math.round(rawPoints * 10) / 10;
    console.log(`✅ [ReceiptPoints] L4 calc: ${totalAmount} × ${earnRate} = ${points} pts`);
    return {
      points: Math.max(0, points),
      details: `l4_total_based: ${totalAmount} × ${earnRate} = ${points} pts`,
    };
  }

  // Points mode (custom assignment): staff enters points manually — skip auto-calculation
  if (store.amount === false) {
    return { points: 0, details: "Store uses custom point assignment (Points mode)" };
  }

  const rawRate = store.conversionRate;
  if (!rawRate || rawRate === "null" || rawRate === "undefined") {
    console.warn(`⚠️ [ReceiptPoints] Store ${store._id} (${store.name}) has no conversionRate configured — returning 0 points. Set a conversion rate in Points System Configuration.`);
    return { points: 0, details: "Store conversion rate not configured" };
  }

  const rate = Number(rawRate);
  if (!rate || rate <= 0) {
    console.warn(`⚠️ [ReceiptPoints] Store ${store._id} has invalid conversionRate "${rawRate}" — returning 0 points.`);
    return { points: 0, details: "Invalid conversion rate" };
  }

  let points;
  if (store.isRounded) {
    points = Math.round(totalAmount / rate);
  } else {
    // One decimal place (0.1 increments)
    points = Math.round((totalAmount / rate) * 10) / 10;
  }

  return {
    points: Math.max(0, points),
    details: `total_based: ${totalAmount} / ${rate} = ${points} pts`,
  };
}

/**
 * Item-based: fetch store's qualifying products, match against extracted line items,
 * and award points only on the qualifying sub-total.
 */
async function _calculateItemBased(store, items) {
  // Points mode (custom assignment): skip auto-calculation
  if (store.amount === false) {
    return { points: 0, details: "Store uses custom point assignment (Points mode)" };
  }

  const products = await productModel.find({ storeId: store._id }).lean();
  const productNames = products.map((p) => (p.name || "").toLowerCase().trim());

  let qualifyingTotal = 0;
  const matchedNames = [];

  for (const item of items) {
    const name = (item.name || "").toLowerCase().trim();
    const isMatch = productNames.some(
      (pn) => pn && (name.includes(pn) || pn.includes(name))
    );
    if (isMatch && item.price) {
      qualifyingTotal += item.price * (item.quantity || 1);
      matchedNames.push(item.name);
    }
  }

  if (qualifyingTotal === 0) {
    return { points: 0, details: "item_based: no qualifying items matched" };
  }

  const rate = Number(store.conversionRate);
  if (!rate || rate <= 0) {
    console.warn(`⚠️ [ReceiptPoints] Store ${store._id} has no valid conversionRate for item-based calculation — returning 0 points.`);
    return { points: 0, details: "Store conversion rate not configured for item-based calculation" };
  }
  let points;
  if (store.isRounded) {
    points = Math.round(qualifyingTotal / rate);
  } else {
    points = Math.round((qualifyingTotal / rate) * 10) / 10;
  }

  return {
    points: Math.max(0, points),
    details: `item_based: matched [${matchedNames.join(", ")}], qualifying=${qualifyingTotal}, pts=${points}`,
  };
}

module.exports = { calculateReceiptPoints };
