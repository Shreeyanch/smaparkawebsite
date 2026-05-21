import ProgressRing from "./ProgressRing";
import MissionCardShell from "./MissionCardShell";

const SimpleMissionCard = ({ mission, index = 0, onClaimReward, cardColor }) => {
  const color = mission.stampColor || "#3b82f6";
  const progress = Number(mission.progress || 0);
  const goal = Math.max(1, Number(mission.goal || 100));
  const pct = Math.min(100, Math.round((progress / goal) * 100));
  const done = pct >= 100;
  const hasBg = !!mission.backgroundImage;

  return (
    <MissionCardShell
      mission={mission}
      color={color}
      cardColor={cardColor}
      allDone={done}
      index={index}
      statusLabel={done ? "Completed" : `${pct}%`}
      onClaimReward={onClaimReward}
    >
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <ProgressRing progress={progress} goal={goal} color={color} size={54} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="font-bold leading-none tracking-tight"
                style={{
                  fontFamily: "var(--font-poppins, Poppins, sans-serif)",
                  fontSize: 12,
                  color: done ? "#16a34a" : hasBg ? "#fff" : "#374151",
                }}
              >
                {pct}
                <span style={{ fontSize: 10, color: done ? "#22c55e" : hasBg ? "rgba(255,255,255,0.6)" : "#9ca3af" }}>%</span>
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1.5">
                <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] ${hasBg ? "text-white/60" : "text-gray-400"}`}>
                  Progress
                </span>
                <span
                  className="font-semibold tabular-nums"
                  style={{
                    fontFamily: "var(--font-poppins, Poppins, sans-serif)",
                    fontSize: 13,
                    color: done ? "#16a34a" : hasBg ? "#fff" : "#374151",
                  }}
                >
                {Math.min(progress, goal)}/{goal}
              </span>
            </div>
            <div
              className="h-[7px] rounded-full overflow-hidden"
              style={{ backgroundColor: hasBg ? "rgba(255,255,255,0.2)" : `${color}14` }}
            >
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${pct}%`,
                  background: done
                    ? "linear-gradient(90deg, #22c55e, #16a34a)"
                    : `linear-gradient(90deg, ${color}, ${color}bb)`,
                  boxShadow: done ? "0 0 8px #22c55e40" : "none",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </MissionCardShell>
  );
};

export default SimpleMissionCard;
