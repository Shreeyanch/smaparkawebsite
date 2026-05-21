import React, { useState, useEffect } from "react";
import { X, BellRing, Mail, MessageCircle } from "lucide-react";
import EmailSetting from "../pages/EmailSetting";
import SMSSetting from "../pages/SMSSetting";
import NotificationSetting from "../pages/NotificationSetting";
import LoadingSpinner from "./LoadingSpinner";
import { useTheme } from "../context/ThemeContext";

const MessageNotificationSettingModal = ({ store, isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("notification");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Handle modal animation
  useEffect(() => {
    if (isOpen) {
      // Trigger animation after a short delay
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black transition-opacity duration-300 flex items-center justify-end z-50 p-2 sm:p-4 ${
        isVisible ? "bg-opacity-50" : "bg-opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`rounded-xl shadow-2xl w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform transition-transform duration-300 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        } ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading Overlay */}
        {/* {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
            <LoadingSpinner />
          </div>
        )} */}

        {/* Header */}
        <div
          className={`border-b px-4 sm:px-6 py-4 ${
            isDarkMode
              ? "bg-gray-800 border-gray-600"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  isDarkMode ? "bg-green-900/30" : "bg-green-50"
                }`}
              >
                <BellRing
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${
                    isDarkMode ? "text-green-400" : "text-green-600"
                  }`}
                />
              </div>
              <div>
                <h2
                  className={`text-lg sm:text-xl font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Message/Notification Setting
                </h2>
                <p
                  className={`text-xs sm:text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Store: {store?.name}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`}
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          className={`border-b ${
            isDarkMode
              ? "bg-gray-800 border-gray-600"
              : "bg-white border-gray-200"
          }`}
        >
          <nav
            className="flex px-4 sm:px-6 overflow-x-auto scrollbar-hide"
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
              onClick={() => setActiveTab("mail")}
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
        </div>

        {/* Content Area */}
        <div
          className={`overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-140px)] ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="p-3 sm:p-6">
            {activeTab === "mail" && (
              <EmailSetting store={store} setLoading={setLoading} />
            )}
            {activeTab === "sms" && (
              <SMSSetting store={store} setLoading={setLoading} />
            )}
            {activeTab === "notification" && (
              <NotificationSetting store={store} setLoading={setLoading} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageNotificationSettingModal;
