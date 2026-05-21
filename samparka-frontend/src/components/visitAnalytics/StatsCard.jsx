import { useState, useMemo, useId } from "react";
import { useTheme } from "../../context/ThemeContext";
import { AlertCircle } from "lucide-react";

// Smooth bezier path builder for micro chart
function buildSmoothPath(points) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cp1x = prev.x + (curr.x - prev.x) * 0.33;
    const cp2x = prev.x + (curr.x - prev.x) * 0.66;
    d += ` C ${cp1x} ${prev.y} ${cp2x} ${curr.y} ${curr.x} ${curr.y}`;
  }
  return d;
}

// Micro Line Chart Component
function MicroLineChart({ data, color, isDarkMode }) {
  const gradId = useId().replace(/:/g, "");

  if (!data || data.length === 0) {
    return (
      <div className={`h-16  flex items-center justify-center text-xs ${
        isDarkMode ? "text-gray-600" : "text-gray-400"
      }`}>
        No data
      </div>
    );
  }

  const values = data.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const width = 200;
  const height = 40;
  const padding = 4;

  const points = data.map((d, i) => ({
    x: padding + (i / Math.max(data.length - 1, 1)) * (width - 2 * padding),
    y: height - padding - ((d.value - minVal) / range) * (height - 2 * padding)
  }));

  const linePath = buildSmoothPath(points);
  const areaPath = linePath + ` L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div className="w-full mt-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-16"
        style={{ opacity: 0, animation: "fadeIn 0.6s ease-out 0.2s forwards" }}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <path
          d={areaPath}
          fill={`url(#${gradId})`}
        />

        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function StatsCard({
  title,
  value,
  info,
  icon: Icon,
  trend,
  color = "default",
  chartData,
  showChart = false
}) {
  const { isDarkMode } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);

  // Color variants for the value text
  const valueColors = {
    default: isDarkMode ? "text-white" : "text-gray-900",
    blue: isDarkMode ? "text-blue-400" : "text-blue-600",
    green: isDarkMode ? "text-green-400" : "text-green-600",
    purple: isDarkMode ? "text-purple-400" : "text-purple-600",
    orange: isDarkMode ? "text-pink-400" : "text-pink-600",
    indigo: isDarkMode ? "text-indigo-400" : "text-indigo-600",
    teal: isDarkMode ? "text-teal-400" : "text-teal-600",
  };

  // Chart color variants (hex values for SVG)
  const chartColors = {
    default: isDarkMode ? "#ffffff" : "#111827",
    blue: isDarkMode ? "#60a5fa" : "#2563eb",
    green: isDarkMode ? "#4ade80" : "#16a34a",
    purple: isDarkMode ? "#c084fc" : "#9333ea",
    orange: isDarkMode ? "#f472b6" : "#ec4899",
    indigo: isDarkMode ? "#818cf8" : "#4f46e5",
    teal: isDarkMode ? "#2dd4bf" : "#0d9488",
  };

  const valueColor = valueColors[color] || valueColors.default;
  const chartColor = chartColors[color] || chartColors.default;

  return (
    <div className={`p-4 sm:p-6 rounded-xl border h-full ${
      isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
    }`}>
      <div className="flex items-center justify-between ">
        <div className="flex">

          <div>

          <div className="flex  border-l-blue-500 items-center gap-2 mb-2">
            <p className={`text-sm font-medium ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}>{title}</p>
            {info && (
              <div className="relative border2">
                <button
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip(!showTooltip)}
                  className={`${
                    isDarkMode ? "text-gray-500 hover:text-gray-400" : "text-gray-400 hover:text-gray-600"
                  } transition-colors`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                </button>
                {showTooltip && (
                  <>
                    <div
                      className={`absolute z-50 left-0 top-6 w-56 p-3 rounded-lg shadow-lg border text-xs leading-relaxed ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700 text-gray-300"
                          : "bg-white border-gray-200 text-gray-600"
                      }`}
                    >
                      {info}
                    </div>
                    <div
                      className="fixed inset-0 z-40 lg:hidden"
                      onClick={() => setShowTooltip(false)}
                    />
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex items-end gap-2 ">
            <p className={`text-2xl sm:text-3xl font-bold ${valueColor}`}>
              {value}
            </p>
            {trend && (
              <span className={`text-xs font-medium mb-1 ${
                trend > 0 ? "text-green-600" : trend < 0 ? "text-red-500" : "text-gray-500"
              }`}>
                {trend > 0 ? "+" : ""}{trend}%
              </span>
            )}
          </div>
          </div>

          {/* Render micro chart if showChart is true and chartData is provided */}
          {showChart && chartData && (
            <MicroLineChart
              data={chartData}
              color={chartColor}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      </div>
    </div>
  );
}
