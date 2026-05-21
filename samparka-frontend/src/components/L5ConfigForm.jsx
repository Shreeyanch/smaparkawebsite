import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Coffee,
  Percent,
  Gift,
  Mountain,
  Trophy,
  Flame,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

/**
 * L5 Configuration Form
 * Allows store admins to configure L5 loyalty program settings
 */
const L5ConfigForm = ({ l5Config, setL5Config, isDarkMode }) => {
  const [expandedSection, setExpandedSection] = useState("rewards");

  // Default L5 config structure
  const defaultConfig = {
    rewards: [
      { threshold: 775, rewardType: "physical", rewardName: "Free Americano (S)", discountPercentage: 0 },
      { threshold: 1500, rewardType: "discount", rewardName: "5% Off F&B", discountPercentage: 5 },
      { threshold: 2500, rewardType: "discount", rewardName: "7% Off F&B", discountPercentage: 7 },
      { threshold: 5000, rewardType: "discount", rewardName: "10% Off F&B", discountPercentage: 10 },
      { threshold: 8000, rewardType: "discount", rewardName: "15% Off F&B", discountPercentage: 15 },
      { threshold: 10000, rewardType: "discount", rewardName: "20% Off F&B", discountPercentage: 20 },
      { threshold: 50000, rewardType: "physical", rewardName: "Pokhara Tour", discountPercentage: 0 },
    ],
    discountValidityDays: 30,
    leaderboardMinPoints: 3000,
    coffeeHeroMinPoints: 5000,
    leaderboardPrizes: [
      { rank: 1, prizeType: "cash_voucher", totalAmount: 10000, splitCount: 5, splitAmount: 2000, prizeDescription: "Rs. 10,000 Cash Voucher" },
      { rank: 2, prizeType: "cash_voucher", totalAmount: 5000, splitCount: 5, splitAmount: 1000, prizeDescription: "Rs. 5,000 Cash Voucher" },
      { rank: 3, prizeType: "cash_voucher", totalAmount: 3000, splitCount: 3, splitAmount: 1000, prizeDescription: "Rs. 3,000 Cash Voucher" },
      { rank: 4, rankEnd: 10, prizeType: "movie_ticket", totalAmount: 0, prizeDescription: "2 QFX Movie Tickets" },
    ],
    threeMonthWinnerDiscount: 50,
    coffeeHeroDays: 30,
    coffeeHeroReward: "Free Americano (S) per day",
    allowDiscountStacking: true,
  };

  // Initialize with default if empty
  const config = l5Config && Object.keys(l5Config).length > 0 ? l5Config : defaultConfig;

  // Set default config in parent state when component mounts if l5Config is empty
  useEffect(() => {
    if (!l5Config || Object.keys(l5Config).length === 0) {
      setL5Config(defaultConfig);
    }
  }, []); // Only run on mount

  const handleConfigChange = (field, value) => {
    setL5Config((prev) => ({
      ...defaultConfig,
      ...prev,
      [field]: value,
    }));
  };

  const handleRewardChange = (index, field, value) => {
    const updatedRewards = [...(config.rewards || defaultConfig.rewards)];
    updatedRewards[index] = {
      ...updatedRewards[index],
      [field]: field === "threshold" || field === "discountPercentage" ? parseInt(value) || 0 : value,
    };
    handleConfigChange("rewards", updatedRewards);
  };

  const addReward = () => {
    const rewards = config.rewards || defaultConfig.rewards;
    const lastThreshold = rewards.length > 0 ? rewards[rewards.length - 1].threshold : 0;
    const newReward = {
      threshold: lastThreshold + 1000,
      rewardType: "discount",
      rewardName: "New Reward",
      discountPercentage: 5,
    };
    handleConfigChange("rewards", [...rewards, newReward]);
  };

  const removeReward = (index) => {
    const rewards = config.rewards || defaultConfig.rewards;
    if (rewards.length > 1) {
      handleConfigChange("rewards", rewards.filter((_, i) => i !== index));
    }
  };

  const handlePrizeChange = (index, field, value) => {
    const updatedPrizes = [...(config.leaderboardPrizes || defaultConfig.leaderboardPrizes)];
    updatedPrizes[index] = {
      ...updatedPrizes[index],
      [field]: ["rank", "rankEnd", "totalAmount", "splitCount", "splitAmount"].includes(field)
        ? parseInt(value) || 0
        : value,
    };
    handleConfigChange("leaderboardPrizes", updatedPrizes);
  };

  const getRewardIcon = (type) => {
    switch (type) {
      case "discount":
        return <Percent className="w-4 h-4" />;
      case "physical":
        return <Gift className="w-4 h-4" />;
      default:
        return <Coffee className="w-4 h-4" />;
    }
  };

  const SectionHeader = ({ title, icon: Icon, section }) => (
    <button
      type="button"
      onClick={() => setExpandedSection(expandedSection === section ? null : section)}
      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
        isDarkMode
          ? "bg-gray-700 hover:bg-gray-600"
          : "bg-gray-100 hover:bg-gray-200"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${isDarkMode ? "text-amber-400" : "text-amber-600"}`} />
        <span className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          {title}
        </span>
      </div>
      {expandedSection === section ? (
        <ChevronUp className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
      ) : (
        <ChevronDown className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
      )}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Section: Reward Thresholds */}
      {/* <div className={`rounded-lg border ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}>
        <SectionHeader title="Reward Thresholds" icon={Gift} section="rewards" />

        {expandedSection === "rewards" && (
          <div className="p-4 space-y-3">
            <p className={`text-xs mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Configure point thresholds and their rewards. Customers can redeem rewards when they reach these points.
            </p>

            {(config.rewards || defaultConfig.rewards).map((reward, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  isDarkMode ? "border-gray-600 bg-gray-700/50" : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    reward.rewardType === "discount"
                      ? isDarkMode ? "bg-emerald-900/30" : "bg-emerald-100"
                      : isDarkMode ? "bg-amber-900/30" : "bg-amber-100"
                  }`}>
                    {getRewardIcon(reward.rewardType)}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}>
                          Points Required
                        </label>
                        <input
                          type="number"
                          value={reward.threshold}
                          onChange={(e) => handleRewardChange(index, "threshold", e.target.value)}
                          className={`w-full px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                            isDarkMode
                              ? "border-gray-600 bg-gray-700 text-white"
                              : "border-gray-300 bg-white text-gray-900"
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}>
                          Reward Type
                        </label>
                        <select
                          value={reward.rewardType}
                          onChange={(e) => handleRewardChange(index, "rewardType", e.target.value)}
                          className={`w-full px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                            isDarkMode
                              ? "border-gray-600 bg-gray-700 text-white"
                              : "border-gray-300 bg-white text-gray-900"
                          }`}
                        >
                          <option value="discount">Discount %</option>
                          <option value="physical">Physical Reward</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}>
                          Reward Name
                        </label>
                        <input
                          type="text"
                          value={reward.rewardName}
                          onChange={(e) => handleRewardChange(index, "rewardName", e.target.value)}
                          placeholder="e.g., Free Coffee"
                          className={`w-full px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                            isDarkMode
                              ? "border-gray-600 bg-gray-700 text-white placeholder-gray-500"
                              : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                          }`}
                        />
                      </div>

                      {reward.rewardType === "discount" && (
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}>
                            Discount %
                          </label>
                          <input
                            type="number"
                            value={reward.discountPercentage}
                            onChange={(e) => handleRewardChange(index, "discountPercentage", e.target.value)}
                            min="1"
                            max="100"
                            className={`w-full px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              isDarkMode
                                ? "border-gray-600 bg-gray-700 text-white"
                                : "border-gray-300 bg-white text-gray-900"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {(config.rewards || defaultConfig.rewards).length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeReward(index)}
                      className={`p-1.5 rounded-md transition-colors ${
                        isDarkMode
                          ? "text-red-400 hover:bg-red-900/30"
                          : "text-red-500 hover:bg-red-100"
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addReward}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed rounded-lg transition-colors ${
                isDarkMode
                  ? "border-gray-600 text-gray-400 hover:border-amber-500 hover:text-amber-400"
                  : "border-gray-300 text-gray-500 hover:border-amber-500 hover:text-amber-600"
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Reward Threshold
            </button>
          </div>
        )}
      </div> */}

      {/* Section: Discount Settings */}
      {/* <div className={`rounded-lg border ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}>
        <SectionHeader title="Discount Settings" icon={Percent} section="discount" />

        {expandedSection === "discount" && (
          <div className="p-4 space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Discount Validity (Days)
              </label>
              <input
                type="number"
                value={config.discountValidityDays || 30}
                onChange={(e) => handleConfigChange("discountValidityDays", parseInt(e.target.value) || 30)}
                min="1"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
              />
              <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                How many days a redeemed discount remains valid
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Allow Discount Stacking
                </label>
                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Customers can combine multiple active discounts
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.allowDiscountStacking !== false}
                  onChange={(e) => handleConfigChange("allowDiscountStacking", e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                  isDarkMode
                    ? "bg-gray-600 peer-checked:bg-amber-500"
                    : "bg-gray-300 peer-checked:bg-amber-500"
                }`}></div>
              </label>
            </div>
          </div>
        )}
      </div> */}

      {/* Section: Leaderboard Settings */}
      {/* <div className={`rounded-lg border ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}>
        <SectionHeader title="Leaderboard Settings" icon={Trophy} section="leaderboard" />

        {expandedSection === "leaderboard" && (
          <div className="p-4 space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Minimum Points to Qualify
              </label>
              <input
                type="number"
                value={config.leaderboardMinPoints || 3000}
                onChange={(e) => handleConfigChange("leaderboardMinPoints", parseInt(e.target.value) || 3000)}
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
              />
              <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Minimum points required in a month to qualify for prizes
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-3 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Monthly Prizes
              </label>

              <div className="space-y-2">
                {(config.leaderboardPrizes || defaultConfig.leaderboardPrizes).map((prize, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      isDarkMode ? "border-gray-600 bg-gray-700/50" : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}>
                          Rank {prize.rankEnd ? `${prize.rank}-${prize.rankEnd}` : prize.rank}
                        </label>
                        <div className="flex gap-1">
                          <input
                            type="number"
                            value={prize.rank}
                            onChange={(e) => handlePrizeChange(index, "rank", e.target.value)}
                            min="1"
                            className={`w-full px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              isDarkMode
                                ? "border-gray-600 bg-gray-700 text-white"
                                : "border-gray-300 bg-white text-gray-900"
                            }`}
                          />
                          {prize.rankEnd && (
                            <>
                              <span className={`self-center ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>-</span>
                              <input
                                type="number"
                                value={prize.rankEnd}
                                onChange={(e) => handlePrizeChange(index, "rankEnd", e.target.value)}
                                min={prize.rank + 1}
                                className={`w-full px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                                  isDarkMode
                                    ? "border-gray-600 bg-gray-700 text-white"
                                    : "border-gray-300 bg-white text-gray-900"
                                }`}
                              />
                            </>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}>
                          Prize Type
                        </label>
                        <select
                          value={prize.prizeType}
                          onChange={(e) => handlePrizeChange(index, "prizeType", e.target.value)}
                          className={`w-full px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                            isDarkMode
                              ? "border-gray-600 bg-gray-700 text-white"
                              : "border-gray-300 bg-white text-gray-900"
                          }`}
                        >
                          <option value="cash_voucher">Cash Voucher</option>
                          <option value="movie_ticket">Movie Tickets</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {prize.prizeType === "cash_voucher" && (
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}>
                            Amount (Rs.)
                          </label>
                          <input
                            type="number"
                            value={prize.totalAmount}
                            onChange={(e) => handlePrizeChange(index, "totalAmount", e.target.value)}
                            min="0"
                            className={`w-full px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              isDarkMode
                                ? "border-gray-600 bg-gray-700 text-white"
                                : "border-gray-300 bg-white text-gray-900"
                            }`}
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-2">
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}>
                        Prize Description
                      </label>
                      <input
                        type="text"
                        value={prize.prizeDescription}
                        onChange={(e) => handlePrizeChange(index, "prizeDescription", e.target.value)}
                        className={`w-full px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-white placeholder-gray-500"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div> */}

      {/* Section: Coffee Hero Settings */}
      {/* <div className={`rounded-lg border ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}>
        <SectionHeader title="Coffee Hero (Top Redeemer)" icon={Flame} section="coffeeHero" />

        {expandedSection === "coffeeHero" && (
          <div className="p-4 space-y-4">
            <div className={`flex items-start gap-2 p-3 rounded-lg ${
              isDarkMode ? "bg-amber-900/20" : "bg-amber-50"
            }`}>
              <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? "text-amber-400" : "text-amber-600"}`} />
              <p className={`text-xs ${isDarkMode ? "text-amber-300" : "text-amber-700"}`}>
                The Coffee Hero is the customer who redeems the most points in a month. They receive free coffee for the specified duration.
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Minimum Points Redeemed to Qualify
              </label>
              <input
                type="number"
                value={config.coffeeHeroMinPoints || 5000}
                onChange={(e) => handleConfigChange("coffeeHeroMinPoints", parseInt(e.target.value) || 5000)}
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Free Coffee Duration (Days)
              </label>
              <input
                type="number"
                value={config.coffeeHeroDays || 30}
                onChange={(e) => handleConfigChange("coffeeHeroDays", parseInt(e.target.value) || 30)}
                min="1"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Coffee Hero Reward
              </label>
              <input
                type="text"
                value={config.coffeeHeroReward || "Free Americano (S) per day"}
                onChange={(e) => handleConfigChange("coffeeHeroReward", e.target.value)}
                placeholder="e.g., Free Americano (S) per day"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-500"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>
          </div>
        )}
      </div> */}

      {/* Section: 3-Month Winner */}
      {/* <div className={`rounded-lg border ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}>
        <SectionHeader title="3-Month Loyalty Peak" icon={Mountain} section="threeMonth" />

        {expandedSection === "threeMonth" && (
          <div className="p-4 space-y-4">
            <div className={`flex items-start gap-2 p-3 rounded-lg ${
              isDarkMode ? "bg-purple-900/20" : "bg-purple-50"
            }`}>
              <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />
              <p className={`text-xs ${isDarkMode ? "text-purple-300" : "text-purple-700"}`}>
                Customers who achieve Rank #1 for 3 consecutive months receive a special discount on their next month's coffee purchases.
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                Discount Percentage
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={config.threeMonthWinnerDiscount || 50}
                  onChange={(e) => handleConfigChange("threeMonthWinnerDiscount", parseInt(e.target.value) || 50)}
                  min="1"
                  max="100"
                  className={`w-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                />
                <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  % off coffee for next month
                </span>
              </div>
            </div>
          </div>
        )}
      </div> */}
    </div>
  );
};

export default L5ConfigForm;
