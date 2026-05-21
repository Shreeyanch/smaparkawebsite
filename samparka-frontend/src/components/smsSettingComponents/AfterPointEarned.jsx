import React, { useState } from "react";
import { toast } from "sonner";
import config from "../../api/config";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const AfterPointEarned = (state) => {
  const [from, setFrom] = useState(state.smsMessage.from);
  const [message, setMessage] = useState(state.smsMessage.message);
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;
  const { isDarkMode } = useTheme();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await config.put(
        `/store/configSMSMessage/${state.store._id}`,
        { from, message, status: state.status },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message, {
          duration: 2000,
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
    }
  };
  return (
    <div className={`border rounded-lg shadow-sm ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-600' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b rounded-t-lg ${
        isDarkMode 
          ? 'border-gray-600 bg-gray-700' 
          : 'border-gray-200 bg-gray-50'
      }`}>
        <h2 className={`text-lg font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Points Earned SMS</h2>
        <p className={`text-sm mt-1 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>Configure the SMS message sent when customers earn points</p>
      </div>

      {/* Form Content */}
      <form className="p-6 space-y-6" onSubmit={handleSubmit}>
        {/* From Field */}
        <div>
          <label
            htmlFor="from"
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            From:
          </label>
          <input
            id="from"
            name="from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            onKeyDown={(e) => {
              if (!/^[a-zA-Z0-9]$/.test(e.key) && e.key !== "Backspace") {
                e.preventDefault();
              }
            }}
            className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
            placeholder="Enter sender name or number"
          />
        </div>

        {/* Message Field */}
        <div>
          <label
            htmlFor="message"
            className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Message:
          </label>
          <textarea
            className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 resize-none ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
            style={{
              minHeight: '120px',
              height: Math.max(120, message.split('\n').length * 24 + 48) + 'px'
            }}
            name="message"
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter points earned notification message..."
          />
          <p className={`text-xs mt-2 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Use short codes like [customer_name], [points_earned], [store_name] to personalize the message
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Save Template
          </button>
        </div>
      </form>
    </div>
  );
};

export default AfterPointEarned;
