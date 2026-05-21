import { useTheme } from "../../context/ThemeContext";
import { Send, Clock } from "lucide-react";

export default function SchedulePicker({
  scheduleType,
  onScheduleTypeChange,
  scheduledFor,
  onScheduledForChange,
}) {
  const { isDarkMode } = useTheme();

  // Get minimum datetime (now + 5 minutes)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="space-y-4">
      <h3 className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
        When to Send
      </h3>

      <div className="flex gap-3">
        {/* Send Now option */}
        <button
          onClick={() => onScheduleTypeChange("now")}
          className={`flex-1 flex items-center gap-3 p-4 rounded-lg border transition-all ${
            scheduleType === "now"
              ? "bg-green-600 border-green-600 text-white"
              : isDarkMode
              ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Send className="w-5 h-5" />
          <div className="text-left">
            <p className="font-medium">Send Now</p>
            <p className={`text-sm ${scheduleType === "now" ? "text-green-100" : isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Messages will be sent immediately
            </p>
          </div>
        </button>

        {/* Schedule for Later option */}
        <button
          onClick={() => onScheduleTypeChange("later")}
          className={`flex-1 flex items-center gap-3 p-4 rounded-lg border transition-all ${
            scheduleType === "later"
              ? "bg-green-600 border-green-600 text-white"
              : isDarkMode
              ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Clock className="w-5 h-5" />
          <div className="text-left">
            <p className="font-medium">Schedule for Later</p>
            <p className={`text-sm ${scheduleType === "later" ? "text-green-100" : isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Choose a specific date and time
            </p>
          </div>
        </button>
      </div>

      {/* Date/time picker for scheduled */}
      {scheduleType === "later" && (
        <div className="mt-4">
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            Select Date and Time
          </label>
          <input
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => onScheduledForChange(e.target.value)}
            min={getMinDateTime()}
            className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${
              isDarkMode
                ? "bg-gray-800 border-gray-700 text-white [color-scheme:dark]"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          />
          <p className={`mt-2 text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            Messages will be sent at the scheduled time. Make sure to select a time at least 5 minutes from now.
          </p>
        </div>
      )}
    </div>
  );
}
