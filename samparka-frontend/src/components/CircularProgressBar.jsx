import { Coffee, Smile, ThumbsUp } from "lucide-react";

// CircularProgressBar.js
const CircularProgressBar = ({ progress, stamp, color, customStamp }) => {
  const progressAngle = (progress / 100) * 360;
  const availableIcons = {
    thumbsUp: <ThumbsUp className="absolute w-16 h-16" />,
    smile: <Smile className="absolute w-16 h-16" />,
    coffee: <Coffee className="absolute w-16 h-16" />,
  };
  return (
    <div
      className="relative flex justify-center items-center w-[200px] h-[200px]"
      style={{ color }}
    >
      <svg
        className="rotate-90"
        width="200"
        height="200"
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="#FFFCEC"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="#E6D62D"
          strokeWidth="8"
          strokeDasharray="314.159"
          strokeDashoffset={314.159 - (progressAngle / 360) * 314.159}
          strokeLinecap="round"
        />
      </svg>
      {customStamp ? (
        <img className="absolute w-16 h-16" alt="Cup Icon" src={customStamp} />
      ) : (
        availableIcons[stamp]
      )}
    </div>
  );
};

export default CircularProgressBar;
