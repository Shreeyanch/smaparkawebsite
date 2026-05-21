import { useState } from "react";
import CircularProgressBar from "./CircularProgressBar";
import QRCode from "react-qr-code";
import { useStoreAuth } from "../context/StoreAuthContext";
import QrScanner from "react-qr-scanner";
import userTier from "../hooks/userTier";
import { ChevronLeft } from "lucide-react";

const L3 = ({
  format = "L3",
  points = 39,
  customerTier = "Bronze",
  cardColor = "#016e49",
  textColor = "#fff",
  stamp = "coffee",
  tier = [],
  customStamp = null,
  cardImage = null,
  showQR,
  setShowQR,
}) => {
  // const [showQR, setShowQR] = useState(false);
  const [scan, setScan] = useState(true);
  const { authState } = useStoreAuth();
  const { userInfo: user } = authState;

  if (Array.isArray(tier) && tier.length === 0) {
    tier = [{ name: "Bronze", minPoints: 0, maxPoints: 100 }];
  }
  // const userTier =
  //   tier.find((t) => points >= t.minPoints && points <= t.maxPoints)?.name ||
  //   "Default Tier";
  const currentTierIndex = tier.findIndex(
    (t) => points >= t.minPoints && points <= t.maxPoints
  );
  const nextTier = tier[currentTierIndex + 1];
  const calculateProgress = (points, tiers) => {
    const currentTier = tiers.find(
      (tier) => points >= tier.minPoints && points <= tier.maxPoints
    );

    if (!currentTier) return 0;

    const { minPoints = 0, maxPoints = 100 } = currentTier;

    if (points < minPoints) return 0;
    if (points >= maxPoints) return 100;
    return ((points - minPoints) / (maxPoints - minPoints)) * 100;
  };

  const progress = calculateProgress(points, tier);
  const hexToRgba = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
  };

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

          {/* Applied new borderRadius "rounded-3xs1", fontSize "text-base1", and screen breakpoints md1, sm1 */}
          <CircularProgressBar
            progress={progress}
            stamp={stamp}
            color={textColor}
            customStamp={customStamp}
          />
          <div className="w-[200px] flex flex-col items-center justify-start lg1:w-full">
            {" "}
            {/* Applied lg1 breakpoint */}
            <div
              className="self-stretch flex flex-col items-center justify-center"
              style={{ color: textColor }}
            >
              <div className="relative text-sm">Points</div>

              {/* Applied new font size "text-11xl1" */}
              <div className="flex items-center space-x-2 px-3 py-1">
                <div className="flex items-center justify-center">
                  <b className="text-xl text-gray-200">{points}</b>
                  <img
                    className="w-6 h-6 mb-1"
                    alt="star icon"
                    src="/interface--star.svg"
                  />
                </div>
              </div>
              <div className="mt-2 cursor-pointer text-sm">
                <span className="font-medium">
                  {format == "L3" ? userTier(tier, points) : customerTier}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default L3;
