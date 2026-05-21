import { Coffee, Star, Smile, ThumbsUp, Target } from "lucide-react";

const MissionStamp = ({ mission, textColor = "#1c1917" }) => {
  const {
    title = "Mission Title",
    subtitle = "Description",
    icon = "coffee",
    stampColor = "#3b82f6", // blue
    progress = 0,
    goal = 100,
  } = mission;

  // Icon mapping
  const iconMap = {
    coffee: <Coffee className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: textColor }} />,
    star: <Star className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: textColor }} />,
    smile: <Smile className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: textColor }} />,
    thumbsUp: <ThumbsUp className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: textColor }} />,
    target: <Target className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: textColor }} />,
  };

  const displayIcon = iconMap[icon] || iconMap.coffee;
  const progressPercentage = Math.min(100, (progress / goal) * 100);

  return (
    <div
      className="relative flex-shrink-0 w-32 h-40 sm:w-36 sm:h-44 flex flex-col items-center justify-center"
      style={{
        transform: "rotate(-3deg)",
      }}
    >
      {/* Stamp border with jagged edges */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 150 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Stamp outline with zigzag pattern */}
        <defs>
          <pattern id={`zigzag-${title}`} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M0 4 L4 0 L8 4 L4 8 Z" fill={stampColor} />
          </pattern>
        </defs>
        {/* Main stamp rectangle with jagged border */}
        <rect
          x="5"
          y="5"
          width="140"
          height="190"
          fill="white"
          stroke={stampColor}
          strokeWidth="4"
          rx="4"
        />
        {/* Zigzag border effect */}
        {Array.from({ length: 18 }).map((_, i) => (
          <circle key={`top-${i}`} cx={10 + i * 8} cy="5" r="3" fill={stampColor} />
        ))}
        {Array.from({ length: 18 }).map((_, i) => (
          <circle key={`bottom-${i}`} cx={10 + i * 8} cy="195" r="3" fill={stampColor} />
        ))}
        {Array.from({ length: 24 }).map((_, i) => (
          <circle key={`left-${i}`} cx="5" cy={10 + i * 8} r="3" fill={stampColor} />
        ))}
        {Array.from({ length: 24 }).map((_, i) => (
          <circle key={`right-${i}`} cx="145" cy={10 + i * 8} r="3" fill={stampColor} />
        ))}
      </svg>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-1 px-3">
        {/* Icon */}
        <div style={{ color: stampColor, opacity: 0.8 }}>
          {displayIcon}
        </div>

        {/* Title */}
        <h3
          className="text-sm sm:text-base font-bold text-center leading-tight"
          style={{ color: stampColor }}
        >
          {title}
        </h3>

        {/* Subtitle */}
        <p
          className="text-[10px] sm:text-xs text-center opacity-70"
          style={{ color: textColor }}
        >
          {subtitle}
        </p>

        {/* Progress indicator */}
        <div className="w-full mt-2">
          <div
            className="h-1.5 rounded-full bg-gray-200 overflow-hidden"
            style={{ border: `1px solid ${stampColor}40` }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: stampColor,
              }}
            />
          </div>
          <p
            className="text-[10px] text-center mt-1 font-semibold"
            style={{ color: stampColor }}
          >
            {progress}/{goal}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MissionStamp;
