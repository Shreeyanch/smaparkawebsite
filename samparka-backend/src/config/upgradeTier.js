// function upgradeTier(user, tiers) {
//   const currentIndex = tiers.findIndex((t) => t.name === user.tier);
//   if (currentIndex === -1) return user; // invalid tier

//   let points = user.points;
//   console.log("Before: ", points);
//   for (let i = currentIndex; i < tiers.length - 1; i++) {
//     const currentTier = tiers[i];
//     const nextTier = tiers[i + 1];
//     console.log("Current Tier: ", currentTier.name);
//     console.log("Next Tier: ", nextTier.name);
//     if (points > currentTier.maxPoints) {
//       console.log(true);
//       points -= currentTier.maxPoints; // subtract threshold
//       user.tier = nextTier.name;
//       user.lastTierChecked = new Date();
//     } else {
//       console.log(false);
//       break;
//     }
//   }

//   console.log("After: ", points);
//   user.points = points;
//   return user;
// }

// module.exports = upgradeTier;

function upgradeTier(user, tiers) {
  const currentIndex = tiers.findIndex((t) => t.name === user.tier);
  if (currentIndex === -1) return user; // invalid tier

  const points = user.points;

  // Check from top tier downward to allow direct jumps
  for (let i = tiers.length - 1; i > currentIndex; i--) {
    const targetTier = tiers[i];

    if (points > targetTier.maintain) {
      user.tier = targetTier.name;
      user.points = points - targetTier.maintain;
      user.lastTierChecked = new Date();
      return user;
    }
  }

  return user; // No upgrade
}

module.exports = upgradeTier;
