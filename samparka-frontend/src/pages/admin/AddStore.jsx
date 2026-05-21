import React, { useEffect, useState } from "react";
import api from "../../api/config";
import { toast } from "sonner";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  CircleX,
  Store,
  MapPin,
  Phone,
  Users,
  Star,
  Calendar,
  Upload,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { WhatsApp } from "@mui/icons-material";

const AddStore = ({ onClose, onSuccess }) => {
  const [isPoints, setIsPoints] = useState(true);
  const { authState } = useAuth();
  const { isDarkMode } = useTheme();
  const { token, userInfo: user } = authState;
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    limitPoints: false,
    needCustomerDOB: false,
    needCustomerGender: false,
    needBillID: false,
    needBillIDForReward: false,
    letSubAdminToGiveManualPoints: true,
    letSubAdminToClaimRewards: false,
    showPhoneNumberOnSubAdmin: true,
    showEmailOnSubAdmin: true,
    whatsapp: false,
    whatsappOrder: false,
    isRounded: true,
    givePointsOnRegister: true,
    requireEmailOTP: true,
    requirePhoneOTP: false,
  });
  const [loading, setLoading] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [frontLogoPreview, setFrontLogoPreview] = useState(null);

  // Trigger animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
      if (frontLogoPreview) {
        URL.revokeObjectURL(frontLogoPreview);
      }
    };
  }, [logoPreview, frontLogoPreview]);

  useEffect(() => {
    if (formData.url && /[^a-z0-9.-]/.test(formData.url)) {
      setUrlError("Invalid URL");
    } else {
      setUrlError("");
    }
  }, [formData.url]);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await api.get("/admin/getUsers", {
          headers: { token },
        });
        if (response.data.success) {
          setUsers(response.data.users);
        }
      } catch (error) {
      }
    };

    getUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleTabChange = (isAmountSelected) => {
    // Update formData.amounts based on the selected tab
    setFormData((prevData) => ({
      ...prevData,
      amounts: isAmountSelected, // true for Amount, false for Points
      conversionRate: isAmountSelected ? prevData.conversionRate : "",
      pointValue: isAmountSelected ? prevData.pointValue : "",
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      // Set the file in formData
      setFormData((prevData) => ({
        ...prevData,
        [name]: file,
      }));

      // Set the preview based on the input name
      if (name === "logo") {
        setLogoPreview(previewUrl);
      } else if (name === "frontLogo") {
        setFrontLogoPreview(previewUrl);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a new FormData object
      const formDataToSend = new FormData();

      // Append each field to the FormData object
      formDataToSend.append("name", formData.name);
      formDataToSend.append("location", formData.location);
      formData.lat && formDataToSend.append("lat", formData.lat);
      formData.lng && formDataToSend.append("lng", formData.lng);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("url", formData.url);
      formDataToSend.append("user", formData.user);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("limitPoints", formData.limitPoints);
      formDataToSend.append("needCustomerDOB", formData.needCustomerDOB);
      formDataToSend.append("needCustomerGender", formData.needCustomerGender);
      formDataToSend.append("needBillID", formData.needBillID);
      formDataToSend.append(
        "needBillIDForReward",
        formData.needBillIDForReward
      );
      formDataToSend.append(
        "letSubAdminToGiveManualPoints",
        formData.letSubAdminToGiveManualPoints
      );
      formDataToSend.append(
        "letSubAdminToClaimRewards",
        formData.letSubAdminToClaimRewards
      );
      formDataToSend.append(
        "showPhoneNumberOnSubAdmin",
        formData.showPhoneNumberOnSubAdmin
      );
      formDataToSend.append(
        "showEmailOnSubAdmin",
        formData.showEmailOnSubAdmin
      );
      formDataToSend.append("whatsapp", formData.whatsapp);
      formDataToSend.append("whatsappOrder", formData.whatsappOrder);
      formDataToSend.append("requireEmailOTP", formData.requireEmailOTP);
      formDataToSend.append("requirePhoneOTP", formData.requirePhoneOTP);
      formDataToSend.append("isRounded", formData.isRounded);
      formDataToSend.append(
        "givePointsOnRegister",
        formData.givePointsOnRegister
      );
      formDataToSend.append("conversionRate", formData.conversionRate);
      formDataToSend.append("amount", formData.amounts);
      formData.subscriptionStartDate &&
        formDataToSend.append(
          "subscriptionStartDate",
          formData.subscriptionStartDate
        );
      formData.subscriptionEndDate &&
        formDataToSend.append(
          "subscriptionEndDate",
          formData.subscriptionEndDate
        );
      formDataToSend.append(
        "pointValue",
        formData.pointValue ? formData.pointValue : null
      );
      formDataToSend.append("hasExpiry", formData.hasExpiry);
      formDataToSend.append("expiryDays", formData.expiryDays);

      // Append the file (image)
      if (formData.logo) {
        formDataToSend.append("logo", formData.logo);
      } else {
        return toast.error("Store Logo Is Required");
      }
      if (formData.frontLogo) {
        formDataToSend.append("frontLogo", formData.frontLogo);
      }

      const response = await api.post("/store/addStore", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          token,
        },
      });
      if (response.data.success) {
        toast.success(response.data.message, {
          duration: 2000,
        });
        if (onSuccess) {
          setIsVisible(false);
          setTimeout(() => {
            onSuccess();
          }, 300);
        }
      } else {
        toast.error(response.data.message, {
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error(error.message, {
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
        } rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col transform transition-transform duration-300 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Fixed */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDarkMode
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          } sticky top-0 z-10 rounded-t-lg`}
        >
          <h2
            className={`flex gap-2 items-center text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            <Store /> Add New Store
          </h2>
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
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className={`flex gap-2 items-center text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
                >
                  <Store className="h-5" /> Store Name *
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
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-black accent-black`}
                  placeholder="Enter store name"
                />
              </div>
              <div>
                <label
                  className={`flex gap-2 items-center text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
                >
                  <MapPin className="h-5" /> Location *
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
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-black accent-black`}
                  placeholder="Enter location"
                />
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
                >
                  Latitude
                </label>
                <input
                  type="number"
                  name="lat"
                  value={formData.lat}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                      : "border-gray-300 bg-white text-gray-900"
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-black accent-black`}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
                >
                  Longitude
                </label>
                <input
                  type="number"
                  name="lng"
                  value={formData.lng}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                      : "border-gray-300 bg-white text-gray-900"
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-black accent-black`}
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Phone and Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className={`flex gap-2 items-center text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
                >
                  <Phone className="h-5" /> Phone Number *
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
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-black accent-black`}
                  placeholder="Enter phone number"
                />
              </div>
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
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-black accent-black`}
                >
                  <option selected disabled value="">
                    Select store type
                  </option>
                  <option value="retail">Retail</option>
                  <option value="food">Food</option>
                  <option value="service">Service</option>
                </select>
              </div>
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
                  } rounded-l-md focus:outline-none focus:ring-1 focus:ring-black accent-black`}
                  placeholder="mystore"
                />
                <span
                  className={`inline-flex items-center px-3 py-2 border border-l-0 ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-gray-400"
                      : "border-gray-300 bg-gray-50 text-gray-500"
                  } rounded-r-md text-sm`}
                >
                  .samparka.co
                </span>
              </div>
              {urlError && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <CircleX size={16} className="mr-1" />
                  {urlError}
                </p>
              )}
            </div>

            {/* Store Media */}
            <div>
              <h3
                className={`text-lg font-medium ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } mb-4`}
              >
                Store Media
              </h3>
              <div className="grid grid-cols-2 gap-4">
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
                    <Upload
                      className={`mx-auto h-12 w-12 ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                    <div className="mt-2">
                      <span
                        className={`mt-2 block text-sm font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        PNG, JPG up to 10MB
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        High resolution recommended
                      </span>
                      <input
                        type="file"
                        name="logo"
                        accept="image/*"
                        onChange={handleFileChange}
                        // required
                        className="sr-only"
                      />
                    </div>
                  </div>
                  {/* Logo Preview */}
                  {logoPreview && (
                    <div className="mt-3">
                      <p
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        } mb-2`}
                      >
                        Preview:
                      </p>
                      <div className="relative inline-block">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className={`h-20 w-20 object-cover rounded-lg border ${
                            isDarkMode ? "border-gray-600" : "border-gray-300"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLogoPreview(null);
                            setFormData((prev) => ({ ...prev, logo: null }));
                            document.querySelector('input[name="logo"]').value =
                              "";
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                  >
                    Store Front Image
                  </label>
                  <div
                    className={`border-2 border-dashed ${
                      isDarkMode
                        ? "border-gray-600 hover:border-gray-500"
                        : "border-gray-300 hover:border-gray-400"
                    } rounded-md p-6 text-center transition-colors cursor-pointer`}
                    onClick={() =>
                      document.querySelector('input[name="frontLogo"]').click()
                    }
                  >
                    <Upload
                      className={`mx-auto h-12 w-12 ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                    <div className="mt-2">
                      <span
                        className={`mt-2 block text-sm font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        PNG, JPG up to 10MB
                      </span>
                      <span
                        className={`mt-1 block text-xs ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        High resolution recommended
                      </span>
                      <input
                        type="file"
                        name="frontLogo"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </div>
                  </div>
                  {/* Front Logo Preview */}
                  {frontLogoPreview && (
                    <div className="mt-3">
                      <p
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        } mb-2`}
                      >
                        Preview:
                      </p>
                      <div className="relative inline-block">
                        <img
                          src={frontLogoPreview}
                          alt="Front image preview"
                          className="h-20 w-20 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFrontLogoPreview(null);
                            setFormData((prev) => ({
                              ...prev,
                              frontLogo: null,
                            }));
                            document.querySelector(
                              'input[name="frontLogo"]'
                            ).value = "";
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Settings */}
            <div>
              <h3
                className={`flex gap-2 items-center text-lg font-medium ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } mb-4`}
              >
                <Users className="h-5" /> Customer Settings
              </h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="givePointsOnRegister"
                    checked={formData.givePointsOnRegister}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        givePointsOnRegister: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-black accent-black"
                  />
                  <span
                    className={`ml-2 text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Give 1 Point to New Customer on Register
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="limitPoints"
                    checked={formData.limitPoints}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        limitPoints: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-black accent-black"
                  />
                  <span
                    className={`ml-2 text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Limit Points One Time Per Day
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="needCustomerDOB"
                    checked={formData.needCustomerDOB}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        needCustomerDOB: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-black accent-black"
                  />
                  <span
                    className={`ml-2 text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Need Customer's Date of Birth?
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="needCustomerGender"
                    checked={formData.needCustomerGender}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        needCustomerGender: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-black accent-black"
                  />
                  <span
                    className={`ml-2 text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Need Customer's Gender?
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="needBillID"
                    checked={formData.needBillID}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        needBillID: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-black accent-black"
                  />
                  <span
                    className={`ml-2 text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Need Bill ID?
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="needBillIDForReward"
                    checked={formData.needBillIDForReward}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        needBillIDForReward: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-black accent-black"
                  />
                  <span
                    className={`ml-2 text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Need Bill ID For Reward?
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="letSubAdminToGiveManualPoints"
                    checked={formData.letSubAdminToGiveManualPoints}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        letSubAdminToGiveManualPoints: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-black accent-black"
                  />
                  <span
                    className={`ml-2 text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Let Sub Admin To Give Manual Points?
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="letSubAdminToClaimRewards"
                    checked={formData.letSubAdminToClaimRewards}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        letSubAdminToClaimRewards: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-black accent-black"
                  />
                  <span
                    className={`ml-2 text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Let Sub Admin To Claim Rewards?
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="showPhoneNumberOnSubAdmin"
                    checked={formData.showPhoneNumberOnSubAdmin}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        showPhoneNumberOnSubAdmin: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-black accent-black"
                  />
                  <span
                    className={`ml-2 text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Show Phone Number On Sub Admin Side?
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="showEmailOnSubAdmin"
                    checked={formData.showEmailOnSubAdmin}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        showEmailOnSubAdmin: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-black accent-black"
                  />
                  <span
                    className={`ml-2 text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Show Email On Sub Admin Side?
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="requireEmailOTP"
                    checked={formData.requireEmailOTP}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        requireEmailOTP: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-black accent-black"
                  />
                  <span
                    className={`ml-2 text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Require Email OTP for Customer Login?
                  </span>
                </label>
                <label className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    name="requirePhoneOTP"
                    checked={formData.requirePhoneOTP}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        requirePhoneOTP: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-black accent-black"
                  />
                  <span
                    className={`ml-2 text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Require Phone OTP for Customer Login?
                  </span>
                </label>
              </div>
            </div>

            {/* WhatsApp Notifications */}
            <div>
              <h3
                className={`text-lg font-medium ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } mb-4`}
              >
                <WhatsApp className="text-xl" /> WhatsApp Notifications
              </h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="whatsapp"
                    checked={formData.whatsapp}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        whatsapp: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-black accent-black"
                  />
                  <span
                    className={`ml-2 text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Send WhatsApp message on reservations
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="whatsappOrder"
                    checked={formData.whatsappOrder}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        whatsappOrder: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-black accent-black"
                  />
                  <span
                    className={`ml-2 text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Receive WhatsApp messages for orders
                  </span>
                </label>
              </div>
            </div>

            {/* Points System */}
            <div>
              <h3
                className={`flex gap-2 items-center text-lg font-medium ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } mb-4`}
              >
                <Star className="h-5" /> Points System
              </h3>
              <div
                className={`border ${
                  isDarkMode ? "border-gray-600" : "border-gray-200"
                } rounded-lg p-4`}
              >
                <div className="flex border-b mb-4">
                  <button
                    type="button"
                    className={`flex-1 py-2 text-center text-sm font-medium ${
                      isPoints
                        ? `${
                            isDarkMode
                              ? " border-b-2 border-white text-white "
                              : " border-b-2 border-black text-black "
                          }`
                        : `${
                            isDarkMode
                              ? "text-gray-400 hover:text-gray-300"
                              : "text-gray-500 hover:text-gray-700"
                          }`
                    }`}
                    onClick={() => {
                      setIsPoints(true);
                      handleTabChange(false);
                    }}
                  >
                    Points
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 text-center text-sm font-medium ${
                      !isPoints
                        ? `${
                            isDarkMode
                              ? " border-b-2 border-white text-white "
                              : " border-b-2 border-black text-black "
                          }`
                        : `${
                            isDarkMode
                              ? "text-gray-400 hover:text-gray-300"
                              : "text-gray-500 hover:text-gray-700"
                          }`
                    }`}
                    onClick={() => {
                      setIsPoints(false);
                      handleTabChange(true);
                    }}
                  >
                    Amount (Rupees)
                  </button>
                </div>

                {isPoints ? (
                  <div
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    <p>
                      The points can be customly given, meaning you can assign
                      as many points as you want, regardless of the Rs. spent.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        How many points to give
                      </label>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          1 Point = Rs.
                        </span>
                        <input
                          type="number"
                          name="conversionRate"
                          value={formData.conversionRate}
                          onChange={handleChange}
                          min="1"
                          className={`w-20 px-2 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-black accent-black ${
                            isDarkMode
                              ? "border-gray-600 bg-gray-800 text-gray-300"
                              : "border-gray-300 bg-white text-gray-900"
                          }`}
                        />
                      </div>
                      <p
                        className={`mt-1 text-xs ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Enter the equivalent Min Rs. needed to spend to earn 1
                        point.
                      </p>
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        For what amount to spend
                      </label>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          1 Point = Rs.
                        </span>
                        <input
                          type="number"
                          name="pointValue"
                          value={formData.pointValue}
                          onChange={handleChange}
                          min="1"
                          className={`w-20 px-2 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-black accent-black ${
                            isDarkMode
                              ? "border-gray-600 bg-gray-800 text-gray-300"
                              : "border-gray-300 bg-white text-gray-900"
                          }`}
                        />
                      </div>
                      <p
                        className={`mt-1 text-xs ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        How much 1 reward point is worth in rupees when
                        redeemed.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-4 space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isRounded"
                      checked={formData.isRounded}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isRounded: e.target.checked,
                        }))
                      }
                      className={`h-4 w-4 rounded focus:ring-black accent-black ${
                        isDarkMode ? "border-gray-600" : "border-gray-300"
                      }`}
                    />
                    <span
                      className={`ml-2 text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Round points to the nearest whole number
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="hasExpiry"
                      checked={formData.hasExpiry}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          hasExpiry: e.target.checked,
                        }))
                      }
                      className={`h-4 w-4 rounded focus:ring-black accent-black ${
                        isDarkMode ? "border-gray-600" : "border-gray-300"
                      }`}
                    />
                    <span
                      className={`ml-2 text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Add expiry days
                    </span>
                  </label>

                  {formData.hasExpiry && (
                    <div className="ml-6">
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Points expiry days
                      </label>
                      <input
                        type="number"
                        name="expiryDays"
                        value={formData.expiryDays || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            expiryDays: Number(e.target.value),
                          }))
                        }
                        min="30"
                        max="365"
                        className={`w-24 px-2 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-black accent-black ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-800 text-gray-300"
                            : "border-gray-300 bg-white text-gray-900"
                        }`}
                        placeholder="90"
                      />
                      <p
                        className={`mt-1 text-xs ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        30-365 days
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Settings - Assign User */}
            <div>
              <h3
                className={`text-lg font-medium mb-4 ${
                  isDarkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Admin Settings
              </h3>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Assign User *
                </label>
                <select
                  name="user"
                  value={formData.user}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black accent-black ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-800 text-gray-300"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                >
                  <option selected disabled value="">
                    Select User
                  </option>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.email}
                      </option>
                    ))
                  ) : (
                    <option disabled>No users available</option>
                  )}
                </select>
              </div>
            </div>

            {/* Subscription Period */}
            <div>
              <h3
                className={`flex gap-2 items-center text-lg font-medium ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } mb-4`}
              >
                <Calendar className="h-5" /> Subscription Period
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                  >
                    Start Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="subscriptionStartDate"
                      value={
                        formData.subscriptionStartDate?.split("T")[0] || ""
                      }
                      onChange={handleChange}
                      disabled={user.role !== "admin"}
                      className={`w-full px-3 py-2 border ${
                        isDarkMode
                          ? "border-gray-600 bg-gray-700 text-white disabled:bg-gray-600"
                          : "border-gray-300 bg-white text-gray-900 disabled:bg-gray-100"
                      } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 accent-black disabled:cursor-not-allowed`}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                  >
                    End Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="subscriptionEndDate"
                      value={formData.subscriptionEndDate?.split("T")[0] || ""}
                      onChange={handleChange}
                      disabled={user.role !== "admin"}
                      className={`w-full px-3 py-2 border ${
                        isDarkMode
                          ? "border-gray-600 bg-gray-700 text-white disabled:bg-gray-600"
                          : "border-gray-300 bg-white text-gray-900 disabled:bg-gray-100"
                      } rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 accent-black disabled:cursor-not-allowed`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className={`flex justify-end space-x-3 pt-6 border-t ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                type="button"
                onClick={handleClose}
                className={`px-4 py-2 border ${
                  isDarkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                } rounded-md focus:outline-none focus:ring-1 focus:ring-black`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={(loading || urlError) && true}
                className={`px-4 py-2 ${
                  isDarkMode
                    ? "bg-green-600 hover:bg-green-800"
                    : "bg-zinc-800 hover:bg-zinc-900"
                } text-white rounded-md focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? "Adding..." : "Add Store"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStore;
