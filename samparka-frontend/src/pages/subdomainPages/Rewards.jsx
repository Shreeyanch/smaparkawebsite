import React, { useEffect, useState } from "react";
import { Info, ArrowLeft, Gift, Percent, Coffee, Check, Lock, MapPin } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import api from "../../api/config";
import l5Api from "../../api/l5Api";
import { useStoreAuth } from "../../context/StoreAuthContext";
import { useQueryClient } from "@tanstack/react-query";

const Rewards = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { authState } = useStoreAuth();
  const { userInfo: user, token } = authState;
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Get store data
  const storeQueryData = queryClient.getQueryData(["store"]);
  const storeData = storeQueryData?.storeData;

  // L5 specific data from navigation state or fetch
  const [l5Config, setL5Config] = useState(location.state?.l5Config || storeData?.loyaltyCard?.l5Config || null);
  const [l5PointsData, setL5PointsData] = useState(location.state?.l5PointsData || null);
  const [l5Redemptions, setL5Redemptions] = useState(location.state?.l5Redemptions || []);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  // Check if L5 format - from state or store data
  const isL5Format = location.state?.isL5 || storeData?.loyaltyCard?.format === "L5";

  const [isLoading, setIsLoading] = useState(isL5Format && !l5Config?.rewards?.length);

  useEffect(() => {
    if (!user && !token) {
      navigate("/");
    }
  }, [token]);

  // Fetch L5 data if not passed via navigation state
  useEffect(() => {
    const fetchL5Data = async () => {
      if (!isL5Format || !token || !storeData?._id) {
        setIsLoading(false);
        return;
      }


      setIsLoading(true);
      try {
        // Fetch points balance first - it includes rewards as well
        const pointsResponse = await l5Api.getPointsBalance(storeData._id, token);

        if (pointsResponse?.success) {
          setL5PointsData(pointsResponse.data);

          // Use rewards from points response if l5Config doesn't have them
          if (pointsResponse.data?.rewards?.length > 0) {
            setL5Config(prev => ({
              ...prev,
              rewards: pointsResponse.data.rewards,
              redemptionThresholds: pointsResponse.data.thresholds || prev?.redemptionThresholds
            }));
          }
        }

        // Also try to fetch config if we still don't have rewards
        if (!l5Config?.rewards?.length) {
          const configResponse = await l5Api.getConfig(storeData._id, token);

          if (configResponse?.success && configResponse.data?.l5Config?.rewards?.length > 0) {
            setL5Config(configResponse.data.l5Config);
          } else if (storeData?.loyaltyCard?.l5Config?.rewards?.length > 0) {
            // Fallback to store's l5Config
            setL5Config(storeData.loyaltyCard.l5Config);
          }
        }

        const redemptionsResponse = await l5Api.getActiveRedemptions(storeData._id, token);
        if (redemptionsResponse?.success) {
          setL5Redemptions(redemptionsResponse.data?.activeRedemptions || []);
        }
      } catch (error) {
        console.error("[Rewards] Error fetching L5 data:", error);
        // Fallback to store's l5Config on error
        if (storeData?.loyaltyCard?.l5Config) {
          setL5Config(storeData.loyaltyCard.l5Config);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchL5Data();
  }, [token, storeData?._id, isL5Format]);

  const [selectedReward, setSelectedReward] = useState(null);

  const handleInfoClick = (index) => {
    setSelectedReward((prev) => (prev === index ? null : index));
  };

  // Default rewards for non-L5 formats
  const defaultRewardsData = [
    {
      points: 5,
      image:
        "data:image/jpeg;base64,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",
      name: "Gift Hampers",
      description: "Surprise Gift Hampers For Lucky Customers",
    },
    {
      points: 5,
      image:
        "data:image/jpeg;base64,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",
      name: "Free Coffee",
      description: "Free Cappuccino For Lucky Customers",
    },
  ];

  // L5 rewards configuration
  const l5Rewards = l5Config?.rewards || [];

  // Get outlet breakdown from L5 points data
  const outletBreakdown = l5PointsData?.outlets || [];

  // Check if a reward can be redeemed for an outlet
  const canRedeem = (outlet, threshold) => {
    if (!outlet || !threshold) return false;
    const currentPoints = outlet.currentPoints || 0;
    // Check if already redeemed at this threshold
    const alreadyRedeemed = l5Redemptions.some(
      (r) => r.outlet?._id === outlet.outletId && r.threshold === threshold
    );
    return currentPoints >= threshold && !alreadyRedeemed;
  };

  // Handle redeem
  const handleRedeem = async (outlet, threshold) => {
    if (!outlet || isRedeeming) return;

    setIsRedeeming(true);
    try {
      const response = await l5Api.redeemDiscount(
        storeData._id,
        outlet.outletId,
        threshold,
        token
      );
      if (response?.success) {
        toast.success(response.message || "Discount redeemed successfully!");
        // Refresh redemptions
        const redemptionsResponse = await l5Api.getActiveRedemptions(
          storeData._id,
          token
        );
        if (redemptionsResponse?.success) {
          setL5Redemptions(redemptionsResponse.data?.activeRedemptions || []);
        }
      } else {
        toast.error(response?.message || "Failed to redeem discount");
      }
    } catch (error) {
      console.error("Error redeeming:", error);
      toast.error(error.response?.data?.message || "Failed to redeem discount");
    } finally {
      setIsRedeeming(false);
    }
  };

  // Get reward icon based on type
  const getRewardIcon = (rewardType) => {
    switch (rewardType) {
      case "discount":
        return <Percent className="w-5 h-5 text-emerald-500" />;
      case "physical":
        return <Gift className="w-5 h-5 text-amber-500" />;
      default:
        return <Coffee className="w-5 h-5 text-amber-600" />;
    }
  };

  // Render L5 Rewards
  const renderL5Rewards = () => {
    if (isLoading) {
      return (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading rewards...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Outlet Selector - Only show if there are outlets */}
        {outletBreakdown.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Select Outlet to Redeem:</p>
            <div className="flex flex-wrap gap-2">
              {outletBreakdown.map((outlet) => (
                <button
                  key={outlet.outletId}
                  onClick={() => setSelectedOutlet(outlet)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedOutlet?.outletId === outlet.outletId
                      ? "bg-amber-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  {outlet.outletName}
                  <span className="font-bold">({outlet.currentPoints || 0} pts)</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Total Points Display */}
        {l5PointsData?.totalPoints > 0 && (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200 mb-4">
            <p className="text-sm text-amber-700 font-medium">Your Total Points</p>
            <p className="text-3xl font-bold text-amber-600">{l5PointsData.totalPoints.toLocaleString()}</p>
          </div>
        )}

        {/* Rewards List */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-600">Available Rewards:</p>
          {l5Rewards.length > 0 ? (
            l5Rewards.map((reward, index) => {
              const isAvailable = selectedOutlet && canRedeem(selectedOutlet, reward.threshold);
              const isRedeemed = selectedOutlet && l5Redemptions.some(
                (r) => r.outlet?._id === selectedOutlet.outletId && r.threshold === reward.threshold
              );

              return (
                <div
                  key={index}
                  className={`bg-white rounded-2xl overflow-hidden shadow-lg border transition-all ${
                    isAvailable ? "border-emerald-300 ring-2 ring-emerald-100" : "border-gray-200"
                  }`}
                >
                  {/* Points Header */}
                  <div
                    className={`px-4 py-3 flex justify-between items-center ${
                      reward.rewardType === "discount"
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-500"
                        : "bg-gradient-to-r from-amber-600 to-amber-500"
                    }`}
                  >
                    <div className="text-white font-medium flex items-center gap-2">
                      {getRewardIcon(reward.rewardType)}
                      <span className="text-lg font-bold">
                        {reward.threshold?.toLocaleString()} Points
                      </span>
                    </div>
                    <button
                      onClick={() => handleInfoClick(index)}
                      className="focus:outline-none"
                    >
                      <Info className="w-5 h-5 text-white/80 hover:text-white" />
                    </button>
                  </div>

                  {/* Reward Content */}
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">
                          {reward.rewardName || (reward.rewardType === "discount" ? `${reward.discountPercentage}% Discount` : "Reward")}
                        </h3>
                        {reward.rewardType === "discount" && reward.discountPercentage && (
                          <p className="text-emerald-600 font-semibold">
                            {reward.discountPercentage}% OFF
                          </p>
                        )}
                        {selectedReward === index && reward.rewardDescription && (
                          <p className="mt-2 text-sm text-gray-500">
                            {reward.rewardDescription}
                          </p>
                        )}
                      </div>

                      <div className="ml-4">
                        {outletBreakdown.length === 0 ? (
                          <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-500 text-sm font-medium">
                            No outlets visited
                          </span>
                        ) : !selectedOutlet ? (
                          <span className="px-4 py-2 rounded-full bg-amber-100 text-amber-600 text-sm font-medium">
                            Select outlet ↑
                          </span>
                        ) : isRedeemed ? (
                          <span className="px-4 py-2 rounded-full bg-emerald-100 text-emerald-600 text-sm font-medium flex items-center gap-1">
                            <Check className="w-4 h-4" /> Redeemed
                          </span>
                        ) : isAvailable ? (
                          <button
                            onClick={() => handleRedeem(selectedOutlet, reward.threshold)}
                            disabled={isRedeeming}
                            className="px-6 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-bold hover:from-emerald-500 hover:to-emerald-400 transition-all disabled:opacity-50"
                          >
                            {isRedeeming ? "..." : "Redeem"}
                          </button>
                        ) : (
                          <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-500 text-sm font-medium flex items-center gap-1">
                            <Lock className="w-4 h-4" />
                            {selectedOutlet?.currentPoints || 0} / {reward.threshold}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
              <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No rewards configured yet</p>
              <p className="text-sm mt-2">Check back later for exciting rewards!</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render default rewards (non-L5)
  const renderDefaultRewards = () => (
    <div className="space-y-4">
      {defaultRewardsData.map((reward, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl overflow-hidden shadow-xl border-3xl"
        >
          {/* Points Header */}
          <div className="bg-amber-900 px-4 py-2 flex justify-between items-center">
            <div className="text-white font-medium flex items-center gap-2">
              <Gift className="w-4 h-4" />
              {reward.points} Points
            </div>
            <button
              onClick={() => handleInfoClick(index)}
              className="focus:outline-none"
            >
              <Info className="w-5 h-5 text-white/80" />
            </button>
          </div>

          {/* Reward Image */}
          <div className="aspect-[2/1] relative">
            <img
              src={reward.image}
              alt="Reward"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Footer */}
          <div className="p-4 flex flex-col">
            <div className="flex justify-between items-center">
              <button className="px-6 py-2 rounded-full bg-green-800 text-gray-200 text-sm font-medium">
                Redeem
              </button>
              <span className="text-gray-600 text-sm font-bold">
                {reward.name}
              </span>
            </div>

            {/* Description */}
            {selectedReward === index && (
              <p className="mt-3 text-sm text-gray-500">{reward.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex items-center justify-center">
        <div className="p-6 w-full max-w-md bg-white rounded-xl shadow-xl my-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate("/loyality")}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              {isL5Format ? "L5 Rewards" : "Rewards"}
            </h1>
            <div className="w-9" /> {/* Spacer */}
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setActiveTab("all")}
              className={`py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-[#275343] text-white"
                  : "bg-[#275343]/20 text-teal-600"
              }`}
            >
              All Rewards
            </button>
            <button
              onClick={() => setActiveTab("my")}
              className={`py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "my"
                  ? "bg-[#275343] text-white"
                  : "bg-[#275343]/20 text-teal-600"
              }`}
            >
              My Rewards
            </button>
          </div>

          {/* Rewards Content */}
          {activeTab === "all" ? (
            isL5Format ? renderL5Rewards() : renderDefaultRewards()
          ) : (
            <div>
              {l5Redemptions.length > 0 ? (
                <div className="space-y-3">
                  {l5Redemptions.map((redemption, index) => (
                    <div
                      key={redemption._id || index}
                      className="p-4 bg-emerald-50 rounded-xl border border-emerald-200"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-emerald-700">
                            {redemption.discountPercentage}% OFF
                          </p>
                          <p className="text-sm text-gray-600">
                            at {redemption.outlet?.name || "Any Outlet"}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500">
                            Expires:{" "}
                            {new Date(redemption.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-600 font-medium text-center py-8">
                  <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active rewards</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Earn points to unlock rewards!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rewards;
