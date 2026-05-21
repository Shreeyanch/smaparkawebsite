/**
 * Get Tier Configuration Helper
 * Returns tier-specific configuration for L4 format
 * Includes discount percentage and point earn rate
 */

/**
 * Get automatic discount percentage for customer's current tier
 * @param {Object} customer - Customer document with tier property  
 * @param {Object} store - Store document with loyaltyCard.tier array
 * @returns {Number} - Discount percentage (0-100)
 */
function getTierDiscount(customer, store) {
  if (!customer || !store || !store.loyaltyCard || !store.loyaltyCard.tier) {
    return 0;
  }

  const tiers = store.loyaltyCard.tier;
  const customerTier = customer.tier;

  const tierConfig = tiers.find((t) => t.name === customerTier);

  return tierConfig?.discountPercentage || 0;
}

/**
 * Get point earn rate for L4 format
 * @param {Object} customer - Customer document with tier property
 * @param {Object} store - Store document with pointEarnRate field
 * @returns {Number} - Point earn rate (e.g., 0.07 for 7%)
 */
function getTierEarnRate(customer, store) {
  if (!store) {
    return 0.07; // Default 7%
  }

  // L4 uses store-level earn rate, not tier-specific
  return store.pointEarnRate || 0.07; // Default 7%
}

/**
 * Get full tier configuration for customer
 * @param {Object} customer - Customer document with tier property
 * @param {Object} store - Store document with loyaltyCard.tier array
 * @returns {Object} - Tier configuration object or null
 */
function getTierConfig(customer, store) {
  if (!customer || !store || !store.loyaltyCard || !store.loyaltyCard.tier) {
    return null;
  }

  const tiers = store.loyaltyCard.tier;
  const customerTier = customer.tier;

  return tiers.find((t) => t.name === customerTier) || null;
}

module.exports = {
  getTierDiscount,
  getTierEarnRate,
  getTierConfig,
};
