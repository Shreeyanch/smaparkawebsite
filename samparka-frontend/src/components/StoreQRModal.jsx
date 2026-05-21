import { useState, useEffect, useRef } from "react";
import { X, Download, ImagePlus, Trash2, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/config";
import StoreQRFlyer from "./StoreQRFlyer";

const StoreQRModal = ({ isOpen, store, onClose, onStoreUpdate }) => {
  const { isDarkMode } = useTheme();
  const { authState } = useAuth();
  const { token } = authState;
  const [isVisible, setIsVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);
  const [customBg, setCustomBg] = useState(null);
  const [flyerImages, setFlyerImages] = useState({});
  const flyerRef = useRef(null);
  const bgInputRef = useRef(null);

  // Pre-fetch all store images as base64 via backend (avoids CORS issues)
  useEffect(() => {
    if (!isOpen || !store) return;
    setIsVisible(true);
    setImagesReady(false);
    setCustomBg(store.qrStandBg || null);
    if (!store.url) return;

    fetch(`${import.meta.env.VITE_SERVER_BASE_URL}flyer-images/${store.url}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((data) => {
        setFlyerImages(data);
        if (data.qrStandBg) setCustomBg(data.qrStandBg);
        setImagesReady(true);
      })
      .catch(() => {
        setFlyerImages({});
        setImagesReady(true);
      });
  }, [isOpen, store]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const fileToBase64 = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

  const handleBgUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    // Show base64 preview immediately (also used for download)
    const base64 = await fileToBase64(file);
    setCustomBg(base64);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("qrStandBg", file);
      const response = await api.put(
        `/store/editStore?storeId=${store._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data", token } }
      );
      if (response.data.success) {
        onStoreUpdate?.(response.data.store);
        toast.success("Background image saved");
      } else {
        toast.error(response.data.message || "Failed to upload background");
        setCustomBg(null);
      }
    } catch (error) {
      console.error("❌ Background upload error:", error);
      toast.error("Failed to upload background image");
      setCustomBg(null);
    } finally {
      setUploading(false);
    }
  };

  const handleBgRemove = async () => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("removeQrStandBg", "true");
      const response = await api.put(
        `/store/editStore?storeId=${store._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data", token } }
      );
      if (response.data.success) {
        setCustomBg(null);
        onStoreUpdate?.(response.data.store);
        toast.success("Background image removed");
      } else {
        toast.error(response.data.message || "Failed to remove background");
      }
    } catch (error) {
      console.error("❌ Background remove error:", error);
      toast.error("Failed to remove background image");
    } finally {
      setUploading(false);
    }
  };

  const getQRUrl = () => {
    const baseUrl = import.meta.env.VITE_CLIENT_BASE_URL.replace(/^https?:\/\//, "");
    const protocol = baseUrl.includes("localhost") ? "http" : "https";
    return `${protocol}://${store.url}.${baseUrl}/loyality/`;
  };

  const imgToBase64 = async (src) => {
    // Already a data URL — no fetch needed
    if (src.startsWith("data:")) return src;
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch {
      // Direct fetch failed (CORS) — try backend proxy for S3 URLs
      try {
        const proxyRes = await fetch(
          `${import.meta.env.VITE_SERVER_BASE_URL}proxy-image?url=${encodeURIComponent(src)}`
        );
        if (proxyRes.ok) {
          const json = await proxyRes.json();
          if (json.data) return json.data;
        }
      } catch {}
      return src;
    }
  };

  const handleDownload = async () => {
    if (!flyerRef.current || downloading) return;
    setDownloading(true);
    try {
      const node = flyerRef.current;

      // Pre-convert all <img> srcs to base64 so html-to-image doesn't fetch them via CORS
      const imgs = Array.from(node.querySelectorAll("img"));
      const origSrcs = imgs.map((img) => img.getAttribute("src"));
      await Promise.all(
        imgs.map(async (img) => {
          const b64 = await imgToBase64(img.src);
          img.src = b64;
        })
      );

      const dataUrl = await toPng(node, { pixelRatio: 2, skipFonts: true });

      // Restore original srcs
      imgs.forEach((img, i) => { img.src = origSrcs[i]; });

      const link = document.createElement("a");
      link.download = store?.name ? `${store.name}-QR-Flyer.png` : "QR-Flyer.png";
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("❌ Download error:", error);
      toast.error("Failed to download: " + (error.message || "Unknown error"));
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen || !store) return null;

  return (
    <div
      className={`fixed inset-0 bg-black transition-opacity duration-300 flex items-center justify-center z-50 p-4 ${
        isVisible ? "bg-opacity-50" : "bg-opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col transform transition-all duration-300 overflow-hidden ${
          isDarkMode ? "bg-gray-800" : "bg-gray-100"
        } ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}>
          <h2 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Store QR Flyer</h2>
          <button onClick={handleClose} className={`p-1 rounded-full transition-colors ${
            isDarkMode ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          }`}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <StoreQRFlyer store={store} qrUrl={getQRUrl()} flyerRef={flyerRef} customBg={customBg} flyerImages={flyerImages} />
        </div>

        <div className={`p-4 border-t flex items-center gap-2 ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}>
          <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
          {customBg ? (
            <button
              onClick={handleBgRemove}
              disabled={uploading}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                isDarkMode ? "bg-red-900/30 hover:bg-red-900/50 text-red-400" : "bg-red-50 hover:bg-red-100 text-red-600"
              }`}
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Remove Background
            </button>
          ) : (
            <button
              onClick={() => bgInputRef.current?.click()}
              disabled={uploading}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
              {uploading ? "Uploading..." : "Add Background Image"}
            </button>
          )}
          <button
            onClick={handleDownload}
            disabled={downloading || !imagesReady}
            className="flex items-center justify-center p-2.5 rounded-xl font-medium bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white transition-colors"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreQRModal;
