import OutletCardSkeleton from "./OutletCardSkeleton";
import OutletCard from "./OutletCard";
import OutletDetailView from "./OutletDetailView";

export default function OutletComparisonSection({
  isDarkMode,
  selectedOutletView,
  setSelectedOutletView,
  storeOutlets,
  outletAnalytics,
  isLoadingOutlets,
  outletPointsFilter,
  setOutletPointsFilter,
}) {
  const isAllView = selectedOutletView === "all";
  const selectedOutletData = outletAnalytics[selectedOutletView];
  const outletName =
    selectedOutletData?.outlet?.location || selectedOutletData?.outlet?.name || "Outlet Performance";

  const sortedOutlets = storeOutlets.slice().sort((a, b) => {
    const getPoints = (d) => {
      if (!d) return -1;
      if (outletPointsFilter === "today") return d.pointsToday || 0;
      if (outletPointsFilter === "week") return d.pointsWeek || 0;
      if (outletPointsFilter === "month") return d.pointsMonth || 0;
      return d.pointsAllTime || 0;
    };
    return getPoints(outletAnalytics[b._id]) - getPoints(outletAnalytics[a._id]);
  });

  return (
    <div className={`rounded-xl p-6 ${isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"}`}>
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <svg className={`w-6 h-6 ${isDarkMode ? "text-green-400" : "text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isAllView ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            ) : (
              <>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </>
            )}
          </svg>
          <div>
            <h2 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {isAllView ? "Outlet Performance Comparison" : outletName}
            </h2>
            {!isAllView && (
              <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Detailed outlet metrics</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isAllView && (
            <button
              onClick={() => setSelectedOutletView("all")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all hover:shadow-lg ${
                isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          )}
          {isAllView && (
            <select
              value={outletPointsFilter}
              onChange={(e) => setOutletPointsFilter(e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-sm border focus:outline-none focus:ring-1 focus:ring-green-500 ${
                isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"
              }`}
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="allTime">All Time</option>
            </select>
          )}
        </div>
      </div>

      {/* Body */}
      {isAllView ? (
        isLoadingOutlets ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {storeOutlets.map((outlet) => (
              <OutletCardSkeleton key={outlet._id} isDarkMode={isDarkMode} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sortedOutlets.map((outlet, rankIndex) => {
              const data = outletAnalytics[outlet._id];
              if (!data?.summary) return null;
              return (
                <OutletCard
                  key={outlet._id}
                  outlet={outlet}
                  data={data}
                  rank={rankIndex + 1}
                  outletPointsFilter={outletPointsFilter}
                  isDarkMode={isDarkMode}
                  onClick={() => setSelectedOutletView(outlet._id)}
                />
              );
            })}
          </div>
        )
      ) : (
        selectedOutletData && <OutletDetailView outletData={selectedOutletData} isDarkMode={isDarkMode} />
      )}
    </div>
  );
}
