import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const Offers = ({
  allOffers = [
    {
      id: 1,
      title: "50% Cashback",
      description: "Get 50% cashback up to Rs. 500 on your first transaction",
      image:
        "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=400&fit=crop",
      display: true,
      isActive: true,
      startDate: "2024-12-01",
      expiryDate: "2025-12-31",
    },
    {
      id: 2,
      title: "New Year Special",
      description: "Flat 30% off on all bill payments this month",
      image:
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=400&fit=crop",
      display: true,
      isActive: true,
      startDate: "2024-12-01",
      expiryDate: "2025-12-31",
    },
    {
      id: 3,
      title: "Refer & Earn",
      description:
        "Refer friends and earn Rs. 100 for each successful referral",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop",
      display: true,
      isActive: true,
      startDate: "2024-12-01",
      expiryDate: "2025-12-31",
    },
  ],
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Filter offers based on display and expiry date
  const activeOffers = allOffers.filter((offer) => {
    if (!offer.display) return false;

    // Handle missing expiryDate gracefully
    if (!offer.expiryDate) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only
    
    const expiryDate = new Date(offer.expiryDate);
    expiryDate.setHours(0, 0, 0, 0);

    return expiryDate >= today;
  });

  useEffect(() => {
    if (activeOffers.length === 0) {
      return;
    }

    setIsVisible(true);

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeOffers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeOffers.length]);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      nextOffer();
    }
    if (touchStart - touchEnd < -75) {
      prevOffer();
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setTouchStart(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setTouchEnd(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (touchStart - touchEnd > 75) {
      nextOffer();
    }
    if (touchStart - touchEnd < -75) {
      prevOffer();
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const nextOffer = () => {
    setCurrentIndex((prev) => (prev + 1) % activeOffers.length);
  };

  const prevOffer = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + activeOffers.length) % activeOffers.length
    );
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || activeOffers.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] lg:max-h-[85vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-all duration-200"
          aria-label="Close offers"
        >
          <X size={20} />
        </button>

        {/* Offer Content */}
        <div
          className="relative cursor-grab active:cursor-grabbing select-none flex-1 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* <div className="relative max-h-[80vh] w-full min-h-[50vh] sm:min-h-[60vh] lg:h-[80vh]"> */}
          <div className="relative">
            <img
              src={activeOffers[currentIndex].image}
              alt={activeOffers[currentIndex].title}
              // className="min-h-[50vh] max-h-[80vh] object-contain bg-black/50"
              className="object-contain bg-black/50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
                {activeOffers[currentIndex].title}
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-200">
                {activeOffers[currentIndex].description}
              </p>
            </div>
          </div>
        </div>

        {/* Dots Indicator */}
        {activeOffers.length > 1 && (
          <div className="flex justify-center gap-2 bg-black/45 p-3">
            {activeOffers.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-blue-600"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to offer ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;
