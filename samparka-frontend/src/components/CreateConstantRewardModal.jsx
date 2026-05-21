import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "../api/config";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Award, Activity, PlusCircle, ArrowUpRight, HelpCircle, Save } from "lucide-react";

const CreateConstantRewardModal = ({ store, isOpen, onClose, onSuccess }) => {
  const isL4Format = store?.loyaltyCard?.format === "L4";

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tier: "",
    redeemable: false,
    redeemableTimes: 1,
    pointCost: 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { authState } = useAuth();
  const { token } = authState;
  const { isDarkMode } = useTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("tier", formData.tier);
      // L4 rewards are always redeemable (redemption is gated by pointCost, not this flag)
      formDataToSend.append("redeemable", isL4Format ? true : formData.redeemable);
      formDataToSend.append("redeemableTimes", formData.redeemableTimes);
      
      // Add pointCost for L4 stores
      if (isL4Format) {
        formDataToSend.append("pointCost", formData.pointCost || 0);
      }

      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      const response = await api.post(
        `/reward/createConstantReward?storeId=${store._id}`,
        formDataToSend,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message, {
          duration: 2000,
        });
        onSuccess();
        onClose();
      } else {
        toast.error(response.data.message, {
          duration: 2000,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to create constant reward", {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Trigger animation after a short delay
      setTimeout(() => setIsVisible(true), 10);
      // Reset form when modal opens
      setFormData({
        name: "",
        description: "",
        tier: "",
        redeemable: false,
        redeemableTimes: 1,
        pointCost: 0,
      });
      setImageFile(null);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

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
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        } ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b sticky top-0 z-10 rounded-t-lg ${
          isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg">
              <PlusCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Create Constant Reward
              </h2>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Add a new constant reward for {store?.name}
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Reward Name */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Reward Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Award className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter reward name"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>

            {/* Reward Description */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter reward description"
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Select Tier */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Select Tier <span className="text-red-500">*</span>
              </label>
              {store?.loyaltyCard?.tier ? (
                <select
                  name="tier"
                  value={formData.tier}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="" disabled>
                    Select Tier
                  </option>
                  {store.loyaltyCard.tier.map((tier) => (
                    <option key={tier._id} value={tier.name}>
                      {tier.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  No tiers available for this store
                </p>
              )}
            </div>

            {/* Redeemable — hidden for L4 (always redeemable, controlled by pointCost) */}
            {!isL4Format && (
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="redeemable"
                  checked={formData.redeemable}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      redeemable: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                />
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Redeemable
                </span>
              </label>
            </div>
            )}

            {/* Redeemable Times */}
            {!isL4Format && formData.redeemable && (
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Redeemable Times
                </label>
                <input
                  type="number"
                  name="redeemableTimes"
                  value={formData.redeemableTimes}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            )}

            {/* Point Cost - Only for L4 stores */}
            {store?.loyaltyCard?.format === "L4" && (
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Point Cost <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    Points required to redeem this reward
                  </span>
                </label>
                <input
                  type="number"
                  name="pointCost"
                  value={formData.pointCost}
                  onChange={handleChange}
                  min="0"
                  required={store?.loyaltyCard?.format === "L4"}
                  placeholder="Enter point cost"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            )}

            {/* Reward Image */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Reward Image <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                required
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              {imageFile && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-3 p-4 border-t sticky bottom-0 z-10 rounded-b-lg ${
          isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
        }`}>
          <button
            type="button"
            onClick={handleClose}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Reward
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateConstantRewardModal;