import React from "react";

const FILTER_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "custom", label: "Custom" },
];

const PERIOD_LABEL_MAP = {
  all: "All Time",
  week: "This Week",
  month: "This Month",
  custom: "Custom Range",
};

const LeaderboardFilterBar = ({
  period,
  customStart,
  customEnd,
  onPeriodChange,
  onCustomDateChange,
  isDarkMode,
}) => {
  const handleStartChange = (e) => {
    const newStart = e.target.value;
    if (customEnd && newStart > customEnd) return;
    onCustomDateChange(newStart, customEnd);
  };

  const handleEndChange = (e) => {
    const newEnd = e.target.value;
    if (customStart && newEnd < customStart) return;
    onCustomDateChange(customStart, newEnd);
  };

  const handlePeriodSelect = (e) => {
    onPeriodChange(e.target.value);
  };

  return (
    <div className="flex flex-wrap items-start gap-2">
      <div className="min-w-[180px]">
        <label
          htmlFor="leaderboard-period"
          className={`block text-[11px] mb-1 font-medium ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Date Filter
        </label>
        <select
          id="leaderboard-period"
          value={period}
          onChange={handlePeriodSelect}
          className={`w-full text-xs px-3 py-2 rounded-lg border outline-none transition-colors ${
            isDarkMode
              ? "bg-gray-800 border-gray-600 text-gray-200 focus:border-green-600"
              : "bg-white border-gray-300 text-gray-700 focus:border-green-600"
          }`}
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {period === "custom" && (
        <div
          className={`flex flex-col sm:flex-row sm:items-end gap-2 rounded-lg border p-2 ${
            isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
          }`}
        >
          <div>
            <label
              htmlFor="leaderboard-custom-start"
              className={`block text-[11px] mb-1 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Start date
            </label>
            <input
              id="leaderboard-custom-start"
              type="date"
              value={customStart}
              onChange={handleStartChange}
              className={`text-xs px-2 py-1.5 rounded border outline-none ${
                isDarkMode
                  ? "bg-gray-900 border-gray-600 text-gray-200"
                  : "bg-white border-gray-300 text-gray-700"
              }`}
            />
          </div>
          <div>
            <label
              htmlFor="leaderboard-custom-end"
              className={`block text-[11px] mb-1 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              End date
            </label>
            <input
              id="leaderboard-custom-end"
              type="date"
              value={customEnd}
              onChange={handleEndChange}
              className={`text-xs px-2 py-1.5 rounded border outline-none ${
                isDarkMode
                  ? "bg-gray-900 border-gray-600 text-gray-200"
                  : "bg-white border-gray-300 text-gray-700"
              }`}
            />
          </div>
        </div>
      )}

    
    </div>
  );
};

export default LeaderboardFilterBar;
