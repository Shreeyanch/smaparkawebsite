import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Trophy,
  Crown,
  Gift,
  Settings,
  Users,
  TrendingUp,
  Calendar,
  Award,
  Flame,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Ticket,
  Coffee,
  Star,
  Zap,
  RefreshCw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import l5Api from "../../../api/l5Api";

/**
 * L5 Admin Dashboard
 * Manage L5 loyalty program - leaderboard, prizes, vouchers, configuration
 *
 * Design: Dark professional admin interface with amber accents
 */
const L5AdminDashboard = ({ store }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [prizeAmount, setPrizeAmount] = useState("");

  const storeId = store?._id;
  const adminToken = localStorage.getItem("storeToken");

  // Fetch leaderboard
  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["l5AdminLeaderboard", storeId],
    queryFn: () => l5Api.getCurrentLeaderboard(storeId, adminToken),
    enabled: !!storeId && !!adminToken,
    staleTime: 30000,
  });

  // Fetch monthly winners history
  const { data: winnersData } = useQuery({
    queryKey: ["l5Winners", storeId],
    queryFn: () => l5Api.getMonthlyWinners(storeId, adminToken),
    enabled: !!storeId && !!adminToken,
    staleTime: 60000,
  });

  // Fetch three month winners
  const { data: threeMonthData } = useQuery({
    queryKey: ["l5ThreeMonthWinners", storeId],
    queryFn: () => l5Api.getThreeMonthWinners(storeId, adminToken),
    enabled: !!storeId && !!adminToken,
    staleTime: 60000,
  });

  // Fetch config
  const { data: configData } = useQuery({
    queryKey: ["l5AdminConfig", storeId],
    queryFn: () => l5Api.getConfig(storeId, adminToken),
    enabled: !!storeId && !!adminToken,
    staleTime: 300000,
  });

  // Award prizes mutation
  const awardMutation = useMutation({
    mutationFn: ({ month, year, prizes }) =>
      l5Api.awardPrizes(storeId, month, year, prizes, adminToken),
    onSuccess: () => {
      toast.success("Prizes awarded successfully!");
      queryClient.invalidateQueries(["l5AdminLeaderboard", storeId]);
      queryClient.invalidateQueries(["l5Winners", storeId]);
      setShowPrizeModal(false);
      setSelectedWinner(null);
      setPrizeAmount("");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to award prizes");
    },
  });

  // Award three month prize mutation
  const awardThreeMonthMutation = useMutation({
    mutationFn: (winnerId) =>
      l5Api.awardThreeMonthPrize(storeId, winnerId, adminToken),
    onSuccess: () => {
      toast.success("Three month prize awarded!");
      queryClient.invalidateQueries(["l5ThreeMonthWinners", storeId]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to award prize");
    },
  });

  const leaderboard = leaderboardData?.data?.leaderboard || [];
  const coffeeHero = leaderboardData?.data?.coffeeHero || null;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const threeMonthWinners = threeMonthData?.data?.winners || [];
  const l5Config = configData?.data?.config || {};

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleAwardPrize = (winner, rank) => {
    setSelectedWinner({ ...winner, rank });
    // Set default prize based on rank
    if (rank === 1) setPrizeAmount("10000");
    else if (rank === 2) setPrizeAmount("5000");
    else if (rank === 3) setPrizeAmount("3000");
    else setPrizeAmount("movie_tickets");
    setShowPrizeModal(true);
  };

  const confirmAwardPrize = () => {
    const prizes = [
      {
        customerId: selectedWinner.customer?._id,
        rank: selectedWinner.rank,
        prizeType: selectedWinner.rank <= 3 ? "voucher" : "movie_tickets",
        voucherAmount: selectedWinner.rank <= 3 ? parseInt(prizeAmount) : 0,
      },
    ];

    awardMutation.mutate({
      month: currentMonth,
      year: currentYear,
      prizes,
    });
  };

  const tabs = [
    { key: "leaderboard", label: "Leaderboard", icon: Trophy },
    { key: "winners", label: "Winners History", icon: Crown },
    { key: "threeMonth", label: "3-Month Peak", icon: Flame },
    { key: "config", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              L5 Loyalty Dashboard
            </h1>
            <p className="text-stone-500 mt-1">
              Manage leaderboard, prizes, and configuration
            </p>
          </div>
          <button
            onClick={() => {
              queryClient.invalidateQueries(["l5AdminLeaderboard", storeId]);
              queryClient.invalidateQueries(["l5Winners", storeId]);
              queryClient.invalidateQueries(["l5ThreeMonthWinners", storeId]);
              toast.success("Data refreshed!");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="p-5 bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-2xl border border-amber-500/20">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-stone-400">Total Participants</span>
            </div>
            <p className="text-3xl font-bold text-white">{leaderboard.length}</p>
          </div>
          <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-2xl border border-emerald-500/20">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-stone-400">Qualified (3000+ pts)</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {leaderboard.filter((e) => e.isQualified).length}
            </p>
          </div>
          <div className="p-5 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-2xl border border-orange-500/20">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-stone-400">Coffee Hero</span>
            </div>
            <p className="text-lg font-bold text-white truncate">
              {coffeeHero?.customer?.name || "None Yet"}
            </p>
          </div>
          <div className="p-5 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-2xl border border-purple-500/20">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-stone-400">3-Month Winners</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {threeMonthWinners.filter((w) => w.awardStatus === "pending").length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-stone-900 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-amber-500/20 text-amber-300"
                    : "text-stone-500 hover:text-stone-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
          {activeTab === "leaderboard" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">
                  {monthNames[currentMonth - 1]} {currentYear} Leaderboard
                </h2>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-lg">
                  Top 10 Win Prizes
                </span>
              </div>

              {/* Coffee Hero Banner */}
              {coffeeHero && (
                <div className="mb-6 p-4 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-xl border border-orange-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <Flame className="w-6 h-6 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs text-orange-400/70 font-medium uppercase tracking-wide">
                          Coffee Hero (Top Redeemer)
                        </p>
                        <p className="text-white font-bold">
                          {coffeeHero.customer?.name}
                        </p>
                        <p className="text-sm text-stone-400">
                          {coffeeHero.totalPointsRedeemed?.toLocaleString()} pts redeemed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-stone-500">Prize</p>
                      <p className="text-orange-400 font-bold">30 Days Free Coffee</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Leaderboard Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-800">
                      <th className="text-left py-3 px-4 text-xs font-medium text-stone-500 uppercase tracking-wide">
                        Rank
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-stone-500 uppercase tracking-wide">
                        Customer
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-stone-500 uppercase tracking-wide">
                        Points Earned
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-stone-500 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-stone-500 uppercase tracking-wide">
                        Prize
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-stone-500 uppercase tracking-wide">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.slice(0, 10).map((entry, index) => {
                      const rank = index + 1;
                      const isTop3 = rank <= 3;
                      const prize =
                        rank === 1
                          ? "Rs. 10,000"
                          : rank === 2
                          ? "Rs. 5,000"
                          : rank === 3
                          ? "Rs. 3,000"
                          : "2 Movie Tickets";

                      return (
                        <tr
                          key={entry.customer?._id || index}
                          className={`border-b border-stone-800/50 ${
                            isTop3 ? "bg-amber-500/5" : ""
                          }`}
                        >
                          <td className="py-4 px-4">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                rank === 1
                                  ? "bg-amber-500/20 text-amber-400"
                                  : rank === 2
                                  ? "bg-slate-400/20 text-slate-300"
                                  : rank === 3
                                  ? "bg-orange-500/20 text-orange-400"
                                  : "bg-stone-800 text-stone-400"
                              }`}
                            >
                              <span className="font-bold text-sm">{rank}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {entry.customer?.name?.[0]}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  {entry.customer?.name}
                                </p>
                                <p className="text-xs text-stone-500">
                                  {entry.customer?.phone}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-amber-400 font-bold">
                              {entry.totalPointsEarned?.toLocaleString()}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            {entry.isQualified ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg">
                                <CheckCircle2 className="w-3 h-3" />
                                Qualified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-stone-700/50 text-stone-400 text-xs font-medium rounded-lg">
                                <AlertCircle className="w-3 h-3" />
                                Not Qualified
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {entry.isQualified ? (
                              <span className="text-white font-medium">{prize}</span>
                            ) : (
                              <span className="text-stone-500">-</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            {entry.isQualified && !entry.prizeAwarded && (
                              <button
                                onClick={() => handleAwardPrize(entry, rank)}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-900 text-xs font-bold rounded-lg transition-colors"
                              >
                                Award Prize
                              </button>
                            )}
                            {entry.prizeAwarded && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg">
                                <CheckCircle2 className="w-3 h-3" />
                                Awarded
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {leaderboard.length === 0 && (
                <div className="py-12 text-center">
                  <Trophy className="w-12 h-12 text-stone-700 mx-auto mb-4" />
                  <p className="text-white font-medium mb-1">
                    No Leaderboard Data Yet
                  </p>
                  <p className="text-sm text-stone-500">
                    Points will appear as customers earn them this month
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "winners" && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white mb-6">
                Monthly Winners History
              </h2>

              <div className="space-y-4">
                {winnersData?.data?.winners?.map((winner, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-stone-800/50 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <Crown className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">
                          {winner.customer?.name}
                        </p>
                        <p className="text-xs text-stone-500">
                          {monthNames[winner.month - 1]} {winner.year} - Rank #
                          {winner.rank}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-400 font-bold">
                        {winner.totalPointsEarned?.toLocaleString()} pts
                      </p>
                      <p className="text-xs text-stone-500">
                        Prize: {winner.prizeDetails?.type || "Awarded"}
                      </p>
                    </div>
                  </div>
                ))}

                {(!winnersData?.data?.winners ||
                  winnersData?.data?.winners?.length === 0) && (
                  <div className="py-12 text-center">
                    <Crown className="w-12 h-12 text-stone-700 mx-auto mb-4" />
                    <p className="text-white font-medium mb-1">
                      No Winners Yet
                    </p>
                    <p className="text-sm text-stone-500">
                      Winners from past months will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "threeMonth" && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white mb-2">
                3-Month Loyalty Peak Winners
              </h2>
              <p className="text-stone-500 text-sm mb-6">
                Customers who achieved #1 rank for 3 consecutive months
              </p>

              <div className="space-y-4">
                {threeMonthWinners.map((winner, index) => (
                  <div
                    key={index}
                    className="p-5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
                          <Flame className="w-7 h-7 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">
                            {winner.customer?.name}
                          </p>
                          <p className="text-sm text-stone-400">
                            Won:{" "}
                            {winner.winningMonths
                              ?.map(
                                (m) => `${monthNames[m.month - 1]} ${m.year}`
                              )
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 font-bold text-lg">
                          50% OFF Coffee
                        </p>
                        <p className="text-xs text-stone-500">For Next Month</p>
                        {winner.awardStatus === "pending" ? (
                          <button
                            onClick={() =>
                              awardThreeMonthMutation.mutate(winner._id)
                            }
                            disabled={awardThreeMonthMutation.isLoading}
                            className="mt-2 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                          >
                            {awardThreeMonthMutation.isLoading
                              ? "Processing..."
                              : "Award Prize"}
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-lg">
                            <CheckCircle2 className="w-4 h-4" />
                            Awarded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {threeMonthWinners.length === 0 && (
                  <div className="py-12 text-center">
                    <Flame className="w-12 h-12 text-stone-700 mx-auto mb-4" />
                    <p className="text-white font-medium mb-1">
                      No 3-Month Winners Yet
                    </p>
                    <p className="text-sm text-stone-500">
                      When someone achieves #1 for 3 consecutive months, they'll
                      appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "config" && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white mb-6">
                L5 Configuration
              </h2>

              <div className="grid grid-cols-2 gap-6">
                {/* Reward Thresholds */}
                <div className="p-5 bg-stone-800/50 rounded-xl">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-400" />
                    Reward Thresholds
                  </h3>
                  <div className="space-y-3">
                    {(l5Config.rewards || []).map((reward, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-stone-900/50 rounded-lg"
                      >
                        <span className="text-stone-400">
                          {reward.threshold?.toLocaleString()} pts
                        </span>
                        <span className="text-white font-medium">
                          {reward.rewardName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leaderboard Settings */}
                <div className="p-5 bg-stone-800/50 rounded-xl">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    Leaderboard Settings
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-stone-900/50 rounded-lg">
                      <span className="text-stone-400">Min Qualify Points</span>
                      <span className="text-white font-medium">
                        {l5Config.leaderboardMinPoints?.toLocaleString() || "3,000"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-stone-900/50 rounded-lg">
                      <span className="text-stone-400">Coffee Hero Min</span>
                      <span className="text-white font-medium">
                        {l5Config.coffeeHeroMinPoints?.toLocaleString() || "5,000"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-stone-900/50 rounded-lg">
                      <span className="text-stone-400">Discount Validity</span>
                      <span className="text-white font-medium">
                        {l5Config.discountValidityDays || 30} days
                      </span>
                    </div>
                  </div>
                </div>

                {/* Prize Structure */}
                <div className="p-5 bg-stone-800/50 rounded-xl col-span-2">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    Monthly Prize Structure
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-4 bg-gradient-to-b from-amber-500/10 to-amber-600/5 rounded-xl border border-amber-500/20 text-center">
                      <Crown className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                      <p className="text-xs text-stone-500">1st Place</p>
                      <p className="text-amber-400 font-bold">Rs. 10,000</p>
                    </div>
                    <div className="p-4 bg-gradient-to-b from-slate-400/10 to-slate-500/5 rounded-xl border border-slate-400/20 text-center">
                      <Trophy className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-stone-500">2nd Place</p>
                      <p className="text-slate-300 font-bold">Rs. 5,000</p>
                    </div>
                    <div className="p-4 bg-gradient-to-b from-orange-500/10 to-orange-600/5 rounded-xl border border-orange-500/20 text-center">
                      <Star className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                      <p className="text-xs text-stone-500">3rd Place</p>
                      <p className="text-orange-400 font-bold">Rs. 3,000</p>
                    </div>
                    <div className="p-4 bg-gradient-to-b from-stone-700/50 to-stone-800/50 rounded-xl border border-stone-700/30 text-center">
                      <Ticket className="w-6 h-6 text-stone-400 mx-auto mb-2" />
                      <p className="text-xs text-stone-500">4th-10th</p>
                      <p className="text-white font-bold">2 Movie Tickets</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Award Prize Modal */}
      {showPrizeModal && selectedWinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 rounded-2xl border border-stone-700 max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-stone-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Award Prize</h3>
                <button
                  onClick={() => setShowPrizeModal(false)}
                  className="p-2 hover:bg-stone-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-stone-800/50 rounded-xl">
                  <p className="text-xs text-stone-500 mb-1">Winner</p>
                  <p className="text-white font-semibold">
                    {selectedWinner.customer?.name}
                  </p>
                  <p className="text-sm text-stone-400">
                    Rank #{selectedWinner.rank} -{" "}
                    {selectedWinner.totalPointsEarned?.toLocaleString()} pts
                  </p>
                </div>

                {selectedWinner.rank <= 3 ? (
                  <div>
                    <label className="block text-sm font-medium text-stone-400 mb-2">
                      Voucher Amount (Rs.)
                    </label>
                    <input
                      type="number"
                      value={prizeAmount}
                      onChange={(e) => setPrizeAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                      placeholder="Enter amount"
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <p className="text-amber-400 font-medium">
                      2 Movie Tickets will be awarded
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPrizeModal(false)}
                  className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAwardPrize}
                  disabled={awardMutation.isLoading}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {awardMutation.isLoading ? "Processing..." : "Award Prize"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default L5AdminDashboard;
