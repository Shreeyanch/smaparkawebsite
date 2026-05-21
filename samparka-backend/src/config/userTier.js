function userTier(tiers, points) {
  if (!tiers || !Array.isArray(tiers)) return "Default Tier";
  if (typeof points !== "number") return "Invalid Points";

  return (
    tiers.find(
      ({ minPoints, maxPoints }) => points >= minPoints && points <= maxPoints
    )?.name || "Default Tier"
  );
}

module.exports = userTier;
