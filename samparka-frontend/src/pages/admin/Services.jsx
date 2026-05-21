import React, { useState, useEffect } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  BadgeCheck,
  Gift,
  CalendarCheck,
  ShoppingCart,
  Gamepad2,
  Share2,
  Store,
  X,
  Settings,
  Waypoints,
  GiftIcon,
  Receipt,
} from "lucide-react";
import config from "../../api/config";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const Services = ({ store, onClose, onSuccess }) => {
  // Safety check
  if (!store) {
    return null;
  }

  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { authState } = useAuth();
  const { isDarkMode } = useTheme();
  const { token } = authState;

  // Trigger animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Sync local services state when store prop updates
  useEffect(() => {
    if (store) {
      setServices({
        loyalty: store.services.loyalty,
        reservation: store.services.reservation,
        ecommerce: store.services.ecommerce?.status || false,
        games: store.services.games,
        multipleOutlets: store.services.multipleOutlets,
        leaderboard: store.services.leaderboard,
        powered: store.services.powered,
        onGoingOffers: store.services.onGoingOffers,
        l5: store.services.l5 || false,
        receiptScan: store.receiptScan?.enabled || false,
      });
      setOcrProvider(store.receiptScan?.ocrProvider || "paddleocr");
    }
  }, [store]);

  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  // Services state management
  const [services, setServices] = useState({
    loyalty: store.services.loyalty,
    reservation: store.services.reservation,
    ecommerce: store.services.ecommerce?.status || false,
    games: store.services.games,
    multipleOutlets: store.services.multipleOutlets,
    leaderboard: store.services.leaderboard,
    powered: store.services.powered,
    onGoingOffers: store.services.onGoingOffers,
    l5: store.services.l5 || false,
    receiptScan: store.receiptScan?.enabled || false,
  });

  const [ocrProvider, setOcrProvider] = useState(
    store.receiptScan?.ocrProvider || "paddleocr"
  );

  const handleOcrProviderChange = async (provider) => {
    setOcrProvider(provider);
    try {
      await config.put(
        `/store/editServices/${store._id}`,
        { service: "receiptScan", ocrProvider: provider },
        { headers: { token } }
      );
      toast.success("OCR model updated", { duration: 1500 });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update OCR model", { duration: 2000 });
    }
  };

  // Toggle function
  const handleToggle = async (service) => {
    // Store previous state for rollback
    const previousServices = { ...services };
    
    // Update state immediately for instant UI feedback
    const updatedServices = {
      ...services,
      [service]: !services[service],
    };
    setServices(updatedServices);
    
    setIsLoading(true);

    try {
      const response = await config.put(
        `/store/editServices/${store._id}`,
        {
          service,
        },
        { headers: { token } }
      );

      if (response.status === 200) {
        toast.success("Service updated successfully!", {
          duration: 2000,
        });
        // Call onSuccess to refresh parent's store data without closing modal
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      // Revert state on error
      setServices(previousServices);
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update service", {
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Service list
  const serviceOptions = [
    { key: "loyalty", label: "Loyalty", icon: <Gift />, link: "/loyalty" },
    {
      key: "reservation",
      label: "Reservation",
      icon: <CalendarCheck />,
      link: "/reservation",
    },
    {
      key: "ecommerce",
      label: "E-Commerce",
      icon: <ShoppingCart />,
      link: "/ecommerce",
    },
    { key: "games", label: "Games", icon: <Gamepad2 />, link: "/games" },
    {
      key: "multipleOutlets",
      label: "Multiple Outlets",
      icon: <Store />,
      link: "/multipleOutlets",
    },
    {
      key: "leaderboard",
      label: "Leaderboard",
      icon: <Share2 />,
      link: "/leaderboard",
    },
    {
      key: "powered",
      label: "Powered by Samparka",
      icon: <Waypoints />,
      link: "/powered",
    },
    {
      key: "onGoingOffers",
      label: "On Going Offers",
      icon: <GiftIcon />,
      link: "/onGoingOffers",
    },
    {
      key: "l5",
      label: "L5 Premium Loyalty",
      icon: <Gift />,
      link: "/l5",
    },
    {
      key: "receiptScan",
      label: "Receipt Scan",
      icon: <Receipt />,
      link: "/receiptScan",
    },
  ];

  // Helper function to get service descriptions
  function getServiceDescription(key) {
    const descriptions = {
      loyalty: "Reward customers with points for purchases",
      reservation: "Allow customers to book tables or appointments",
      ecommerce: "Enable online ordering and delivery",
      games: "Engage customers with interactive games",
      multipleOutlets: "Manage multiple store locations",
      leaderboard: "Display top customers and achievements",
      powered: "Allow to display 'Powered by Samparka'",
      onGoingOffers: "Display on going offers to your customers",
      l5: "Enable L5 premium outlet-specific loyalty system",
      receiptScan: "Allow customers to earn points by uploading receipts",
    };
    return descriptions[key] || "Manage this service for your store";
  }

  return (
    <div
      className={`fixed inset-0 bg-black transition-opacity duration-300 ease-out flex items-center justify-end z-50 p-4 ${
        isVisible ? "bg-opacity-50" : "bg-opacity-0"
      }`}
      onClick={handleClose}
    >
      {isLoading && <LoadingSpinner />}

      <div
        className={`rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col transform transition-transform duration-300 ease-out ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } ${isVisible ? "translate-x-0" : "translate-x-full"}`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Fixed */}
        <div
          className={`flex items-center justify-between p-6 border-b sticky top-0 z-10 rounded-t-lg ${
            isDarkMode
              ? "border-gray-600 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <h2
            className={`flex gap-2 items-center text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            <Settings className="w-6 h-6" />
            Services - {store.name}
          </h2>
          <button
            onClick={handleClose}
            className={`transition-colors ${
              isDarkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div
          className="flex-1 overflow-y-auto p-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="space-y-6">
            {/* Header Info */}
            <div
              className={`border rounded-lg p-4 ${
                isDarkMode
                  ? "bg-blue-900/20 border-blue-700"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-center gap-2 text-green-600">
                <BadgeCheck className="w-5 h-5" />
                <span className="font-medium">Manage Store Services</span>
              </div>
              <p className="text-green-600 text-sm mt-1">
                Enable or disable services for your store. Changes will be
                applied immediately.
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 gap-4">
              {serviceOptions.map(({ key, label, icon, link }) => (
                <div
                  key={key}
                  className={`border rounded-lg p-4 transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`p-2 rounded-lg border ${
                          isDarkMode
                            ? "bg-gray-800 border-gray-600"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <span
                          className={`${
                            isDarkMode ? "text-white" : "text-black"
                          }`}
                        >
                          {icon}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`font-medium ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {label}
                          </h3>
                        </div>
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {getServiceDescription(key)}
                        </p>
                      </div>
                    </div>

                    {/* Enhanced Toggle Switch */}
                    <div
                      onClick={() => handleToggle(key)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full cursor-pointer transition-colors duration-200 ${
                        services[key]
                          ? "bg-green-500"
                          : isDarkMode
                          ? "bg-gray-600"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
                          services[key] ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                      {/* Status Text */}
                      {/* <span
                        className={`absolute inset-0 flex items-center justify-center text-xs font-medium transition-opacity duration-200 ${
                          services[key] 
                            ? "text-white opacity-100" 
                            : "text-gray-600 opacity-100"
                        }`}
                        style={{
                          paddingLeft: services[key] ? "4px" : "20px",
                          paddingRight: services[key] ? "20px" : "4px"
                        }}
                      >
                        {services[key] ? "ON" : "OFF"}
                      </span> */}
                    </div>
                  </div>

                  {/* OCR Model Selector — shown only for receiptScan when enabled */}
                  {key === "receiptScan" && services.receiptScan && (
                    <div
                      className={`mt-3 pt-3 border-t ${
                        isDarkMode ? "border-gray-600" : "border-gray-200"
                      }`}
                    >
                      <p
                        className={`text-xs font-medium mb-2 ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        OCR Model
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {[
                          { value: "paddleocr", label: "PaddleOCR", sub: "Fast · Local" },
                          { value: "google_vision", label: "Google Vision", sub: "Accurate · Cloud" },
                          { value: "openai", label: "OpenAI GPT-4o", sub: "Most Accurate · Cloud" },
                          { value: "gemini", label: "Gemini Flash-Lite", sub: "Fast · AI Vision" },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleOcrProviderChange(opt.value)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-colors ${
                              ocrProvider === opt.value
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                : isDarkMode
                                ? "border-gray-600 hover:border-gray-500"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <span
                              className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                                ocrProvider === opt.value
                                  ? "border-green-500 bg-green-500"
                                  : isDarkMode
                                  ? "border-gray-500"
                                  : "border-gray-300"
                              }`}
                            />
                            <span className={isDarkMode ? "text-white" : "text-gray-900"}>
                              {opt.label}
                            </span>
                            <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-400"}`}>
                              {opt.sub}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        {/* <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Services;
