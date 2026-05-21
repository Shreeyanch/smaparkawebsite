import { ArrowLeft, ChevronLeft, Coffee, Smile, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { useStoreAuth } from "../context/StoreAuthContext";
import QRCode from "react-qr-code";
import QrScanner from "react-qr-scanner";
import { useNavigate } from "react-router-dom";

const L2 = ({
  points = 2,
  totalShapes = 9,
  stampColor = "#ffffff",
  cardColor = "#ffffff",
  textColor = "#ffffff",
  stampShape = "circle",
  stamp = "",
  customStamp = null,
  cardImage = null,
  showQR,
  setShowQR,
}) => {
  // const [showQR, setShowQR] = useState(false);
  const [scan, setScan] = useState(true);
  const navigate = useNavigate();

  const availableIcons = {
    thumbsUp: <ThumbsUp className="w-5 h-5" />,
    smile: <Smile className="w-5 h-5" />,
    coffee: <Coffee className="w-5 h-5" />,
  };

  const hexToRgba = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
  };

  const { authState } = useStoreAuth();
  const { userInfo: user } = authState;

  const handleScan = (data) => {
    if (data) {
      try {
        const url = data.text;
        if (!url.startsWith(window.location.origin)) {
          alert("Invalid QR Code");
          return;
        }

        window.location.replace(url);
      } catch (error) {
        console.error("Invalid QR Code format", error);
        alert("Invalid QR Code format");
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  return (
    <div
      // onClick={() => setShowQR((prev) => !prev)}
      style={{
        backgroundColor: cardColor,
        backgroundImage: cardImage ? `url(${cardImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: `2px 10px 50px ${hexToRgba(cardColor)}`,
        cursor: "pointer",
      }}
      className={`shadow-[0px_25px_58px_rgba(1,_110,_73,_0.5)] rounded-3xs1 h-[360px] flex flex-col items-center justify-center py-1 px-2.5 box-border text-[10px] text-white md1:flex-col`}
    >
      {showQR ? (
        <div className="flex flex-col items-center justify-center h-full w-60">
          {/* Arrow and Buttons Row */}
          <div className="flex items-center justify-start w-full gap-4 pb-2">
            <ChevronLeft
              className="text-gray-300 hover:text-gray-500 cursor-pointer"
              onClick={() => setShowQR((prev) => !prev)}
            />
            <div className="rounded-lg bg-gradient-to-r from-[#f5f2ed] via-[#f4f5f0] to-[#edf5f3] flex flex-row items-center justify-center p-[3px]">
              <button
                className={`w-[84px] h-[25px] flex flex-row items-center justify-center cursor-pointer ${
                  scan
                    ? "bg-white shadow-[0px_4px_10px_rgba(10,_19,_8,_0.12)] text-darkslategray rounded-lg"
                    : "text-darkgray-200"
                }`}
                onClick={() => setScan(true)}
              >
                Scan
              </button>
              <button
                className={`w-[84px] h-[25px] flex flex-row items-center justify-center cursor-pointer ${
                  !scan
                    ? "bg-white shadow-[0px_4px_10px_rgba(10,_19,_8,_0.12)] text-darkslategray rounded-lg"
                    : "text-darkgray-200"
                }`}
                onClick={() => setScan(false)}
              >
                Share
              </button>
            </div>
          </div>

          {showQR && scan ? (
            <div className="mt-5">
              {/* Outer Frame with Corner Lines */}
              <div className="relative w-56 h-56 flex items-center justify-center">
                <div className="absolute w-56 h-56">
                  {/* Corner Lines */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>
                </div>

                {/* Scanner */}
                <div className="relative w-52 h-52 bg-black rounded-md overflow-hidden">
                  <QrScanner
                    onScan={handleScan}
                    onError={handleError}
                    constraints={{
                      video: {
                        facingMode: "environment",
                      },
                    }} // facingMode="user"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* QR Code Title */}
              <center
                className="text-lg font-bold mb-2"
                style={{ color: textColor }}
              >
                Your QR Code
              </center>
              {/* QR Code Box */}
              <div className="w-52 h-52 bg-gray-200 flex items-center justify-center rounded-lg">
                <QRCode
                  title="Your QR"
                  className="p-2 w-52 h-52"
                  value={JSON.stringify({
                    id: user._id,
                    name: user.name,
                    phone: user.phone,
                  })}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`w-60 rounded-3xs1 h-[340px] flex flex-col items-center justify-center px-2.5 gap-1.5 text-[10px] text-white md1:flex-col sm1:flex-wrap relative overflow-hidden`}
        >
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shine pointer-events-none" />

          <div className="self-stretch rounded-xl1 h-[301px] overflow-hidden shrink-0 flex flex-row items-center justify-center flex-wrap content-center py-[33px] px-[11px] box-border gap-x-[27px] gap-y-[62px]">
            {Array.from({ length: totalShapes }).map((_, index) => (
              <div
                key={index}
                className={`w-12 h-12 rounded-full flex items-center justify-center`}
                style={{
                  border: "1px solid",
                  backgroundColor: index < points ? stampColor : "transparent",
                  borderColor:
                    index >= points ? "rgba(255, 255, 255, 0.3)" : textColor, // 20% opacity border
                }}
              >
                <div className="relative z-10 flex items-center justify-center">
                  {customStamp ? (
                    <img
                      src={customStamp}
                      alt="Custom Icon"
                      className={`w-5 h-5 ${
                        index < points
                          ? "text-green-100"
                          : "text-gray-100 opacity-50"
                      }`}
                    />
                  ) : (
                    <div
                      style={{ color: textColor }}
                      className={`${index >= points && "opacity-50"}`}
                    >
                      {availableIcons[stamp]}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* {Array.from({ length: totalShapes }).map((_, index) => {
              const isStamped = index < points;

              // Dynamic styles for shapes
              const getShapeClass = (shape) => {
                switch (shape) {
                  case "circle":
                    return "rounded-full";
                  case "square":
                    return "rounded-none";
                  case "hexagon":
                    return "clip-hexagon";
                  case "octagon":
                    return "clip-octagon";
                  case "star":
                    return "clip-star";
                  case "cup":
                    return "clip-cup";
                  default:
                    return "rounded-full";
                }
              };

              return (
                <div
                  key={index}
                  className={`w-12 h-12 flex items-center justify-center border ${getShapeClass(
                    stampShape
                  )}`}
                  style={{
                    backgroundColor: isStamped ? stampColor : "transparent",
                    borderColor: isStamped
                      ? textColor
                      : "rgba(255,255,255,0.3)",
                    clipPath: ["hexagon", "octagon", "star", "cup"].includes(
                      stampShape
                    )
                      ? undefined
                      : "", // avoid override
                  }}
                >
                  <div className="relative z-10 flex items-center justify-center">
                    {customStamp ? (
                      <img
                        src={customStamp}
                        alt="Custom Icon"
                        className={`w-5 h-5 ${
                          isStamped
                            ? "text-green-100"
                            : "text-gray-100 opacity-50"
                        }`}
                      />
                    ) : (
                      <div
                        style={{ color: textColor }}
                        className={`${!isStamped && "opacity-50"}`}
                      >
                        {availableIcons[stamp]}
                      </div>
                    )}
                  </div>
                </div>
              );
            })} */}
          </div>
        </div>
      )}

      <div
        style={{ color: textColor }}
        className="relative tracking-[0.01em] text-xs-41 mb-2"
      >
        {showQR ? "" : `Points: ${points}`}
      </div>
    </div>
  );
};

export default L2;
