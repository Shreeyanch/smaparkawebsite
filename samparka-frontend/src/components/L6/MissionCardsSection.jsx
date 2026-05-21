import { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useMotionValue } from "framer-motion";
import MultiItemCard from "./MultiItemCard";
import SimpleMissionCard from "./SimpleMissionCard";

const CARD_WIDTH = 295;
const GAP = 16;
const CARD_STEP = CARD_WIDTH + GAP;
const SIDE_PADDING = 32; // px-8

/* ── Container ───────────────────────────────────────────────────────────── */
const MissionCardsSection = ({ missions = [], onClaimReward, cardColor }) => {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [maxDrag, setMaxDrag] = useState(0);
  const controls = useAnimation();
  const x = useMotionValue(0);

  if (!missions.length) return null;

  const isSingle = missions.length === 1;

  useEffect(() => {
    if (isSingle || !containerRef.current) return;
    const update = () => {
      const visible = containerRef.current.clientWidth - SIDE_PADDING * 2;
      const total = missions.length * CARD_STEP - GAP;
      setMaxDrag(Math.min(0, visible - total));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [missions.length, isSingle]);

  const snapToIndex = (index) => {
    const clamped = Math.max(0, Math.min(missions.length - 1, index));
    setActiveIndex(clamped);
    controls.start({
      x: -clamped * CARD_STEP,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    });
  };

  const handleDragEnd = (_, info) => {
    if (Math.abs(info.velocity.x) > 400) {
      snapToIndex(activeIndex + (info.velocity.x < 0 ? 1 : -1));
    } else {
      snapToIndex(Math.round(-x.get() / CARD_STEP));
    }
  };

  return (
    <div ref={containerRef} className="w-full max-w-xl mx-auto pt-2 pb-7" style={{ overflowX: "clip" }}>
      <div className="px-8">
        <motion.div
          className={`flex gap-4 pb-2 ${isSingle ? "justify-center" : ""}`}
          drag={isSingle ? false : "x"}
          dragConstraints={{ left: maxDrag, right: 0 }}
          dragDirectionLock
          dragElastic={0.08}
          dragMomentum={false}
          animate={controls}
          onDragEnd={handleDragEnd}
          style={{ x, cursor: isSingle ? "default" : "grab", touchAction: "pan-y", userSelect: "none" }}
        >
          {missions.map((mission, index) =>
            mission.missionType === "multiItem" ? (
              <MultiItemCard
                key={`${mission.title}-${index}`}
                mission={mission}
                index={index}
                onClaimReward={onClaimReward}
                cardColor={cardColor}
              />
            ) : (
              <SimpleMissionCard
                key={`${mission.title}-${index}`}
                mission={mission}
                index={index}
                onClaimReward={onClaimReward}
                cardColor={cardColor}
              />
            )
          )}
        </motion.div>
      </div>

      {!isSingle && (
        <div className="mt-2.5 flex items-center justify-center gap-1.5">
          {missions.map((_, index) => (
            <button
              key={`dot-${index}`}
              type="button"
              aria-label={`Go to mission ${index + 1}`}
              onClick={() => snapToIndex(index)}
              className="h-2 rounded-full transition-all"
              style={{
                width: activeIndex === index ? 18 : 8,
                backgroundColor: activeIndex === index ? cardColor || "#3b1a1a" : "#d1d5db",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MissionCardsSection;
