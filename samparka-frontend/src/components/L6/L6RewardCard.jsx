import { useState } from "react";
import { Gift, Lock, Star, Coins, Target, Flame, Clock3 } from "lucide-react";

const typeConfig = {
  tier: { icon: Star, label: "Tier", color: "#f59e0b" },
  point: { icon: Coins, label: "Point", color: "#3b82f6" },
  mission: { icon: Target, label: "Mission", color: "#8b5cf6" },
  streak: { icon: Flame, label: "Streak", color: "#f97316" },
};

const L6RewardCard = ({
  reward,
  customerPoints,
  customerTier,
  visitStreak = 0,
  missionProgress,
  redeemedCount = 0,
  onRedeem,
  loading,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { isTierBased, isPointBased, isMissionBased, isStreakBased } = reward;

  const category = isMissionBased ? "mission" : isPointBased ? "point" : isStreakBased ? "streak" : "tier";
  const { icon: TypeIcon, color, label: typeLabel } = typeConfig[category];

  const tierMatch = !isTierBased || (customerTier || "").toLowerCase() === (reward.tier || "").toLowerCase();

  const hasEnoughPoints = !isPointBased || (customerPoints >= (reward.pointCost || 0));

  const missionDone = (() => {
    if (!isMissionBased) return true;
    const missions = Array.isArray(reward.l6Missions) ? reward.l6Missions : [];
    if (missions.length === 0) return false;
    return missions.every((m) => {
      const prog = missionProgress?.[m.title] || {};
      if (m.missionType === "multiItem" && Array.isArray(m.items)) {
        return m.items.every((item) => (prog[item.itemName] || 0) >= (item.goal || 1));
      }
      return (typeof prog === "number" ? prog : prog?.progress || 0) >= (m.goal || 1);
    });
  })();

  const streakMet = !isStreakBased || (visitStreak >= (reward.streakGoal || 1));

  const hasReachedRedemptionLimit = !reward.evergreen && redeemedCount >= (reward.redeemableTimes || 1);
  const canClaim = tierMatch && hasEnoughPoints && missionDone && streakMet && reward.redeemable && !hasReachedRedemptionLimit;
  const incompleteStatus = !reward.redeemable
    ? "Locked"
    : !tierMatch
      ? `Need ${reward.tier || "tier"}`
      : !hasEnoughPoints
        ? `Need ${Math.max(0, (reward.pointCost || 0))} pts`
        : !missionDone
          ? "Mission incomplete"
          : !streakMet
            ? `Need ${reward.streakGoal || 1}d streak`
            : "Incomplete";
  const buttonText = hasReachedRedemptionLimit ? "Claimed" : canClaim ? "Claim" : incompleteStatus;

  const showDaysText = !reward.evergreen && Number(reward.validity) > 0;
  const daysText = `${reward.validity || 0} days`;

  const handleClaimClick = () => {
    if (!canClaim || loading) return;
    setShowConfirmModal(true);
  };

  const handleConfirmClaim = () => {
    setShowConfirmModal(false);
    onRedeem(reward._id);
  };

  return (
    <div className="rounded-[22px] border border-zinc-300 bg-white px-3.5 py-3.5 shadow-[0_10px_24px_-22px_rgba(24,24,27,0.8)]">
      <div className="flex items-start gap-3.5">
        <div className="h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl border border-zinc-300 bg-zinc-100">
          {reward.image ? (
            <img src={reward.image} alt={reward.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center" style={{ color }}>
              <TypeIcon size={20} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2.5">
            <p className="line-clamp-1 pr-1 text-[15px] font-semibold text-zinc-900" style={{ fontFamily: "var(--font-garet, var(--font-poppins, Poppins, sans-serif))" }}>
              {reward.name}
            </p>
            {showDaysText && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-zinc-300 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                <Clock3 size={10} />
                {daysText}
              </span>
            )}
          </div>
          <p className="line-clamp-2 text-[11px] leading-relaxed text-zinc-500">{reward.description}</p>

          <div className="flex items-center justify-between gap-2 border-t border-zinc-100 pt-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${color}18`, color }}>
              <TypeIcon size={10} />
              {typeLabel}
            </span>
            <button
              disabled={!canClaim || loading}
              onClick={handleClaimClick}
              className="inline-flex shrink items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold transition-all duration-200 whitespace-nowrap"
              style={{
                fontSize: "11px",
                background: canClaim ? "#111827" : "#f4f4f5",
                color: canClaim ? "#fff" : "#9ca3af",
                cursor: canClaim ? "pointer" : "not-allowed",
              }}
            >
              {canClaim ? <Gift size={7} /> : <Lock size={7} />}
              {buttonText}
            </button>
          </div>
        </div>
      </div>

      {/* Claim Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 bg-white">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full mb-4 bg-orange-100">
              <Gift className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-base font-semibold text-center mb-1 text-zinc-900">
              Claim Reward
            </h3>
            <p className="text-sm text-center mb-6 text-zinc-500">
              Are you sure you want to claim{" "}
              <span className="font-medium text-zinc-700">{reward.name}</span>?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClaim}
                className="flex-1 px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
              >
                Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default L6RewardCard;
