import { Clock } from "lucide-react";

/* ── helpers ─────────────────────────────────────────────────────────────── */

const formatExpiry = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d)) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { text: "Expired", expired: true };
  if (diff === 0) return { text: "Expires today", expired: false };
  if (diff === 1) return { text: "1 day left", expired: false };
  if (diff <= 7) return { text: `${diff} days left`, expired: false };
  return { text: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), expired: false };
};

const MissionCardShell = ({
  mission,
  color,
  cardColor,
  allDone,
  statusLabel,
  onClaimReward,
  children,
}) => {
  const expiry = formatExpiry(mission.expiryDate);
  const hasBgImage = !!mission.backgroundImage;
  const hasRewardImage = !!mission.rewardImage;

  return (
    <div
      className="snap-center shrink-0 w-[295px] rounded-[26px] overflow-hidden relative flex flex-col"
      style={{
        background: hasBgImage ? "#111827" : "#f9f9f9",
        boxShadow: allDone
          ? "0 8px 22px -18px rgba(34,197,94,0.7), 0 3px 8px rgba(0,0,0,0.05)"
          : "0 10px 24px -20px rgba(17,24,39,0.45), 0 3px 8px rgba(0,0,0,0.05)",
      }}
    >
      {hasBgImage && (
        <>
          <img
            src={mission.backgroundImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)",
            }}
          />
        </>
      )}

      <div className={`flex flex-col flex-1 ${hasBgImage ? "relative z-10" : ""}`}>
        <div className="px-4 pt-4 pb-2.5 flex items-start gap-3">
          {hasRewardImage && (
            <div className="shrink-0 h-[58px] w-[58px] rounded-full bg-[#dedede] border border-[#d2d2d2] overflow-hidden flex items-center justify-center">
              <img
                src={mission.rewardImage}
                alt={mission.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="min-w-0 flex-1 pt-1">
            <p
              className={`font-semibold leading-tight break-words ${hasBgImage ? "text-white" : "text-gray-900"}`}
              style={{ fontFamily: "var(--font-poppins, Poppins, sans-serif)", fontSize: 15 }}
            >
              {mission.title}
            </p>
            {mission.subtitle && (
              <p className={`text-[12px] mt-0.5 font-medium break-words ${hasBgImage ? "text-white/70" : "text-gray-500"}`}>
                {mission.subtitle}
              </p>
            )}
          </div>
        </div>

        {!hasBgImage && (
          <div
            className="mx-4 h-[2px] rounded-full"
            style={{
              background: allDone
                ? "linear-gradient(90deg, #22c55e40, #22c55e10)"
                : `linear-gradient(90deg, ${color}30, ${color}08)`,
            }}
          />
        )}

        {children}

        {expiry && (
          <div
            className={`flex items-center gap-1.5 mx-4 mb-3 px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${
              hasBgImage
                ? expiry.expired
                  ? "bg-red-500/20 text-red-200"
                  : "bg-white/15 text-white/80"
                : expiry.expired
                  ? "bg-red-50 text-red-500"
                  : "bg-amber-50 text-amber-600"
            }`}
          >
            <Clock size={12} className="shrink-0" />
            <span>{expiry.text}</span>
          </div>
        )}

        {statusLabel && (
          <div className="px-4 pb-4 pt-1 mt-auto">
            <button
              type="button"
              onClick={() => {
                if (allDone && typeof onClaimReward === "function") {
                  onClaimReward();
                }
              }}
              disabled={!allDone || typeof onClaimReward !== "function"}
              className="h-[44px] w-full rounded-full flex items-center justify-center text-white font-semibold"
              style={{
                fontFamily: "var(--font-poppins, Poppins, sans-serif)",
                fontSize: 14,
                background: allDone
                  ? "linear-gradient(90deg, #1fa04f 0%, #18803f 100%)"
                  : cardColor || "#3b1a1a",
                boxShadow: allDone
                  ? "0 8px 16px -12px rgba(22,163,74,0.7)"
                  : "0 8px 16px -12px rgba(0,0,0,0.2)",
                cursor: allDone && typeof onClaimReward === "function" ? "pointer" : "default",
              }}
            >
              {allDone ? "Claim reward" : statusLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionCardShell;
