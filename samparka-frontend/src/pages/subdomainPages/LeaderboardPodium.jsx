import React from "react";

// Avatar ring/bg/text colors per rank — blocks are drawn by the image
const AVATAR_CONFIG = {
  1: { avatarRing: "#FFB300", avatarBg: "#FFF8E1", avatarText: "#7A4800" },
  2: { avatarRing: "#5584CC", avatarBg: "#EBF2FF", avatarText: "#1E4B9A" },
  3: { avatarRing: "#D54E3E", avatarBg: "#FDECE9", avatarText: "#8B2A1A" },
};

// Positions: where each block's top surface sits in the image (% of image dimensions)
// transform: translate(-50%, -100%) anchors the slot's bottom to this point
const SLOT_POSITIONS = [
  { rank: 2, left: "17%", top: "50%" },
  { rank: 1, left: "50%", top: "35%" },
  { rank: 3, left: "80%", top: "50%" },
];

const DiamondIcon = ({ size = 10, color = "#4A90E2" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 1L14 6L8 15L2 6L8 1Z" fill={color} opacity="0.9" />
    <path d="M2 6H14" stroke={color} strokeWidth="1" opacity="0.5" />
  </svg>
);

const LeaderboardPodium = ({ top3 = [] }) => {
  return (
    <div className=" h-84  relative w-full overflow-hidden ">

      {/* Podium image — mix-blend-mode:multiply dissolves white bg into #F2EAD8 page */}
      <img
        src="/images/assets/podium.png"
        alt="Podium"
        style={{
          
          display: "block",
          mixBlendMode: "multiply",
        }}
        className=" absolute top-15 scale-110"
      />

      {/* Avatar + name + points overlaid above each block */}
      {SLOT_POSITIONS.map(({ rank, left, top }) => {
        const entry = top3[rank - 1];
        const cfg = AVATAR_CONFIG[rank];
        const initial = (entry?.name || "?")[0].toUpperCase();
        const pointsVal = entry?.points ?? 0;
        const avatarSize = rank === 1 ? 62 : 50;

        return (
          <div
            key={rank}
            style={{
              position: "absolute",
              left,
              top,
              transform: "translate(-50%, -100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              paddingBottom: 6,
            }}
          >
            {/* Avatar circle */}
            <div
              style={{
                width: avatarSize,
                height: avatarSize,
                borderRadius: "50%",
                // background: cfg.avatarBg,
                border: `2.5px solid ${cfg.avatarRing}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                // boxShadow: `0 3px 10px ${cfg.avatarRing}66`,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: rank === 1 ? 22 : 17,
                  fontWeight: 700,
                  color: cfg.avatarText,
                }}
              >
                {initial}
              </span>
            </div>

            {/* Name */}
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#1C1C1E",
                textAlign: "center",
                whiteSpace: "nowrap",
                maxWidth: 72,
                overflow: "hidden",
                textOverflow: "ellipsis",
                margin: 0,
              }}
            >
              {entry?.name || "—"}
            </p>

            {/* Points */}
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <DiamondIcon size={10} color="#4A90E2" />
              <span style={{ fontSize: 10, fontWeight: 700, color: "#555" }}>
                {pointsVal.toLocaleString()}
              </span>
            </div>
          </div>
        );
      })}

 

     
    </div>
  );
};

export default LeaderboardPodium;
