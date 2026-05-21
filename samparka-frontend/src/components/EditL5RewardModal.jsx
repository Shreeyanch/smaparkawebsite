import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "../api/config";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Award, Activity, X, Info } from "lucide-react";

const EditL5RewardModal = ({ store, reward, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    threshold: "",
    rewardType: "discount",
    discountPercentage: "",
    validity: "instant",
    evergreen: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { authState } = useAuth();
  const { token } = authState;
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (reward && isOpen) {
      setFormData({
        name: reward.name || "",
        description: reward.description || "",
        threshold: reward.threshold || "",
        rewardType: reward.rewardType || "discount",
        discountPercentage: reward.discountPercentage || "",
        validity: reward.validity || "instant",
        evergreen: reward.evergreen || false,
      });
      setCurrentImage(reward.image || null);
      setImageFile(null);
    }
  }, [isOpen, reward?._id]); // eslint-disable-line react-hooks/exhaustive-deps

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
      console.log('[EditL5RewardModal] Form data before sending:', formData);
      console.log('[EditL5RewardModal] Description value:', formData.description);
      
      const formDataToSend = new FormData();
      formDataToSend.append("rewardId", reward._id); // Use reward _id to identify which reward to update
      formDataToSend.append("threshold", parseInt(formData.threshold));
      formDataToSend.append("rewardType", formData.rewardType);
      formDataToSend.append("rewardName", formData.name);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("validity", formData.validity);
      formDataToSend.append("evergreen", formData.evergreen);
      
      // Log all FormData entries
      console.log('[EditL5RewardModal] FormData entries:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      if (formData.rewardType === "discount") {
        formDataToSend.append("discountPercentage", parseInt(formData.discountPercentage));
      }

      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      const response = await api.put(
        `/reward/editRewardThreshold?storeId=${store._id}`,
        formDataToSend,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Reward updated successfully", {
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
      toast.error(error.message || "Failed to update reward", {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      threshold: "",
      rewardType: "discount",
      discountPercentage: "",
      validity: "instant",
      evergreen: false,
    });
    setImageFile(null);
    setCurrentImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
          isDarkMode ? "bg-gray-900" : "bg-white"
        }`}
      >
        {/* Header */}
        <div className={`sticky top-0 px-6 py-4 border-b flex items-center justify-between ${
          isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
        } z-10`}>
          <h2 className={`text-xl font-semibold ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}>
            Edit L5 Reward
          </h2>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg hover:scale-[1.2] transition-all ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Form Fields */}
            <div className="space-y-4">
              {/* Reward Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Reward Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  required
                  onChange={handleChange}
                  placeholder="Enter reward name"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>

              {/* Reward Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Reward Description <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter reward description"
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent resize-none ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>

              {/* Threshold */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Points Threshold <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Activity
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                      isDarkMode ? "text-gray-400" : "text-gray-400"
                    }`}
                    size={18}
                  />
                  <input
                    type="number"
                    name="threshold"
                    value={formData.threshold}
                    required
                    onChange={handleChange}
                    placeholder="Enter threshold points"
                    min={1}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>
              </div>

              {/* Reward Type */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Reward Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="rewardType"
                  value={formData.rewardType}
                  required
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <option value="discount">Discount</option>
                  <option value="physical">Physical Reward</option>
                </select>
              </div>

              {/* Discount Percentage */}
              {formData.rewardType === "discount" && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Discount Percentage <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="discountPercentage"
                    value={formData.discountPercentage}
                    required={formData.rewardType === "discount"}
                    onChange={handleChange}
                    placeholder="Enter discount %"
                    min={1}
                    max={100}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>
              )}

              {/* Upload Image */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Upload Image <span className="text-gray-500">(Optional)</span>
                </label>
                {currentImage && !imageFile && (
                  <div className="mb-2">
                    <img
                      src={currentImage}
                      alt="Current"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Current image</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-green-50 file:text-green-700 hover:file:bg-green-100 ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-gray-200"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                />
              </div>

              {/* Validity */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Customer Redeem Validity
                </label>
                <select
                  name="validity"
                  value={formData.validity}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <option value="instant">Instant</option>
                  {Array.from({ length: 365 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i + 1 === 1 ? "day" : "days"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Evergreen Mode */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="evergreen"
                  checked={formData.evergreen}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      evergreen: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-1"
                />
                <label className={`text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Evergreen Mode
                </label>
                <div className="relative group">
                  <Info 
                    className={`w-4 h-4 cursor-help ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} 
                  />
                  <div className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-80 px-3 py-2 text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${
                    isDarkMode 
                      ? 'bg-gray-800 text-gray-200 border border-gray-600' 
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}>
                    <div>
                      <div className="font-medium mb-1">Evergreen Mode</div>
                      <div className="mb-2">
                        Enabled: Users can redeem this reward multiple times as long as they have enough points.
                      </div>
                      <div>
                        Disabled: Users can only redeem this reward once when they first reach the required points.
                      </div>
                    </div>
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                      isDarkMode ? 'border-t-gray-800' : 'border-t-white'
                    }`}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}>
                Preview
              </h3>

              <div className={`rounded-lg p-4 ${
                isDarkMode ? "bg-gray-700" : "bg-gray-50"
              }`}>
                <div className={`rounded-lg border p-4 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-600"
                    : "bg-white border-gray-200"
                }`}>
                  {/* Image Preview */}
                  <div className="relative">
                    <img
                      className="w-full h-48 rounded-lg object-cover"
                      alt="Reward preview"
                      src={
                        imageFile
                          ? URL.createObjectURL(imageFile)
                          : currentImage ||
                            "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Latte_and_dark_coffee.jpg/1200px-Latte_and_dark_coffee.jpg"
                      }
                    />
                  </div>

                  <div className="mt-4">
                    <h4 className={`text-lg font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}>
                      {formData.name || "Reward Name"}
                    </h4>
                    {formData.description && (
                      <p className={`text-sm mt-1 ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}>
                        {formData.description}
                      </p>
                    )}
                    <p className={`text-sm mt-2 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}>
                      {formData.threshold || "0"} Points Required
                    </p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={`${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}>
                      Reward Type:
                    </span>
                    <span className={`${
                      isDarkMode ? "text-gray-200" : "text-gray-900"
                    }`}>
                      {formData.rewardType === "discount" ? "Discount" : "Physical Reward"}
                    </span>
                  </div>
                  {formData.rewardType === "discount" && (
                    <div className="flex justify-between">
                      <span className={`${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}>
                        Discount:
                      </span>
                      <span className={`${
                        isDarkMode ? "text-gray-200" : "text-gray-900"
                      }`}>
                        {formData.discountPercentage || "0"}%
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className={`${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}>
                      Validity:
                    </span>
                    <span className={`${
                      isDarkMode ? "text-gray-200" : "text-gray-900"
                    }`}>
                      {formData.validity === "instant" ? "Instant" : `${formData.validity || 0} days`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}>
                      Evergreen:
                    </span>
                    <span className={`${
                      isDarkMode ? "text-gray-200" : "text-gray-900"
                    }`}>
                      {formData.evergreen ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Reward"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditL5RewardModal;
