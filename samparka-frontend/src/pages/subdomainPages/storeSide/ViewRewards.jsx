import { Award, Search, ChevronDown, ChevronUp, Filter } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import LoadingSpinner from "../../../components/LoadingSpinner";
import api from "../../../api/config";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../../../context/ThemeContext";
import maskPhone from "./maskPhone";
import errorFunction from "./errorFunction";

const ViewRewards = (subdomain) => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("storeToken");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOutletFilter, setSelectedOutletFilter] = useState("all");
  const [expandedCard, setExpandedCard] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const queryClient = useQueryClient();
  const { storeData } = queryClient.getQueryData(["store"]);
  const { isDarkMode } = useTheme();

  // Get current outlet from localStorage
  const currentOutletId = localStorage.getItem("outletId");
  const currentOutlet = storeData?.outlets?.find(
    (outlet) => outlet._id === currentOutletId
  );
  const currentOutletName = currentOutlet?.location || currentOutlet?.name;

  // Check if L5 format is enabled
  const isL5Format = storeData?.loyaltyCard?.format === "L5";

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/store/login");
    }
    const fetchRewards = async () => {
      setLoading(true);
      try {
        const response = await api.get(
          `/store/getRedeemedRewards/${subdomain.url}`
        );

        if (response.data.success) {
          setRewards(response.data.redeemedRewards);
        } else {
          toast.error(response.data.message, { duration: 2000 });
        }
      } catch (error) {
        if (error.response?.status === 401) {
          errorFunction();
        } else {
          toast.error(error.message);
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, []);

  // Set default outlet filter to current outlet if available and L5 is enabled
  useEffect(() => {
    if (isL5Format && currentOutletId && currentOutletName) {
      setSelectedOutletFilter(currentOutletId);
    }
  }, [isL5Format, currentOutletId, currentOutletName]);

  const claimReward = async (rewardId) => {
    setLoading(true);
    try {
      let queryString = `rewardID=${rewardId}`;

      if (storeData.needBillIDForReward) {
        const billId = prompt("Please enter your bill ID to claim the reward:");
        if (!billId) {
          toast.error("Bill ID is required to claim the reward.", {
            duration: 2000,
          });
          return;
        }
        queryString += `&billID=${billId}`;
      }

      // For L4 stores with multiple outlets, pass the staff's current outlet
      // so the settlement report knows which outlet physically claimed the reward
      if (storeData?.loyaltyCard?.format === "L4" && currentOutletName) {
        queryString += `&outletLocation=${encodeURIComponent(currentOutletName)}`;
      }

      const response = await api.put(
        `/store/claimReward/${subdomain.url}?${queryString}`
      );
      if (response.data.success) {
        toast.success(response.data.message, {
          duration: 1000,
          onAutoClose: () => window.location.reload(),
        });
      } else {
        toast.error(response.data.message, { duration: 2000 });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        errorFunction(navigate);
      } else {
        console.error(error);
        toast.error(error.message, { duration: 2000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredRewards = rewards.filter((reward) => {
    const matchesSearch = [
      reward.reward.name,
      reward.customer.name,
      reward.customer.phone,
    ].some((field) =>
      String(field || "")
        .toLowerCase()
        .includes(query.toLowerCase())
    );

    const matchesStatus =
      statusFilter === "All" ||
      reward.status.toLowerCase() === statusFilter.toLowerCase();

    // Outlet filter logic (only for L5 rewards)
    const matchesOutlet =
      !isL5Format ||
      selectedOutletFilter === "all" ||
      !reward.isL5Reward ||
      (reward.outlet &&
        (typeof reward.outlet === "string"
          ? reward.outlet === currentOutletName
          : reward.outlet._id === selectedOutletFilter ||
            reward.outlet.location === currentOutletName ||
            reward.outlet.name === currentOutletName));

    return matchesSearch && matchesStatus && matchesOutlet;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRewards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRewards = filteredRewards.slice(startIndex, endIndex);

  const toggleCardExpansion = (rewardId) => {
    setExpandedCard((prev) => (prev === rewardId ? null : rewardId));
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "claimed":
        return isDarkMode
          ? "text-green-400 bg-green-900/30"
          : "text-green-600 bg-green-50";
      case "expired":
        return isDarkMode
          ? "text-gray-300 bg-gray-700"
          : "text-gray-800 bg-gray-200";
      case "pending":
        return isDarkMode
          ? "text-red-400 bg-red-900/30"
          : "text-red-600 bg-red-50";
      default:
        return isDarkMode
          ? "text-gray-400 bg-gray-700"
          : "text-gray-600 bg-gray-50";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className={`px-2 sm:px-0 md:px-4 lg:px-0 sm:ml-0 lg:ml-64 min-h-screen transition-colors ${
        isDarkMode ? "bg-gray-900" : "bg-[#f8fafb]"
      }`}
    >
      {loading && <LoadingSpinner />}

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
            Reward Records
          </h1>
          <span
            className={`text-sm transition-colors ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Total: {filteredRewards ? filteredRewards.length : 0} records
            {filteredRewards.length > 0 && (
              <span className="block sm:inline sm:ml-2">
                (Showing {startIndex + 1}-
                {Math.min(endIndex, filteredRewards.length)} of{" "}
                {filteredRewards.length})
              </span>
            )}
          </span>
        </div>

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
              placeholder="Search rewards..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`w-full sm:w-64 rounded-lg pl-10 pr-4 py-2.5 border focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent transition-colors ${
                isDarkMode
                  ? "bg-gray-900 text-white border-gray-600 placeholder-gray-400"
                  : "bg-white text-gray-700 border-gray-200"
              }`}
            />
          </div>

          {/* Outlet Filter - Only show if L5 format and multiple outlets */}
          {isL5Format && storeData?.services?.multipleOutlets && storeData?.outlets?.length > 0 && (
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
                className={`px-4 py-2 pr-8 rounded-lg border focus:outline-none focus:ring-1 focus:ring-green-500 appearance-none bg-no-repeat bg-[position:right_12px_center] transition-colors ${
                  isDarkMode
                    ? "bg-gray-900 text-white border-gray-600"
                    : "bg-white text-gray-700 border-gray-200"
                } bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')]`}
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

      {/* Status Filter Pills */}
      <div className="px-4 sm:px-6 py-3 flex flex-wrap gap-2">
        {[
          { label: "All", value: "All", count: rewards.length },
          {
            label: "Pending",
            value: "Pending",
            count: rewards.filter((r) => r.status === "pending").length,
            activeClass: "bg-red-500 text-white border-red-500",
            inactiveClass: isDarkMode
              ? "border-red-700 text-red-400 hover:bg-red-900/30"
              : "border-red-200 text-red-600 hover:bg-red-50",
            dotClass: "bg-red-400",
          },
          {
            label: "Claimed",
            value: "Claimed",
            count: rewards.filter((r) => r.status === "claimed").length,
            activeClass: "bg-green-600 text-white border-green-600",
            inactiveClass: isDarkMode
              ? "border-green-700 text-green-400 hover:bg-green-900/30"
              : "border-green-300 text-green-700 hover:bg-green-50",
            dotClass: "bg-green-500",
          },
          {
            label: "Expired",
            value: "Expired",
            count: rewards.filter((r) => r.status === "expired").length,
            activeClass: "bg-gray-900 text-white border-gray-900",
            inactiveClass: isDarkMode
              ? "border-gray-500 text-gray-300 hover:bg-gray-700/50"
              : "border-gray-400 text-gray-700 hover:bg-gray-100",
            dotClass: isDarkMode ? "bg-gray-400" : "bg-gray-600",
          },
        ].map(({ label, value, count, activeClass, inactiveClass, dotClass }) => {
          const isActive = statusFilter === value;
          const defaultActive = "bg-gray-700 text-white border-gray-700";
          const defaultInactive = isDarkMode
            ? "border-gray-600 text-gray-300 hover:bg-gray-800"
            : "border-gray-300 text-gray-600 hover:bg-gray-50";
          return (
            <button
              key={value}
              onClick={() => { setStatusFilter(value); setCurrentPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                isActive
                  ? activeClass || defaultActive
                  : inactiveClass || defaultInactive
              }`}
            >
              {dotClass && !isActive && (
                <span className={`w-2 h-2 rounded-full ${dotClass}`} />
              )}
              {label}
              <span
                className={`ml-0.5 min-w-[20px] text-center rounded-full px-1.5 py-0 text-xs font-bold ${
                  isActive
                    ? "bg-white/25 text-white"
                    : isDarkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Section */}
      <div>
        {/* Desktop Table View - Hidden on mobile */}
        <div
          className={`hidden lg:block rounded-xl shadow-sm border overflow-x-auto mx-4 sm:mx-6 transition-colors ${
            isDarkMode
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-100"
          }`}
        >
          <table className="w-full">
            <thead
              className={`border-b transition-colors ${
                isDarkMode
                  ? "bg-gray-900 border-gray-600"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <tr>
                <th
                  className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Reward
                </th>
                <th
                  className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Customer
                </th>
                <th
                  className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Phone No
                </th>
                {isL5Format && (
                  <th
                    className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Outlet
                  </th>
                )}
                {storeData?.needBillIDForReward && (
                  <th
                    className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Bill ID
                  </th>
                )}
                <th
                  className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Redeemed Date
                </th>
                <th
                  className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Expiry Date
                </th>
                <th
                  className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Status
                </th>
                <th
                  className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y transition-colors ${
                isDarkMode
                  ? "bg-gray-900 divide-gray-700"
                  : "bg-white divide-gray-100"
              }`}
            >
              {currentRewards.length > 0 ? (
                currentRewards.map((reward) => (
                  <tr
                    key={reward._id}
                    className={`transition-colors ${
                      isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-3 xl:px-6 py-4 whitespace-nowrap">
                      <div
                        className={`font-medium text-sm transition-colors ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {reward.reward.name}
                      </div>
                    </td>
                    <td className="px-3 xl:px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {reward.customer.name}
                      </div>
                    </td>
                    <td className="px-3 xl:px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {storeData?.showPhoneNumberOnSubAdmin
                          ? reward.customer.phone
                          : maskPhone(reward.customer.phone)}
                      </div>
                    </td>
                    {isL5Format && (
                      <td className="px-3 xl:px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm transition-colors ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {reward.isL5Reward
                            ? typeof reward.outlet === "string"
                              ? reward.outlet
                              : reward.outlet?.location || reward.outlet?.name || "---"
                            : "---"}
                        </div>
                      </td>
                    )}
                    {storeData?.needBillIDForReward && (
                      <td className="px-3 xl:px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm transition-colors ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {reward.billID ? `#${reward.billID}` : "------"}
                        </div>
                      </td>
                    )}
                    <td className="px-3 xl:px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {formatDate(reward.redeemDate)}
                      </div>
                    </td>
                    <td className="px-3 xl:px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {reward.expiryDate
                          ? formatDate(reward.expiryDate)
                          : "------"}
                      </div>
                    </td>
                    <td className="px-3 xl:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            reward.status
                          )}`}
                        >
                          •{" "}
                          {reward.status.charAt(0).toUpperCase() +
                            reward.status.slice(1)}
                        </span>
                        {reward.initiatedBy === "staff" && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                            Staff
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 xl:px-6 py-4 whitespace-nowrap">
                      {reward.status === "pending" && (
                        <button
                          onClick={() => claimReward(reward._id)}
                          className="px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs font-medium"
                        >
                          Claim
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={
                      storeData?.needBillIDForReward && isL5Format
                        ? "9"
                        : storeData?.needBillIDForReward || isL5Format
                        ? "8"
                        : "7"
                    }
                    className={`px-6 py-8 text-center transition-colors ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <Award
                      className={`w-12 h-12 mx-auto mb-4 transition-colors ${
                        isDarkMode ? "text-gray-600" : "text-gray-300"
                      }`}
                    />
                    <p>No results found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Accordion View (md and below) */}
        <div className="lg:hidden mx-4 sm:mx-6">
          {currentRewards.length > 0 ? (
            <div className="space-y-2">
              {currentRewards.map((reward, index) => {
                const isExpanded = expandedCard === reward._id;
                return (
                  <div
                    key={reward._id}
                    className={`rounded-lg shadow-sm border overflow-hidden transition-all duration-200 ${
                      isDarkMode
                        ? isExpanded
                          ? "bg-gray-800 border-green-600 shadow-lg shadow-green-900/20 ring-1 ring-green-500/20"
                          : "bg-gray-800 border-gray-700"
                        : isExpanded
                        ? "bg-white border-green-300 shadow-lg shadow-green-100 ring-1 ring-green-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    {/* Accordion Header - Always Visible */}
                    <button
                      onClick={() => toggleCardExpansion(reward._id)}
                      className={`w-full px-4 py-3 flex items-center justify-between transition-colors focus:outline-none ${
                        isDarkMode
                          ? isExpanded
                            ? "bg-gradient-to-r from-green-900/30 to-green-800/20 hover:from-green-900/40 hover:to-green-800/30"
                            : "hover:bg-gray-800 focus:bg-gray-700"
                          : isExpanded
                          ? "bg-gradient-to-r from-green-50 to-green-25 hover:from-green-75 hover:to-green-50"
                          : "hover:bg-gray-50 focus:bg-gray-50"
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
                                {reward.customer.name}
                              </h3>
                              <p
                                className={`text-xs mt-0.5 transition-colors ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {reward.reward.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 mx-2">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  reward.status
                                )}`}
                              >
                                •{" "}
                                {reward.status.charAt(0).toUpperCase() +
                                  reward.status.slice(1)}
                              </span>
                              {reward.initiatedBy === "staff" && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                  Staff
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expand/Collapse Icon */}
                      <svg
                        className={`w-5 h-5 transition-all duration-200 ${
                          isDarkMode
                            ? isExpanded
                              ? "rotate-180 text-green-400"
                              : "text-gray-500"
                            : isExpanded
                            ? "rotate-180 text-green-600"
                            : "text-gray-400"
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
                        className={`px-4 pb-4 transition-colors ${
                          isDarkMode
                            ? "border-t border-green-600/30 bg-gradient-to-b from-green-900/20 to-gray-800"
                            : "border-t border-green-200 bg-gradient-to-b from-green-25 to-white"
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
                                  isDarkMode ? "text-gray-200" : "text-gray-900"
                                }`}
                              >
                                {storeData?.showPhoneNumberOnSubAdmin
                                  ? reward.customer.phone
                                  : maskPhone(reward.customer.phone)}
                              </p>
                            </div>
                          </div>

                          {/* Outlet - Only show for L5 rewards */}
                          {isL5Format && reward.isL5Reward && (
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
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-xs mb-1 transition-colors ${
                                    isDarkMode ? "text-gray-400" : "text-gray-500"
                                  }`}
                                >
                                  Outlet
                                </p>
                                <p
                                  className={`text-sm transition-colors ${
                                    isDarkMode ? "text-gray-200" : "text-gray-900"
                                  }`}
                                >
                                  {typeof reward.outlet === "string"
                                    ? reward.outlet
                                    : reward.outlet?.location || reward.outlet?.name || "---"}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Redeemed Date */}
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
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs mb-1 transition-colors ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                Redeemed Date
                              </p>
                              <p
                                className={`text-sm transition-colors ${
                                  isDarkMode ? "text-gray-200" : "text-gray-900"
                                }`}
                              >
                                {formatDate(reward.redeemDate)}
                              </p>
                            </div>
                          </div>

                          {/* Expired Date */}
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
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs mb-1 transition-colors ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                Expired Date
                              </p>
                              <p
                                className={`text-sm transition-colors ${
                                  isDarkMode ? "text-gray-200" : "text-gray-900"
                                }`}
                              >
                                {reward.expiryDate
                                  ? formatDate(reward.expiryDate)
                                  : "------"}
                              </p>
                            </div>
                          </div>

                          {/* Bill ID (if needed) */}
                          {storeData?.needBillIDForReward && (
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
                                    isDarkMode
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                  }`}
                                >
                                  Bill ID
                                </p>
                                <p
                                  className={`text-sm transition-colors ${
                                    isDarkMode
                                      ? "text-gray-200"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {reward.billID
                                    ? `#${reward.billID}`
                                    : "------"}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Action Button (if pending) */}
                          {reward.status === "pending" && (
                            <div
                              className={`pt-2 border-t transition-colors ${
                                isDarkMode
                                  ? "border-gray-600"
                                  : "border-gray-200"
                              }`}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  claimReward(reward._id);
                                }}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                              >
                                Claim Reward
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className={`rounded-xl shadow-sm border p-8 transition-colors ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              }`}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <Award
                    className={`w-6 h-6 transition-colors ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                </div>
                <p
                  className={`text-sm transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  No rewards found
                </p>
                <p
                  className={`text-xs mt-1 transition-colors ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Rewards will appear here when customers redeem them
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredRewards.length > itemsPerPage && (
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 mx-4 sm:mx-6 gap-4 sm:gap-0 transition-colors ${
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
                {Math.min(endIndex, filteredRewards.length)} of{" "}
                {filteredRewards.length} results
              </span>
            </div>

            <div className="flex items-center justify-center space-x-1 sm:space-x-2 order-1 sm:order-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 sm:px-3 py-2 text-sm font-medium border rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode
                    ? "text-gray-400 bg-gray-800 border-gray-600 hover:bg-gray-800"
                    : "text-gray-500 bg-white border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">‹</span>
              </button>

              <div className="hidden sm:flex items-center space-x-1">
                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  const pageNum = index + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        currentPage === pageNum
                          ? "bg-green-600 text-white"
                          : isDarkMode
                          ? "text-gray-300 bg-gray-800 border border-gray-600 hover:bg-gray-800"
                          : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <div className="flex sm:hidden items-center space-x-1">
                {[...Array(Math.min(3, totalPages))].map((_, index) => {
                  const pageNum = index + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                        currentPage === pageNum
                          ? "bg-green-600 text-white"
                          : isDarkMode
                          ? "text-gray-300 bg-gray-800 border border-gray-600 hover:bg-gray-800"
                          : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-3 sm:px-3 py-2 text-sm font-medium border rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode
                    ? "text-gray-400 bg-gray-800 border-gray-600 hover:bg-gray-800"
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
    </div>
  );
};

export default ViewRewards;
