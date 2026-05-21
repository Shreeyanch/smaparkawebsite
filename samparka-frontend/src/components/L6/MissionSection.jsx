import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MissionStamp from "./MissionStamp";

const MissionSection = ({ missions = [], textColor = "#1c1917" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef(null);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || missions.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % missions.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, missions.length]);

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % missions.length);
  };

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + missions.length) % missions.length);
  };

  if (!missions || missions.length === 0) return null;

  return (
    <div className="w-full max-w-[400px] mx-auto px-4 py-6">
      {/* Title */}
      <div className="text-center mb-4">
        <h2
          className="text-lg sm:text-xl font-bold tracking-wide"
          style={{ color: textColor }}
        >
          Active Mission
        </h2>
      </div>

      {/* Carousel container */}
      <div className="relative">
        {/* Mission stamps */}
        <div className="flex justify-center items-center gap-4 overflow-hidden" ref={carouselRef}>
          {missions.length === 1 ? (
            // Single mission - centered
            <div className="flex justify-center">
              <MissionStamp mission={missions[0]} textColor={textColor} />
            </div>
          ) : (
            // Multiple missions - carousel
            <div className="relative w-full flex justify-center items-center">
              {/* Previous mission (smaller, faded) */}
              {missions.length > 1 && (
                <div
                  className="absolute left-0 opacity-30 scale-75 pointer-events-none hidden sm:block"
                  style={{ transform: "translateX(-50%) scale(0.75)" }}
                >
                  <MissionStamp
                    mission={missions[(currentIndex - 1 + missions.length) % missions.length]}
                    textColor={textColor}
                  />
                </div>
              )}

              {/* Current mission (centered) */}
              <div className="z-10">
                <MissionStamp mission={missions[currentIndex]} textColor={textColor} />
              </div>

              {/* Next mission (smaller, faded) */}
              {missions.length > 1 && (
                <div
                  className="absolute right-0 opacity-30 scale-75 pointer-events-none hidden sm:block"
                  style={{ transform: "translateX(50%) scale(0.75)" }}
                >
                  <MissionStamp
                    mission={missions[(currentIndex + 1) % missions.length]}
                    textColor={textColor}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation arrows */}
        {missions.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Previous mission"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: textColor }} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Next mission"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: textColor }} />
            </button>
          </>
        )}
      </div>

      {/* Carousel indicators */}
      {missions.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {missions.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(index);
              }}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                backgroundColor: index === currentIndex ? textColor : `${textColor}40`,
                transform: index === currentIndex ? "scale(1.3)" : "scale(1)",
              }}
              aria-label={`Go to mission ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MissionSection;
