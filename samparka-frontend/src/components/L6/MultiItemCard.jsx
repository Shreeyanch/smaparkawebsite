import { CheckCircle2 } from "lucide-react";
import ProgressRing from "./ProgressRing";
import MissionCardShell from "./MissionCardShell";

const MultiItemCard = ({ mission, index = 0, onClaimReward, cardColor }) => {
  const items = mission.items || [];
  const color = mission.stampColor || "#3b82f6";
  const completedCount = items.filter(
    (it) => Number(it.progress || 0) >= Math.max(1, Number(it.goal || 1))
  ).length;
  const allDone = items.length > 0 && completedCount === items.length;
  const hasBg = !!mission.backgroundImage;

  return (
    <MissionCardShell
      mission={mission}
      color={color}
      cardColor={cardColor}
      allDone={allDone}
      index={index}
      statusLabel={allDone ? "Completed" : `${completedCount}/${items.length}`}
      onClaimReward={onClaimReward}
    >
      <div className="px-4 pt-3 pb-4">
        <div
          className={`grid gap-x-2 gap-y-3 ${
            items.length <= 3 ? "grid-cols-3" : "grid-cols-4"
          }`}
        >
          {items.map((item, i) => {
            const progress = Number(item.progress || 0);
            const goal = Math.max(1, Number(item.goal || 1));
            const done = progress >= goal;

            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="relative">
                  <ProgressRing progress={progress} goal={goal} color={color} size={52} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {done ? (
                      <CheckCircle2
                        size={17}
                        className="text-green-500"
                        style={{ filter: "drop-shadow(0 0 3px #22c55e50)" }}
                      />
                    ) : (
                      <span
                        className="font-semibold leading-none tracking-tight"
                        style={{
                          fontFamily: "var(--font-poppins, Poppins, sans-serif)",
                          fontSize: 12,
                          color: hasBg ? "#fff" : "#374151",
                        }}
                      >
                        {progress}
                        <span style={{ fontSize: 10, color: hasBg ? "rgba(255,255,255,0.6)" : "#9ca3af" }}>/{goal}</span>
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-center leading-tight w-full break-words ${
                    done
                      ? "text-green-400 font-semibold"
                      : hasBg ? "text-white/80 font-medium" : "text-gray-600 font-medium"
                  }`}
                  style={{ fontSize: 11 }}
                >
                  {item.itemName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </MissionCardShell>
  );
};

export default MultiItemCard;
