import { useEffect, useState } from "react";
import { LineChart } from "@mantine/charts";
import api from "../api/config";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  Filter,
  ShoppingCart,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  IndianRupee,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import StoreSelector from "../components/common/StoreSelector";

export default function Analytics() {
  const { isDarkMode } = useTheme();
  const [stores, setStores] = useState([]);
  const [customers, setCustomers] = useState([]);
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;
  const [selected, setSelected] = useState(
    localStorage.getItem("selectedValue") || ""
  );
  const [storeId, setStoreId] = useState(selected || "");
  const [orders, setOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [totalSales, setTotalSales] = useState(0); // Add state for total sales
  const [startDate, setStartDate] = useState(
    dayjs().subtract(7, "day").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("This Week");
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  const currentDate = dayjs().format("YYYY-MM-DD");

  // Handle date change validation
  const handleStartDateChange = (e) => {
    const selectedStartDate = e.target.value;
    if (selectedStartDate > currentDate) {
      toast.error("Start date cannot be in the future.", { duration: 2000 });
    } else {
      setStartDate(selectedStartDate);
    }
  };

  const handleEndDateChange = (e) => {
    const selectedEndDate = e.target.value;
    if (selectedEndDate > currentDate) {
      toast.error("End date cannot be in the future.", { duration: 2000 });
    } else if (selectedEndDate < startDate) {
      toast.error("End date cannot be earlier than the start date.", {
        duration: 2000,
      });
    } else {
      setEndDate(selectedEndDate);
    }
  };

  useEffect(() => {
    const getCustomers = async () => {
      try {
        const response = await api.get(`/store/getCustomerS/${selected}`, {
          headers: { token },
        });

        if (response.data.success) {
          setCustomers(response.data.customers);
        }
      } catch (error) {
        console.error(error);
        toast.error(error.messae, {
          duration: 2000,
        });
      }
    };

    if (selected) {
      getCustomers();
    }
  }, [storeId, selected]);

  useEffect(() => {
    const fetchStores = async () => {
      setIsLoading(true);
      try {
        const response =
          user.role === "admin"
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

    fetchStores();
  }, [token]);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/order/${selected}`, {
          headers: { token },
        });
        if (response.data.success) {
          setOrders(response.data.orders);
        } else {
          toast.error(response.data.message, { duration: 2000 });
          setOrders([]);
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message, { duration: 2000 });
      } finally {
        setIsLoading(false);
      }
    };

    if (selected) {
      fetchOrders();
    }
  }, [storeId, selected]);

  useEffect(() => {
    if (orders.length > 0) {
      // Filter orders within the selected date range
      const filteredOrders = orders.filter((order) => {
        const orderDate = dayjs(order.orderDate).format("YYYY-MM-DD");
        return orderDate >= startDate && orderDate <= endDate;
      });

      // Group orders by date
      const orderCounts = filteredOrders.reduce((acc, order) => {
        const date = dayjs(order.orderDate).format("YYYY-MM-DD");
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      // Generate all dates between start and end date to include missing days
      const dateRange = [];
      let currentDateIter = dayjs(startDate);
      const endDateObj = dayjs(endDate);

      while (
        currentDateIter.isBefore(endDateObj) ||
        currentDateIter.isSame(endDateObj, "day")
      ) {
        dateRange.push(currentDateIter.format("YYYY-MM-DD"));
        currentDateIter = currentDateIter.add(1, "day");
      }

      // Prepare chart data by ensuring missing dates have 0 orders
      const formattedData = dateRange.map((date) => ({
        x: date,
        Orders: orderCounts[date] || 0, // Explicitly set to 0 if no orders
      }));

      // Sort chart data by date
      const sortedData = formattedData.sort((a, b) =>
        dayjs(a.x).isBefore(b.x) ? -1 : 1
      );

      setChartData(sortedData);
    } else {
      // If there are no orders, ensure chartData is set with empty dates
      setChartData([]);
    }
  }, [orders, startDate, endDate]);

  const handleFilterChange = (filterType) => {
    if (filterType === "daterange") {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
      setIsDateModalOpen(true);
      return;
    }

    if (filterType === "lastMonth") {
      setStartDate(dayjs().subtract(1, "month").format("YYYY-MM-DD"));
      setEndDate(currentDate);
      setCurrentFilter("Last Month");
    } else if (filterType === "allTime") {
      const selectedStore = stores.find((store) => store._id === storeId);
      if (selectedStore) {
        const storeCreationDate = dayjs(selectedStore.createdAt).format(
          "YYYY-MM-DD"
        );
        setStartDate(storeCreationDate);
        setEndDate(currentDate);
      }
      setCurrentFilter("All Time");
    } else if (filterType === "thisweek") {
      setStartDate(dayjs().subtract(7, "days").format("YYYY-MM-DD"));
      setEndDate(currentDate);
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
      toast.error("Please select both start and end dates.", {
        duration: 2000,
      });
    }
  };

  const handleDateRangeCancel = () => {
    setTempStartDate("");
    setTempEndDate("");
    setIsDateModalOpen(false);
  };

  // Calculate total sales for all paid orders regardless of date range
  const totalSalesForAllPaidOrders = orders
    .filter((order) => order.status === "paid")
    .reduce((sum, order) => sum + order.totalAmount, 0);

  // Calculate pending orders
  const pendingOrdersCount = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const customerCount = customers.length;
  const newCustomerCount = customers.filter(
    (customer) => customer.isNewCustomer
  ).length;

  return (
    <div
      className={`px-2 sm:px-4 pb-6 sm:ml-64 min-h-screen transition-colors ${
        isDarkMode ? "bg-gray-900" : "bg-[#f2f5f9]"
      }`}
    >
      {isLoading && <LoadingSpinner />}

      {/* Header Section */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between w-full p-2 sm:p-4 lg:p-6 border-b transition-colors ${
          isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-[#f2f5f9] border-gray-200"
        }`}
      >
        {/* Left: Title and Analytics Info */}
        <div className="flex flex-col gap-2 mb-4 sm:mb-0">
          <h1
            className={`text-lg sm:text-xl lg:text-2xl font-semibold transition-colors ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Sales Analytics
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Store Selection */}
          <StoreSelector
            selectedStoreId={selected}
            onStoreIdChange={(storeId) => {
              setStoreId(storeId);
              setSelected(storeId);
            }}
            variant="default"
            customStores={stores}
            fetchOnMount={false}
          />

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span
              className={`text-sm whitespace-nowrap transition-colors ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Filter by:
            </span>
            <select
              value={currentFilter.toLowerCase().replace(" ", "")}
              onChange={(e) => {
                handleFilterChange(e.target.value);
              }}
              className={`px-4 py-2 pr-8 rounded-lg border focus:outline-none focus:ring-1 focus:ring-green-500 appearance-none bg-no-repeat bg-[position:right_12px_center] transition-colors ${
                isDarkMode
                  ? "bg-gray-800 text-white border-gray-600"
                  : "bg-white text-gray-700 border-gray-200"
              }`}
              style={{
                backgroundImage: isDarkMode
                  ? "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iI0Y5RkFGQiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')"
                  : "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')",
                backgroundSize: "12px",
              }}
            >
              <option value="allTime">All Time</option>
              <option value="thisweek">This Week</option>
              <option value="lastMonth">Last Month</option>
              <option value="daterange">Date Range</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-4 lg:p-6">
        {/* Top Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          {/* Sales (All Paid Orders) */}
          <div
            className={`p-4 sm:p-6 rounded-xl transition-colors ${
              isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-[#e3f2fd]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium mb-2 transition-colors ${
                    isDarkMode ? "text-blue-400" : "text-[#1976d2]"
                  }`}
                >
                  Sales (All Paid Orders)
                </p>
                <p
                  className={`text-xl sm:text-2xl font-semibold transition-colors ${
                    isDarkMode ? "text-blue-300" : "text-[#0d47a1]"
                  }`}
                >
                  Rs. {totalSalesForAllPaidOrders.toLocaleString()}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isDarkMode ? "bg-blue-600" : "bg-[#2196f3]"
                }`}
              >
                <IndianRupee className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Orders */}
          <div
            className={`p-4 sm:p-6 rounded-xl transition-colors ${
              isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-[#e8f5e8]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium mb-2 transition-colors ${
                    isDarkMode ? "text-green-400" : "text-[#388e3c]"
                  }`}
                >
                  Orders
                </p>
                <p
                  className={`text-xl sm:text-2xl font-semibold transition-colors ${
                    isDarkMode ? "text-green-300" : "text-[#1b5e20]"
                  }`}
                >
                  {orders.length}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isDarkMode ? "bg-green-600" : "bg-[#4caf50]"
                }`}
              >
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Pendings */}
          <div
            className={`p-4 sm:p-6 rounded-xl transition-colors ${
              isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-[#fff8e1]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium mb-2 transition-colors ${
                    isDarkMode ? "text-yellow-400" : "text-[#f57c00]"
                  }`}
                >
                  Pendings
                </p>
                <p
                  className={`text-xl sm:text-2xl font-semibold transition-colors ${
                    isDarkMode ? "text-yellow-300" : "text-[#e65100]"
                  }`}
                >
                  {pendingOrdersCount}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isDarkMode ? "bg-yellow-600" : "bg-[#ff9800]"
                }`}
              >
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* No. of Customers */}
          <div
            className={`p-4 sm:p-6 rounded-xl transition-colors ${
              isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-[#fce4ec]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium mb-2 transition-colors ${
                    isDarkMode ? "text-pink-400" : "text-[#880e4f]"
                  }`}
                >
                  No. of Customers
                </p>
                <p
                  className={`text-xl sm:text-2xl font-semibold transition-colors ${
                    isDarkMode ? "text-pink-300" : "text-[#880e4f]"
                  }`}
                >
                  {customerCount}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isDarkMode ? "bg-pink-600" : "bg-[#e91e63]"
                }`}
              >
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Chart and Top Products */}
        <div className="grid grid-cols-1  gap-6">
          {/* Daily Sales Overview - Takes up 2 columns */}
          <div
            className={`xl:col-span-2 p-6 rounded-xl border transition-colors ${
              isDarkMode
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="mb-6">
              <h2
                className={`text-xl font-semibold mb-2 transition-colors ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Daily Sales Overview
              </h2>
              <p
                className={`text-sm transition-colors ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Sales performance over the selected period
              </p>
            </div>

            {chartData.length > 0 ? (
              <LineChart
                h={
                  window.innerWidth < 640
                    ? 200
                    : window.innerWidth < 768
                    ? 250
                    : window.innerWidth < 1024
                    ? 280
                    : 400
                }
                data={chartData}
                dataKey="x"
                curveType="linear"
                series={[
                  {
                    name: "Orders",
                    color: isDarkMode ? "#60a5fa" : "#3b82f6",
                  },
                ]}
                gridProps={{
                  stroke: isDarkMode ? "#374151" : "#f3f4f6",
                  strokeDasharray: "5 5",
                }}
                xAxisProps={{
                  tick: {
                    fill: isDarkMode ? "#d1d5db" : "#6b7280",
                    fontSize: 12,
                  },
                }}
                yAxisProps={{
                  tick: {
                    fill: isDarkMode ? "#d1d5db" : "#6b7280",
                    fontSize: 12,
                  },
                }}
              />
            ) : (
              <div
                className={`flex items-center justify-center h-[400px] transition-colors ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <p className="text-sm">No data available for the chart</p>
              </div>
            )}
          </div>

          {/* Top Products - Takes up 1 column */}
          {/* <div
            className={`p-6 rounded-xl border transition-colors ${
              isDarkMode
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="mb-6">
              <h2
                className={`text-xl font-semibold mb-2 transition-colors ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Top Products
              </h2>
              <p
                className={`text-sm transition-colors ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Best performing products
              </p>
            </div>

            <div className="space-y-4">
              <div
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      isDarkMode
                        ? "bg-blue-600 text-blue-100"
                        : "bg-blue-200 text-blue-600"
                    }`}
                  >
                    1
                  </div>
                  <div>
                    <p
                      className={`font-medium transition-colors ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Mclaren Jersey F1
                    </p>
                    <p
                      className={`text-sm transition-colors ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      3 orders
                    </p>
                  </div>
                </div>
                <p
                  className={`font-semibold transition-colors ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  ₹5940
                </p>
              </div>

              <div
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      isDarkMode
                        ? "bg-blue-600 text-blue-100"
                        : "bg-blue-200 text-blue-600"
                    }`}
                  >
                    2
                  </div>
                  <div>
                    <p
                      className={`font-medium transition-colors ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Gaming Keyboard
                    </p>
                    <p
                      className={`text-sm transition-colors ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      2 orders
                    </p>
                  </div>
                </div>
                <p
                  className={`font-semibold transition-colors ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  ₹4600
                </p>
              </div>

              <div
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      isDarkMode
                        ? "bg-blue-600 text-blue-100"
                        : "bg-blue-200 text-blue-600"
                    }`}
                  >
                    3
                  </div>
                  <div>
                    <p
                      className={`font-medium transition-colors ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Gaming Mouse Pro
                    </p>
                    <p
                      className={`text-sm transition-colors ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      1 order
                    </p>
                  </div>
                </div>
                <p
                  className={`font-semibold transition-colors ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  ₹2300
                </p>
              </div>

              <button
                className={`w-full p-3 rounded-lg text-sm font-medium transition-all ${
                  isDarkMode
                    ? "bg-gray-900 text-green-400 hover:bg-gray-800 border border-gray-600"
                    : "bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                }`}
              >
                View All Products
              </button>
            </div>
          </div> */}
        </div>

        {/* Date Range Modal */}
        {isDateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className={`p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-96 transition-colors ${
                isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white"
              }`}
            >
              <h3
                className={`text-base sm:text-lg font-semibold mb-4 transition-colors ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Select Date Range
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm mb-1 transition-colors ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={tempStartDate}
                    onChange={(e) => setTempStartDate(e.target.value)}
                    max={currentDate}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm mb-1 transition-colors ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    End Date
                  </label>
                  <input
                    type="date"
                    value={tempEndDate}
                    onChange={(e) => setTempEndDate(e.target.value)}
                    max={currentDate}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleDateRangeCancel}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    isDarkMode
                      ? "text-gray-300 border-gray-600 hover:bg-gray-900"
                      : "text-gray-600 border-gray-200 hover:bg-gray-50"
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
      </div>
    </div>
  );
}
