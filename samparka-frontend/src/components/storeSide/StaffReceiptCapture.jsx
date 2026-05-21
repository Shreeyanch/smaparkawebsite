import { useState, useRef, useEffect } from "react";
import { Camera, ImageIcon, Loader2, CheckCircle, RotateCcw, X, SwitchCamera } from "lucide-react";
import { cn } from "../../lib/utils.js";
import receiptApi from "../../api/receiptApi.js";
import { useTheme } from "../../context/ThemeContext";
import StaffAmountDisplay from "./StaffAmountDisplay.jsx";

const StaffReceiptCapture = ({ customer, ocrProvider, onContinue, onBack }) => {
  const { isDarkMode } = useTheme();
  const token = localStorage.getItem("storeToken");
  const fileRef = useRef();
  const galleryRef = useRef();
  const videoRef = useRef();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [amount, setAmount] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [cameraFacingMode, setCameraFacingMode] = useState("rear");
  const streamRef = useRef(null);

  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setExtracted(null);
    setAmount("");
    setExtracting(true);
    try {
      const formData = new FormData();
      formData.append("receipt", f);
      const res = await receiptApi.extractReceiptStaff(formData, token, ocrProvider);
      const data = res.data?.data || {};
      setExtracted(data);
      if (data.totalAmount) setAmount(String(data.totalAmount));
    } catch (err) {
      console.error(err);
      setExtracted({ failed: true });
    } finally {
      setExtracting(false);
    }
  };

  const toggleCamera = () => {
    setCameraFacingMode((prev) => (prev === "rear" ? "front" : "rear"));
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      // Try with preferred facing mode first
      let constraints = {
        video: { 
          facingMode: cameraFacingMode === "rear" ? "environment" : "user",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("✅ Camera stream obtained with preferred constraints");
      } catch (firstErr) {
        // If specific facing mode fails, try with just video: true
        console.warn("⚠️ Specific camera not available, trying default camera");
        constraints = { video: true };
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("✅ Camera stream obtained with fallback constraints");
      }

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setCameraActive(true);
    } catch (err) {
      console.error("❌ Camera access error:", err);
      setCameraError(err.message || "Unable to access camera. Please check permissions.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
    setCameraActive(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const capturedFile = new File([blob], `receipt_${Date.now()}.jpg`, { type: 'image/jpeg' });
        stopCamera();
        handleFileChange({ target: { files: [capturedFile] } });
      }
    }, 'image/jpeg', 0.95);
  };

  const reset = () => {
    stopCamera();
    setFile(null);
    setPreview(null);
    setExtracted(null);
    setAmount("");
    if (fileRef.current) fileRef.current.value = "";
    if (galleryRef.current) galleryRef.current.value = "";
  };

  // Wire the stream to the video element after React renders it into the DOM
  useEffect(() => {
    if (!cameraActive || !stream || !videoRef.current) return;
    const video = videoRef.current;
    video.srcObject = stream;
    const handleMeta = async () => {
      try {
        await video.play();
        console.log("✅ Video playing");
      } catch (playErr) {
        console.warn("⚠️ Video autoplay issue:", playErr);
      }
    };
    video.addEventListener("loadedmetadata", handleMeta);
    return () => video.removeEventListener("loadedmetadata", handleMeta);
  }, [cameraActive, stream]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Restart camera when facing mode changes
  useEffect(() => {
    if (!cameraActive) return;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setStream(null);
    setCameraActive(false);
    const t = setTimeout(() => startCamera(), 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraFacingMode]);

  const base = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";

  return (
    <div className="space-y-4">
      {/* Customer pill */}
      <div className={`text-sm rounded-lg px-3 py-2 border ${base} ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
        Customer: <span className="font-semibold">{customer.name}</span>
        <span className={`ml-2 ${isDarkMode ? "text-gray-400" : "text-gray-400"}`}>·</span>
        <span className={`ml-2 text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          {customer.points ?? 0} pts
        </span>
      </div>

      {/* Camera capture zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-4 text-center transition-colors",
          extracting ? "opacity-70 cursor-wait" : "",
          preview
            ? isDarkMode ? "border-green-600 bg-green-900/10" : "border-green-400 bg-green-50"
            : isDarkMode ? "border-gray-600" : "border-gray-300"
        )}
      >
        {cameraActive ? (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-h-80 rounded-lg bg-black"
            />
            <div className="flex gap-3 mt-3 justify-center flex-wrap">
              <button
                type="button"
                onClick={capturePhoto}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
              >
                <Camera size={16} /> Capture Photo
              </button>
              <button
                type="button"
                onClick={toggleCamera}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                  isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                )}
              >
                <SwitchCamera size={16} /> Switch Camera
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                  isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                )}
              >
                <X size={16} /> Cancel
              </button>
            </div>
          </div>
        ) : extracting ? (
          <div className="flex flex-col items-center gap-2 py-3">
            <Loader2 size={28} className="animate-spin text-green-500" />
            <p className="text-sm text-green-500 font-medium">Reading receipt...</p>
          </div>
        ) : preview ? (
          <img src={preview} alt="Receipt" className="max-h-40 mx-auto rounded-lg object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <Camera size={30} className="text-gray-400" />
            {cameraError && (
              <p className="text-xs text-red-500 mb-1">{cameraError}</p>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={startCamera}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors">
                <Camera size={14} /> Take Photo
              </button>
              <button type="button" onClick={() => galleryRef.current?.click()}
                className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                  isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                )}>
                <ImageIcon size={14} /> Gallery
              </button>
            </div>
          </div>
        )}
      </div>

      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Extracted amount display */}
      <StaffAmountDisplay
        extracted={extracted}
        amount={amount}
        onAmountChange={setAmount}
      />

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        {file && (
          <button type="button" onClick={reset}
            className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors",
              isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
            )}>
            <RotateCcw size={13} /> Retake
          </button>
        )}
        <button type="button" onClick={onBack}
          className={cn("px-4 py-2 rounded-lg border text-sm transition-colors",
            isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
          )}>
          Back
        </button>
        <button
          type="button"
          disabled={!file || extracting || !amount}
          onClick={() => onContinue({ file, extracted, totalAmount: parseFloat(amount) })}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold text-white transition-colors",
            !file || extracting || !amount
              ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          )}
        >
          <CheckCircle size={15} />
          Continue
        </button>
      </div>
    </div>
  );
};

export default StaffReceiptCapture;
