import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/config";
import { Store, Trash2, Upload, Edit3, Coffee, Star, MapPin, Sparkles, Smile, ThumbsUp, ChevronDown, ChevronUp, Palette, Image as ImageIcon, Layers, Gem, User } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "../components/LoadingSpinner";
import BottomNavigation from "../components/BottomNavigation";
import L3 from "../components/L3";
import L2 from "../components/L2";
import L1 from "../components/L1";
import L4 from "../components/L4";
import { StoreAuthProvider } from "../context/StoreAuthContext";
import TiersForm2 from "../components/TiersForm_L4";
import TiersForm from "../components/TiersForm";
import Position from "../components/l3Components/Position";
import L5ConfigForm from "../components/L5ConfigForm";
import L6ConfigForm from "../components/L6ConfigForm";
import { L6Card } from "../components/L6";
import MissionSection from "../components/L6/MissionSection";
import TierBadge from "../components/L6/TierBadge";
import StoreSelector from "../components/common/StoreSelector";
import imageCompression from "browser-image-compression";

const compressImage = async (file) => {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  return await imageCompression(file, options);
};

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

// L6 Preview - Full mobile mockup with header and navbar
const L6PreviewCard = ({ cardData, l6Config, tiers = [], selectedStore }) => {
  const textColor = cardData.textColor || "#ffffff";
  const cardColor = cardData.cardColor || "#7a2030";
  const fallbackTiers = [
    { name: "Bronze", minPoints: 0, maxPoints: 10000, color: "#cd7f32" },
    { name: "Gold", minPoints: 10000, maxPoints: 35000, color: "#ffd700" },
    { name: "Platinum", minPoints: 35000, maxPoints: 9999999, color: "#a0a0a0" },
  ];
  const previewTiers = tiers.length > 0 ? tiers : fallbackTiers;
  const previewTierIndex = previewTiers.length > 1 ? 0 : 0;
  const previewTier = previewTiers[previewTierIndex]?.name || "Member";
  const tierObj = previewTiers[previewTierIndex];
  const previewPoints = tierObj
    ? Math.round((tierObj.minPoints + Math.min(tierObj.maxPoints, 999999)) / 2)
    : 85;
  
  return (
    <div className="w-full flex justify-center">
      {/* Mobile phone mockup - iPhone 16 Pro dimensions */}
      <div className="relative bg-black rounded-[3rem] p-3 shadow-2xl" style={{ height: "85vh", aspectRatio: "1206/2622" }}>
        {/* Dynamic Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-9 bg-gray-900 rounded-full z-10" style={{ transform: "translateX(-50%) scale(calc(85vh / 2622 * 1206 / 393))" }} />
        
        {/* Screen - iPhone 16 Pro (1206×2622px) */}
        <div className="bg-white rounded-[2.5rem] overflow-hidden relative h-full w-full">
          {/* Status bar */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-white z-20 flex items-center justify-between px-8 text-xs font-medium text-gray-900">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>

          {/* Scrollable content */}
          <div 
            className="h-full overflow-y-auto pt-8 pb-20" 
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
            }}
          >
            <style>{`
              .overflow-y-auto::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {/* Header */}
            <div className="w-full flex items-center justify-between px-6 pt-4 pb-2">
              {/* Store Logo */}
              {(selectedStore?.frontLogo || selectedStore?.logo) && (
                <div className="flex flex-col items-center gap-1">
                  <img
                    className="w-auto h-10"
                    alt={selectedStore?.name || ""}
                    src={selectedStore.frontLogo || selectedStore.logo}
                  />
                </div>
              )}
              {!selectedStore?.frontLogo && !selectedStore?.logo && (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <Store className="w-5 h-5 text-gray-400" />
                </div>
              )}
              
              {/* Header actions */}
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Gem className="w-4 h-4 text-gray-600" />
                </button>
                <div className="relative">
                  <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="absolute top-0 right-0 block w-2 h-2 bg-green-500 rounded-full ring-1 ring-white" />
                </div>
              </div>
            </div>

            {/* L6 Card */}
            <div className="flex justify-center px-4 py-4">
              <div style={{ transform: "scale(0.85)", transformOrigin: "top center" }}>
                <L6Card
                  cardColor={cardColor}
                  textColor={textColor}
                  cardImage={cardData.cardImage}
                  points={Math.min(previewPoints, 999999)}
                  tier={previewTiers}
                  customerTier={previewTier}
                  customerName="Alex"
                  visitStreak={3}
                  l6Config={l6Config}
                  showQR={false}
                  setShowQR={() => {}}
                />
              </div>
            </div>
            
            {/* Mission Section */}
            {/* {l6Config?.missions && l6Config.missions.length > 0 && (
              <div className="w-full px-2" style={{ transform: "scale(0.85)", transformOrigin: "top center" }}>
                <MissionSection
                  missions={l6Config.missions}
                  textColor={textColor}
                />
              </div>
            )} */}
          </div>

          {/* Bottom Navigation Preview */}
          <div className="absolute bottom-0 left-0 right-0 z-30 pb-6 px-4">
            <BottomNavigation
              isEmbedded
              isPreview
              className="mx-auto max-w-[380px]"
              cardColor={cardData.cardColor || "#275b46"}
              storeOverride={selectedStore || {}}
            />
          </div>
        </div>
      </div>
      
      {/* Phone label */}
      {/* <p className="text-center text-xs text-gray-500 mt-3">Mobile Preview</p> */}
    </div>
  );
};

// L4 tier card mini-preview shown in the tier list for L4 format
const L4TierCardPreview = ({ tier, tierIndex, globalCardColor, globalTextColor }) => {
  const cardColor = tier.cardColor || globalCardColor || "#016e49";
  const textColor = tier.textColor || globalTextColor || "#ffffff";
  const tierLevel = Math.min(tierIndex, 3);

  const hexToRgba = (hex, alpha = 0.4) => {
    try {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch {
      return `rgba(0,0,0,${alpha})`;
    }
  };

  const INFINITY_SENTINEL = 9999999;

  return (
    <div
      className="w-[148px] h-[210px] rounded-2xl flex flex-col items-center py-3 px-2.5 gap-2 relative overflow-hidden flex-shrink-0"
      style={{
        backgroundColor: cardColor,
        boxShadow: `0 6px 20px ${hexToRgba(cardColor, 0.5)}`,
      }}
    >
      {/* Tier-level shine */}
      {tierLevel >= 1 && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-transparent to-black/[0.10] pointer-events-none rounded-2xl" />
      )}

      {/* Badge for tier 2+ */}
      {tierLevel >= 2 && (
        <div className="absolute top-2 right-2 z-10">
          {tierLevel >= 3 ? (
            <Star className="w-3.5 h-3.5 fill-current text-yellow-400" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" style={{ color: textColor, opacity: 0.85 }} />
          )}
        </div>
      )}

      {/* Tier banner */}
      <div
        className="w-full rounded-xl px-2.5 py-2 relative z-10"
        style={{
          border: `1px solid ${textColor}${tierLevel >= 2 ? "40" : "28"}`,
          background: `${textColor}${tierLevel >= 1 ? "14" : "0D"}`,
        }}
      >
        <div className="flex items-center gap-1">
          {tierLevel >= 3 && <Star className="w-2.5 h-2.5 fill-current text-yellow-400 flex-shrink-0" />}
          <span className="text-[11px] font-bold leading-tight truncate" style={{ color: textColor }}>
            {tier.name} Member
          </span>
        </div>
        <span className="text-[10px] opacity-70" style={{ color: textColor }}>
          {tier.discountPercentage || 0}% discount
        </span>
      </div>

      {/* Circular progress (static demo at ~65%) */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <svg width="76" height="76" viewBox="0 0 80 80" className="rotate-[-90deg]">
          <circle cx="40" cy="40" r="32" fill="none" stroke={`${textColor}25`} strokeWidth="5" />
          <circle
            cx="40" cy="40" r="32" fill="none" stroke={textColor} strokeWidth="5"
            strokeDasharray="201.06" strokeDashoffset="70" strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Points range */}
      <div className="w-full text-center relative z-10">
        <span className="text-[10px] opacity-60" style={{ color: textColor }}>
          {tier.minPoints}–{(tier.maxPoints === Infinity || tier.maxPoints >= INFINITY_SENTINEL || tier.maxPoints === "Infinity") ? "∞" : tier.maxPoints} pts
        </span>
      </div>
    </div>
  );
};

// Collapsible Section Component for better organization
const CollapsibleSection = ({ title, icon: Icon, children, isDarkMode, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border rounded-lg overflow-hidden ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-4 transition-colors ${isDarkMode ? "bg-gray-800/50 hover:bg-gray-800" : "bg-gray-50 hover:bg-gray-100"
          }`}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`p-2 rounded-lg ${isDarkMode ? "bg-green-900/30" : "bg-green-50"}`}>
              <Icon className={`w-4 h-4 ${isDarkMode ? "text-green-400" : "text-green-600"}`} />
            </div>
          )}
          <span className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {title}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
        ) : (
          <ChevronDown className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
        )}
      </button>
      {isOpen && (
        <div className={`p-4 space-y-4 ${isDarkMode ? "bg-gray-800/30" : "bg-white"}`}>
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * LoyaltyCardSettings Component
 *
 * IMPORTANT: This component preserves existing loyalty card configurations.
 * - L5 format is shown if EITHER services.l5 is enabled OR loyaltyCard.format is already "L5"
 * - Format is initialized from store's loyaltyCard object to prevent accidental reversion
 * - All changes are UI-only and do NOT modify database or require reconfiguration
 */
export default function LoyaltyCardSettings() {
  const { isDarkMode } = useTheme();
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;

  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Card customization state
  const [format, setFormat] = useState("");
  const [removeStampImage, setRemoveStampImage] = useState(false);
  const [removeCardImage, setRemoveCardImage] = useState(false);
  const [imageData, setImageData] = useState();
  const [cardImage, setCardImage] = useState("");
  const [cardData, setCardData] = useState({
    cardColor: "#6ee7b7",
    textColor: "#1c1917",
    stampColor: "#16a34a",
    stamp: "coffee",
    totalShapes: 6,
    demote: 365,
    customStamp: null,
    cardImage: null,
  });
  const [tiers, setTiers] = useState([]);
  const [previewTierIndex, setPreviewTierIndex] = useState(0);
  const [editingTierIndex, setEditingTierIndex] = useState(null);
  const [editingTier, setEditingTier] = useState(null);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);
  const [l5Config, setL5Config] = useState({});
  const [l6Config, setL6Config] = useState({});
  // Per-tier image file state: arrays indexed by tier position
  const [tierStampFiles, setTierStampFiles] = useState({});
  const [tierCardImageFiles, setTierCardImageFiles] = useState({});
  const [removeTierStamps, setRemoveTierStamps] = useState({});
  const [removeTierCardImages, setRemoveTierCardImages] = useState({});

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      // Initialize all data from store's current loyalty card settings immediately
      const loyaltyCard = selectedStore.loyaltyCard;
      if (loyaltyCard) {
        // Preserve existing format if it's L5
        if (loyaltyCard.format) {
          console.log('Setting format from selectedStore:', loyaltyCard.format);
          setFormat(loyaltyCard.format);
        }
        setCardData((prev) => ({
          ...prev,
          cardColor: loyaltyCard.cardColor || prev.cardColor,
          textColor: loyaltyCard.textColor || prev.textColor,
          stampColor: loyaltyCard.stampColor || prev.stampColor,
          stamp: loyaltyCard.stamp || prev.stamp,
          totalShapes: loyaltyCard.totalShapes || prev.totalShapes,
          demote: loyaltyCard.demote || prev.demote,
          customStamp: loyaltyCard.customStamp || null,
          cardImage: loyaltyCard.cardImage || null,
          store: selectedStore.name,
          logo: selectedStore.logo,
        }));
        if (loyaltyCard.tier && loyaltyCard.tier.length > 0) {
          setTiers(sortTiers(loyaltyCard.tier));
        }
        if (loyaltyCard.l5Config) {
          setL5Config(loyaltyCard.l5Config);
        }
        if (loyaltyCard.l6Config) {
          setL6Config(loyaltyCard.l6Config);
        }
      }
      // Then fetch the full details from API
      fetchLoyaltyCardDetails();
    }
  }, [selectedStore]);

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      const endpoint = user?.role === "admin" ? "/store" : "/store/myStores";
      const response = await api.get(endpoint, { headers: { token } });

      if (response.data.success) {
        const storesList = user?.role === "admin" ? response.data.stores : response.data.stores;
        setStores(storesList || []);
        if (storesList && storesList.length > 0) {
          const firstStore = storesList[0];
          setSelectedStore(firstStore);
          // Initialize format from the first store's loyalty card
          if (firstStore.loyaltyCard?.format) {
            console.log('Initial format from first store:', firstStore.loyaltyCard.format);
            setFormat(firstStore.loyaltyCard.format);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("Failed to load stores");
    } finally {
      setIsLoading(false);
    }
  };

  // tiersSnapshot: optional array of tiers we just saved locally.
  // Used to preserve per-tier appearance fields (cardColor, textColor, stamp)
  // that the backend schema may not include in its response.
  const fetchLoyaltyCardDetails = async (tiersSnapshot = null) => {
    try {
      const response = await api.get(`/store/getLoyaltyCard/${selectedStore._id}`, {
        headers: { token },
      });
      if (response.data.success) {
        const data = response.data.loyaltyCard;
        console.log('API returned loyalty card format:', data.format);
        setCardData((prev) => ({
          ...prev,
          ...data,
          store: selectedStore.name,
          logo: selectedStore.logo,
        }));

        // Merge API-returned tiers with the snapshot so per-tier appearance fields
        // (cardColor, textColor, stamp) survive even if the backend strips them.
        const apiTiers = data.tier || [];
        if (tiersSnapshot && tiersSnapshot.length > 0) {
          const merged = apiTiers.map((apiTier) => {
            const snap = tiersSnapshot.find((t) => t.name === apiTier.name);
            if (!snap) return apiTier;
            return {
              ...apiTier,
              // Prefer API value if it returned one; otherwise fall back to snapshot
              cardColor: apiTier.cardColor || snap.cardColor || "",
              textColor: apiTier.textColor || snap.textColor || "",
              stamp: apiTier.stamp || snap.stamp || "",
              customStamp: apiTier.customStamp || snap.customStamp || null,
              cardImage: apiTier.cardImage || snap.cardImage || null,
            };
          });
          setTiers(sortTiers(merged));
        } else {
          setTiers(sortTiers(apiTiers));
        }

        if (data.l5Config) {
          console.log('L5 Config found:', data.l5Config);
          setL5Config(data.l5Config);
        }
        if (data.l6Config) {
          setL6Config(data.l6Config);
        }
        if (data.format) {
          console.log('Setting format from API:', data.format);
          setFormat(data.format);
        }
      }
    } catch (error) {
      console.error("Error fetching loyalty card details:", error);
      toast.error("Failed to load loyalty card details");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  // Keep tiers sorted by minPoints (ascending) at all times.
  const sortTiers = (arr) => [...arr].sort((a, b) => (a.minPoints ?? 0) - (b.minPoints ?? 0));

  // Core save — accepts an optional tiersOverride so callers that just mutated
  // tiers can pass the new array before React state has updated.
  const saveCard = async (tiersOverride) => {
    setLoading(true);
    const tiersToSave = tiersOverride ?? tiers;

    const formDataToSend = new FormData();
    formDataToSend.append("format", format);
    formDataToSend.append("totalShapes", cardData.totalShapes);
    formDataToSend.append("stampColor", cardData.stampColor);
    formDataToSend.append("cardColor", cardData.cardColor);
    formDataToSend.append("textColor", cardData.textColor);
    formDataToSend.append("stamp", cardData.stamp);
    formDataToSend.append("removeStampImage", removeStampImage);
    formDataToSend.append("removeCardImage", removeCardImage);
    formDataToSend.append("demote", cardData.demote);
    // Replace Infinity with a large sentinel number — JSON/MongoDB cannot represent Infinity.
    formDataToSend.append(
      "tier",
      JSON.stringify(tiersToSave, (key, value) =>
        value === Infinity ? 9999999 : value
      )
    );
    if (format === "L5") {
      formDataToSend.append("l5Config", JSON.stringify(l5Config));
    }
    if (format === "L6") {
      formDataToSend.append("l6Config", JSON.stringify(l6Config));
    }
    if (imageData) formDataToSend.append("customStamp", imageData);
    if (cardImage) formDataToSend.append("cardImage", cardImage);

    // Per-tier images and remove flags — keyed by tier name, sent as index-based fields
    tiersToSave.forEach((tier, i) => {
      if (tierStampFiles[tier.name]) formDataToSend.append(`tierStamp_${i}`, tierStampFiles[tier.name]);
      if (tierCardImageFiles[tier.name]) formDataToSend.append(`tierCardImage_${i}`, tierCardImageFiles[tier.name]);
      if (removeTierStamps[tier.name]) formDataToSend.append(`removeTierStamp_${i}`, "true");
      if (removeTierCardImages[tier.name]) formDataToSend.append(`removeTierCardImage_${i}`, "true");
    });

    try {
      const response = await api.put(
        `/store/customizeLoyaltyCard?storeId=${selectedStore._id}`,
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data", token } }
      );
      if (response.data.success) {
        toast.success(response.data.message, { duration: 2000 });
        // Clear pending per-tier file state — backend has them now
        setTierStampFiles({});
        setTierCardImageFiles({});
        setRemoveTierStamps({});
        setRemoveTierCardImages({});
        // Pass the tiers we just saved so appearance fields aren't lost on refetch
        fetchLoyaltyCardDetails(tiersToSave);
      } else {
        toast.error(response.data.message, { duration: 2000 });
      }
    } catch (error) {
      toast.error(error.message, { duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveCard();
  };

  // Tier editing functions
  const handleEditTier = (index) => {
    setEditingTierIndex(index);
    setEditingTier({ ...tiers[index] });
  };

  const handleSaveTierEdit = () => {
    if (editingTier && editingTierIndex !== null) {
      const updatedTiers = sortTiers([...tiers.slice(0, editingTierIndex), editingTier, ...tiers.slice(editingTierIndex + 1)]);
      setTiers(updatedTiers);
      setEditingTierIndex(null);
      setEditingTier(null);
      // Auto-save: pass updatedTiers directly so we don't race with setState
      saveCard(updatedTiers);
    }
  };

  const handleCancelTierEdit = () => {
    setEditingTierIndex(null);
    setEditingTier(null);
  };

  const handleRemoveTier = (index) => {
    if (tiers.length <= 1) {
      toast.error("Cannot remove the last tier. At least one tier is required.");
      return;
    }
    setConfirmDeleteIndex(index);
  };

  const confirmDeleteTier = () => {
    const index = confirmDeleteIndex;
    const updatedTiers = sortTiers(tiers.filter((_, i) => i !== index));
    setTiers(updatedTiers);
    if (editingTierIndex === index) {
      setEditingTierIndex(null);
      setEditingTier(null);
    }
    setConfirmDeleteIndex(null);
    saveCard(updatedTiers);
  };

  // Sentinel value used in place of Infinity so MongoDB can store it as a plain Number.
  const INFINITY_SENTINEL = 9999999;

  const handleTierChange = (field, value) => {
    if (editingTier) {
      let processedValue = value;

      if (field.includes("Points") || field === "maintain") {
        // Preserve Infinity sentinel — do NOT parseInt it to 0
        if (value === Infinity || value === INFINITY_SENTINEL || value === "Infinity") {
          processedValue = INFINITY_SENTINEL;
        } else {
          processedValue = value === "" ? 0 : parseInt(value) || 0;
        }
      } else if (field === "color" || field === "cardColor" || field === "textColor") {
        // Validate hex color format (allow empty string to mean "use global")
        if (value === "") {
          processedValue = "";
        } else if (value.startsWith("#")) {
          processedValue = value;
        } else if (/^[0-9A-Fa-f]{6}$/.test(value)) {
          processedValue = "#" + value;
        } else if (/^[0-9A-Fa-f]{3}$/.test(value)) {
          processedValue = "#" + value;
        } else {
          processedValue = value;
        }
      }

      setEditingTier((prev) => ({
        ...prev,
        [field]: processedValue,
      }));
    }
  };

  if (isLoading) {
    return (
      <div className={`px-2 sm:px-4 ml-0 lg:ml-64 min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-[#f2f5f9]"}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className={`px-2 sm:px-4 ml-0 lg:ml-64 min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-[#f2f5f9]"}`}>
      {loading && <LoadingSpinner />}

      {/* Compact Header Section */}
      <div className={`flex items-center justify-between w-full mb-4 px-4 py-3 border-b ${isDarkMode ? "bg-gray-900 border-gray-700" : "bg-[#f2f5f9] border-gray-200"
        }`}>
        {/* Left: Title */}
        <div>
          <h1 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
            Loyalty Card Designer
          </h1>
          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            {selectedStore ? selectedStore.name : "Select store"}
          </p>
        </div>

        {/* Right: Store Selector (Compact) */}
        {(user?.role === "admin" || stores.length > 1) && stores.length > 0 && (
          <StoreSelector
            selectedStore={selectedStore}
            onStoreChange={(store) => {
              console.log('Store changed to:', store.name, 'Format:', store.loyaltyCard?.format);
              setSelectedStore(store);
              const loyaltyCard = store.loyaltyCard;
              if (loyaltyCard) {
                if (loyaltyCard.format) {
                  console.log('Setting format from store selector:', loyaltyCard.format);
                  setFormat(loyaltyCard.format);
                }
                setCardData({
                  cardColor: loyaltyCard.cardColor || "#6ee7b7",
                  textColor: loyaltyCard.textColor || "#1c1917",
                  stampColor: loyaltyCard.stampColor || "#16a34a",
                  stamp: loyaltyCard.stamp || "coffee",
                  totalShapes: loyaltyCard.totalShapes || 6,
                  demote: loyaltyCard.demote || 365,
                  customStamp: loyaltyCard.customStamp || null,
                  cardImage: loyaltyCard.cardImage || null,
                  store: store.name,
                  logo: store.logo,
                });
                if (loyaltyCard.tier && loyaltyCard.tier.length > 0) {
                  setTiers(sortTiers(loyaltyCard.tier));
                }
                if (loyaltyCard.l5Config) {
                  setL5Config(loyaltyCard.l5Config);
                }
                if (loyaltyCard.l6Config) {
                  setL6Config(loyaltyCard.l6Config);
                }
              }
            }}
            variant="default"
            customStores={stores}
            fetchOnMount={false}
          />
        )}
      </div>

      {/* Main Content */}
      <div className="px-4">
        {selectedStore ? (
          <>
            {/* Quick Stats Summary */}
            {/* <div className={`grid ${(format === "L3" || format === "L34HA" || format === "L4" || (format === "L6" && l6Config.showTier !== false)) ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-3"} gap-3 mb-4`}>
              <div className={`p-3 rounded-lg border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Palette className={`w-4 h-4 ${isDarkMode ? "text-green-400" : "text-green-600"}`} />
                  <span className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Format</span>
                </div>
                <p className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {format || selectedStore.loyaltyCard?.format || "L1"}
                </p>
              </div>

              <div className={`p-3 rounded-lg border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cardData.cardColor }} />
                  <span className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Card Color</span>
                </div>
                <p className={`text-xs font-mono ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {cardData.cardColor}
                </p>
              </div>

              <div className={`p-3 rounded-lg border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <ImageIcon className={`w-4 h-4 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />
                  <span className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Images</span>
                </div>
                <p className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {(cardData.customStamp ? 1 : 0) + (cardData.cardImage ? 1 : 0)}/2
                </p>
              </div>

              {(format === "L3" || format === "L34HA" || format === "L4" || (format === "L6" && l6Config.showTier !== false)) && (
                <div className={`p-3 rounded-lg border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className={`w-4 h-4 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                    <span className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Tiers</span>
                  </div>
                  <p className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {tiers.length}
                  </p>
                </div>
              )}
            </div> */}

            <div className={`rounded-xl `}>
              <div className="flex flex-col lg:flex-row">
                {/* Left Panel - Customization Options */}
                <div className={`lg:w-1/2 p-4 border-r  ${isDarkMode ? "border-gray-600 bg-gray-800" : "border-gray-200 bg-white"}`}>
                  <div className="space-y-4">
                    {/* Quick Header with Format Selector */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Card Designer
                      </h3>
                      <select
                        onChange={(e) => setFormat(e.target.value)}
                        value={format || selectedStore?.loyaltyCard?.format || "L1"}
                        className={`px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode
                          ? "border-gray-600 bg-gray-700 text-white"
                          : "border-gray-300 bg-white text-gray-900"
                          }`}
                      >
                        <option value="L1">L1 - Basic</option>
                        <option value="L2">L2 - Stamps</option>
                        <option value="L3">L3 - Tiered</option>
                        <option value="L34HA">L34HA - HA Style</option>
                        <option value="L4">L4 - Dynamic Tiers</option>
                        {(selectedStore?.services?.l5 || selectedStore?.loyaltyCard?.format === "L5" || format === "L5") && (
                          <option value="L5">L5 - Premium</option>
                        )}
                        <option value="L6">L6 - Custom Modules</option>
                      </select>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
                      {/* Colors Section */}
                      <CollapsibleSection title="Colors & Theme" icon={Palette} isDarkMode={isDarkMode}>
                        <div className="grid grid-cols-2 gap-3">
                          {/* Card Color */}
                          <div>
                            <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                              Card Color
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                name="cardColor"
                                value={cardData.cardColor}
                                onChange={handleChange}
                                className={`h-9 w-9 rounded-md border cursor-pointer ${isDarkMode ? "border-gray-600" : "border-gray-300"}`}
                              />
                              <input
                                type="text"
                                name="cardColor"
                                value={cardData.cardColor}
                                onChange={handleChange}
                                className={`flex-1 px-2 py-1.5 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-900"
                                  }`}
                              />
                            </div>
                          </div>

                          {/* Text Color */}
                          <div>
                            <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                              Text Color
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                name="textColor"
                                value={cardData.textColor}
                                onChange={handleChange}
                                className={`h-9 w-9 rounded-md border cursor-pointer ${isDarkMode ? "border-gray-600" : "border-gray-300"}`}
                              />
                              <input
                                type="text"
                                name="textColor"
                                value={cardData.textColor}
                                onChange={handleChange}
                                className={`flex-1 px-2 py-1.5 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-900"
                                  }`}
                              />
                            </div>
                          </div>

                          {/* Stamp Color for L2 */}
                          {format === "L2" && (
                            <div className="col-span-2">
                              <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                Stamp Color
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  name="stampColor"
                                  value={cardData.stampColor}
                                  onChange={handleChange}
                                  className={`h-9 w-9 rounded-md border cursor-pointer ${isDarkMode ? "border-gray-600" : "border-gray-300"}`}
                                />
                                <input
                                  type="text"
                                  name="stampColor"
                                  value={cardData.stampColor}
                                  onChange={handleChange}
                                  className={`flex-1 px-2 py-1.5 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-900"
                                    }`}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleSection>

                      {/* Format-Specific Settings */}
                      {(format === "L2" || format === "L34HA") && (
                        <CollapsibleSection title="Format Settings" icon={Layers} isDarkMode={isDarkMode}>
                          {/* Number of Stamps for L2 */}
                          {format === "L2" && (
                            <div>
                              <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                Number of Stamps
                              </label>
                              <select
                                name="totalShapes"
                                value={cardData.totalShapes}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-900"
                                  }`}
                              >
                                {[3, 4, 5, 6, 7, 8, 9].map(num => (
                                  <option key={num} value={num}>{num} Stamps</option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* L34HA Tier Maintenance */}
                          {format === "L34HA" && (
                            <div>
                              <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                Tier Maintenance (Days)
                              </label>
                              <input
                                type="number"
                                name="demote"
                                value={cardData.demote}
                                onChange={handleChange}
                                placeholder="365"
                                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode
                                  ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                                  : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                                  }`}
                              />
                              <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Period for tier demotion if requirements not met
                              </p>
                            </div>
                          )}
                        </CollapsibleSection>
                      )}

                      {/* Icons & Images Section */}
                      <CollapsibleSection title="Icons & Images" icon={ImageIcon} isDarkMode={isDarkMode} defaultOpen={false}>
                        {/* Icon Selector */}
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Icon
                          </label>
                          <select
                            name="stamp"
                            value={cardData.stamp}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-900"
                              }`}
                          >
                            <option value="">None</option>
                            <option value="coffee">☕ Coffee</option>
                            <option value="smile">😊 Smile</option>
                            <option value="thumbsUp">👍 Thumbs Up</option>
                          </select>
                        </div>

                        {/* Custom Icon Upload */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className={`text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                              Custom Icon
                            </label>
                            {cardData.customStamp && (
                              <button
                                type="button"
                                onClick={() => {
                                  setRemoveStampImage(true);
                                  setCardData((prev) => ({ ...prev, customStamp: null }));
                                  setImageData(null);
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                          <div
                            className={`border-2 border-dashed rounded-md p-3 text-center transition-colors cursor-pointer ${isDarkMode ? "border-gray-600 hover:border-gray-500" : "border-gray-300 hover:border-gray-400"
                              } ${cardData.customStamp ? "border-solid border-green-500" : ""}`}
                            onClick={() => document.querySelector('input[name="customStamp"]').click()}
                          >
                            {cardData.customStamp ? (
                              <div className="flex items-center gap-2">
                                <img src={cardData.customStamp} alt="Icon" className="h-10 w-10 object-contain rounded" />
                                <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Click to change</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <Upload className={`h-6 w-6 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                                <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Upload Icon</span>
                              </div>
                            )}
                            <input
                              type="file"
                              name="customStamp"
                              accept="image/*"
                              onChange={async (e) => {
                                if (e.target.files[0]) {
                                  const compressed = await compressImage(e.target.files[0]);
                                  setCardData((prev) => ({ ...prev, customStamp: URL.createObjectURL(compressed) }));
                                  setImageData(compressed);
                                  setRemoveStampImage(false);
                                }
                              }}
                              className="sr-only"
                            />
                          </div>
                        </div>

                        {/* Background Image Upload */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className={`text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                              Background Image
                            </label>
                            {cardData.cardImage && (
                              <button
                                type="button"
                                onClick={() => {
                                  setRemoveCardImage(true);
                                  setCardData((prev) => ({ ...prev, cardImage: null }));
                                  setCardImage(null);
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                          <div
                            className={`border-2 border-dashed rounded-md p-3 text-center transition-colors cursor-pointer ${isDarkMode ? "border-gray-600 hover:border-gray-500" : "border-gray-300 hover:border-gray-400"
                              } ${cardData.cardImage ? "border-solid border-green-500" : ""}`}
                            onClick={() => document.querySelector('input[name="cardImage"]').click()}
                          >
                            {cardData.cardImage ? (
                              <div className="flex items-center gap-2">
                                <img src={cardData.cardImage} alt="Background" className="h-12 w-20 object-cover rounded" />
                                <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Click to change</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <Upload className={`h-6 w-6 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                                <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Upload Background</span>
                              </div>
                            )}
                            <input
                              type="file"
                              name="cardImage"
                              accept="image/*"
                              onChange={async (e) => {
                                if (e.target.files[0]) {
                                  const compressed = await compressImage(e.target.files[0]);
                                  setCardData((prev) => ({ ...prev, cardImage: URL.createObjectURL(compressed) }));
                                  setCardImage(compressed);
                                  setRemoveCardImage(false);
                                }
                              }}
                              className="sr-only"
                            />
                          </div>
                        </div>
                      </CollapsibleSection>

                      {/* Tier Configuration */}
                      {(format === "L3" || format === "L34HA" || format === "L4") && (
                        <CollapsibleSection title="Tier Configuration" icon={Layers} isDarkMode={isDarkMode}>
                          {format === "L3" && (
                            <TiersForm tiers={tiers} setTiers={setTiers} error={error} setError={setError} />
                          )}
                          {(format === "L34HA" || format === "L4") && (
                            <TiersForm2
                              tiers={tiers}
                              setTiers={setTiers}
                              error={error}
                              setError={setError}
                              tierStampFiles={tierStampFiles}
                              setTierStampFiles={setTierStampFiles}
                              tierCardImageFiles={tierCardImageFiles}
                              setTierCardImageFiles={setTierCardImageFiles}
                              removeTierStamps={removeTierStamps}
                              setRemoveTierStamps={setRemoveTierStamps}
                              removeTierCardImages={removeTierCardImages}
                              setRemoveTierCardImages={setRemoveTierCardImages}
                            />
                          )}
                        </CollapsibleSection>
                      )}

                      {/* L5 Configuration */}
                      {format === "L5" && (
                        <CollapsibleSection title="L5 Premium Settings" icon={Coffee} isDarkMode={isDarkMode}>
                          <div className={`flex items-center gap-2 p-2 mb-3 rounded-lg ${isDarkMode ? "bg-amber-900/20 border border-amber-500/30" : "bg-amber-50 border border-amber-200"
                            }`}>
                            <Coffee className={`w-4 h-4 ${isDarkMode ? "text-amber-400" : "text-amber-600"}`} />
                            <p className={`text-xs ${isDarkMode ? "text-amber-300" : "text-amber-700"}`}>
                              Outlet-specific points with leaderboard rewards
                            </p>
                          </div>
                          <L5ConfigForm l5Config={l5Config} setL5Config={setL5Config} isDarkMode={isDarkMode} />
                        </CollapsibleSection>
                      )}

                      {/* Tier Configuration for L6 */}
                      {format === "L6" && l6Config.showTier !== false && (
                        <CollapsibleSection title="Tier Configuration" icon={Layers} isDarkMode={isDarkMode}>
                          <TiersForm tiers={tiers} setTiers={setTiers} error={error} setError={setError} />
                        </CollapsibleSection>
                      )}

                      {/* L6 Configuration */}
                      {format === "L6" && (
                        <CollapsibleSection title="L6 Module Settings" icon={Sparkles} isDarkMode={isDarkMode}>
                          <L6ConfigForm l6Config={l6Config} setL6Config={setL6Config} isDarkMode={isDarkMode} tiers={tiers} showMissions={false} />
                        </CollapsibleSection>
                      )}

                      {/* Tier Management List */}
                      {(format === "L3" || format === "L34HA" || format === "L4" || (format === "L6" && l6Config.showTier !== false)) && tiers.length > 0 && (
                        <CollapsibleSection title={`Manage Tiers (${tiers.length})`} icon={Layers} isDarkMode={isDarkMode}>
                          <div className="space-y-3">
                            {tiers.map((tier, index) => (
                              <div
                                key={index}
                                className={`p-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {format === "L6" ? (
                                      <TierBadge
                                        tierName={(editingTierIndex === index ? editingTier?.name : tier.name) || "Tier"}
                                        textColor="#ffffff"
                                        tierColor={editingTierIndex === index ? editingTier?.color : tier.color}
                                        cardColor={cardData.cardColor || "#7a2030"}
                                        size={40}
                                        absolute={false}
                                      />
                                    ) : (
                                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }} />
                                    )}
                                    <h5 className={`text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                      {tier.name}
                                    </h5>
                                    <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                                      {tier.minPoints}-{(tier.maxPoints === Infinity || tier.maxPoints >= 9999999 || tier.maxPoints === "Infinity") ? "∞" : tier.maxPoints} pts
                                    </span>
                                    {tier.maintain && (
                                      <span className={`text-xs ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>
                                        • {tier.maintain} to maintain
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleEditTier(index)}
                                      className={`p-1 rounded transition-colors ${isDarkMode ? "hover:bg-blue-900/30 text-blue-400" : "hover:bg-blue-100 text-blue-600"}`}
                                      title="Edit tier"
                                    >
                                      <Edit3 size={14} />
                                    </button>
                                    {tiers.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveTier(index)}
                                        className={`p-1 rounded transition-colors ${isDarkMode ? "hover:bg-red-900/30 text-red-400" : "hover:bg-red-100 text-red-600"}`}
                                        title="Remove tier"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {editingTierIndex === index && (
                                  <div className={`border rounded-lg p-3 space-y-3 mt-2 ${isDarkMode ? "border-gray-600 bg-gray-800" : "border-gray-200 bg-white"}`}>
                                    <div className="grid grid-cols-3 gap-2">
                                      <div className="col-span-2">
                                        <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Name</label>
                                        <input
                                          type="text"
                                          value={editingTier?.name || ""}
                                          onChange={(e) => handleTierChange("name", e.target.value)}
                                          className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`}
                                        />
                                      </div>
                                      <div>
                                        <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Color</label>
                                        <input
                                          type="color"
                                          value={editingTier?.color || "#000000"}
                                          onChange={(e) => handleTierChange("color", e.target.value)}
                                          className={`w-full h-[34px] rounded border cursor-pointer ${isDarkMode ? "border-gray-600" : "border-gray-300"}`}
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Min Pts</label>
                                        <input
                                          type="text"
                                          value={editingTier?.minPoints || 0}
                                          onChange={(e) => handleTierChange("minPoints", e.target.value)}
                                          className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`}
                                        />
                                      </div>
                                      <div>
                                        <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Max Pts</label>
                                        <input
                                          type="text"
                                          value={(editingTier?.maxPoints === Infinity || editingTier?.maxPoints >= 9999999 || editingTier?.maxPoints === "Infinity") ? "" : editingTier?.maxPoints || 0}
                                          onChange={(e) => handleTierChange("maxPoints", e.target.value === "" ? Infinity : e.target.value)}
                                          placeholder="∞"
                                          className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`}
                                        />
                                      </div>
                                    </div>

                                    {format === "L4" && (
                                      <div>
                                        <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                          Auto Discount (%)
                                        </label>
                                        <input
                                          type="text"
                                          value={editingTier?.discountPercentage ?? 0}
                                          onChange={(e) => {
                                            const val = e.target.value === "" ? 0 : Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                                            handleTierChange("discountPercentage", val);
                                          }}
                                          placeholder="e.g. 5 for 5%"
                                          className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white placeholder-gray-500" : "border-gray-300 bg-white placeholder-gray-400"}`}
                                        />
                                      </div>
                                    )}

                                    <div className="flex justify-end gap-2 pt-1">
                                      <button
                                        type="button"
                                        onClick={handleCancelTierEdit}
                                        className={`px-3 py-1.5 text-xs rounded transition-colors ${isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={handleSaveTierEdit}
                                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CollapsibleSection>
                      )}

                      {/* Save Button - Sticky at bottom */}
                      <div className="sticky bottom-0 pt-4 pb-2">
                        <button
                          type="submit"
                          disabled={!!error || loading}
                          className={`w-full px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${isDarkMode
                            ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-green-500/50"
                            : "bg-green-600 text-white hover:bg-green-700 hover:shadow-green-500/30"
                            }`}
                        >
                          {loading ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Saving...
                            </div>
                          ) : (
                            "Save Changes"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Right Panel - Live Preview */}
                <div className="lg:w-1/2 lg:sticky lg:top-0 lg:self-start lg:max-h-screen lg:overflow-y-auto">
                  <div className="space-y-4">
                    {/* L4 tier selector tabs */}
                    {format === "L4" && tiers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        {tiers.map((tier, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setPreviewTierIndex(i)}
                            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                              previewTierIndex === i
                                ? "bg-green-600 text-white border-green-600"
                                : isDarkMode
                                  ? "bg-gray-700 text-gray-300 border-gray-600 hover:border-gray-400"
                                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <span
                              style={{
                                color: previewTierIndex === i ? "white" : tier.color || undefined,
                              }}
                            >
                              {tier.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Preview Card */}
                    <div className="flex flex-col items-center py-4">
                      <div className="w-full flex justify-center">
                        <StoreAuthProvider>
                          {format === "L2" ? (
                            <L2 {...cardData} />
                          ) : format === "L3" || format === "L34HA" ? (
                            <L3 {...cardData} />
                          ) : format === "L4" ? (
                            <L4
                              {...cardData}
                              tier={tiers}
                              customerTier={tiers[previewTierIndex]?.name || tiers[0]?.name}
                              points={tiers[previewTierIndex]?.minPoints || 0}
                              showQR={false}
                              setShowQR={() => {}}
                            />
                          ) : format === "L5" ? (
                            <L5PreviewCard
                              cardData={cardData}
                              l5Config={l5Config}
                              storeName={selectedStore.name}
                              isDarkMode={isDarkMode}
                            />
                          ) : format === "L6" ? (
                            <L6PreviewCard cardData={cardData} l6Config={l6Config} tiers={tiers} selectedStore={selectedStore} />
                          ) : (
                            <L1 {...cardData} />
                          )}
                        </StoreAuthProvider>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className={`text-center py-12 rounded-xl shadow-lg ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
            <Store className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`} />
            <p className={`text-lg font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              No stores found
            </p>
            <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
              Create a store to access loyalty card settings
            </p>
          </div>
        )}
      </div>

      {/* Delete Tier Confirmation Modal */}
      {confirmDeleteIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className={`flex items-center justify-center w-12 h-12 mx-auto rounded-full mb-4 ${isDarkMode ? "bg-red-900/30" : "bg-red-100"}`}>
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className={`text-base font-semibold text-center mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Delete Tier
            </h3>
            <p className={`text-sm text-center mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Are you sure you want to delete the{" "}
              <span className="font-medium">"{tiers[confirmDeleteIndex]?.name}"</span> tier?
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteIndex(null)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTier}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
