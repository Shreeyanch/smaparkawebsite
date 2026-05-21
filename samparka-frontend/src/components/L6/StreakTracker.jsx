// 3D-style bullseye target icon (floating above the streak card)
// const TargetIcon = () => (
//   <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
//     {/* Shadow / depth ring */}
//     <circle cx="25" cy="26" r="23" fill="rgba(0,0,0,0.15)" />
//     {/* Outer ring - dark red */}
//     <circle cx="25" cy="25" r="23" fill="#c0392b" />
//     {/* Second ring - white */}
//     <circle cx="25" cy="25" r="18" fill="white" />
//     {/* Third ring - red */}
//     <circle cx="25" cy="25" r="13" fill="#e74c3c" />
//     {/* Fourth ring - white */}
//     <circle cx="25" cy="25" r="7.5" fill="white" />
//     {/* Center dot */}
//     <circle cx="25" cy="25" r="3" fill="#c0392b" />
//     {/* Arrow shaft */}
//     <line x1="35" y1="15" x2="27.5" y2="22.5" stroke="#2c3e50" strokeWidth="2.2" strokeLinecap="round" />
//     {/* Arrowhead */}
//     <polygon points="38,10 33,14.5 38,18" fill="#2c3e50" />
//     {/* Subtle green accent ring */}
//     <circle cx="25" cy="25" r="23" fill="none" stroke="#27ae60" strokeWidth="1.2" strokeOpacity="0.4" />
//   </svg>
//   <img className="h-24" src="/images/Arrow.png" alt="" />

// );

const StreakTracker = ({
  currentStreak = 0,
  streakGoal = 7,
  streakLabel = "Days Streak!",
  streakSubtitle = "You are on the right track",
  textColor = "#ffffff",
  // Array of { streakGoal: number, streakIcon: string } for each streak reward that has an icon
  streakRewards = [],
  onRewardIconClick = null,
}) => {
  const circles = Array.from({ length: streakGoal }, (_, i) => i + 1);
  // Build a lookup map: day → icon
  const iconByDay = {};
  for (const r of streakRewards) {
    if (r.streakGoal && r.streakIcon) iconByDay[r.streakGoal] = r.streakIcon;
  }

  return (
    <div className="w-full mt-8">
      {/* Streak card — glassmorphism */}
      <div
        className="w-full rounded-2xl pt-8 pb-4 px-4 relative"
        style={{
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        {/* Image centered on top border */}
        <div className="absolute left-1/2 -top-12" style={{ transform: "translateX(-50%)" }}>
          <img className="h-24" src="/images/Arrow.png" alt="" />
        </div>
        {/* Title */}
        <p
          className="text-center font-bold"
          style={{ color: textColor, fontSize: "17px" }}
        >
          {currentStreak} {streakLabel} 🎉
        </p>

        {/* Subtitle */}
        <p
          className="text-center text-sm mt-1 mb-4 font-light"
          style={{ color: textColor, opacity: 0.6 }}
        >
          {streakSubtitle}
        </p>

        {/* Day circles */}
        <div
          className={`flex items-center gap-1${streakGoal > 7 ? " no-scrollbar" : ""}`}
          style={
            streakGoal > 7
              ? { overflowX: "auto", overflowY: "visible", WebkitOverflowScrolling: "touch", paddingBottom: 4 }
              : { flexWrap: "wrap", justifyContent: "center" }
          }
        >
          {circles.map((day) => {
            const done = day <= currentStreak;
            const icon = iconByDay[day] || null;
            return (
              <div
                key={day}
                className="flex items-center justify-center flex-shrink-0"
                style={{ width: icon && !done ? 36 : 32, height: icon && !done ? 36 : 32 }}
              >
                {done ? (
                  <svg width="40" height="40" viewBox="12 32 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g>
                      <path d="M27.3945 36.2773C21.3822 36.2773 16.4897 41.1692 16.4897 47.1808C16.4897 53.1925 21.3822 58.0869 27.3945 58.0869C33.4069 58.0869 38.2993 53.195 38.2993 47.1834C38.2993 41.1717 33.4069 36.2773 27.3945 36.2773ZM32.0931 45.1023L26.6395 50.973C26.3929 51.2398 26.0556 51.3757 25.7159 51.3757C25.4239 51.3757 25.1345 51.275 24.8955 51.0737L21.9585 48.5573C21.43 48.1044 21.3696 47.3117 21.8226 46.7833C22.2756 46.2548 23.0683 46.1919 23.5968 46.6474L25.6152 48.3761L30.2459 43.3912C30.719 42.8829 31.5143 42.8527 32.0252 43.3257C32.5361 43.7988 32.5638 44.594 32.0931 45.1023Z" fill="url(#paint0_linear_882_655)"/>
                    </g>
                    <defs>
                      <linearGradient id="paint0_linear_882_655" x1="38.2993" y1="36.2773" x2="22.9216" y2="54.2624" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#B2F763"/>
                        <stop offset="1" stopColor="#26AB3F"/>
                      </linearGradient>
                    </defs>
                  </svg>
                ) : icon ? (
                  <div
                    className="flex items-center justify-center rounded-full overflow-hidden"
                    onClick={onRewardIconClick || undefined}
                    style={{
                      width: 36,
                      height: 36,
                      background: "rgba(255,255,255,0.18)",
                      border: "1.5px solid rgba(255,255,255,0.35)",
                      fontSize: 18,
                      cursor: onRewardIconClick ? "pointer" : "default",
                    }}
                  >
                    {icon.startsWith("http") ? (
                      <img src={icon} alt="" className="w-full h-full object-cover" />
                    ) : (
                      icon
                    )}
                  </div>
                ) : (
                  <span
                    className="text-sm font-normal"
                    style={{ color: textColor, opacity: 0.6 }}
                  >
                    {day}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StreakTracker;
