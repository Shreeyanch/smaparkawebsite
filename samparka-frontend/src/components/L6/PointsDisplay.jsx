import { Star } from "lucide-react";

const PointsDisplay = ({
  points = 0,
  tierName = "Gold Tier",
  pointsLabel = "Magic Points",
  textColor = "#ffffff",
}) => {
  const strokeColor = textColor === "#ffffff"
    ? "rgba(255,255,255,0.8)"
    : `${textColor}80`;

  return (
    <div className="w-full mt-5" style={{ color: textColor }}>
      {/* Hollow / etched points number + tier badge */}
      <div className="flex items-end gap-3">
        <span
          className="font-medium leading-none tracking-tight"
          style={{
            fontSize: "56px",
            color: "transparent",
            // opacity: "50%",
            WebkitTextStroke: `1px ${strokeColor}`,
            filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.1))",
            fontFamily: "Inter, Montserrat, Poppins, sans-serif",
          }}
        >
          {Number(points).toLocaleString()}
        </span>
        <div className="flex items-center gap-1.5 pb-2">
          <Star className="w-4 h-4 fill-current" style={{ color: "#22c55e" }} />
          <span className="text-sm font-normal" style={{ color: textColor }}>
            {tierName}
          </span>
        </div>
      </div>
      {/* Points label */}
      <p className="text-sm mt-1 font-light" style={{ opacity: 0.5 }}>
        {pointsLabel}
      </p>
    </div>
  );
};

export default PointsDisplay;
