import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

export default function TiersForm({ tiers, setTiers, error, setError }) {
  const { isDarkMode } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [newTier, setNewTier] = useState({
    name: "",
    minPoints: 0,
    maxPoints: 100,
    color: "#000000"
  });

  // ✅ Moved out of render body — calling setTiers during render causes an infinite loop.
  useEffect(() => {
    if (Array.isArray(tiers) && tiers.length === 0) {
      setTiers([{ name: "Bronze", minPoints: 0, maxPoints: 100 }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiers.length]);
  const handleInputChange = (field, value) => {
    setNewTier(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const checkError = (field, value) => {
    if (field === "minPoints") {
      const lastTier = tiers[tiers.length - 1];
      if (lastTier && value <= lastTier.maxPoints) {
        setError(
          "Min Points should be greater than previous tier's Max Points"
        );
        return;
      }
    } else if (field === "maxPoints") {
      if (value <= newTier.minPoints) {
        setError("Max Points should be greater than Min Points");
        return;
      }
    }

    // Clear the error if everything is fine
    setError(null);
  };

  const addTier = () => {
    setTiers([...tiers, newTier]);
    setNewTier({
      name: "",
      minPoints: 0,
      maxPoints: 100,
      color: "#000000"
    });
    setShowForm(false);
    setError(null);
  };

  const cancelAddTier = () => {
    setNewTier({
      name: "",
      minPoints: 0,
      maxPoints: 100,
      color: "#000000"
    });
    setShowForm(false);
    setError(null);
  };

  const removeTier = (index) => {
    setTiers(tiers.filter((_, i) => i !== index));
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
                  type="number"
                  value={newTier.minPoints}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    checkError("minPoints", value);
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
                  type="number"
                  value={newTier.maxPoints}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    checkError("maxPoints", value);
                    handleInputChange("maxPoints", value);
                  }}
                  placeholder="Max Points"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                />
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Color
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
    </div>
  );
}
