import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { Mail, Settings, MessageCircle, X, Store } from "lucide-react";
import { toast } from "sonner";
import config from "../api/config";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ConfigSMTP from "../pages/ConfigSMTP";
import ConfigSMS from "../pages/ConfigSMS";

const ConfigModal = ({ store, isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("smtpConfig");
  const [isVisible, setIsVisible] = useState(false);
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;

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
        isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`rounded-lg w-full sm:max-w-lg md:max-w-2xl max-h-[99vh] sm:max-h-[98vh] overflow-hidden transform transition-transform duration-300 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        } ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
        style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
        onClick={(e) => e.stopPropagation()}
      >
        {loading && <LoadingSpinner />}
        
        {/* Modal Header */}
        <div className={`flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 z-10 rounded-t-lg ${
          isDarkMode 
            ? 'border-gray-600 bg-gray-800' 
            : 'border-gray-200 bg-white'
        }`}>
          <h2 className={`flex gap-2 items-center text-xl font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <div className={`p-2 rounded-lg ${
              isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
            }`}>
              <Settings className={`h-5 w-5 ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`} />
            </div>
            <span className="hidden sm:inline">Configuration Settings</span>
            <span className="sm:hidden">Config</span>
          </h2>
          <button
            onClick={handleClose}
            className={`transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-gray-200' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Store Info */}
        <div className="px-4 pt-3">
          <div className={`flex gap-1 items-center ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <Store className="h-4 w-4" />
            <span className="text-sm font-medium truncate">Store: {store?.name}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 pt-4">
          <div className={`border-b ${
            isDarkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <nav className="flex space-x-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("smtpConfig")}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "smtpConfig"
                    ? "border-green-500 text-green-600"
                    : isDarkMode 
                      ? "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${
                  activeTab === "smtpConfig" 
                    ? isDarkMode ? "bg-green-900/30" : "bg-green-50"
                    : isDarkMode ? "bg-gray-700" : "bg-gray-50"
                }`}>
                  <Mail className={`h-4 w-4 ${
                    activeTab === "smtpConfig" 
                      ? isDarkMode ? "text-green-400" : "text-green-600"
                      : isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`} />
                </div>
                <span className="hidden sm:inline">SMTP Configuration</span>
                <span className="sm:hidden">SMTP</span>
              </button>
              
              <button
                onClick={() => setActiveTab("smsConfig")}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "smsConfig"
                    ? "border-green-500 text-green-600"
                    : isDarkMode 
                      ? "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${
                  activeTab === "smsConfig" 
                    ? isDarkMode ? "bg-green-900/30" : "bg-green-50"
                    : isDarkMode ? "bg-gray-700" : "bg-gray-50"
                }`}>
                  <MessageCircle className={`h-4 w-4 ${
                    activeTab === "smsConfig" 
                      ? isDarkMode ? "text-green-400" : "text-green-600"
                      : isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`} />
                </div>
                <span className="hidden sm:inline">SMS Configuration</span>
                <span className="sm:hidden">SMS</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto" style={{maxHeight: 'calc(100vh - 200px)'}}>
          {activeTab === "smtpConfig" && <ConfigSMTP store={store} />}
          {activeTab === "smsConfig" && <ConfigSMS store={store} />}
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;
