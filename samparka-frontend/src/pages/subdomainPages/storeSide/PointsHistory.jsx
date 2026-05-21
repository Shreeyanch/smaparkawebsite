import React, { useEffect, useState, useRef } from "react";
import api from "../../../api/config";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { Search, Loader2, Award, Eraser } from "lucide-react";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";
import maskPhone from "./maskPhone";

// Extend dayjs with the required plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function PointsHistory({ store }) {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("storeToken");
  const queryClient = useQueryClient();
  const { storeData } = queryClient.getQueryData(["store"]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/store/login");
    }
  }, [token]);

  const fetchHistory = async (storeId) => {
    const response = await api.get(`/store/getPointsHistoryStore/${storeId}`, {
      headers: { token },
    });
    return response.data;
  };

  const {
    data: history,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pointsHistory"],
    queryFn: () => fetchHistory(store._id),
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedEntry, setExpandedEntry] = useState(null);
  const [currentFilter, setCurrentFilter] = useState("All Time");
  const [itemsPerPage] = useState(10);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [selectedOutletFilter, setSelectedOutletFilter] = useState("all");
  const [undoConfirmEntry, setUndoConfirmEntry] = useState(null);
  const [undoLoading, setUndoLoading] = useState(false);
  const [undoPin, setUndoPin] = useState(["", "", "", ""]);
  const [undoPinError, setUndoPinError] = useState("");
  const undoPinRefs = useRef([]);

  const currentDate = dayjs().format("YYYY-MM-DD");

  // Get current outlet from localStorage
  const currentOutletId = localStorage.getItem("outletId");
  const currentOutlet = storeData?.outlets?.find(
    (outlet) => outlet._id === currentOutletId
  );
  const currentOutletName = currentOutlet?.location || currentOutlet?.name;

  // Initialize dates to show all time on component mount
  useEffect(() => {
    if (storeData?.createdAt) {
      const storeCreationDate = dayjs(storeData.createdAt).format("YYYY-MM-DD");
      setStartDate(storeCreationDate);

      // Set end date to tomorrow to include today's entries
      setEndDate(dayjs().add(1, "day").format("YYYY-MM-DD"));
    }
  }, [storeData]);

  // Set default outlet filter to current outlet if available
  useEffect(() => {
    if (currentOutletId && currentOutletName) {
      setSelectedOutletFilter(currentOutletId);
    }
  }, [currentOutletId, currentOutletName]);

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
    setEndDate(selectedEndDate);
  };

  const handleFilterChange = (filterType) => {
    if (filterType === "daterange") {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
      setIsDateModalOpen(true);
      return;
    }

    if (filterType === "lastmonth") {
      setStartDate(dayjs().subtract(1, "month").format("YYYY-MM-DD"));
      setEndDate(dayjs().add(1, "day").format("YYYY-MM-DD"));
      setCurrentFilter("Last Month");
    } else if (filterType === "alltime") {
      const storeCreationDate = dayjs(storeData.createdAt).format("YYYY-MM-DD");
      setStartDate(storeCreationDate);
      setEndDate(dayjs().add(1, "day").format("YYYY-MM-DD"));
      setCurrentFilter("All Time");
    } else if (filterType === "thisweek") {
      setStartDate(dayjs().subtract(7, "days").format("YYYY-MM-DD"));
      setEndDate(dayjs().add(1, "day").format("YYYY-MM-DD"));
      setCurrentFilter("This Week");
    } else if (filterType === "today") {
      setStartDate(dayjs().format("YYYY-MM-DD"));
      setEndDate(dayjs().add(1, "day").format("YYYY-MM-DD"));
      setCurrentFilter("Today");
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

  const filteredHistory = history?.points?.filter((entry) => {
    const matchesText = [
      entry?.customer?.name,
      entry?.customer?.phone,
      entry?.billID,
    ].some((field) =>
      String(field || "")
        .toLowerCase()
        .includes(query.toLowerCase())
    );

    const isWithinDateRange =
      dayjs(entry.createdAt).isSameOrAfter(dayjs(startDate)) &&
      dayjs(entry.createdAt).isSameOrBefore(dayjs(endDate));

    // Outlet filter logic
    const matchesOutlet =
      selectedOutletFilter === "all" ||
      (entry.outlet &&
        (typeof entry.outlet === "string"
          ? entry.outlet === currentOutletName
          : entry.outlet._id === selectedOutletFilter ||
            entry.outlet.location === currentOutletName ||
            entry.outlet.name === currentOutletName));

    return matchesText && isWithinDateRange && matchesOutlet;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredHistory?.length / itemsPerPage) || 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEntries = filteredHistory?.slice(startIndex, endIndex) || [];

  const handleUndoPinChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...undoPin];
    next[index] = value;
    setUndoPin(next);
    setUndoPinError("");
    if (value && index < 3) undoPinRefs.current[index + 1]?.focus();
  };

  const handleUndoPinKeyDown = (index, e) => {
    if (e.key === "Backspace" && !undoPin[index] && index > 0) {
      undoPinRefs.current[index - 1]?.focus();
    }
  };

  const closeUndoModal = () => {
    setUndoConfirmEntry(null);
    setUndoPin(["", "", "", ""]);
    setUndoPinError("");
  };

  const handleUndo = async () => {
    if (!undoConfirmEntry) return;
    const pinValue = undoPin.join("");
    if (pinValue.length !== 4) {
      setUndoPinError("Please enter the 4-digit outlet PIN");
      return;
    }
    setUndoLoading(true);
    try {
      const res = await api.delete(`/store/undoPointsHistory/${undoConfirmEntry._id}`, {
        headers: { token },
        data: { pin: pinValue },
      });
      if (res.data.success) {
        toast.success("Points entry reverted successfully");
        closeUndoModal();
        queryClient.invalidateQueries(["pointsHistory"]);
      } else {
        if (res.data.message === "Incorrect PIN") {
          setUndoPinError("Incorrect PIN. Please try again.");
          setUndoPin(["", "", "", ""]);
          setTimeout(() => undoPinRefs.current[0]?.focus(), 50);
        } else {
          toast.error(res.data.message || "Failed to revert");
        }
      }
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg === "Incorrect PIN") {
        setUndoPinError("Incorrect PIN. Please try again.");
        setUndoPin(["", "", "", ""]);
        setTimeout(() => undoPinRefs.current[0]?.focus(), 50);
      } else {
        toast.error(msg || "Failed to revert");
      }
    } finally {
      setUndoLoading(false);
    }
  };

  return (
    <div
      className={`px-2 sm:px-0 md:px-4 lg:px-0 sm:ml-0 lg:ml-64 min-h-screen transition-colors ${
        isDarkMode ? "bg-gray-900" : "bg-[#f8fafb]"
      }`}
    >
      {loading && <LoadingSpinner />}

      {/* Date Range Modal */}
      {isDateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transition-colors ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className={`text-lg font-semibold transition-colors ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Select Date Range
              </h3>
              <button
                onClick={handleDateRangeCancel}
                className={`transition-colors ${
                  isDarkMode
                    ? "text-gray-500 hover:text-gray-300"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 transition-colors ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Start Date
                </label>
                <input
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  max={currentDate}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 transition-colors ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  End Date
                </label>
                <input
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleDateRangeCancel}
                className={`px-4 py-2 text-sm font-medium border rounded-lg focus:outline-none focus:ring-1 transition-colors ${
                  isDarkMode
                    ? "text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600 focus:ring-gray-500"
                    : "text-gray-700 bg-gray-100 border-gray-300 hover:bg-gray-200 focus:ring-gray-500"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDateRangeApply}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revert Confirmation Modal */}
      {undoConfirmEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div
            className={`rounded-2xl shadow-2xl w-full max-w-sm transition-colors ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            {/* Header */}
            <div className={`px-6 py-5 border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Eraser size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Revert Points Entry
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    <span className="font-medium text-red-500">
                      {undoConfirmEntry.points > 0 ? `−${undoConfirmEntry.points}` : `+${Math.abs(undoConfirmEntry.points)}`}
                    </span>{" "}
                    pts · {undoConfirmEntry.customer?.name || "Customer"}
                  </p>
                </div>
              </div>
            </div>

            {/* PIN section */}
            <div className="px-6 py-5">
              <p className={`text-sm mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                Enter the outlet PIN to confirm this revert.
              </p>
              <div className="flex justify-center gap-3">
                {undoPin.map((digit, i) => (
                  <input
                    key={i}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleUndoPinChange(i, e.target.value)}
                    onKeyDown={(e) => handleUndoPinKeyDown(i, e)}
                    onKeyUp={(e) => e.key === "Enter" && handleUndo()}
                    ref={(el) => (undoPinRefs.current[i] = el)}
                    disabled={undoLoading}
                    className={`w-12 h-12 text-center text-xl font-bold rounded-xl border transition-all duration-150 ${
                      undoPinError
                        ? "border-red-400 bg-red-50 focus:ring-red-400"
                        : isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white focus:ring-green-500 focus:border-green-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-green-500 focus:border-green-500"
                    } focus:outline-none focus:ring-1 disabled:opacity-50`}
                    style={{ fontFamily: "monospace" }}
                  />
                ))}
              </div>
              {undoPinError && (
                <p className="text-xs text-red-500 text-center mt-2">{undoPinError}</p>
              )}
            </div>

            {/* Footer */}
            <div className={`px-6 pb-5 flex gap-3`}>
              <button
                onClick={closeUndoModal}
                disabled={undoLoading}
                className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  isDarkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleUndo}
                disabled={undoLoading || undoPin.join("").length !== 4}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Eraser size={14} />
                {undoLoading ? "Reverting..." : "Revert"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between w-full mb-6 sm:mb-8 p-4 sm:p-6 border-b transition-colors ${
          isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-[#f8fafb] border-gray-200"
        }`}
      >
        {/* Left: Title and Total */}
        <div className="flex flex-col gap-2 mb-4 sm:mb-0">
          <h1
            className={`text-xl sm:text-2xl font-semibold transition-colors ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Points History
          </h1>
          <span
            className={`text-sm transition-colors ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Total: {filteredHistory ? filteredHistory.length : 0} entries
            {filteredHistory && filteredHistory.length > 0 && (
              <span className="block sm:inline sm:ml-2">
                (Showing {startIndex + 1}-
                {Math.min(endIndex, filteredHistory.length)} of{" "}
                {filteredHistory.length})
              </span>
            )}
          </span>
        </div>

        {/* Right: Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name, phone, or bill ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`w-full sm:w-64 rounded-lg pl-10 pr-4 py-2.5 border focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent transition-colors ${
                isDarkMode
                  ? "bg-gray-900 text-white border-gray-600 placeholder-gray-400"
                  : "bg-white text-gray-700 border-gray-200"
              }`}
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Date Filter */}
            <div className="flex items-center gap-2">
              <span
                className={`text-sm whitespace-nowrap transition-colors ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Time:
              </span>
              <select
                value={currentFilter.toLowerCase().replace(" ", "")}
                onChange={(e) => {
                  handleFilterChange(e.target.value);
                  const filterMap = {
                    today: "Today",
                    thisweek: "This Week",
                    lastmonth: "Last Month",
                    alltime: "All Time",
                    daterange: "Date Range",
                  };
                  if (e.target.value !== "daterange") {
                    setCurrentFilter(filterMap[e.target.value]);
                  }
                }}
                className={`${
                  isDarkMode
                    ? "bg-gray-900 text-white border border-gray-600"
                    : "bg-white text-gray-700 border border-gray-200"
                } px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] bg-no-repeat bg-[position:right_12px_center] transition-colors`}
                style={{ backgroundSize: "12px" }}
              >
                <option value="alltime">All Time</option>
                <option value="today">Today</option>
                <option value="thisweek">This Week</option>
                <option value="lastmonth">Last Month</option>
                <option value="daterange">Date Range</option>
              </select>
            </div>

            {/* Outlet Filter - Only show if multiple outlets */}
            {storeData?.services?.multipleOutlets && storeData?.outlets?.length > 0 && (
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm whitespace-nowrap transition-colors ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Outlet:
                </span>
                <select
                  value={selectedOutletFilter}
                  onChange={(e) => setSelectedOutletFilter(e.target.value)}
                  className={`${
                    isDarkMode
                      ? "bg-gray-900 text-white border border-gray-600"
                      : "bg-white text-gray-700 border border-gray-200"
                  } px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')] bg-no-repeat bg-[position:right_12px_center] transition-colors`}
                  style={{ backgroundSize: "12px" }}
                >
                  <option value="all">All Outlets</option>
                  {currentOutletId && currentOutletName && (
                    <option value={currentOutletId}>
                      {currentOutletName} (Current)
                    </option>
                  )}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Main Content */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-green-600" />
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 py-20">
            <p className="text-lg">Failed to load points history.</p>
          </div>
        )}

        {!isLoading && history?.points?.length === 0 && (
          <div
            className={`text-center py-20 transition-colors ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <Award
              className={`w-16 h-16 mx-auto mb-4 transition-colors ${
                isDarkMode ? "text-gray-600" : "text-gray-300"
              }`}
            />
            <p className="text-lg">No points history found.</p>
          </div>
        )}

        {/* Main Table Content */}
        {!isLoading && filteredHistory?.length > 0 && (
          <div>
            {/* Desktop Table */}
            <div
              className={`hidden lg:block rounded-xl shadow-sm border overflow-hidden mx-4 sm:mx-6 transition-colors ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead
                    className={`border-b transition-colors ${
                      isDarkMode
                        ? "bg-gray-900 border-gray-600"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <tr>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Date & Time
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Customer
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Points
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Bill ID
                      </th>
                      {storeData?.services?.multipleOutlets && (
                        <th
                          className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                            isDarkMode ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          Outlet
                        </th>
                      )}
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Remarks
                      </th>
                      <th className={`px-3 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${isDarkMode ? "text-gray-300" : "text-gray-500"}`} />
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y transition-colors ${
                      isDarkMode
                        ? "bg-gray-900 divide-gray-700"
                        : "bg-white divide-gray-200"
                    }`}
                  >
                    {currentEntries?.map((entry) => (
                      <tr
                        key={entry._id}
                        className={`transition-colors ${
                          isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`text-sm transition-colors ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {dayjs(entry.createdAt).format("MMM DD, YYYY")}
                          </div>
                          <div
                            className={`text-sm transition-colors ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {dayjs(entry.createdAt).format("hh:mm A")}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-start items-center">
                            <div className="">
                              <div
                                className={`text-sm font-medium transition-colors ${
                                  isDarkMode ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {entry.customer?.name || "Unknown"}
                              </div>
                              <div
                                className={`text-sm transition-colors ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {storeData?.showPhoneNumberOnSubAdmin
                                  ? entry.customer?.phone
                                  : maskPhone(entry.customer?.phone)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              (entry.points || 0) < 0
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {entry.points || 0}
                          </span>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm transition-colors ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {entry.billID || "---"}
                        </td>
                        {storeData?.services?.multipleOutlets && (
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm transition-colors ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {typeof entry.outlet === 'string'
                              ? entry.outlet
                              : entry.outlet?.location || entry.outlet?.name || "---"}
                          </td>
                        )}
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm transition-colors ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {entry.remarks || "---"}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setUndoConfirmEntry(entry)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                              isDarkMode
                                ? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                                : "bg-red-50 text-red-600 hover:bg-red-100"
                            }`}
                          >
                            <Eraser size={12} />
                            Revert
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Accordion */}
            <div className="lg:hidden space-y-2">
              {currentEntries?.map((entry, index) => {
                const isExpanded = expandedEntry === entry._id;
                return (
                  <div
                    key={entry._id}
                    className={`rounded-lg shadow-sm border overflow-hidden transition-all duration-300 ${
                      isExpanded
                        ? `border-green-300 shadow-lg shadow-green-100 ${
                            isDarkMode ? "bg-gray-800" : "bg-white"
                          }`
                        : `${
                            isDarkMode
                              ? "border-gray-700 bg-gray-800"
                              : "border-gray-200 bg-white"
                          }`
                    }`}
                  >
                    {/* Accordion Header - Always Visible */}
                    <button
                      onClick={() =>
                        setExpandedEntry((prev) =>
                          prev === entry._id ? null : entry._id
                        )
                      }
                      className={`w-full px-4 py-3 flex items-center justify-between transition-all duration-300 focus:outline-none ${
                        isExpanded
                          ? `${
                              isDarkMode
                                ? "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700"
                                : "bg-gradient-to-r from-green-50 to-green-25 hover:from-green-100 hover:to-green-50"
                            }`
                          : `${
                              isDarkMode
                                ? "hover:bg-gray-800 focus:bg-gray-700"
                                : "hover:bg-gray-50 focus:bg-gray-50"
                            }`
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        {/* Row Number Badge */}
                        <span
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                            isDarkMode
                              ? "bg-gray-700 text-gray-300"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {startIndex + index + 1}
                        </span>

                        {/* Customer Info */}
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3
                                className={`font-medium text-sm transition-colors ${
                                  isDarkMode ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {entry.customer?.name || "Unknown"}
                              </h3>
                              <p
                                className={`text-xs mt-0.5 transition-colors ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {dayjs(entry.createdAt).format("MMM DD, YYYY")}
                              </p>
                            </div>
                            <div className="shrink-0 mx-2 text-right">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  (entry.points || 0) < 0
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {entry.points || 0} pts
                              </span>
                              <p
                                className={`text-xs mt-0.5 transition-colors ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {dayjs(entry.createdAt).format("hh:mm A")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expand/Collapse Icon */}
                      <svg
                        className={`w-5 h-5 transition-all duration-300 ${
                          isExpanded
                            ? "rotate-180 text-green-600"
                            : `${
                                isDarkMode ? "text-gray-500" : "text-gray-400"
                              }`
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Accordion Content - Expandable */}
                    {isExpanded && (
                      <div
                        className={`px-4 pb-4 border-t animate-in slide-in-from-top-2 duration-300 transition-colors ${
                          isDarkMode
                            ? "border-gray-600 bg-gradient-to-r from-gray-700 to-gray-800"
                            : "border-green-200 bg-gradient-to-r from-green-50 to-green-25"
                        }`}
                      >
                        <div className="space-y-3 pt-3">
                          {/* Phone Number */}
                          <div className="flex items-center space-x-3">
                            <svg
                              className={`w-4 h-4 flex-shrink-0 transition-colors ${
                                isDarkMode ? "text-gray-500" : "text-gray-400"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs mb-1 transition-colors ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                Phone Number
                              </p>
                              <p
                                className={`text-sm transition-colors ${
                                  isDarkMode ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {storeData?.showPhoneNumberOnSubAdmin
                                  ? entry.customer?.phone
                                  : maskPhone(entry.customer?.phone)}
                              </p>
                            </div>
                          </div>

                          {/* Bill ID */}
                          <div className="flex items-center space-x-3">
                            <svg
                              className={`w-4 h-4 flex-shrink-0 transition-colors ${
                                isDarkMode ? "text-gray-500" : "text-gray-400"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs mb-1 transition-colors ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                Bill ID
                              </p>
                              <p
                                className={`text-sm transition-colors ${
                                  isDarkMode ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {entry.billID || "N/A"}
                              </p>
                            </div>
                          </div>

                          {/* Outlet (if multiple outlets enabled) */}
                          {storeData?.services?.multipleOutlets && (
                            <div className="flex items-center space-x-3">
                              <svg
                                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                                  isDarkMode ? "text-gray-500" : "text-gray-400"
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-xs mb-1 transition-colors ${
                                    isDarkMode
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                  }`}
                                >
                                  Outlet
                                </p>
                                <p
                                  className={`text-sm transition-colors ${
                                    isDarkMode ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  {typeof entry.outlet === 'string'
                                    ? entry.outlet
                                    : entry.outlet?.location || entry.outlet?.name || "N/A"}
                                </p>
                              </div>
                            </div>
                          )}
                          <button
                            onClick={() => setUndoConfirmEntry(entry)}
                            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors mt-1 ${
                              isDarkMode
                                ? "border-red-800 bg-red-900/20 text-red-400 hover:bg-red-900/40"
                                : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                            }`}
                          >
                            <Eraser size={14} />
                            Revert Entry
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {filteredHistory && filteredHistory.length > itemsPerPage && (
              <div
                className={`mx-4 md:mx-0 flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 gap-4 sm:gap-0 transition-colors ${
                  isDarkMode
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-100"
                }`}
              >
                <div
                  className={`flex items-center text-sm order-2 sm:order-1 transition-colors ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <span className="text-center sm:text-left">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, filteredHistory.length)} of{" "}
                    {filteredHistory.length} results
                  </span>
                </div>

                <div className="flex items-center justify-center space-x-1 sm:space-x-2 order-1 sm:order-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-3 sm:px-3 py-2 text-sm font-medium border rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                      isDarkMode
                        ? "text-gray-400 bg-gray-700 border-gray-600 hover:bg-gray-600"
                        : "text-gray-500 bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">‹</span>
                  </button>

                  <div className="hidden sm:flex items-center space-x-1">
                    {(() => {
                      const pages = [];
                      const maxVisiblePages = 5;
                      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                      
                      // Adjust start if we're near the end
                      if (endPage - startPage < maxVisiblePages - 1) {
                        startPage = Math.max(1, endPage - maxVisiblePages + 1);
                      }
                      
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(i);
                      }
                      
                      return pages.map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            currentPage === page
                              ? "bg-green-600 text-white border-green-600"
                              : `${
                                  isDarkMode
                                    ? "text-gray-400 bg-gray-700 border border-gray-600 hover:bg-gray-600"
                                    : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                                }`
                          }`}
                        >
                          {page}
                        </button>
                      ));
                    })()}
                  </div>

                  <div className="flex sm:hidden items-center space-x-1">
                    {(() => {
                      const pages = [];
                      const maxVisiblePages = 3;
                      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                      
                      // Adjust start if we're near the end
                      if (endPage - startPage < maxVisiblePages - 1) {
                        startPage = Math.max(1, endPage - maxVisiblePages + 1);
                      }
                      
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(i);
                      }
                      
                      return pages.map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                            currentPage === page
                              ? "bg-green-600 text-white border-green-600"
                              : `${
                                  isDarkMode
                                    ? "text-gray-400 bg-gray-700 border border-gray-600 hover:bg-gray-600"
                                    : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                                }`
                          }`}
                        >
                          {page}
                        </button>
                      ));
                    })()}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-3 sm:px-3 py-2 text-sm font-medium border rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                      isDarkMode
                        ? "text-gray-400 bg-gray-700 border-gray-600 hover:bg-gray-600"
                        : "text-gray-500 bg-white border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">›</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
