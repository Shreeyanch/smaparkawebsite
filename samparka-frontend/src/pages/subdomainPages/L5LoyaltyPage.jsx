import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  Trophy,
  Gift,
  Ticket,
  ChevronLeft,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";

import l5Api from "../../api/l5Api";
import L5Card from "../../components/L5/L5Card";
import L5Leaderboard from "../../components/L5/L5Leaderboard";
import L5Rewards from "../../components/L5/L5Rewards";
import L5Vouchers from "../../components/L5/L5Vouchers";
import LoadingSpinner from "../../components/LoadingSpinner";

/**
 * L5 Loyalty Page
 * Main customer-facing page for L5 loyalty program
 *
 * Design: Premium coffee-culture aesthetic with tabbed navigation
 */
const L5LoyaltyPage = ({ url, storeData }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeView, setActiveView] = useState("card");
  const [showQR, setShowQR] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState(null);

  // Get auth info
  const token = Cookies.get("token");
  const encryptedData = Cookies.get("userInfo");

  let userInfo = null;
  if (encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(
        encryptedData,
        import.meta.env.VITE_CLIENT_SECRET_KEY
      );
      userInfo = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (e) {
      console.error("Failed to decrypt user info");
    }
  }

  const storeId = storeData?._id;
  const customerId = userInfo?._id;

  // Redirect if not authenticated
  useEffect(() => {
    if (!token || !userInfo) {
      navigate("/");
    }
  }, [token, userInfo, navigate]);

  // Fetch L5 points balance
  const {
    data: pointsData,
    isLoading: pointsLoading,
    refetch: refetchPoints,
  } = useQuery({
    queryKey: ["l5Points", storeId],
    queryFn: () => l5Api.getPointsBalance(storeId, token),
    enabled: !!storeId && !!token,
    staleTime: 30000,
  });

  // Fetch active redemptions
  const { data: redemptionsData, isLoading: redemptionsLoading } = useQuery({
    queryKey: ["l5Redemptions", storeId],
    queryFn: () => l5Api.getActiveRedemptions(storeId, token),
    enabled: !!storeId && !!token,
    staleTime: 30000,
  });

  // Fetch vouchers
  const { data: vouchersData, isLoading: vouchersLoading } = useQuery({
    queryKey: ["l5Vouchers", storeId],
    queryFn: () => l5Api.getVouchers(storeId, token),
    enabled: !!storeId && !!token,
    staleTime: 30000,
  });

  // Fetch leaderboard
  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["l5Leaderboard", storeId],
    queryFn: () => l5Api.getCurrentLeaderboard(storeId, token),
    enabled: !!storeId && !!token,
    staleTime: 60000,
  });

  // Fetch L5 config
  const { data: configData } = useQuery({
    queryKey: ["l5Config", storeId],
    queryFn: () => l5Api.getConfig(storeId, token),
    enabled: !!storeId && !!token,
    staleTime: 300000,
  });

  // Redeem discount mutation
  const redeemMutation = useMutation({
    mutationFn: ({ outletId, threshold }) =>
      l5Api.redeemDiscount(storeId, outletId, threshold, token),
    onSuccess: (data) => {
      toast.success(data.message || "Discount redeemed successfully!");
      queryClient.invalidateQueries(["l5Points", storeId]);
      queryClient.invalidateQueries(["l5Redemptions", storeId]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to redeem discount");
    },
  });

  // Use voucher mutation
  const useVoucherMutation = useMutation({
    mutationFn: (voucherId) => l5Api.useVoucher(storeId, voucherId, token),
    onSuccess: (data) => {
      toast.success(data.message || "Voucher used successfully!");
      queryClient.invalidateQueries(["l5Vouchers", storeId]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to use voucher");
    },
  });

  const handleRedeem = (outletId, threshold) => {
    redeemMutation.mutate({ outletId, threshold });
  };

  const handleUseVoucher = (voucherId) => {
    useVoucherMutation.mutate(voucherId);
  };

  const handleSelectOutlet = (outlet) => {
    setSelectedOutlet(outlet);
  };

  // Navigation tabs
  const tabs = [
    { key: "card", label: "Card", icon: CreditCard },
    { key: "rewards", label: "Rewards", icon: Gift },
    { key: "leaderboard", label: "Rank", icon: Trophy },
    { key: "vouchers", label: "Vouchers", icon: Ticket },
  ];

  // Extract data
  const outletBreakdown = pointsData?.data?.outlets || [];
  const totalPoints = pointsData?.data?.totalPoints || 0;
  const currentRank = leaderboardData?.data?.currentUserRank || pointsData?.data?.l5Data?.currentRank || null;
  const activeDiscounts = redemptionsData?.data?.activeRedemptions || [];
  const vouchers = vouchersData?.data?.vouchers || [];
  const leaderboard = leaderboardData?.data?.leaderboard || [];
  const coffeeHero = leaderboardData?.data?.coffeeHero || null;
  const l5Config = configData?.data?.l5Config || {};

  const isLoading = pointsLoading || redemptionsLoading;

  if (!storeId || !token) {
    return <LoadingSpinner />;
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: `
          radial-gradient(ellipse at 50% 0%, rgba(217, 119, 6, 0.06) 0%, transparent 50%),
          linear-gradient(180deg, #0c0a09 0%, #1c1917 100%)
        `,
      }}
    >
      {/* Load Playfair Display font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      {activeView !== "leaderboard" && (
        <div className="sticky top-0 z-30 backdrop-blur-xl bg-stone-950/80 border-b border-stone-800/50">
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-xl bg-stone-800/50 hover:bg-stone-700/50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-stone-400" />
                </button>
                <div>
                  <h1
                    className="text-xl font-bold text-white"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {storeData?.name || "Loyalty"}
                  </h1>
                  <p className="text-xs text-stone-500">Premium Rewards</p>
                </div>
              </div>

              <button
                onClick={() => {
                  refetchPoints();
                  queryClient.invalidateQueries(["l5Redemptions", storeId]);
                  queryClient.invalidateQueries(["l5Vouchers", storeId]);
                  queryClient.invalidateQueries(["l5Leaderboard", storeId]);
                  toast.success("Refreshed!");
                }}
                className="p-2 rounded-xl bg-stone-800/50 hover:bg-stone-700/50 transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-stone-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pb-24">
        {activeView === "card" && (
          <div className="max-w-lg mx-auto px-4 py-6 animate-fadeIn">
            <L5Card
              customerName={userInfo?.name || "Guest"}
              outletBreakdown={outletBreakdown}
              totalPoints={totalPoints}
              activeDiscounts={activeDiscounts}
              currentRank={currentRank}
              showQR={showQR}
              setShowQR={setShowQR}
              customerId={customerId}
              storeUrl={url}
              cardColor={storeData?.loyaltyCard?.cardColor || "#1c1917"}
              textColor={storeData?.loyaltyCard?.textColor || "#ffffff"}
              stamp={storeData?.loyaltyCard?.stamp || "coffee"}
              customStamp={storeData?.loyaltyCard?.customStamp}
              cardImage={storeData?.loyaltyCard?.cardImage}
            />

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="p-4 bg-stone-800/30 rounded-2xl border border-stone-700/30 text-center">
                <p className="text-2xl font-bold text-amber-400">
                  {outletBreakdown.length}
                </p>
                <p className="text-xs text-stone-500 mt-1">Outlets Visited</p>
              </div>
              <div className="p-4 bg-stone-800/30 rounded-2xl border border-stone-700/30 text-center">
                <p className="text-2xl font-bold text-emerald-400">
                  {activeDiscounts.reduce(
                    (sum, d) => sum + (d.discountPercentage || 0),
                    0
                  )}
                  %
                </p>
                <p className="text-xs text-stone-500 mt-1">Active Discounts</p>
              </div>
              <div className="p-4 bg-stone-800/30 rounded-2xl border border-stone-700/30 text-center">
                <p className="text-2xl font-bold text-white">
                  {vouchers.filter((v) => v.status === "unused").length}
                </p>
                <p className="text-xs text-stone-500 mt-1">Vouchers</p>
              </div>
            </div>

            {/* Active Discounts List */}
            {activeDiscounts.length > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 rounded-2xl border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <p className="text-sm font-semibold text-emerald-400">
                    Your Active Discounts
                  </p>
                </div>
                <div className="space-y-2">
                  {activeDiscounts.map((discount, i) => (
                    <div
                      key={discount._id || i}
                      className="flex items-center justify-between p-2 bg-stone-800/30 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">
                          {discount.discountPercentage}% OFF
                        </span>
                        <span className="text-xs text-stone-500">
                          at {discount.outlet?.name || "Any Outlet"}
                        </span>
                      </div>
                      <span className="text-xs text-stone-500">
                        Expires{" "}
                        {new Date(discount.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === "rewards" && (
          <div className="animate-fadeIn">
            <L5Rewards
              outletBreakdown={outletBreakdown}
              selectedOutlet={selectedOutlet}
              onSelectOutlet={handleSelectOutlet}
              rewards={l5Config.rewards || []}
              activeDiscounts={activeDiscounts}
              onRedeem={handleRedeem}
              isLoading={redeemMutation.isLoading}
            />
          </div>
        )}

        {activeView === "leaderboard" && (
          <div className="animate-fadeIn">
            <L5Leaderboard
              leaderboard={leaderboard}
              currentUserId={customerId}
              currentUserRank={currentRank}
              month={new Date().getMonth() + 1}
              year={new Date().getFullYear()}
              prizes={l5Config.leaderboardPrizes || []}
              coffeeHero={coffeeHero}
              minQualifyPoints={l5Config.leaderboardMinPoints || 3000}
              onBack={() => setActiveView("card")}
            />
          </div>
        )}

        {activeView === "vouchers" && (
          <div className="animate-fadeIn">
            <L5Vouchers
              vouchers={vouchers}
              onUseVoucher={handleUseVoucher}
              isLoading={useVoucherMutation.isLoading}
            />
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      {activeView !== "leaderboard" && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <div className="bg-stone-950/95 backdrop-blur-xl border-t border-stone-800/50">
            <div className="max-w-lg mx-auto px-4 py-3">
              <div className="flex items-center justify-around">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeView === tab.key;

                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveView(tab.key)}
                      className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-amber-500/20 text-amber-400"
                          : "text-stone-500 hover:text-stone-300"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${isActive ? "text-amber-400" : ""}`}
                      />
                      <span className="text-xs font-medium">{tab.label}</span>

                      {/* Badge for vouchers */}
                      {tab.key === "vouchers" &&
                        vouchers.filter((v) => v.status === "unused").length >
                          0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-xs font-bold text-stone-900 flex items-center justify-center">
                            {vouchers.filter((v) => v.status === "unused").length}
                          </span>
                        )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-stone-400 text-sm">Loading...</p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default L5LoyaltyPage;
