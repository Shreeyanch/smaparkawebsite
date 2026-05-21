import React from "react";
import {
  Share,
  SquarePlus,
  ChevronRight,
  Store,
  X,
  EllipsisVertical,
} from "lucide-react";
import PropTypes from "prop-types";

const InstallationGuide = ({ showGuide, setShowGuide }) => {
  if (!showGuide) return null; // Don't render if guide is hidden

  // Close the guide
  const handleClose = () => {
    localStorage.setItem("hideGuide", true);
    setShowGuide(false);
  };

  // Detect Apple Device
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isAppleDevice =
    /iPad|iPhone|iPod|Macintosh/.test(userAgent) && !window.MSStream;

  return (
    <div className="fixed bottom-0 z-[60] w-screen">
      <div className="bg-gray-100 p-6 rounded-xl shadow-xl w-[100%] text-center relative animate-fadeIn">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-sm font-semibold mb-6">
          {isAppleDevice
            ? "How to Install this App on iOS"
            : "How to Install this App on Android"}
        </h3>

        {isAppleDevice ? (
          <div className="flex items-center justify-center space-x-4">
            <div className="flex flex-col items-center text-center">
              <p className="text-xs text-gray-600 mb-2">Step 1</p>
              <Share className="w-5 h-5 text-gray-600" />
              <p className="text-xs text-gray-600 mt-2">Tap Share</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 mb-2" />
            <div className="flex flex-col items-center text-center">
              <p className="text-xs text-gray-600 mb-2">Step 2</p>
              <SquarePlus className="w-5 h-5 text-gray-600" />
              <p className="text-xs text-gray-600 mt-2">Add to Home Screen</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-4">
            <div className="flex flex-col items-center text-center">
              <p className="text-xs text-gray-600 mb-2">Step 1</p>
              <EllipsisVertical className="w-5 h-5 text-gray-600" />
              <p className="text-xs text-gray-600 mt-2">Tap Menu</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 mb-2" />
            <div className="flex flex-col items-center text-center">
              <p className="text-xs text-gray-600 mb-2">Step 2</p>
              <SquarePlus className="w-5 h-5 text-gray-600" />
              <p className="text-xs text-gray-600 mt-2">Add to Home Screen</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

InstallationGuide.propTypes = {
  showGuide: PropTypes.bool.isRequired,
  setShowGuide: PropTypes.func.isRequired,
};

export default InstallationGuide;
