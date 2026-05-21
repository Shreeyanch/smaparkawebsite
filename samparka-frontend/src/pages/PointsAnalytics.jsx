import { useEffect, useState, useMemo } from "react";
import {
  Award,
  Stamp,
  Star,
  Banknote,
  Eye,
  UserRoundPlus,
  MonitorDot,
  Users,
  Filter,
  Search,
} from "lucide-react";
import { Box } from "@mui/material";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../api/config";
import PointsModal from "../components/PointsModal";
import RewardsTable from "../components/RewardsTable";
import GoogleStockChart from "../components/GoogleStockChart";
import dayjs from "dayjs";
import LoadingSpinner from "../components/LoadingSpinner";

export default function PointsAnalytics() {
  // Theme
  const { isDarkMode } = useTheme();
  
  // State Management
  const [selected, setSelected] = useState(localStorage.getItem("selectedValue") || "");
  const [storeId, setStoreId] = useState(selected || "");
  
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;
  
  const [analytics, setAnalytics] = useState({});
  const [customerAnalytics, setCustomerAnalytics] = useState({});
  const [graphData, setGraphData] = useState([]);
  const [stores, setStores] = useState([]);
  const [customers, setCustomers] = useState([]); // Add customers state
  
  const [pGraphOpen, setPGraphOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeChart, setActiveChart] = useState('points');
  const [forceUpdate, setForceUpdate] = useState(0); // Force chart updates
  
  // Date Filter States
  const [startDate, setStartDate] = useState(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [currentFilter, setCurrentFilter] = useState("This Week");
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  
  const currentDate = dayjs().format("YYYY-MM-DD");

  // Chart Data Processing with memoization
  const pointsData = useMemo(() => {
    return Array.isArray(graphData?.pointsGiven)
      ? graphData.pointsGiven.map((item) => ({
          date: dayjs(item._id).format("DD/MM"),
          value: item.totalPoints || 0,
        }))
      : [];
  }, [graphData]);

  const customerGrowthChartData = useMemo(() => {
    return customerAnalytics.customerGrowthData
      ? customerAnalytics.customerGrowthData.map((item) => ({
          date: item.date,
          value: item.customers,
        }))
      : [];
  }, [customerAnalytics.customerGrowthData]);

  // Debug logs to check data updates

  // API Functions
  const fetchStores = async () => {
    setIsLoading(true);
    try {
      const response = user.role === "admin"
        ? await api.get("/store", { headers: { token } })
        : await api.get("/store/myStores", { headers: { token } });

      if (response.data.success) {
        setStores(response.data.stores);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message, { duration: 2000, theme: "colored" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!selected) return;
    
    setIsLoading(true);
    try {
      // Include date filters in the API request
      const response = await api.get(`/reward/getAnalytics/${selected}`, {
        headers: { token },
        params: {
          startDate: startDate,
          endDate: endDate,
          filter: currentFilter
        }
      });
      if (response.data.success) {
        setAnalytics(response.data.data);
        setGraphData(response.data.data.graphData || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerAnalytics = async () => {
    if (!selected) return;
    
    setIsLoading(true);
    try {
      // Fetch customers for the selected store
      const response = await api.get(`/store/getCustomers/${selected}`, {
        headers: { token },
      });
      
      if (response.data.success) {
        const customerData = response.data.customers || [];
        setCustomers(customerData);
        
        // Calculate analytics from customer data based on filters
        const now = dayjs();
        const filterStartDate = dayjs(startDate);
        const filterEndDate = dayjs(endDate);
        
        // Filter customers based on selected date range for creation
        const filteredCustomersByCreation = customerData.filter(customer => {
          const customerDate = dayjs(customer.createdAt);
          return customerDate.isAfter(filterStartDate.subtract(1, 'day')) && 
                 customerDate.isBefore(filterEndDate.add(1, 'day'));
        });
        
        // Total customers (all time vs in selected range)
        const totalCustomersAllTime = customerData.length;
        const totalCustomersInRange = filteredCustomersByCreation.length;
        
        // For analytics, use the appropriate total based on filter
        const totalCustomersToShow = currentFilter === "All Time" ? totalCustomersAllTime : totalCustomersInRange;
        
        // New users within the selected date range
        const newUsersInRange = filteredCustomersByCreation.filter(customer => {
          const customerDate = dayjs(customer.createdAt);
          const daysSinceCreation = now.diff(customerDate, 'days');
          return daysSinceCreation <= 7; // New if created within last 7 days of the filter period
        }).length;
        
        // Active users (have points > 0 or activity within filter range)
        const activeUsersInRange = customerData.filter(customer => {
          const lastActivity = dayjs(customer.updatedAt || customer.createdAt);
          const hasRecentActivity = lastActivity.isAfter(filterStartDate) && 
                                   lastActivity.isBefore(filterEndDate.add(1, 'day'));
          return customer.points > 0 || hasRecentActivity;
        }).length;
        
        // Calculate page views for customers in the filtered period
        const pageViewsInRange = filteredCustomersByCreation.reduce((total, customer) => {
          // Estimate: 1 base view + additional views based on points activity
          const baseViews = 1;
          const activityViews = Math.floor(customer.points / 10);
          return total + baseViews + activityViews;
        }, 0);
        
        // Customer growth data for chart - adapt to filter period
        const customerGrowthData = [];
        const chartDays = Math.min(7, filterEndDate.diff(filterStartDate, 'days') + 1);
        
        for (let i = chartDays - 1; i >= 0; i--) {
          const date = filterEndDate.subtract(i, 'days');
          const customersUpToDate = customerData.filter(customer => 
            dayjs(customer.createdAt).isBefore(date.endOf('day'))
          ).length;
          
          customerGrowthData.push({
            date: date.format("DD/MM"),
            customers: customersUpToDate
          });
        }
        
        // Calculate growth rate based on the filter period
        let growthRate = 0;
        if (currentFilter === "All Time") {
          // For all time, compare new users (last 7 days) vs total
          const recentNewUsers = customerData.filter(customer => 
            dayjs(customer.createdAt).isAfter(now.subtract(7, 'days'))
          ).length;
          growthRate = totalCustomersAllTime > 0 ? Math.round((recentNewUsers / totalCustomersAllTime) * 100) : 0;
        } else {
          // For specific periods, compare current period vs previous period
          const periodDays = filterEndDate.diff(filterStartDate, 'days');
          const previousPeriodStart = filterStartDate.subtract(periodDays, 'days');
          const previousPeriodEnd = filterStartDate.subtract(1, 'day');
          
          const currentPeriodCustomers = customerData.filter(customer => {
            const customerDate = dayjs(customer.createdAt);
            return customerDate.isAfter(filterStartDate.subtract(1, 'day')) && 
                   customerDate.isBefore(filterEndDate.add(1, 'day'));
          }).length;
          
          const previousPeriodCustomers = customerData.filter(customer => {
            const customerDate = dayjs(customer.createdAt);
            return customerDate.isAfter(previousPeriodStart.subtract(1, 'day')) && 
                   customerDate.isBefore(previousPeriodEnd.add(1, 'day'));
          }).length;
          
          if (previousPeriodCustomers > 0) {
            growthRate = Math.round(((currentPeriodCustomers - previousPeriodCustomers) / previousPeriodCustomers) * 100);
          } else {
            growthRate = currentPeriodCustomers > 0 ? 100 : 0;
          }
        }
        
        // Set calculated analytics
        setCustomerAnalytics({
          totalCustomers: totalCustomersToShow,
          totalCustomersAllTime,
          totalCustomersInRange,
          newUsers: newUsersInRange,
          activeUsers: activeUsersInRange,
          pageViews: pageViewsInRange,
          customerGrowthData,
          growthRate,
          filterPeriod: currentFilter
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching customer data!");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter Handlers
  const handleFilterChange = (filterType) => {
    
    if (filterType === "daterange") {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
      setIsDateModalOpen(true);
      return;
    }

    const today = dayjs().format("YYYY-MM-DD");

    if (filterType === "lastMonth") {
      const newStartDate = dayjs().subtract(1, "month").format("YYYY-MM-DD");
      setStartDate(newStartDate);
      setEndDate(today);
      setCurrentFilter("Last Month");
    } else if (filterType === "allTime") {
      const selectedStore = stores.find((store) => store._id === storeId);
      if (selectedStore) {
        const storeCreationDate = dayjs(selectedStore.createdAt).format("YYYY-MM-DD");
        setStartDate(storeCreationDate);
        setEndDate(today);
      }
      setCurrentFilter("All Time");
    } else if (filterType === "thisweek") {
      const newStartDate = dayjs().subtract(7, "days").format("YYYY-MM-DD");
      setStartDate(newStartDate);
      setEndDate(today);
      setCurrentFilter("This Week");
    }
  };

  const handleDateRangeApply = () => {
    if (tempStartDate && tempEndDate) {
      if (dayjs(tempStartDate).isAfter(dayjs(tempEndDate))) {
        toast.error("Start date cannot be after end date.", { duration: 2000 });
        return;
      }
      setStartDate(tempStartDate);
      setEndDate(tempEndDate);
      setCurrentFilter("Date Range");
      setIsDateModalOpen(false);
    } else {
      toast.error("Please select both start and end dates.", { duration: 2000 });
    }
  };

  const handleDateRangeCancel = () => {
    setTempStartDate("");
    setTempEndDate("");
    setIsDateModalOpen(false);
  };

  const handleClose = () => {
    setPGraphOpen(false);
  };

  // Effects
  useEffect(() => {
    fetchStores();
  }, [token]);

  useEffect(() => {
    localStorage.setItem("selectedValue", selected);
  }, [selected]);

  useEffect(() => {
    if (selected && startDate && endDate) {
      fetchAnalytics();
      fetchCustomerAnalytics();
      // Force chart update
      setForceUpdate(prev => prev + 1);
    }
  }, [selected, startDate, endDate, currentFilter]);

  // Separate effect to ensure stores are loaded before setting filter dates
  useEffect(() => {
    if (stores.length > 0 && selected && currentFilter === "All Time") {
      const selectedStore = stores.find((store) => store._id === selected);
      if (selectedStore) {
        const storeCreationDate = dayjs(selectedStore.createdAt).format("YYYY-MM-DD");
        const today = dayjs().format("YYYY-MM-DD");
        setStartDate(storeCreationDate);
        setEndDate(today);
      }
    }
  }, [stores, selected, currentFilter]);

  // Component Renders
  const StatsCard = ({ title, value, icon: Icon, bgColor, textColor, className = "", subtitle = null }) => {
    // Make icon colors theme-aware by modifying the background and text colors
    const getThemeAwareBgColor = (bgColor) => {
      if (!isDarkMode) return bgColor;
      
      // Convert light background colors to dark theme equivalents
      const colorMap = {
        'bg-blue-100': 'bg-blue-900/30',
        'bg-green-100': 'bg-green-900/30',
        'bg-purple-100': 'bg-purple-900/30',
        'bg-orange-100': 'bg-orange-900/30',
        'bg-red-100': 'bg-red-900/30',
        'bg-yellow-100': 'bg-yellow-900/30',
        'bg-gray-100': 'bg-gray-700/30'
      };
      return colorMap[bgColor] || bgColor;
    };

    const getThemeAwareTextColor = (textColor) => {
      if (!isDarkMode) return textColor;
      
      // Convert light text colors to dark theme equivalents
      const colorMap = {
        'text-blue-600': 'text-blue-400',
        'text-green-600': 'text-green-400',
        'text-purple-600': 'text-purple-400',
        'text-orange-600': 'text-orange-400',
        'text-red-600': 'text-red-400',
        'text-yellow-600': 'text-yellow-400',
        'text-gray-600': 'text-gray-400'
      };
      return colorMap[textColor] || textColor;
    };

    const themeAwareBgColor = getThemeAwareBgColor(bgColor);
    const themeAwareTextColor = getThemeAwareTextColor(textColor);

    return (
      <div className={`rounded-lg border p-4 transition-colors ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white border-gray-200'
      } ${className}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${themeAwareBgColor} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${themeAwareTextColor}`} />
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${themeAwareTextColor}`}>{title}</p>
            <p className={`text-xl font-semibold transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{value}</p>
            {/* {subtitle && (
              <p className={`text-xs mt-1 transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>{subtitle}</p>
            )} */}
          </div>
        </div>
      </div>
    );
  };

  const ChartSection = () => (
    <div className={`rounded-lg border p-6 transition-colors ${
      isDarkMode 
        ? 'bg-gray-900 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="mb-6">
        <h2 className={`text-xl font-semibold mb-2 transition-colors ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Analytics</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveChart('points')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeChart === 'points'
                ? 'bg-green-500 text-white'
                : isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Points Details
          </button>
          <button
            onClick={() => setActiveChart('customers')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeChart === 'customers'
                ? 'bg-blue-500 text-white'
                : isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Customer Analytics
          </button>
        </div>
      </div>

      {activeChart === 'points' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-lg font-semibold transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Points Details</h3>
              <p className={`text-sm transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Total Points Given Out - {analytics?.totalPointsGivenOut || 0}
                <span className="ml-2 text-blue-600">({currentFilter})</span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-blue-500 font-medium">Total Customers</span>
              <span className={`font-bold transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>{customerAnalytics.totalCustomers || 0}</span>
              {currentFilter !== "All Time" && (
                <span className={`text-xs transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  (in {currentFilter.toLowerCase()})
                </span>
              )}
            </div>
          </div>
          {pointsData.length > 0 ? (
            <GoogleStockChart
              key={`points-${forceUpdate}-${currentFilter}-${pointsData.length}`}
              data={pointsData}
              dataKey="date"
              valueKey="value"
              color="#22c55e"
              height={300}
              showTooltip={true}
              gradientOpacity={0.3}
            />
          ) : (
            <div className={`flex items-center justify-center h-[300px] transition-colors ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <p>No data available for the chart - Filter: {currentFilter}</p>
            </div>
          )}
        </div>
      )}

      {activeChart === 'customers' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-lg font-semibold transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Customer Analytics</h3>
              <p className={`text-sm transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Customer Growth - {customerAnalytics.filterPeriod || currentFilter}
                {currentFilter !== "All Time" && (
                  <span className="ml-2 text-blue-600">
                    ({customerAnalytics.totalCustomersInRange || 0} customers in period)
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                (customerAnalytics.growthRate || 0) >= 0 ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={`font-medium ${
                (customerAnalytics.growthRate || 0) >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                Growth Rate
              </span>
              <span className={`font-bold transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {(customerAnalytics.growthRate || 0) >= 0 ? '+' : ''}{customerAnalytics.growthRate || 0}%
              </span>
            </div>
          </div>
          {customerGrowthChartData.length > 0 ? (
            <GoogleStockChart
              key={`customers-${forceUpdate}-${currentFilter}-${customerGrowthChartData.length}`}
              data={customerGrowthChartData}
              dataKey="date"
              valueKey="value"
              color="#3b82f6"
              height={300}
              showTooltip={true}
              gradientOpacity={0.3}
            />
          ) : (
            <div className={`flex items-center justify-center h-[300px] transition-colors ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <p>No customer data available for {currentFilter}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className={`px-2 sm:px-4 pb-6 ml-0 lg:ml-64 min-h-screen transition-colors ${
      isDarkMode ? 'bg-gray-900' : 'bg-[#f2f5f9]'
    }`}>
      {isLoading && <LoadingSpinner />}

      {/* Header Section */}
      <header className={`p-4 lg:p-6 border-b transition-colors ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-[#f2f5f9] border-gray-200'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-semibold transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Reward Analytics</h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Store Selection */}
            <select
              onChange={(e) => {
                setStoreId(e.target.value);
                setSelected(e.target.value);
              }}
              value={selected}
              className={`px-4 py-2 pr-8 rounded-lg border focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-200 text-gray-700'
              }`}
            >
              <option value="" disabled>Select Store</option>
              {stores.map((store) => (
                <option value={store._id} key={store._id}>
                  {store.name}
                </option>
              ))}
            </select>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <span className={`text-sm transition-colors ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Filter by:</span>
              <select
                value={currentFilter.toLowerCase().replace(" ", "")}
                onChange={(e) => handleFilterChange(e.target.value)}
                className={`px-4 py-2 pr-8 rounded-lg border focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                <option value="allTime">All Time</option>
                <option value="thisweek">This Week</option>
                <option value="lastMonth">Last Month</option>
                <option value="daterange">Date Range</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 lg:p-6">
        {/* Mobile Layout (sm and md) */}
        <div className="block lg:hidden">
          {/* Chart Section for Mobile at Top */}
          <div className="mb-6">
            <ChartSection />
          </div>

          {/* 2x3 Grid for Mobile */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatsCard
              title="Total customers"
              value={customerAnalytics.totalCustomers || 0}
              icon={Users}
              bgColor="bg-blue-100"
              textColor="text-blue-600"
              subtitle={currentFilter !== "All Time" ? `${currentFilter}` : "All time"}
            />
            <StatsCard
              title="Active users"
              value={customerAnalytics.activeUsers || 0}
              icon={MonitorDot}
              bgColor="bg-green-100"
              textColor="text-green-600"
              subtitle={currentFilter !== "All Time" ? `in ${currentFilter}` : "All time"}
            />
            <StatsCard
              title="Rewards created"
              value={analytics.totalRewardsCreated || 0}
              icon={Award}
              bgColor="bg-purple-100"
              textColor="text-purple-600"
              subtitle={currentFilter}
            />
            <StatsCard
              title="Rewards redeemed"
              value={analytics.totalRewardsRedeemed || 0}
              icon={Stamp}
              bgColor="bg-green-100"
              textColor="text-green-600"
              subtitle={currentFilter}
            />
            <StatsCard
              title="New users"
              value={customerAnalytics.newUsers || 0}
              icon={UserRoundPlus}
              bgColor="bg-orange-100"
              textColor="text-orange-600"
              subtitle={currentFilter !== "All Time" ? `in ${currentFilter}` : "Last 7 days"}
            />
            <StatsCard
              title="Page views"
              value={customerAnalytics.pageViews || 0}
              icon={Eye}
              bgColor="bg-blue-100"
              textColor="text-blue-600"
              subtitle={currentFilter !== "All Time" ? `${currentFilter}` : "All time"}
            />
          </div>

          {/* Points to Rupee Conversion - Full Width */}
          <div className="mb-6">
            <StatsCard
              title="Points to rupee conversion"
              value={`NPR ${((analytics?.totalPointsGivenOut || 0) * 0.1).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={Banknote}
              bgColor="bg-red-100"
              textColor="text-red-600"
              subtitle={`Based on ${currentFilter} data (1 point = NPR 0.10)`}
            />
          </div>
        </div>

        {/* Desktop Layout (lg and above) */}
        <div className="hidden lg:block">
          {/* Chart Section - Full Width at Top */}
          <div className="mb-6">
            <ChartSection />
          </div>

          {/* Stats Grid - 3 rows x 2 columns */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <StatsCard
              title="Total customers"
              value={customerAnalytics.totalCustomers || 0}
              icon={Users}
              bgColor="bg-blue-100"
              textColor="text-blue-600"
              subtitle={currentFilter !== "All Time" ? `${currentFilter}` : "All time"}
            />
            <StatsCard
              title="Active users"
              value={customerAnalytics.activeUsers || 0}
              icon={MonitorDot}
              bgColor="bg-green-100"
              textColor="text-green-600"
              subtitle={currentFilter !== "All Time" ? `in ${currentFilter}` : "All time"}
            />
            <StatsCard
              title="Rewards created"
              value={analytics.totalRewardsCreated || 0}
              icon={Award}
              bgColor="bg-purple-100"
              textColor="text-purple-600"
              subtitle={currentFilter}
            />
            <StatsCard
              title="Rewards redeemed"
              value={analytics.totalRewardsRedeemed || 0}
              icon={Stamp}
              bgColor="bg-green-100"
              textColor="text-green-600"
              subtitle={currentFilter}
            />
            <StatsCard
              title="New users"
              value={customerAnalytics.newUsers || 0}
              icon={UserRoundPlus}
              bgColor="bg-orange-100"
              textColor="text-orange-600"
              subtitle={currentFilter !== "All Time" ? `in ${currentFilter}` : "Last 7 days"}
            />
            <StatsCard
              title="Page views"
              value={customerAnalytics.pageViews || 0}
              icon={Eye}
              bgColor="bg-blue-100"
              textColor="text-blue-600"
              subtitle={currentFilter !== "All Time" ? `${currentFilter}` : "All time"}
            />
          </div>

          {/* Points to Rupee Conversion - Full Width */}
          <div className="mb-6">
            <StatsCard
              title="Points to rupee conversion"
              value={`NPR ${((analytics?.totalPointsGivenOut || 0) * 0.1).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={Banknote}
              bgColor="bg-purple-100"
              textColor="text-purple-600"
              subtitle={`Based on ${currentFilter} data (1 point = NPR 0.10)`}
            />
          </div>
        </div>

        {/* Rewards Table */}
        <div className="mb-6">
          <RewardsTable analytics={analytics} />
        </div>
      </main>

      {/* Date Range Modal */}
      {isDateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`p-6 rounded-lg shadow-lg w-full max-w-md transition-colors ${
            isDarkMode 
              ? 'bg-gray-900 border border-gray-700' 
              : 'bg-white'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Select Date Range</h3>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm mb-1 transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Start Date</label>
                <input
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  max={currentDate}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm mb-1 transition-colors ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>End Date</label>
                <input
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  max={currentDate}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleDateRangeCancel}
                className={`px-4 py-2 border rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 border-gray-600 hover:bg-gray-900' 
                    : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDateRangeApply}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Points Modal */}
      <PointsModal
        open={pGraphOpen}
        onClose={handleClose}
        analytics={analytics}
        graphData={graphData}
      />
    </div>
  );
}
