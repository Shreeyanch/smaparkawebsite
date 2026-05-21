/**
 * L4 Tier Upgrade Logic
 * Upgrades customer tier based on point accumulation
 * Unlike L34HA, L4 does NOT deduct points on tier upgrade
 * Points carry forward to the new tier
 */
function upgradeTierL4(customer, tiers) {
  if (!customer || !tiers || !Array.isArray(tiers)) {
    return customer;
  }

  const currentPoints = customer.points || 0;
  const currentTierIndex = tiers.findIndex((t) => t.name === customer.tier);

  // If customer not in any tier, start from Bronze (first tier)
  if (currentTierIndex === -1) {
    customer.tier = tiers[0]?.name || "Bronze";
    customer.lastTierChecked = new Date();
    return customer;
  }

  // Check from top tier downward to find highest eligible tier
  for (let i = tiers.length - 1; i > currentTierIndex; i--) {
    const targetTier = tiers[i];

    // Upgrade if customer has enough points to enter this tier
    // Use minPoints threshold for upgrade (customer must cross into tier range)
    if (currentPoints >= targetTier.minPoints) {
      customer.tier = targetTier.name;
      customer.lastTierChecked = new Date();
      // L4: Points carry forward - NO deduction
      return customer;
    }
  }

  // No upgrade needed
  return customer;
}

module.exports = upgradeTierL4;
