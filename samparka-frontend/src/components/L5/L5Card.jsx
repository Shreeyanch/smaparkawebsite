import React, { useState } from "react";
import { ChevronLeft, Coffee, MapPin, Smile, Sparkles, Star, ThumbsUp } from "lucide-react";
import QRCode from "react-qr-code";

/**
 * L5 Loyalty Card Component
 * Redesigned to match L1 card aesthetic with circular progress
 */
const L5Card = ({
  customerName = "Guest",
  outletBreakdown = [],
  totalPoints = 0,
  activeDiscounts = [],
  currentRank = null,
  showQR = false,
  setShowQR,
  customerId,
  storeUrl,
  cardColor = "#1c1917",
  textColor = "#ffffff",
  stamp = "coffee",
  customStamp = null,
  cardImage = null,
}) => {
  const [selectedOutlet, setSelectedOutlet] = useState(null);

  // Calculate total stacked discount
  const totalDiscount = activeDiscounts.reduce((sum, d) => sum + (d.discountPercentage || 0), 0);

  // Get next milestone
  const milestones = [775, 1500, 2500, 5000, 8000, 10000, 50000];
  const nextMilestone = milestones.find(m => m > totalPoints) || milestones[milestones.length - 1];
  const progress = Math.min((totalPoints / nextMilestone) * 100, 100);

  // Convert hex to rgba for shadow
  const hexToRgba = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
  };

  // Calculate progress angle for circular bar
  const progressAngle = (progress / 100) * 360;

  // Available stamp icons
  const availableIcons = {
    coffee: <Coffee className="absolute w-16 h-16" style={{ color: textColor }} />,
    star: <Star className="absolute w-16 h-16" style={{ color: textColor }} />,
    smile: <Smile className="absolute w-16 h-16" style={{ color: textColor }} />,
    thumbsUp: <ThumbsUp className="absolute w-16 h-16" style={{ color: textColor }} />,
  };

  return (
    <div
      style={{
        backgroundColor: cardColor,
        backgroundImage: cardImage ? `url(${cardImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: `2px 10px 50px ${hexToRgba(cardColor)}`,
        cursor: "pointer",
      }}
      className=" shadow-[0px_25px_58px_rgba(1,_110,_73,_0.5)] rounded-3xl h-[380px] flex flex-col items-center justify-center py-4 px-4 box-border text-white"
    >
      {showQR ? (
        /* QR Code View */
        <div className="flex flex-col items-center justify-center h-full w-60">
          <div className="flex items-center justify-start w-full gap-4 pb-4">
            <ChevronLeft
              className="hover:opacity-70 cursor-pointer transition-opacity"
              style={{ color: textColor }}
              onClick={() => setShowQR(false)}
            />
            <span className="text-sm font-medium" style={{ color: textColor }}>Back</span>
          </div>

          <p className="text-lg font-bold mb-4" style={{ color: textColor }}>
            Your QR Code
          </p>
          
          <div className="bg-white p-4 rounded-2xl shadow-2xl">
            <QRCode
              value={`${window.location.origin}/${storeUrl}/getpoints?customer=${customerId}`}
              size={180}
              level="H"
              fgColor="#1c1917"
            />
          </div>

          <p className="mt-4 text-xs font-medium tracking-wider uppercase opacity-70" style={{ color: textColor }}>
            SCAN TO EARN POINTS
          </p>
        </div>
      ) : (
        /* Main Card Content */
        <div className="w-64  rounded-3xl h-[350px] flex flex-col items-center justify-center px-2 pt-4 gap-2 relative overflow-hidden">
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-shine pointer-events-none" />

       

          {/* Circular Progress Bar */}
          <div className="relative flex justify-center items-center w-[180px] h-[180px]" style={{ color: textColor }}>
            <svg
              className="rotate-[-90deg]"
              width="180"
              height="180"
              viewBox="0 0 120 120"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background Circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={`${textColor}20`}
                strokeWidth="8"
              />
              {/* Progress Circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={textColor}
                strokeWidth="8"
                strokeDasharray="314.159"
                strokeDashoffset={314.159 - (progressAngle / 360) * 314.159}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            {/* Center Icon */}
            {customStamp ? (
              <img className="absolute w-16 h-16" alt="Stamp Icon" src={customStamp} />
            ) : (
              availableIcons[stamp] || availableIcons.coffee
            )}
          </div>

          {/* Points Display */}
          <div className="w-full flex flex-col items-center justify-center" style={{ color: textColor }}>
            <p className="text-xs opacity-70 tracking-wider uppercase">Points</p>
            <div className="flex items-center gap-1">
              <span className="text-4xl font-bold">{totalPoints.toLocaleString()}</span>
              <Star className="w-6 h-6 fill-current text-yellow-400" />
            </div>
            <p className="text-xs opacity-60 mt-1">
              {(nextMilestone - totalPoints).toLocaleString()} pts to next reward
            </p>
          </div>

          {/* Active Discount Badge - Commented Out
          {totalDiscount > 0 && (
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full mt-1"
              style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)' }}
            >
              <span className="text-xs font-bold text-emerald-400">{totalDiscount}% OFF Active</span>
            </div>
          )}
          */}

          {/* Outlet Points Summary */}
          {outletBreakdown.length > 0 && (
            <div className="w-full mt-2 relative group">
              {/* Scrollable container with hidden scrollbar */}
              <div 
                className="max-h-[80px] overflow-y-auto"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                <style>
                  {`
                    .outlet-scroll::-webkit-scrollbar {
                      display: none;
                    }
                  `}
                </style>
                <div className={`flex flex-col gap-1 outlet-scroll ${outletBreakdown.length > 2 ? 'pb-6' : ''}`}>
                  {outletBreakdown.map((outlet, index) => (
                    <div
                      key={outlet.outletId}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg transition-all duration-300 hover:scale-[1.02]"
                      style={{ 
                        background: `${textColor}10`,
                        animation: outletBreakdown.length > 2 ? `subtleBounce 2s ease-in-out ${index * 0.1}s infinite` : 'none'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" style={{ color: textColor, opacity: 0.6 }} />
                        <span className="text-xs" style={{ color: textColor, opacity: 0.8 }}>
                          {outlet.outletName}
                        </span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: textColor }}>
                        {outlet.currentPoints} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Bottom fade gradient to indicate more content */}
              {outletBreakdown.length > 2 && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none flex items-end justify-center"
                  style={{
                    background: `linear-gradient(to top, ${cardColor} 0%, ${cardColor}80 40%, transparent 100%)`
                  }}
                >
                  {/* Subtle scroll indicator dots */}
                  <div className="flex gap-1 pb-1 animate-pulse">
                    <div className="w-1 h-1 rounded-full" style={{ background: `${textColor}40` }} />
                    <div className="w-1 h-1 rounded-full" style={{ background: `${textColor}60` }} />
                    <div className="w-1 h-1 rounded-full" style={{ background: `${textColor}40` }} />
                  </div>
                </div>
              )}
              
              {/* Keyframe animation for subtle bounce hint */}
              <style>
                {`
                  @keyframes subtleBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-1px); }
                  }
                `}
              </style>
            </div>
          )}
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shine {
          animation: shine 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default L5Card;
