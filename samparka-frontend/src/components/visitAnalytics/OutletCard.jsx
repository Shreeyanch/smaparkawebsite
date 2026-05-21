import { Users, TrendingUp, Repeat, Activity, Award } from "lucide-react";

const RANK_COLORS = [
  { bg: "bg-yellow-100 dark:bg-yellow-500/20", text: "text-yellow-700 dark:text-yellow-400", border: "border-yellow-300 dark:border-yellow-500/40" },
  { bg: "bg-gray-100 dark:bg-gray-400/20", text: "text-gray-600 dark:text-gray-300", border: "border-gray-300 dark:border-gray-500/40" },
  { bg: "bg-orange-100 dark:bg-orange-500/20", text: "text-orange-700 dark:text-orange-400", border: "border-orange-300 dark:border-orange-500/40" },
];
const defaultRank = {
  bg: "bg-gray-50 dark:bg-gray-800/50",
  text: "text-gray-500 dark:text-gray-400",
  border: "border-gray-200 dark:border-gray-700/40",
};

function MetricRow({ icon: Icon, label, value, iconColor, isDarkMode }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? "bg-gray-900/50" : "bg-white"}`}>
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className={`text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{label}</span>
      </div>
      <span className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{value}</span>
    </div>
  );
}

export default function OutletCard({ outlet, data, rank, outletPointsFilter, isDarkMode, onClick }) {
  const rankStyle = RANK_COLORS[rank - 1] || defaultRank;

  const pointsValue = (
    outletPointsFilter === "today" ? data.pointsToday || 0
    : outletPointsFilter === "week" ? data.pointsWeek || 0
    : outletPointsFilter === "month" ? data.pointsMonth || 0
    : data.pointsAllTime || 0
  ).toLocaleString();

  const filterLabel =
    outletPointsFilter === "today" ? "Today"
    : outletPointsFilter === "week" ? "Last 7 Days"
    : outletPointsFilter === "month" ? "Last 30 Days"
    : "All Time";

  return (
    <div
      className={`rounded-lg p-5 border-2 transition-all cursor-pointer hover:shadow-lg ${
        isDarkMode
          ? "bg-gray-800 border-gray-700 hover:border-green-500"
          : "bg-gray-50 border-gray-200 hover:border-green-400"
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isDarkMode ? "bg-green-500/20" : "bg-green-100"}`}>
            <svg className={`w-5 h-5 ${isDarkMode ? "text-green-400" : "text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {outlet.location || outlet.name}
            </h3>
            <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Click to view details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${rankStyle.bg} ${rankStyle.text} ${rankStyle.border}`}>
            #{rank}
          </span>
          <svg className={`w-5 h-5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        <MetricRow icon={Users} label="Total Customers" value={data.summary.totalCustomers?.toLocaleString() || 0} iconColor={isDarkMode ? "text-indigo-400" : "text-indigo-600"} isDarkMode={isDarkMode} />
        <MetricRow icon={TrendingUp} label="Total Visits" value={data.summary.totalVisits?.toLocaleString() || 0} iconColor={isDarkMode ? "text-blue-400" : "text-blue-600"} isDarkMode={isDarkMode} />
        <MetricRow icon={Repeat} label="Repeat Rate" value={`${data.summary.repeatRate || 0}%`} iconColor={isDarkMode ? "text-green-400" : "text-green-600"} isDarkMode={isDarkMode} />
        <MetricRow icon={Activity} label="Avg Visits" value={(data.summary.avgVisitsPerCustomer || 0).toFixed(1)} iconColor={isDarkMode ? "text-purple-400" : "text-purple-600"} isDarkMode={isDarkMode} />
      </div>

      {/* Points */}
      <div className={`mt-4 pt-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
        <div className="flex items-center gap-2 mb-3">
          <Award className={`w-4 h-4 ${isDarkMode ? "text-green-400" : "text-green-600"}`} />
          <h4 className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            Points Distributed
          </h4>
        </div>
        <div className={`p-4 rounded-lg text-center ${isDarkMode ? "bg-green-900/40 border border-green-700/40" : "bg-green-100 border border-green-300"}`}>
          <p className={`text-xs mb-2 font-medium ${isDarkMode ? "text-green-300" : "text-green-700"}`}>{filterLabel}</p>
          <p className={`text-2xl font-bold ${isDarkMode ? "text-green-400" : "text-green-600"}`}>{pointsValue}</p>
        </div>
      </div>
    </div>
  );
}
