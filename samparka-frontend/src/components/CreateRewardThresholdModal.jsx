import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "../api/config";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Gift, Percent, PlusCircle, Save, Trash2, Plus } from "lucide-react";

const CreateRewardThresholdModal = ({ store, isOpen, onClose, onSuccess }) => {
  const [rewards, setRewards] = useState([
    { threshold: 775, rewardType: "physical", rewardName: "Free Americano (S)", discountPercentage: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { authState } = useAuth();
  const { token } = authState;
  const { isDarkMode } = useTheme();

  const handleRewardChange = (index, field, value) => {
    const updatedRewards = [...rewards];
    updatedRewards[index] = {
      ...updatedRewards[index],
      [field]: field === "threshold" || field === "discountPercentage" ? parseInt(value) || 0 : value,
    };
    setRewards(updatedRewards);
  };

  const addReward = () => {
    const lastThreshold = rewards.length > 0 ? rewards[rewards.length - 1].threshold : 0;
    const newReward = {
      threshold: lastThreshold + 1000,
      rewardType: "discount",
      rewardName: "New Reward",
      discountPercentage: 5,
    };
    setRewards([...rewards, newReward]);
  };

  const removeReward = (index) => {
    if (rewards.length > 1) {
      setRewards(rewards.filter((_, i) => i !== index));
    }
  };

  const getRewardIcon = (type) => {
    switch (type) {
      case "discount":
        return <Percent className={`w-4 h-4 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`} />;
      case "physical":
        return <Gift className={`w-4 h-4 ${isDarkMode ? "text-amber-400" : "text-amber-600"}`} />;
      default:
        return <Gift className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Sort rewards by threshold before submitting
      const sortedRewards = [...rewards].sort((a, b) => a.threshold - b.threshold);

      const response = await api.post(
        `/reward/createRewardThresholds?storeId=${store._id}`,
        { rewards: sortedRewards },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Reward thresholds created successfully", {
          duration: 2000,
        });
        onSuccess();
        handleClose();
      } else {
        toast.error(response.data.message, {
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create reward thresholds", {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle modal animation
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setRewards([
        { threshold: 775, rewardType: "physical", rewardName: "Free Americano (S)", discountPercentage: 0 }
      ]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black transition-opacity duration-300 ease-out flex items-center justify-end z-50 p-4 ${
        isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col transform transition-transform duration-300 ease-out ${
          isDarkMode 
            ? 'bg-gray-900 border border-gray-700' 
            : 'bg-white'
        } ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`} 
        style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b sticky top-0 z-10 rounded-t-lg ${
          isDarkMode 
            ? 'border-gray-700 bg-gray-900' 
            : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center gap-3">
            <PlusCircle className="w-5 h-5 text-green-600" />
            <h2 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Create Reward Thresholds</h2>
          </div>
          <button
            onClick={handleClose}
            className={`text-2xl transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-gray-200' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Store Information */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Store
              </label>
              <div className={`w-full px-4 py-2 border rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-gray-200' 
                  : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}>
                {store?.name || "No store selected"}
              </div>
            </div>

            {/* Info Box */}
            <div className={`p-3 rounded-lg border ${
              isDarkMode ? 'bg-blue-900/20 border-blue-700/50' : 'bg-blue-50 border-blue-200'
            }`}>
              <p className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                Configure point thresholds and their rewards. Customers can redeem rewards when they reach these points.
              </p>
            </div>

            {/* Rewards List */}
            <div className="space-y-3">
              {rewards.map((reward, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    isDarkMode ? "border-gray-600 bg-gray-800/50" : "border-gray-200 bg-gray-50"
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

                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Points Threshold */}
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}>
                            Points Required <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={reward.threshold}
                            onChange={(e) => handleRewardChange(index, "threshold", e.target.value)}
                            min="1"
                            required
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 ${
                              isDarkMode
                                ? "border-gray-600 bg-gray-700 text-white"
                                : "border-gray-300 bg-white text-gray-900"
                            }`}
                          />
                        </div>

                        {/* Reward Type */}
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}>
                            Reward Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={reward.rewardType}
                            onChange={(e) => handleRewardChange(index, "rewardType", e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 ${
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Reward Name */}
                        <div className={reward.rewardType === "physical" ? "md:col-span-2" : ""}>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}>
                            Reward Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={reward.rewardName}
                            onChange={(e) => handleRewardChange(index, "rewardName", e.target.value)}
                            placeholder="e.g., Free Coffee"
                            required
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 ${
                              isDarkMode
                                ? "border-gray-600 bg-gray-700 text-white placeholder-gray-500"
                                : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                            }`}
                          />
                        </div>

                        {/* Discount Percentage (only for discount type) */}
                        {reward.rewardType === "discount" && (
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}>
                              Discount % <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={reward.discountPercentage}
                              onChange={(e) => handleRewardChange(index, "discountPercentage", e.target.value)}
                              min="1"
                              max="100"
                              required
                              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 ${
                                isDarkMode
                                  ? "border-gray-600 bg-gray-700 text-white"
                                  : "border-gray-300 bg-white text-gray-900"
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Remove Button */}
                    {rewards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeReward(index)}
                        className={`p-2 rounded-lg transition-colors ${
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

              {/* Add Reward Button */}
              <button
                type="button"
                onClick={addReward}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg transition-colors ${
                  isDarkMode
                    ? "border-gray-600 text-gray-400 hover:border-green-500 hover:text-green-400"
                    : "border-gray-300 text-gray-500 hover:border-green-500 hover:text-green-600"
                }`}
              >
                <Plus className="w-4 h-4" />
                Add Reward Threshold
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className={`flex justify-end space-x-3 p-4 border-t sticky bottom-0 z-10 rounded-b-lg ${
          isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
        }`}>
          <button
            type="button"
            onClick={handleClose}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              isDarkMode 
                ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {loading ? "Creating..." : "Create Thresholds"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRewardThresholdModal;
