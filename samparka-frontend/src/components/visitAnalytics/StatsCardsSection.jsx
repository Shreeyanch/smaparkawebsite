import { Users, TrendingUp, UserCheck } from "lucide-react";
import StatsCard from "./StatsCard";

export default function StatsCardsSection({
  isDarkMode,
  isL5Format,
  currentFilter,
  startDate,
  endDate,
  storeOutlets,
  selectedOutletView,
  setSelectedOutletView,
  summary,
  displaySummary,
  totalCustomersChartData,
  customersVisitedChartData,
  chartData,
  onFilterChange,
  onCustomRangeChange,
}) {
  const fromDate = startDate || "";
  const toDate = endDate || "";

  const filterValue =
    currentFilter === "This Week" ? "thisweek"
    : currentFilter === "Last Month" ? "lastMonth"
    : currentFilter === "All Time" ? "allTime"
    : "custom";

  return (
    <div className="space-y-4">
      {/* Section header + filter */}
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          {isL5Format ? "Combined Analytics" : "Key Metrics"}
        </h2>
        {!isL5Format ? (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterValue}
              onChange={(e) => onFilterChange(e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-sm border focus:outline-none focus:ring-1 focus:ring-green-500 ${
                isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"
              }`}
            >
              <option value="thisweek">This Week</option>
              <option value="lastMonth">Last Month</option>
              <option value="allTime">All Time</option>
              <option value="custom">Custom Range</option>
            </select>

            {filterValue === "custom" && (
              <>
                <input
                  type="date"
                  value={fromDate}
                  max={toDate || undefined}
                  onChange={(e) => onCustomRangeChange(e.target.value, toDate)}
                  className={`px-2.5 py-1.5 rounded-lg text-sm border focus:outline-none focus:ring-1 focus:ring-green-500 ${
                    isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"
                  }`}
                />
                <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>to</span>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(e) => onCustomRangeChange(fromDate, e.target.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-sm border focus:outline-none focus:ring-1 focus:ring-green-500 ${
                    isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"
                  }`}
                />
              </>
            )}
          </div>
        ) : (
          <span className={`text-sm font-medium px-3 py-1.5 rounded-lg ${
            isDarkMode ? "text-gray-400 bg-gray-800" : "text-gray-600 bg-gray-100"
          }`}>
            All Time
          </span>
        )}
      </div>

      {/* L5 outlet selector */}
      {isL5Format && storeOutlets.length > 0 && (
        <div className="flex items-center gap-3">
          <label className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            Outlet:
          </label>
          <select
            value={selectedOutletView}
            onChange={(e) => setSelectedOutletView(e.target.value)}
            className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-green-500 min-w-[200px] ${
              isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"
            }`}
          >
            <option value="all">All Outlets Combined</option>
            {storeOutlets.map((outlet) => (
              <option key={outlet._id} value={outlet._id}>
                {outlet.location || outlet.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Cards */}
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <StatsCard
          title="Total Customers"
          value={summary?.totalRegisteredCustomers?.toLocaleString() || 0}
          icon={Users}
          color="indigo"
          info="Total registered customers linked to this store."
          chartData={totalCustomersChartData}
          showChart={true}
        />
        <StatsCard
          title="Customers Visited"
          value={displaySummary?.totalCustomers?.toLocaleString() || 0}
          icon={UserCheck}
          color="teal"
          info={
            isL5Format && selectedOutletView !== "all"
              ? "Unique customers who visited this outlet. Same customer is counted only once."
              : "Customers who have made at least one visit and earned points."
          }
          chartData={customersVisitedChartData}
          showChart={true}
        />
        <StatsCard
          title="Total Visits"
          value={displaySummary?.totalVisits?.toLocaleString() || 0}
          icon={TrendingUp}
          color="blue"
          info={
            isL5Format && selectedOutletView !== "all"
              ? "Total visits at this outlet. Each transaction counts as one visit."
              : "Total customer visits. Each point-earning transaction counts as one visit."
          }
          chartData={chartData}
          showChart={true}
        />
      </div>
    </div>
  );
}
