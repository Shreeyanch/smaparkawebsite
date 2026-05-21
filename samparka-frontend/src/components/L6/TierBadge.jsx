import { Coffee } from "lucide-react";
import { useId } from "react";

// Lighten a hex color
const lightenHex = (hex, amount = 0.4) => {
  try {
    const r = Math.min(255, Math.round(parseInt(hex.slice(1, 3), 16) + (255 - parseInt(hex.slice(1, 3), 16)) * amount));
    const g = Math.min(255, Math.round(parseInt(hex.slice(3, 5), 16) + (255 - parseInt(hex.slice(3, 5), 16)) * amount));
    const b = Math.min(255, Math.round(parseInt(hex.slice(5, 7), 16) + (255 - parseInt(hex.slice(5, 7), 16)) * amount));
    return `rgb(${r},${g},${b})`;
  } catch {
    return hex;
  }
};

// Darken a hex color
const darkenHex = (hex, amount = 0.4) => {
  try {
    const r = Math.max(0, Math.round(parseInt(hex.slice(1, 3), 16) * (1 - amount)));
    const g = Math.max(0, Math.round(parseInt(hex.slice(3, 5), 16) * (1 - amount)));
    const b = Math.max(0, Math.round(parseInt(hex.slice(5, 7), 16) * (1 - amount)));
    return `rgb(${r},${g},${b})`;
  } catch {
    return hex;
  }
};

const TierBadge = ({ tierName = "Gold", textColor = "#ffffff", cardColor = "#7a2030", tierColor, size = 68, absolute = true }) => {
  const uid = useId().replace(/:/g, "");
  const baseColor = tierColor || cardColor;
  const light = lightenHex(baseColor, 0.5);
  const mid = baseColor;
  const dark = darkenHex(baseColor, 0.5);
  const darker = darkenHex(baseColor, 0.7);
  const strokeLight = lightenHex(baseColor, 0.35);

  const scale = size / 68;
  const h = Math.round(76 * scale);

  return (
    <div
      className={`${absolute ? "absolute top-4 right-3" : ""} flex flex-col items-center`}
      style={{ width: size }}
    >
      <div className="relative" style={{ width: size, height: h }}>
        <svg
          width={size}
          height={h}
          viewBox="0 0 68 76"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id={`hexRad${uid}`} cx="50%" cy="40%" r="55%" fx="50%" fy="35%">
              <stop offset="0%" stopColor={light} />
              <stop offset="40%" stopColor={mid} />
              <stop offset="75%" stopColor={dark} />
              <stop offset="100%" stopColor={darker} />
            </radialGradient>
            <linearGradient id={`f1${uid}`} x1="34" y1="38" x2="34" y2="3" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={light} stopOpacity="0.35" />
              <stop offset="100%" stopColor="white" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id={`f2${uid}`} x1="34" y1="38" x2="64" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={light} stopOpacity="0.15" />
              <stop offset="100%" stopColor={dark} stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id={`f3${uid}`} x1="34" y1="38" x2="64" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={light} stopOpacity="0.08" />
              <stop offset="100%" stopColor={darker} stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id={`f4${uid}`} x1="34" y1="38" x2="34" y2="73" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={dark} stopOpacity="0.1" />
              <stop offset="100%" stopColor={darker} stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id={`f5${uid}`} x1="34" y1="38" x2="4" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={light} stopOpacity="0.1" />
              <stop offset="100%" stopColor={darker} stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id={`f6${uid}`} x1="34" y1="38" x2="4" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={light} stopOpacity="0.25" />
              <stop offset="100%" stopColor={dark} stopOpacity="0.15" />
            </linearGradient>
            <filter id={`shd${uid}`} x="-20%" y="-10%" width="140%" height="130%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor={darker} floodOpacity="0.5" />
            </filter>
          </defs>

          <path d="M34 3L64 20V56L34 73L4 56V20L34 3Z" fill={`url(#hexRad${uid})`} filter={`url(#shd${uid})`} />
          <path d="M34 38L34 3L64 20Z" fill={`url(#f1${uid})`} />
          <path d="M34 38L64 20L64 56Z" fill={`url(#f2${uid})`} />
          <path d="M34 38L64 56L34 73Z" fill={`url(#f3${uid})`} />
          <path d="M34 38L34 73L4 56Z" fill={`url(#f4${uid})`} />
          <path d="M34 38L4 56L4 20Z" fill={`url(#f5${uid})`} />
          <path d="M34 38L4 20L34 3Z" fill={`url(#f6${uid})`} />

          <path
            d="M34 3L64 20V56L34 73L4 56V20L34 3Z"
            fill="none"
            stroke={strokeLight}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>

        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-0.5"
          style={{ paddingTop: 2 }}
        >
          <Coffee size={Math.round(18 * scale)} style={{ color: textColor, opacity: 0.9, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }} />
          <span
            className="text-center font-normal leading-tight px-1"
            style={{
              color: textColor,
              fontSize: `${Math.round(7.5 * scale)}px`,
              opacity: 0.85,
              maxWidth: Math.round(52 * scale),
              textAlign: "center",
              lineHeight: 1.2,
              textShadow: "0 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            {tierName.toLowerCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TierBadge;
