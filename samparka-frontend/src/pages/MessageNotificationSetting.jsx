import React, { useState, useEffect } from "react";
import { BellRing, Mail, MessageCircle, Settings } from "lucide-react";
import EmailSetting from "../pages/EmailSetting";
import SMSSetting from "../pages/SMSSetting";
import NotificationSetting from "../pages/NotificationSetting";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfigModal from "../components/ConfigModal";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/config";
import StoreSelector from "../components/common/StoreSelector";

const MessageNotificationSetting = () => {
  const { isDarkMode } = useTheme();
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;
  const [activeTab, setActiveTab] = useState("notification");
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(localStorage.getItem("notificationSettingStore") || "");
  const [isLoading, setIsLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Get selected store object
  const store = stores.find(s => s._id === selectedStoreId) || null;

  // Check if SMTP is configured
  const isSmtpConfigured = store?.email && store?.pass;

  // Fetch stores
  useEffect(() => {
    const fetchStores = async () => {
      if (!token) return;
      
      setIsLoading(true);
      try {
        const endpoint = user?.role === "admin" ? "/store" : "/store/myStores";
        const response = await api.get(endpoint, { headers: { token } });
        if (response.data.success && response.data.stores?.length > 0) {
          setStores(response.data.stores);
          // Auto-select first store if none selected
          if (!selectedStoreId) {
            setSelectedStoreId(response.data.stores[0]._id);
          }
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, [token, user?.role]);

  // Save selected store to localStorage
  useEffect(() => {
    if (selectedStoreId) {
      localStorage.setItem("notificationSettingStore", selectedStoreId);
    }
  }, [selectedStoreId]);

  if (isLoading) {
    return (
      <div className={`px-2 sm:px-4 ml-0 lg:ml-64 min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-[#f2f5f9]"}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className={`px-2 sm:px-4 ml-0 lg:ml-64 min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-[#f2f5f9]"}`}>
        <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>No store found</p>
      </div>
    );
  }

  return (
    <div
      className={`px-2 sm:px-4 ml-0 lg:ml-64 min-h-screen ${
        isDarkMode ? "bg-gray-900" : "bg-[#f2f5f9]"
      }`}
    >
      {loading && <LoadingSpinner />}

      {/* Header Section */}
      <div
        className={`flex flex-col lg:flex-row lg:items-center lg:justify-between w-full mb-6 p-4 border-b-2 gap-4 ${
          isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-[#f2f5f9] border-gray-200"
        }`}
      >
        {/* Left: Title and Description */}
        <div className="flex flex-col gap-1">
          <h1
            className={`text-2xl font-medium ${
              isDarkMode ? "text-white" : "text-black"
            }`}
          >
            Notification Setting
          </h1>
          <p
            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Configure email, SMS and push notification settings
          </p>
        </div>

        {/* Right: Store Selector */}
        <div className="flex flex-col sm:flex-row gap-3">
          <StoreSelector
            selectedStoreId={selectedStoreId}
            onStoreIdChange={setSelectedStoreId}
            variant="default"
            customStores={stores}
            fetchOnMount={false}
          />
        </div>
      </div>

      {/* Content Card */}
      <div className="px-4">
        <div
          className={`rounded-xl shadow-lg overflow-hidden ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          {/* Navigation Tabs */}
          <div
            className={`border-b ${
              isDarkMode
                ? "bg-gray-800 border-gray-600"
                : "bg-white border-gray-200"
            }`}
          >
          <div className="flex items-center justify-between px-4 sm:px-6">
          <nav
            className="flex overflow-x-auto scrollbar-hide"
            aria-label="Tabs"
          >
            <button
              onClick={() => setActiveTab("notification")}
              className={`flex items-center gap-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                activeTab === "notification"
                  ? isDarkMode
                    ? "border-green-400 text-green-400"
                    : "border-green-500 text-green-600"
                  : isDarkMode
                  ? "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div
                className={`p-1 sm:p-1.5 rounded-lg ${
                  activeTab === "notification"
                    ? isDarkMode
                      ? "bg-green-900/30"
                      : "bg-green-50"
                    : isDarkMode
                    ? "bg-gray-700"
                    : "bg-gray-50"
                }`}
              >
                <BellRing
                  className={`h-3 w-3 sm:h-4 sm:w-4 ${
                    activeTab === "notification"
                      ? isDarkMode
                        ? "text-green-400"
                        : "text-green-600"
                      : isDarkMode
                      ? "text-gray-500"
                      : "text-gray-400"
                  }`}
                />
              </div>
              Notification
            </button>

            <button
              onClick={() => {
                if (isSmtpConfigured) {
                  setActiveTab("mail");
                } else {
                  setShowConfigModal(true);
                }
              }}
              className={`flex items-center gap-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ml-4 sm:ml-8 ${
                activeTab === "mail"
                  ? isDarkMode
                    ? "border-green-400 text-green-400"
                    : "border-green-500 text-green-600"
                  : isDarkMode
                  ? "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div
                className={`p-1 sm:p-1.5 rounded-lg ${
                  activeTab === "mail"
                    ? isDarkMode
                      ? "bg-green-900/30"
                      : "bg-green-50"
                    : isDarkMode
                    ? "bg-gray-700"
                    : "bg-gray-50"
                }`}
              >
                <Mail
                  className={`h-3 w-3 sm:h-4 sm:w-4 ${
                    activeTab === "mail"
                      ? isDarkMode
                        ? "text-green-400"
                        : "text-green-600"
                      : isDarkMode
                      ? "text-gray-500"
                      : "text-gray-400"
                  }`}
                />
              </div>
              Email
            </button>

            <button
              onClick={() => setActiveTab("sms")}
              className={`flex items-center gap-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ml-4 sm:ml-8 ${
                activeTab === "sms"
                  ? isDarkMode
                    ? "border-green-400 text-green-400"
                    : "border-green-500 text-green-600"
                  : isDarkMode
                  ? "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div
                className={`p-1 sm:p-1.5 rounded-lg ${
                  activeTab === "sms"
                    ? isDarkMode
                      ? "bg-green-900/30"
                      : "bg-green-50"
                    : isDarkMode
                    ? "bg-gray-700"
                    : "bg-gray-50"
                }`}
              >
                <MessageCircle
                  className={`h-3 w-3 sm:h-4 sm:w-4 ${
                    activeTab === "sms"
                      ? isDarkMode
                        ? "text-green-400"
                        : "text-green-600"
                      : isDarkMode
                      ? "text-gray-500"
                      : "text-gray-400"
                  }`}
                />
              </div>
              SMS
            </button>
          </nav>

          {/* Configuration Button */}
          <button
            onClick={() => setShowConfigModal(true)}
            className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ml-4 ${
              isDarkMode
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configuration</span>
          </button>
          </div>
        </div>

        {/* Content Area */}
          <div
            className={`p-3 sm:p-6 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            {store ? (
              <>
                {activeTab === "mail" && (
                  <EmailSetting store={store} setLoading={setLoading} />
                )}
                {activeTab === "sms" && (
                  <SMSSetting store={store} setLoading={setLoading} />
                )}
                {activeTab === "notification" && (
                  <NotificationSetting store={store} setLoading={setLoading} />
                )}
              </>
            ) : (
              <div className={`flex items-center justify-center h-40 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                <p>Please select a store</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Config Modal */}
      {showConfigModal && store && (
        <ConfigModal
          store={store}
          isOpen={showConfigModal}
          onClose={() => {
            setShowConfigModal(false);
          }}
        />
      )}
    </div>
  );
};

export default MessageNotificationSetting;