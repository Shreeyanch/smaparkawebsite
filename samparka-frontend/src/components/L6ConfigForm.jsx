import { useEffect, useState } from "react";
import { Flame, Layers, Star, TrendingUp, Target, Plus, Trash2 } from "lucide-react";

const defaultL6Config = {
  pointsLabel: "Magic Points",
  greetingSubtitle: "ready for your next journey?",
  showGreeting: true,
  showTier: true,
  showStreak: true,
  streakLabel: "Days Streak!",
  streakSubtitle: "You are on the right trackff",
  streakGoal: 7,
  showProgress: true,
  missions: [],
};

const L6ConfigForm = ({ l6Config, setL6Config, isDarkMode, tiers = [], showMissions = true }) => {
  const config = l6Config && Object.keys(l6Config).length > 0 ? l6Config : defaultL6Config;
  const [editingMissionIndex, setEditingMissionIndex] = useState(null);

  useEffect(() => {
    if (!l6Config || Object.keys(l6Config).length === 0) {
      setL6Config(defaultL6Config);
    }
  }, []);


  
  const set = (field, value) => {
    setL6Config((prev) => ({ ...defaultL6Config, ...prev, [field]: value }));
  };

  const addMission = () => {
    const newMission = {
      title: "New Mission",
      subtitle: "Complete to earn rewards",
      icon: "coffee",
      stampColor: "#3b82f6",
      progress: 0,
      goal: 100,
    };
    const missions = [...(config.missions || []), newMission];
    set("missions", missions);
    setEditingMissionIndex(missions.length - 1);
  };

  const updateMission = (index, field, value) => {
    const missions = [...(config.missions || [])];
    missions[index] = { ...missions[index], [field]: value };
    set("missions", missions);
  };

  const removeMission = (index) => {
    const missions = (config.missions || []).filter((_, i) => i !== index);
    set("missions", missions);
    if (editingMissionIndex === index) {
      setEditingMissionIndex(null);
    }
  };

  const inputCls = `w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${
    isDarkMode ? "border-gray-600 bg-gray-700 text-white placeholder-gray-500" : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
  }`;

  const labelCls = `block text-xs font-medium mb-1.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`;

  const Toggle = ({ field, label, description }) => (
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{label}</p>
        {description && <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={config[field] !== false}
          onChange={(e) => set(field, e.target.checked)}
          className="sr-only peer"
        />
        <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
          isDarkMode ? "bg-gray-600 peer-checked:bg-green-500" : "bg-gray-300 peer-checked:bg-green-500"
        }`} />
      </label>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Points Label */}
      <div>
        <label className={labelCls}>
          <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> Points Label</span>
        </label>
        <input
          type="text"
          value={config.pointsLabel || ""}
          onChange={(e) => set("pointsLabel", e.target.value)}
          placeholder="e.g. Magic Points"
          className={inputCls}
        />
      </div>

      {/* Greeting Section */}
      <div className={`p-3 rounded-lg space-y-3 border ${isDarkMode ? "border-gray-600 bg-gray-700/30" : "border-gray-200 bg-gray-50"}`}>
        <Toggle field="showGreeting" label="Show Greeting" description="Personalized time-based greeting" />
        {config.showGreeting !== false && (
          <div>
            <label className={labelCls}>Greeting Subtitle</label>
            <input
              type="text"
              value={config.greetingSubtitle || ""}
              onChange={(e) => set("greetingSubtitle", e.target.value)}
              placeholder="ready for your next journey?"
              className={inputCls}
            />
          </div>
        )}
      </div>

      {/* Tier System */}
      <div className={`p-3 rounded-lg border ${isDarkMode ? "border-gray-600 bg-gray-700/30" : "border-gray-200 bg-gray-50"}`}>
        <Toggle
          field="showTier"
          label={<span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 inline" /> Tier System</span>}
          description="Enable tier badge, tier label, and progress tracking"
        />
      </div>

      {/* Progress Bar — only when tier system is on and tiers exist */}
      {config.showTier !== false && tiers.length > 0 && (
        <div className={`p-3 rounded-lg border ${isDarkMode ? "border-gray-600 bg-gray-700/30" : "border-gray-200 bg-gray-50"}`}>
          <Toggle
            field="showProgress"
            label={<span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 inline" /> Progress Bar</span>}
            description="Show linear progress to next tier"
          />
        </div>
      )}

      {/* Streak Section */}
      <div className={`p-3 rounded-lg space-y-3 border ${isDarkMode ? "border-gray-600 bg-gray-700/30" : "border-gray-200 bg-gray-50"}`}>
        <Toggle
          field="showStreak"
          label={<span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 inline" /> Streak Tracker</span>}
          description="Show daily visit streak circles"
        />
        {config.showStreak !== false && (
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Streak Label</label>
              <input
                type="text"
                value={config.streakLabel || ""}
                onChange={(e) => set("streakLabel", e.target.value)}
                placeholder="Days Streak!"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Streak Subtitle</label>
              <input
                type="text"
                value={config.streakSubtitle || ""}
                onChange={(e) => set("streakSubtitle", e.target.value)}
                placeholder="You are on the right track"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Streak Goal (circles shown)</label>
              <input
                type="number"
                min={1}
                value={config.streakGoal ?? 7}
                onChange={(e) => set("streakGoal", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        )}
      </div>

      {/* Missions Section */}
      {showMissions && (
        <div className={`p-3 rounded-lg space-y-3 border ${isDarkMode ? "border-gray-600 bg-gray-700/30" : "border-gray-200 bg-gray-50"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                <span className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 inline" /> Missions
                </span>
              </p>
              <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                Add stamp-style missions for customers
              </p>
            </div>
            <button
              type="button"
              onClick={addMission}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? "bg-green-600 hover:bg-green-700" : "bg-green-500 hover:bg-green-600"
                }`}
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Mission list */}
          {config.missions && config.missions.length > 0 && (
            <div className="space-y-2 mt-3">
              {config.missions.map((mission, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${isDarkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"
                    }`}
                >
                  {editingMissionIndex === index ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={labelCls}>Title</label>
                          <input
                            type="text"
                            value={mission.title || ""}
                            onChange={(e) => updateMission(index, "title", e.target.value)}
                            placeholder="Mission Title"
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Icon</label>
                          <select
                            value={mission.icon || "coffee"}
                            onChange={(e) => updateMission(index, "icon", e.target.value)}
                            className={inputCls}
                          >
                            <option value="coffee">☕ Coffee</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Subtitle</label>
                        <input
                          type="text"
                          value={mission.subtitle || ""}
                          onChange={(e) => updateMission(index, "subtitle", e.target.value)}
                          placeholder="Mission description"
                          className={inputCls}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className={labelCls}>Color</label>
                          <input
                            type="color"
                            value={mission.stampColor || "#3b82f6"}
                            onChange={(e) => updateMission(index, "stampColor", e.target.value)}
                            className={`w-full h-10 rounded border cursor-pointer ${isDarkMode ? "border-gray-600" : "border-gray-300"
                              }`}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Progress</label>
                          <input
                            type="number"
                            min={0}
                            value={mission.progress || 0}
                            onChange={(e) => updateMission(index, "progress", parseInt(e.target.value) || 0)}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Goal</label>
                          <input
                            type="number"
                            min={1}
                            value={mission.goal || 100}
                            onChange={(e) => updateMission(index, "goal", Math.max(1, parseInt(e.target.value) || 100))}
                            className={inputCls}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => removeMission(index)}
                          className={`px-3 py-1.5 text-xs rounded transition-colors ${isDarkMode ? "bg-red-600 hover:bg-red-700 text-white" : "bg-red-500 hover:bg-red-600 text-white"
                            }`}
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingMissionIndex(null)}
                          className={`px-3 py-1.5 text-xs rounded transition-colors ${isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                            }`}
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"
                          }`}>
                          {mission.title}
                        </p>
                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}>
                          {mission.progress}/{mission.goal}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingMissionIndex(index)}
                        className={`px-3 py-1.5 text-xs rounded transition-colors ${isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                          }`}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default L6ConfigForm;
