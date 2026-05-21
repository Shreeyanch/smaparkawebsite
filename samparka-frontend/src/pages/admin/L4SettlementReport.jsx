import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api/config";
import { toast } from "sonner";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  FileSpreadsheet,
  FileText,
  // ChevronDown,
  // ChevronUp,
  Calendar,
  Store,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart2,
} from "lucide-react";

const L4SettlementReport = () => {
  const { isDarkMode } = useTheme();
  const { authState } = useAuth();
  const { token } = authState;
  const location = useLocation();

  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [week, setWeek] = useState(1);
  const [day, setDay] = useState(new Date().getDate());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [expandedTransaction, setExpandedTransaction] = useState(null);

  useEffect(() => {
    fetchL4Stores();
  }, []);

  const fetchL4Stores = async () => {
    try {
      // Check if user is admin
      const isAdmin = authState.userInfo?.role === "admin";

      let response;
      if (isAdmin) {
        // Admin: fetch all stores
        response = await api.get("/store", {
          headers: { token },
        });
      } else {
        // Store user: fetch their stores
        response = await api.get("/store/myStores", {
          headers: { token },
        });
      }

      if (response.data && response.data.stores) {
        // Filter for L4 stores with multiple outlets
        const l4Stores = response.data.stores.filter(
          (store) =>
            store.loyaltyCard?.format === "L4" &&
            store.services?.multipleOutlets === true
        );
        setStores(l4Stores);

        // Auto-select: prefer storeId from navigation state, else first store
        const preselectedId = location.state?.storeId;
        if (preselectedId && l4Stores.some((s) => s._id === preselectedId)) {
          setSelectedStore(preselectedId);
        } else if (l4Stores.length > 0) {
          setSelectedStore(l4Stores[0]._id);
        } else if (!isAdmin) {
          toast.error("Your store is not configured for L4 multi-outlet reports");
        }
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("Failed to load stores");
    }
  };

  const generateReport = async () => {
    if (!selectedStore) {
      toast.error("Please select a store");
      return;
    }

    setLoading(true);
    try {
      let params = { period };

      if (period === "daily") {
        params = { ...params, year, month, day };
      } else if (period === "weekly") {
        params = { ...params, year, week };
      } else if (period === "monthly") {
        params = { ...params, year, month };
      } else if (period === "yearly") {
        params = { ...params, year };
      } else if (period === "custom") {
        params = { ...params, startDate, endDate };
      }

      const response = await api.get(
        `/api/l4-reports/settlement/${selectedStore}`,
        {
          headers: { token },
          params,
        }
      );

      if (response.data.success) {
        setReportData(response.data.report);
        toast.success("Report generated successfully");
      } else {
        toast.error(response.data.message || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      const errorMessage = error.response?.data?.message || "Failed to generate report";
      toast.error(errorMessage);
      console.log("Full error response:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const buildExportParams = () => {
    const params = new URLSearchParams({ period });
    if (period === "monthly") {
      params.append("year", year);
      params.append("month", month);
    } else if (period === "yearly") {
      params.append("year", year);
    } else if (period === "custom") {
      params.append("startDate", startDate);
      params.append("endDate", endDate);
    }
    return params;
  };

  const downloadCSV = async () => {
    if (!selectedStore) {
      toast.error("Please generate a report first");
      return;
    }
    try {
      const params = buildExportParams();
      const response = await api.get(
        `/api/l4-reports/settlement/${selectedStore}/export/csv?${params.toString()}`,
        { headers: { token }, responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `l4-settlement-${selectedStore}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("CSV downloaded");
    } catch (error) {
      console.error("❌ CSV download error:", error);
      toast.error("Failed to download CSV");
    }
  };

  const downloadPDF = async () => {
    if (!selectedStore) {
      toast.error("Please generate a report first");
      return;
    }
    try {
      const params = buildExportParams();
      const response = await api.get(
        `/api/l4-reports/settlement/${selectedStore}/export/pdf?${params.toString()}`,
        { headers: { token }, responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `l4-settlement-${selectedStore}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch (error) {
      console.error("❌ PDF download error:", error);
      toast.error("Failed to download PDF");
    }
  };

  const getStatusColor = (status) => {
    if (status === "owed") return isDarkMode ? "text-green-400" : "text-green-600";
    if (status === "owes") return isDarkMode ? "text-red-400" : "text-red-600";
    return isDarkMode ? "text-gray-400" : "text-gray-600";
  };

  const getStatusBadge = (status) => {
    if (status === "owed")
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${isDarkMode ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700"}`}>
          <TrendingUp className="w-3 h-3" /> Owed
        </span>
      );
    if (status === "owes")
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${isDarkMode ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-700"}`}>
          <TrendingDown className="w-3 h-3" /> Owes
        </span>
      );
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${isDarkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-600"}`}>
        <Minus className="w-3 h-3" /> Settled
      </span>
    );
  };

  const inputClass = `w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent transition-colors text-sm ${
    isDarkMode
      ? "bg-gray-900 text-white border-gray-600 placeholder-gray-400"
      : "bg-white text-gray-700 border-gray-200"
  }`;

  const labelClass = `block text-xs font-medium uppercase tracking-wider mb-1.5 transition-colors ${
    isDarkMode ? "text-gray-400" : "text-gray-500"
  }`;

  return (
    <div
      className={`sm:ml-0 lg:ml-64 min-h-screen transition-colors ${
        isDarkMode ? "bg-gray-900" : "bg-[#f8fafb]"
      }`}
    >
      {loading && <LoadingSpinner />}

      {/* Page Header */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between w-full mb-6 sm:mb-8 p-4 sm:p-6 border-b transition-colors ${
          isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-[#f8fafb] border-gray-200"
        }`}
      >
        <div className="flex flex-col gap-1 mb-4 sm:mb-0">
          <h1
            className={`text-xl sm:text-2xl font-semibold transition-colors ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Settlement Report
          </h1>
          <span
            className={`text-sm transition-colors ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Track inter-outlet point settlements and generate reports
          </span>
        </div>

        {reportData && (
          <div className="flex items-center gap-3">
            {/* <button
              onClick={downloadCSV}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                isDarkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                  : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              CSV
            </button> */}
            <button
              onClick={downloadPDF}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                isDarkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                  : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              <FileText className="w-4 h-4 text-red-500" />
              PDF
            </button>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6">

        {/* Filters Card */}
        <div
          className={`rounded-xl shadow-sm border mb-6 transition-colors ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-100"
          }`}
        >
          <div
            className={`flex items-center gap-2 px-6 py-4 border-b transition-colors ${
              isDarkMode ? "border-gray-700" : "border-gray-100"
            }`}
          >
            <Calendar
              className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            />
            <h2
              className={`text-sm font-semibold uppercase tracking-wider transition-colors ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Report Filters
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Store Selector */}
              {authState.userInfo?.role === "admin" ? (
                <div>
                  <label className={labelClass}>Select Store</label>
                  <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select a store</option>
                    {stores.map((store) => (
                      <option key={store._id} value={store._id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : stores.length > 0 ? (
                <div>
                  <label className={labelClass}>Store</label>
                  <div
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                      isDarkMode
                        ? "bg-gray-900 border-gray-600 text-gray-300"
                        : "bg-gray-50 border-gray-200 text-gray-700"
                    }`}
                  >
                    {stores[0]?.name}
                  </div>
                </div>
              ) : null}

              {/* Period Selector */}
              <div>
                <label className={labelClass}>Period</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className={inputClass}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="all">All Time</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Daily inputs */}
              {period === "daily" && (
                <>
                  <div>
                    <label className={labelClass}>Year</label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Month</label>
                    <select
                      value={month}
                      onChange={(e) => setMonth(parseInt(e.target.value))}
                      className={inputClass}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2000, i).toLocaleString("default", { month: "long" })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Day</label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={day}
                      onChange={(e) => setDay(parseInt(e.target.value))}
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              {/* Weekly inputs */}
              {period === "weekly" && (
                <>
                  <div>
                    <label className={labelClass}>Year</label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Week</label>
                    <input
                      type="number"
                      min={1}
                      max={53}
                      value={week}
                      onChange={(e) => setWeek(parseInt(e.target.value))}
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              {/* Monthly inputs */}
              {period === "monthly" && (
                <>
                  <div>
                    <label className={labelClass}>Year</label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Month</label>
                    <select
                      value={month}
                      onChange={(e) => setMonth(parseInt(e.target.value))}
                      className={inputClass}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2000, i).toLocaleString("default", { month: "long" })}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Yearly input */}
              {period === "yearly" && (
                <div>
                  <label className={labelClass}>Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className={inputClass}
                  />
                </div>
              )}

              {/* Custom range */}
              {period === "custom" && (
                <>
                  <div>
                    <label className={labelClass}>Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-5">
              <button
                onClick={generateReport}
                disabled={loading}
                className="flex items-center justify-center bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <BarChart2 className="w-4 h-4 mr-2" />
                {loading ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </div>
        </div>

        {/* Report Data */}
        {!loading && reportData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div
                className={`rounded-xl shadow-sm border p-4 sm:p-5 transition-colors ${
                  isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
                }`}
              >
                <p className={`text-xs font-medium uppercase tracking-wider mb-2 transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Total Outlets
                </p>
                <p className={`text-2xl font-semibold transition-colors ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {reportData.summary.totalOutlets}
                </p>
              </div>

              <div
                className={`rounded-xl shadow-sm border p-4 sm:p-5 transition-colors ${
                  isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
                }`}
              >
                <p className={`text-xs font-medium uppercase tracking-wider mb-2 transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Points Awarded
                </p>
                <p className="text-2xl font-semibold text-purple-600">
                  {(reportData.summary.totalPointsAwarded || 0).toFixed(2)}
                </p>
              </div>

              <div
                className={`rounded-xl shadow-sm border p-4 sm:p-5 transition-colors ${
                  isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
                }`}
              >
                <p className={`text-xs font-medium uppercase tracking-wider mb-2 transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Points Distributed
                </p>
                <p className="text-2xl font-semibold text-blue-600">
                  {reportData.summary.totalPointsDistributed.toFixed(2)}
                </p>
              </div>

              <div
                className={`rounded-xl shadow-sm border p-4 sm:p-5 transition-colors ${
                  isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
                }`}
              >
                <p className={`text-xs font-medium uppercase tracking-wider mb-2 transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Points Redeemed
                </p>
                <p className="text-2xl font-semibold text-green-600">
                  {reportData.summary.totalPointsRedeemed.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Outlet Summary Table */}
            <div
              className={`rounded-xl shadow-sm border mb-6 overflow-hidden transition-colors ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
              }`}
            >
              <div
                className={`px-6 py-4 border-b transition-colors ${
                  isDarkMode ? "border-gray-700" : "border-gray-100"
                }`}
              >
                <h2
                  className={`text-sm font-semibold uppercase tracking-wider transition-colors ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Outlet Summary
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead
                    className={`border-b transition-colors ${
                      isDarkMode
                        ? "bg-gray-900 border-gray-600"
                        : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <tr>
                      {["Outlet", "Points Awarded", "Points Redeemed", "Net Settlement", "Status"].map((h, i) => (
                        <th
                          key={h}
                          className={`px-6 py-4 text-xs font-medium uppercase tracking-wider transition-colors ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          } ${i === 0 ? "text-left" : i === 5 ? "text-center" : "text-right"}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y transition-colors ${
                      isDarkMode ? "bg-gray-900 divide-gray-700" : "bg-white divide-gray-100"
                    }`}
                  >
                    {reportData.outletSummary.length > 0 ? (
                      reportData.outletSummary.map((outlet, index) => (
                        <tr
                          key={index}
                          className={`transition-colors ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"}`}
                        >
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium transition-colors ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {outlet.outlet}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isDarkMode ? "bg-purple-900/30 text-purple-400" : "bg-purple-100 text-purple-700"}`}>
                              {(outlet.pointsAwarded || 0).toFixed(2)}
                            </span>
                          </td>
                          {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isDarkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700"}`}>
                              {outlet.pointsDistributed.toFixed(2)}
                            </span>
                          </td> */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isDarkMode ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700"}`}>
                              {outlet.pointsRedeemed.toFixed(2)}
                            </span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${getStatusColor(outlet.status)}`}>
                            {outlet.netSettlement.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {getStatusBadge(outlet.status)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                              <Store className={`w-6 h-6 transition-colors ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                            </div>
                            <p className={`text-sm transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                              No outlet data available
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed Transactions */}
            <div
              className={`rounded-xl shadow-sm border mb-6 overflow-hidden transition-colors ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
              }`}
            >
              <div
                className={`px-6 py-4 border-b transition-colors ${
                  isDarkMode ? "border-gray-700" : "border-gray-100"
                }`}
              >
                <h2
                  className={`text-sm font-semibold uppercase tracking-wider transition-colors ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Detailed Transactions
                </h2>
                <p className={`text-xs mt-1 transition-colors ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Only rewards that have been claimed by staff are shown here
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead
                    className={`border-b transition-colors ${
                      isDarkMode
                        ? "bg-gray-900 border-gray-600"
                        : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <tr>
                      {["Date", /* "Bill ID", */ "Customer", "Reward", "Points", "Claimed At Outlet" /*, "Details" */].map((h, i) => (
                        <th
                          key={h}
                          className={`px-6 py-4 text-xs font-medium uppercase tracking-wider transition-colors ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          } ${i === 3 ? "text-right" : "text-left"}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y transition-colors ${
                      isDarkMode ? "bg-gray-900 divide-gray-700" : "bg-white divide-gray-100"
                    }`}
                  >
                    {reportData.detailedTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                              <FileText className={`w-6 h-6 transition-colors ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                            </div>
                            <p className={`text-sm transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                              No claimed rewards in this period
                            </p>
                            <p className={`text-xs mt-1 transition-colors ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                              Rewards appear here after staff confirms them in the store panel
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      reportData.detailedTransactions.map((txn, index) => (
                        <>
                          <tr
                            key={`txn-${index}`}
                            className={`transition-colors ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"}`}
                          >
                            <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                               {new Date(txn.date).toLocaleDateString("en-US", {
                                 year: "numeric",
                                 month: "short",
                                 day: "numeric",
                               })}
                             </td>
                             {/* <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                               {txn.billID || <span className={isDarkMode ? "text-gray-600" : "text-gray-400"}>N/A</span>}
                             </td> */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className={`text-sm font-medium transition-colors ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                  {txn.customer.name}
                                </span>
                                <span className={`text-xs transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                  {txn.customer.phone}
                                </span>
                              </div>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                              {txn.reward}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isDarkMode ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-800"}`}>
                                {txn.pointsDeducted} pts
                              </span>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                               {txn.claimedAtOutlet || <span className={isDarkMode ? "text-gray-600" : "text-gray-400"}>N/A</span>}
                             </td>
                             {/* <td className="px-6 py-4 whitespace-nowrap text-center">
                               {txn.outletContributions?.length > 0 && (
                                 <button
                                   onClick={() =>
                                     setExpandedTransaction(
                                       expandedTransaction === index ? null : index
                                     )
                                   }
                                   className={`p-1.5 rounded-lg transition-colors ${
                                     isDarkMode
                                       ? "hover:bg-gray-700 text-gray-400"
                                       : "hover:bg-gray-100 text-gray-500"
                                   }`}
                                 >
                                   {expandedTransaction === index ? (
                                     <ChevronUp className="w-4 h-4" />
                                   ) : (
                                     <ChevronDown className="w-4 h-4" />
                                   )}
                                 </button>
                               )}
                             </td> */}
                          </tr>

                          {/* {expandedTransaction === index &&
                            txn.outletContributions?.length > 0 && (
                              <tr
                                key={`contrib-${index}`}
                                className={`transition-colors ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}
                              >
                                <td colSpan={7} className="px-6 py-4">
                                  <p className={`text-xs font-medium uppercase tracking-wider mb-3 transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                    Points originated from outlets (proportional split)
                                  </p>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {txn.outletContributions.map((contrib, i) => (
                                      <div
                                        key={i}
                                        className={`px-4 py-3 rounded-lg border transition-colors ${
                                          isDarkMode
                                            ? "bg-gray-900 border-gray-700"
                                            : "bg-white border-gray-200"
                                        }`}
                                      >
                                        <p className={`text-sm font-medium mb-1 transition-colors ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                          {contrib.outlet}
                                        </p>
                                        <p className={`text-xs transition-colors ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>
                                          {contrib.pointsContributed} pts &middot; {contrib.percentageContribution}%
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            )} */}
                        </>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !reportData && (
          <div
            className={`rounded-xl shadow-sm border p-12 text-center transition-colors ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${
                isDarkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <BarChart2
                className={`w-7 h-7 transition-colors ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
              />
            </div>
            <p className={`text-sm font-medium transition-colors ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              No report generated yet
            </p>
            <p className={`text-xs mt-1 transition-colors ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
              Select a store and period above, then click Generate Report
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default L4SettlementReport;
