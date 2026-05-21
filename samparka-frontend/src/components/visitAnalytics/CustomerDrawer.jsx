import { X, User, Mail, Phone, Award, MapPin } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import dayjs from "dayjs";

const SEGMENT_LABELS = {
  first_visit: "First-Time Visitor",
  "2-3_visits": "Early Returner",
  "4-10_visits": "Regular Customer",
  "10+_visits": "Loyal Champion",
};

export default function CustomerDrawer({ isOpen, onClose, data }) {
  const { isDarkMode } = useTheme();

  if (!isOpen) return null;

  const { customer, analytics, visitHistory } = data || {};

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md z-50 transform transition-transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}>
          <h2 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Customer Details
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {data ? (
          <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-60px)]">
            {/* Customer Info */}
            <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isDarkMode ? "bg-purple-900/30" : "bg-purple-100"
                }`}>
                  <User className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {customer?.name}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {customer?.tier}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                  <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {customer?.email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                  <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {customer?.countryCode} {customer?.phone}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                  <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {customer?.points} points
                  </span>
                </div>
              </div>
            </div>

            {/* Visit Summary */}
            <div>
              <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Visit Summary
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className={`p-3 rounded-lg text-center ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                  <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {analytics?.visitCount || 0}
                  </p>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total Visits</p>
                </div>
                <div className={`p-3 rounded-lg text-center ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                  <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {analytics?.avgDaysBetweenVisits || "-"}
                  </p>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Avg Days Gap</p>
                </div>
                <div className={`p-3 rounded-lg text-center ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                  <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {analytics?.totalPointsEarned || 0}
                  </p>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Points Earned</p>
                </div>
              </div>
              <p className={`mt-3 text-sm ${isDarkMode ? "text-purple-400" : "text-purple-600"}`}>
                Segment: {SEGMENT_LABELS[analytics?.segment] || analytics?.segment}
              </p>
            </div>

            {/* Outlets Visited */}
            {analytics?.visitsByOutlet?.length > 0 && (
              <div>
                <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Outlets Visited
                </h4>
                <div className="space-y-2">
                  {analytics.visitsByOutlet.map((outlet, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isDarkMode ? "bg-gray-800" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                        <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                          {outlet.outlet}
                        </span>
                      </div>
                      <span className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {outlet.visitCount} visits
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visit History */}
            <div>
              <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Recent Visits
              </h4>
              <div className="space-y-2">
                {visitHistory?.length > 0 ? (
                  visitHistory.map((visit, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isDarkMode ? "bg-gray-800" : "bg-gray-50"
                      }`}
                    >
                      <div>
                        <p className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          {dayjs(visit.createdAt).format("MMM DD, YYYY")}
                        </p>
                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {visit.outlet || "Main Branch"} • {visit.billID || "N/A"}
                        </p>
                      </div>
                      <span className={`font-medium text-green-500`}>+{visit.points} pts</span>
                    </div>
                  ))
                ) : (
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    No visit history available
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={`flex items-center justify-center h-[calc(100%-60px)] ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}>
            Loading...
          </div>
        )}
      </div>
    </>
  );
}
