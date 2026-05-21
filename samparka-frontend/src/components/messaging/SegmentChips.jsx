import { Check, AlertTriangle, UserX } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const SEGMENT_CONFIG = {
  no_visits: { label: "New Signups" },
  first_visit: { label: "1st Visit" },
  second_visit: { label: "2nd Visit" },
  third_visit: { label: "3rd Visit" },
  fourth_visit: { label: "4th Visit" },
  "5+_visits": { label: "5+ Visits" },
  at_risk: { label: "At-Risk", icon: AlertTriangle },
};

const getSegmentStyles = (isDarkMode, isSelected) => {
  if (isSelected) {
    return isDarkMode
      ? "bg-[#4caf50] text-white border-[#4caf50]"
      : "bg-[#4caf50] text-white border-[#4caf50]";
  }
  return isDarkMode
    ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50";
};

export default function SegmentChips({ segments, selectedSegments, onSegmentToggle }) {
  const { isDarkMode } = useTheme();

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {segments.map((seg) => {
          const isSelected = selectedSegments.includes(seg.name);
          const config = SEGMENT_CONFIG[seg.name];
          const Icon = config?.icon;

          return (
            <button
              key={seg.name}
              onClick={() => onSegmentToggle(seg.name)}
              disabled={seg.count === 0}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getSegmentStyles(
                isDarkMode,
                isSelected
              )}`}
            >
              {isSelected && <Check className="w-4 h-4" />}
              {Icon && !isSelected && <Icon className="w-4 h-4" />}
              <span className="font-medium">{config?.label || seg.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                isSelected
                  ? "bg-white/20"
                  : isDarkMode
                  ? "bg-white/10"
                  : "bg-black/10"
              }`}>
                {seg.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
