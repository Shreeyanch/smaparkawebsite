import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import QrScanner from "react-qr-scanner";
import { useStoreAuth } from "../context/StoreAuthContext";

const QrToggle = ({ className = "", onClose }) => {
  const [activeTab, setActiveTab] = useState("share");
  const [isVisible, setIsVisible] = useState(false);

  const { authState } = useStoreAuth();
  const { userInfo: user } = authState;

  useEffect(() => {
    // Trigger animation on mount
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Small delay for exit animation before actually closing
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
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
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${isVisible ? "bg-black/50 backdrop-blur-sm" : "bg-transparent"
        }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`w-[380px] relative rounded-[40px] bg-white overflow-hidden flex flex-col items-center justify-start py-8 px-6 box-border gap-6 max-w-full text-center shadow-2xl transition-all duration-200 transform ${isVisible
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
          } ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <div className="self-stretch flex flex-row items-start justify-end">
          <button
            className="w-10 rounded-full bg-gray-100/80 h-10 flex flex-row items-center justify-center relative cursor-pointer hover:bg-gray-200/80 transition-all duration-150 hover:scale-105"
            onClick={handleClose}
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="w-[280px] rounded-full bg-gray-100 h-[45px] overflow-hidden shrink-0 flex flex-row items-center justify-start p-1">
          <button
            className={`flex-1 rounded-full h-[37px] flex flex-row items-center justify-center transition-all duration-200 font-medium text-sm ${activeTab === "share"
                ? "bg-gray-800 text-white shadow-sm transform scale-105"
                : "bg-transparent text-gray-700 hover:bg-gray-50"
              }`}
            onClick={() => setActiveTab("share")}
          >
            <p className="text-lg">Share</p>
          </button>
          <button
            className={`flex-1 rounded-full h-[37px] flex flex-row items-center justify-center transition-all duration-200 font-medium text-sm ${activeTab === "scan"
                ? "bg-gray-800 text-white shadow-sm transform scale-105"
                : "bg-transparent text-gray-700 hover:bg-gray-50"
              }`}
            onClick={() => setActiveTab("scan")}
          >
            <p className="text-lg">Scan</p>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-col items-center gap-6">
          {activeTab === "share" ? (
            <>
              {/* QR Code Image */}
              <div className="w-[280px] h-[280px] bg-white flex items-center justify-center border border-gray-200 rounded-xl p-4">
                {/* <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=https://example.com/loyalty-rewards&format=png&ecc=M&margin=1"
                  alt="QR Code"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to a different QR service or show error
                    e.target.src =
                      "https://chart.googleapis.com/chart?chs=240x240&cht=qr&chl=https://example.com/loyalty-rewards&choe=UTF-8";
                  }}
                /> */}
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

              <div className="text-lg font-semibold text-gray-900 leading-6 max-w-[260px]">
                Please show this QR to the Shop.
              </div>
            </>
          ) : (
            <>
              {/* Scanner Interface */}
              <div className="w-[280px] h-[280px] bg-gray-50 border-2 border-gray-300 border-dashed rounded-xl flex items-center justify-center relative">
                <div className="absolute inset-6 border-2 border-gray-400 rounded-lg"></div>

                {/* Corner brackets */}
                <div className="absolute top-8 left-8 w-6 h-6 border-l-3 border-t-3 border-gray-600"></div>
                <div className="absolute top-8 right-8 w-6 h-6 border-r-3 border-t-3 border-gray-600"></div>
                <div className="absolute bottom-8 left-8 w-6 h-6 border-l-3 border-b-3 border-gray-600"></div>
                <div className="absolute bottom-8 right-8 w-6 h-6 border-r-3 border-b-3 border-gray-600"></div>

                {/* Scanning line */}
                <div className="absolute top-10 left-10 right-10 h-0.5 bg-green-500 animate-pulse shadow-sm"></div>

                {/* <div className="flex flex-col items-center gap-3 text-gray-500">
                  <svg
                    className="w-14 h-14"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM17 14h3v3h-3z"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    Position QR code here
                  </span>
                </div> */}
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

              <div className="text-lg font-semibold text-gray-900 leading-6 max-w-[260px]">
                Align the QR code within the frame to scan.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrToggle;
