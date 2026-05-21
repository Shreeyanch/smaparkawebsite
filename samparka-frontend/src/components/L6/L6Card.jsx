import { ChevronLeft } from "lucide-react";
import QRCode from "react-qr-code";
import GreetingSection from "./GreetingSection";
import TierBadge from "./TierBadge";
import PointsDisplay from "./PointsDisplay";
import LinearProgressBar from "./LinearProgressBar";
import StreakTracker from "./StreakTracker";

const hexToRgba = (hex, alpha = 0.5) => {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch {
    return `rgba(0,0,0,${alpha})`;
  }
};

// Darken a hex color by a percentage (0–1)
const darkenHex = (hex, amount = 0.25) => {
  try {
    const r = Math.max(0, Math.round(parseInt(hex.slice(1, 3), 16) * (1 - amount)));
    const g = Math.max(0, Math.round(parseInt(hex.slice(3, 5), 16) * (1 - amount)));
    const b = Math.max(0, Math.round(parseInt(hex.slice(5, 7), 16) * (1 - amount)));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  } catch {
    return hex;
  }
};

// Abstract peacock / floral line-art watermark
const CardWatermark = ({ textColor }) => (
  <svg
    className="absolute pointer-events-none select-none"
    style={{ bottom: "4%", right: "-12%", width: "72%", height: "72%", opacity: 0.07 }}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer concentric circles */}
    <circle cx="100" cy="100" r="96" stroke={textColor} strokeWidth="1.2" />
    <circle cx="100" cy="100" r="78" stroke={textColor} strokeWidth="0.8" />
    <circle cx="100" cy="100" r="58" stroke={textColor} strokeWidth="0.8" />
    <circle cx="100" cy="100" r="38" stroke={textColor} strokeWidth="0.8" />
    {/* Petal / feather shapes — 8 directions */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
      <ellipse
        key={i}
        cx="100"
        cy="100"
        rx="14"
        ry="55"
        stroke={textColor}
        strokeWidth="0.7"
        fill="none"
        transform={`rotate(${angle} 100 100)`}
      />
    ))}
    {/* Inner teardrop / peacock eye accents */}
    {[0, 60, 120, 180, 240, 300].map((angle, i) => (
      <ellipse
        key={`inner-${i}`}
        cx="100"
        cy="55"
        rx="6"
        ry="18"
        stroke={textColor}
        strokeWidth="0.6"
        fill="none"
        transform={`rotate(${angle} 100 100)`}
      />
    ))}
    <circle cx="100" cy="100" r="12" stroke={textColor} strokeWidth="1" />
  </svg>
);

const L6Card = ({
  cardColor = "#7a2030",
  textColor = "#ffffff",
  cardImage = null,
  points = 0,
  tier = [],
  customerTier = "",
  customerName = "Guest",
  visitStreak = 0,
  streakRewards = [],
  onRewardIconClick = null,
  l6Config = {},
  showQR = false,
  setShowQR,
  customerId,
  storeUrl,
}) => {
  const {
    pointsLabel = "Magic Points",
    greetingSubtitle = "ready for your next journey?",
    showGreeting = true,
    showTier = true,
    showStreak = true,
    streakLabel = "Days Streak!",
    streakSubtitle = "You are on the right track",
    streakGoal = 7,
    showProgress = true,
  } = l6Config;

  // Tier / progress calculations — fallback to first tier if customer has no tier yet
  const tiers = Array.isArray(tier) ? tier : [];
  let currentTierIndex = tiers.findIndex((t) => t.name === customerTier);
  if (currentTierIndex < 0 && tiers.length > 0) currentTierIndex = 0;
  const nextTier = currentTierIndex >= 0 ? tiers[currentTierIndex + 1] : null;
  const currentTierObj = currentTierIndex >= 0 ? tiers[currentTierIndex] : null;
  const isMaxTier = currentTierIndex >= 0 && !nextTier && tiers.length > 0;

  const progress = (() => {
    if (isMaxTier) return 100;
    if (!currentTierObj || !nextTier) return 0;
    const { minPoints = 0, maxPoints = 100 } = currentTierObj;
    if (points >= maxPoints) return 100;
    return ((points - minPoints) / (maxPoints - minPoints)) * 100;
  })();

  const remainingPoints = nextTier
    ? Math.max(0, (nextTier.minPoints || 0) - points)
    : 0;

  const darkColor = darkenHex(cardColor, 0.3);

  return (
    <div
      style={{
        background: cardImage
          ? `url(${cardImage}) center/cover`
          : `linear-gradient(165deg, ${cardColor} 0%, ${darkColor} 100%)`,
        boxShadow: `4px 16px 60px ${hexToRgba(cardColor, 0.65)}`,
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "24px",
      }}
      className="w-[336px] flex flex-col py-6 px-5 relative overflow-hidden font-satoshi"
    >
      {/* Abstract watermark */}
      {/* <CardWatermark textColor={textColor} /> */}

      {showQR ? (
        <div className="flex flex-col items-center justify-center min-h-[380px] w-full relative z-10">
          <div className="flex items-center justify-start w-full gap-3 pb-4">
            <ChevronLeft
              className="hover:opacity-70 cursor-pointer transition-opacity"
              style={{ color: textColor }}
              onClick={() => setShowQR(false)}
            />
            <span className="text-sm font-normal" style={{ color: textColor }}>Back</span>
          </div>
          <p className="text-lg font-semibold mb-5" style={{ color: textColor }}>Your QR Code</p>
          <div className="bg-white p-4 rounded-2xl shadow-2xl">
            <QRCode
              value={`${window.location.origin}/${storeUrl}/getpoints?customer=${customerId}`}
              size={190}
              level="H"
              fgColor="#1c1917"
            />
          </div>
          <p
            className="mt-5 text-[10px] font-medium tracking-widest uppercase"
            style={{ color: textColor, opacity: 0.5 }}
          >
            SCAN TO EARN POINTS
          </p>
        </div>
      ) : (
        <div className="relative z-10">
          {/* Hexagonal tier badge — top-right */}
          {showTier && (
            <TierBadge
              tierName={customerTier || "Member"}
              textColor={textColor}
              cardColor={cardColor}
              tierColor={currentTierObj?.color}
            />
          )}

          {/* Greeting */}
          {showGreeting && (
            <GreetingSection
              customerName={customerName}
              subtitle={greetingSubtitle}
              textColor={textColor}
            />
          )}

          {/* Large points number + tier label */}
          <PointsDisplay
            points={points}
            tierName={showTier && customerTier ? `${customerTier} Tier` : ""}
            pointsLabel={pointsLabel}
            textColor={textColor}
          />

          {/* Glassmorphism progress bar */}
          {showProgress && showTier && (nextTier || isMaxTier) && (
            <LinearProgressBar
              progress={progress}
              nextTierName={isMaxTier ? currentTierObj?.name : nextTier.name}
              remainingPoints={remainingPoints}
              textColor={textColor}
              isMaxTier={isMaxTier}
            />
          )}

          {/* Streak tracker with floating target icon */}
          {showStreak && (
            <StreakTracker
              currentStreak={visitStreak}
              streakGoal={streakGoal}
              streakLabel={streakLabel}
              streakSubtitle={streakSubtitle}
              textColor={textColor}
              streakRewards={streakRewards}
              onRewardIconClick={onRewardIconClick}
            />
          )}

          <div className="h-2" />
        </div>
      )}
    </div>
  );
};

export default L6Card;
