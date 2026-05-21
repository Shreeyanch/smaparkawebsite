import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Gift } from "lucide-react";
import "swiper/css";
import "swiper/css/scrollbar";
import "swiper/css/pagination";

import api from "../../api/config";
import { useStoreAuth } from "../../context/StoreAuthContext";
import L6RewardCard from "../../components/L6/L6RewardCard";
import L6RewardsHero from "../../components/L6/L6RewardsHero";
import L6TierSwiper from "../../components/L6/L6TierSwiper";
import BottomNavigation from "../../components/BottomNavigation";
import LoadingSpinner from "../../components/LoadingSpinner";

const L6RewardsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { authState } = useStoreAuth();
  const { userInfo: user, token } = authState;

  const storeQueryResult = queryClient.getQueryData(["store"]);
  const storeData = storeQueryResult?.storeData;
  const cardData = storeData?.loyaltyCard || {};
  const tiers = cardData?.tier || [];

  const [rewards, setRewards] = useState([]);
  const [customerPoints, setCustomerPoints] = useState(0);
  const [customerTier, setCustomerTier] = useState("");
  const [visitStreak, setVisitStreak] = useState(0);
  const [missionProgress, setMissionProgress] = useState({});
  const [redeemedCounts, setRedeemedCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(() => location.state?.tab || "all");
  const [activeTierIndex, setActiveTierIndex] = useState(0);

  useEffect(() => {
    if (!user || !token) navigate("/");
  }, [user, token]);

  useEffect(() => {
    if (!storeData?._id || !token) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [rewardsRes, customerRes, myRewardsRes] = await Promise.all([
          api.get(`/reward/getRewards/${storeData._id}`),
          api.get("/customer", { headers: { token } }),
          api.get("/customer/myRewards", { headers: { token } }),
        ]);

        const l6Rewards = (rewardsRes.data?.rewards || []).filter((r) => r.type === "l6");
        const l6RewardIds = new Set(l6Rewards.map((reward) => String(reward._id)));

        const l6RedeemedCounts = (myRewardsRes.data?.myRewards || []).reduce((acc, redemption) => {
          const rewardId = redemption?.reward?._id ? String(redemption.reward._id) : "";
          if (rewardId && l6RewardIds.has(rewardId)) {
            acc[rewardId] = (acc[rewardId] || 0) + 1;
          }
          return acc;
        }, {});

        setRewards(l6Rewards);
        setCustomerPoints(customerRes.data?.points || 0);
        setCustomerTier(customerRes.data?.tier || "");
        setVisitStreak(customerRes.data?.visitStreak || 0);
        setMissionProgress(customerRes.data?.l6Data?.missionProgress || {});
        setRedeemedCounts(l6RedeemedCounts);
      } catch (error) {
        console.error("❌ Error fetching rewards data:", error);
        if (error.response?.status === 401) navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [storeData?._id, token]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "tier") setActiveTierIndex(0);
  };

  const activeTierName = tiers[activeTierIndex]?.name || "";

  const filteredRewards = useMemo(() => {
    if (activeTab === "all") return rewards;
    if (activeTab === "tier") {
      const tierRewards = rewards.filter((r) => r.isTierBased);
      if (!activeTierName) return tierRewards;
      return tierRewards.filter(
        (r) => !r.tier || r.tier.toLowerCase() === activeTierName.toLowerCase()
      );
    }
    if (activeTab === "point") return rewards.filter((r) => r.isPointBased);
    if (activeTab === "mission") return rewards.filter((r) => r.isMissionBased);
    if (activeTab === "streak") return rewards.filter((r) => r.isStreakBased);
    return rewards;
  }, [rewards, activeTab, activeTierName]);

  const rewardCounts = useMemo(
    () => ({
      all: rewards.length,
      tier: rewards.filter((r) => r.isTierBased).length,
      point: rewards.filter((r) => r.isPointBased).length,
      mission: rewards.filter((r) => r.isMissionBased).length,
      streak: rewards.filter((r) => r.isStreakBased).length,
    }),
    [rewards]
  );

  const handleRedeem = async (rewardId) => {
    setRedeemLoading(true);
    try {
      const res = await api.put(
        `/customer/redeemL6Reward/${rewardId}?storeID=${storeData._id}`,
        {},
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setRedeemedCounts((prev) => ({
          ...prev,
          [rewardId]: (prev[rewardId] || 0) + 1,
        }));
        const customerRes = await api.get("/customer", { headers: { token } });
        setCustomerPoints(customerRes.data?.points || 0);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to redeem reward");
    } finally {
      setRedeemLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[radial-gradient(circle_at_top,_#fefce8_0%,_#fff7ed_35%,_#fafaf9_100%)]"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {loading && <LoadingSpinner />}

      <L6RewardsHero
        activeTab={activeTab}
        counts={rewardCounts}
        customerPoints={customerPoints}
        customerTier={customerTier}
        visitStreak={visitStreak}
        onBack={() => navigate(-1)}
        onTabChange={handleTabChange}
      />

      {activeTab === "tier" && tiers.length > 0 && (
        <L6TierSwiper
          tiers={tiers}
          customerTier={customerTier}
          customerPoints={customerPoints}
          onSlideChange={(swiper) => setActiveTierIndex(swiper.activeIndex)}
        />
      )}

      <div className="max-w-[430px] mx-auto px-4 py-4 pb-28 space-y-3">
        {!loading && filteredRewards.length === 0 && (
          <div className="rounded-2xl border border-amber-100 bg-white/80 px-5 py-14 text-center shadow-[0_6px_20px_-18px_rgba(120,113,108,0.8)]">
            <Gift size={40} className="mx-auto text-amber-300 mb-3" />
            <p className="text-zinc-700 text-sm font-semibold">No rewards in this category</p>
            <p className="text-zinc-500 text-[12px] mt-1">Try another tab or come back later for fresh drops.</p>
          </div>
        )}

        {filteredRewards.map((reward) => (
          <L6RewardCard
            key={reward._id}
            reward={reward}
            customerPoints={customerPoints}
            customerTier={customerTier}
            visitStreak={visitStreak}
            missionProgress={missionProgress}
            redeemedCount={redeemedCounts[reward._id] || 0}
            onRedeem={handleRedeem}
            loading={redeemLoading}
          />
        ))}
      </div>

      <BottomNavigation cardColor={cardData?.cardColor} />
    </div>
  );
};

export default L6RewardsPage;
