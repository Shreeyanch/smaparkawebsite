import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import api from "../api/config";
import { toast } from "sonner";
import L3 from "../components/L3";
import L2 from "../components/L2";
import L1 from "../components/L1";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import { StoreAuthProvider } from "../context/StoreAuthContext";

import TiersForm2 from "../components/TiersForm_L4";
import TiersForm from "../components/TiersForm";
import Position from "../components/l3Components/Position";
import L5ConfigForm from "../components/L5ConfigForm";
import { L5Card } from "../components/L5";
import { Trash2, X, Upload, Edit3, Coffee, Trophy, Gift, Flame, Star, MapPin, Sparkles, Smile, ThumbsUp } from "lucide-react";

// L5 Preview Card Component - Circular Progress Design
const L5PreviewCard = ({ cardData, l5Config, storeName, isDarkMode }) => {
  const textColor = cardData.textColor || "#1c1917";
  const cardColor = cardData.cardColor || "#6ee7b7";
  
  // Demo data for preview
  const totalPoints = 1000;
  const nextMilestone = 1500;
  const progress = (totalPoints / nextMilestone) * 100;
  const progressAngle = (progress / 100) * 360;

  // Demo outlets
  const demoOutlets = [
    { outletName: "Damkal", currentPoints: 0 },
    { outletName: "Pepsicola", currentPoints: 1000 },
  ];

  // Available stamp icons
  const stampIcons = {
    coffee: <Coffee className="w-12 h-12" style={{ color: textColor }} />,
    star: <Star className="w-12 h-12" style={{ color: textColor }} />,
    smile: <Smile className="w-12 h-12" style={{ color: textColor }} />,
    thumbsUp: <ThumbsUp className="w-12 h-12" style={{ color: textColor }} />,
  };

  // Convert hex to rgba for shadow
  const hexToRgba = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.4)`;
  };

  return (
    <div
      className="w-full max-w-[280px] rounded-3xl p-6 relative overflow-hidden"
      style={{
        backgroundColor: cardColor,
        backgroundImage: cardData.cardImage ? `url(${cardData.cardImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: `0 20px 50px ${hexToRgba(cardColor)}`,
      }}
    >
      {/* Shine Effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 pointer-events-none"
        style={{ animation: "shine 3s ease-in-out infinite" }}
      />

      {/* Rank Badge */}
      <div 
        className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full"
        style={{ background: `${textColor}20`, border: `1px solid ${textColor}30` }}
      >
        <span className="text-xs font-bold" style={{ color: textColor }}>#1</span>
        <Sparkles className="w-3 h-3" style={{ color: textColor }} />
      </div>

      {/* Circular Progress Bar */}
      <div className="flex flex-col items-center pt-2">
        <div className="relative flex justify-center items-center w-[140px] h-[140px]">
          <svg
            className="rotate-[-90deg]"
            width="140"
            height="140"
            viewBox="0 0 120 120"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Circle */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={`${textColor}20`}
              strokeWidth="8"
            />
            {/* Progress Circle */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={textColor}
              strokeWidth="8"
              strokeDasharray="314.159"
              strokeDashoffset={314.159 - (progressAngle / 360) * 314.159}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          {/* Center Icon */}
          <div className="absolute">
            {cardData.customStamp ? (
              <img className="w-12 h-12 object-contain" alt="Stamp" src={cardData.customStamp} />
            ) : (
              stampIcons[cardData.stamp] || stampIcons.coffee
            )}
          </div>
        </div>

        {/* Points Display */}
        <div className="flex flex-col items-center mt-3" style={{ color: textColor }}>
          <p className="text-xs opacity-70 tracking-wider uppercase font-medium">Points</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-4xl font-bold tracking-tight">{totalPoints.toLocaleString()}</span>
            <Star className="w-6 h-6 fill-current text-yellow-400" />
          </div>
          <p className="text-xs opacity-60 mt-1">
            {(nextMilestone - totalPoints).toLocaleString()} pts to next reward
          </p>
        </div>

        {/* Outlet Points Summary */}
        <div className="w-full mt-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {demoOutlets.map((outlet, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs"
                style={{ background: `${textColor}15` }}
              >
                <MapPin className="w-3 h-3" style={{ color: textColor, opacity: 0.7 }} />
                <span style={{ color: textColor, opacity: 0.8 }}>{outlet.outletName}</span>
                <span className="font-bold" style={{ color: textColor }}>{outlet.currentPoints}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
      `}</style>
    </div>
  );
};

const CustomizeLoyaltyCard = ({ store: propStore, onClose }) => {
  const location = useLocation();
  // Use prop store if provided, otherwise fallback to location state
  const store = propStore || location.state?.store;
  const { authState } = useAuth();
  const { isDarkMode } = useTheme();
  const { userInfo: user, token } = authState;
  const [format, setFormat] = useState(store.loyaltyCard.format);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [removeStampImage, setRemoveStampImage] = useState(false);
  const [removeCardImage, setRemoveCardImage] = useState(false);
  const [imageData, setImageData] = useState();
  const [cardImage, setCardImage] = useState(store.loyaltyCard.cardImage);
  const [cardData, setCardData] = useState({
    ...store.loyaltyCard,
    store: store.name,
    logo: store.logo,
  });
  const [tiers, setTiers] = useState(cardData.tier);
  const [isVisible, setIsVisible] = useState(false);
  const [editingTierIndex, setEditingTierIndex] = useState(null);
  const [editingTier, setEditingTier] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [tierToRemove, setTierToRemove] = useState(null);
  const [l5Config, setL5Config] = useState(store.loyaltyCard?.l5Config || {});

  if (Array.isArray(tiers) && tiers.length === 0) {
    setTiers([{ name: "Bronze", minPoints: 0, maxPoints: 100 }]);
  }
  const [loading, setLoading] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) {
        onClose(); // Use onClose prop if provided (modal mode)
      } else {
        navigate(-1); // Fallback to navigation (route mode)
      }
    }, 300); // Wait for animation to complete
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();

    // Append each field to the FormData object
    formDataToSend.append("format", format);
    formDataToSend.append("totalShapes", cardData.totalShapes);
    formDataToSend.append("stampColor", cardData.stampColor);
    formDataToSend.append("cardColor", cardData.cardColor);
    formDataToSend.append("textColor", cardData.textColor);
    formDataToSend.append("stamp", cardData.stamp);
    formDataToSend.append("removeStampImage", removeStampImage);
    formDataToSend.append("removeCardImage", removeCardImage);
    // formDataToSend.append("inactivity", cardData.inactivity);
    formDataToSend.append("demote", cardData.demote);
    formDataToSend.append(
      "tier",
      JSON.stringify(tiers, (key, value) =>
        value === Infinity ? "Infinity" : value
      )
    );

    // Append L5 config if L5 format is selected
    if (format === "L5") {
      formDataToSend.append("l5Config", JSON.stringify(l5Config));
    }

    // Append the file (image)
    if (imageData) {
      formDataToSend.append("customStamp", imageData);
    }
    if (cardImage) {
      formDataToSend.append("cardImage", cardImage);
    }

    try {
      const response = await api.put(
        `/store/customizeLoyaltyCard?storeId=${store._id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            token,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message, {
          duration: 2000,
        });
        // Close modal with animation if in modal mode
        if (onClose) {
          setIsVisible(false);
          setTimeout(() => {
            onClose();
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

  const fetchLoyaltyCardDetails = async () => {
    try {
      const response = await api.get(`/store/getLoyaltyCard/${store._id}`, {
        headers: {
          token,
        },
      });
      if (response.data.success) {
        const data = response.data.loyaltyCard;
        setCardData((prev) => ({
          ...prev,
          ...data,
        }));
        setTiers(data.tier);
        if (data.l5Config) {
          setL5Config(data.l5Config);
        }
        if (data.format) {
          setFormat(data.format);
        }
      } else {
        toast.error(response.data.message, {
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Error fetching loyalty card details:", error);
    }
  };

  // Tier editing functions
  const handleEditTier = (index) => {
    setEditingTierIndex(index);
    setEditingTier({ ...tiers[index] });
  };

  const handleSaveTierEdit = () => {
    if (editingTier && editingTierIndex !== null) {
      const updatedTiers = [...tiers];
      updatedTiers[editingTierIndex] = editingTier;
      setTiers(updatedTiers);
      setEditingTierIndex(null);
      setEditingTier(null);
      toast.success("Tier updated successfully!");
    }
  };

  const handleCancelTierEdit = () => {
    setEditingTierIndex(null);
    setEditingTier(null);
  };

  const handleRemoveTier = (index) => {
    if (tiers.length > 1) {
      setTierToRemove(index);
      setShowRemoveConfirm(true);
    } else {
      toast.error(
        "Cannot remove the last tier. At least one tier is required."
      );
    }
  };

  const confirmRemoveTier = () => {
    if (tierToRemove !== null) {
      const updatedTiers = tiers.filter((_, i) => i !== tierToRemove);
      setTiers(updatedTiers);
      setEditingTierIndex(null);
      setEditingTier(null);
      toast.success("Tier removed successfully!");
    }
    setShowRemoveConfirm(false);
    setTierToRemove(null);
  };

  const cancelRemoveTier = () => {
    setShowRemoveConfirm(false);
    setTierToRemove(null);
  };

  const handleTierChange = (field, value) => {
    if (editingTier) {
      let processedValue = value;

      if (field.includes("Points")) {
        processedValue = value === "" ? 0 : parseInt(value) || 0;
      } else if (field === "color") {
        // Validate hex color format
        if (value.startsWith("#")) {
          processedValue = value;
        } else if (/^[0-9A-Fa-f]{6}$/.test(value)) {
          processedValue = "#" + value;
        } else if (/^[0-9A-Fa-f]{3}$/.test(value)) {
          processedValue = "#" + value;
        } else {
          processedValue = value; // Keep as is for partial editing
        }
      }

      setEditingTier((prev) => ({
        ...prev,
        [field]: processedValue,
      }));
    }
  };

  useEffect(() => {
    fetchLoyaltyCardDetails();
    return () => {
      if (cardData.logo) URL.revokeObjectURL(cardData.logo);
      if (cardData.customStamp) URL.revokeObjectURL(cardData.customStamp);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 bg-black transition-opacity duration-300 ease-out flex items-center justify-end z-50 p-4 ${
        isVisible ? "bg-opacity-50" : "bg-opacity-0"
      }`}
      // onClick={handleClose}
    >
      {loading && <LoadingSpinner />}
      <div
        className={`rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col transform transition-transform duration-300 ease-out ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } ${isVisible ? "translate-x-0" : "translate-x-full"}`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between p-6 border-b sticky top-0 z-10 rounded-t-lg ${
            isDarkMode
              ? "border-gray-600 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <h2
            className={`text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            STORE: {store.name}
          </h2>
          <button
            onClick={handleClose}
            className={`transition-colors ${
              isDarkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <X size={24} />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex flex-col lg:flex-row">
            {/* Left Panel - Customization Options */}
            <div
              className={`lg:w-1/2 p-6 border-r ${
                isDarkMode ? "border-gray-600" : "border-gray-200"
              }`}
            >
              <div className="space-y-6">
                <h3
                  className={`text-lg font-medium mb-4 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Customize Your Loyalty Card
                </h3>

                {/* Card Format Selector */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Choose Card Format:
                  </label>
                  <select
                    onChange={(e) => setFormat(e.target.value)}
                    value={format}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${
                      isDarkMode
                        ? "border-gray-600 bg-gray-700 text-white"
                        : "border-gray-300 bg-white text-gray-900"
                    }`}
                  >
                    <option value="L1">L1 - Basic Points</option>
                    <option value="L2">L2 - Stamp Card</option>
                    <option value="L3">L3 - Tiered Points</option>
                    <option value="L34HA">L34HA - Tiered (HA Style)</option>
                    {store.services?.l5 && (
                      <option value="L5">L5 - Premium Loyalty (Outlet-Specific)</option>
                    )}
                  </select>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                  encType="multipart/form-data"
                >
                  {/* L34HA specific fields */}
                  {format === "L34HA" && (
                    <div className="mb-4">
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Tier Maintenance Period (Days)
                      </label>
                      <input
                        type="number"
                        name="demote"
                        value={cardData.demote}
                        onChange={handleChange}
                        placeholder="e.g., 365"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                        }`}
                      />
                      <p
                        className={`text-xs mt-1 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        If a customer fails to meet the tier's required points
                        within this period, they will be demoted.
                      </p>
                    </div>
                  )}

                  {/* Number of Stamps for L2 */}
                  {format === "L2" && (
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Number of Stamps
                      </label>
                      <select
                        name="totalShapes"
                        value={cardData.totalShapes}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-white"
                            : "border-gray-300 bg-white text-gray-900"
                        }`}
                      >
                        <option disabled>Select Number of Stamps</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={6}>6</option>
                        <option value={7}>7</option>
                        <option value={8}>8</option>
                        <option value={9}>9</option>
                      </select>
                    </div>
                  )}

                  {/* Card Color */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Card Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        name="cardColor"
                        value={cardData.cardColor}
                        onChange={handleChange}
                        className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-white"
                            : "border-gray-300 bg-white text-gray-900"
                        }`}
                      />
                      <input
                        type="color"
                        name="cardColor"
                        value={cardData.cardColor}
                        onChange={handleChange}
                        className={`h-10 w-10 rounded-md border ${
                          isDarkMode ? "border-gray-600" : "border-gray-300"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Text Color */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        name="textColor"
                        value={cardData.textColor}
                        onChange={handleChange}
                        className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-white"
                            : "border-gray-300 bg-white text-gray-900"
                        }`}
                      />
                      <input
                        type="color"
                        name="textColor"
                        value={cardData.textColor}
                        onChange={handleChange}
                        className={`h-10 w-10 rounded-md border ${
                          isDarkMode ? "border-gray-600" : "border-gray-300"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Stamp Color for L2 */}
                  {format === "L2" && (
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Stamp Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          name="stampColor"
                          value={cardData.stampColor}
                          onChange={handleChange}
                          className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${
                            isDarkMode
                              ? "border-gray-600 bg-gray-700 text-white"
                              : "border-gray-300 bg-white text-gray-900"
                          }`}
                        />
                        <input
                          type="color"
                          name="stampColor"
                          value={cardData.stampColor}
                          onChange={handleChange}
                          className={`h-10 w-10 rounded-md border ${
                            isDarkMode ? "border-gray-600" : "border-gray-300"
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Choose Icon */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Choose Icon
                    </label>
                    <select
                      name="stamp"
                      value={cardData.stamp}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${
                        isDarkMode
                          ? "border-gray-600 bg-gray-700 text-white"
                          : "border-gray-300 bg-white text-gray-900"
                      }`}
                    >
                      <option value="">None</option>
                      <option value="coffee" selected>
                        Coffee
                      </option>
                      <option value="smile">Smile</option>
                      <option value="thumbsUp">Thumbs Up</option>
                    </select>
                  </div>

                  {/* Upload Custom Icon */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        className={`block text-sm font-medium ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Upload Custom Icon
                      </label>
                      {cardData.customStamp && (
                        <button
                          type="button"
                          onClick={() => {
                            setRemoveStampImage(true);
                            setCardData((prev) => ({
                              ...prev,
                              customStamp: null,
                            }));
                            setImageData(null);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div
                      className={`border-2 border-dashed rounded-md p-4 text-center transition-colors cursor-pointer ${
                        isDarkMode
                          ? "border-gray-600 hover:border-gray-500"
                          : "border-gray-300 hover:border-gray-400"
                      } ${cardData.customStamp ? "border-solid border-green-500" : ""}`}
                      onClick={() =>
                        document
                          .querySelector('input[name="customStamp"]')
                          .click()
                      }
                    >
                      {cardData.customStamp ? (
                        <div className="flex flex-col items-center gap-2">
                          <img
                            src={cardData.customStamp}
                            alt="Custom Icon Preview"
                            className="h-16 w-16 object-contain rounded-lg"
                          />
                          <span
                            className={`text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Click to change
                          </span>
                        </div>
                      ) : (
                        <>
                          <Upload
                            className={`mx-auto h-8 w-8 ${
                              isDarkMode ? "text-gray-500" : "text-gray-400"
                            }`}
                          />
                          <div className="mt-2">
                            <span
                              className={`text-sm font-medium ${
                                isDarkMode ? "text-gray-300" : "text-gray-900"
                              }`}
                            >
                              Choose File
                            </span>
                            <p
                              className={`text-xs ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              No file chosen
                            </p>
                          </div>
                        </>
                      )}
                      <input
                        type="file"
                        name="customStamp"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            setCardData((prev) => ({
                              ...prev,
                              customStamp: URL.createObjectURL(
                                e.target.files[0]
                              ),
                            }));
                            setImageData(e.target.files[0]);
                            setRemoveStampImage(false);
                          }
                        }}
                        className="sr-only"
                      />
                    </div>
                  </div>

                  {/* Upload Custom Background Image */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        className={`block text-sm font-medium ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Upload Custom Background Image
                      </label>
                      {cardData.cardImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setRemoveCardImage(true);
                            setCardData((prev) => ({
                              ...prev,
                              cardImage: null,
                            }));
                            setCardImage(null);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div
                      className={`border-2 border-dashed rounded-md p-4 text-center transition-colors cursor-pointer ${
                        isDarkMode
                          ? "border-gray-600 hover:border-gray-500"
                          : "border-gray-300 hover:border-gray-400"
                      } ${cardData.cardImage ? "border-solid border-green-500" : ""}`}
                      onClick={() =>
                        document
                          .querySelector('input[name="cardImage"]')
                          .click()
                      }
                    >
                      {cardData.cardImage ? (
                        <div className="flex flex-col items-center gap-2">
                          <img
                            src={cardData.cardImage}
                            alt="Background Preview"
                            className="h-20 w-full max-w-[120px] object-cover rounded-lg"
                          />
                          <span
                            className={`text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Click to change
                          </span>
                        </div>
                      ) : (
                        <>
                          <Upload
                            className={`mx-auto h-8 w-8 ${
                              isDarkMode ? "text-gray-500" : "text-gray-400"
                            }`}
                          />
                          <div className="mt-2">
                            <span
                              className={`text-sm font-medium ${
                                isDarkMode ? "text-gray-300" : "text-gray-900"
                              }`}
                            >
                              Choose File
                            </span>
                            <p
                              className={`text-xs ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              No file chosen
                            </p>
                          </div>
                        </>
                      )}
                      <input
                        type="file"
                        name="cardImage"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            setCardData((prev) => ({
                              ...prev,
                              cardImage: URL.createObjectURL(e.target.files[0]),
                            }));
                            setCardImage(e.target.files[0]);
                            setRemoveCardImage(false);
                          }
                        }}
                        className="sr-only"
                      />
                    </div>
                  </div>

                  {/* Tier Forms */}
                  {format === "L3" && (
                    <TiersForm
                      tiers={tiers}
                      setTiers={setTiers}
                      error={error}
                      setError={setError}
                    />
                  )}
                  {format === "L34HA" && (
                    <TiersForm2
                      tiers={tiers}
                      setTiers={setTiers}
                      error={error}
                      setError={setError}
                    />
                  )}

                  {/* L5 Configuration */}
                  {format === "L5" && (
                    <div className="space-y-4">
                      <div className={`flex items-center gap-2 p-3 rounded-lg ${
                        isDarkMode ? "bg-amber-900/20 border border-amber-500/30" : "bg-amber-50 border border-amber-200"
                      }`}>
                        <Coffee className={`w-5 h-5 ${isDarkMode ? "text-amber-400" : "text-amber-600"}`} />
                        <div>
                          <p className={`text-sm font-medium ${isDarkMode ? "text-amber-300" : "text-amber-800"}`}>
                            L5 Premium Loyalty
                          </p>
                          <p className={`text-xs ${isDarkMode ? "text-amber-400/70" : "text-amber-600"}`}>
                            Outlet-specific points with leaderboard rewards
                          </p>
                        </div>
                      </div>

                      <L5ConfigForm
                        l5Config={l5Config}
                        setL5Config={setL5Config}
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  )}

                  {/* Save Button */}
                  <button
                    type="submit"
                    disabled={!!error}
                    className={`w-full px-6 py-3 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDarkMode
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    Save
                  </button>
                </form>
              </div>
            </div>

            {/* Right Panel - Live Preview */}
            <div className="lg:w-1/2 p-6">
              <div className="space-y-6">
                <h3
                  className={`text-lg font-medium mb-4 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Live Preview
                </h3>

                {/* Preview Card */}
                <div
                  className={`p-6 rounded-lg flex flex-col items-center ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <div className="w-full flex justify-center">
                    <StoreAuthProvider>
                      {format === "L2" ? (
                        <L2 {...cardData} />
                      ) : format === "L3" || format === "L34HA" ? (
                        <L3 {...cardData} />
                      ) : format === "L5" ? (
                        <L5PreviewCard
                          cardData={cardData}
                          l5Config={l5Config}
                          storeName={store.name}
                          isDarkMode={isDarkMode}
                        />
                      ) : (
                        <L1 {...cardData} />
                      )}
                    </StoreAuthProvider>
                  </div>
                </div>

                {/* L5 Config Summary */}
                {/* {format === "L5" && l5Config?.rewards && (
                  <div className="space-y-4">
                    <h4
                      className={`text-md font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      L5 Configuration Summary
                    </h4>

                    <div className={`p-4 rounded-lg border ${
                      isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                    }`}>
                      <p className={`text-sm font-medium mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Reward Thresholds ({l5Config.rewards?.length || 0})
                      </p>
                      <div className="space-y-2">
                        {(l5Config.rewards || []).slice(0, 5).map((reward, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                              {reward.rewardName}
                            </span>
                            <span className={`font-medium ${isDarkMode ? "text-amber-400" : "text-amber-600"}`}>
                              {reward.threshold?.toLocaleString()} pts
                            </span>
                          </div>
                        ))}
                        {(l5Config.rewards?.length || 0) > 5 && (
                          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            +{l5Config.rewards.length - 5} more rewards...
                          </p>
                        )}
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border ${
                      isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                    }`}>
                      <p className={`text-sm font-medium mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Settings
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className={`p-2 rounded ${isDarkMode ? "bg-gray-600" : "bg-white"}`}>
                          <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Min. Qualify</p>
                          <p className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {(l5Config.leaderboardMinPoints || 3000).toLocaleString()} pts
                          </p>
                        </div>
                        <div className={`p-2 rounded ${isDarkMode ? "bg-gray-600" : "bg-white"}`}>
                          <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Discount Valid</p>
                          <p className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {l5Config.discountValidityDays || 30} days
                          </p>
                        </div>
                        <div className={`p-2 rounded ${isDarkMode ? "bg-gray-600" : "bg-white"}`}>
                          <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Stacking</p>
                          <p className={`font-medium ${l5Config.allowDiscountStacking !== false ? "text-emerald-500" : "text-red-500"}`}>
                            {l5Config.allowDiscountStacking !== false ? "Enabled" : "Disabled"}
                          </p>
                        </div>
                        <div className={`p-2 rounded ${isDarkMode ? "bg-gray-600" : "bg-white"}`}>
                          <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>3-Month Bonus</p>
                          <p className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {l5Config.threeMonthWinnerDiscount || 50}% off
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )} */}

                {/* Tier Previews */}
                {(format === "L3" || format === "L34HA") && (
                  <div className="space-y-4">
                    <h4
                      className={`text-md font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Tier Previews
                    </h4>
                    {tiers.map((tier, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h5
                            className={`text-sm font-medium ${
                              isDarkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            {tier.name} Tier
                          </h5>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditTier(index)}
                              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                                isDarkMode
                                  ? "bg-blue-900/30 text-blue-300 hover:bg-blue-900/50"
                                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              }`}
                            >
                              <Edit3 size={12} />
                              Edit
                            </button>
                            {tiers.length > 1 && (
                              <button
                                onClick={() => handleRemoveTier(index)}
                                className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                                  isDarkMode
                                    ? "bg-red-900/30 text-red-300 hover:bg-red-900/50"
                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                }`}
                              >
                                <Trash2 size={12} />
                                Remove
                              </button>
                            )}
                          </div>
                        </div>

                        {editingTierIndex === index ? (
                          // Edit mode - Using same form as TiersForm.jsx
                          <div
                            className={`border rounded-lg p-4 space-y-4 ${
                              isDarkMode ? "border-gray-600" : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <h3
                                className={`font-medium ${
                                  isDarkMode ? "text-white" : "text-gray-900"
                                }`}
                              >
                                Edit Tier
                              </h3>
                              <button
                                type="button"
                                onClick={handleCancelTierEdit}
                                className={`transition-colors ${
                                  isDarkMode
                                    ? "text-gray-400 hover:text-gray-200"
                                    : "text-gray-400 hover:text-gray-600"
                                }`}
                              >
                                ✕
                              </button>
                            </div>

                            {/* Tier Name */}
                            <div>
                              <label
                                className={`block text-sm font-medium mb-2 ${
                                  isDarkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                Tier Name
                              </label>
                              <input
                                type="text"
                                value={editingTier?.name || ""}
                                onChange={(e) =>
                                  handleTierChange("name", e.target.value)
                                }
                                placeholder="Enter tier name"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${
                                  isDarkMode
                                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                                }`}
                                required
                              />
                            </div>

                            {/* Points Range */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label
                                  className={`block text-sm font-medium mb-2 ${
                                    isDarkMode
                                      ? "text-gray-300"
                                      : "text-gray-700"
                                  }`}
                                >
                                  Minimum Points
                                </label>
                                <input
                                  type="number"
                                  value={editingTier?.minPoints || 0}
                                  onChange={(e) =>
                                    handleTierChange(
                                      "minPoints",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Min Points"
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${
                                    isDarkMode
                                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                                  }`}
                                />
                              </div>
                              <div>
                                <label
                                  className={`block text-sm font-medium mb-2 ${
                                    isDarkMode
                                      ? "text-gray-300"
                                      : "text-gray-700"
                                  }`}
                                >
                                  Maximum Points
                                </label>
                                <input
                                  type="number"
                                  value={
                                    editingTier?.maxPoints === Infinity
                                      ? ""
                                      : editingTier?.maxPoints || 0
                                  }
                                  onChange={(e) =>
                                    handleTierChange(
                                      "maxPoints",
                                      e.target.value === ""
                                        ? Infinity
                                        : e.target.value
                                    )
                                  }
                                  placeholder="Max Points"
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${
                                    isDarkMode
                                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                                  }`}
                                />
                              </div>
                            </div>

                            {/* Color Picker */}
                            <div>
                              <label
                                className={`block text-sm font-medium mb-2 ${
                                  isDarkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                Color
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editingTier?.color || "#000000"}
                                  onChange={(e) =>
                                    handleTierChange("color", e.target.value)
                                  }
                                  placeholder="#000000"
                                  className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 ${
                                    isDarkMode
                                      ? "text-white bg-gray-700 border-gray-600"
                                      : "text-gray-900 bg-white border-gray-300"
                                  }`}
                                />
                                <input
                                  type="color"
                                  value={editingTier?.color || "#000000"}
                                  onChange={(e) =>
                                    handleTierChange("color", e.target.value)
                                  }
                                  className={`h-10 w-10 rounded-lg border ${
                                    isDarkMode
                                      ? "bg-gray-700 border-gray-600"
                                      : "bg-white border-gray-300"
                                  }`}
                                />
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={handleCancelTierEdit}
                                className={`px-4 py-2 rounded-md focus:outline-none focus:ring-1 transition-colors ${
                                  isDarkMode
                                    ? "text-gray-300 bg-gray-700 hover:bg-gray-600 focus:ring-gray-500"
                                    : "text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500"
                                }`}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveTierEdit}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View mode with tier info
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3"></div>
                        )}

                        <div className="flex justify-center">
                          <Position
                            tier={
                              editingTierIndex === index ? editingTier : tier
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`lg:ml-64 rounded-lg shadow-xl max-w-sm w-full mx-4 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="p-6">
              <div
                className={`flex items-center justify-center w-12 h-12 mx-auto rounded-full mb-4 ${
                  isDarkMode ? "bg-red-900/20" : "bg-red-100"
                }`}
              >
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3
                className={`text-lg font-medium text-center mb-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Remove Tier
              </h3>
              <p
                className={`text-sm text-center mb-6 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Are you sure you want to remove the "
                {tierToRemove !== null ? tiers[tierToRemove]?.name : ""}" tier?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelRemoveTier}
                  className={`flex-1 px-4 py-2 rounded-md focus:outline-none focus:ring-1 transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-gray-500"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemoveTier}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomizeLoyaltyCard;
