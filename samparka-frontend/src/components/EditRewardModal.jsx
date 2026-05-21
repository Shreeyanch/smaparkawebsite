import { useState, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import api from "../api/config";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Award, Activity, Edit3, Save, Info, X, Target, Trash2, Crown, Coins, Crosshair, Flame, ImageIcon, PlusCircle } from "lucide-react";
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

const EditRewardModal = ({ reward, store, isOpen, onClose, onSuccess }) => {
  const isL6 = reward?.type === "l6";
  const isL5 = reward?.type === "l5";

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    validity: "none",
    points: "",
    evergreen: false,
    tier: "",
    pointCost: "",
  });

  // L6 state
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

  const inputCls = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${
    isDarkMode
      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
      : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"
  }`;
  const labelCls = `block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ── Mission helpers ────────────────────────────────────────────────────────
  const handleAddMission = () => {
    const title = (newMission.title || "").trim();
    if (!title) { toast.error("Mission title is required"); return false; }
    if (l6Missions.some((m) => (m.title || "").trim().toLowerCase() === title.toLowerCase())) {
      toast.error("Mission title already exists"); return false;
    }
    const isMultiItem = newMission.missionType === "multiItem";
    if (isMultiItem && (!newMission.items || newMission.items.length === 0)) {
      toast.error("Multi-item mission requires at least one item"); return false;
    }
    setL6Missions((prev) => [
      ...prev,
      {
        title,
        subtitle: newMission.subtitle || "Complete to earn rewards",
        icon: newMission.icon || "coffee",
        stampColor: newMission.stampColor || "#3b82f6",
        missionType: isMultiItem ? "multiItem" : "simple",
        ...(newMission.expiryDate ? { expiryDate: newMission.expiryDate } : {}),
        ...(isMultiItem
          ? { items: newMission.items }
          : { progress: Math.max(0, parseInt(newMission.progress, 10) || 0), goal: Math.max(1, parseInt(newMission.goal, 10) || 100) }),
        ...(newMission.backgroundImageFile ? { _bgFile: newMission.backgroundImageFile, _bgPreview: newMission.backgroundImagePreview } : {}),
      },
    ]);
    setNewMission(DEFAULT_MISSION);
    return true;
  };

  const handleStartEditMission = (index) => {
    const m = l6Missions[index];
    if (!m) return;
    setEditingMissionIndex(index);
    setNewMission({
      title: m.title || "",
      subtitle: m.subtitle || "Complete to earn rewards",
      icon: m.icon || "coffee",
      stampColor: m.stampColor || "#3b82f6",
      progress: m.progress ?? 0,
      goal: m.goal ?? 100,
      missionType: m.missionType || "simple",
      items: m.items || [],
      expiryDate: m.expiryDate || "",
      backgroundImageFile: m._bgFile || null,
      backgroundImagePreview: m._bgPreview || m.backgroundImage || "",
    });
  };

  const handleUpdateMission = () => {
    if (editingMissionIndex === null) return false;
    const title = (newMission.title || "").trim();
    if (!title) { toast.error("Mission title is required"); return false; }
    const duplicate = l6Missions.some(
      (m, idx) => idx !== editingMissionIndex && (m.title || "").trim().toLowerCase() === title.toLowerCase()
    );
    if (duplicate) { toast.error("Mission title already exists"); return false; }
    const isMultiItem = newMission.missionType === "multiItem";
    if (isMultiItem && (!newMission.items || newMission.items.length === 0)) {
      toast.error("Multi-item mission requires at least one item"); return false;
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
        : { progress: Math.max(0, parseInt(newMission.progress, 10) || 0), goal: Math.max(1, parseInt(newMission.goal, 10) || 100) }),
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
      payload.append("l6Config", JSON.stringify({ ...(loyaltyCard.l6Config || {}), missions: l6Missions }));
      const res = await api.put(`/store/customizeLoyaltyCard?storeId=${store._id}`, payload, { headers: { token } });
      if (res.data.success) toast.success("Mission configuration saved", { duration: 2000 });
      else toast.error(res.data.message || "Failed to save", { duration: 2000 });
    } catch (err) {
      toast.error(err.message || "Failed to save", { duration: 2000 });
    } finally {
      setSavingMissions(false);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("description", formData.description || "");
      fd.append("validity", formData.validity);
      fd.append("evergreen", formData.evergreen);

      if (isL6) {
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
        fd.append("isTierBased", l6Category === "tier");
        fd.append("isPointBased", l6Category === "point");
        fd.append("isMissionBased", l6Category === "mission");
        fd.append("isStreakBased", l6Category === "streak");
        if (l6Category === "tier") fd.append("tier", formData.tier);
        if (l6Category === "point") fd.append("pointCost", Number(formData.pointCost));
        if (l6Category === "streak") {
          fd.append("streakGoal", Number(streakGoal));
          if (streakIconFile) {
            fd.append("streakIconImage", streakIconFile);
          } else if (streakIcon) {
            fd.append("streakIcon", streakIcon);
          }
        }
        if (l6Category === "mission") {
          const cleanMissions = l6Missions.map(({ _bgFile, _bgPreview, ...rest }) => rest);
          fd.append("l6Missions", JSON.stringify(cleanMissions));
          l6Missions.forEach((m, i) => {
            if (m._bgFile) fd.append(`missionImage_${i}`, m._bgFile);
          });
        }
      } else {
        fd.append("points", formData.points);
      }

      if (imageFile) fd.append("image", imageFile);

      const response = await api.put(
        `/reward/editReward/${store._id}?rewardId=${reward._id}`,
        fd,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Reward updated", { duration: 2000 });
        onSuccess();
        handleClose();
      } else {
        toast.error(response.data.message, { duration: 2000 });
      }
    } catch (error) {
      toast.error(error.message || "Failed to update reward", { duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  // ── Modal animation ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) setTimeout(() => setIsVisible(true), 10);
    else setIsVisible(false);
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  // ── Init form from reward ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !reward) return;
    setFormData({
      name: reward.name || "",
      description: reward.description || "",
      validity: reward.validity || "none",
      points: reward.points || "",
      evergreen: reward.evergreen || false,
      tier: reward.tier || store?.loyaltyCard?.tier?.[0]?.name || "",
      pointCost: reward.pointCost || "",
    });
    if (isL6) {
      const cat = reward.isTierBased ? "tier" : reward.isPointBased ? "point" : reward.isMissionBased ? "mission" : reward.isStreakBased ? "streak" : "";
      if (reward.isStreakBased) {
        setStreakGoal(reward.streakGoal || 7);
        const saved = reward.streakIcon || "";
        if (saved.startsWith("http")) {
          setStreakIcon("");
          setStreakIconFile(null);
          setStreakIconPreview(saved);
        } else {
          setStreakIcon(saved || "");
          setStreakIconFile(null);
          setStreakIconPreview("");
        }
      }
      setL6Category(cat);
      // Load missions from the reward itself first, fall back to store config
      let rewardMissions = [];
      if (Array.isArray(reward.l6Missions) && reward.l6Missions.length > 0) {
        rewardMissions = reward.l6Missions;
      } else if (typeof reward.l6Missions === "string") {
        try { rewardMissions = JSON.parse(reward.l6Missions); } catch { rewardMissions = []; }
      }
      setL6Missions(rewardMissions.length > 0 ? rewardMissions : (store?.loyaltyCard?.l6Config?.missions || []));
    }
    setNewMission(DEFAULT_MISSION);
    setEditingMissionIndex(null);
    setImageFile(null);
    setStreakIconFile(null);
    setStreakIconPreview("");
  }, [isOpen, reward?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const missionInputCls = `px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm ${isDarkMode ? "bg-gray-800 border-gray-600 text-white placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"}`;

  return (
    <div
      className={`fixed inset-0 bg-black transition-opacity duration-300 ease-out flex items-center justify-end z-50 p-4 ${isVisible ? "bg-opacity-50" : "bg-opacity-0"}`}
      onClick={handleClose}
    >
      <div
        className={`rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col transform transition-transform duration-300 ease-out ${isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white"} ${isVisible ? "translate-x-0" : "translate-x-full"}`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b sticky top-0 z-10 rounded-t-lg ${isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"}`}>
          <div className="flex items-center gap-3">
            <Edit3 className="w-5 h-5 text-green-600" />
            <h2 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Edit Reward</h2>
            {isL6 && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">L6</span>}
          </div>
          <button onClick={handleClose} className={`p-2 rounded-lg hover:scale-110 transition-all ${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600"}`}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left — Form */}
            <div className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Store (read-only) */}
                <div>
                  <label className={labelCls}>Store</label>
                  <div className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-700"}`}>
                    {store?.name || "No store selected"}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className={labelCls}>Reward Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Award className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} size={18} />
                    <input type="text" name="name" value={formData.name} required onChange={handleChange} placeholder="Enter reward name"
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${isDarkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400" : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"}`} />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={3}
                    placeholder="Enter reward description"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent resize-none ${isDarkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400" : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"}`} />
                </div>

                {/* ── L6-specific fields ─────────────────────────────────── */}
                {isL6 && (
                  <>
                    {/* Reward Category — card buttons */}
                    <div>
                      <label className={`block text-sm font-medium mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
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
                        <label className={labelCls}>Required Tier <span className="text-red-500">*</span></label>
                        <select name="tier" value={formData.tier} onChange={handleChange} required className={inputCls}>
                          <option value="">Select a tier</option>
                          {(store?.loyaltyCard?.tier || [])
                            .slice().sort((a, b) => (a.minPoints ?? 0) - (b.minPoints ?? 0))
                            .map((t) => (
                              <option key={t.name} value={t.name}>
                                {t.name} ({t.minPoints ?? 0}–{t.maxPoints >= 9999999 ? "∞" : t.maxPoints} pts)
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    {/* Point cost */}
                    {l6Category === "point" && (
                      <div>
                        <label className={labelCls}>Point Cost to Redeem <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <Activity className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-gray-400" : "text-gray-400"}`} size={18} />
                          <input type="number" name="pointCost" value={formData.pointCost} onChange={handleChange} required min={1}
                            placeholder="Points deducted on redemption"
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${isDarkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400" : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"}`} />
                        </div>
                      </div>
                    )}

                    {/* Streak Goal */}
                    {l6Category === "streak" && (
                      <div className="space-y-3">
                        <div>
                          <label className={`${labelCls}`}>Required Streak Days <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <Flame className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" size={18} />
                            <input
                              type="number"
                              value={streakGoal}
                              onChange={(e) => setStreakGoal(e.target.value)}
                              placeholder="e.g. 7"
                              min={1}
                              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent ${isDarkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400" : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"}`}
                            />
                          </div>
                          <p className={`mt-1 text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>Customer must maintain this many consecutive daily visits to unlock this reward.</p>
                        </div>
                        <div>
                          <label className={labelCls}>
                            Reward Icon <span className={`font-normal text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>(shown on streak day)</span>
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
                                className={`w-full px-3 py-2 text-xl border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${isDarkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"} ${streakIconPreview ? "opacity-40 cursor-not-allowed" : ""}`}
                              />
                            </div>
                            <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>or</span>
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
                          <p className={`mt-1 text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>Press Win+. (Windows) or Cmd+Ctrl+Space (Mac) to open emoji picker</p>
                        </div>
                      </div>
                    )}

                    {/* Mission Configuration */}
                    {l6Category === "mission" && (
                      <div className="space-y-3">
                        {/* ── Mission list ── */}
                        <div className={`rounded-lg border ${isDarkMode ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
                          <div className="flex items-center justify-between px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <Target size={15} className={isDarkMode ? "text-gray-400" : "text-gray-600"} />
                              <p className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                                Missions {l6Missions.length > 0 && <span className={`font-normal ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>({l6Missions.length})</span>}
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
                            <div className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                              {l6Missions.map((mission, index) => (
                                <div
                                  key={`${mission.title}-${index}`}
                                  className={`flex items-center gap-2.5 px-3 py-2 ${index > 0 ? `border-t ${isDarkMode ? "border-gray-700/50" : "border-gray-100"}` : ""} ${
                                    editingMissionIndex === index ? (isDarkMode ? "bg-amber-900/15" : "bg-amber-50/60") : ""
                                  }`}
                                >
                                  {/* Thumbnail */}
                                  {(mission._bgPreview || mission.backgroundImage) ? (
                                    <div className="w-9 h-9 rounded-md overflow-hidden shrink-0 border border-gray-200 dark:border-gray-600">
                                      <img src={mission._bgPreview || mission.backgroundImage} alt="" className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <div className={`w-9 h-9 rounded-md shrink-0 flex items-center justify-center ${isDarkMode ? "bg-gray-700" : "bg-gray-200/70"}`}>
                                      <Target size={14} className={isDarkMode ? "text-gray-500" : "text-gray-400"} />
                                    </div>
                                  )}

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{mission.title}</p>
                                    <p className={`text-[11px] truncate ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
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
                                      className={`p-1.5 rounded-md transition-colors ${isDarkMode ? "text-gray-400 hover:text-amber-400 hover:bg-gray-700" : "text-gray-400 hover:text-amber-600 hover:bg-amber-50"}`}
                                    >
                                      <Award size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveMission(index)}
                                      className={`p-1.5 rounded-md transition-colors ${isDarkMode ? "text-gray-400 hover:text-red-400 hover:bg-gray-700" : "text-gray-400 hover:text-red-500 hover:bg-red-50"}`}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {l6Missions.length === 0 && !showMissionForm && (
                            <div className="px-3 pb-3 text-center">
                              <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>No missions yet. Click &ldquo;Add&rdquo; to create one.</p>
                            </div>
                          )}
                        </div>

                        {/* ── Mission form (collapsible) ── */}
                        {showMissionForm && (
                          <div className={`p-3 rounded-lg border-2 border-dashed space-y-3 ${isDarkMode ? "border-gray-600 bg-gray-800/30" : "border-green-200 bg-green-50/30"}`}>
                            <div className="flex items-center justify-between">
                              <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                {editingMissionIndex !== null ? "Edit Mission" : "New Mission"}
                              </p>
                              <button
                                type="button"
                                onClick={() => { setShowMissionForm(false); handleCancelEditMission(); }}
                                className={`p-1 rounded-md ${isDarkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
                              >
                                <X size={14} />
                              </button>
                            </div>

                            {/* Title */}
                            <div>
                              <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Title <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={newMission.title}
                                onChange={(e) => setNewMission((prev) => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g. Buy 10 coffees"
                                className={`w-full mt-1 ${missionInputCls}`}
                              />
                            </div>

                            {/* Subtitle */}
                            <div>
                              <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Subtitle</label>
                              <input
                                type="text"
                                value={newMission.subtitle}
                                onChange={(e) => setNewMission((prev) => ({ ...prev, subtitle: e.target.value }))}
                                placeholder="Complete to earn rewards"
                                className={`w-full mt-1 ${missionInputCls}`}
                              />
                            </div>

                            {/* Mission Type + Icon row */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Type</label>
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
                                <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Icon</label>
                                <select
                                  value={newMission.icon}
                                  onChange={(e) => setNewMission((prev) => ({ ...prev, icon: e.target.value }))}
                                  className={`w-full mt-1 ${missionInputCls}`}
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
                                <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Items (each with their own goal)</label>
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
                                    <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Goal <span className="text-red-500">*</span></label>
                                    <input
                                      type="number"
                                      min={1}
                                      value={newMission.goal}
                                      onChange={(e) => setNewMission((prev) => ({ ...prev, goal: e.target.value }))}
                                      placeholder="100"
                                      className={`w-full mt-1 ${missionInputCls}`}
                                    />
                                  </div>
                                  <div>
                                    <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Starting Progress</label>
                                    <input
                                      type="number"
                                      min={0}
                                      value={newMission.progress}
                                      onChange={(e) => setNewMission((prev) => ({ ...prev, progress: e.target.value }))}
                                      placeholder="0"
                                      className={`w-full mt-1 ${missionInputCls}`}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                    Track Item <span className={`font-normal ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>(opt.)</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={newMission.itemName || ""}
                                    onChange={(e) => setNewMission((prev) => ({ ...prev, itemName: e.target.value }))}
                                    placeholder="e.g. Cappuccino — auto-tracks from receipts"
                                    className={`w-full mt-1 ${missionInputCls}`}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Optional fields row */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                  Expiry Date <span className={`font-normal ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>(opt.)</span>
                                </label>
                                <input
                                  type="date"
                                  value={newMission.expiryDate || ""}
                                  onChange={(e) => setNewMission((prev) => ({ ...prev, expiryDate: e.target.value }))}
                                  min={new Date().toISOString().split("T")[0]}
                                  className={`w-full mt-1 ${missionInputCls}`}
                                />
                              </div>
                              <div>
                                <label className={`text-xs font-medium flex items-center gap-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                  <ImageIcon size={11} /> Background <span className={`font-normal ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>(opt.)</span>
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
                                    className={`w-full mt-1 text-xs file:mr-2 file:py-1.5 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:bg-green-50 file:text-green-700 hover:file:bg-green-100 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
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
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
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
                              isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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

                {/* Non-L6: points */}
                {!isL6 && !isL5 && (
                  <div>
                    <label className={labelCls}>Reward Points <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Activity className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} size={18} />
                      <input type="number" name="points" value={formData.points} required onChange={handleChange} placeholder="Enter reward points" min={1}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${isDarkMode ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400" : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"}`} />
                    </div>
                  </div>
                )}

                {/* Image */}
                <div>
                  <label className={labelCls}>Upload Image <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const compressed = await compressImage(file);
                      setImageFile(compressed);
                    } catch {
                      toast.error("Failed to compress image");
                    }
                  }}
                    className={`w-full px-4 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-green-50 file:text-green-700 hover:file:bg-green-100 ${isDarkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-900"}`} />
                </div>

                {/* Validity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelCls.replace("mb-2", "")}>Reward Expires After</label>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({
                        ...prev,
                        validity: prev.validity === "none" ? "1" : "none",
                      }))}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${formData.validity !== "none" ? "bg-green-500" : isDarkMode ? "bg-gray-600" : "bg-gray-300"}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${formData.validity !== "none" ? "translate-x-4" : "translate-x-1"}`} />
                    </button>
                  </div>
                  {formData.validity !== "none" && (
                    <select name="validity" value={formData.validity} onChange={handleChange} className={inputCls}>
                      {Array.from({ length: 365 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1} {i + 1 === 1 ? "day" : "days"}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Evergreen */}
                <div className="flex items-center gap-3">
                  <input type="checkbox" name="evergreen" checked={formData.evergreen}
                    onChange={(e) => setFormData((prev) => ({ ...prev, evergreen: e.target.checked }))}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-1" />
                  <label className={labelCls.replace("mb-2", "")}>Evergreen Mode</label>
                  <div className="relative group">
                    <Info className={`w-4 h-4 cursor-help ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                    <div className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 px-3 py-2 text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 ${isDarkMode ? "bg-gray-800 text-gray-200 border border-gray-600" : "bg-white text-gray-800 border border-gray-200"}`}>
                      <div className="font-medium mb-1">Evergreen Mode</div>
                      <div className="mb-2">Enabled: Users can redeem this reward multiple times as long as they have enough points.</div>
                      <div>Disabled: Users can only redeem this reward once when they first reach the required points.</div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Right — Preview */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Preview</h3>
              <div className={`rounded-lg p-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                <div className={`rounded-lg border p-4 ${isDarkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}>
                  <img
                    className="w-full h-48 rounded-lg object-cover"
                    alt="Reward preview"
                    src={imageFile ? URL.createObjectURL(imageFile) : reward?.image || reward?.template?.image || "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Latte_and_dark_coffee.jpg/1200px-Latte_and_dark_coffee.jpg"}
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <h4 className={`text-lg font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{formData.name || "Reward Name"}</h4>
                      {isL6 && l6Category && (
                        <p className={`text-xs mt-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {l6Category === "tier" && `Tier: ${formData.tier || "—"}`}
                          {l6Category === "point" && `${formData.pointCost || "—"} pts to redeem`}
                          {l6Category === "mission" && `Mission based · ${l6Missions.length} mission${l6Missions.length !== 1 ? "s" : ""}`}
                        </p>
                      )}
                      {!isL6 && <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{formData.points || "0"} Points Required</p>}
                    </div>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">Redeem</button>
                  </div>
                  <p className={`mt-3 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{formData.description || "Reward description..."}</p>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Validity:</span>
                    <span className={isDarkMode ? "text-gray-300" : "text-gray-900"}>{formData.validity === "none" ? "No Expiry" : formData.validity === "instant" ? "Instant" : `${formData.validity} days`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Evergreen:</span>
                    <span className={isDarkMode ? "text-gray-300" : "text-gray-900"}>{formData.evergreen ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex justify-end gap-3 p-4 border-t sticky bottom-0 z-10 rounded-b-lg ${isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"}`}>
          <button type="button" onClick={handleClose}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${isDarkMode ? "text-gray-300 bg-gray-600 hover:bg-gray-500" : "text-gray-700 bg-gray-200 hover:bg-gray-300"}`}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50">
            <Save size={16} />
            {loading ? "Updating..." : "Update Reward"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRewardModal;
