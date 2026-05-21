import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { useTheme } from "../../context/ThemeContext";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../api/config";
import VisitTrendChart from "../../components/visitAnalytics/VisitTrendChart";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatsCard from "../../components/visitAnalytics/StatsCard";
import CustomerDrawer from "../../components/visitAnalytics/CustomerDrawer";
import SegmentDonut from "../../components/visitAnalytics/SegmentDonut";
import dayjs from "dayjs";
import { TrendingUp, Users, Repeat, UserPlus, Activity, UserCheck } from "lucide-react";

export default function StoreVisitAnalytics() {
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  const { storeData } = queryClient.getQueryData(["store"]) || {};
  const token = localStorage.getItem("storeToken");
  const outletId = localStorage.getItem("outletId");
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [segments, setSegments] = useState([]);
  const [lastVisitDistribution, setLastVisitDistribution] = useState([]);
  const [trends, setTrends] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [selectedSegment, setSelectedSegment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLastVisitFilters, setSelectedLastVisitFilters] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [outlet, setOutlet] = useState(null);
  const [pointsTimePeriod, setPointsTimePeriod] = useState("today");
  const [pointsCollected, setPointsCollected] = useState(0);

  // Date filters - Default to all time for L5
  const [startDate, setStartDate] = useState(
    storeData?.createdAt ? dayjs(storeData.createdAt).format("YYYY-MM-DD") : dayjs().subtract(30, "day").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));

  // Chart data
  const chartData = useMemo(() => {
    return trends.map((item) => ({
      date: dayjs(item.date).format("MMM DD"),
      value: item.visitCount || 0,
    }));
  }, [trends]);

  // Fetch outlet details
  const fetchOutletDetails = async () => {
    if (!outletId || !storeData?._id) return;
    
    try {
      const outletData = storeData.outlets?.find(o => o._id === outletId);
      setOutlet(outletData);
    } catch (error) {
      console.error("Failed to fetch outlet details:", error);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    if (!storeData?._id || !outletId) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        outletId,
      });

      const headers = { token };

      // Fetch all trends data (includes totalPoints for each day)
      const trendsAllParams = new URLSearchParams({
        period: '10000', // Get all historical data
        outletId,
      });

      const [summaryRes, segmentsRes, lastVisitRes, trendsRes, trendsAllRes] = await Promise.all([
        api.get(`/api/visitAnalytics/summary/${storeData._id}?${params}`, { headers }),
        api.get(`/api/visitAnalytics/segments/${storeData._id}?${params}`, { headers }),
        api.get(`/api/visitAnalytics/lastVisitDistribution/${storeData._id}?${params}`, { headers }),
        api.get(`/api/visitAnalytics/trends/${storeData._id}?${params}`, { headers }),
        api.get(`/api/visitAnalytics/trends/${storeData._id}?${trendsAllParams}`, { headers }),
      ]);

      console.log('[StoreVisitAnalytics] API Responses:', {
        summary: summaryRes.data,
        segments: segmentsRes.data,
        lastVisit: lastVisitRes.data,
        trends: trendsRes.data,
        trendsAll: trendsAllRes.data,
      });

      if (summaryRes.data.success) setSummary(summaryRes.data.data);
      if (segmentsRes.data.success) setSegments(segmentsRes.data.data?.segments || []);
      if (lastVisitRes.data.success) setLastVisitDistribution(lastVisitRes.data.data || []);
      if (trendsRes.data.success) setTrends(trendsRes.data.data || []);
      
      // Calculate points from all trends data
      if (trendsAllRes.data.success) {
        const allTrends = trendsAllRes.data.data || [];
        const today = dayjs();
        const yesterdayStart = today.subtract(1, 'day').startOf('day');
        const weekStart = today.subtract(7, 'days').startOf('day');
        const monthStart = today.subtract(30, 'days').startOf('day');

        console.log('[StoreVisitAnalytics] Points calculation:', {
          allTrendsCount: allTrends.length,
          pointsTimePeriod,
          today: today.format('YYYY-MM-DD'),
          allTrends: allTrends.map(t => ({ date: t.date, totalPoints: t.totalPoints, visitCount: t.visitCount }))
        });

        let calculatedPoints = 0;
        switch (pointsTimePeriod) {
          case 'today':
            calculatedPoints = allTrends
              .filter(t => dayjs(t.date).isSame(today, 'day'))
              .reduce((sum, t) => sum + (t.totalPoints || 0), 0);
            break;
          case 'yesterday':
            calculatedPoints = allTrends
              .filter(t => dayjs(t.date).isSame(yesterdayStart, 'day'))
              .reduce((sum, t) => sum + (t.totalPoints || 0), 0);
            break;
          case 'last7days':
            calculatedPoints = allTrends
              .filter(t => dayjs(t.date).isSameOrAfter(weekStart, 'day') && dayjs(t.date).isSameOrBefore(today, 'day'))
              .reduce((sum, t) => sum + (t.totalPoints || 0), 0);
            break;
          case 'last30days':
            calculatedPoints = allTrends
              .filter(t => dayjs(t.date).isSameOrAfter(monthStart, 'day') && dayjs(t.date).isSameOrBefore(today, 'day'))
              .reduce((sum, t) => sum + (t.totalPoints || 0), 0);
            break;
        }
        
        console.log('[StoreVisitAnalytics] Calculated points:', calculatedPoints);
        setPointsCollected(calculatedPoints);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to fetch analytics");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch customers
  const fetchCustomers = async (page = 1) => {
    if (!storeData?._id || !outletId) return;

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        segment: selectedSegment || "",
        search: searchQuery || "",
        outletId,
      });

      if (selectedLastVisitFilters.length > 0) {
        params.append("lastVisitDays", selectedLastVisitFilters.join(","));
      }

      const headers = { token };

      const res = await api.get(`/api/visitAnalytics/customers/${storeData._id}?${params}`, { headers });

      if (res.data.success) {
        setCustomers(res.data.data.customers || []);
        setPagination(res.data.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      toast.error("Failed to fetch customers");
    }
  };

  // Fetch customer details
  const fetchCustomerDetails = async (customerId) => {
    if (!customerId) return;

    try {
      const headers = { token };
      const res = await api.get(`/api/visitAnalytics/customer/${customerId}`, { headers });
      if (res.data.success) {
        setCustomerDetails(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch customer details:", error);
      toast.error("Failed to fetch customer details");
    }
  };

  // Effects
  useEffect(() => {
    if (storeData?._id && outletId) {
      fetchOutletDetails();
      fetchAnalytics();
    }
  }, [storeData?._id, outletId, startDate, endDate, pointsTimePeriod]);

  // Debug logging
  useEffect(() => {
    console.log('[StoreVisitAnalytics] Data state:', {
      summary,
      segmentsCount: segments?.length,
      segments: segments,
      lastVisitDistributionCount: lastVisitDistribution?.length,
      lastVisitDistribution: lastVisitDistribution,
      trendsCount: trends?.length,
      chartDataCount: chartData?.length,
      customersCount: customers?.length,
      pointsCollected,
      pointsTimePeriod,
    });
  }, [summary, segments, lastVisitDistribution, trends, chartData, customers, pointsCollected, pointsTimePeriod]);

  useEffect(() => {
    if (storeData?._id && outletId) {
      fetchCustomers(1);
    }
  }, [storeData?._id, outletId, selectedSegment, searchQuery, selectedLastVisitFilters]);

  useEffect(() => {
    if (selectedCustomer) fetchCustomerDetails(selectedCustomer);
  }, [selectedCustomer]);

  // Filter handlers
  const handleSegmentClick = (segmentKey, viewMode) => {
    if (viewMode === "segments") {
      // Toggle segment selection
      setSelectedSegment(segmentKey === selectedSegment ? "" : segmentKey);
    }
  };

  const handleLastVisitFilterToggle = (range, viewMode) => {
    if (viewMode === "lastVisit") {
      // Toggle last visit filter
      if (selectedLastVisitFilters.includes(range)) {
        setSelectedLastVisitFilters(selectedLastVisitFilters.filter((v) => v !== range));
      } else {
        setSelectedLastVisitFilters([...selectedLastVisitFilters, range]);
      }
    }
  };

  if (!storeData || !outletId) {
    return (
      <div className={`px-2 sm:px-0 md:px-4 lg:px-0 sm:ml-0 lg:ml-64 min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-[#f8fafb]"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className={`text-center ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            <p>No outlet selected. Please select an outlet first.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && !summary) {
    return (
      <div className={`px-2 sm:px-0 md:px-4 lg:px-0 sm:ml-0 lg:ml-64 min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-[#f8fafb]"}`}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`px-2 sm:px-0 md:px-4 lg:px-0 sm:ml-0 lg:ml-64 min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-[#f8fafb]"}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`mb-6 sm:mb-8 p-4 sm:p-6 border-b ${
          isDarkMode ? "bg-gray-900 border-gray-700" : "bg-[#f8fafb] border-gray-200"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Activity className={`w-7 h-7 sm:w-8 sm:h-8 ${isDarkMode ? "text-green-400" : "text-green-600"}`} />
                <h1 className={`text-xl sm:text-2xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Visit Analytics
                </h1>
              </div>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Analytics for {outlet?.location || outlet?.name || "your outlet"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards Section */}
        <div className="mb-6 mx-4 sm:mx-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Key Metrics
            </h2>
            <div className="flex items-center gap-2">
              <span className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 rounded-lg ${
                isDarkMode ? "text-gray-400 bg-gray-800" : "text-gray-600 bg-gray-100"
              }`}>
                All Time
              </span>
            </div>
          </div>

          {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
          <StatsCard
            title="Total Customers"
            value={summary?.totalCustomers?.toLocaleString() || "0"}
            icon={Users}
            color="indigo"
            info="Unique customers who visited this outlet."
          />
          <StatsCard
            title="Total Visits"
            value={summary?.totalVisits?.toLocaleString() || "0"}
            icon={TrendingUp}
            color="blue"
            info="Total visits at this outlet. Each transaction counts as one visit."
          />
          <StatsCard
            title="Avg Visits/Customer"
            value={(summary?.avgVisitsPerCustomer || 0).toFixed(1)}
            icon={Activity}
            color="purple"
            info="Total visits divided by total customers."
          />
          <StatsCard
            title="Repeat Rate"
            value={`${summary?.repeatRate || 0}%`}
            icon={Repeat}
            color="green"
            info="Percentage of customers with more than one visit."
          />
          
          {/* Points Collected with Dropdown */}
          <div className={`rounded-xl p-4 sm:p-6 border flex flex-col h-full ${
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="w-5 h-5 text-orange-500 shrink-0" />
              <h3 className={`text-sm font-medium truncate ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}>
                Points Distributed
              </h3>
            </div>
            <p className={`text-2xl sm:text-3xl font-bold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>
              {pointsCollected?.toLocaleString() || "0"}
            </p>
            <div className="flex items-center gap-2 mt-auto">
              <span className={`${
                isDarkMode ? "text-gray-500" : "text-gray-500"
              } text-xs`}>
                Period:
              </span>
              <select
                value={pointsTimePeriod}
                onChange={(e) => setPointsTimePeriod(e.target.value)}
                className={`text-xs px-2.5 py-1.5 rounded-md border focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200"
                    : "bg-gray-50 border-gray-300 text-gray-700"
                }`}
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7days">Last 7d</option>
                <option value="last30days">Last 30d</option>
              </select>
            </div>
          </div>
        </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 mx-4 sm:mx-6">
          {/* Customer Segments */}
          <div
            className={`rounded-xl p-4 sm:p-6 shadow-sm border ${
              isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"
            }`}
          >
            <h2 className={`text-base sm:text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Customer Distribution
            </h2>
            <SegmentDonut
              segments={segments}
              lastVisitDistribution={lastVisitDistribution}
              onSegmentClick={handleSegmentClick}
              selectedSegment={selectedSegment}
              selectedLastVisitFilters={selectedLastVisitFilters}
              onLastVisitFilterToggle={handleLastVisitFilterToggle}
              totalStoreCustomers={summary?.totalCustomers ?? null}
            />
          </div>

          {/* Visit Trends */}
          <div
            className={`rounded-xl p-4 sm:p-6 shadow-sm border ${
              isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"
            }`}
          >
            <h2 className={`text-base sm:text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Visit Trends
            </h2>
            <VisitTrendChart data={chartData} color="#4caf50" />
          </div>
        </div>

        {/* Customer List */}
      
      </div>

      {/* Customer Drawer */}
      <CustomerDrawer
        isOpen={!!selectedCustomer}
        onClose={() => {
          setSelectedCustomer(null);
          setCustomerDetails(null);
        }}
        data={customerDetails}
      />
    </div>
  );
}
