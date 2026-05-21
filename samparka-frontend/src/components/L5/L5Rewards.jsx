import React, { useState } from "react";
import {
  Coffee,
  Percent,
  Gift,
  Mountain,
  ChevronRight,
  Clock,
  CheckCircle2,
  Lock,
  Sparkles,
  MapPin
} from "lucide-react";

/**
 * L5 Rewards Component
 * Premium rewards showcase with milestone tracking
 *
 * Design Direction: Luxury rewards catalog
 * - Card-based layout with premium materials feel
 * - Progress indicators for each reward tier
 * - Glowing unlock animations
 */
const L5Rewards = ({
  outletBreakdown = [],
  selectedOutlet = null,
  onSelectOutlet,
  rewards = [],
  activeDiscounts = [],
  onRedeem,
  isLoading = false,
}) => {
  const [selectedReward, setSelectedReward] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Default HJ rewards
  const defaultRewards = [
    { threshold: 775, rewardType: "physical", rewardName: "Free Americano (S)", icon: Coffee, description: "Start your day with a classic" },
    { threshold: 1500, rewardType: "discount", discountPercentage: 5, rewardName: "5% Off F&B", icon: Percent, description: "Valid for 30 days" },
    { threshold: 2500, rewardType: "discount", discountPercentage: 7, rewardName: "7% Off F&B", icon: Percent, description: "Valid for 30 days" },
    { threshold: 5000, rewardType: "discount", discountPercentage: 10, rewardName: "10% Off F&B", icon: Percent, description: "Valid for 30 days" },
    { threshold: 8000, rewardType: "discount", discountPercentage: 15, rewardName: "15% Off F&B", icon: Percent, description: "Valid for 30 days" },
    { threshold: 10000, rewardType: "discount", discountPercentage: 20, rewardName: "20% Off F&B", icon: Percent, description: "Valid for 30 days" },
    { threshold: 50000, rewardType: "physical", rewardName: "Pokhara Tour", icon: Mountain, description: "2 Nights / 3 Days for 2 People" },
  ];

  const allRewards = rewards.length > 0 ? rewards : defaultRewards;
  const currentOutletPoints = selectedOutlet?.currentPoints || 0;

  // Calculate total stacked discount
  const totalDiscount = activeDiscounts.reduce((sum, d) => sum + (d.discountPercentage || 0), 0);

  const handleRedeemClick = (reward) => {
    setSelectedReward(reward);
    setShowConfirmModal(true);
  };

  const confirmRedeem = () => {
    if (selectedReward && selectedOutlet) {
      onRedeem(selectedOutlet.outletId, selectedReward.threshold);
    }
    setShowConfirmModal(false);
    setSelectedReward(null);
  };

  return (
    <div className="min-h-screen pb-20" style={{
      background: `
        radial-gradient(ellipse at 30% 0%, rgba(217, 119, 6, 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 100%, rgba(16, 185, 129, 0.04) 0%, transparent 50%),
        linear-gradient(180deg, #0c0a09 0%, #1c1917 100%)
      `,
    }}>
      {/* Active Discounts Banner */}
      {totalDiscount > 0 && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-emerald-500/10 border-b border-emerald-500/20">
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-emerald-400/70 font-medium uppercase tracking-wide">Active Discount</p>
                  <p className="text-xl font-bold text-emerald-400">{totalDiscount}% OFF</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeDiscounts.map((d, i) => (
                  <div key={i} className="px-2 py-1 bg-emerald-500/20 rounded-lg">
                    <span className="text-xs font-bold text-emerald-400">{d.discountPercentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Outlet Selector */}
        <div className="mb-6">
          <p className="text-xs text-stone-500 font-medium tracking-[0.15em] uppercase mb-3">
            Select Outlet to Redeem
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {outletBreakdown.map((outlet) => (
              <button
                key={outlet.outletId}
                onClick={() => onSelectOutlet(outlet)}
                className={`flex-shrink-0 px-4 py-3 rounded-xl transition-all duration-200 ${
                  selectedOutlet?.outletId === outlet.outletId
                    ? "bg-amber-500/20 border-2 border-amber-500/50"
                    : "bg-stone-800/50 border-2 border-transparent hover:border-stone-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className={`w-4 h-4 ${
                    selectedOutlet?.outletId === outlet.outletId ? "text-amber-400" : "text-stone-500"
                  }`} />
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${
                      selectedOutlet?.outletId === outlet.outletId ? "text-amber-200" : "text-white"
                    }`}>
                      {outlet.outletName}
                    </p>
                    <p className={`text-xs font-bold ${
                      selectedOutlet?.outletId === outlet.outletId ? "text-amber-400" : "text-stone-400"
                    }`}>
                      {outlet.currentPoints.toLocaleString()} pts
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="space-y-4">
          <p className="text-xs text-stone-500 font-medium tracking-[0.15em] uppercase">
            Available Rewards
          </p>

          {allRewards.map((reward, index) => {
            const isUnlocked = currentOutletPoints >= reward.threshold;
            const progress = Math.min((currentOutletPoints / reward.threshold) * 100, 100);
            const Icon = reward.icon || (reward.rewardType === "discount" ? Percent : Gift);

            return (
              <div
                key={reward.threshold}
                className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
                  isUnlocked
                    ? "bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 border border-amber-500/30"
                    : "bg-stone-800/30 border border-stone-700/30"
                }`}
              >
                {/* Glow Effect for Unlocked */}
                {isUnlocked && (
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 animate-pulse" />
                )}

                <div className="relative p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      isUnlocked
                        ? "bg-amber-500/20 shadow-lg shadow-amber-500/20"
                        : "bg-stone-700/50"
                    }`}>
                      <Icon className={`w-7 h-7 ${isUnlocked ? "text-amber-400" : "text-stone-500"}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className={`font-bold ${isUnlocked ? "text-white" : "text-stone-400"}`}>
                            {reward.rewardName}
                          </p>
                          <p className="text-xs text-stone-500">{reward.description}</p>
                        </div>
                        {isUnlocked ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Lock className="w-5 h-5 text-stone-600" />
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className={isUnlocked ? "text-amber-400" : "text-stone-500"}>
                            {currentOutletPoints.toLocaleString()} pts
                          </span>
                          <span className="text-stone-500">
                            {reward.threshold.toLocaleString()} pts
                          </span>
                        </div>
                        <div className="h-1.5 bg-stone-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isUnlocked
                                ? "bg-gradient-to-r from-amber-500 to-amber-400"
                                : "bg-stone-600"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Redeem Button */}
                      {isUnlocked && selectedOutlet && (
                        <button
                          onClick={() => handleRedeemClick(reward)}
                          disabled={isLoading}
                          className="mt-3 w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-900 font-bold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/25 disabled:opacity-50"
                        >
                          {isLoading ? "Processing..." : "Redeem Now"}
                        </button>
                      )}

                      {!isUnlocked && (
                        <p className="mt-2 text-xs text-stone-500">
                          <span className="text-amber-400 font-semibold">
                            {(reward.threshold - currentOutletPoints).toLocaleString()}
                          </span> more points needed
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Outlet Selected Message */}
        {!selectedOutlet && outletBreakdown.length > 0 && (
          <div className="mt-8 p-6 bg-stone-800/30 rounded-2xl border border-stone-700/30 text-center">
            <MapPin className="w-10 h-10 text-stone-600 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">Select an Outlet</p>
            <p className="text-sm text-stone-500">Choose an outlet above to see available rewards</p>
          </div>
        )}

        {/* No Points Yet */}
        {outletBreakdown.length === 0 && (
          <div className="mt-8 p-6 bg-stone-800/30 rounded-2xl border border-stone-700/30 text-center">
            <Coffee className="w-10 h-10 text-stone-600 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">Start Earning Points</p>
            <p className="text-sm text-stone-500">Visit any Himalayan Java outlet to earn loyalty points!</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 rounded-3xl border border-stone-700 max-w-sm w-full overflow-hidden animate-scaleIn">
            {/* Header */}
            <div className="p-6 bg-gradient-to-b from-amber-500/10 to-transparent border-b border-stone-800">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 flex items-center justify-center mb-4">
                {selectedReward.icon ? (
                  <selectedReward.icon className="w-8 h-8 text-amber-400" />
                ) : (
                  <Gift className="w-8 h-8 text-amber-400" />
                )}
              </div>
              <h3 className="text-xl font-bold text-white text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
                Confirm Redemption
              </h3>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-stone-800/50 rounded-xl">
                  <span className="text-stone-400">Reward</span>
                  <span className="text-white font-semibold">{selectedReward.rewardName}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-stone-800/50 rounded-xl">
                  <span className="text-stone-400">Points Required</span>
                  <span className="text-amber-400 font-bold">{selectedReward.threshold.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-stone-800/50 rounded-xl">
                  <span className="text-stone-400">Outlet</span>
                  <span className="text-white font-semibold">{selectedOutlet?.outletName}</span>
                </div>
                {selectedReward.rewardType === "discount" && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">Valid for 30 days after redemption</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRedeem}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-900 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50"
                >
                  {isLoading ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default L5Rewards;
