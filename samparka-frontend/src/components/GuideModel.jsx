import { X } from "lucide-react";

function GuideModal({ isIOS, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[500]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-fadeIn relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE ICON */}
        <button
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 active:scale-95 transition"
          onClick={onClose}
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* HEADER */}
        <div className="p-4 border-b">
          <p className="font-semibold text-gray-800 text-center text-base sm:text-lg">
            {isIOS ? "How to Install on iPhone" : "How to Install on Android"}
          </p>
        </div>

        {/* GIF AREA */}
        <div className="p-3 max-h-[60vh] overflow-y-auto flex justify-center">
          <img
            src={isIOS ? "./gif/ios.gif" : "./gif/android.gif"}
            // src="./gif/android.gif"
            alt="Install guide"
            className="w-full h-auto rounded-md shadow-sm object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export default GuideModal;
