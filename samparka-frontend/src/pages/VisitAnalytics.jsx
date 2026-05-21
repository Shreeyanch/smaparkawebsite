import { useTheme } from "../context/ThemeContext";
import useVisitAnalytics from "../hooks/useVisitAnalytics";
import LoadingSpinner from "../components/LoadingSpinner";
import SegmentMessagingTab from "../components/messaging/SegmentMessagingTab";
import CustomerDrawer from "../components/visitAnalytics/CustomerDrawer";
import CustomerSegmentModal from "../components/visitAnalytics/CustomerSegmentModal";
import QuickComposeModal from "../components/visitAnalytics/QuickComposeModal";
import AnalyticsHeader from "../components/visitAnalytics/AnalyticsHeader";
import StatsCardsSection from "../components/visitAnalytics/StatsCardsSection";
import ChartsRow from "../components/visitAnalytics/ChartsRow";
import OutletComparisonSection from "../components/visitAnalytics/OutletComparisonSection";

export default function VisitAnalytics() {
  const { isDarkMode } = useTheme();
  const {
    selected, setSelected, stores,
    activeTab,
    isLoading,
    summary, displaySummary, displaySegments, displayLastVisitDistribution,
    chartData, totalCustomersChartData, customersVisitedChartData,
    selectedCustomer, customerDetails,
    segmentModalOpen, setSegmentModalOpen, segmentModalData,
    composeModalOpen, setComposeModalOpen, composeModalData,
    selectedOutletView, setSelectedOutletView,
    outletAnalytics, isLoadingOutlets,
    outletPointsFilter, setOutletPointsFilter,
    currentFilter, startDate, endDate, isL5Format, isMultiOutlet, storeOutlets,
    handleFilterChange, handleCustomRangeChange, handleSegmentDoubleClick, handleNotify, handleCloseCustomer,
  } = useVisitAnalytics();

  return (
    <div className={`px-2 sm:px-4 pb-6 ml-0 lg:ml-64 min-h-screen transition-colors ${
      isDarkMode ? "bg-gray-900" : "bg-[#f2f5f9]"
    }`}>
      {isLoading && <LoadingSpinner />}

      <AnalyticsHeader
        isDarkMode={isDarkMode}
        selected={selected}
        setSelected={setSelected}
        stores={stores}
      />

      {selected ? (
        <div className="p-4 lg:p-6 space-y-6">
          {activeTab === "overview" ? (
            <>
              <StatsCardsSection
                isDarkMode={isDarkMode}
                isL5Format={isL5Format}
                currentFilter={currentFilter}
                startDate={startDate}
                endDate={endDate}
                storeOutlets={storeOutlets}
                selectedOutletView={selectedOutletView}
                setSelectedOutletView={setSelectedOutletView}
                summary={summary}
                displaySummary={displaySummary}
                totalCustomersChartData={totalCustomersChartData}
                customersVisitedChartData={customersVisitedChartData}
                chartData={chartData}
                onFilterChange={handleFilterChange}
                onCustomRangeChange={handleCustomRangeChange}
              />

              <ChartsRow
                isDarkMode={isDarkMode}
                isL5Format={isL5Format}
                selectedOutletView={selectedOutletView}
                outletAnalytics={outletAnalytics}
                displaySegments={displaySegments}
                displayLastVisitDistribution={displayLastVisitDistribution}
                displaySummary={displaySummary}
                chartData={chartData}
                selectedSegment=""
                selectedLastVisitFilters={[]}
                onSegmentClick={handleSegmentDoubleClick}
              />

              {(isL5Format || isMultiOutlet) && (
                <OutletComparisonSection
                  isDarkMode={isDarkMode}
                  selectedOutletView={selectedOutletView}
                  setSelectedOutletView={setSelectedOutletView}
                  storeOutlets={storeOutlets}
                  outletAnalytics={outletAnalytics}
                  isLoadingOutlets={isLoadingOutlets}
                  outletPointsFilter={outletPointsFilter}
                  setOutletPointsFilter={setOutletPointsFilter}
                />
              )}
            </>
          ) : (
            <SegmentMessagingTab storeId={selected} segments={displaySegments} />
          )}
        </div>
      ) : (
        <div className={`flex items-center justify-center h-[60vh] ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          <p>Please select a store to view analytics</p>
        </div>
      )}

      <CustomerDrawer
        isOpen={!!selectedCustomer}
        onClose={handleCloseCustomer}
        data={customerDetails}
      />

      <CustomerSegmentModal
        isOpen={segmentModalOpen}
        onClose={() => setSegmentModalOpen(false)}
        segment={segmentModalData.segment}
        storeId={selected}
        store={stores.find((s) => s._id === selected)}
        viewMode={segmentModalData.viewMode}
        outletId={segmentModalData.outletId}
        startDate={startDate}
        endDate={endDate}
        onNotify={handleNotify}
      />

      <QuickComposeModal
        isOpen={composeModalOpen}
        onClose={() => setComposeModalOpen(false)}
        storeId={selected}
        segment={composeModalData.segment}
        viewMode={composeModalData.viewMode}
        customerCount={composeModalData.total}
      />
    </div>
  );
}
