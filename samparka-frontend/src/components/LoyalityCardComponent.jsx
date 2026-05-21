import React from "react";
import "./css/loyalityCard.css";
import { BookmarkPlus, Award, Coffee, ThumbsUp, Smile } from "lucide-react";
import samparka from "/SAMPARKA.png";
import image from "/unnamed.jpg";
import { useNavigate } from "react-router-dom";

const LoyalityCard = ({
  store = "Your Store",
  logo = image,
  bgColor = "#E5E7EB",
  textColor = "#001001",
  cardColor = "#FFFFFF",
  stampColor = "#2f6a4f",
  stamp = "thumbsUp",
  customStamp = null,
  points = 18,
}) => {
  // Map of available icons
  const availableIcons = {
    thumbsUp: <ThumbsUp className="w-6 h-6" />,
    smile: <Smile className="w-6 h-6" />,
    coffee: <Coffee className="w-6 h-6" />,
  };
  const navigate = useNavigate();
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen text-white"
      style={{ backgroundColor: bgColor }}
    >
      {/* Container Div with customizable background color */}
      <div
        className="p-8 text-white rounded-2xl shadow-lg flex flex-col items-center space-y-6"
        style={{ backgroundColor: cardColor }}
      >
        <div className="flex flex-col items-center justify-center text-center">
          {/* Logo */}
          <div className="w-20 h-20 flex items-center justify-center">
            <img src={logo} alt="" />
          </div>

          {/* Title */}
          <h1 className="text-lg font-bold" style={{ color: textColor }}>
            {store}
          </h1>
        </div>

        {/* Grid Section */}

        <div className="bg-gray-200 p-8 rounded-3xl shadow-xl">
          <div className="grid grid-cols-4 grid-rows-2 gap-3">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className={`
                relative w-14 h-14 rounded-xl flex items-center justify-center shadow-xl
                ${
                  index < points &&
                  "shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                }
              `}
                style={{
                  backgroundColor:
                    index < points ? stampColor : stampColor + "66",
                }}
              >
                {/* content */}

                <>
                  {/* Glow effect for active stamps */}
                  <div className="absolute inset-0 bg-white/5 rounded-xl blur-sm" />
                  {/* Icon container */}
                  <div className="relative z-10">
                    {customStamp ? (
                      <img
                        src={customStamp}
                        alt="Custom Icon"
                        className={`w-6 h-6 ${
                          index < points
                            ? "text-green-100"
                            : "text-gray-100 opacity-50"
                        }`}
                      />
                    ) : (
                      <div
                        className={
                          index < points
                            ? "text-green-100"
                            : "text-gray-100 opacity-50"
                        }
                      >
                        {availableIcons[stamp] || availableIcons["thumbsUp"]}
                        {/* <Coffee className="w-7 h-7 text-white" /> */}
                      </div>
                    )}
                  </div>
                </>
              </div>
            ))}
          </div>
        </div>

        {/* Reward Points */}
        <div className="w-100" style={{ color: textColor }}>
          <div className="flex justify-between">
            <p className="text-m text-center font-bold left-0 mr-10">Service</p>
            <p className="text-m text-center font-bold right-0 ml-10">
              Balance
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm text-center mr-10">Earned Stamps:</p>
            <p className="text-sm text-center ml-10">{points}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col items-center justify-center text-center">
          {/* View Rewards Button */}
          <button
            onClick={() => {
              navigate("/rewards");
            }}
            className="flex items-center space-x-2 px-6 py-2 bg-gray-200 hover:bg-gray-400 rounded-lg text-green-100 transition"
          >
            <Award className="w-5 h-5" style={{ color: stampColor }} />
            <span style={{ color: stampColor }}>View Rewards</span>
          </button>

          {/* Reservation Button */}
          <button
            onClick={() => {
              navigate("/reservation");
            }}
            className="flex items-center space-x-2 px-6 py-2 mt-3 bg-gray-200 hover:bg-gray-400 rounded-lg text-green-100 transition"
          >
            <BookmarkPlus className="w-5 h-5" style={{ color: stampColor }} />
            <span style={{ color: stampColor }}>Reservation</span>
          </button>
        </div>

        {/* Footer Text */}
        <a
          href="https://www.samparka.co/"
          target="_blank"
          className="flex"
          style={{ color: textColor }}
        >
          <p className="text-sm text-center mt-1 mr-1">Powered By</p>
          <img src={samparka} width={100} />
        </a>
      </div>
    </div>
  );
};

export default LoyalityCard;

