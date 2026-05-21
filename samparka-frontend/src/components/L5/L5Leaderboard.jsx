import React, { useState, useEffect } from "react";
import { Trophy, Crown, Coffee, Flame, ChevronLeft, Star, Zap, Gift } from "lucide-react";

/**
 * L5 Monthly Leaderboard Component
 * A competitive, gamified leaderboard with premium aesthetics
 *
 *
 * Design Direction: Premium gaming meets coffee culture
 * - Deep blacks with gold accents for prestige
 * - Animated rank changes and glowing effects
 * - Trophy podium for top 3 with distinct visual treatment
 */
const L5Leaderboard = ({
  leaderboard = [],
  currentUserId,
  currentUserRank,
  month,
  year,
  prizes = [],
  coffeeHero = null,
  minQualifyPoints = 3000,
  onBack,
}) => {
  const [animatedRanks, setAnimatedRanks] = useState([]);

  // Animate entries on mount
  useEffect(() => {
    leaderboard.forEach((_, index) => {
      setTimeout(() => {
        setAnimatedRanks((prev) => [...prev, index]);
      }, index * 80);
    });
  }, [leaderboard]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return {
          bg: "from-amber-500/20 via-yellow-500/10 to-amber-600/20",
          border: "border-amber-400/50",
          text: "text-amber-300",
          glow: "shadow-amber-500/30",
          icon: "text-amber-400",
        };
      case 2:
        return {
          bg: "from-slate-400/20 via-gray-300/10 to-slate-500/20",
          border: "border-slate-300/50",
          text: "text-slate-200",
          glow: "shadow-slate-400/30",
          icon: "text-slate-300",
        };
      case 3:
        return {
          bg: "from-orange-600/20 via-amber-700/10 to-orange-700/20",
          border: "border-orange-500/50",
          text: "text-orange-300",
          glow: "shadow-orange-500/30",
          icon: "text-orange-400",
        };
      default:
        return {
          bg: "from-stone-800/50 to-stone-900/50",
          border: "border-stone-700/30",
          text: "text-stone-300",
          glow: "",
          icon: "text-stone-500",
        };
    }
  };

  const getPrizeForRank = (rank) => {
    if (rank === 1) return "Rs. 10,000 Voucher";
    if (rank === 2) return "Rs. 5,000 Voucher";
    if (rank === 3) return "Rs. 3,000 Voucher";
    if (rank >= 4 && rank <= 10) return "2 Movie Tickets";
    return null;
  };

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3, 10);

  return (
    <div
      className="min-h-screen pb-20"
      style={{
        background: `
          radial-gradient(ellipse at 50% 0%, rgba(217, 119, 6, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 0% 100%, rgba(180, 83, 9, 0.05) 0%, transparent 40%),
          radial-gradient(ellipse at 100% 50%, rgba(245, 158, 11, 0.03) 0%, transparent 40%),
          linear-gradient(180deg, #0c0a09 0%, #1c1917 50%, #0c0a09 100%)
        `,
      }}
    >
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-stone-950/80 border-b border-stone-800/50">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-stone-800/50 hover:bg-stone-700/50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-stone-400" />
            </button>
            <div className="flex-1">
              <h1
                className="text-xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Leaderboard
              </h1>
              <p className="text-xs text-stone-500 tracking-wide">
                {monthNames[month - 1]} {year}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-xs font-bold">#{currentUserRank || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Coffee Hero Banner */}
        {coffeeHero && (
          <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-amber-900/30 via-amber-800/20 to-amber-900/30 border border-amber-500/20 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10">
              <Coffee className="w-full h-full text-amber-400" />
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Flame className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-amber-400/70 font-medium tracking-wide uppercase">Coffee Hero</p>
                <p className="text-white font-bold">{coffeeHero.customer?.name || "Champion"}</p>
                <p className="text-xs text-stone-400">{coffeeHero.totalPointsRedeemed?.toLocaleString()} pts redeemed</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-amber-400/70">Prize</p>
                <p className="text-sm text-amber-300 font-bold">30 Days Free Coffee</p>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Podium */}
        {top3.length >= 3 && (
          <div className="mb-8">
            <div className="flex items-end justify-center gap-2 mb-4">
              {/* 2nd Place */}
              <div
                className={`w-1/3 transform transition-all duration-500 ${
                  animatedRanks.includes(1) ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
              >
                <div className="relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-b from-slate-300 to-slate-500 flex items-center justify-center shadow-lg">
                      <span className="text-stone-900 font-bold text-sm">2</span>
                    </div>
                  </div>
                  <div className="pt-6 pb-4 px-3 bg-gradient-to-b from-slate-400/10 to-slate-600/5 rounded-t-2xl border border-slate-400/20 border-b-0 text-center h-[140px]">
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-500/20 flex items-center justify-center mb-2">
                      <span className="text-slate-300 font-bold text-lg">{top3[1].customer?.name?.[0]}</span>
                    </div>
                    <p className="text-white font-semibold text-sm truncate">{top3[1].customer?.name}</p>
                    <p className="text-slate-400 text-xs font-bold">{top3[1].totalPointsEarned?.toLocaleString()} pts</p>
                    <p className="text-xs text-slate-500 mt-1">Rs. 5,000</p>
                  </div>
                </div>
              </div>

              {/* 1st Place */}
              <div
                className={`w-1/3 transform transition-all duration-500 ${
                  animatedRanks.includes(0) ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
              >
                <div className="relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
                    <Crown className="w-10 h-10 text-amber-400 drop-shadow-lg" />
                  </div>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <span className="text-stone-900 font-bold">1</span>
                    </div>
                  </div>
                  <div className="pt-8 pb-4 px-3 bg-gradient-to-b from-amber-500/15 to-amber-700/5 rounded-t-2xl border border-amber-400/30 border-b-0 text-center h-[160px] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-amber-400/5" />
                    <div className="relative z-10">
                      <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center mb-2 ring-2 ring-amber-400/30">
                        <span className="text-amber-300 font-bold text-xl">{top3[0].customer?.name?.[0]}</span>
                      </div>
                      <p className="text-white font-bold truncate">{top3[0].customer?.name}</p>
                      <p className="text-amber-400 text-sm font-bold">{top3[0].totalPointsEarned?.toLocaleString()} pts</p>
                      <p className="text-xs text-amber-300/70 mt-1">Rs. 10,000</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3rd Place */}
              <div
                className={`w-1/3 transform transition-all duration-500 ${
                  animatedRanks.includes(2) ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
              >
                <div className="relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-b from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
                      <span className="text-stone-900 font-bold text-sm">3</span>
                    </div>
                  </div>
                  <div className="pt-6 pb-4 px-3 bg-gradient-to-b from-orange-500/10 to-orange-700/5 rounded-t-2xl border border-orange-500/20 border-b-0 text-center h-[120px]">
                    <div className="w-12 h-12 mx-auto rounded-full bg-orange-500/20 flex items-center justify-center mb-2">
                      <span className="text-orange-300 font-bold text-lg">{top3[2].customer?.name?.[0]}</span>
                    </div>
                    <p className="text-white font-semibold text-sm truncate">{top3[2].customer?.name}</p>
                    <p className="text-orange-400 text-xs font-bold">{top3[2].totalPointsEarned?.toLocaleString()} pts</p>
                    <p className="text-xs text-orange-400/60 mt-1">Rs. 3,000</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Podium Base */}
            <div className="h-2 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent rounded-full" />
          </div>
        )}

        {/* Ranks 4-10 */}
        <div className="space-y-2">
          <p className="text-xs text-stone-500 font-medium tracking-[0.15em] uppercase mb-3 px-2">
            Rising Stars
          </p>
          {rest.map((entry, index) => {
            const rank = index + 4;
            const isCurrentUser = entry.customer?._id === currentUserId;
            const isAnimated = animatedRanks.includes(index + 3);
            const prize = getPrizeForRank(rank);

            return (
              <div
                key={entry.customer?._id || index}
                className={`
                  relative flex items-center gap-4 p-4 rounded-xl
                  transition-all duration-500 transform
                  ${isAnimated ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"}
                  ${isCurrentUser
                    ? "bg-gradient-to-r from-amber-500/15 to-amber-600/5 border border-amber-500/30"
                    : "bg-stone-800/30 hover:bg-stone-800/50 border border-stone-700/30"
                  }
                `}
              >
                {/* Rank */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isCurrentUser ? "bg-amber-500/20" : "bg-stone-700/50"
                }`}>
                  <span className={`font-bold text-sm ${isCurrentUser ? "text-amber-400" : "text-stone-400"}`}>
                    {rank}
                  </span>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${isCurrentUser ? "text-amber-200" : "text-white"}`}>
                    {entry.customer?.name}
                    {isCurrentUser && <span className="ml-2 text-xs text-amber-400">(You)</span>}
                  </p>
                  <p className={`text-xs ${isCurrentUser ? "text-amber-400/70" : "text-stone-500"}`}>
                    {entry.isQualified ? "Qualified" : `${minQualifyPoints - entry.totalPointsEarned} pts to qualify`}
                  </p>
                </div>

                {/* Points */}
                <div className="text-right">
                  <p className={`font-bold ${isCurrentUser ? "text-amber-400" : "text-stone-300"}`}>
                    {entry.totalPointsEarned?.toLocaleString()}
                  </p>
                  <p className="text-xs text-stone-500">points</p>
                </div>

                {/* Prize Badge */}
                {prize && entry.isQualified && (
                  <div className="absolute -right-1 -top-1">
                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                      <Gift className="w-3 h-3 text-stone-900" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Prizes Legend */}
        <div className="mt-8 p-4 bg-stone-800/30 rounded-2xl border border-stone-700/30">
          <p className="text-xs text-stone-500 font-medium tracking-[0.15em] uppercase mb-4">
            Monthly Prizes
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { rank: "1st", prize: "Rs. 10,000", icon: Crown, color: "amber" },
              { rank: "2nd", prize: "Rs. 5,000", icon: Trophy, color: "slate" },
              { rank: "3rd", prize: "Rs. 3,000", icon: Star, color: "orange" },
              { rank: "4-10th", prize: "2 Movie Tickets", icon: Gift, color: "stone" },
            ].map((item) => (
              <div key={item.rank} className="flex items-center gap-2 p-2 bg-stone-900/50 rounded-lg">
                <item.icon className={`w-4 h-4 text-${item.color}-400`} />
                <div>
                  <p className="text-xs text-stone-400">{item.rank}</p>
                  <p className="text-sm text-white font-semibold">{item.prize}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-500 mt-4 text-center">
            Minimum {minQualifyPoints.toLocaleString()} points to qualify
          </p>
        </div>
      </div>
    </div>
  );
};

export default L5Leaderboard;
