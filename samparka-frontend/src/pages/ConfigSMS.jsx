import { Settings } from "lucide-react";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/config";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const ConfigSMS = ({ store }) => {
  // const location = useLocation();
  // const store = location.state?.store;
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [smsToken, setSMSToken] = useState("");
  const { authState } = useAuth();
  const { token } = authState;
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put(
        `/store/configSMS/${store._id}`,
        { smsToken },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message, {
          duration: 2000,

          onAutoClose: () => {
            // if (smsToken !== "") {
            //   navigate("/store/smsSetting", {
            //     state: { store: response.data.config },
            //   });
            // } else {
              navigate("/store");
            // }
          },
        });
      } else {
        toast.error(response.data.message, {
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error(error.message, {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-[400px]">
      {loading && <LoadingSpinner />}
      
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h3 className={`text-lg font-semibold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>SMS Configuration</h3>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Configure your SMS service token for sending text notifications.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SMS Token */}
          <div>
            <label htmlFor="smsToken" className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              SMS Service Token
            </label>
            <div className="relative">
              <input
                type="text"
                id="smsToken"
                name="smsToken"
                value={smsToken}
                onChange={(e) => setSMSToken(e.target.value)}
                placeholder="Enter your SMS service token"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <p className={`text-xs mt-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              This token will be used to authenticate with your SMS service provider (e.g., Twilio, AWS SNS, etc.)
            </p>
          </div>

          {/* Info Section */}
          <div className={`border rounded-lg p-4 ${
            isDarkMode 
              ? 'bg-green-900/20 border-green-700' 
              : 'bg-green-50 border-green-200'
          }`}>
            <h4 className={`text-sm font-medium mb-2 ${
              isDarkMode ? 'text-green-300' : 'text-green-900'
            }`}>SMS Service Integration</h4>
            <ul className={`text-xs space-y-1 ${
              isDarkMode ? 'text-green-200' : 'text-green-700'
            }`}>
              <li>• Supports local gateways like Sparrow SMS and Sparrow Connect.</li>
              <li>• Tokens stored securely with encryption.</li>
              <li>• Used for alerts, and customer notifications.</li>
              <li>• Ensure sufficient credits as per NTA rules.</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className={`pt-4 border-t ${
            isDarkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Saving...' : 'Save SMS Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigSMS;
