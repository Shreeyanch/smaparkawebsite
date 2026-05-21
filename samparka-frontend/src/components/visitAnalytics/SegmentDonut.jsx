import { useTheme } from "../../context/ThemeContext";
import { Users, Clock } from "lucide-react";
import { useState } from "react";

// Modern gradient color palette
const SEGMENT_COLORS = {
  no_visits: "#a5b4fc",
  first_visit: "#6366f1",
  second_visit: "#60a5fa",
  third_visit: "#34d399",
  fourth_visit: "#fbbf24",
  "5+_visits": "#f97316",
};

const SEGMENT_LABELS = {
  no_visits: "New Signups",
  first_visit: "1st Visit",
  second_visit: "2nd Visit",
  third_visit: "3rd Visit",
  fourth_visit: "4th Visit",
  "5+_visits": "5+ Visits",
};

const LAST_VISIT_COLORS = {
  "7": "#6366f1",
  "30": "#60a5fa",
  "60": "#34d399",
  "90": "#fbbf24",
  "120+": "#f97316",
};

const LAST_VISIT_LABELS = {
  "7": "1 Week",
  "30": "1 Month",
  "60": "2 Months",
  "90": "3 Months",
  "120+": "4 Months+",
};

// polar → cartesian. 0° = top, clockwise.
function polarToCartesian(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// Stroke-based arc path (butt caps — zero bleed).
function arcPath(cx, cy, r, startDeg, endDeg) {
  const s = polarToCartesian(cx, cy, r, startDeg);
  const e = polarToCartesian(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

// Gauge Chart Component
function GaugeChart({ data, total, totalStoreCustomers, isDarkMode, onSegmentClick, selectedKey }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const cx          = 100;
  const cy          = 108;
  const r           = 76;
  const strokeWidth = 16;
  const hw          = strokeWidth / 2;   // cap circle radius = hw

  const ARC_START   = 270;   // left  (9 o'clock)
  const ARC_END     = 450;   // right (3 o'clock) — 270+180
  const totalArcDeg = 180;

  // Pure gap in allocated degrees — NO bleed math needed with butt caps.
  // 2° ≈ 2.7 px at r=76: tight, clearly visible, never overlapping.
  const gapDeg = 2;

  const totalGapSpace  = (data.length - 1) * gapDeg;
  const availableSpace = Math.max(totalArcDeg - totalGapSpace, 1);

  const segments = data.map((item) => ({
    ...item,
    angle: total > 0 ? (item.value / total) * availableSpace : 0,
  }));

  let cursor = ARC_START;
  const segs = segments.map((seg, i) => {
    const start = cursor;
    const end   = start + seg.angle;
    cursor      = end + (i < segments.length - 1 ? gapDeg : 0);
    return { ...seg, start, end };
  });

  const maxVal  = Math.max(...data.map((d) => d.value));
  const pathLen = (deg) => (deg / 360) * (2 * Math.PI * r);

  // Minimum arc span to render as a path (otherwise dot)
  const MIN_ARC = 0.3;

  // Per-segment draw duration proportional to arc span (min 0.25s, max 0.9s)
  const totalSpan = segs.reduce((sum, s) => sum + Math.max(s.end - s.start, 0), 0);
  const TOTAL_ANIM_DURATION = 1.4; // total budget in seconds for all segments

  // Pre-compute sequential delays: each segment starts after the previous finishes
  const segDurations = segs.map((seg) => {
    const span = Math.max(seg.end - seg.start, 0);
    return totalSpan > 0
      ? Math.max((span / totalSpan) * TOTAL_ANIM_DURATION, 0.15)
      : 0.3;
  });

  const segDelays = segDurations.map((_, i) =>
    segDurations.slice(0, i).reduce((sum, d) => sum + d, 0)
  );

  return (
    <div className="relative flex flex-col items-center w-full max-w-sm">
      <style>{`
        @keyframes drawSeg {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeDot {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes subtlePulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.7; }
        }
        .gauge-seg { cursor: pointer; transition: opacity 0.18s ease; }
        .gauge-seg:hover { opacity: 0.78; }
        .gauge-seg.pulse { animation: subtlePulse 3s ease-in-out infinite; }
        .gauge-seg.sel   { filter: brightness(1.3); }
      `}</style>

      <svg viewBox="0 0 200 148" className="w-full" style={{ overflow: "visible" }}>

        {/* ── Background track ── */}
        <path
          d={arcPath(cx, cy, r, ARC_START, ARC_END)}
          stroke={isDarkMode ? "#2d3748" : "#e5e7eb"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />

        {segs.map((seg, i) => {
          const span      = seg.end - seg.start;
          const isLargest = seg.value === maxVal;
          const isSelected= seg.key === selectedKey;
          const isHovered = hoveredIndex === i;
          const cls = [
            "gauge-seg",
            isLargest && !isHovered ? "pulse" : "",
            isSelected ? "sel" : "",
          ].filter(Boolean).join(" ");

          const delay    = segDelays[i];
          const duration = segDurations[i];

          // ── Dot for tiny segments ──
          if (span < MIN_ARC) {
            const mid = polarToCartesian(cx, cy, r, (seg.start + seg.end) / 2);
            return (
              <circle key={seg.key} cx={mid.x} cy={mid.y} r={hw}
                fill={seg.color} className={cls}
                style={{ opacity: 0, animation: `fadeDot 0.2s ease-out ${delay}s forwards` }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSegmentClick?.(seg.key)}
              />
            );
          }

          const pLen = pathLen(span);

          return (
            <g key={seg.key}>
              {/* Main arc — butt caps, no bleed */}
              <path
                d={arcPath(cx, cy, r, seg.start, seg.end)}
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeLinecap="butt"
                fill="none"
                className={cls}
                style={{
                  strokeDasharray: `${pLen} ${pLen}`,
                  strokeDashoffset: pLen,
                  animation: `drawSeg ${duration}s ease-out ${delay}s forwards`,
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSegmentClick?.(seg.key)}
              />
              {/* Start cap — appears instantly when segment begins drawing */}
              <circle
                cx={polarToCartesian(cx, cy, r, seg.start).x}
                cy={polarToCartesian(cx, cy, r, seg.start).y}
                r={hw}
                fill={seg.color}
                className={cls}
                style={{
                  opacity: 0,
                  animation: `fadeDot 0.05s ease-out ${delay}s forwards`,
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSegmentClick?.(seg.key)}
              />
              {/* End cap — appears after this segment finishes drawing */}
              <circle
                cx={polarToCartesian(cx, cy, r, seg.end).x}
                cy={polarToCartesian(cx, cy, r, seg.end).y}
                r={hw}
                fill={seg.color}
                className={cls}
                style={{
                  opacity: 0,
                  animation: `fadeDot 0.05s ease-out ${delay + duration}s forwards`,
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSegmentClick?.(seg.key)}
              />
            </g>
          );
        })}
      </svg>

      {/* Center label */}
      <div
        className="absolute flex flex-col items-center justify-center pointer-events-none"
        style={{ bottom: "20%", left: "50%", transform: "translateX(-50%)" }}
      >
        <div className={`text-3xl md:text-4xl font-bold leading-none ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          {(totalStoreCustomers ?? total).toLocaleString()}
        </div>
        <div className={`text-xs md:text-xs font-medium mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          Total Customers
        </div>
      </div>
    </div>
  );
}

export default function SegmentDonut({
  segments,
  lastVisitDistribution = [],
  onSegmentClick,
  selectedSegment,
  selectedLastVisitFilters = [],
  onLastVisitFilterToggle,
  totalStoreCustomers = null,
}) {
  const { isDarkMode } = useTheme();
  const [viewMode, setViewMode] = useState("segments"); // "segments" | "lastVisit"

  // Define segment order for sorting
  const segmentOrder = {
    no_visits: 0,
    first_visit: 1,
    second_visit: 2,
    third_visit: 3,
    fourth_visit: 4,
    "5+_visits": 5,
  };

  // Prepare chart data based on view mode
  const chartData =
    viewMode === "segments"
      ? segments
          .map((seg) => ({
            name: SEGMENT_LABELS[seg.name] || seg.name,
            value: seg.count,
            color: SEGMENT_COLORS[seg.name] || "#6b7280",
            key: seg.name,
            order: segmentOrder[seg.name] || 999,
          }))
          .filter((item) => item.value > 0)
          .sort((a, b) => a.order - b.order)
      : lastVisitDistribution
          .map((item) => ({
            name: LAST_VISIT_LABELS[item.range] || item.range,
            value: item.count,
            color: LAST_VISIT_COLORS[item.range] || "#6b7280",
            key: item.range,
          }))
          .filter((item) => item.value > 0);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const handleItemClick = (key) => {
    if (viewMode === "segments") {
      onSegmentClick?.(key, viewMode);
    } else {
      onLastVisitFilterToggle?.(key, viewMode);
    }
  };

  const isItemSelected = (key) => {
    if (viewMode === "segments") {
      return selectedSegment === key;
    } else {
      return selectedLastVisitFilters.includes(key);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode("segments")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            viewMode === "segments"
              ? isDarkMode
                ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                : "bg-[#4caf50] text-white shadow-lg shadow-green-500/30"
              : isDarkMode
              ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700"
          }`}
        >
          <Users className="w-4 h-4" />
          By Visit Count
        </button>
        <button
          onClick={() => setViewMode("lastVisit")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            viewMode === "lastVisit"
              ? isDarkMode
                ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                : "bg-[#4caf50] text-white shadow-lg shadow-green-500/30"
              : isDarkMode
              ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700"
          }`}
        >
          <Clock className="w-4 h-4" />
          By Time Since Visit
        </button>
      </div>

      {/* Gauge Chart and Legend */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
        {/* Gauge Chart */}
        {chartData.length > 0 ? ( 
          <GaugeChart
            data={chartData}
            total={total}
            totalStoreCustomers={totalStoreCustomers}
            isDarkMode={isDarkMode}
            onSegmentClick={handleItemClick}
            selectedKey={viewMode === "segments" ? selectedSegment : null}
          />
        ) : (
          <div
            className={`w-full max-w-sm h-48 rounded-xl flex items-center justify-center ${
              isDarkMode ? "bg-gray-800/50" : "bg-gray-100"
            }`}
          >
            <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
              No data available
            </span>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-col gap-2 flex-1 w-full lg:w-auto">
          {chartData.map((item) => {
            const isSelected = isItemSelected(item.key);
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;

            return (
              <button
                key={item.key}
                onClick={() => handleItemClick(item.key)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? isDarkMode
                      ? "bg-green-900/40 ring-2 ring-green-500/60 shadow-lg shadow-green-500/20"
                      : "bg-green-50 ring-2 ring-green-400/60 shadow-lg shadow-green-400/20"
                    : isDarkMode
                    ? "hover:bg-gray-800/60 hover:shadow-md"
                    : "hover:bg-gray-50 hover:shadow-md"
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0 transition-transform duration-300 hover:scale-110"
                  style={{
                    backgroundColor: item.color,
                    boxShadow: `0 0 0 ${isSelected ? '4px' : '0px'} ${item.color}20`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {item.name}
                    </p>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isDarkMode ? "bg-gray-700/80 text-gray-300" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-0.5 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {item.value.toLocaleString()} {item.value === 1 ? 'customer' : 'customers'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
