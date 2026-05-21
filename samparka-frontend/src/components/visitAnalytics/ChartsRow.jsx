import { Repeat, Activity } from "lucide-react";
import SegmentDonut from "./SegmentDonut";
import VisitTrendChart from "./VisitTrendChart";

export default function ChartsRow({
  isDarkMode,
  isL5Format,
  selectedOutletView,
  outletAnalytics,
  displaySegments,
  displayLastVisitDistribution,
  displaySummary,
  chartData,
  selectedSegment,
  selectedLastVisitFilters,
  onSegmentClick,
}) {
  const panelCls = `rounded-xl p-6 ${
    isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
  }`;
  const titleCls = `text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`;
  const outletLabel = outletAnalytics[selectedOutletView]?.outlet?.location || "Outlet";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Segment Donut */}
      <div className={panelCls}>
        <div className="flex justify-between mb-2">
          <h2 className={titleCls}>
            Customer Distribution
            {isL5Format && selectedOutletView !== "all" && (
              <span className={`text-sm font-normal ml-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                ({outletLabel})
              </span>
            )}
          </h2>

          <div className="flex gap-2">
            <div className={`p-1 rounded-lg ${isDarkMode ? "bg-gray-800/50" : "bg-gray-50"}`}>
              <div className="flex items-center gap-2 mb-2">
                <Repeat className={`w-5 h-5 ${isDarkMode ? "text-green-400" : "text-green-600"}`} />
                <p className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Repeat Rate
                </p>
              </div>
              <p className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {displaySummary?.repeatRate || 0}%
              </p>
            </div>

            <div className={`p-1 rounded-lg ${isDarkMode ? "bg-gray-800/50" : "bg-gray-50"}`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className={`w-5 h-5 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />
                <span className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Avg Visits
                </span>
              </div>
              <span className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {(displaySummary?.avgVisitsPerCustomer || 0).toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        <SegmentDonut
          segments={displaySegments}
          lastVisitDistribution={displayLastVisitDistribution}
          onSegmentClick={onSegmentClick}
          selectedSegment={selectedSegment}
          selectedLastVisitFilters={selectedLastVisitFilters}
          onLastVisitFilterToggle={onSegmentClick}
          totalStoreCustomers={null}
        />
      </div>

      {/* Visit Trends */}
      <div className={panelCls}>
        <h2 className={titleCls}>
          Visit Trends
          {isL5Format && selectedOutletView !== "all" && (
            <span className={`text-sm font-normal ml-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              ({outletLabel})
            </span>
          )}
        </h2>
        <VisitTrendChart data={chartData} color="#4caf50" />
      </div>
    </div>
  );
}
