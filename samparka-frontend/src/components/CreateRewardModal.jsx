import { useState, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import api from "../api/config";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Award, Activity, PlusCircle, ArrowUpRight, HelpCircle, Save, Info, X, Target, Trash2, Crown, Coins, Crosshair, Flame, ImageIcon, ChevronDown, ChevronUp } from "lucide-react";
import MissionItemsEditor from "./MissionItemsEditor";

const compressImage = async (file) => {
  if (!file) return null;
  const options = {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    initialQuality: 0.82,
  };
  return imageCompression(file, options);
};

const DEFAULT_MISSION = {
  title: "",
  subtitle: "Complete to earn rewards",
  icon: "coffee",
  stampColor: "#3b82f6",
  progress: 0,
  goal: 100,
  missionType: "simple",
  items: [],
  expiryDate: "",
  backgroundImageFile: null,
  backgroundImagePreview: "",
};

const CreateRewardModal = ({ store, isOpen, onClose, onSuccess }) => {
  const isL5Format = store?.loyaltyCard?.format === "L5";
  const isL6Format = store?.loyaltyCard?.format === "L6";
  const isConstantRewardFormat = ["L3", "L4", "L34HA"].includes(store?.loyaltyCard?.format);
  // Keep alias for readability in the JSX below
  const isL4Format = isConstantRewardFormat;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    validity: "none",
    points: "",
    evergreen: false,
    // L5 specific fields
    threshold: "",
    rewardType: "discount",
    discountPercentage: "",
    // L4 specific fields
    tier: "",
    pointCost: "",
  });
  const [isTierBased, setIsTierBased] = useState(true);
  // L6 reward category (single select)
  const [l6Category, setL6Category] = useState("");
  const [streakGoal, setStreakGoal] = useState(7);
  const [streakIcon, setStreakIcon] = useState("");
  const [streakIconFile, setStreakIconFile] = useState(null);
  const [streakIconPreview, setStreakIconPreview] = useState("");
  const [l6Missions, setL6Missions] = useState([]);
  const [newMission, setNewMission] = useState(DEFAULT_MISSION);
  const [editingMissionIndex, setEditingMissionIndex] = useState(null);
  const [savingMissions, setSavingMissions] = useState(false);
  const [showMissionForm, setShowMissionForm] = useState(false);
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

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setImageFile(compressed);
    } catch {
      toast.error("Failed to compress image");
    }
  };

  const handleAddMission = () => {
    const title = (newMission.title || "").trim();
    if (!title) {
      toast.error("Mission title is required");
      return false;
    }
    if (l6Missions.some((m) => (m.title || "").trim().toLowerCase() === title.toLowerCase())) {
      toast.error("Mission title already exists");
      return false;
    }
    const isMultiItem = newMission.missionType === "multiItem";
    if (isMultiItem && (!newMission.items || newMission.items.length === 0)) {
      toast.error("Multi-item mission requires at least one item");
      return false;
    }

    const missionToAdd = {
      title,
      subtitle: newMission.subtitle || "Complete to earn rewards",
      icon: newMission.icon || "coffee",
      stampColor: newMission.stampColor || "#3b82f6",
      missionType: isMultiItem ? "multiItem" : "simple",
      ...(newMission.expiryDate ? { expiryDate: newMission.expiryDate } : {}),
      ...(isMultiItem
        ? { items: newMission.items }
        : {
            progress: Math.max(0, parseInt(newMission.progress, 10) || 0),
            goal: Math.max(1, parseInt(newMission.goal, 10) || 100),
          }),
      ...(newMission.backgroundImageFile ? { _bgFile: newMission.backgroundImageFile, _bgPreview: newMission.backgroundImagePreview } : {}),
    };

    setL6Missions((prev) => [...prev, missionToAdd]);
    setNewMission(DEFAULT_MISSION);
    return true;
  };

  const handleStartEditMission = (index) => {
    const mission = l6Missions[index];
    if (!mission) return;
    setEditingMissionIndex(index);
    setNewMission({
      title: mission.title || "",
      subtitle: mission.subtitle || "Complete to earn rewards",
      icon: mission.icon || "coffee",
      stampColor: mission.stampColor || "#3b82f6",
      progress: mission.progress ?? 0,
      goal: mission.goal ?? 100,
      missionType: mission.missionType || "simple",
      items: mission.items || [],
      expiryDate: mission.expiryDate || "",
      backgroundImageFile: mission._bgFile || null,
      backgroundImagePreview: mission._bgPreview || mission.backgroundImage || "",
    });
  };

  const handleUpdateMission = () => {
    if (editingMissionIndex === null) return false;
    const title = (newMission.title || "").trim();
    if (!title) {
      toast.error("Mission title is required");
      return false;
    }

    const duplicate = l6Missions.some(
      (m, idx) => idx !== editingMissionIndex && (m.title || "").trim().toLowerCase() === title.toLowerCase()
    );
    if (duplicate) {
      toast.error("Mission title already exists");
      return false;
    }

    const isMultiItem = newMission.missionType === "multiItem";
    if (isMultiItem && (!newMission.items || newMission.items.length === 0)) {
      toast.error("Multi-item mission requires at least one item");
      return false;
    }

    const updated = [...l6Missions];
    const oldMission = updated[editingMissionIndex];
    updated[editingMissionIndex] = {
      title,
      subtitle: newMission.subtitle || "Complete to earn rewards",
      icon: newMission.icon || "coffee",
      stampColor: newMission.stampColor || "#3b82f6",
      ...(oldMission?._missionId ? { _missionId: oldMission._missionId } : {}),
      ...(oldMission?.createdAt ? { createdAt: oldMission.createdAt } : {}),
      missionType: isMultiItem ? "multiItem" : "simple",
      ...(newMission.expiryDate ? { expiryDate: newMission.expiryDate } : {}),
      ...(isMultiItem
        ? { items: newMission.items }
        : {
            progress: Math.max(0, parseInt(newMission.progress, 10) || 0),
            goal: Math.max(1, parseInt(newMission.goal, 10) || 100),
          }),
      ...(newMission.backgroundImageFile
        ? { _bgFile: newMission.backgroundImageFile, _bgPreview: newMission.backgroundImagePreview }
        : oldMission?.backgroundImage ? { backgroundImage: oldMission.backgroundImage } : {}),
    };

    setL6Missions(updated);
    setEditingMissionIndex(null);
    setNewMission(DEFAULT_MISSION);
    return true;
  };

  const handleCancelEditMission = () => {
    setEditingMissionIndex(null);
    setNewMission(DEFAULT_MISSION);
  };

  const handleRemoveMission = (index) => {
    setL6Missions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveMissionConfig = async () => {
    if (!store?._id) return;
    setSavingMissions(true);
    try {
      const loyaltyCard = store?.loyaltyCard || {};
      const payload = new FormData();
      payload.append("format", loyaltyCard.format || "L6");
      payload.append("totalShapes", loyaltyCard.totalShapes ?? 6);
      payload.append("stampColor", loyaltyCard.stampColor || "#16a34a");
      payload.append("cardColor", loyaltyCard.cardColor || "#6ee7b7");
      payload.append("textColor", loyaltyCard.textColor || "#1c1917");
      payload.append("stamp", loyaltyCard.stamp || "coffee");
      payload.append("demote", loyaltyCard.demote ?? 365);
      payload.append("tier", JSON.stringify(loyaltyCard.tier || []));
      payload.append("removeStampImage", "false");
      payload.append("removeCardImage", "false");
      payload.append(
        "l6Config",
        JSON.stringify({ ...(loyaltyCard.l6Config || {}), missions: l6Missions })
      );

      const response = await api.put(
        `/store/customizeLoyaltyCard?storeId=${store._id}`,
        payload,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Mission configuration saved", { duration: 2000 });
      } else {
        toast.error(response.data.message || "Failed to save mission configuration", { duration: 2000 });
      }
    } catch (error) {
      toast.error(error.message || "Failed to save mission configuration", { duration: 2000 });
    } finally {
      setSavingMissions(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For L5 format, create threshold reward
      if (isL5Format) {
        const formDataToSend = new FormData();
        formDataToSend.append("threshold", parseInt(formData.threshold));
        formDataToSend.append("rewardType", formData.rewardType);
        formDataToSend.append("rewardName", formData.name);
        formDataToSend.append("description", formData.description || "");
        formDataToSend.append("validity", formData.validity);
        formDataToSend.append("evergreen", formData.evergreen);

        if (formData.rewardType === "discount") {
          formDataToSend.append("discountPercentage", parseInt(formData.discountPercentage));
        }

        if (imageFile) {
          formDataToSend.append("image", imageFile);
        }

        const response = await api.post(
          `/reward/createRewardThreshold?storeId=${store._id}`,
          formDataToSend,
          { headers: { token } }
        );

        if (response.data.success) {
          toast.success(response.data.message || "Reward threshold created successfully", {
            duration: 2000,
          });
          onSuccess();
          handleClose();
        } else {
          toast.error(response.data.message, {
            duration: 2000,
          });
        }
        return;
      }

      // For L6 format
      if (isL6Format) {
        if (!l6Category) {
          toast.error("Please select a reward category");
          setLoading(false);
          return;
        }
        if (l6Category === "tier" && !formData.tier) {
          toast.error("Please select a tier");
          setLoading(false);
          return;
        }
        if (l6Category === "point" && (!formData.pointCost || Number(formData.pointCost) <= 0)) {
          toast.error("Point cost must be greater than 0");
          setLoading(false);
          return;
        }
        if (l6Category === "mission" && l6Missions.length === 0) {
          toast.error("Please configure at least one mission");
          setLoading(false);
          return;
        }
        if (l6Category === "streak" && (!streakGoal || Number(streakGoal) < 1)) {
          toast.error("Streak goal must be at least 1 day");
          setLoading(false);
          return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("description", formData.description || "");
        formDataToSend.append("isTierBased", l6Category === "tier");
        formDataToSend.append("isPointBased", l6Category === "point");
        formDataToSend.append("isMissionBased", l6Category === "mission");
        formDataToSend.append("isStreakBased", l6Category === "streak");
        if (l6Category === "tier") formDataToSend.append("tier", formData.tier);
        if (l6Category === "point") formDataToSend.append("pointCost", Number(formData.pointCost));
        if (l6Category === "streak") {
          formDataToSend.append("streakGoal", Number(streakGoal));
          if (streakIconFile) {
            formDataToSend.append("streakIconImage", streakIconFile);
          } else if (streakIcon) {
            formDataToSend.append("streakIcon", streakIcon);
          }
        }
        if (l6Category === "mission") {
          const cleanMissions = l6Missions.map(({ _bgFile, _bgPreview, ...rest }) => rest);
          formDataToSend.append("l6Missions", JSON.stringify(cleanMissions));
          l6Missions.forEach((m, i) => {
            if (m._bgFile) formDataToSend.append(`missionImage_${i}`, m._bgFile);
          });
        }
        formDataToSend.append("validity", formData.validity);
        formDataToSend.append("evergreen", formData.evergreen);
        if (imageFile) formDataToSend.append("image", imageFile);

        const response = await api.post(
          `/reward/createL6Reward?storeId=${store._id}`,
          formDataToSend,
          { headers: { token } }
        );

        if (response.data.success) {
          toast.success(response.data.message || "L6 reward created successfully", { duration: 2000 });
          onSuccess();
          handleClose();
        } else {
          toast.error(response.data.message, { duration: 2000 });
        }
        return;
      }

      // For L3 / L4 / L34HA formats, create tier-based or open constant reward
      if (isConstantRewardFormat) {
        if (isTierBased && !formData.tier) {
          toast.error("Please select a tier for this reward");
          setLoading(false);
          return;
        }
        if (!formData.pointCost || Number(formData.pointCost) <= 0) {
          toast.error("Point cost must be greater than 0 for L4 rewards");
          setLoading(false);
          return;
        }
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("description", formData.description || "");
        if (isTierBased && formData.tier) {
          formDataToSend.append("tier", formData.tier);
        }
        formDataToSend.append("pointCost", Number(formData.pointCost));
        formDataToSend.append("validity", formData.validity);
        formDataToSend.append("evergreen", formData.evergreen);
        if (imageFile) {
          formDataToSend.append("image", imageFile);
        }

        const response = await api.post(
          `/reward/createConstantReward?storeId=${store._id}`,
          formDataToSend,
          { headers: { token } }
        );

        if (response.data.success) {
          toast.success(response.data.message || "L4 reward created successfully", {
            duration: 2000,
          });
          onSuccess();
          handleClose();
        } else {
          toast.error(response.data.message, { duration: 2000 });
        }
        return;
      }

      // For non-L5 format, create regular reward
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("validity", formData.validity);
      formDataToSend.append("points", formData.points);
      formDataToSend.append("evergreen", formData.evergreen);
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      const response = await api.post(
        `/reward/createReward?storeId=${store._id}`,
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
      toast.error(error.message || "Failed to create reward", {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle modal animation
  useEffect(() => {
    if (isOpen) {
      // Trigger animation after a short delay
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
    }, 300); // Wait for animation to complete
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        description: "",
        validity: "none",
        points: "",
        evergreen: false,
        // L5 specific fields
        threshold: "",
        rewardType: "discount",
        discountPercentage: "",
        // L4 specific fields
        tier: store?.loyaltyCard?.tier?.[0]?.name || "",
        pointCost: "",
      });
      setIsTierBased(true);
      setL6Category("");
      setStreakGoal(7);
      setStreakIcon("🎁");
      setStreakIconFile(null);
      setStreakIconPreview("");
      setL6Missions(store?.loyaltyCard?.l6Config?.missions || []);
      setNewMission(DEFAULT_MISSION);
      setEditingMissionIndex(null);
      setImageFile(null);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black transition-opacity duration-300 ease-out flex items-center justify-end z-50 p-4 ${isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
      onClick={handleClose}
    >
      <div
        className={`rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col transform transition-transform duration-300 ease-out ${isDarkMode
            ? 'bg-gray-900 border border-gray-700'
            : 'bg-white'
          } ${isVisible ? 'translate-x-0' : 'translate-x-full'
          }`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b sticky top-0 z-10 rounded-t-lg ${isDarkMode
            ? 'border-gray-700 bg-gray-900'
            : 'border-gray-200 bg-white'
          }`}>
          <div className="flex items-center gap-3">
            <PlusCircle className="w-5 h-5 text-green-600" />
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Create New Reward</h2>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg hover:scale-[1.2] transition-all ${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-600"
              }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <div className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Store Information */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Store
                  </label>
                  <div className={`w-full px-4 py-2 border rounded-lg ${isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-200'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}>
                    {store?.name || "No store selected"}
                  </div>
                </div>

                {/* Reward Name */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Reward Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Award className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'
                      }`} size={18} />
                    <input
                      type="text"
                      placeholder="Enter reward name"
                      name="name"
                      value={formData.name}
                      required
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                        }`}
                    />
                  </div>
                </div>

                {/* Reward Description */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Reward Description {!isL5Format && !isL4Format && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    placeholder="Enter reward description"
                    name="description"
                    value={formData.description}
                    required={!isL5Format && !isL4Format}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent resize-none ${isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      }`}
                  />
                </div>

                {/* L5 Specific Fields */}
                {isL5Format && (
                  <>
                    {/* Reward Type */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Reward Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="rewardType"
                        value={formData.rewardType}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${isDarkMode
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-200 text-gray-900'
                          }`}
                      >
                        <option value="discount">Discount %</option>
                        <option value="physical">Physical Reward</option>
                      </select>
                    </div>

                    {/* Points Threshold */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Points Required <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Activity className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'
                          }`} size={18} />
                        <input
                          type="number"
                          name="threshold"
                          value={formData.threshold}
                          required
                          onChange={handleChange}
                          placeholder="Enter points threshold"
                          min={1}
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${isDarkMode
                              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                            }`}
                        />
                      </div>
                    </div>

                    {/* Discount Percentage (only for discount type) */}
                    {formData.rewardType === "discount" && (
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          Discount Percentage <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'
                            }`}>%</span>
                          <input
                            type="number"
                            name="discountPercentage"
                            value={formData.discountPercentage}
                            required
                            onChange={handleChange}
                            placeholder="Enter discount percentage"
                            min={1}
                            max={100}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${isDarkMode
                                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                              }`}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* L4 Specific Fields */}
                {isL4Format && (
                  <>
                    {/* Tier-based toggle */}
                    <div className={`flex items-center justify-between p-3 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                      <div>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Tier-Based Reward</p>
                        <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {isTierBased ? 'Only customers in the selected tier can unlock this.' : 'Available to all customers regardless of tier.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsTierBased((v) => !v)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          isTierBased ? 'bg-green-500' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isTierBased ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Required Tier — only shown when tier-based */}
                    {isTierBased && (
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Required Tier <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="tier"
                        value={formData.tier}
                        onChange={handleChange}
                        required={isTierBased}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                      >
                        <option value="">Select a tier</option>
                        {(store?.loyaltyCard?.tier || [])
                          .slice()
                          .sort((a, b) => (a.minPoints ?? 0) - (b.minPoints ?? 0))
                          .map((t) => (
                            <option key={t.name} value={t.name}>
                              {t.name} ({t.minPoints ?? 0}–{t.maxPoints >= 9999999 ? "∞" : t.maxPoints} pts)
                            </option>
                          ))}
                      </select>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Customers must be in this tier to unlock the reward.
                      </p>
                    </div>
                    )}

                    {/* Point Cost */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Point Cost to Redeem <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Activity className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} size={18} />
                        <input
                          type="text"
                          name="pointCost"
                          value={formData.pointCost}
                          required
                          onChange={handleChange}
                          placeholder="Points deducted on redemption"
                          min={1}
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'}`}
                        />
                      </div>
                    </div>

                  </>
                )}

                {/* L6 Specific Fields */}
                {isL6Format && (
                  <>
                    {/* Reward Category — card buttons */}
                    <div>
                      <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Reward Category <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { key: "tier", label: "Tier", icon: Crown, desc: "Unlock by tier" },
                          { key: "point", label: "Points", icon: Coins, desc: "Redeem with points" },
                          { key: "mission", label: "Mission", icon: Crosshair, desc: "Complete tasks" },
                          { key: "streak", label: "Streak", icon: Flame, desc: "Daily visit streak" },
                        ].map(({ key, label, icon: Icon, desc }) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setL6Category(key)}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-center ${
                              l6Category === key
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                : isDarkMode
                                  ? "border-gray-700 bg-gray-800 hover:border-gray-500"
                                  : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <Icon size={20} className={l6Category === key ? "text-green-600" : isDarkMode ? "text-gray-400" : "text-gray-500"} />
                            <span className={`text-xs font-semibold ${l6Category === key ? "text-green-700 dark:text-green-400" : isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{label}</span>
                            <span className={`text-[10px] leading-tight ${l6Category === key ? "text-green-600/70 dark:text-green-400/60" : isDarkMode ? "text-gray-500" : "text-gray-400"}`}>{desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tier Selector */}
                    {l6Category === "tier" && (
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Required Tier <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="tier"
                          value={formData.tier}
                          onChange={handleChange}
                          required
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                        >
                          <option value="">Select a tier</option>
                          {(store?.loyaltyCard?.tier || [])
                            .slice()
                            .sort((a, b) => (a.minPoints ?? 0) - (b.minPoints ?? 0))
                            .map((t) => (
                              <option key={t.name} value={t.name}>
                                {t.name} ({t.minPoints ?? 0}–{t.maxPoints >= 9999999 ? "∞" : t.maxPoints} pts)
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    {/* Point Cost */}
                    {l6Category === "point" && (
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Point Cost to Redeem <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Activity className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} size={18} />
                          <input
                            type="number"
                            name="pointCost"
                            value={formData.pointCost}
                            required
                            onChange={handleChange}
                            placeholder="Points deducted on redemption"
                            min={1}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'}`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Streak Goal */}
                    {l6Category === "streak" && (
                      <div className="space-y-3">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Required Streak Days <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Flame className={`absolute left-3 top-1/2 -translate-y-1/2 text-orange-400`} size={18} />
                            <input
                              type="number"
                              value={streakGoal}
                              onChange={(e) => setStreakGoal(e.target.value)}
                              placeholder="e.g. 7"
                              min={1}
                              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'}`}
                            />
                          </div>
                          <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Customer must maintain this many consecutive daily visits to unlock this reward.</p>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Reward Icon <span className={`font-normal text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>(shown on streak day)</span>
                          </label>
                          <div className="flex gap-3 items-center">
                            {/* Free-type emoji input */}
                            <div className="relative flex-1">
                              <input
                                type="text"
                                value={streakIconPreview ? "" : streakIcon}
                                onChange={(e) => { setStreakIcon(e.target.value); setStreakIconFile(null); setStreakIconPreview(""); }}
                                placeholder="Type any emoji 🎁"
                                disabled={!!streakIconPreview}
                                className={`w-full px-3 py-2 text-xl border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'} ${streakIconPreview ? 'opacity-40 cursor-not-allowed' : ''}`}
                              />
                            </div>
                            <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>or</span>
                            {/* Custom image upload */}
                            {streakIconPreview ? (
                              <div className="relative flex-shrink-0">
                                <img src={streakIconPreview} alt="" className="w-10 h-10 rounded-lg object-cover border-2 border-green-500" />
                                <button
                                  type="button"
                                  onClick={() => { setStreakIconFile(null); setStreakIconPreview(""); setStreakIcon(""); }}
                                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center"
                                >
                                  <X size={8} />
                                </button>
                              </div>
                            ) : (
                              <label className={`flex-shrink-0 w-10 h-10 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${isDarkMode ? "border-gray-600 bg-gray-800 hover:border-gray-400 text-gray-400" : "border-gray-300 bg-gray-50 hover:border-gray-400 text-gray-400"}`} title="Upload custom icon">
                                <ImageIcon size={16} />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      const compressed = await compressImage(file);
                                      setStreakIconFile(compressed);
                                      setStreakIconPreview(URL.createObjectURL(compressed));
                                      setStreakIcon("");
                                    } catch { toast.error("Failed to compress image"); }
                                  }}
                                />
                              </label>
                            )}
                          </div>
                          <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Press Win+. (Windows) or Cmd+Ctrl+Space (Mac) to open emoji picker</p>
                        </div>
                      </div>
                    )}

                    {/* Mission Configuration */}
                    {l6Category === "mission" && (
                      <div className="space-y-3">
                        {/* ── Mission list ── */}
                        <div className={`rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                          <div className="flex items-center justify-between px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <Target size={15} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                Missions {l6Missions.length > 0 && <span className={`font-normal ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>({l6Missions.length})</span>}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => { setShowMissionForm(true); setEditingMissionIndex(null); setNewMission(DEFAULT_MISSION); }}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                            >
                              <PlusCircle size={12} />
                              Add
                            </button>
                          </div>

                          {l6Missions.length > 0 && (
                            <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                              {l6Missions.map((mission, index) => (
                                <div
                                  key={`${mission.title}-${index}`}
                                  className={`flex items-center gap-2.5 px-3 py-2 ${index > 0 ? `border-t ${isDarkMode ? 'border-gray-700/50' : 'border-gray-100'}` : ''} ${
                                    editingMissionIndex === index ? (isDarkMode ? 'bg-amber-900/15' : 'bg-amber-50/60') : ''
                                  }`}
                                >
                                  {/* Thumbnail */}
                                  {(mission._bgPreview || mission.backgroundImage) ? (
                                    <div className="w-9 h-9 rounded-md overflow-hidden shrink-0 border border-gray-200 dark:border-gray-600">
                                      <img src={mission._bgPreview || mission.backgroundImage} alt="" className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <div className={`w-9 h-9 rounded-md shrink-0 flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200/70'}`}>
                                      <Target size={14} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
                                    </div>
                                  )}

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{mission.title}</p>
                                    <p className={`text-[11px] truncate ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                      {mission.missionType === "multiItem"
                                        ? `Multi-item · ${(mission.items || []).length} item${(mission.items || []).length !== 1 ? "s" : ""}`
                                        : `Goal: ${mission.goal}`
                                      }
                                      {mission.expiryDate && ` · ${mission.expiryDate}`}
                                    </p>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-0.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => { handleStartEditMission(index); setShowMissionForm(true); }}
                                      className={`p-1.5 rounded-md transition-colors ${isDarkMode ? 'text-gray-400 hover:text-amber-400 hover:bg-gray-700' : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'}`}
                                    >
                                      <Award size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveMission(index)}
                                      className={`p-1.5 rounded-md transition-colors ${isDarkMode ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {l6Missions.length === 0 && !showMissionForm && (
                            <div className={`px-3 pb-3 text-center`}>
                              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No missions yet. Click "Add" to create one.</p>
                            </div>
                          )}
                        </div>

                        {/* ── Mission form (collapsible) ── */}
                        {showMissionForm && (
                          <div className={`p-3 rounded-lg border-2 border-dashed space-y-3 ${isDarkMode ? 'border-gray-600 bg-gray-800/30' : 'border-green-200 bg-green-50/30'}`}>
                            <div className="flex items-center justify-between">
                              <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {editingMissionIndex !== null ? "Edit Mission" : "New Mission"}
                              </p>
                              <button
                                type="button"
                                onClick={() => { setShowMissionForm(false); handleCancelEditMission(); }}
                                className={`p-1 rounded-md ${isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                              >
                                <X size={14} />
                              </button>
                            </div>

                            {/* Title */}
                            <div>
                              <label className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Title <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={newMission.title}
                                onChange={(e) => setNewMission((prev) => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g. Buy 10 coffees"
                                className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                              />
                            </div>

                            {/* Subtitle */}
                            <div>
                              <label className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Subtitle</label>
                              <input
                                type="text"
                                value={newMission.subtitle}
                                onChange={(e) => setNewMission((prev) => ({ ...prev, subtitle: e.target.value }))}
                                placeholder="Complete to earn rewards"
                                className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                              />
                            </div>

                            {/* Mission Type + Icon row */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Type</label>
                                <div className="flex gap-1 mt-1">
                                  <button
                                    type="button"
                                    onClick={() => setNewMission((prev) => ({ ...prev, missionType: "simple", items: [] }))}
                                    className={`flex-1 px-2 py-2 rounded-md text-xs font-medium transition-colors ${
                                      newMission.missionType !== "multiItem"
                                        ? "bg-green-600 text-white"
                                        : isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                    }`}
                                  >
                                    Simple
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setNewMission((prev) => ({ ...prev, missionType: "multiItem", progress: 0, goal: 100, itemName: "" }))}
                                    className={`flex-1 px-2 py-2 rounded-md text-xs font-medium transition-colors ${
                                      newMission.missionType === "multiItem"
                                        ? "bg-green-600 text-white"
                                        : isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                    }`}
                                  >
                                    Multi-Item
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Icon</label>
                                <select
                                  value={newMission.icon}
                                  onChange={(e) => setNewMission((prev) => ({ ...prev, icon: e.target.value }))}
                                  className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                >
                                  <option value="coffee">Coffee</option>
                                  <option value="star">Star</option>
                                  <option value="smile">Smile</option>
                                  <option value="thumbsUp">Thumbs Up</option>
                                  <option value="target">Target</option>
                                </select>
                              </div>
                            </div>

                            {/* Type-specific fields */}
                            {newMission.missionType === "multiItem" ? (
                              <div>
                                <label className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Items (each with their own goal)</label>
                                <div className="mt-1">
                                  <MissionItemsEditor
                                    items={newMission.items || []}
                                    onChange={(items) => setNewMission((prev) => ({ ...prev, items }))}
                                    isDarkMode={isDarkMode}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Goal <span className="text-red-500">*</span></label>
                                    <input
                                      type="number"
                                      min={1}
                                      value={newMission.goal}
                                      onChange={(e) => setNewMission((prev) => ({ ...prev, goal: e.target.value }))}
                                      placeholder="100"
                                      className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                    />
                                  </div>
                                  <div>
                                    <label className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Starting Progress</label>
                                    <input
                                      type="number"
                                      min={0}
                                      value={newMission.progress}
                                      onChange={(e) => setNewMission((prev) => ({ ...prev, progress: e.target.value }))}
                                      placeholder="0"
                                      className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Track Item <span className={`font-normal ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>(opt.)</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={newMission.itemName || ""}
                                    onChange={(e) => setNewMission((prev) => ({ ...prev, itemName: e.target.value }))}
                                    placeholder="e.g. Cappuccino — auto-tracks from receipts"
                                    className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Optional fields row */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Expiry Date <span className={`font-normal ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>(opt.)</span>
                                </label>
                                <input
                                  type="date"
                                  value={newMission.expiryDate || ""}
                                  onChange={(e) => setNewMission((prev) => ({ ...prev, expiryDate: e.target.value }))}
                                  min={new Date().toISOString().split("T")[0]}
                                  className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                />
                              </div>
                              <div>
                                <label className={`text-xs font-medium flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <ImageIcon size={11} /> Background <span className={`font-normal ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>(opt.)</span>
                                </label>
                                {newMission.backgroundImagePreview ? (
                                  <div className="relative mt-1 rounded-md overflow-hidden h-[38px]">
                                    <img src={newMission.backgroundImagePreview} alt="" className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => setNewMission((prev) => ({ ...prev, backgroundImageFile: null, backgroundImagePreview: "" }))}
                                      className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/50 text-white hover:bg-black/70"
                                    >
                                      <X size={10} />
                                    </button>
                                  </div>
                                ) : (
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                        try {
                                          const compressed = await compressImage(file);
                                          setNewMission((prev) => ({
                                            ...prev,
                                            backgroundImageFile: compressed,
                                            backgroundImagePreview: URL.createObjectURL(compressed),
                                          }));
                                        } catch {
                                          toast.error("Failed to compress image");
                                        }
                                      }
                                    }}
                                    className={`w-full mt-1 text-xs file:mr-2 file:py-1.5 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:bg-green-50 file:text-green-700 hover:file:bg-green-100 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                                  />
                                )}
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const ok = editingMissionIndex !== null ? handleUpdateMission() : handleAddMission();
                                  if (ok) setShowMissionForm(false);
                                }}
                                className="flex-1 px-3 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                              >
                                {editingMissionIndex !== null ? "Update Mission" : "Add Mission"}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setShowMissionForm(false); handleCancelEditMission(); }}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Save missions to store config */}
                        {l6Missions.length > 0 && (
                          <button
                            type="button"
                            onClick={handleSaveMissionConfig}
                            disabled={savingMissions}
                            className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                              isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <Save size={12} />
                            {savingMissions ? "Saving..." : "Save Mission Config to Store"}
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Upload Image (Optional for both L5 and non-L5) */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Upload Image <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-green-50 file:text-green-700 hover:file:bg-green-100 ${isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-200'
                        : 'bg-white border-gray-200 text-gray-900'
                      }`}
                  />
                </div>

                {/* Customer Redeem Validity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Reward Expires After
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({
                        ...prev,
                        validity: prev.validity === "none" ? "1" : "none",
                      }))}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${formData.validity !== "none" ? 'bg-green-500' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${formData.validity !== "none" ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {formData.validity !== "none" && (
                    <select
                      name="validity"
                      value={formData.validity}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                        }`}
                    >
                      {Array.from({ length: 365 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} {i + 1 === 1 ? 'day' : 'days'}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Reward Points - Only for non-L5, non-L4 */}
                {!isL5Format && !isL4Format && !isL6Format && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                      Reward Points <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Activity className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'
                        }`} size={18} />
                      <input
                        type="number"
                        name="points"
                        value={formData.points}
                        required
                        onChange={handleChange}
                        placeholder="Enter reward points"
                        min={1}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${isDarkMode
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                          }`}
                      />
                    </div>
                  </div>
                )}

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
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Evergreen Mode
                  </label>
                  <div className="relative group">
                    <Info className={`w-4 h-4 cursor-help ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-80 px-3 py-2 text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${isDarkMode ? 'bg-gray-800 text-gray-200 border border-gray-600' : 'bg-white text-gray-800 border border-gray-200'}`}>
                      <div>
                        <div className="font-medium mb-1">Evergreen Mode</div>
                        <div className="mb-2">Enabled: Users can redeem this reward multiple times as long as they have enough points.</div>
                        <div>Disabled: Users can only redeem this reward once when they first reach the required points.</div>
                      </div>
                      <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${isDarkMode ? 'border-t-gray-800' : 'border-t-white'}`}></div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Preview</h3>

              <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                <div className={`rounded-lg border p-4 ${isDarkMode
                    ? 'bg-gray-800 border-gray-600'
                    : 'bg-white border-gray-200'
                  }`}>
                  {/* Image Preview */}
                  <div className="relative">
                    <img
                      className="w-full h-48 rounded-lg object-cover"
                      alt="Reward preview"
                      src={
                        imageFile
                          ? URL.createObjectURL(imageFile)
                          : "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Latte_and_dark_coffee.jpg/1200px-Latte_and_dark_coffee.jpg"
                      }
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <h4 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                        {formData.name || "Reward Name"}
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        {isL5Format
                          ? `${formData.threshold || "0"} Points Required`
                          : isL4Format
                          ? `${formData.pointCost || "0"} Points to Redeem`
                          : isL6Format
                          ? l6Category === "tier"
                            ? formData.tier || "Select tier"
                            : l6Category === "point"
                              ? `${formData.pointCost || "0"} pts`
                              : l6Category === "mission"
                                ? l6Missions.length > 0 ? `${l6Missions.length} mission${l6Missions.length !== 1 ? "s" : ""}` : "No missions"
                                : "Select reward category"
                          : `${formData.points || "0"} Points Required`}
                      </p>
                    </div>
                    {!isL5Format && (
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        Redeem
                      </button>
                    )}
                  </div>

                  {!isL5Format && (
                    <div className={`mt-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                      {formData.description || "Reward description will appear here..."}
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="mt-4 space-y-2 text-sm">
                  {isL6Format ? (
                    <>
                      <div className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Category:</span>
                        <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {l6Category === "tier" ? "Tier" : l6Category === "point" ? "Point" : l6Category === "mission" ? "Mission" : "None"}
                        </span>
                      </div>
                      {l6Category === "tier" && (
                        <div className="flex justify-between">
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tier:</span>
                          <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{formData.tier || "—"}</span>
                        </div>
                      )}
                      {l6Category === "point" && (
                        <div className="flex justify-between">
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Point Cost:</span>
                          <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{formData.pointCost || "0"} pts</span>
                        </div>
                      )}
                      {l6Category === "mission" && (
                        <div className="flex justify-between">
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Missions:</span>
                          <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{l6Missions.length > 0 ? `${l6Missions.length} configured` : "—"}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Validity:</span>
                        <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {formData.validity === "none" ? "No Expiry" : formData.validity === "instant" ? "Instant" : `${formData.validity} days`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Evergreen:</span>
                        <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {formData.evergreen ? "Yes" : "No"}
                        </span>
                      </div>
                    </>
                  ) : isL4Format ? (
                    <>
                      <div className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Availability:</span>
                        <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {isTierBased ? (formData.tier || "—") : "All Customers"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Point Cost:</span>
                        <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {formData.pointCost || "0"} pts
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Validity:</span>
                        <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {formData.validity === "none" ? "No Expiry" : formData.validity === "instant" ? "Instant" : `${formData.validity} days`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Evergreen:</span>
                        <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {formData.evergreen ? "Yes" : "No"}
                        </span>
                      </div>
                    </>
                  ) : isL5Format ? (
                    <>
                      <div className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Reward Type:</span>
                        <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                          {formData.rewardType === "discount" ? "Discount" : "Physical Reward"}
                        </span>
                      </div>
                      {formData.rewardType === "discount" && (
                        <div className="flex justify-between">
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>Discount:</span>
                          <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'
                            }`}>
                            {formData.discountPercentage || "0"}%
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Validity:</span>
                        <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                          {formData.validity === "none" ? "No Expiry" : formData.validity === "instant" ? "Instant" : `${formData.validity || 0} days`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Evergreen:</span>
                        <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                          {formData.evergreen ? "Yes" : "No"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Validity:</span>
                        <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                          {formData.validity === "none" ? "No Expiry" : formData.validity === "instant" ? "Instant" : `${formData.validity || 0} days`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Evergreen:</span>
                        <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                          {formData.evergreen ? "Yes" : "No"}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>Store:</span>
                    <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>{store?.name || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex justify-end space-x-3 p-4 border-t sticky bottom-0 z-10 rounded-b-lg ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
          }`}>
          <button
            type="button"
            onClick={handleClose}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${isDarkMode
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
            {loading ? "Creating..." : "Create Reward"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRewardModal;
