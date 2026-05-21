import React from "react";

const DiamondIcon = ({ size = 12, color = "#4A90E2" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 1L14 6L8 15L2 6L8 1Z" fill={color} opacity="0.9" />
    <path d="M2 6H14" stroke={color} strokeWidth="1" opacity="0.5" />
  </svg>
);

const AVATAR_COLORS = [
  { bg: "#FFF0E6", text: "#B85C2A" },
  { bg: "#E6F0FF", text: "#2A5CB8" },
  { bg: "#E6FFF0", text: "#1A8A45" },
  { bg: "#F5E6FF", text: "#7A2AB8" },
  { bg: "#FFECEC", text: "#B82A2A" },
  { bg: "#FFFAE6", text: "#A87C0A" },
  { bg: "#E6FFFA", text: "#0A8A75" },
];

const RankRow = ({ entry, rank, isCurrentUser }) => {
  const initial = (entry?.name || "?")[0].toUpperCase();
  const colorScheme = AVATAR_COLORS[(rank - 1) % AVATAR_COLORS.length];
  const points = entry?.points ?? 0;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{
        background: isCurrentUser
          ? "linear-gradient(135deg, #FFF8E1 0%, #FFFDE7 100%)"
          : "rgba(255,255,255,0.75)",
        border: isCurrentUser ? "1.5px solid #F5C842" : "1.5px solid rgba(0,0,0,0.05)",
        boxShadow: isCurrentUser
          ? "0 2px 8px rgba(245,200,66,0.15)"
          : "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      {/* Rank */}
      <div className="flex items-center gap-1 w-8 shrink-0">
        <DiamondIcon size={10} color={isCurrentUser ? "#F0A800" : "#BBBBCC"} />
        <span
          className="font-bold"
          style={{ fontSize: 13, color: isCurrentUser ? "#92600A" : "#8E8E93" }}
        >
          {rank}
        </span>
      </div>

      {/* Avatar */}
      {/* <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: isCurrentUser ? "#FFF0C0" : colorScheme.bg,
          border: isCurrentUser ? "1.5px solid #F5C842" : "1.5px solid rgba(0,0,0,0.07)",
        }}
      >
        <span
          className="font-bold"
          style={{ fontSize: 15, color: isCurrentUser ? "#92600A" : colorScheme.text }}
        >
          {initial}
        </span>
      </div> */}

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold truncate"
          style={{ fontSize: 14, color: isCurrentUser ? "#6B4500" : "#1C1C1E" }}
        >
          {entry?.name || "Unknown"}
          {isCurrentUser && (
            <span className="ml-1.5 text-xs font-normal" style={{ color: "#F0A800" }}>
              (You)
            </span>
          )}
        </p>
        {entry?.isQualified === false && (
          <p className="text-xs" style={{ color: "#8E8E93" }}>
            Not yet qualified
          </p>
        )}
      </div>

      {/* Points */}
      <div className="flex items-center gap-1 shrink-0">
        <span
          className="font-bold"
          style={{ fontSize: 14, color: isCurrentUser ? "#92600A" : "#1C1C1E" }}
        >
          {points.toLocaleString()}
        </span>
        <DiamondIcon size={12} color={isCurrentUser ? "#F0A800" : "#4A90E2"} />
      </div>
    </div>
  );
};

const LeaderboardRankList = ({ entries = [], currentUserId, startRank = 4 }) => {
  if (!entries.length) return null;

  return (
    <div className="flex flex-col px-4 ">
      {entries.map((entry, i) => {
        const rank = startRank + i;
        const isCurrentUser = entry._id === currentUserId || entry.customer?._id === currentUserId;
        return (
          <RankRow
            key={entry._id || entry.customer?._id || i}
            entry={entry}
            rank={rank}
            isCurrentUser={isCurrentUser}
          />
        );
      })}
    </div>
  );
};

export default LeaderboardRankList;
