import { UserCheck, TrendingUp, Repeat, Activity, Award } from "lucide-react";

function PointCell({ label, value, isDarkMode, highlight }) {
  return (
    <div className={`p-3 rounded-lg text-center border ${
      highlight
        ? isDarkMode ? "bg-green-900/30 border-green-700/50" : "bg-green-50 border-green-200"
        : isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
    }`}>
      <p className={`text-xs mb-1 font-medium ${
        highlight
          ? isDarkMode ? "text-green-400" : "text-green-700"
          : isDarkMode ? "text-gray-400" : "text-gray-600"
      }`}>{label}</p>
      <p className={`text-lg font-bold ${
        highlight
          ? isDarkMode ? "text-green-300" : "text-green-600"
          : isDarkMode ? "text-gray-300" : "text-gray-700"
      }`}>{value}</p>
    </div>
  );
}

function StatTile({ icon: Icon, iconColor, label, value, isDarkMode }) {
  return (
    <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <p className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{label}</p>
      </div>
      <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}

export default function OutletDetailView({ outletData, isDarkMode }) {
  const { summary, pointsToday, pointsYesterday, pointsWeek, pointsMonth, pointsAllTime } = outletData;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatTile icon={UserCheck} iconColor={isDarkMode ? "text-teal-400" : "text-teal-600"} label="Customers Visited" value={summary?.totalCustomers?.toLocaleString() || 0} isDarkMode={isDarkMode} />
        <StatTile icon={TrendingUp} iconColor={isDarkMode ? "text-blue-400" : "text-blue-600"} label="Total Visits" value={summary?.totalVisits?.toLocaleString() || 0} isDarkMode={isDarkMode} />
        <StatTile icon={Repeat} iconColor={isDarkMode ? "text-green-400" : "text-green-600"} label="Repeat Rate" value={`${summary?.repeatRate || 0}%`} isDarkMode={isDarkMode} />
        <StatTile icon={Activity} iconColor={isDarkMode ? "text-purple-400" : "text-purple-600"} label="Avg Visits/Customer" value={(summary?.avgVisitsPerCustomer || 0).toFixed(1)} isDarkMode={isDarkMode} />
      </div>

      <div className={`pt-5 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
        <div className="flex items-center gap-2 mb-4">
          <Award className={`w-5 h-5 ${isDarkMode ? "text-green-400" : "text-green-600"}`} />
          <h3 className={`text-sm font-semibold uppercase tracking-wide ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            Points Distributed
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <PointCell label="Today" value={pointsToday?.toLocaleString() || "0"} isDarkMode={isDarkMode} highlight />
          <PointCell label="Yesterday" value={pointsYesterday?.toLocaleString() || "0"} isDarkMode={isDarkMode} />
          <PointCell label="Last 7 Days" value={pointsWeek?.toLocaleString() || "0"} isDarkMode={isDarkMode} />
          <PointCell label="Last 30 Days" value={pointsMonth?.toLocaleString() || "0"} isDarkMode={isDarkMode} />
          <PointCell label="All Time" value={pointsAllTime?.toLocaleString() || "0"} isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
}
