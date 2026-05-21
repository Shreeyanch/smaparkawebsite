import React, { useState } from "react";
import { toast } from "sonner";
import config from "../../api/config";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { X, Plus } from "lucide-react";

const OnPointExpire = (state) => {
  const [title, setTitle] = useState(state.notifications.title || "Points Expiring Soon! ⏰");
  const [body, setBody] = useState(state.notifications.body || "Hi [customer_name], your loyalty points will expire in [days_remaining] day(s). Use them before they're gone!");
  const [daysBeforeExpiry, setDaysBeforeExpiry] = useState(
    state.notifications.daysBeforeExpiry || [7, 3, 1]
  );
  const [newDay, setNewDay] = useState("");
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;
  const { isDarkMode } = useTheme();

  const handleAddDay = () => {
    const dayValue = parseInt(newDay);
    if (isNaN(dayValue) || dayValue < 1 || dayValue > 365) {
      toast.error("Please enter a valid number between 1 and 365");
      return;
    }
    if (daysBeforeExpiry.includes(dayValue)) {
      toast.error("This day is already added");
      return;
    }
    setDaysBeforeExpiry([...daysBeforeExpiry, dayValue].sort((a, b) => b - a));
    setNewDay("");
  };

  const handleRemoveDay = (dayToRemove) => {
    if (daysBeforeExpiry.length <= 1) {
      toast.error("At least one notification day is required");
      return;
    }
    setDaysBeforeExpiry(daysBeforeExpiry.filter((day) => day !== dayToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (daysBeforeExpiry.length === 0) {
      toast.error("Please add at least one notification day");
      return;
    }
    try {
      const response = await config.put(
        `/store/configNotifications/${state.store._id}`,
        { title, body, daysBeforeExpiry, status: state.status },
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
    <div className="max-w-2xl mx-auto">
      <div className={`rounded-lg border shadow-sm p-6 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-600' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="mb-6">
          <h3 className={`text-lg font-semibold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Point Expiry Notification</h3>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Configure notifications sent to customers before their loyalty points expire.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Days Before Expiry */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Days Before Expiry to Notify
            </label>
            <p className={`text-xs mb-3 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Notifications will be sent on these specific days before points expire.
            </p>
            
            {/* Current Days */}
            <div className="flex flex-wrap gap-2 mb-3">
              {daysBeforeExpiry.map((day) => (
                <span
                  key={day}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                    isDarkMode 
                      ? 'bg-green-900/50 text-green-300' 
                      : 'bg-green-50 text-green-700'
                  }`}
                >
                  {day} day{day > 1 ? 's' : ''}
                  <button
                    type="button"
                    onClick={() => handleRemoveDay(day)}
                    className={`ml-1 hover:bg-opacity-80 rounded-full p-0.5 transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-green-800 text-green-400' 
                        : 'hover:bg-green-200 text-green-600'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add New Day */}
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="365"
                value={newDay}
                onChange={(e) => setNewDay(e.target.value)}
                placeholder="Enter days"
                className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              <button
                type="button"
                onClick={handleAddDay}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Notification Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Body */}
          <div>
            <label
              htmlFor="body"
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Notification Message
            </label>
            <textarea
              id="body"
              name="body"
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter notification message..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors resize-vertical ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <p className={`text-xs mt-2 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Available short codes: [customer_name], [store_name], [days_remaining]
            </p>
          </div>

          {/* Submit Button */}
          <div className={`pt-4 border-t ${
            isDarkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Save Point Expiry Notification Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnPointExpire;
