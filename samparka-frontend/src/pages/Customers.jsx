import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/config";
import { toast } from "sonner";
import LoadingSpinner from "../components/LoadingSpinner";
import Papa from "papaparse"; // CSV parser
import {
  Ellipsis,
  Medal,
  Search,
  Trash2,
  UserPlus,
  ScanQrCode,
  SwitchCamera,
  FileUp,
  FileDown,
  Cake,
  User,
  Flame,
  Star,
  Pencil,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import _, { toInteger } from "lodash";
import QrScanner from "react-qr-scanner";
import { countryCodes } from "../config/countryCodes";
import { useQuery } from "@tanstack/react-query";
import StoreSelector from "../components/common/StoreSelector";
import LeaderboardFilterBar from "../components/LeaderboardFilterBar";

const originalPointsMap = new Map();

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const { authState } = useAuth();
  const { isDarkMode } = useTheme();
  const { userInfo: user, token } = authState;
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+977");
  const [remarks, setRemarks] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [outletForPointsModal, setOutletForPointsModal] = useState("");
  // const [data, setData] = useState("No result");
  const [selectedStore, setSelectedStore] = useState(
    localStorage.getItem("selectedStoreData")
      ? JSON.parse(localStorage.getItem("selectedStoreData"))
      : {}
  );
  const [selected, setSelected] = useState(
    localStorage.getItem("selectedValue") || ""
  );
  const [storeID, setStoreID] = useState(selected || "");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const fileInputRef = useRef(null);
  const lastFetchedStoreIdRef = useRef("");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrPoints, setQRPoints] = useState("");
  const [qrData, setQRData] = useState("");
  const [billAmount, setBillAmount] = useState();
  const [billID, setBillID] = useState("");
  const [addingPoints, setAddingPoints] = useState();
  const [subtractingPoints, setSubtractingPoints] = useState();
  const [showModal, setShowModal] = useState(false);
  const [modelCustomerId, setModelCustomerId] = useState();
  const [cameraFacingMode, setCameraFacingMode] = useState("environment"); // Default to back camera
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [pointsModalData, setPointsModalData] = useState({
    type: "", // 'increase', 'decrease', or 'change'
    userId: "",
    currentPoints: 0,
    newPoints: 0,
    store: null,
  });
  const [showPointsHistoryModal, setShowPointsHistoryModal] = useState(false);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] =
    useState(null);
  const [customerPointsHistory, setCustomerPointsHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [editCustomerData, setEditCustomerData] = useState({});
  const [editCustomerLoading, setEditCustomerLoading] = useState(false);
  const [editCustomerErrors, setEditCustomerErrors] = useState({ email: "", phone: "" });

  // Group selection states
  const [selectedCustomers, setSelectedCustomers] = useState(new Set());
  const [showGroupDeleteModal, setShowGroupDeleteModal] = useState(false);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [decreasePointsModal, setDecreasePointsModal] = useState(false);
  const [increasePointsModal, setIncreasePointsModal] = useState(false);

  // L5 Leaderboard state
  const [l5LeaderboardData, setL5LeaderboardData] = useState(null);
  const [l5LeaderboardLoading, setL5LeaderboardLoading] = useState(false);

  // Period filter state for leaderboard
  const [leaderboardPeriod, setLeaderboardPeriod] = useState("all");
  const [leaderboardCustomStart, setLeaderboardCustomStart] = useState("");
  const [leaderboardCustomEnd, setLeaderboardCustomEnd] = useState("");
  const [periodPointsMap, setPeriodPointsMap] = useState(new Map());
  const [periodLoading, setPeriodLoading] = useState(false);

  // Check if current store is L5 format
  const isL5Format = selectedStore?.loyaltyCard?.format === "L5";
  const selectedStoreId = selectedStore?._id;

  // Fetch L5 leaderboard data (admin endpoint) - memoized to prevent recreation
  const fetchL5Leaderboard = useCallback(async (storeIdParam) => {
    if (!storeIdParam || user?.role !== "admin") return;
    
    setL5LeaderboardLoading(true);
    try {
      const response = await api.get(`/api/l5/leaderboard/${storeIdParam}/admin`, {
        headers: { token },
      });
      if (response.data.success) {
        setL5LeaderboardData(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch L5 leaderboard:", error);
    } finally {
      setL5LeaderboardLoading(false);
    }
  }, [token, user?.role]);

  // Fetch period-based leaderboard points from transaction history
  const fetchPeriodLeaderboard = useCallback(async (storeIdParam, activePeriod, start, end) => {
    if (!storeIdParam || activePeriod === "all") {
      setPeriodPointsMap(new Map());
      return;
    }
    if (activePeriod === "custom" && (!start || !end)) return;
    if (user?.role !== "admin") return;

    setPeriodLoading(true);
    try {
      const params = new URLSearchParams({ period: activePeriod });
      if (activePeriod === "custom") {
        params.append("startDate", start);
        params.append("endDate", end);
      }
      const response = await api.get(`/store/leaderboardByPeriod/${storeIdParam}?${params}`, {
        headers: { token },
      });
      if (response.data.success) {
        const map = new Map();
        response.data.customers.forEach((c) => {
          map.set(String(c._id), c.periodPoints);
        });
        setPeriodPointsMap(map);
      }
    } catch (error) {
      console.error("Failed to fetch period leaderboard:", error);
    } finally {
      setPeriodLoading(false);
    }
  }, [token, user?.role]);

  // Fetch L5 leaderboard when store changes and is L5 format
  // Use selectedStoreId to prevent triggering when other selectedStore properties change
  useEffect(() => {
    if (isL5Format && selectedStoreId && user?.role === "admin") {
      fetchL5Leaderboard(selectedStoreId);
    } else {
      setL5LeaderboardData(null);
    }
    // Reset period filter when store changes
    setLeaderboardPeriod("all");
    setPeriodPointsMap(new Map());
  }, [selectedStoreId, isL5Format, fetchL5Leaderboard, user?.role]);

  // Re-fetch when period filter changes
  useEffect(() => {
    if (!selectedStoreId || user?.role !== "admin") return;
    fetchPeriodLeaderboard(selectedStoreId, leaderboardPeriod, leaderboardCustomStart, leaderboardCustomEnd);
  }, [selectedStoreId, leaderboardPeriod, leaderboardCustomStart, leaderboardCustomEnd, fetchPeriodLeaderboard, user?.role]);

  // Get leaderboard customers - use L5 data if L5 format, otherwise use regular customers
  const leaderboardCustomers = useMemo(() => {
    let base;
    if (isL5Format && l5LeaderboardData?.leaderboard) {
      base = l5LeaderboardData.leaderboard.map((entry) => ({
        _id: entry.customer?._id,
        name: entry.customer?.name || "Unknown",
        points: entry.totalPointsEarned,
        rank: entry.rank,
        isQualified: entry.isQualified,
        isCoffeeHero: entry.isCoffeeHero,
      }));
    } else {
      base = [...customers].sort((a, b) => b.points - a.points);
    }

    // When a period filter is active, re-rank by earned points in that period
    if (leaderboardPeriod !== "all") {
      return base
        .map((c) => ({
          ...c,
          displayPoints: periodPointsMap.get(String(c._id)) ?? 0,
        }))
        .filter((c) => c.displayPoints > 0)
        .sort((a, b) => b.displayPoints - a.displayPoints);
    }

    return base.map((c) => ({ ...c, displayPoints: c.points }));
  }, [isL5Format, l5LeaderboardData, customers, leaderboardPeriod, periodPointsMap]);

  // Human-readable label for the active period filter
  const leaderboardPeriodLabel =
    leaderboardPeriod === "week"
      ? "This Week"
      : leaderboardPeriod === "month"
      ? "This Month"
      : leaderboardPeriod === "custom" && leaderboardCustomStart && leaderboardCustomEnd
      ? `${leaderboardCustomStart} – ${leaderboardCustomEnd}`
      : null;

  // Create a map of L5 leaderboard data by customer ID for quick lookup
  const l5PointsMap = useMemo(() => {
    if (isL5Format && l5LeaderboardData?.leaderboard) {
      const map = new Map();
      l5LeaderboardData.leaderboard.forEach((entry) => {
        if (entry.customer?._id) {
          map.set(entry.customer._id, {
            totalPointsEarned: entry.totalPointsEarned,
            rank: entry.rank,
            isQualified: entry.isQualified,
            isCoffeeHero: entry.isCoffeeHero,
          });
        }
      });
      return map;
    }
    return new Map();
  }, [isL5Format, l5LeaderboardData]);

  const [newCustomer, setNewCustomer] = useState({
    store: localStorage.getItem("selectedValue") || "",
    name: "",
    email: "",
    phone: "",
  });

  // Customer Accordion Item Component
  const CustomerAccordionItem = ({
    user,
    index,
    selectedCustomers,
    handleSelectCustomer,
    handleDecrease,
    handleIncrease,
    handleChangePoints,
    handleTierChange,
    handleViewPointsHistory,
    setShowModal,
    setModelCustomerId,
    selectedStore,
    dropdownOpen,
    setDropdownOpen,
    expandedAccordion,
    setExpandedAccordion,
    startIndex = 0,
    isDarkMode,
    displayPoints,
  }) => {
    const isExpanded = expandedAccordion === user._id;

    const handleToggleExpand = () => {
      setExpandedAccordion(isExpanded ? null : user._id);
    };

    return (
      <div
        className={`rounded-lg shadow-sm border overflow-hidden transition-all duration-200 ${
          isDarkMode
            ? isExpanded
              ? "bg-gray-900 border-green-600 shadow-lg shadow-green-900/20 ring-1 ring-green-700"
              : "bg-gray-900 border-gray-700"
            : isExpanded
            ? "bg-white border-green-300 shadow-lg shadow-green-100 ring-1 ring-green-200"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Accordion Header - Always Visible */}
        <button
          onClick={handleToggleExpand}
          className={`w-full px-4 py-3 flex items-center justify-between transition-colors focus:outline-none ${
            isDarkMode
              ? isExpanded
                ? "bg-gradient-to-r from-green-900/30 to-green-800/20 hover:from-green-900/40 hover:to-green-800/30"
                : "hover:bg-gray-900 focus:bg-gray-900"
              : isExpanded
              ? "bg-gradient-to-r from-green-50 to-green-25 hover:from-green-75 hover:to-green-50"
              : "hover:bg-gray-50 focus:bg-gray-50"
          }`}
        >
          <div className="flex items-center space-x-3 flex-1">
            {/* Customer Number Badge */}
            <span
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                isDarkMode
                  ? "bg-gray-900 text-gray-300"
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
                    {user.name}
                  </h3>
                  <p
                    className={`text-xs mt-0.5 transition-colors ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Joined{" "}
                    {new Date(user.createdAt || Date.now()).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
                <span
                  className={`ml-2 mr-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                    isDarkMode
                      ? "bg-green-900/30 text-green-400"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {(displayPoints ?? user.points)?.toLocaleString()} pts
                </span>
              </div>
            </div>
          </div>

          {/* Expand/Collapse Icon */}
          <svg
            className={`w-5 h-5 transition-all duration-200 ${
              isExpanded
                ? isDarkMode
                  ? "rotate-180 text-green-400"
                  : "rotate-180 text-green-600"
                : isDarkMode
                ? "text-gray-500"
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
            className={`px-4 pb-4 border-t transition-colors ${
              isDarkMode
                ? "border-green-700 bg-gradient-to-b from-green-900/20 to-gray-800"
                : "border-green-200 bg-gradient-to-b from-green-25 to-white"
            }`}
          >
            <div className="space-y-3 pt-3">
              {/* Checkbox */}
              {/* <div 
              className="flex items-center space-x-3"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={selectedCustomers.has(user._id)}
                onChange={() => handleSelectCustomer(user._id)}
                className={`h-4 w-4 text-green-600 focus:ring-green-500 rounded transition-colors accent-black ${
                  isDarkMode ? 'border-gray-600 bg-gray-900' : 'border-gray-300 bg-white'
                }`}
              />
              <label className={`text-xs transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>Select for bulk actions</label>
            </div> */}

              {/* Email */}
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs mb-1 transition-colors ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Email
                  </p>
                  <p
                    className={`text-sm truncate transition-colors ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Phone */}
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
                    Phone
                  </p>
                  <p
                    className={`text-sm transition-colors ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {user.countryCode || "+977"} {user.phone}
                  </p>
                </div>
              </div>

              {/* DOB */}
              {selectedStore?.needCustomerDOB && (
                <div className="flex items-center space-x-3">
                  <Cake
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs mb-1 transition-colors ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Date of Birth
                    </p>
                    <p
                      className={`text-sm transition-colors ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {user.dob ? user.dob.split("T")[0] : "---"}
                    </p>
                  </div>
                </div>
              )}

              {/* Gender */}
              {selectedStore?.needCustomerGender && (
                <div className="flex items-center space-x-3">
                  <User
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs mb-1 transition-colors ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Gender
                    </p>
                    <p
                      className={`text-sm transition-colors ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {user.gender ? user.gender : "---"}
                    </p>
                  </div>
                </div>
              )}

              {/* Points Management */}
              <div>
                <label
                  className={`block text-xs font-medium mb-2 transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Manage Points
                </label>
                <div className="flex items-center gap-3">
                  <button
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-colors ${
                      isDarkMode
                        ? "border-gray-600 text-white hover:bg-gray-900"
                        : "border-zinc-300 text-black hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      setPointsModalData({
                        userId: user._id,
                        currentPoints: user.points,
                        store: user.store,
                      });
                      setDecreasePointsModal(true);
                    }}
                  >
                    <span className="text-sm font-medium">−</span>
                  </button>
                  {/* <input
                  type="text"
                  className={`w-16 px-2 py-1 text-center text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    isDarkMode
                      ? "bg-gray-900 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  value={user.points}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    handleChangePoints(e, user._id, user.points, user.store)
                  }
                /> */}
                  <span
                    className={`w-10 lg:w-12 px-1 lg:px-2 py-1 text-center text-xs lg:text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                      isDarkMode
                        ? "bg-gray-900 border-gray-600 text-white"
                        : "bg-gray-100 border-gray-300 text-gray-900"
                    }`}
                  >
                    {user.points}
                  </span>
                  <button
                    className="w-8 h-8 rounded-xl bg-green-500 text-white hover:bg-green-600 flex items-center justify-center transition-colors"
                    onClick={() => {
                      setPointsModalData({
                        userId: user._id,
                        currentPoints: user.points,
                        store: user.store,
                      });
                      // handleIncrease(user._id, user.points, user.store);
                      setIncreasePointsModal(true);
                    }}
                  >
                    <span className="text-sm font-medium">+</span>
                  </button>
                </div>
              </div>

              {/* Tier Selection */}
              {(selectedStore?.loyaltyCard?.format === "L34HA" ||
                selectedStore?.loyaltyCard?.format === "L3" || selectedStore?.loyaltyCard?.format === "L4") && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Tier
                  </label>
                  <select
                    name="tier"
                    value={user?.tier || ""}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleTierChange(e, user._id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white"
                  >
                    {selectedStore?.loyaltyCard?.tier &&
                      selectedStore?.loyaltyCard?.tier.map((tier) => (
                        <option value={tier.name} key={tier._id}>
                          {tier.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div
                className={`pt-3 border-t transition-colors ${
                  isDarkMode ? "border-green-700" : "border-green-200"
                }`}
              >
                <label
                  className={`block text-xs font-medium mb-2 transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Actions
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewPointsHistory(user);
                    }}
                    title="View Point History"
                    className={`flex items-center justify-center w-10 h-10 border rounded-lg transition-colors ${
                      isDarkMode
                        ? "text-gray-300 bg-gray-900 border-gray-600 hover:bg-gray-600 hover:text-white"
                        : "text-gray-600 bg-white border-gray-300 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    <Medal className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowModal(true);
                      setModelCustomerId(user._id);
                    }}
                    title="Delete Customer"
                    className="flex items-center justify-center w-10 h-10 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleIncrease = (userId, currentPoints, store) => {
    if (!originalPointsMap.has(userId)) {
      originalPointsMap.set(userId, currentPoints);
    }
    const newPoints = currentPoints + 1;

    // Set modal data and show confirmation modal
    setPointsModalData({
      type: "increase",
      userId,
      currentPoints,
      newPoints,
      store,
    });
    setShowPointsModal(true);
  };

  const handleDecrease = (userId, currentPoints, store) => {
    if (!originalPointsMap.has(userId)) {
      originalPointsMap.set(userId, currentPoints);
    }
    const newPoints = Math.max(0, currentPoints - 1);

    // Set modal data and show confirmation modal
    setPointsModalData({
      type: "decrease",
      userId,
      currentPoints,
      newPoints,
      store,
    });
    setShowPointsModal(true);
  };

  const handleIncreasePoints = async () => {
    const { userId, currentPoints, store } = pointsModalData;

    // Handle L4 format separately - call editUserPoints with billAmount
    if (store?.loyaltyCard?.format === "L4") {
      if (!billAmount || billAmount <= 0) {
        toast.error("Please enter a valid bill amount");
        return;
      }

      setLoading(true);
      try {
        const response = await api.put(
          `/store/updatePoints/${userId}`,
          {
            billAmount: Number(billAmount),
            billID: billID || "",
            remarks: remarks || "Points awarded by admin",
          },
          { headers: { token } }
        );

        if (response.data.success) {
          toast.success(response.data.message || "Points added successfully");
          // Refresh customers data
          getCustomers(storeID);
          setIncreasePointsModal(false);
          setBillID("");
          setBillAmount("");
          setRemarks("");
        } else {
          toast.error(response.data.message || "Failed to add points");
        }
      } catch (error) {
        console.error(error);
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to add points"
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    if (store?.amount) {
      let point;
      if (store.isRounded) {
        point = Math.round(
          toInteger(billAmount) / toInteger(store.conversionRate)
        );
      } else {
        point =
          Math.round((Number(billAmount) / Number(store.conversionRate)) * 10) /
          10;
      }
      setPointsModalData((prev) => ({
        ...prev,
        newPoints: currentPoints + point,
      }));
      await handlePointsConfirm(currentPoints + point);
    } else {
      setPointsModalData((prev) => ({
        ...prev,
        newPoints: currentPoints + addingPoints,
      }));
      await handlePointsConfirm(Number(currentPoints) + Number(addingPoints));
    }
  };

  const handleDecreasePoints = async () => {
    const { currentPoints } = pointsModalData;

    setPointsModalData((prev) => ({
      ...prev,
      newPoints: Number(currentPoints) - Number(subtractingPoints),
    }));
    await handlePointsConfirm(
      Number(currentPoints) - Number(subtractingPoints)
    );
  };

  const handlePointsConfirm = async (points) => {
    const { userId, newPoints, store } = pointsModalData;
    
    // Check if L5 format and outlet is required for point increases
    const isL5 = store?.loyaltyCard?.format === "L5";
    if (isL5 && (points || newPoints) > pointsModalData.currentPoints && !outletForPointsModal) {
      toast.error("Please select an outlet for L5 loyalty system");
      return;
    }
    
    setLoading(true);
    // Update UI immediately
    setCustomers((prev) =>
      prev.map((customer) =>
        customer._id === userId
          ? { ...customer, points: points || newPoints }
          : customer
      )
    );

    // Make API call
    try {
      let billIDValue = "";
      if (
        (store?.needBillID && points) ||
        newPoints > pointsModalData.currentPoints
      ) {
        billIDValue = billID;
      }

      const response = await api.put(
        `/store/updatePoints/${userId}`,
        {
          remarks,
          points: points || newPoints,
          ...(billIDValue && { billID: billIDValue }),
          outlet: isL5 ? outletForPointsModal : (store?.services?.multipleOutlets ? "Admin" : ""),
        },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Points updated!", { duration: 1500 });
        originalPointsMap.delete(userId);
        // Refresh customers data silently
        refreshCustomers();
      } else {
        toast.error("Failed to update points.");
        // Revert changes
        setCustomers((prev) =>
          prev.map((customer) =>
            customer._id === userId
              ? { ...customer, points: pointsModalData.currentPoints }
              : customer
          )
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating points.");
      // Revert changes
      setCustomers((prev) =>
        prev.map((customer) =>
          customer._id === userId
            ? { ...customer, points: pointsModalData.currentPoints }
            : customer
        )
      );
    } finally {
      setLoading(false);
    }

    setShowPointsModal(false);
    setIncreasePointsModal(false);
    setDecreasePointsModal(false);
    setBillID("");
    setBillAmount();
    setAddingPoints();
    setSubtractingPoints();
    setRemarks("");
  };

  const handlePointsCancel = () => {
    const { userId, currentPoints } = pointsModalData;

    // Revert the UI changes if user cancels
    setCustomers((prev) =>
      prev.map((customer) =>
        customer._id === userId
          ? { ...customer, points: currentPoints }
          : customer
      )
    );

    originalPointsMap.delete(userId);
    setShowPointsModal(false);
    setIncreasePointsModal(false);
    setDecreasePointsModal(false);
    setBillID("");
    setBillAmount();
    setAddingPoints();
    setSubtractingPoints();
    setRemarks("");
    setOutletForPointsModal("");
  };

  const handleChangePoints = (e, userId, currentPoints, store) => {
    const newPoints = Number(e.target.value);

    // Check if it's a valid number
    if (!isNaN(newPoints) && newPoints >= 0) {
      if (!originalPointsMap.has(userId)) {
        originalPointsMap.set(userId, currentPoints);
      }

      // Update the local state immediately for a smoother UI
      setCustomers((prev) =>
        prev.map((customer) =>
          customer._id === userId
            ? { ...customer, points: newPoints }
            : customer
        )
      );

      // Set modal data and show confirmation modal for custom points change
      setPointsModalData({
        type: "change",
        userId,
        currentPoints,
        newPoints,
        store,
      });
      setShowPointsModal(true);
    }
  };

  const handleOpenEditCustomer = (customer) => {
    setEditCustomerData({
      _id: customer._id,
      name: customer.name || "",
      email: customer.email || "",
      phone: String(customer.phone || ""),
      countryCode: customer.countryCode || "+977",
      dob: customer.dob ? customer.dob.split("T")[0] : "",
      gender: customer.gender || "",
    });
    setEditCustomerErrors({ email: "", phone: "" });
    setShowEditCustomerModal(true);
  };

  const handleEditCustomerSubmit = async (e) => {
    e.preventDefault();
    setEditCustomerLoading(true);
    try {
      const res = await api.put(
        `/store/editCustomer/${editCustomerData._id}`,
        {
          name: editCustomerData.name,
          email: editCustomerData.email,
          phone: editCustomerData.phone,
          countryCode: editCustomerData.countryCode,
          dob: editCustomerData.dob || undefined,
          gender: editCustomerData.gender || undefined,
        },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("Customer updated successfully");
        setCustomers((prev) =>
          prev.map((c) =>
            c._id === editCustomerData._id ? { ...c, ...res.data.customer } : c
          )
        );
        setShowEditCustomerModal(false);
      } else {
        toast.error(res.data.message || "Failed to update customer");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update customer");
    } finally {
      setEditCustomerLoading(false);
    }
  };

  const handleViewPointsHistory = async (customer) => {
    setSelectedCustomerForHistory(customer);
    setShowPointsHistoryModal(true);
    setIsHistoryModalVisible(true);
    setHistoryLoading(true);

    try {
      const response = await api.get(
        `/store/getPointsHistory/${customer._id}`,
        {
          headers: { token },
        }
      );
      setCustomerPointsHistory(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch points history");
      setCustomerPointsHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCloseHistoryModal = () => {
    setIsHistoryModalVisible(false);
    setTimeout(() => {
      setShowPointsHistoryModal(false);
      setSelectedCustomerForHistory(null);
      setCustomerPointsHistory([]);
    }, 300); // Wait for animation to complete
  };

  const stopCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      stream.getTracks().forEach((track) => track.stop());
    });
  };

  // Fetch stores based on user role
  const getStoresAdmin = async () => {
    try {
      const response = await api.get("/store", { headers: { token } });
      if (response.data.success) {
        setStores(response.data.stores);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message, {
        duration: 2000,
      });
    }
  };

  const getStoresClient = async () => {
    try {
      const response = await api.get("/store/myStores", { headers: { token } });
      if (response.data.success) {
        setStores(response.data.stores);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message, {
        duration: 2000,
      });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user.role === "admin") {
        await getStoresAdmin();
      } else {
        await getStoresClient();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message, {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getCustomers = useCallback(
    async (storeId) => {
      if (!storeId) return;

      setLoading(true);
      try {
        const response = await api.get(`/store/getCustomers/${storeId}`, {
          headers: { token },
        });

        if (response.data.success) {
          setCustomers(response.data.customers);
        } else {
          toast.error(response.data.message || "Failed to fetch customers");
          setCustomers([]);
        }
      } catch (error) {
        console.error(error);
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch customers",
          {
            duration: 2000,
          }
        );
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Refresh customers data without changing loading state for smooth UX
  const refreshCustomers = async () => {
    if (!storeID) return;

    try {
      const response = await api.get(`/store/getCustomers/${storeID}`, {
        headers: { token },
      });

      if (response.data.success) {
        setCustomers(response.data.customers);
      }
    } catch (error) {
      console.error("Error refreshing customers:", error);
      // Silent refresh - don't show error toast for background refresh
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchData();
    }
  }, [token, user]);

  // Trigger animation on mount for history modal
  useEffect(() => {
    if (showPointsHistoryModal) {
      setIsHistoryModalVisible(true);
    }
  }, [showPointsHistoryModal]);

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !newCustomer.store ||
      !newCustomer.name ||
      !newCustomer.email ||
      !newCustomer.phone
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      //countryCode added
      const response = await api.post(
        `/store/createCustomer/${newCustomer.store}`,
        { ...newCustomer, countryCode: selectedCountryCode },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message, {
          duration: 1000,
        });
        setIsModalOpen(false);
        setNewCustomer({
          store: "",
          name: "",
          email: "",
          phone: "",
        });
        setSelectedCountryCode("+977");
        // Refresh customers data instead of reloading the page
        if (storeID) {
          getCustomers(storeID);
          refetchHistory();
        }
      } else {
        toast.error(response.data.message, {
          duration: 2000,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create customer",
        {
          duration: 2000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAwardPoints = async (e) => {
    e.preventDefault();

    if (!qrData) {
      toast.error("Please Scan a QR Code");
      return;
    }
    if (!billAmount && !qrPoints) {
      toast.error("Please enter bill amount or points to award");
      return;
    }

    // Check if L5 format and outlet is required
    const isL5 = selectedStore?.loyaltyCard?.format === "L5";
    if (isL5 && !selectedOutlet) {
      toast.error("Please select an outlet");
      return;
    }

    try {
      let points;

      if (selectedStore?.amount) {
        if (selectedStore.isRounded) {
          points = Math.round(
            toInteger(billAmount) / toInteger(selectedStore.conversionRate)
          );
        } else {
          points =
            Math.round(
              (Number(billAmount) / Number(selectedStore.conversionRate)) * 10
            ) / 10;
        }
      } else {
        points = qrPoints;
      }

      setLoading(true);
      
      let response;
      if (isL5) {
        // Use L5 earnPoints API for L5 format stores
        response = await api.post(
          `/api/l5/points/earn`,
          {
            customerId: qrData.id,
            outletId: selectedOutlet,
            points,
            billID,
            remarks: "Points awarded by admin",
          },
          {
            headers: { token },
          }
        );
      } else {
        // Use regular awardPoints API for non-L5 stores
        response = await api.post(
          `/store/awardPoints/${qrData.id}`,
          {
            points,
            billID,
            storeId: storeID,
          },
          {
            headers: { token },
          }
        );
      }
      
      if (response.data.success) {
        toast.success(response.data.message);
        // Refresh both customers and history data
        getCustomers(storeID);
        refetchHistory();
      } else {
        toast.error(response.data.message);
      }
      setIsQrModalOpen(false);
      setQRData("");
      setQRPoints("");
      setBillAmount("");
      setBillID("");
      setSelectedOutlet("");
      // Reset form state
      setSelectedCountryCode("+977");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to award points"
      );
      console.error("Error points", error);
    } finally {
      setLoading(false);
    }
  };

  // Memoize filtered customers to prevent recalculation on every render
  const filteredCustomers = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    if (leaderboardPeriod !== "all") {
      const customerById = new Map(customers.map((c) => [String(c._id), c]));

      // Keep table order/data aligned with leaderboard order for active periods
      const periodRankedCustomers = leaderboardCustomers
        .map((entry) => customerById.get(String(entry._id)))
        .filter(Boolean);

      return periodRankedCustomers.filter((user) =>
        [user.name, user.email, user.phone].some((field) =>
          String(field || "").toLowerCase().includes(normalizedQuery)
        )
      );
    }

    return customers.filter((user) =>
      [user.name, user.email, user.phone].some((field) =>
        String(field || "").toLowerCase().includes(normalizedQuery)
      )
    );
  }, [customers, deferredQuery, leaderboardPeriod, leaderboardCustomers]);

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = useMemo(() => {
    return filteredCustomers.slice(startIndex, endIndex);
  }, [filteredCustomers, startIndex, endIndex]);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [deferredQuery]);

  const goToPage = (page) => setCurrentPage(page);
  const goToPrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const handleDeleteCustomer = async (customerID) => {
    setLoading(true);
    try {
      const response = await api.delete(
        `/store/deleteCustomer/${customerID}?storeID=${storeID}`,
        {
          headers: { token },
        }
      );
      if (response.data.success) {
        toast.success(response.data.message, {
          duration: 2000,
        });
        setShowModal(false);
        getCustomers(storeID);
      } else {
        toast.error(response.data.message, {
          duration: 2000,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message, {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Group selection functions
  const handleSelectCustomer = (customerId) => {
    const newSelected = new Set(selectedCustomers);
    if (newSelected.has(customerId)) {
      newSelected.delete(customerId);
    } else {
      newSelected.add(customerId);
    }
    setSelectedCustomers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCustomers.size === filteredCustomers.length) {
      setSelectedCustomers(new Set());
    } else {
      const allIds = new Set(filteredCustomers.map((customer) => customer._id));
      setSelectedCustomers(allIds);
    }
  };

  const handleGroupDelete = async () => {
    if (selectedCustomers.size === 0) {
      toast.error("Please select customers to delete");
      return;
    }

    setLoading(true);
    try {
      const deletePromises = Array.from(selectedCustomers).map((customerId) =>
        api.delete(`/store/deleteCustomer/${customerId}?storeID=${storeID}`, {
          headers: { token },
        })
      );

      const results = await Promise.all(deletePromises);
      const successCount = results.filter(
        (result) => result.data.success
      ).length;

      if (successCount === selectedCustomers.size) {
        toast.success(`Successfully deleted ${successCount} customer(s)`, {
          duration: 2000,
        });
      } else {
        toast.warning(
          `Deleted ${successCount} out of ${selectedCustomers.size} customers`,
          {
            duration: 2000,
          }
        );
      }

      setSelectedCustomers(new Set());
      setShowGroupDeleteModal(false);
      getCustomers(storeID);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete some customers", {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (storeId) => {
    if (!storeId || !token) {
      throw new Error("Store ID and token are required");
    }
    const response = await api.get(`/store/getPointsHistoryDash/${storeId}`, {
      headers: { token },
    });
    return response.data;
  };

  const {
    data: history,
    isLoading: isHistoryLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["pointsHistory", storeID],
    queryFn: () => fetchHistory(storeID),
    enabled: !!storeID && !!token, // Only run when we have storeID and token
    retry: 3,
    retryDelay: 1000,
  });

  const exportCustomersToCSV = () => {
    if (customers.length === 0 || !history?.points) return;

    const store = customers[0]?.store;
    const replacer = (key, value) => (value === null ? "" : value);

    // Base headers
    const headers = ["_id", "name", "email", "phone"];

    // Conditional headers
    if (store?.needCustomerDOB) headers.push("dob");
    if (store?.needCustomerGender) headers.push("gender");
    if (
      store?.loyaltyCard?.format === "L3" ||
      store?.loyaltyCard?.format === "L34HA" ||
      store?.loyaltyCard?.format === "L4"
    )
      headers.push("tier");

    // Always include these
    headers.push("points", "totalPoints", "createdAt", "updatedAt", "Bill IDs");

    const csv = [
      headers.join(","), // header row
      ...customers.map((customer) => {
        const billIDs = history.points
          .filter((entry) => entry.customer?._id === customer._id)
          .map(
            (entry) =>
              `${entry.billID === undefined ? "Manual" : entry.billID}(${
                entry.points
              })`
          )
          .join(", ");

        const rowValues = headers.map((field) => {
          if (field === "Bill IDs") return JSON.stringify(billIDs);
          return JSON.stringify(customer[field], replacer);
        });

        return rowValues.join(",");
      }),
    ].join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "customers.csv");
    link.click();
  };

  const exportTopLeaderboardToCSV = () => {
    const topCustomers = leaderboardCustomers.slice(0, 10);
    if (!storeID || topCustomers.length === 0) {
      toast.error("No leaderboard data to export");
      return;
    }

    const replacer = (key, value) => (value === null || value === undefined ? "" : value);
    const customerById = new Map(customers.map((c) => [String(c._id), c]));

    const headers = [
      "S.N.",
      "Name",
      "Email",
      "Phone",
      "Period Net",
      "Total Points",
    ];

    const csv = [
      headers.join(","),
      ...topCustomers.map((entry, index) => {
        const customer = customerById.get(String(entry._id)) || {};
        const totalPoints =
          isL5Format && l5PointsMap.has(entry._id)
            ? l5PointsMap.get(entry._id).totalPointsEarned
            : customer.totalPoints > customer.points
            ? customer.totalPoints
            : customer.points;

        const row = {
          "S.N.": index + 1,
          Name: customer.name || entry.name,
          Email: customer.email,
          Phone: `${customer.countryCode || "+977"} ${customer.phone || ""}`.trim(),
          "Period Net": entry.displayPoints ?? 0,
          "Total Points": totalPoints ?? 0,
        };

        return headers.map((field) => JSON.stringify(row[field], replacer)).join(",");
      }),
    ].join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const periodSlug = leaderboardPeriod === "all" ? "all-time" : leaderboardPeriod;
    link.setAttribute("href", url);
    link.setAttribute("download", `leaderboard-top-10-${periodSlug}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const headers = results.meta.fields;

        // Required headers
        const requiredHeaders = ["name", "email", "phone", "points"];
        const missingHeaders = requiredHeaders.filter(
          (h) => !headers.includes(h)
        );

        if (missingHeaders.length > 0) {
          alert(
            `Missing headers: ${missingHeaders.join(
              ", "
            )}. Please upload a valid CSV file.`
          );
          return;
        }

        // Send to backend
        const formData = new FormData();
        formData.append("file", file);
        formData.append("storeID", selected);

        api
          .post("/store/import", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              token: token, // Add authentication token
            },
          })
          .then((res) => {
            toast.success("CSV imported successfully!");
            getCustomers(selected);
            refetchHistory();
            // Reset file input
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          })
          .catch((err) => {
            console.error(err);
            toast.error(err.response?.data?.message || "Error uploading CSV.");
          });
      },
    });
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleTierChange = async (e, userId) => {
    const newTier = e.target.value;

    try {
      const response = await api.put(
        `/store/editUserTier/${userId}`,
        { tier: newTier }, // <-- body data
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        toast.success("Tier updated successfully!", {
          duration: 1000,
        });
        // Refresh customers data instead of reloading the page
        getCustomers(storeID);
      } else {
        toast.error(response.data.message || "Failed to update tier.");
      }
    } catch (error) {
      console.error("Error updating tier:", error);
      toast.error(error.response?.data?.message || "Failed to update tier.");
    }
  };

  useEffect(() => {
    if (!selected) return;

    localStorage.setItem("selectedValue", selected);
    if (storeID !== selected) {
      setStoreID(selected);
    }

    const store = stores.find((storeItem) => storeItem._id === selected);
    if (store) {
      localStorage.setItem("selectedStoreData", JSON.stringify(store));
      if (selectedStoreId !== store._id) {
        setSelectedStore(store);
      }
    }

    if (token && lastFetchedStoreIdRef.current !== selected) {
      lastFetchedStoreIdRef.current = selected;
      getCustomers(selected);
    }
  }, [selected, token, stores, storeID, selectedStoreId, getCustomers]);

  const toggleCamera = () => {
    setCameraFacingMode((prev) => (prev === "rear" ? "front" : "rear"));
  };

  const handleScan = (data) => {
    if (data) {
      try {
        const parsedData = JSON.parse(data.text);
        setQRData(parsedData);
      } catch (error) {
        console.error("Invalid QR Code format", error);
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  const qrScanner = useMemo(
    () => (
      <div className="flex flex-col justify-center items-center relative">
        {/* Outer Frame with Corner Lines */}
        <div className="relative w-56 h-56 flex items-center justify-center">
          <div className="absolute w-56 h-56">
            {/* Corner Lines */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>
          </div>

          {/* Scanner */}
          <div className="relative w-52 h-52 bg-black rounded-md overflow-hidden">
            <QrScanner
              onScan={handleScan}
              onError={handleError}
              constraints={{
                video: {
                  facingMode:
                    cameraFacingMode === "rear"
                      ? { exact: "environment" }
                      : "user",
                },
              }} // facingMode="user"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={toggleCamera}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            <SwitchCamera />
          </button>
        </div>
      </div>
    ),
    [cameraFacingMode]
  );

  return (
    <div
      className={`px-2 sm:px-0 md:px-4 lg:px-0 sm:ml-0 lg:ml-64 min-h-screen transition-colors ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {loading && <LoadingSpinner />}
      {/* Header Section */}
      <div
        className={`border-b shadow-sm transition-colors ${
          isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-100"
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Title and Store Selection Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            {/* Title Section */}
            <div className="flex-1">
              <h1
                className={`text-2xl font-semibold mb-1 transition-colors ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Customers
              </h1>
              {storeID && (
                <p
                  className={`text-sm transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {customers.length} customer{customers.length !== 1 ? "s" : ""}{" "}
                  found
                </p>
              )}
            </div>

            {/* Store Selection */}
            <div className="flex-shrink-0 min-w-[200px]">
              <StoreSelector
                selectedStore={selectedStore}
                onStoreChange={(store) => {
                  setStoreID(store._id);
                  setSelected(store._id);
                  setSelectedStore(store);
                  setNewCustomer((prev) => ({ ...prev, store: store._id }));
                  // Reset state when changing stores
                  setCustomers([]);
                  setLeaderboardPage(1);
                  setQuery("");
                  setSelectedCustomers(new Set());
                }}
                variant="default"
                customStores={stores}
                fetchOnMount={false}
              />
            </div>
          </div>

          {/* Search and Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search
                    className={`h-5 w-5 transition-colors ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={`block w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    isDarkMode
                      ? "bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg
                      className={`h-4 w-4 transition-colors ${
                        isDarkMode
                          ? "text-gray-500 hover:text-gray-300"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Bulk Delete Button - Only show when customers are selected */}
              {selectedCustomers.size > 0 && (
                <button
                  onClick={() => setShowGroupDeleteModal(true)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg border transition-all duration-200 text-sm ${
                    isDarkMode
                      ? "bg-red-900/20 hover:bg-red-900/30 text-red-400 border-red-800 hover:border-red-700"
                      : "bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span className="hidden sm:inline">
                    Delete ({selectedCustomers.size})
                  </span>
                  <span className="sm:hidden">
                    Del ({selectedCustomers.size})
                  </span>
                </button>
              )}

              {/* Secondary Actions Group */}
              <div className="flex items-center gap-2">
                {/* QR Scanner */}
                <button
                  title="Scan QR Code"
                  onClick={() => setIsQrModalOpen(true)}
                  className={`inline-flex items-center gap-2 px-3 py-2.5 border rounded-lg transition-all duration-200 text-sm font-medium ${
                    isDarkMode
                      ? "text-gray-300 bg-gray-900 hover:bg-gray-600 border-gray-600 hover:border-gray-500"
                      : "text-gray-700 bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                  <span className="hidden lg:inline">Scan QR</span>
                </button>

                {/* Import CSV */}
                <button
                  title="Import Customers"
                  onClick={handleClick}
                  className={`inline-flex items-center gap-2 px-3 py-2.5 border rounded-lg transition-all duration-200 text-sm font-medium ${
                    isDarkMode
                      ? "text-gray-300 bg-gray-900 hover:bg-gray-600 border-gray-600 hover:border-gray-500"
                      : "text-gray-700 bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <FileDown className="w-4 h-4" />
                  <span className="hidden lg:inline">Import</span>
                </button>

                {/* Export CSV */}
                <button
                  title="Export Customers"
                  onClick={exportCustomersToCSV}
                  className={`inline-flex items-center gap-2 px-3 py-2.5 border rounded-lg transition-all duration-200 text-sm font-medium ${
                    isDarkMode
                      ? "text-gray-300 bg-gray-900 hover:bg-gray-600 border-gray-600 hover:border-gray-500"
                      : "text-gray-700 bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <FileUp className="w-4 h-4" />
                  <span className="hidden lg:inline">Export</span>
                </button>
              </div>

              {/* Primary Action - Add Customer */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Customerss</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input for CSV import */}
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Performers Leaderboard */}
      {storeID && (customers.length > 0 || (isL5Format && l5LeaderboardData?.leaderboard?.length > 0)) && (
        <div className="mb-6 mt-6 mx-2 sm:mx-4 lg:mx-6">
          <div
            className={`rounded-lg border p-3 sm:p-4 transition-colors ${
              isDarkMode
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
              <div className="flex items-center gap-2">
                <h2
                  className={`text-sm sm:text-base font-semibold transition-colors ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {isL5Format ? "Top Customer Leaderboard" : "Top Customer Leaderboard"}
                </h2>
                {/* {isL5Format && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isDarkMode ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-700"
                  }`}>
                    Total Earned
                  </span>
                )} */}
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <LeaderboardFilterBar
                  period={leaderboardPeriod}
                  customStart={leaderboardCustomStart}
                  customEnd={leaderboardCustomEnd}
                  onPeriodChange={(p) => {
                    setLeaderboardPeriod(p);
                    setLeaderboardPage(1);
                  }}
                  onCustomDateChange={(s, e) => {
                    setLeaderboardCustomStart(s);
                    setLeaderboardCustomEnd(e);
                  }}
                  isDarkMode={isDarkMode}
                />
                <button
                  onClick={exportTopLeaderboardToCSV}
                  disabled={leaderboardCustomers.length === 0}
                  className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  title="Export top 10 leaderboard customers"
                >
                  <FileDown className="w-3 h-3" />
                  CSV
                </button>
                {periodLoading && (
                  <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Updating...
                  </span>
                )}
              </div>
            </div>


            {/* L5 Loading State */}
            {isL5Format && l5LeaderboardLoading && (
              <div className={`text-center py-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Loading leaderboard...
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
              {/* Top 4 performers for current page - only show if they are actually in top 4 globally */}
              {leaderboardCustomers
                .slice((leaderboardPage - 1) * 8, (leaderboardPage - 1) * 8 + 4)
                .map((customer, index) => {
                  const actualRank = (leaderboardPage - 1) * 8 + index + 1;

                  // Only show large cards for global top 4
                  if (actualRank <= 4) {
                    return (
                      <div
                        key={customer._id}
                        className={`rounded-lg p-3 text-left shadow-sm border transition-colors ${
                          isDarkMode
                            ? "bg-gray-900 border-gray-600"
                            : "bg-gray-100 border-gray-100"
                        } ${customer.isCoffeeHero ? (isDarkMode ? "ring-1 ring-orange-500/50" : "ring-1 ring-orange-300") : ""}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                isDarkMode
                                  ? "bg-yellow-900/30 text-yellow-400"
                                  : "bg-yellow-100 text-yellow-600"
                              }`}
                            >
                              {actualRank}
                            </span>
                            <span className="text-base">
                              {actualRank === 1
                                ? "🏆"
                                : actualRank === 2
                                ? "🥈"
                                : actualRank === 3
                                ? "🥉"
                                : "🏅"}
                            </span>
                            {customer.isCoffeeHero && (
                              <Flame className="w-4 h-4 text-orange-500" />
                            )}
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-lg font-bold flex items-center gap-1 justify-end transition-colors ${
                                isDarkMode ? "text-green-400" : "text-green-500"
                              }`}
                            >
                              {(customer.displayPoints ?? 0).toLocaleString()}
                              {isL5Format && <Star className="w-3 h-3 text-yellow-400 fill-current" />}
                            </div>
                            <div
                              className={`text-xs transition-colors ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              pts
                            </div>
                          </div>
                        </div>
                        <div
                          className={`text-xs font-medium truncate transition-colors ${
                            isDarkMode ? "text-gray-200" : "text-gray-900"
                          }`}
                          title={customer.name}
                        >
                          {customer.name}
                        </div>
                      </div>
                    );
                  } else {
                    // Use small format for ranks 5+
                    return (
                      <div
                        key={customer._id}
                        className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                          isDarkMode
                            ? "bg-gray-900 border-gray-600"
                            : "bg-gray-50 border-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span
                            className={`text-xs font-semibold flex-shrink-0 transition-colors ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            #{actualRank}
                          </span>
                          <span
                            className={`text-xs font-medium truncate transition-colors ${
                              isDarkMode ? "text-gray-200" : "text-gray-900"
                            }`}
                            title={customer.name}
                          >
                            {customer.name}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-bold flex-shrink-0 ml-2 transition-colors ${
                            isDarkMode ? "text-green-400" : "text-green-600"
                          }`}
                        >
                          {(customer.displayPoints ?? 0).toLocaleString()}
                        </span>
                      </div>
                    );
                  }
                })}

              {/* Fill remaining spots if less than 4 customers on current page - only for top 4 ranks */}
              {leaderboardCustomers.slice(
                (leaderboardPage - 1) * 8,
                (leaderboardPage - 1) * 8 + 4
              ).length < 4 &&
                leaderboardPage === 1 &&
                Array.from({
                  length:
                    4 -
                    leaderboardCustomers.slice(
                      (leaderboardPage - 1) * 8,
                      (leaderboardPage - 1) * 8 + 4
                    ).length,
                })
                  .map((_, index) => {
                    const actualRank =
                      (leaderboardPage - 1) * 8 +
                      leaderboardCustomers.slice(
                        (leaderboardPage - 1) * 8,
                        (leaderboardPage - 1) * 8 + 4
                      ).length +
                      index +
                      1;

                    if (actualRank <= 4) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className={`rounded-lg p-3 text-left border shadow-sm opacity-50 transition-colors ${
                            isDarkMode
                              ? "bg-gray-900 border-gray-700"
                              : "bg-white border-gray-100"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1">
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                  isDarkMode
                                    ? "bg-gray-900 text-gray-500"
                                    : "bg-gray-100 text-gray-400"
                                }`}
                              >
                                {actualRank}
                              </span>
                              <span className="text-base opacity-50">
                                {actualRank === 1
                                  ? "🏆"
                                  : actualRank === 2
                                  ? "🥈"
                                  : actualRank === 3
                                  ? "🥉"
                                  : "🏅"}
                              </span>
                            </div>
                            <div className="text-right">
                              <div
                                className={`text-lg font-bold transition-colors ${
                                  isDarkMode ? "text-gray-500" : "text-gray-400"
                                }`}
                              >
                                -
                              </div>
                              <div
                                className={`text-xs transition-colors ${
                                  isDarkMode ? "text-gray-500" : "text-gray-400"
                                }`}
                              >
                                pts
                              </div>
                            </div>
                          </div>
                          <div
                            className={`text-xs font-medium transition-colors ${
                              isDarkMode ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            No Customer
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })
                  .filter(Boolean)}
            </div>

            {/* Remaining performers in smaller format */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {leaderboardCustomers
                .slice((leaderboardPage - 1) * 8 + 4, leaderboardPage * 8)
                .map((customer, index) => {
                  const actualRank = (leaderboardPage - 1) * 8 + index + 5;
                  return (
                    <div
                      key={customer._id}
                      className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                        isDarkMode
                          ? "bg-gray-900 border-gray-600"
                          : "bg-gray-50 border-gray-100"
                      } ${customer.isCoffeeHero ? (isDarkMode ? "ring-1 ring-orange-500/50" : "ring-1 ring-orange-300") : ""}`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          className={`text-xs font-semibold flex-shrink-0 transition-colors ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          #{actualRank}
                        </span>
                        {customer.isCoffeeHero && (
                          <Flame className="w-3 h-3 text-orange-500 flex-shrink-0" />
                        )}
                        <span
                          className={`text-xs font-medium truncate transition-colors ${
                            isDarkMode ? "text-gray-200" : "text-gray-900"
                          }`}
                          title={customer.name}
                        >
                          {customer.name}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold flex-shrink-0 ml-2 flex items-center gap-1 transition-colors ${
                          isDarkMode ? "text-green-400" : "text-green-600"
                        }`}
                      >
                        {(customer.displayPoints ?? 0).toLocaleString()}
                        {isL5Format && <Star className="w-2.5 h-2.5 text-yellow-400 fill-current" />}
                      </span>
                    </div>
                  );
                })}

              {/* Fill remaining spots for bottom row */}
              {leaderboardCustomers.slice(
                (leaderboardPage - 1) * 8 + 4,
                leaderboardPage * 8
              ).length < 4 &&
                Array.from({
                  length:
                    4 -
                    leaderboardCustomers.slice(
                      (leaderboardPage - 1) * 8 + 4,
                      leaderboardPage * 8
                    ).length,
                }).map((_, index) => {
                  const actualRank =
                    (leaderboardPage - 1) * 8 +
                    leaderboardCustomers.slice(
                      (leaderboardPage - 1) * 8 + 4,
                      leaderboardPage * 8
                    ).length +
                    index +
                    5;
                  return (
                    <div
                      key={`empty-bottom-${index}`}
                      className={`flex items-center justify-between p-2 rounded-lg border opacity-50 transition-colors ${
                        isDarkMode
                          ? "bg-gray-900 border-gray-600"
                          : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          className={`text-xs font-semibold flex-shrink-0 transition-colors ${
                            isDarkMode ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          #{actualRank}
                        </span>
                        <span
                          className={`text-xs font-medium transition-colors ${
                            isDarkMode ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          No Customer
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold flex-shrink-0 ml-2 transition-colors ${
                          isDarkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        -
                      </span>
                    </div>
                  );
                })}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setLeaderboardPage(Math.max(1, leaderboardPage - 1))}
                disabled={leaderboardPage === 1}
                className={`p-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  isDarkMode
                    ? "border-gray-600 hover:bg-gray-900 text-gray-300"
                    : "border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span
                className={`text-xs sm:text-sm whitespace-nowrap transition-colors ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Page {leaderboardPage} of {Math.ceil(leaderboardCustomers.length / 8) || 1}
              </span>
              <button
                onClick={() =>
                  setLeaderboardPage(
                    Math.min(
                      Math.ceil(leaderboardCustomers.length / 8),
                      leaderboardPage + 1
                    )
                  )
                }
                disabled={leaderboardPage >= Math.ceil(leaderboardCustomers.length / 8)}
                className={`p-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  isDarkMode
                    ? "border-gray-600 hover:bg-gray-900 text-gray-300"
                    : "border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* L5 Qualification Note */}
            {/* {isL5Format && l5LeaderboardData && (
              <div className={`mt-3 p-2 rounded-lg text-center ${
                isDarkMode ? "bg-gray-800" : "bg-gray-50"
              }`}>
                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Minimum {l5LeaderboardData.minQualifyPoints?.toLocaleString()} points required to qualify for prizes
                </p>
                <p className={`text-xs mt-0.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                  {l5LeaderboardData.qualifiedCount} of {l5LeaderboardData.totalParticipants} participants qualified
                </p>
              </div>
            )} */}
          </div>
        </div>
      )}

      {/* Mobile/Small Screen Accordion View (visible below tablet) */}
      <div className="md:hidden mx-4 sm:mx-6">
        {/* Bulk Actions Header */}
        {selectedCustomers.size > 0 && (
          <div
            className={`mb-4 p-3 border rounded-lg transition-colors ${
              isDarkMode
                ? "bg-green-900/20 border-green-800"
                : "bg-green-50 border-green-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-sm font-medium transition-colors ${
                  isDarkMode ? "text-green-400" : "text-green-800"
                }`}
              >
                {selectedCustomers.size} customer
                {selectedCustomers.size !== 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCustomers(new Set())}
                  className={`text-xs transition-colors ${
                    isDarkMode
                      ? "text-green-400 hover:text-green-300"
                      : "text-green-600 hover:text-green-800"
                  }`}
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowGroupDeleteModal(true)}
                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {paginatedCustomers.length > 0 ? (
          <div className="space-y-2">
            {paginatedCustomers.map((user, index) => (
              <CustomerAccordionItem
                key={user._id}
                user={user}
                index={(currentPage - 1) * itemsPerPage + index}
                selectedCustomers={selectedCustomers}
                handleSelectCustomer={handleSelectCustomer}
                handleIncrease={handleIncrease}
                handleDecrease={handleDecrease}
                handleChangePoints={handleChangePoints}
                handleTierChange={handleTierChange}
                handleViewPointsHistory={handleViewPointsHistory}
                setShowModal={setShowModal}
                setModelCustomerId={setModelCustomerId}
                selectedStore={selectedStore}
                dropdownOpen={dropdownOpen}
                setDropdownOpen={setDropdownOpen}
                expandedAccordion={expandedAccordion}
                setExpandedAccordion={setExpandedAccordion}
                startIndex={0}
                isDarkMode={isDarkMode}
                displayPoints={
                  leaderboardPeriod === "all"
                    ? user.points
                    : periodPointsMap.get(String(user._id)) ?? 0
                }
              />
            ))}
          </div>
        ) : (
          <div
            className={`rounded-xl shadow-sm border p-8 transition-colors ${
              isDarkMode
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-100"
            }`}
          >
            <div className="flex flex-col items-center justify-center text-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${
                  isDarkMode ? "bg-gray-900" : "bg-gray-100"
                }`}
              >
                <UserPlus
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
                No customers found
              </p>
              <p
                className={`text-xs mt-1 transition-colors ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {query
                  ? "Try adjusting your search criteria"
                  : "Add your first customer to get started"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Table View (hidden on mobile, shown on tablet and up) */}
      <div
        className={`hidden md:block rounded-lg shadow-sm border overflow-hidden mx-2 sm:mx-4 lg:mx-6 transition-colors ${
          isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead
              className={`border-b transition-colors ${
                isDarkMode
                  ? "bg-gray-900 border-gray-600"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <tr>
                <th
                  className="px-3 lg:px-6 py-4 text-left text-xs font-medium uppercase tracking-wider w-12 transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }"
                >
                  <input
                    type="checkbox"
                    checked={
                      paginatedCustomers.length > 0 &&
                      paginatedCustomers.every((customer) =>
                        selectedCustomers.has(customer._id)
                      )
                    }
                    onChange={() => {
                      if (
                        paginatedCustomers.every((customer) =>
                          selectedCustomers.has(customer._id)
                        )
                      ) {
                        // Deselect all customers on current page
                        const newSelected = new Set(selectedCustomers);
                        paginatedCustomers.forEach((customer) =>
                          newSelected.delete(customer._id)
                        );
                        setSelectedCustomers(newSelected);
                      } else {
                        // Select all customers on current page
                        const newSelected = new Set(selectedCustomers);
                        paginatedCustomers.forEach((customer) =>
                          newSelected.add(customer._id)
                        );
                        setSelectedCustomers(newSelected);
                      }
                    }}
                    className={`h-4 w-4 text-green-600 focus:ring-green-500 rounded transition-colors accent-black ${
                      isDarkMode
                        ? "border-gray-600 bg-gray-900"
                        : "border-gray-300 bg-white "
                    }`}
                  />
                </th>
                <th
                  className={`px-3 lg:px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  S.N.
                </th>
                <th
                  className={`px-3 lg:px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="hidden xl:inline">Name</span>
                    <span className="xl:hidden">Customer</span>
                  </div>
                </th>
                <th
                  className={`px-3 lg:px-6 py-4 text-left text-xs font-medium uppercase tracking-wider hidden lg:table-cell transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Email
                  </div>
                </th>
                <th
                  className={`px-3 lg:px-6 py-4 text-left text-xs font-medium uppercase tracking-wider hidden xl:table-cell transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Phone
                  </div>
                </th>
                {selectedStore?.needCustomerDOB && (
                  <th
                    className={`px-3 lg:px-6 py-4 text-left text-xs font-medium uppercase tracking-wider hidden xl:table-cell transition-colors ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Cake className="w-4 h-4" />
                      Date of Birth
                    </div>
                  </th>
                )}
                {selectedStore?.needCustomerGender && (
                  <th
                    className={`px-3 lg:px-6 py-4 text-left text-xs font-medium uppercase tracking-wider hidden xl:table-cell transition-colors ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Gender
                    </div>
                  </th>
                )}
                <th
                  className={`px-3 lg:px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {leaderboardPeriod === "all" ? "Points" : "Period Net"}
                  </div>
                </th>
                <th
                  className={`px-3 lg:px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Total Points
                  </div>
                </th>
                {(selectedStore?.loyaltyCard?.format == "L34HA" ||
                  selectedStore?.loyaltyCard?.format === "L3" ||
                  selectedStore?.loyaltyCard?.format === "L4") && (
                  <th
                    className={`px-3 lg:px-6 py-4 text-left text-xs font-medium uppercase tracking-wider hidden lg:table-cell transition-colors ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Tier
                  </th>
                )}
                <th
                  className={`px-3 lg:px-6 py-4 text-right text-xs font-medium uppercase tracking-wider transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y transition-colors ${
                isDarkMode
                  ? "bg-gray-900 divide-gray-700"
                  : "bg-white divide-gray-200"
              }`}
            >
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((user, index) => (
                  <tr
                    key={user._id}
                    className={`transition-colors ${
                      isDarkMode ? "hover:bg-gray-900" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap w-12">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.has(user._id)}
                        onChange={() => handleSelectCustomer(user._id)}
                        className={`h-4 w-4 text-green-600 focus:ring-green-500 rounded transition-colors accent-black ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-900"
                            : "border-gray-300 bg-white"
                        }`}
                      />
                    </td>
                    <td
                      className={`px-3 lg:px-6 py-4 whitespace-nowrap text-sm transition-colors ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {startIndex + index + 1}
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="">
                          <div
                            className={`text-sm font-medium transition-colors ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {user.name}
                          </div>
                          <div
                            className={`text-sm transition-colors ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            <span className="lg:hidden">{user.email}</span>
                            <span className="hidden lg:inline">
                              Joined{" "}
                              {
                                new Date(user.createdAt)
                                  .toISOString()
                                  .split("T")[0]
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      className={`px-3 lg:px-6 py-4 whitespace-nowrap text-sm hidden lg:table-cell transition-colors ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {user.email}
                    </td>
                    <td
                      className={`px-3 lg:px-6 py-4 whitespace-nowrap text-sm hidden xl:table-cell transition-colors ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {user.countryCode || "+977"} {user.phone}
                    </td>
                    {selectedStore?.needCustomerDOB && (
                      <td
                        className={`px-3 lg:px-6 py-4 whitespace-nowrap text-sm hidden xl:table-cell transition-colors ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {user.dob ? user.dob.split("T")[0] : "---"}
                      </td>
                    )}
                    {selectedStore?.needCustomerGender && (
                      <td
                        className={`px-3 lg:px-6 py-4 whitespace-nowrap text-sm hidden xl:table-cell transition-colors ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {user.gender ? user.gender : "---"}
                      </td>
                    )}
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 lg:gap-2">
                        <button
                          className={`w-6 h-6 lg:w-8 lg:h-8 rounded-xl border flex items-center justify-center transition-colors ${
                            isDarkMode
                              ? "border-gray-600 text-white hover:bg-gray-900"
                              : "border-zinc-300 text-black hover:bg-gray-100"
                          }`}
                          onClick={() => {
                            setPointsModalData({
                              userId: user._id,
                              currentPoints: user.points,
                              store: selectedStore,
                            });
                            setDecreasePointsModal(true);
                          }}
                        >
                          <span className="text-xs lg:text-sm font-medium">
                            −
                          </span>
                        </button>
                        {/* <input
                          type="text"
                          className={`w-10 lg:w-12 px-1 lg:px-2 py-1 text-center text-xs lg:text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                            isDarkMode
                              ? "bg-gray-900 border-gray-600 text-white"
                              : "bg-gray-100 border-gray-300 text-gray-900"
                          }`}
                          value={user.points}
                          onChange={(e) =>
                            handleChangePoints(
                              e,
                              user._id,
                              user.points,
                              user.store
                            )
                          }
                        /> */}
                        <span
                          className={`w-16 lg:w-20 px-1 lg:px-2 py-1 text-center text-xs lg:text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                            isDarkMode
                              ? "bg-gray-900 border-gray-600 text-white"
                              : "bg-gray-100 border-gray-300 text-gray-900"
                          }`}
                        >
                          {(leaderboardPeriod === "all"
                            ? user.points
                            : periodPointsMap.get(String(user._id)) ?? 0
                          )?.toLocaleString()}
                        </span>
                        <button
                          className="w-6 h-6 lg:w-8 lg:h-8 rounded-xl bg-green-500 text-white hover:bg-green-600 flex items-center justify-center transition-colors"
                          onClick={() => {
                            setPointsModalData({
                              userId: user._id,
                              currentPoints: user.points,
                              store: selectedStore,
                            });
                            // handleIncrease(user._id, user.points, user.store);
                            setIncreasePointsModal(true);
                          }}
                        >
                          <span className="text-xs lg:text-sm font-medium">
                            +
                          </span>
                        </button>
                      </div>
                    </td>
                    <td
                      className={`px-3 lg:px-6 py-4 whitespace-nowrap text-sm xl:table-cell transition-colors ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {isL5Format && l5PointsMap.has(user._id)
                        ? l5PointsMap.get(user._id).totalPointsEarned?.toLocaleString()
                        : user.totalPoints > user.points
                        ? user.totalPoints?.toLocaleString()
                        : user.points?.toLocaleString()}
                      {isL5Format && <Star className="inline-block w-3 h-3 text-yellow-400 fill-current ml-1" />}
                    </td>
                    {(selectedStore?.loyaltyCard?.format == "L34HA" ||
                      selectedStore?.loyaltyCard?.format === "L3" ||
                      selectedStore?.loyaltyCard?.format === "L4") && (
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        <select
                          name="tier"
                          id="tier"
                          onChange={(e) => {
                            handleTierChange(e, user._id);
                          }}
                          value={user?.tier}
                          className={`text-xs lg:text-sm border rounded-md px-2 lg:px-3 py-1 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                            isDarkMode
                              ? "bg-gray-900 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                        >
                          {selectedStore?.loyaltyCard?.tier &&
                            selectedStore?.loyaltyCard?.tier.map((tier) => (
                              <option value={tier.name} key={tier._id}>
                                {tier.name}
                              </option>
                            ))}
                        </select>
                      </td>
                    )}
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative">
                        <button
                          className={`p-1 lg:p-2 rounded-full transition-colors ${
                            isDarkMode
                              ? "text-gray-500 hover:text-gray-300 hover:bg-gray-900"
                              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          }`}
                          onClick={() =>
                            setDropdownOpen(
                              dropdownOpen === user._id ? null : user._id
                            )
                          }
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        {dropdownOpen === user._id && (
                          <div
                            className={`absolute right-0 mt-2 w-48 border rounded-lg shadow-lg z-10 transition-colors ${
                              isDarkMode
                                ? "bg-gray-900 border-gray-700"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <button
                              onClick={() => {
                                handleViewPointsHistory(user);
                                setDropdownOpen(null);
                              }}
                              className={`w-full px-4 py-2 text-left flex items-center text-sm transition-colors ${
                                isDarkMode
                                  ? "text-gray-300 hover:bg-gray-900"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <Medal
                                className={`h-4 w-4 mr-3 transition-colors ${
                                  isDarkMode ? "text-gray-500" : "text-gray-400"
                                }`}
                              />
                              View Point History
                            </button>
                            <button
                              onClick={() => {
                                handleOpenEditCustomer(user);
                                setDropdownOpen(null);
                              }}
                              className={`w-full px-4 py-2 text-left flex items-center text-sm transition-colors ${
                                isDarkMode
                                  ? "text-gray-300 hover:bg-gray-900"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <Pencil
                                className={`h-4 w-4 mr-3 transition-colors ${
                                  isDarkMode ? "text-gray-500" : "text-gray-400"
                                }`}
                              />
                              Edit Customer
                            </button>
                            <button
                              onClick={() => {
                                setShowModal(true);
                                setModelCustomerId(user._id);
                                setDropdownOpen(null);
                              }}
                              className={`w-full px-4 py-2 text-left text-red-600 flex items-center text-sm transition-colors ${
                                isDarkMode
                                  ? "hover:bg-red-900/20"
                                  : "hover:bg-red-50"
                              }`}
                            >
                              <Trash2 className="h-4 w-4 mr-3" />
                              Delete Customer
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg
                        className={`w-12 h-12 mb-4 transition-colors ${
                          isDarkMode ? "text-gray-600" : "text-gray-400"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <p
                        className={`text-sm transition-colors ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        No customers found
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-t mx-2 sm:mx-4 lg:mx-6 rounded-b-lg transition-colors ${
            isDarkMode
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-100"
          }`}
        >
          <div
            className={`flex items-center text-sm mb-4 sm:mb-0 transition-colors ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredCustomers.length)}{" "}
              of {filteredCustomers.length} customers
            </span>
          </div>

          <div className="flex items-center justify-center space-x-1">
            <button
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className={`px-3 py-2 text-sm font-medium rounded-l-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                isDarkMode
                  ? "text-gray-300 bg-gray-900 border border-gray-600 hover:bg-gray-600"
                  : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentPage === pageNumber
                        ? "bg-green-600 text-white shadow-sm"
                        : isDarkMode
                        ? "text-gray-300 bg-gray-900 border border-gray-600 hover:bg-gray-600"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 text-sm font-medium rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                isDarkMode
                  ? "text-gray-300 bg-gray-900 border border-gray-600 hover:bg-gray-600"
                  : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal for Creating New Customer */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black transition-opacity duration-300 ease-out flex items-center justify-center sm:justify-end z-[9999] p-2 sm:p-4 bg-opacity-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className={`rounded-lg max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col transform transition-transform duration-300 ease-out translate-x-0 ${
              isDarkMode ? "bg-gray-900" : "bg-white"
            }`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Fixed */}
            <div
              className={`flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 z-10 rounded-t-lg transition-colors ${
                isDarkMode
                  ? "border-gray-700 bg-gray-900"
                  : "border-gray-200 bg-white"
              }`}
            >
              <h2
                className={`flex gap-2 items-center text-lg sm:text-xl font-semibold transition-colors ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                Add New Customer
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`transition-colors ${
                  isDarkMode
                    ? "text-gray-500 hover:text-gray-300"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div
              className="flex-1 overflow-y-auto"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <form
                onSubmit={handleSubmit}
                className="p-4 sm:p-6 space-y-4 sm:space-y-6"
              >
                {/* Basic Information */}
                <div>
                  <h3
                    className={`text-base sm:text-lg font-medium mb-3 sm:mb-4 transition-colors ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Basic Information
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Store
                      </label>
                      {selectedStore ? (
                        <div
                          className={`w-full px-3 py-2 border rounded-md transition-colors ${
                            isDarkMode
                              ? "bg-gray-800 border-gray-600 text-white"
                              : "bg-gray-50 border-gray-300 text-gray-900"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {selectedStore.name}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                isDarkMode
                                  ? "bg-green-900/20 text-green-400"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              Selected
                            </span>
                          </div>
                          {/* Hidden input to ensure the store value is submitted */}
                          <input
                            type="hidden"
                            name="store"
                            value={selectedStore._id}
                          />
                        </div>
                      ) : (
                        <StoreSelector
                          selectedStore={selectedStore}
                          onStoreChange={(store) => {
                            setSelectedStore(store);
                            setNewCustomer((prev) => ({ ...prev, store: store._id }));
                          }}
                          variant="default"
                          customStores={stores}
                          fetchOnMount={false}
                          required
                        />
                      )}
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newCustomer.name}
                        onChange={handleChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                          isDarkMode
                            ? "bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                        placeholder="Enter customer name"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3
                    className={`text-base sm:text-lg font-medium mb-3 sm:mb-4 transition-colors ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Contact Information
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={newCustomer.email}
                        onChange={handleChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                          isDarkMode
                            ? "bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Phone Number *
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          className={`w-full sm:w-48 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm transition-colors ${
                            isDarkMode
                              ? "bg-gray-900 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                          value={selectedCountryCode}
                          onChange={(e) =>
                            setSelectedCountryCode(e.target.value)
                          }
                          style={{
                            maxHeight: "200px",
                            overflowY: "auto",
                          }}
                        >
                          {countryCodes.map(({ name, code, dial_code }) => (
                            <option key={code} value={dial_code}>
                              {name} ({dial_code})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          name="phone"
                          value={newCustomer.phone}
                          onChange={handleChange}
                          required
                          className={` w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                            isDarkMode
                              ? "bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  className={`flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-t transition-colors ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className={`w-full sm:w-auto px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 order-2 sm:order-1 transition-colors ${
                      isDarkMode
                        ? "border-gray-600 text-gray-300 hover:bg-gray-900"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 order-1 sm:order-2"
                  >
                    Add Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {isQrModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-4"
          onClick={() => setIsQrModalOpen(false)}
        >
          <div
            className={`rounded-lg shadow-xl w-full max-w-md transition-colors ${
              isDarkMode ? "bg-gray-900" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`px-4 sm:px-6 py-3 sm:py-4 border-b transition-colors ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <h2
                className={`text-base sm:text-lg font-semibold transition-colors ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Scan Customer QR Code
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              {qrData ? (
                <div className="text-center">
                  <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3
                      className={`text-lg font-medium mb-2 transition-colors ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Customer Found
                    </h3>
                    <div
                      className={`space-y-1 text-sm transition-colors ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      <p>
                        <span className="font-medium">Name:</span> {qrData.name}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        {qrData.phone}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleAwardPoints} className="space-y-4">
                    {selectedStore?.amount ? (
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 transition-colors ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Bill Amount
                        </label>
                        <input
                          type="number"
                          min={0}
                          required
                          placeholder="Enter Bill Amount"
                          onChange={(e) => setBillAmount(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                            isDarkMode
                              ? "bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                          value={billAmount}
                        />
                      </div>
                    ) : (
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 transition-colors ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Points to Award
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="Enter points"
                          onChange={(e) => setQRPoints(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                            isDarkMode
                              ? "bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                          value={qrPoints}
                        />
                      </div>
                    )}

                    {selectedStore?.needBillID && (
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 transition-colors ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Bill ID
                        </label>
                        <input
                          type="text"
                          placeholder="Enter Bill ID"
                          value={billID}
                          required
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                            isDarkMode
                              ? "bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                          onChange={(e) => setBillID(e.target.value)}
                        />
                      </div>
                    )}

                    {selectedStore?.loyaltyCard?.format === "L5" && selectedStore?.outlets && (
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 transition-colors ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Outlet <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedOutlet}
                          onChange={(e) => setSelectedOutlet(e.target.value)}
                          required
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                            isDarkMode
                              ? "bg-gray-900 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                        >
                          <option value="">Select Outlet</option>
                          {selectedStore.outlets.map((outlet) => (
                            <option key={outlet._id} value={outlet._id}>
                              {outlet.name} {outlet.location ? `- ${outlet.location}` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setQRData(null);
                          setQRPoints("");
                          setBillID("");
                        }}
                        className={`flex-1 px-4 py-2 text-sm border rounded-lg transition-colors ${
                          isDarkMode
                            ? "text-gray-300 bg-gray-900 border-gray-600 hover:bg-gray-900"
                            : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Award Points
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="text-center">
                  {qrScanner}
                  <p
                    className={`mt-4 text-sm transition-colors ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Position the QR code within the frame to scan
                  </p>
                </div>
              )}
            </div>
            <div
              className={`px-6 py-4 border-t transition-colors ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                className={`w-full px-4 py-2 text-sm border rounded-lg transition-colors ${
                  isDarkMode
                    ? "text-gray-300 bg-gray-900 border-gray-600 hover:bg-gray-900"
                    : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => {
                  setQRData("");
                  setQRPoints("");
                  stopCamera();
                  setIsQrModalOpen(false);
                }}
              >
                Close Scanner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Points Update Confirmation Modal */}
      {showPointsModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99]"
          onClick={() => setShowPointsModal(false)}
        >
          <div
            className={`rounded-lg shadow-xl w-full max-w-md mx-4 transition-colors ${
              isDarkMode ? "bg-gray-900" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`px-6 py-4 border-b transition-colors ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      pointsModalData.type === "increase"
                        ? "bg-green-100"
                        : pointsModalData.type === "decrease"
                        ? "bg-orange-100"
                        : "bg-green-100"
                    }`}
                  >
                    <svg
                      className={`w-6 h-6 ${
                        pointsModalData.type === "increase"
                          ? "text-green-600"
                          : pointsModalData.type === "decrease"
                          ? "text-orange-600"
                          : "text-green-600"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {pointsModalData.type === "increase" ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      ) : pointsModalData.type === "decrease" ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M20 12H4"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      )}
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {pointsModalData.type === "increase"
                      ? "Increase Points"
                      : pointsModalData.type === "decrease"
                      ? "Decrease Points"
                      : "Update Points"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {pointsModalData.currentPoints} →{" "}
                    {pointsModalData.newPoints} points
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to{" "}
                {pointsModalData.type === "increase"
                  ? "increase"
                  : pointsModalData.type === "decrease"
                  ? "decrease"
                  : "update"}{" "}
                the points from {pointsModalData.currentPoints} to{" "}
                {pointsModalData.newPoints}?
              </p>

              {pointsModalData.store?.needBillID &&
                pointsModalData.newPoints > pointsModalData.currentPoints && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bill ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Bill ID"
                      value={billID}
                      onChange={(e) => setBillID(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                )}
              
              {pointsModalData.store?.loyaltyCard?.format === "L5" &&
                pointsModalData.newPoints > pointsModalData.currentPoints &&
                pointsModalData.store?.outlets && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Outlet <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={outletForPointsModal}
                      onChange={(e) => setOutletForPointsModal(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select Outlet</option>
                      {pointsModalData.store.outlets.map((outlet) => (
                        <option key={outlet._id} value={outlet._id}>
                          {outlet.name} {outlet.location ? `- ${outlet.location}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handlePointsCancel}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePointsConfirm}
                disabled={
                  (pointsModalData.store?.needBillID &&
                    pointsModalData.newPoints > pointsModalData.currentPoints &&
                    !billID) ||
                  (pointsModalData.store?.loyaltyCard?.format === "L5" &&
                    pointsModalData.newPoints > pointsModalData.currentPoints &&
                    !outletForPointsModal)
                }
                className={`px-4 py-2 text-sm text-white rounded-lg transition-colors ${
                  pointsModalData.type === "increase"
                    ? "bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                    : pointsModalData.type === "decrease"
                    ? "bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400"
                    : "bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                }`}
              >
                {pointsModalData.type === "increase"
                  ? "Increase Points"
                  : pointsModalData.type === "decrease"
                  ? "Decrease Points"
                  : "Update Points"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className={`rounded-lg shadow-xl w-full max-w-md mx-4 transition-colors ${
              isDarkMode ? "bg-gray-900" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`px-4 sm:px-6 py-3 sm:py-4 border-b transition-colors ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3
                    className={`text-lg font-medium transition-colors ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Delete Customer
                  </h3>
                  <p
                    className={`text-sm transition-colors ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <p
                className={`text-sm transition-colors ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Are you sure you want to delete this customer? This will
                permanently remove all their data including points history and
                cannot be undone.
              </p>
            </div>
            <div
              className={`px-4 sm:px-6 py-3 sm:py-4 border-t flex flex-col sm:flex-row justify-end gap-3 transition-colors ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                onClick={() => setShowModal(false)}
                className={`w-full sm:w-auto px-4 py-2 text-sm border rounded-lg transition-colors order-2 sm:order-1 ${
                  isDarkMode
                    ? "text-gray-300 bg-gray-900 border-gray-600 hover:bg-gray-900"
                    : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCustomer(modelCustomerId)}
                className="w-full sm:w-auto px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors order-1 sm:order-2"
              >
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditCustomerModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-4"
          onClick={() => setShowEditCustomerModal(false)}
        >
          <div
            className={`rounded-lg max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col transition-colors ${
              isDarkMode ? "bg-gray-900" : "bg-white"
            }`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className={`flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 z-10 rounded-t-lg transition-colors ${
                isDarkMode
                  ? "border-gray-700 bg-gray-900"
                  : "border-gray-200 bg-white"
              }`}
            >
              <h2
                className={`flex gap-2 items-center text-lg sm:text-xl font-semibold transition-colors ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <Pencil className="w-5 h-5 sm:w-6 sm:h-6" />
                Edit Customer
              </h2>
              <button
                onClick={() => setShowEditCustomerModal(false)}
                className={`transition-colors ${
                  isDarkMode
                    ? "text-gray-500 hover:text-gray-300"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div
              className="flex-1 overflow-y-auto"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <form
                onSubmit={handleEditCustomerSubmit}
                className="p-4 sm:p-6 space-y-4 sm:space-y-6"
              >
                {/* Basic Information */}
                <div>
                  <h3
                    className={`text-base sm:text-lg font-medium mb-3 sm:mb-4 transition-colors ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Basic Information
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        value={editCustomerData.name}
                        onChange={(e) =>
                          setEditCustomerData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                          isDarkMode
                            ? "bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                        placeholder="Enter customer name"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3
                    className={`text-base sm:text-lg font-medium mb-3 sm:mb-4 transition-colors ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Contact Information
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={editCustomerData.email}
                        onChange={(e) => {
                          const val = e.target.value;
                          const duplicate = customers.find(
                            (c) =>
                              c._id !== editCustomerData._id &&
                              c.email?.toLowerCase() === val.toLowerCase()
                          );
                          setEditCustomerErrors((prev) => ({
                            ...prev,
                            email: duplicate
                              ? "This email is already linked to another customer"
                              : "",
                          }));
                          setEditCustomerData((prev) => ({
                            ...prev,
                            email: val,
                          }));
                        }}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${
                          editCustomerErrors.email
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "focus:ring-green-500 focus:border-green-500 " +
                              (isDarkMode
                                ? "border-gray-600"
                                : "border-gray-300")
                        } ${
                          isDarkMode
                            ? "bg-gray-900 text-white placeholder-gray-400"
                            : "bg-white text-gray-900"
                        }`}
                        placeholder="Enter email address"
                      />
                      {editCustomerErrors.email && (
                        <p className="mt-1 text-xs text-red-500">
                          {editCustomerErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Phone Number *
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          className={`w-full sm:w-48 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm transition-colors ${
                            isDarkMode
                              ? "bg-gray-900 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                          value={editCustomerData.countryCode}
                          onChange={(e) =>
                            setEditCustomerData((prev) => ({
                              ...prev,
                              countryCode: e.target.value,
                            }))
                          }
                        >
                          {countryCodes.map(({ name, code, dial_code }) => (
                            <option key={code} value={dial_code}>
                              {name} ({dial_code})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={editCustomerData.phone}
                          onChange={(e) => {
                            const val = e.target.value;
                            const duplicate = customers.find(
                              (c) =>
                                c._id !== editCustomerData._id &&
                                String(c.phone) === String(val)
                            );
                            setEditCustomerErrors((prev) => ({
                              ...prev,
                              phone: duplicate
                                ? "This phone number is already linked to another customer"
                                : "",
                            }));
                            setEditCustomerData((prev) => ({
                              ...prev,
                              phone: val,
                            }));
                          }}
                          required
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${
                            editCustomerErrors.phone
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                              : "focus:ring-green-500 focus:border-green-500 " +
                                (isDarkMode
                                  ? "border-gray-600"
                                  : "border-gray-300")
                          } ${
                            isDarkMode
                              ? "bg-gray-900 text-white placeholder-gray-400"
                              : "bg-white text-gray-900"
                          }`}
                          placeholder="Enter phone number"
                        />
                      </div>
                      {editCustomerErrors.phone && (
                        <p className="mt-1 text-xs text-red-500">
                          {editCustomerErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                {(selectedStore?.needCustomerDOB ||
                  selectedStore?.needCustomerGender) && (
                  <div>
                    <h3
                      className={`text-base sm:text-lg font-medium mb-3 sm:mb-4 transition-colors ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Additional Information
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      {selectedStore?.needCustomerDOB && (
                        <div>
                          <label
                            className={`block text-sm font-medium mb-2 transition-colors ${
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            value={editCustomerData.dob}
                            onChange={(e) =>
                              setEditCustomerData((prev) => ({
                                ...prev,
                                dob: e.target.value,
                              }))
                            }
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                              isDarkMode
                                ? "bg-gray-900 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                          />
                        </div>
                      )}
                      {selectedStore?.needCustomerGender && (
                        <div>
                          <label
                            className={`block text-sm font-medium mb-2 transition-colors ${
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            Gender
                          </label>
                          <select
                            value={editCustomerData.gender}
                            onChange={(e) =>
                              setEditCustomerData((prev) => ({
                                ...prev,
                                gender: e.target.value,
                              }))
                            }
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                              isDarkMode
                                ? "bg-gray-900 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                          >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div
                  className={`flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-t transition-colors ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setShowEditCustomerModal(false)}
                    className={`w-full sm:w-auto px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 order-2 sm:order-1 transition-colors ${
                      isDarkMode
                        ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      editCustomerLoading ||
                      !!editCustomerErrors.email ||
                      !!editCustomerErrors.phone
                    }
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 order-1 sm:order-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {editCustomerLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Points History Modal */}
      {showPointsHistoryModal && selectedCustomerForHistory && (
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 ease-out flex items-center justify-center sm:justify-end z-[9999] p-2 sm:p-4 ${
            isHistoryModalVisible ? "bg-opacity-50" : "bg-opacity-0"
          }`}
          onClick={handleCloseHistoryModal}
        >
          <div
            className={`rounded-lg max-w-3xl w-full max-h-[75vh] sm:max-h-[90vh] flex flex-col transform transition-transform duration-300 ease-out ${
              isHistoryModalVisible ? "translate-x-0" : "translate-x-full"
            } ${isDarkMode ? "bg-gray-900" : "bg-white"}`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Fixed */}
            <div
              className={`flex items-center justify-between p-6 border-b sticky top-0 z-10 rounded-t-lg transition-colors ${
                isDarkMode
                  ? "border-gray-700 bg-gray-900"
                  : "border-gray-200 bg-white"
              }`}
            >
              <h2
                className={`flex gap-2 items-center text-xl font-semibold transition-colors ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Points History
              </h2>
              <button
                onClick={handleCloseHistoryModal}
                className={`transition-colors ${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-300"
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
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div
              className="flex-1 overflow-y-auto p-6 space-y-6"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {/* Customer Information */}
              <div>
                <h3
                  className={`flex gap-2 items-center text-lg font-medium mb-4 transition-colors ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 transition-colors ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={selectedCustomerForHistory.name}
                      disabled
                      className={`w-full px-3 py-2 border rounded-md cursor-not-allowed transition-colors ${
                        isDarkMode
                          ? "border-gray-600 bg-gray-900 text-gray-400"
                          : "border-gray-300 bg-gray-100 text-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 transition-colors ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={selectedCustomerForHistory.email}
                      disabled
                      className={`w-full px-3 py-2 border rounded-md cursor-not-allowed transition-colors ${
                        isDarkMode
                          ? "border-gray-600 bg-gray-900 text-gray-400"
                          : "border-gray-300 bg-gray-100 text-gray-500"
                      }`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 transition-colors ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={`${
                        selectedCustomerForHistory.countryCode || "+977"
                      } ${selectedCustomerForHistory.phone}`}
                      disabled
                      className={`w-full px-3 py-2 border rounded-md cursor-not-allowed transition-colors ${
                        isDarkMode
                          ? "border-gray-600 bg-gray-900 text-gray-400"
                          : "border-gray-300 bg-gray-100 text-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 transition-colors ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Current Points
                    </label>
                    <input
                      type="text"
                      value={selectedCustomerForHistory.points}
                      disabled
                      className={`w-full px-3 py-2 border rounded-md cursor-not-allowed font-medium text-green-600 transition-colors ${
                        isDarkMode
                          ? "border-gray-600 bg-gray-900"
                          : "border-gray-300 bg-gray-100"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div>
                <h3
                  className={`flex gap-2 items-center text-lg font-medium mb-4 transition-colors ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Transaction History ({customerPointsHistory?.length || 0}{" "}
                  transactions)
                </h3>

                {historyLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                      <span
                        className={`transition-colors ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Loading history...
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div
                      className={`hidden lg:block border  rounded-lg overflow-hidden ${
                        isDarkMode ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead
                            className={`border-b transition-colors ${
                              isDarkMode
                                ? "bg-gray-800 border-gray-700"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <tr>
                              <th
                                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                S.N.
                              </th>
                              <th
                                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                Date & Time
                              </th>
                              <th
                                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                Bill ID
                              </th>
                              <th
                                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                Points Earned
                              </th>
                              {selectedCustomerForHistory?.store?.services
                                ?.multipleOutlets && (
                                <th
                                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                                    isDarkMode
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                  }`}
                                >
                                  Outlet
                                </th>
                              )}
                              <th
                                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                Remarks
                              </th>
                            </tr>
                          </thead>
                          <tbody
                            className={`transition-colors divide-y ${
                              isDarkMode
                                ? "bg-gray-900 divide-gray-700"
                                : "bg-white divide-gray-200"
                            }`}
                          >
                            {customerPointsHistory &&
                            customerPointsHistory.length > 0 ? (
                              customerPointsHistory.map((his, index) => (
                                <tr
                                  key={his._id}
                                  className={`transition-colors ${
                                    isDarkMode
                                      ? "hover:bg-gray-800"
                                      : "hover:bg-gray-50"
                                  }`}
                                >
                                  <td
                                    className={`px-4 py-3 whitespace-nowrap text-sm transition-colors ${
                                      isDarkMode
                                        ? "text-gray-200"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {index + 1}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div
                                      className={`text-sm transition-colors ${
                                        isDarkMode
                                          ? "text-gray-200"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {
                                        new Date(his.createdAt)
                                          .toISOString()
                                          .split("T")[0]
                                      }
                                    </div>
                                    <div
                                      className={`text-sm transition-colors ${
                                        isDarkMode
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {new Date(
                                        his.createdAt
                                      ).toLocaleTimeString("en-US", {
                                        hour12: true,
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    {his.billID ? (
                                      <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                          isDarkMode
                                            ? "bg-green-900 text-green-300"
                                            : "bg-green-100 text-green-800"
                                        }`}
                                      >
                                        {his.billID}
                                      </span>
                                    ) : (
                                      <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                          isDarkMode
                                            ? "bg-gray-900 text-gray-300"
                                            : "bg-gray-100 text-gray-800"
                                        }`}
                                      >
                                        Manual
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                        his.points < 0
                                          ? isDarkMode
                                            ? "bg-red-900 text-red-300"
                                            : "bg-red-100 text-red-800"
                                          : isDarkMode
                                          ? "bg-green-900 text-green-300"
                                          : "bg-green-100 text-green-800"
                                      }`}
                                    >
                                      {his.points > 0
                                        ? `+${his.points}`
                                        : his.points}
                                    </span>
                                  </td>
                                  {selectedCustomerForHistory?.store?.services
                                    ?.multipleOutlets && (
                                    <td
                                      className={`px-4 py-3 whitespace-nowrap text-sm transition-colors ${
                                        isDarkMode
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {his?.outlet || "Main"}
                                    </td>
                                  )}
                                  <td
                                    className={`px-4 py-3 whitespace-nowrap text-sm transition-colors ${
                                      isDarkMode
                                        ? "text-gray-200"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {his.remarks || "-"}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={
                                    selectedCustomerForHistory?.store?.services
                                      ?.multipleOutlets
                                      ? 5
                                      : 4
                                  }
                                  className="px-4 py-12 text-center"
                                >
                                  <div className="flex flex-col items-center">
                                    <svg
                                      className={`w-12 h-12 mb-4 transition-colors ${
                                        isDarkMode
                                          ? "text-gray-600"
                                          : "text-gray-400"
                                      }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h5.586a1 1 0 00.707-.293l5.414-5.414a1 1 0 00.293-.707V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                      />
                                    </svg>
                                    <p
                                      className={`text-sm transition-colors ${
                                        isDarkMode
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      No transaction history found
                                    </p>
                                    <p
                                      className={`text-xs mt-1 transition-colors ${
                                        isDarkMode
                                          ? "text-gray-500"
                                          : "text-gray-400"
                                      }`}
                                    >
                                      Points transactions will appear here
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden">
                      {customerPointsHistory &&
                      customerPointsHistory.length > 0 ? (
                        <div className="space-y-3">
                          {customerPointsHistory.map((his, index) => (
                            <div
                              key={his._id}
                              className={`border rounded-lg p-4 shadow-sm transition-colors ${
                                isDarkMode
                                  ? "bg-gray-900 border-gray-600"
                                  : "bg-white border-gray-200"
                              }`}
                            >
                              {/* Transaction Header */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-colors ${
                                      isDarkMode
                                        ? "bg-gray-600 text-gray-300"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {index + 1}
                                  </span>
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                      his.points < 0
                                        ? "bg-red-800 text-red-300"
                                        : "bg-green-800 text-green-300"
                                    }`}
                                  >
                                    {his.points > 0
                                      ? `+${his.points}`
                                      : his.points}{" "}
                                    pts
                                  </span>
                                </div>
                                {his.billID ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-800 text-green-300">
                                    {his.billID}
                                  </span>
                                ) : (
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      isDarkMode
                                        ? "bg-gray-600 text-gray-300"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    Manual
                                  </span>
                                )}
                              </div>

                              {/* Transaction Details */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-xs font-medium uppercase tracking-wider transition-colors ${
                                      isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    Date & Time
                                  </span>
                                  <div className="text-right">
                                    <div
                                      className={`text-sm transition-colors ${
                                        isDarkMode
                                          ? "text-gray-300"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {new Date(
                                        his.createdAt
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </div>
                                    <div
                                      className={`text-xs transition-colors ${
                                        isDarkMode
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {new Date(
                                        his.createdAt
                                      ).toLocaleTimeString("en-US", {
                                        hour12: true,
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </div>
                                  </div>
                                </div>

                                {selectedCustomerForHistory?.store?.services
                                  ?.multipleOutlets && (
                                  <div className="flex items-center justify-between">
                                    <span
                                      className={`text-xs font-medium uppercase tracking-wider transition-colors ${
                                        isDarkMode
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      Outlet
                                    </span>
                                    <span
                                      className={`text-sm transition-colors ${
                                        isDarkMode
                                          ? "text-gray-300"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {his?.outlet || "Main"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          className={`border rounded-lg p-8 transition-colors ${
                            isDarkMode
                              ? "bg-gray-900 border-gray-600"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="flex flex-col items-center text-center">
                            <svg
                              className={`w-12 h-12 mb-4 transition-colors ${
                                isDarkMode ? "text-gray-500" : "text-gray-400"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h5.586a1 1 0 00.707-.293l5.414-5.414a1 1 0 00.293-.707V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                            <p
                              className={`text-sm transition-colors ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              No transaction history found
                            </p>
                            <p
                              className={`text-xs mt-1 transition-colors ${
                                isDarkMode ? "text-gray-500" : "text-gray-400"
                              }`}
                            >
                              Points transactions will appear here
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className={`flex justify-end space-x-3 p-6 border-t transition-colors ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                type="button"
                onClick={handleCloseHistoryModal}
                className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors ${
                  isDarkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-900"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Delete Confirmation Modal */}
      {showGroupDeleteModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99]"
          onClick={() => setShowGroupDeleteModal(false)}
        >
          <div
            className={`rounded-lg shadow-xl w-full max-w-md mx-4 transition-colors ${
              isDarkMode ? "bg-gray-900" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`px-6 py-4 border-b transition-colors ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3
                    className={`text-lg font-medium transition-colors ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Delete Selected Customers
                  </h3>
                  <p
                    className={`text-sm transition-colors ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4">
              <p
                className={`text-sm transition-colors ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Are you sure you want to delete {selectedCustomers.size}{" "}
                selected customer{selectedCustomers.size > 1 ? "s" : ""}? This
                will permanently remove all their data including points history
                and cannot be undone.
              </p>
            </div>
            <div
              className={`px-6 py-4 border-t flex justify-end gap-3 transition-colors ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                onClick={() => setShowGroupDeleteModal(false)}
                className={`px-4 py-2 text-sm border rounded-lg transition-colors ${
                  isDarkMode
                    ? "text-gray-300 bg-gray-900 border-gray-600 hover:bg-gray-900"
                    : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleGroupDelete}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete {selectedCustomers.size} Customer
                {selectedCustomers.size > 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Points Increase Confirmation Modal */}
      {increasePointsModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90]"
          onClick={() => setIncreasePointsModal(false)}
        >
          <div
            className={`rounded-lg shadow-xl w-full max-w-md mx-4 transition-colors ${
              isDarkMode ? "bg-gray-900" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`px-6 py-4 border-b transition-colors ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3
                    className={`text-lg font-medium  ${
                      isDarkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    {" "}
                    Increase Points
                  </h3>
                </div>
              </div>
            </div>
            <div className="p-6">
              {pointsModalData.store?.needBillID && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bill ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Bill ID"
                    value={billID}
                    onChange={(e) => setBillID(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              )}
              {/* L4 Format - Always show billAmount */}
              {pointsModalData.store?.loyaltyCard?.format === "L4" ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bill Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Enter Bill Amount"
                    value={billAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers and decimal point
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setBillAmount(value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Points will be calculated automatically based on your L4 tier settings
                  </p>
                </div>
              ) : pointsModalData.store?.amount ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bill Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Enter Bill Amount"
                    value={billAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers and decimal point
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setBillAmount(value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Points to Increase"
                    value={addingPoints}
                    onChange={(e) => setAddingPoints(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              )}
              
              {pointsModalData.store?.loyaltyCard?.format === "L5" &&
                pointsModalData.store?.outlets && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Outlet <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={outletForPointsModal}
                      onChange={(e) => setOutletForPointsModal(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select Outlet</option>
                      {pointsModalData.store.outlets.map((outlet) => (
                        <option key={outlet._id} value={outlet._id}>
                          {outlet.name} {outlet.location ? `- ${outlet.location}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handlePointsCancel}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleIncreasePoints}
                disabled={
                  (pointsModalData.store?.needBillID && !billID) ||
                  (pointsModalData.store?.loyaltyCard?.format === "L4" && !billAmount) ||
                  (pointsModalData.store?.amount && pointsModalData.store?.loyaltyCard?.format !== "L4" && !billAmount) ||
                  (!pointsModalData.store?.amount && pointsModalData.store?.loyaltyCard?.format !== "L4" && !addingPoints) ||
                  (pointsModalData.store?.loyaltyCard?.format === "L5" && !outletForPointsModal) ||
                  loading
                }
                className="px-4 py-2 text-sm text-white rounded-lg transition-colors bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
              >
                {"Increase Points"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Points Decrease Confirmation Modal */}
      {decreasePointsModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90]"
          onClick={() => setDecreasePointsModal(false)}
        >
          <div
            className={`rounded-lg shadow-xl w-full max-w-md mx-4 transition-colors ${
              isDarkMode ? "bg-gray-900" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`px-6 py-4 border-b transition-colors ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-100">
                    <svg
                      className="w-6 h-6text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 12H4"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3
                    className={`text-lg font-medium  ${
                      isDarkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Reduce Points
                  </h3>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Points to Reduce<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Points to Decrease"
                  value={subtractingPoints}
                  onChange={(e) => setSubtractingPoints(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Give reason for points reduction"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handlePointsCancel}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDecreasePoints}
                disabled={!subtractingPoints || loading || !remarks}
                className="px-4 py-2 text-sm text-white rounded-lg transition-colors bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
              >
                {"Decrease Points"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
