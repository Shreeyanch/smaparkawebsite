const LinearProgressBar = ({
  progress = 0,
  nextTierName = "Platinum",
  remainingPoints = 0,
  textColor = "#ffffff",
  progressLabel = "progress to",
  isMaxTier = false,
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div
      className="w-full mt-5 rounded-2xl px-4 py-3"
      style={{
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-light lowercase" style={{ color: textColor, opacity: 0.75 }}>
          {isMaxTier ? `${nextTierName.toLowerCase()} — max tier` : `${progressLabel} ${nextTierName.toLowerCase()}`}
        </span>
        {!isMaxTier && (
          <span className="text-xs font-light lowercase" style={{ color: textColor, opacity: 0.75 }}>
            {Number(remainingPoints).toLocaleString()} points to go
          </span>
        )}
      </div>
      {/* Track — white unfilled */}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: 8, background: "rgba(255,255,255,0.85)" }}
      >
        {/* Fill — dark/black filled section */}
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${clampedProgress}%`,
            background: "#111111",
          }}
        />
      </div>
    </div>
  );
};

export default LinearProgressBar;
