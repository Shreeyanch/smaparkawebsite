import { useState, useMemo, useRef, useEffect, useId } from "react";
import { TrendingUp, BarChart2, Calendar } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

// ─── grouping helpers ──────────────────────────────────────────────────────────

function groupByWeek(data) {
  const map = new Map();
  data.forEach(({ date, value }) => {
    const d = dayjs(date, ["MMM DD", "YYYY-MM-DD"]);
    const key = d.year() + "-W" + String(d.isoWeek()).padStart(2, "0");
    const label = d.startOf("isoWeek").format("MMM D");
    map.set(key, { date: label, value: (map.get(key)?.value ?? 0) + value });
  });
  return [...map.values()];
}

function groupByMonth(data) {
  const map = new Map();
  data.forEach(({ date, value }) => {
    const d = dayjs(date, ["MMM DD", "YYYY-MM-DD"]);
    const key = d.format("YYYY-MM");
    const label = d.format("MMM YYYY");
    map.set(key, { date: label, value: (map.get(key)?.value ?? 0) + value });
  });
  return [...map.values()];
}

// ─── smooth bezier path builder ───────────────────────────────────────────────

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

// ─── Summary strip ────────────────────────────────────────────────────────────

function SummaryStrip({ data, isDarkMode }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const avg = data.length > 0 ? Math.round(total / data.length) : 0;
  const peak = data.reduce((best, d) => (d.value > (best?.value ?? -1) ? d : best), null);

  const pills = [
    { label: "Total Visits", value: total.toLocaleString(), icon: TrendingUp, color: "#4caf50" },
    { label: "Peak Day", value: peak ? `${peak.value.toLocaleString()} · ${peak.date}` : "—", icon: BarChart2, color: "#60a5fa" },
    { label: "Avg / Period", value: avg.toLocaleString(), icon: Calendar, color: "#fbbf24" },
  ];

  return (
    <div className="flex flex-col gap-2 w-full">
      {pills.map(({ label, value, color }) => (
        <div
          key={label}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            isDarkMode
              ? "hover:bg-gray-800/60 hover:shadow-md"
              : "hover:bg-gray-50 hover:shadow-md"
          }`}
        >
          <div
            className="w-4 h-4 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className={`text-sm font-semibold truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {label}
              </p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isDarkMode ? "bg-gray-700/80 text-gray-300" : "bg-gray-200 text-gray-700"
              }`}>
                {value}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SVG line chart ───────────────────────────────────────────────────────────

function TrendSVG({ data, isDarkMode, color, animKey }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const svgRef = useRef(null);
  const gradId = useId().replace(/:/g, "");

  const W = 400;
  const H = 180;
  const ml = 44, mr = 12, mt = 12, mb = 36;
  const cw = W - ml - mr;
  const ch = H - mt - mb;

  const values = data.map((d) => d.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;
  const pad = range * 0.12;

  const xScale = (i) => ml + (i / Math.max(data.length - 1, 1)) * cw;
  const yScale = (v) => mt + ch - ((v - minV + pad) / (range + 2 * pad)) * ch;

  const points = data.map((d, i) => ({ x: xScale(i), y: yScale(d.value) }));
  const linePath = buildSmoothPath(points);

  // area: close to bottom
  const areaPath =
    data.length > 0
      ? `${linePath} L ${xScale(data.length - 1)} ${mt + ch} L ${xScale(0)} ${mt + ch} Z`
      : "";

  // approximate path length for stroke-dasharray animation
  // good enough estimate: sum of straight-line segment lengths
  const pathLen = points.reduce((sum, p, i) => {
    if (i === 0) return sum;
    const prev = points[i - 1];
    return sum + Math.hypot(p.x - prev.x, p.y - prev.y);
  }, 0) * 1.12; // ×1.12 to account for bezier overshoot

  // x-axis tick labels (max 6)
  const maxTicks = Math.min(6, data.length);
  const step = Math.max(1, Math.floor(data.length / maxTicks));
  const ticks = data.reduce((acc, d, i) => {
    if (i % step === 0) acc.push({ i, label: d.date });
    return acc;
  }, []);

  // y-axis grid & labels (5 lines)
  const yGrid = Array.from({ length: 5 }, (_, i) => {
    const v = minV + (i / 4) * range;
    return { y: yScale(v), label: Math.round(v).toLocaleString() };
  });

  const gridColor = isDarkMode ? "#374151" : "#f1f5f9";
  const labelColor = isDarkMode ? "#9ca3af" : "#6b7280";
  const bgColor = isDarkMode ? "#111827" : "#ffffff";

  const hPoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="relative w-full" style={{ aspectRatio: `${W}/${H}` }}>
      <style>{`
        @keyframes drawTrendLine {
          from { stroke-dashoffset: ${pathLen}; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes fadeInArea {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .trend-line-${gradId} {
          stroke-dasharray: ${pathLen};
          stroke-dashoffset: ${pathLen};
          animation: drawTrendLine 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s forwards;
        }
        .trend-area-${gradId} {
          opacity: 0;
          animation: fadeInArea 0.6s ease-out 0.5s forwards;
        }
      `}</style>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full"
        style={{ overflow: "visible" }}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <defs>
          <linearGradient id={`trendGrad-${gradId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
          <clipPath id={`trendClip-${gradId}`}>
            <rect x={ml} y={mt} width={cw} height={ch} />
          </clipPath>
        </defs>

        {/* y-grid lines */}
        {yGrid.map(({ y, label }, i) => (
          <g key={i}>
            <line x1={ml} y1={y} x2={ml + cw} y2={y} stroke={gridColor} strokeWidth="1" />
            <text x={ml - 8} y={y} textAnchor="end" dominantBaseline="middle"
              fontSize="10" fill={labelColor} fontFamily="system-ui, sans-serif">
              {label}
            </text>
          </g>
        ))}

        {/* area fill */}
        {areaPath && (
          <path
            d={areaPath}
            fill={`url(#trendGrad-${gradId})`}
            clipPath={`url(#trendClip-${gradId})`}
            className={`trend-area-${gradId}`}
          />
        )}

        {/* animated line */}
        {linePath && (
          <path
            key={animKey}
            d={linePath}
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            clipPath={`url(#trendClip-${gradId})`}
            className={`trend-line-${gradId}`}
          />
        )}

        {/* hover vertical rule */}
        {hPoint && (
          <line
            x1={hPoint.x} y1={mt}
            x2={hPoint.x} y2={mt + ch}
            stroke={color}
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.4"
            pointerEvents="none"
          />
        )}

        {/* invisible hit targets per data point */}
        {points.map((p, i) => (
          <rect
            key={i}
            x={i === 0 ? ml : (points[i - 1].x + p.x) / 2}
            y={mt}
            width={
              i === 0
                ? (points[1]?.x ?? p.x + 10 - ml) / 2
                : i === points.length - 1
                ? ml + cw - (points[i - 1].x + p.x) / 2
                : ((points[i + 1]?.x ?? p.x) - (points[i - 1]?.x ?? p.x)) / 2
            }
            height={ch}
            fill="transparent"
            onMouseEnter={() => setHoveredIdx(i)}
          />
        ))}

        {/* hover dot */}
        {hPoint && (
          <g pointerEvents="none">
            <circle cx={hPoint.x} cy={hPoint.y} r="6" fill={color} opacity="0.2" />
            <circle cx={hPoint.x} cy={hPoint.y} r="4"
              fill={bgColor} stroke={color} strokeWidth="2.5" />
          </g>
        )}

        {/* x-axis tick labels */}
        {ticks.map(({ i, label }) => (
          <text
            key={i}
            x={xScale(i)}
            y={mt + ch + 18}
            textAnchor="middle"
            fontSize="10"
            fill={labelColor}
            fontFamily="system-ui, sans-serif"
          >
            {label}
          </text>
        ))}
      </svg>

      {/* Floating tooltip */}
      {hoveredIdx !== null && hPoint && (
        <div
          className={`absolute z-20 pointer-events-none px-3 py-2 rounded-lg border shadow-lg text-sm transition-none ${
            isDarkMode
              ? "bg-gray-800 border-gray-700 text-white"
              : "bg-white border-gray-200 text-gray-900"
          }`}
          style={{
            left: `${(hPoint.x / W) * 100}%`,
            top: `${(hPoint.y / H) * 100}%`,
            transform: hPoint.x / W > 0.65
              ? "translate(-110%, -120%)"
              : "translate(10%, -120%)",
          }}
        >
          <div className="font-semibold text-xs mb-0.5">{data[hoveredIdx].date}</div>
          <div className={`text-xs font-bold`} style={{ color }}>
            {data[hoveredIdx].value.toLocaleString()} visits
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

const TOGGLE_MODES = [
  { key: "daily",   label: "Daily",   icon: TrendingUp },
  { key: "weekly",  label: "Weekly",  icon: BarChart2 },
  { key: "monthly", label: "Monthly", icon: Calendar },
];

export default function VisitTrendChart({ data = [], color = "#4caf50" }) {
  const { isDarkMode } = useTheme();
  const [mode, setMode] = useState("daily");
  // animKey changes whenever mode or data changes → forces SVG re-mount → re-triggers animation
  const [animKey, setAnimKey] = useState(0);

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (mode === "weekly") return groupByWeek(data);
    if (mode === "monthly") return groupByMonth(data);
    return data;
  }, [data, mode]);

  // Re-trigger animation on mode or data change
  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [mode, data]);

  const hasData = processedData.length > 0;

  return (
    <div className="space-y-4">
      {/* ── Toggle row (mirrors SegmentDonut tabs) ── */}
      {/* <div className="flex gap-2">
        {TOGGLE_MODES.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === key
                ? isDarkMode
                  ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                  : "bg-[#4caf50] text-white shadow-lg shadow-green-500/30"
                : isDarkMode
                ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div> */}

      {/* ── Chart + Summary (mirrors Gauge + Legend layout) ── */}
      <div className="flex flex-col  items-start gap-6">
        {/* SVG chart */}
        <div className="w-full lg:flex-1 min-w-0">
          {hasData ? (
            <TrendSVG
              key={animKey}
              data={processedData}
              isDarkMode={isDarkMode}
              color={color}
              animKey={animKey}
            />
          ) : (
            <div className={`flex items-center justify-center rounded-xl ${
              isDarkMode ? "bg-gray-800/50" : "bg-gray-100"
            }`} style={{ height: 180 }}>
              <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                No trend data available
              </span>
            </div>
          )}
        </div>

        {/* Summary strip (mirrors legend column) */}
        {/* {hasData && (
          <div className="flex flex-col gap-2 lg:w-56 w-full shrink-0">
            <SummaryStrip data={processedData} isDarkMode={isDarkMode} />
          </div>
        )} */}
      </div>
    </div>
  );
}
