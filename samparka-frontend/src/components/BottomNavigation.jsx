import { useState, useCallback, useEffect } from "react";
import {
  Home,
  QrCode,
  Grid3X3,
  Gift,
  User,
  ShoppingBag,
  AlignEndHorizontal,
  CalendarHeart,
  CalendarDays,
  ScanQrCode,
  Download,
  MapPin,
  Receipt,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import QrToggle from "./QrToggle"; // Import your QrToggle component
import { useQueryClient } from "@tanstack/react-query";
import GuideModal from "./GuideModel";
import { toast } from "sonner";

const LeaderboardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M15 21H9v-8.4a.6.6 0 0 1 .6-.6h4.8a.6.6 0 0 1 .6.6V21Zm5.4 0H15v-2.9a.6.6 0 0 1 .6-.6h4.8a.6.6 0 0 1 .6.6v2.3a.6.6 0 0 1-.6.6ZM9 21v-4.9a.6.6 0 0 0-.6-.6H3.6a.6.6 0 0 0-.6.6v4.3a.6.6 0 0 0 .6.6H9Zm1.806-15.887l.909-1.927a.312.312 0 0 1 .57 0l.91 1.927l2.032.311c.261.04.365.376.176.568l-1.47 1.5l.347 2.118c.044.272-.228.48-.462.351l-1.818-1l-1.818 1c-.233.128-.506-.079-.462-.351l.347-2.118l-1.47-1.5c-.19-.192-.085-.528.175-.568l2.034-.31Z"
    />
  </svg>
);

const BottomNavigation = ({
  className = "",
  cardColor = "#275b46",
  isEmbedded = false,
  isPreview = false,
  storeOverride = null,
}) => {
  const [isQrTogglePopupOpen, setQrTogglePopupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const queryClient = useQueryClient();
  const storeQueryData = queryClient.getQueryData(["store"]) || {};
  const storeData = storeOverride || storeQueryData.storeData || {};
  const navigate = useNavigate();

  const [installPrompt, setInstallPrompt] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isPwa, setIsPwa] = useState(false);

  useEffect(() => {
    if (isPreview) return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/i.test(userAgent);
    setIsIOS(isIOSDevice);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone ||
      document.referrer.includes("android-app://");
    setIsPwa(standalone);

    // Read the prompt captured in index.html before React mounted
    if (window.__installPrompt) {
      setInstallPrompt(window.__installPrompt);
    }

    // Also listen for future firings (e.g. after SW takes control on first visit)
    const handler = (e) => {
      e.preventDefault();
      window.__installPrompt = e;
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isPreview]);

  const handleInstall = async () => {


    // For iOS, always show guide (cannot be automated)
    if (isIOS) {
      setShowGuide(true);
      return;
    }

    // For Android with prompt available
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        setInstallPrompt(null);
        window.__installPrompt = null;
        if (outcome !== 'accepted') {
          setShowGuide(true);
        }
      } catch (error) {
        setShowGuide(true);
      }
    } else {
      // Check if already installed as PWA
      if (isPwa) {
        toast.success("App already installed!", {
          description: "You're already using the app",
          duration: 3000,
        });
      } else {
        // Fallback: show guide for Android devices without prompt
        setShowGuide(true);
      }
    }
  };

  const openQrTogglePopup = useCallback(() => {
    setActiveTab("qr");
    if (!isPreview) {
      setQrTogglePopupOpen(true);
    }
  }, []);

  const closeQrTogglePopup = useCallback(() => {
    setQrTogglePopupOpen(false);
    setActiveTab("home");
  }, []);

  const onHomeClick = useCallback(() => {
    setActiveTab("home");
    if (!isPreview) {
      navigate("/loyality");
    }
  }, [navigate, isPreview]);

  const onIconSetClick = useCallback(() => {
    setActiveTab("business");
    if (!isPreview) {
      navigate("/wallet");
    }
  }, [navigate, isPreview]);

  const onIconSetClick1 = useCallback(() => {
    setActiveTab("rewards");
  }, []);

  const onIconSetClick2 = useCallback(() => {
    setActiveTab("profile");
  }, []);

  const hasReservation = storeData.services?.reservation;
  const hasEcommerce = storeData.services?.ecommerce?.status;
  const hasLeaderboard = storeData.services?.leaderboard;
  const hasMap = storeData.loyaltyCard?.format === "L6";
  // Receipt scan commented out for customer side
  // const hasReceiptScan = storeData.receiptScan?.enabled;
  const hasReceiptScan = false;

  let dynamicItems = [];

  const mapBtn = hasMap && {
    id: "map",
    icon: MapPin,
    onClick: navigate.bind(null, "/map"),
  };

  // Case 1: All three true → show reservation, QR, ecommerce (no leaderboard)
  // Case 1: All 3 features true → show all, but install only if not PWA
  if (hasReservation && hasEcommerce && hasLeaderboard) {
    dynamicItems = [
      {
        id: "reservation",
        icon: CalendarDays,
        onClick: navigate.bind(null, "/reservation"),
      },
      {
        id: "qr",
        icon: ScanQrCode,
        onClick: openQrTogglePopup,
      },
      !isPwa && {
        id: "install",
        icon: Download,
        onClick: handleInstall,
      },
      {
        id: "ecommerce",
        icon: ShoppingBag,
        onClick: navigate.bind(null, "/products"),
      },
      mapBtn,
    ].filter(Boolean);
  }
  // Case 2: Any two features true
  else if (
    (hasReservation && hasEcommerce) ||
    (hasReservation && hasLeaderboard) ||
    (hasEcommerce && hasLeaderboard)
  ) {
    const first = hasReservation
      ? {
          id: "reservation",
          icon: CalendarDays,
          onClick: navigate.bind(null, "/reservation"),
        }
      : hasLeaderboard && {
          id: "leaderboard",
          icon: LeaderboardIcon,
          onClick: navigate.bind(null, "/leaderboard"),
        };

    const second = {
      id: "qr",
      icon: ScanQrCode,
      onClick: openQrTogglePopup,
    };

    const installBtn = !isPwa && {
      id: "install",
      icon: Download,
      onClick: handleInstall,
    };

    const third =
      hasEcommerce && !hasReservation
        ? {
            id: "ecommerce",
            icon: ShoppingBag,
            onClick: navigate.bind(null, "/products"),
          }
        : hasLeaderboard && !hasEcommerce
        ? {
            id: "leaderboard",
            icon: LeaderboardIcon,
            onClick: navigate.bind(null, "/leaderboard"),
          }
        : hasEcommerce
        ? {
            id: "ecommerce",
            icon: ShoppingBag,
            onClick: navigate.bind(null, "/products"),
          }
        : null;

    dynamicItems = [first, second, installBtn, third, mapBtn].filter(Boolean);
  }
  // Case 3: Only one feature true + QR
  else {
    const first = hasReservation
      ? {
          id: "reservation",
          icon: CalendarDays,
          onClick: navigate.bind(null, "/reservation"),
        }
      : hasEcommerce
      ? {
          id: "ecommerce",
          icon: ShoppingBag,
          onClick: navigate.bind(null, "/products"),
        }
      : hasLeaderboard
      ? {
          id: "leaderboard",
          icon: LeaderboardIcon,
          onClick: navigate.bind(null, "/leaderboard"),
        }
      : null;

    const installBtn = !isPwa && {
      id: "install",
      icon: Download,
      onClick: handleInstall,
    };

    const qrBtn = {
      id: "qr",
      icon: ScanQrCode,
      onClick: openQrTogglePopup,
    };

    dynamicItems = [first, installBtn, qrBtn, mapBtn].filter(Boolean);
  }

  if (hasReceiptScan) {
    dynamicItems.push({
      id: "receipt",
      icon: Receipt,
      onClick: navigate.bind(null, "/scanReceipt"),
    });
  }

  const navItems = dynamicItems;

  const wrapperClasses = isEmbedded
    ? `w-full ${className}`
    : `fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[50] ${className}`;

  return (
    <>
      {showGuide && (
        <GuideModal isIOS={isIOS} onClose={() => setShowGuide(false)} />
      )}
      <div className={wrapperClasses}>
        <div className="bg-white rounded-full px-6 py-3 shadow-2xl border border-gray-200">
          <div className="flex items-center space-x-6 relative">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  disabled={isPreview}
                  className={`relative flex items-center justify-center p-3 rounded-full transition-all duration-300 ease-out group ${
                    isActive
                      ? `bg-[${cardColor}] text-white transform scale-110 shadow-lg`
                      : `text-gray-600 hover:text-[${cardColor}] hover:bg-red-50`
                  }`}
                >
                  <Icon
                    size={22}
                    className={`transition-all duration-300 ${
                      isActive ? "scale-110" : "group-hover:scale-105"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {!isEmbedded && (
          <div className="absolute inset-0 bg-[#275b46] opacity-20 rounded-full blur-xl -z-10"></div>
        )}
      </div>

      {/* QR Toggle Popup */}
      {isQrTogglePopupOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeQrTogglePopup}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <QrToggle
              onClose={closeQrTogglePopup}
              // Add any other props your QrToggle component needs
            />
          </div>
        </div>
      )}
    </>
  );
};

export default BottomNavigation;
