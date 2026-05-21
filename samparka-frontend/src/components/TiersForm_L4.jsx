import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { Edit3, Trash2, Check, X, Upload } from "lucide-react";
import imageCompression from "browser-image-compression";

const compressImage = async (file) => {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  return await imageCompression(file, options);
};

const INFINITY_SENTINEL = 9999999;

export default function TiersForm({
  tiers, setTiers, error, setError,
  tierStampFiles = {}, setTierStampFiles = () => {},
  tierCardImageFiles = {}, setTierCardImageFiles = () => {},
  removeTierStamps = {}, setRemoveTierStamps = () => {},
  removeTierCardImages = {}, setRemoveTierCardImages = () => {},
}) {
  const { isDarkMode } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingTier, setEditingTier] = useState(null);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);
  const [newTier, setNewTier] = useState({
    name: "",
    minPoints: 0,
    maxPoints: 100,
    maintain: 0,
    color: "#000000",
    // L4-specific fields
    discountPercentage: 0,
    maintenancePeriod: null, // Optional per-tier override
    // Per-tier card appearance (optional — empty means use global card settings)
    cardColor: "",
    textColor: "",
    stamp: "",     // icon override (coffee | smile | thumbsUp | "")
    customStamp: null,
    cardImage: null,
  });
  // Temp File objects for new tier — promoted to parent state on addTier()
  const [newTierStampFile, setNewTierStampFile] = useState(null);
  const [newTierCardImageFile, setNewTierCardImageFile] = useState(null);

  // Normalise "Infinity" strings from the DB back to the JS Infinity value.
  useEffect(() => {
    if (tiers.length > 0 && tiers[tiers.length - 1]?.maxPoints === "Infinity") {
      setTiers([
        ...tiers.slice(0, -1),
        { ...tiers[tiers.length - 1], maxPoints: Infinity },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiers.length, tiers[tiers.length - 1]?.maxPoints]);
  const handleInputChange = (field, value) => {
    setNewTier(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const checkError = (field, value) => {
    if (field === "maxPoints") {
      if (value <= newTier.minPoints) {
        setError("Max Points should be greater than Min Points");
        return;
      }
    }

    // Clear the error if everything is fine
    setError(null);
  };

  const sortTiers = (arr) => [...arr].sort((a, b) => (a.minPoints ?? 0) - (b.minPoints ?? 0));

  const EMPTY_TIER = {
    name: "", minPoints: 0, maxPoints: 100, maintain: 0,
    color: "#000000", discountPercentage: 0, maintenancePeriod: null,
    cardColor: "", textColor: "", stamp: "", customStamp: null, cardImage: null,
  };

  const addTier = () => {
    // Promote temp file objects to parent-level image state keyed by tier name
    if (newTierStampFile) {
      setTierStampFiles((prev) => ({ ...prev, [newTier.name]: newTierStampFile }));
    }
    if (newTierCardImageFile) {
      setTierCardImageFiles((prev) => ({ ...prev, [newTier.name]: newTierCardImageFile }));
    }
    setTiers(sortTiers([...tiers, newTier]));
    setNewTier(EMPTY_TIER);
    setNewTierStampFile(null);
    setNewTierCardImageFile(null);
    setShowForm(false);
    setError(null);
  };

  const cancelAddTier = () => {
    setNewTier(EMPTY_TIER);
    setNewTierStampFile(null);
    setNewTierCardImageFile(null);
    setShowForm(false);
    setError(null);
  };

  const removeTier = (index) => {
    if (tiers.length <= 1) return;
    setConfirmDeleteIndex(index);
  };

  const confirmDelete = () => {
    const index = confirmDeleteIndex;
    setTiers(tiers.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingTier(null);
    }
    setConfirmDeleteIndex(null);
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditingTier({ ...tiers[index] });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingTier(null);
  };

  const saveEdit = () => {
    if (editingTier && editingIndex !== null) {
      const updated = sortTiers([...tiers.slice(0, editingIndex), editingTier, ...tiers.slice(editingIndex + 1)]);
      setTiers(updated);
      setEditingIndex(null);
      setEditingTier(null);
    }
  };

  const handleEditField = (field, value) => {
    setEditingTier((prev) => {
      let processed = value;
      if (field === "minPoints" || field === "maintain") {
        processed = value === "" ? 0 : parseInt(value) || 0;
      } else if (field === "maxPoints") {
        if (value === Infinity || value === INFINITY_SENTINEL || value === "Infinity") {
          processed = INFINITY_SENTINEL;
        } else {
          processed = value === "" ? 0 : parseInt(value) || 0;
        }
      } else if (field === "discountPercentage") {
        const n = parseFloat(value) || 0;
        processed = Math.min(100, Math.max(0, n));
      } else if (field === "maintenancePeriod") {
        processed = value === "" ? null : parseInt(value) || null;
      }
      return { ...prev, [field]: processed };
    });
  };

  return (
    <div
      className={`max-w-2xl mx-auto rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
    >
      {/* Header */}
      <div className={`p-6 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'
        }`}>
        <div className="flex flex-col gap-4 items-center justify-between">
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Create Tiers</h2>
          {!showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className={`w-full py-3 border-2 border-dashed rounded-md focus:outline-none transition-colors ${isDarkMode
                ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700'
                }`}
            >
              + Add New Tier
            </button>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            {error}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Existing Tiers List */}
        {tiers.length > 0 && (
          <div className="space-y-3">
            {tiers.map((tier, index) => (
              <div
                key={index}
                className={`border rounded-lg overflow-hidden ${isDarkMode ? "border-gray-600 bg-gray-700" : "border-gray-200 bg-gray-50"}`}
              >
                {/* Tier Header */}
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color || "#6b7280" }} />
                    <span className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {tier.name || "(unnamed)"}
                    </span>
                    <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {tier.minPoints}–{(tier.maxPoints === Infinity || tier.maxPoints >= INFINITY_SENTINEL || tier.maxPoints === "Infinity") ? "∞" : tier.maxPoints} pts
                    </span>
                    {tier.discountPercentage > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${isDarkMode ? "bg-green-900/40 text-green-300" : "bg-green-100 text-green-700"}`}>
                        {tier.discountPercentage}% off
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {editingIndex === index ? (
                      <>
                        <button
                          type="button"
                          onClick={saveEdit}
                          className={`p-1 rounded transition-colors ${isDarkMode ? "hover:bg-green-900/30 text-green-400" : "hover:bg-green-100 text-green-600"}`}
                          title="Save"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className={`p-1 rounded transition-colors ${isDarkMode ? "hover:bg-gray-600 text-gray-400" : "hover:bg-gray-200 text-gray-500"}`}
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(index)}
                          className={`p-1 rounded transition-colors ${isDarkMode ? "hover:bg-blue-900/30 text-blue-400" : "hover:bg-blue-100 text-blue-600"}`}
                          title="Edit tier"
                        >
                          <Edit3 size={14} />
                        </button>
                        {tiers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTier(index)}
                            className={`p-1 rounded transition-colors ${isDarkMode ? "hover:bg-red-900/30 text-red-400" : "hover:bg-red-100 text-red-600"}`}
                            title="Delete tier"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Inline Edit Form */}
                {editingIndex === index && editingTier && (
                  <div className={`border-t px-4 py-3 space-y-3 ${isDarkMode ? "border-gray-600 bg-gray-800" : "border-gray-200 bg-white"}`}>
                    {/* Name + Color */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Name</label>
                        <input
                          type="text"
                          value={editingTier.name || ""}
                          onChange={(e) => setEditingTier((p) => ({ ...p, name: e.target.value }))}
                          className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Color</label>
                        <input
                          type="color"
                          value={editingTier.color || "#000000"}
                          onChange={(e) => setEditingTier((p) => ({ ...p, color: e.target.value }))}
                          className={`w-full h-[34px] rounded border cursor-pointer ${isDarkMode ? "border-gray-600" : "border-gray-300"}`}
                        />
                      </div>
                    </div>

                    {/* Points Range */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Min Pts</label>
                        <input
                          type="text"
                          value={editingTier.minPoints ?? 0}
                          onChange={(e) => handleEditField("minPoints", e.target.value)}
                          className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Max Pts</label>
                        <input
                          type="text"
                          value={(editingTier.maxPoints === Infinity || editingTier.maxPoints >= INFINITY_SENTINEL || editingTier.maxPoints === "Infinity") ? "" : editingTier.maxPoints ?? 0}
                          onChange={(e) => handleEditField("maxPoints", e.target.value === "" ? Infinity : e.target.value)}
                          placeholder="∞"
                          className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`}
                        />
                      </div>
                    </div>

                    {/* Maintain + Discount */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Maintain Pts</label>
                        <input
                          type="text"
                          value={editingTier.maintain || ""}
                          onChange={(e) => handleEditField("maintain", e.target.value)}
                          placeholder="0"
                          className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Auto Discount (%)</label>
                        <input
                          type="text"
                          value={editingTier.discountPercentage ?? 0}
                          onChange={(e) => handleEditField("discountPercentage", e.target.value)}
                          placeholder="e.g. 5"
                          className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`}
                        />
                      </div>
                    </div>

                    {/* Maintenance Period */}
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Maintenance Period (days) <span className="font-normal opacity-60">optional</span>
                      </label>
                      <input
                        type="text"
                        value={editingTier.maintenancePeriod ?? ""}
                        onChange={(e) => handleEditField("maintenancePeriod", e.target.value)}
                        placeholder="Leave empty to use global setting"
                        className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white placeholder-gray-500" : "border-gray-300 bg-white placeholder-gray-400"}`}
                      />
                    </div>

                    {/* Card Appearance Overrides */}
                    <div className={`pt-2 border-t ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}>
                      <p className={`text-xs font-medium mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Card Appearance <span className="font-normal opacity-70">— optional, overrides global for this tier</span>
                      </p>
                      {/* Stamp Icon */}
                      <div className="mb-2">
                        <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Icon</label>
                        <select
                          value={editingTier.stamp || ""}
                          onChange={(e) => handleEditField("stamp", e.target.value)}
                          className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white"}`}
                        >
                          <option value="">Use global icon</option>
                          <option value="coffee">☕ Coffee</option>
                          <option value="smile">😊 Smile</option>
                          <option value="thumbsUp">👍 Thumbs Up</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Card Color</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={editingTier.cardColor || "#016e49"}
                              onChange={(e) => handleEditField("cardColor", e.target.value)}
                              className={`h-[30px] w-[30px] rounded border cursor-pointer flex-shrink-0 ${isDarkMode ? "border-gray-600" : "border-gray-300"}`}
                            />
                            <input
                              type="text"
                              value={editingTier.cardColor || ""}
                              onChange={(e) => handleEditField("cardColor", e.target.value)}
                              placeholder="Leave empty for global"
                              className={`flex-1 min-w-0 px-2 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white placeholder-gray-500" : "border-gray-300 bg-white placeholder-gray-400"}`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Text Color</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={editingTier.textColor || "#ffffff"}
                              onChange={(e) => handleEditField("textColor", e.target.value)}
                              className={`h-[30px] w-[30px] rounded border cursor-pointer flex-shrink-0 ${isDarkMode ? "border-gray-600" : "border-gray-300"}`}
                            />
                            <input
                              type="text"
                              value={editingTier.textColor || ""}
                              onChange={(e) => handleEditField("textColor", e.target.value)}
                              placeholder="Leave empty for global"
                              className={`flex-1 min-w-0 px-2 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white placeholder-gray-500" : "border-gray-300 bg-white placeholder-gray-400"}`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Per-tier image uploads */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Custom Icon</label>
                          <div
                            className={`border border-dashed rounded-lg p-2 text-center cursor-pointer ${isDarkMode ? "border-gray-600 hover:border-gray-500" : "border-gray-300 hover:border-gray-400"} ${(editingTier.customStamp || tierStampFiles[editingTier.name]) ? "border-solid border-green-500" : ""}`}
                            onClick={() => document.getElementById(`tf-tierStamp-${editingTier.name}`).click()}
                          >
                            {editingTier.customStamp || tierStampFiles[editingTier.name] ? (
                              <div className="flex flex-col items-center gap-1">
                                <img
                                  src={tierStampFiles[editingTier.name] ? URL.createObjectURL(tierStampFiles[editingTier.name]) : editingTier.customStamp}
                                  alt="icon" className="w-8 h-8 object-contain rounded"
                                />
                                <button type="button" onClick={(e) => {
                                  e.stopPropagation();
                                  setTierStampFiles((prev) => { const n = { ...prev }; delete n[editingTier.name]; return n; });
                                  setRemoveTierStamps((prev) => ({ ...prev, [editingTier.name]: true }));
                                  setEditingTier((p) => ({ ...p, customStamp: null }));
                                }} className="text-red-500 hover:text-red-700"><Trash2 size={12} /></button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1 py-1">
                                <Upload className={`w-4 h-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                                <span className={`text-[10px] ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>Upload</span>
                              </div>
                            )}
                            <input id={`tf-tierStamp-${editingTier.name}`} type="file" accept="image/*" className="sr-only"
                              onChange={async (e) => {
                                if (e.target.files[0]) {
                                  const compressed = await compressImage(e.target.files[0]);
                                  setTierStampFiles((prev) => ({ ...prev, [editingTier.name]: compressed }));
                                  setRemoveTierStamps((prev) => { const n = { ...prev }; delete n[editingTier.name]; return n; });
                                  setEditingTier((p) => ({ ...p, customStamp: URL.createObjectURL(compressed) }));
                                }
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Background</label>
                          <div
                            className={`border border-dashed rounded-lg p-2 text-center cursor-pointer ${isDarkMode ? "border-gray-600 hover:border-gray-500" : "border-gray-300 hover:border-gray-400"} ${(editingTier.cardImage || tierCardImageFiles[editingTier.name]) ? "border-solid border-green-500" : ""}`}
                            onClick={() => document.getElementById(`tf-tierCardImage-${editingTier.name}`).click()}
                          >
                            {editingTier.cardImage || tierCardImageFiles[editingTier.name] ? (
                              <div className="flex flex-col items-center gap-1">
                                <img
                                  src={tierCardImageFiles[editingTier.name] ? URL.createObjectURL(tierCardImageFiles[editingTier.name]) : editingTier.cardImage}
                                  alt="bg" className="w-12 h-8 object-cover rounded"
                                />
                                <button type="button" onClick={(e) => {
                                  e.stopPropagation();
                                  setTierCardImageFiles((prev) => { const n = { ...prev }; delete n[editingTier.name]; return n; });
                                  setRemoveTierCardImages((prev) => ({ ...prev, [editingTier.name]: true }));
                                  setEditingTier((p) => ({ ...p, cardImage: null }));
                                }} className="text-red-500 hover:text-red-700"><Trash2 size={12} /></button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1 py-1">
                                <Upload className={`w-4 h-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                                <span className={`text-[10px] ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>Upload</span>
                              </div>
                            )}
                            <input id={`tf-tierCardImage-${editingTier.name}`} type="file" accept="image/*" className="sr-only"
                              onChange={async (e) => {
                                if (e.target.files[0]) {
                                  const compressed = await compressImage(e.target.files[0]);
                                  setTierCardImageFiles((prev) => ({ ...prev, [editingTier.name]: compressed }));
                                  setRemoveTierCardImages((prev) => { const n = { ...prev }; delete n[editingTier.name]; return n; });
                                  setEditingTier((p) => ({ ...p, cardImage: URL.createObjectURL(compressed) }));
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add New Tier Form */}
        {showForm && (
          <div className={`border rounded-lg p-4 space-y-4 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'
            }`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Add New Tier</h3>
              <button
                type="button"
                onClick={cancelAddTier}
                className={`${isDarkMode
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                ✕
              </button>
            </div>

            {/* Tier Name */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Tier Name
              </label>
              <input
                type="text"
                value={newTier.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                placeholder="Enter tier name"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
              />
            </div>

            {/* Points Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Minimum Points
                </label>
                <input
                  type="text"
                  value={newTier.minPoints}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    handleInputChange("minPoints", value);
                  }}
                  placeholder="Min Points"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Maximum Points
                </label>
                <input
                  type="text"
                  value={newTier.maxPoints === Infinity ? '' : newTier.maxPoints}
                  onChange={(e) => {
                    const value = e.target.value === '' ? Infinity : Number(e.target.value);
                    checkError("maxPoints", value);
                    handleInputChange("maxPoints", value);
                  }}
                  placeholder="Max Points"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                  disabled={newTier.maxPoints === Infinity}
                />

                {/* Infinite Option */}
                <div className="mt-2 flex items-center">
                  <input
                    type="checkbox"
                    checked={newTier.maxPoints === Infinity}
                    onChange={(e) =>
                      handleInputChange("maxPoints", e.target.checked ? Infinity : 0)
                    }
                    id="infinite-new"
                    className={`h-4 w-4 text-green-600 rounded focus:ring-green-500 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'
                      }`}
                  />
                  <label
                    htmlFor="infinite-new"
                    className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                  >
                    No Max Limit (∞)
                  </label>
                </div>
              </div>
            </div>

            {/* Maintain Points */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Minimum Points To Maintain Tier
              </label>
              <input
                type="text"
                value={newTier.maintain}
                onChange={(e) => handleInputChange("maintain", Number(e.target.value))}
                placeholder="0"
                inputMode="numeric"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
              />
            </div>

            {/* L4-specific fields */}
            {/* Auto Discount Percentage */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Auto Discount (%) <span className="text-xs text-gray-500">- Applied automatically to every purchase</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={newTier.discountPercentage || 0}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow numbers and decimal point
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    const numValue = value === '' ? 0 : Number(value);
                    const clampedValue = Math.min(100, Math.max(0, numValue));
                    handleInputChange("discountPercentage", clampedValue);
                  }
                }}
                placeholder="e.g., 5 for 5% discount"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
              />
              <p className="mt-1 text-xs text-gray-500">Customers in this tier get this discount on all purchases</p>
            </div>

            {/* Maintenance Period (optional) */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Tier Maintenance Period (Days) <span className="text-xs text-gray-500">- Optional, overrides global setting</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={newTier.maintenancePeriod ?? ""}
                onChange={(e) => handleInputChange("maintenancePeriod", e.target.value ? Number(e.target.value) : null)}
                placeholder="Leave empty to use global setting"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
              />
              <p className="mt-1 text-xs text-gray-500">If set, this tier will check maintenance after this many days instead of global setting</p>
            </div>

            {/* Color Picker */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Tier Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTier.color}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                  className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode
                    ? 'text-white bg-gray-700 border-gray-600'
                    : 'text-gray-900 bg-white border-gray-300'
                    }`}
                />
                <input
                  type="color"
                  value={newTier.color}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                  className={`h-10 w-10 rounded-lg border ${isDarkMode
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-white border-gray-300'
                    }`}
                />
              </div>
            </div>

            {/* Card Appearance Overrides */}
            <div className={`pt-3 border-t ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}>
              <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Card Appearance <span className={`text-xs font-normal ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>— optional</span>
              </p>
              <p className={`text-xs mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Override the global card look for customers in this tier
              </p>
              {/* Icon */}
              <div className="mb-3">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Icon</label>
                <select
                  value={newTier.stamp || ""}
                  onChange={(e) => handleInputChange("stamp", e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                >
                  <option value="">Use global icon</option>
                  <option value="coffee">☕ Coffee</option>
                  <option value="smile">😊 Smile</option>
                  <option value="thumbsUp">👍 Thumbs Up</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Card Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newTier.cardColor || "#016e49"}
                      onChange={(e) => handleInputChange("cardColor", e.target.value)}
                      className={`h-10 w-10 rounded-lg border cursor-pointer ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                    <input
                      type="text"
                      value={newTier.cardColor || ""}
                      onChange={(e) => handleInputChange("cardColor", e.target.value)}
                      placeholder="Leave empty for global"
                      className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode ? 'text-white bg-gray-700 border-gray-600 placeholder-gray-500' : 'text-gray-900 bg-white border-gray-300 placeholder-gray-400'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newTier.textColor || "#ffffff"}
                      onChange={(e) => handleInputChange("textColor", e.target.value)}
                      className={`h-10 w-10 rounded-lg border cursor-pointer ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                    <input
                      type="text"
                      value={newTier.textColor || ""}
                      onChange={(e) => handleInputChange("textColor", e.target.value)}
                      placeholder="Leave empty for global"
                      className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode ? 'text-white bg-gray-700 border-gray-600 placeholder-gray-500' : 'text-gray-900 bg-white border-gray-300 placeholder-gray-400'}`}
                    />
                  </div>
                </div>
              </div>

              {/* Image uploads for new tier */}
              <div className="grid grid-cols-2 gap-3 mt-1">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Custom Icon</label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'} ${(newTier.customStamp || newTierStampFile) ? 'border-solid border-green-500' : ''}`}
                    onClick={() => document.getElementById("new-tier-stamp").click()}
                  >
                    {newTier.customStamp || newTierStampFile ? (
                      <div className="flex flex-col items-center gap-1">
                        <img
                          src={newTierStampFile ? URL.createObjectURL(newTierStampFile) : newTier.customStamp}
                          alt="icon" className="w-10 h-10 object-contain rounded"
                        />
                        <button type="button" onClick={(e) => {
                          e.stopPropagation();
                          setNewTierStampFile(null);
                          handleInputChange("customStamp", null);
                        }} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-1">
                        <Upload className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Upload Icon</span>
                      </div>
                    )}
                    <input id="new-tier-stamp" type="file" accept="image/*" className="sr-only"
                      onChange={async (e) => {
                        if (e.target.files[0]) {
                          const compressed = await compressImage(e.target.files[0]);
                          setNewTierStampFile(compressed);
                          handleInputChange("customStamp", URL.createObjectURL(compressed));
                        }
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Background Image</label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'} ${(newTier.cardImage || newTierCardImageFile) ? 'border-solid border-green-500' : ''}`}
                    onClick={() => document.getElementById("new-tier-cardimage").click()}
                  >
                    {newTier.cardImage || newTierCardImageFile ? (
                      <div className="flex flex-col items-center gap-1">
                        <img
                          src={newTierCardImageFile ? URL.createObjectURL(newTierCardImageFile) : newTier.cardImage}
                          alt="bg" className="w-16 h-10 object-cover rounded"
                        />
                        <button type="button" onClick={(e) => {
                          e.stopPropagation();
                          setNewTierCardImageFile(null);
                          handleInputChange("cardImage", null);
                        }} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-1">
                        <Upload className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Upload Image</span>
                      </div>
                    )}
                    <input id="new-tier-cardimage" type="file" accept="image/*" className="sr-only"
                      onChange={async (e) => {
                        if (e.target.files[0]) {
                          const compressed = await compressImage(e.target.files[0]);
                          setNewTierCardImageFile(compressed);
                          handleInputChange("cardImage", URL.createObjectURL(compressed));
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelAddTier}
                className={`px-4 py-2 rounded-md focus:outline-none focus:ring-1 transition-colors ${isDarkMode
                  ? 'text-gray-300 bg-gray-700 hover:bg-gray-600 focus:ring-gray-500'
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500'
                  }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addTier}
                disabled={!newTier.name.trim() || !!error}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Tier
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Delete Confirmation Modal */}
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
                type="button"
                onClick={() => setConfirmDeleteIndex(null)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
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
