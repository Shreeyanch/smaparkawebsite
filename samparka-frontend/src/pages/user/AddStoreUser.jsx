import React, { useEffect, useState } from "react";
import api from "../../api/config";
import { toast } from "sonner";
import LoadingSpinner from "../../components/LoadingSpinner";
import { CircleX, Store, MapPin, Phone, Upload, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

/**
 * AddStoreUser - Minimal store creation form for regular users
 * Shows only mandatory fields: name, location, phone, type, url, logo
 * Subscription dates are auto-set by backend (7-day free trial from store creation date)
 */
const AddStoreUser = ({ onClose, onSuccess }) => {
  const { authState } = useAuth();
  const { isDarkMode } = useTheme();
  const { token } = authState;
  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    phone: "",
    type: "",
    url: "",
    logo: null,
  });
  const [loading, setLoading] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);

  // Trigger animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  // URL validation - only lowercase letters and numbers (valid subdomain)
  useEffect(() => {
    if (!formData.url) {
      setUrlError("");
    } else if (/[^a-z0-9]/.test(formData.url)) {
      setUrlError("Only lowercase letters (a-z) and numbers (0-9) are allowed");
    } else if (/^[0-9]/.test(formData.url)) {
      setUrlError("Subdomain must start with a letter");
    } else {
      setUrlError("");
    }
  }, [formData.url]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prevData) => ({
        ...prevData,
        [name]: file,
      }));
      setLogoPreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (urlError) {
      toast.error("Please fix the URL format");
      return;
    }

    if (!formData.logo) {
      toast.error("Store Logo is required");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("url", formData.url);
      formDataToSend.append("logo", formData.logo);

      const response = await api.post(
        "/store/createFirstStore",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            token,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message, { duration: 2000 });
        setIsVisible(false);
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
        }, 300);
      } else {
        toast.error(response.data.message, { duration: 2000 });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message, {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black transition-opacity duration-300 ease-out flex items-center justify-end z-50 p-4 ${
        isVisible ? "bg-opacity-50" : "bg-opacity-0"
      }`}
      onClick={handleClose}
    >
      {loading && <LoadingSpinner />}
      <div
        className={`${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col transform transition-transform duration-300 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDarkMode
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          } sticky top-0 z-10 rounded-t-lg`}
        >
          <div>
            <h2
              className={`flex gap-2 items-center text-xl font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <Store /> Create Your Store
            </h2>
            <p
              className={`mt-1 text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Set up your store in just a few steps
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`${
              isDarkMode
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-400 hover:text-gray-600"
            } transition-colors`}
          >
            <X size={24} />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Store Name */}
            <div>
              <label
                className={`flex gap-2 items-center text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                <Store className="h-4 w-4" /> Store Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                    : "border-gray-300 bg-white text-gray-900"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-black`}
                placeholder="Enter your store name"
              />
            </div>

            {/* Location */}
            <div>
              <label
                className={`flex gap-2 items-center text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                <MapPin className="h-4 w-4" /> Store Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                    : "border-gray-300 bg-white text-gray-900"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-black`}
                placeholder="Enter store location"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label
                className={`flex gap-2 items-center text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                <Phone className="h-4 w-4" /> Phone Number *
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                    : "border-gray-300 bg-white text-gray-900"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-black`}
                placeholder="Enter phone number"
              />
            </div>

            {/* Store Type */}
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Store Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-black`}
              >
                <option value="" disabled>
                  Select store type
                </option>
                <option value="retail">Retail</option>
                <option value="food">Food</option>
                <option value="service">Service</option>
              </select>
            </div>

            {/* Store URL */}
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Store URL *
              </label>
              <div className="flex">
                <input
                  type="text"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  required
                  className={`flex-1 px-3 py-2 border ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                      : "border-gray-300 bg-white text-gray-900"
                  } rounded-l-md focus:outline-none focus:ring-2 focus:ring-black`}
                  placeholder="mystore"
                />
                <span
                  className={`inline-flex items-center px-3 py-2 border border-l-0 ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-600 text-gray-400"
                      : "border-gray-300 bg-gray-50 text-gray-500"
                  } rounded-r-md text-sm`}
                >
                  .samparka.co
                </span>
              </div>
              {urlError && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <CircleX size={16} className="mr-1" />
                  {urlError}
                </p>
              )}
            </div>

            {/* Store Logo */}
            <div>
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Store Logo *
              </label>
              <div
                className={`border-2 border-dashed ${
                  isDarkMode
                    ? "border-gray-600 hover:border-gray-500"
                    : "border-gray-300 hover:border-gray-400"
                } rounded-md p-6 text-center transition-colors cursor-pointer`}
                onClick={() =>
                  document.querySelector('input[name="logo"]').click()
                }
              >
                {logoPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className={`h-24 w-24 object-cover rounded-lg border mx-auto ${
                        isDarkMode ? "border-gray-600" : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLogoPreview(null);
                        setFormData((prev) => ({ ...prev, logo: null }));
                        document.querySelector('input[name="logo"]').value = "";
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload
                      className={`mx-auto h-10 w-10 ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                    <div className="mt-2">
                      <span
                        className={`block text-sm font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Click to upload logo
                      </span>
                      <span
                        className={`mt-1 block text-xs ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        PNG, JPG up to 10MB
                      </span>
                    </div>
                  </>
                )}
                <input
                  type="file"
                  name="logo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </div>
            </div>

            {/* Free Trial Notice */}
            <div
              className={`p-4 rounded-lg ${
                isDarkMode ? "bg-green-900/30" : "bg-green-50"
              }`}
            >
              <p
                className={`text-sm ${
                  isDarkMode ? "text-green-400" : "text-green-700"
                }`}
              >
                🎉 You'll get a <strong>7-day free trial</strong> to explore all
                features!
              </p>
            </div>

            {/* Action Buttons */}
            <div
              className={`flex justify-end space-x-3 pt-4 border-t ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                type="button"
                onClick={handleClose}
                className={`px-4 py-2 border ${
                  isDarkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                } rounded-md focus:outline-none transition-colors`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || urlError}
                className={`px-6 py-2 ${
                  isDarkMode
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-zinc-800 hover:bg-zinc-900"
                } text-white font-medium rounded-md focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? "Creating..." : "Create Store"}
              </button>
            </div>

            <p
              className={`text-center text-xs ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
            >
              You can configure additional settings like loyalty points,
              WhatsApp notifications, and more from your store settings later.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStoreUser;
