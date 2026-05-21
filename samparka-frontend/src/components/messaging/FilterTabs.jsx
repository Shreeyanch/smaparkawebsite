import { Users, Clock } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function FilterTabs({ filterType, onFilterTypeChange }) {
  const { isDarkMode } = useTheme();

  return (
    <div>
      <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
        Filter Customers By
      </h3>
      <div className="flex gap-2">
        <button
          onClick={() => onFilterTypeChange("segment")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            filterType === "segment"
              ? isDarkMode
                ? "bg-[#4caf50] text-white"
                : "bg-[#4caf50] text-white"
              : isDarkMode
              ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="font-medium">Segment</span>
        </button>
        <button
          onClick={() => onFilterTypeChange("lastVisit")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            filterType === "lastVisit"
              ? isDarkMode
                ? "bg-[#4caf50] text-white"
                : "bg-[#4caf50] text-white"
              : isDarkMode
              ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span className="font-medium">Time Since Last Visit</span>
        </button>
      </div>
    </div>
  );
}
