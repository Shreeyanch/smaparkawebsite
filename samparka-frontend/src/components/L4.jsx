import { useState } from "react";
import QRCode from "react-qr-code";
import { useStoreAuth } from "../context/StoreAuthContext";
import QrScanner from "react-qr-scanner";
import { ChevronLeft, Coffee, Smile, Sparkles, Star, ThumbsUp } from "lucide-react";

const L4 = ({
  format = "L4",
  points = 39,
  customerTier = "Bronze",
  cardColor = "#016e49",
  textColor = "#fff",
  stamp = "coffee",
  tier = [],
  customStamp = null,
  cardImage = null,
  showQR,
  setShowQR,
}) => {
  const [scan, setScan] = useState(true);
  const { authState } = useStoreAuth();
  const { userInfo: user } = authState;

  if (Array.isArray(tier) && tier.length === 0) {
    tier = [{ name: "Bronze", minPoints: 0, maxPoints: 100, discountPercentage: 5 }];
  }

  // Use customerTier from DB as the source of truth (set by admin or auto-upgrade).
  // Fall back to points-based lookup only when customerTier is missing.
  const currentTierIndex = customerTier
    ? tier.findIndex((t) => t.name === customerTier)
    : tier.findIndex((t) => points >= t.minPoints && points <= t.maxPoints);
  const currentTier = tier[currentTierIndex !== -1 ? currentTierIndex : 0] || tier[0];
  const nextTier = tier[currentTierIndex + 1];

  // Per-tier overrides — fall back to global card values
  const effectiveCardColor = currentTier?.cardColor || cardColor;
  const effectiveTextColor = currentTier?.textColor || textColor;
  const effectiveCustomStamp = currentTier?.customStamp || customStamp;
  const effectiveCardImage = currentTier?.cardImage || cardImage;

  // Tier level: 0 = lowest, capped at 3 for design purposes
  const tierLevel = Math.min(currentTierIndex >= 0 ? currentTierIndex : 0, 3);

  const calculateProgress = (pts, tiers) => {
    const ct = tiers.find((t) => pts >= t.minPoints && pts <= t.maxPoints);
    if (!ct) return 0;
    const { minPoints = 0, maxPoints = 100 } = ct;
    if (pts < minPoints) return 0;
    if (pts >= maxPoints) return 100;
    return ((pts - minPoints) / (maxPoints - minPoints)) * 100;
  };

  const progress = calculateProgress(points, tier);
  const progressAngle = (progress / 100) * 360;

  const hexToRgba = (hex, alpha = 0.4) => {
    try {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch {
      return `rgba(0, 0, 0, ${alpha})`;
    }
  };

  const stampIcons = {
    coffee: <Coffee className="w-12 h-12" style={{ color: effectiveTextColor }} />,
    smile: <Smile className="w-12 h-12" style={{ color: effectiveTextColor }} />,
    thumbsUp: <ThumbsUp className="w-12 h-12" style={{ color: effectiveTextColor }} />,
  };

  const handleScan = (data) => {
    if (data) {
      try {
        const url = data.text;
        if (!url.startsWith(window.location.origin)) {
          alert("Invalid QR Code");
          return;
        }
        window.location.replace(url);
      } catch (error) {
        console.error("Invalid QR Code format", error);
        alert("Invalid QR Code format");
      }
    }
  };

  const handleError = (err) => console.error(err);

  return (
    <div
      style={{
        backgroundColor: effectiveCardColor,
        backgroundImage: effectiveCardImage ? `url(${effectiveCardImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: `0 20px 55px ${hexToRgba(effectiveCardColor, 0.5)}`,
      }}
      className="rounded-3xl w-[240px] h-[360px] flex flex-col items-center justify-start py-4 px-3 gap-3 relative overflow-hidden"
    >
      {showQR ? (
        /* ── QR / Scan view ── */
        <div className="flex flex-col items-center justify-center h-full w-full">
          <div className="flex items-center justify-start w-full gap-4 pb-2">
            <ChevronLeft
              className="cursor-pointer"
              style={{ color: effectiveTextColor }}
              onClick={() => setShowQR((prev) => !prev)}
            />
            <div className="rounded-lg bg-white/10 flex flex-row items-center justify-center p-[3px]">
              <button
                className={`w-[80px] h-[24px] flex items-center justify-center cursor-pointer rounded-md transition-all text-xs font-medium ${
                  scan ? "bg-white/90 text-gray-800 shadow" : "text-white/70"
                }`}
                onClick={() => setScan(true)}
              >
                Scan
              </button>
              <button
                className={`w-[80px] h-[24px] flex items-center justify-center cursor-pointer rounded-md transition-all text-xs font-medium ${
                  !scan ? "bg-white/90 text-gray-800 shadow" : "text-white/70"
                }`}
                onClick={() => setScan(false)}
              >
                Share
              </button>
            </div>
          </div>

          {showQR && scan ? (
            <div className="mt-3">
              <div className="relative w-52 h-52 flex items-center justify-center">
                <div className="absolute w-52 h-52">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white" />
                </div>
                <div className="relative w-48 h-48 bg-black rounded-md overflow-hidden">
                  <QrScanner
                    onScan={handleScan}
                    onError={handleError}
                    constraints={{ video: { facingMode: "environment" } }}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <p className="text-base font-bold" style={{ color: effectiveTextColor }}>Your QR Code</p>
              <div className="w-48 h-48 bg-white flex items-center justify-center rounded-xl p-2">
                <QRCode
                  value={JSON.stringify({ id: user._id, name: user.name, phone: user.phone })}
                  className="w-full h-full"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── Main card view ── */
        <>
          {/* Tier-level shine / shimmer effect */}
          {tierLevel >= 3 ? (
            /* Animated shimmer for highest tier */
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 pointer-events-none l4-shimmer" />
          ) : tierLevel >= 1 ? (
            /* Enhanced gradient for mid tiers */
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-transparent to-black/[0.10] pointer-events-none" />
          ) : (
            /* Subtle shine for base tier */
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-black/[0.06] pointer-events-none" />
          )}

          {/* Tier badge — shown for tier level 2+ */}
          {tierLevel >= 2 && (
            <div className="absolute top-2.5 right-3 z-20 flex items-center gap-0.5">
              {tierLevel >= 3 ? (
                <Star className="w-4 h-4 fill-current text-yellow-400" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" style={{ color: effectiveTextColor, opacity: 0.85 }} />
              )}
            </div>
          )}

          {/* ① Tier + discount banner */}
          <div
            className="w-full rounded-2xl px-4 py-3 flex flex-col gap-0.5 relative z-10"
            style={{
              border: `1.5px solid ${effectiveTextColor}${tierLevel >= 2 ? "40" : "28"}`,
              background: `${effectiveTextColor}${tierLevel >= 1 ? "14" : "0D"}`,
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="flex items-center gap-1.5">
              {tierLevel >= 3 && (
                <Star className="w-3 h-3 fill-current text-yellow-400 flex-shrink-0" />
              )}
              <span
                className="text-sm font-bold tracking-tight leading-snug"
                style={{ color: effectiveTextColor }}
              >
                {currentTier?.name || customerTier} Member
              </span>
            </div>
            <span
              className="text-xs leading-snug"
              style={{ color: effectiveTextColor, opacity: 0.75 }}
            >
              {currentTier?.discountPercentage || 0}% discount available
            </span>
          </div>

          {/* ② Circle + points box */}
          <div
            className="flex-1 w-full rounded-2xl flex flex-col items-center justify-center gap-2 relative z-10"
            style={{
              border: `1.5px solid ${effectiveTextColor}20`,
              background: `${effectiveTextColor}0A`,
            }}
          >
            {/* Circular progress */}
            <div className="relative flex items-center justify-center w-[150px] h-[150px]">
              <svg
                className="rotate-[-90deg]"
                width="150"
                height="150"
                viewBox="0 0 120 120"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Track */}
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke={`${effectiveTextColor}1A`}
                  strokeWidth="7"
                />
                {/* Progress */}
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke={effectiveTextColor}
                  strokeWidth="7"
                  strokeDasharray="314.159"
                  strokeDashoffset={314.159 - (progressAngle / 360) * 314.159}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.9s ease-out" }}
                />
              </svg>
              {/* Stamp icon in center — per-tier overrides global */}
              <div className="absolute">
                {effectiveCustomStamp ? (
                  <img className="w-12 h-12 object-contain" alt="Stamp" src={effectiveCustomStamp} />
                ) : (
                  stampIcons[currentTier?.stamp || stamp] || stampIcons.coffee
                )}
              </div>
            </div>

            {/* Points label */}
            <div className="flex flex-col items-center pb-2">
              <div className="flex items-baseline gap-1">
                <span
                  className="text-3xl font-black leading-none"
                  style={{ color: effectiveTextColor }}
                >
                  {points}
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: effectiveTextColor, opacity: 0.7 }}
                >
                  pts
                </span>
              </div>
              {nextTier && (
                <span
                  className="text-[10px] mt-1"
                  style={{ color: effectiveTextColor, opacity: 0.55 }}
                >
                  {nextTier.minPoints - points} more to {nextTier.name}
                </span>
              )}
            </div>
          </div>

          {/* Shimmer animation style */}
          <style>{`
            @keyframes l4shimmer {
              0% { transform: translateX(-100%) skewX(-12deg); }
              100% { transform: translateX(200%) skewX(-12deg); }
            }
            .l4-shimmer {
              animation: l4shimmer 3s ease-in-out infinite;
            }
          `}</style>
        </>
      )}
    </div>
  );
};

export default L4;
