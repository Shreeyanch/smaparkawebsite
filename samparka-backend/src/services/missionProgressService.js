"use strict";

const customerModel = require("../models/customerModel");

/**
 * Normalise a string for fuzzy item matching.
 */
function norm(str) {
  return (str || "").toLowerCase().trim();
}

/**
 * Check whether a receipt item name matches a mission item name.
 * Returns true if either string contains the other (after normalisation).
 */
function itemMatches(receiptItemName, missionItemName) {
  const r = norm(receiptItemName);
  const m = norm(missionItemName);
  return r && m && (r.includes(m) || m.includes(r));
}

function toDayStart(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

function missionKeyOf(mission) {
  if (mission?._missionId) return String(mission._missionId);
  return String(mission?.title || "");
}

/**
 * Update per-customer mission progress after a receipt is approved.
 *
 * Only multiItem missions are considered. For each mission item, the receipt's
 * extracted line items are matched by name (fuzzy substring). The quantity
 * purchased is added to the customer's running progress, capped at the item goal.
 *
 * @param {object} params
 * @param {object} params.store    - Populated store document (needs loyaltyCard.l6Config)
 * @param {object} params.customer - Customer document
 * @param {Array}  params.items    - extractedData.items from the receipt submission
 * @param {string|Date} params.receiptDate - extracted receipt date (preferred)
 * @param {string|Date} params.submissionCreatedAt - submission created timestamp fallback
 */
async function updateMissionProgress({ store, customer, items, receiptDate, submissionCreatedAt }) {
  try {
    const missions = store.loyaltyCard?.l6Config?.missions;
    if (!Array.isArray(missions) || missions.length === 0) return;
    if (!items || items.length === 0) return;

    const multiItemMissions = missions.filter(
      (m) => m.missionType === "multiItem" && Array.isArray(m.items) && m.items.length > 0
    );
    const simpleMissionsWithItem = missions.filter(
      (m) => m.missionType !== "multiItem" && m.itemName && String(m.itemName).trim()
    );
    if (multiItemMissions.length === 0 && simpleMissionsWithItem.length === 0) return;

    const transactionDay = toDayStart(receiptDate) || toDayStart(submissionCreatedAt) || toDayStart(new Date());

    const l6Data = customer.l6Data || {};
    const missionProgress = { ...(l6Data.missionProgress || {}) };
    let changed = false;

    for (const mission of multiItemMissions) {
      const title = mission.title;
      const missionKey = missionKeyOf(mission);
      if (!title || !missionKey) continue;

      const missionStartDay = toDayStart(mission.createdAt) || toDayStart(mission.updatedAt);
      if (missionStartDay && transactionDay < missionStartDay) {
        continue;
      }

      const existingByKey = missionProgress[missionKey] || {};
      const existingByTitle = missionProgress[title] || {};
      const mProg = { ...existingByTitle, ...existingByKey };

      for (const mItem of mission.items) {
        const itemName = mItem.itemName;
        if (!itemName) continue;
        const goal = Math.max(1, Number(mItem.goal) || 1);
        const currentProgress = mProg[itemName] || 0;
        if (currentProgress >= goal) continue; // already at goal, skip

        for (const receiptItem of items) {
          if (!itemMatches(receiptItem.name, itemName)) continue;
          const qty = Math.max(1, Number(receiptItem.quantity) || 1);
          mProg[itemName] = Math.min(goal, currentProgress + qty);
          changed = true;
          break; // one receipt item can only satisfy one mission item per scan
        }
      }

      missionProgress[missionKey] = mProg;
      if (missionKey !== title) {
        missionProgress[title] = mProg;
      }
    }

    // Process simple missions that track a specific item name
    for (const mission of simpleMissionsWithItem) {
      const title = mission.title;
      const missionKey = missionKeyOf(mission);
      if (!title || !missionKey) continue;

      const missionStartDay = toDayStart(mission.createdAt) || toDayStart(mission.updatedAt);
      if (missionStartDay && transactionDay < missionStartDay) continue;

      const goal = Math.max(1, Number(mission.goal) || 1);
      const existing = missionProgress[missionKey];
      const currentProgress = typeof existing === "number" ? existing : (existing?.progress || 0);
      if (currentProgress >= goal) continue;

      for (const receiptItem of items) {
        if (!itemMatches(receiptItem.name, mission.itemName)) continue;
        const qty = Math.max(1, Number(receiptItem.quantity) || 1);
        const newProgress = Math.min(goal, currentProgress + qty);
        missionProgress[missionKey] = newProgress;
        if (missionKey !== title) missionProgress[title] = newProgress;
        changed = true;
        break;
      }
    }

    if (!changed) return;

    await customerModel.findByIdAndUpdate(customer._id, {
      $set: { l6Data: { ...l6Data, missionProgress } },
    });

    console.log(`✅ [MissionProgress] Updated for customer ${customer._id}`);
  } catch (err) {
    console.error("❌ [MissionProgress] Failed to update mission progress:", err.message);
    // Non-fatal — do not rethrow
  }
}

module.exports = { updateMissionProgress };
