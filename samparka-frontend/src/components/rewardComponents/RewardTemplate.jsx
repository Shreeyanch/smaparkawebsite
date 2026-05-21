import React, { useState, useRef, useEffect } from "react";
import { Gift, Award, Info } from "lucide-react";

const RewardTemplate = ({
  image = 
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Latte_and_dark_coffee.jpg/1200px-Latte_and_dark_coffee.jpg",
  textColor = "#10B981",
  buttonColor = "#1F2937",
  bgColor = "#111827",
  points = 5,
  name = "Test",
  description = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur illo amet a fugit placeat perferendis repellendus ut veniam voluptas libero voluptate tenetur magnam, maiores sapiente reiciendis itaque tempore, dolor modi.",
}) => {
  const [showDescription, setShowDescription] = useState(false);
  const [isLeftAligned, setIsLeftAligned] = useState(false);
  const infoRef = useRef(null);

  useEffect(() => {
    if (showDescription && infoRef.current) {
      const boundingBox = infoRef.current.getBoundingClientRect();
      if (boundingBox.right > window.innerWidth) {
        setIsLeftAligned(true);
      } else {
        setIsLeftAligned(false);
      }
    }
  }, [showDescription]);

  return (
    <div
      className={`relative rounded-lg shadow-lg m-4 border border-gray-700 w-full max-w-sm transition-transform hover:scale-105`}
    >
      {/* Points Section */}
      <div
        className={"flex items-center justify-between p-4"}
        style={{ backgroundColor: bgColor }}
      >
        <div
          className={"flex items-center gap-2 font-semibold"}
          style={{ color: textColor }}
        >
          <Award size={20} />
          <span>{points} Points</span>
        </div>
        <div
          ref={infoRef}
          className="relative"
          onMouseOver={() => setShowDescription(true)}
          onMouseOut={() => setShowDescription(false)}
        >
          <Info style={{ color: textColor }} />
          {showDescription && (
            <div
              className={`absolute top-6 ${
                isLeftAligned ? "right-0" : "left-0"
              } bg-gray-800 text-white p-2 rounded-md shadow-lg w-64 text-sm`}
            >
              {description}
            </div>
          )}
        </div>
      </div>

      {/* Image Section */}
      <div className="flex justify-center bg-stone-900">
        {image ? (
          <img
            src={image}
            alt="Reward Icon"
            className="w-auto h-32 object-fit"
          />
        ) : (
          <Gift size={64} style={{ color: textColor }} />
        )}
      </div>

      {/* Footer Section */}
      <div
        className={` flex items-center justify-between p-2`}
        style={{ backgroundColor: bgColor }}
      >
        <button
          className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition-opacity`}
          style={{ backgroundColor: buttonColor, color: textColor }}
        >
          <Gift size={16} />
          Redeem
        </button>
        <h1 className={`font-semibold text-lg`} style={{ color: textColor }}>
          {name}
        </h1>
      </div>
    </div>
  );
};

export default RewardTemplate;
