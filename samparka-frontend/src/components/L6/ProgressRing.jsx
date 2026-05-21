import { useMemo } from "react";

const ProgressRing = ({ progress, goal, color, size = 60 }) => {
  const pct = Math.min(1, (Number(progress) || 0) / Math.max(1, Number(goal) || 1));
  const done = pct >= 1;
  const strokeW = 4.5;
  const r = (size - strokeW * 2) / 2;
  const circ = 2 * Math.PI * r;
  const strokeDash = circ * pct;

  const gradientId = useMemo(
    () => `ring-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  const doneColor = "#22c55e";
  const trackColor = done ? `${doneColor}18` : "#f1f5f9";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
      style={{ filter: done ? `drop-shadow(0 0 6px ${doneColor}40)` : "none" }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          {done ? (
            <>
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={`${color}cc`} />
            </>
          )}
        </linearGradient>
      </defs>

      {/* track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeW}
      />

      {/* fill arc */}
      {pct > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circ}`}
          style={{ transition: "stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1)" }}
        />
      )}
    </svg>
  );
};

export default ProgressRing;
