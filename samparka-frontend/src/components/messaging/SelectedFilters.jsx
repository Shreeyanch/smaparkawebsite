import { Check, X, AlertTriangle, UserX } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const SEGMENT_CONFIG = {
  no_visits: { label: "New Signups" },
  first_visit: { label: "1st Visit" },
  second_visit: { label: "2nd Visit" },
  third_visit: { label: "3rd Visit" },
  fourth_visit: { label: "4th Visit" },
  "5+_visits": { label: "5+ Visits" },
  at_risk: { label: "At-Risk", icon: AlertTriangle },
  churned: { label: "Churned", icon: UserX },
};

const LAST_VISIT_OPTIONS = [
  { value: "7", label: "1 Week" },
  { value: "30", label: "1 Month" },
  { value: "60", label: "2 Months" },
  { value: "90", label: "3 Months" },
  { value: "120+", label: "4 Months+" },
];

export default function SelectedFilters({ 
  selectedSegments, 
  lastVisitFilters, 
  allSegments,
  onRemoveSegment,
  onRemoveLastVisit 
}) {
  const { isDarkMode } = useTheme();

  if (selectedSegments.length === 0 && lastVisitFilters.length === 0) {
    return null;
  }

  return (
    <>
      {/* Selected Segments Display */}
      {selectedSegments.length > 0 && (
        <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
          <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            Selected Segments:
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedSegments.map((segName) => {
              const config = SEGMENT_CONFIG[segName];
              const segData = allSegments.find(s => s.name === segName);
              return (
                <span
                  key={segName}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    isDarkMode
                      ? "bg-[#4caf50] text-white"
                      : "bg-[#4caf50] text-white"
                  }`}
                >
                  <Check className="w-3 h-3" />
                  {config?.label || segName}
                  <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                    {segData?.count || 0}
                  </span>
                  <button
                    onClick={() => onRemoveSegment(segName)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Last Visit Display */}
      {lastVisitFilters.length > 0 && (
        <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
          <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            Selected Last Visit Filters:
          </h4>
          <div className="flex flex-wrap gap-2">
            {lastVisitFilters.map((filterValue) => {
              const opt = LAST_VISIT_OPTIONS.find(o => o.value === filterValue);
              if (!opt) return null;
              return (
                <span
                  key={filterValue}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    isDarkMode
                      ? "bg-[#4caf50] text-white"
                      : "bg-[#4caf50] text-white"
                  }`}
                >
                  <Check className="w-3 h-3" />
                  {opt.label}
                  <button
                    onClick={() => onRemoveLastVisit(filterValue)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
