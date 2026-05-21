import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/config";
import { toast } from "sonner";
import {
  Loader2,
  CalendarCheck,
  Search,
  FileUp,
  User,
  UserPlus,
  Settings,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import ReservationSetting from "./ReservationSetting";
import Select from "react-select";
import StoreSelector from "../components/common/StoreSelector";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

// Extend dayjs with the required plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const Reservation = () => {
  const { authState } = useAuth();
  const { isDarkMode } = useTheme();
  const { userInfo: user, token } = authState;
  const [query, setQuery] = useState("");
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState(
    localStorage.getItem("selectedStoreData")
      ? JSON.parse(localStorage.getItem("selectedStoreData"))
      : {}
  );
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(
    localStorage.getItem("selectedValue") || ""
  );
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showReservationSettingsModal, setShowReservationSettingsModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Fetch stores
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res =
          user.role === "admin"
            ? await api.get("/store", { headers: { token } })
            : await api.get("/store/myStores", { headers: { token } });

        if (res.data.success) {
          setStores(res.data.stores);
        }
      } catch (err) {
        toast.error("Failed to fetch stores.");
      }
    };

    fetchStores();
  }, [token, user.role]);

  // Update selectedStore when stores are loaded and selectedStoreId exists
  useEffect(() => {
    if (stores.length > 0 && selectedStoreId) {
      const store = stores.find((s) => s._id === selectedStoreId);
      if (store) {
        setSelectedStore(store);
        localStorage.setItem("selectedStoreData", JSON.stringify(store));
      }
    }
  }, [stores, selectedStoreId]);

  // Fetch reservations using react-query
  const {
    data: reservationsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["reservations", selectedStoreId],
    queryFn: async () => {
      const res = await api.get(`/store/reservation/${selectedStoreId}`, {
        headers: { token },
      });

      return res.data.reservations;
    },
    enabled: !!selectedStoreId, // only run when store selected
  });

  const handleStoreChange = (e) => {
    const value = e.target.value;
    setSelectedStoreId(value);
    localStorage.setItem("selectedValue", value);
    setSelectedStore(stores.find((store) => store._id === e.target.value));
    localStorage.setItem(
      "selectedStoreData",
      JSON.stringify(stores.find((store) => store._id === e.target.value))
    );
  };

  // Modal animation effects
  useEffect(() => {
    if (showReservationModal) {
      setIsModalVisible(true);
    }
  }, [showReservationModal]);

  // Handle modal close with animation
  const handleModalClose = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setShowReservationModal(false);
    }, 300); // Wait for animation to complete
  };

  const confirmMutation = useMutation({
    mutationFn: async (reservationId) => {
      setLoading(true);
      const res = await api.put(
        `/store/reservation/confirm/${reservationId}`,
        {},
        {
          headers: { token },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      setLoading(false);
      toast.success("Reservation confirmed!");
      queryClient.invalidateQueries(["reservations"]);
    },
    onError: (e) => {
      setLoading(false);
      toast.error("Failed to confirm reservation.");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (reservationId) => {
      setLoading(true);
      const res = await api.put(
        `/store/reservation/cancel/${reservationId}`,
        {},
        {
          headers: { token },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      setLoading(false);
      toast.success("Reservation cancelled!");
      queryClient.invalidateQueries(["reservations"]);
    },
    onError: () => {
      setLoading(false);
      toast.error("Failed to cancel reservation.");
    },
  });

  const noShowMutation = useMutation({
    mutationFn: async (reservationId) => {
      setLoading(true);
      const res = await api.put(
        `/store/reservation/noShow/${reservationId}`,
        {},
        {
          headers: { token },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      setLoading(false);
      toast.success("Customer Not Shown!");
      queryClient.invalidateQueries(["reservations"]);
    },
    onError: () => {
      setLoading(false);
      toast.error("Failed to change reservation status.");
    },
  });

  const completedMutation = useMutation({
    mutationFn: async (reservationId) => {
      setLoading(true);
      const res = await api.put(
        `/store/reservation/completed/${reservationId}`,
        {},
        {
          headers: { token },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      setLoading(false);
      toast.success("Reservation Completed!");
      queryClient.invalidateQueries(["reservations"]);
    },
    onError: () => {
      setLoading(false);
      toast.error("Failed to change reservation status.");
    },
  });

  const confirmReservation = (id) => {
    confirmMutation.mutate(id);
  };

  const cancelReservation = (id) => {
    cancelMutation.mutate(id);
  };

  const noShow = (id) => {
    noShowMutation.mutate(id);
  };

  const completed = (id) => {
    completedMutation.mutate(id);
  };

  const { data: reservationSetting } = useQuery({
    queryKey: ["reservationSettings", selectedStore?._id],
    queryFn: async () => {
      const res = await api.get(
        `/store/reservation-settings?store=${selectedStore?._id}`,
        { headers: { token } }
      );
      return res.data;
    },
    enabled: !!selectedStore?._id,
  });

  const { data: customers } = useQuery({
    queryKey: ["customers", selectedStoreId],
    queryFn: async () => {
      const res = await api.get(`/store/getCustomers/${selectedStoreId}`, {
        headers: { token },
      });
      return res.data.customers;
    },
    enabled: !!selectedStoreId, // only run when store selected
  });

  const serviceOptions =
    reservationSetting?.services?.map((service) => ({
      value: service.name,
      label: service.name,
    })) || [];

  const customerOptions = customers?.map((customer) => ({
    value: customer._id,
    label: customer.name,
    email: customer.email,
    phone: customer.phone,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Example API call
      const response = await api.post(
        `/store/manualReservation/${selectedStore.url}`,
        formData
      );
      if (response.data.success) {
        toast.success("Reservation added!");
        setShowReservationModal(false);
        setFormData({}); // clear form
        queryClient.invalidateQueries("reservations"); // refresh list
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentFilter, setCurrentFilter] = useState("All Time");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  // State for mobile accordion
  const [expandedReservation, setExpandedReservation] = useState(null);

  const toggleReservation = (index) => {
    setExpandedReservation(expandedReservation === index ? null : index);
  };

  const currentDate = dayjs().format("YYYY-MM-DD");

  // Initialize dates to show all time on component mount
  useEffect(() => {
    if (selectedStore?.createdAt) {
      const storeCreationDate = dayjs(selectedStore.createdAt).format(
        "YYYY-MM-DD"
      );
      setStartDate(storeCreationDate);
      // Set end date far into the future to include all reservations
      setEndDate(dayjs().add(10, "year").format("YYYY-MM-DD"));
    }
  }, [selectedStore]);

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
    // if (selectedEndDate > currentDate) {
    //   toast.error("End date cannot be in the future.", { duration: 2000 });
    // } else if (selectedEndDate < startDate) {
    //   toast.error("End date cannot be earlier than the start date.", {
    //     duration: 2000,
    //   });
    // } else {
    // }
    setEndDate(selectedEndDate);
  };

  const handleFilterChange = (filterType) => {
    if (filterType === "daterange") {
      setIsDateModalOpen(true);
      return;
    }

    if (filterType === "lastmonth") {
      setStartDate(dayjs().subtract(1, "month").format("YYYY-MM-DD"));
      setEndDate(dayjs().add(10, "year").format("YYYY-MM-DD"));
    } else if (filterType === "alltime") {
      if (selectedStore?.createdAt) {
        const storeCreationDate = dayjs(selectedStore.createdAt).format(
          "YYYY-MM-DD"
        );
        setStartDate(storeCreationDate);
        setEndDate(dayjs().add(10, "year").format("YYYY-MM-DD"));
      }
    } else if (filterType === "thisweek") {
      setStartDate(dayjs().subtract(7, "days").format("YYYY-MM-DD"));
      setEndDate(dayjs().add(10, "year").format("YYYY-MM-DD"));
    } else if (filterType === "today") {
      setStartDate(dayjs().format("YYYY-MM-DD"));
      setEndDate(dayjs().add(10, "year").format("YYYY-MM-DD"));
    }
  };

  const handleDateRangeApply = () => {
    if (tempStartDate && tempEndDate) {
      setStartDate(tempStartDate);
      setEndDate(tempEndDate);
      setCurrentFilter("Date Range");
      setIsDateModalOpen(false);
      setTempStartDate("");
      setTempEndDate("");
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

  const filteredReservation = reservationsData?.filter((reservation) => {
    const matchesText = [
      reservation?.customer?.name,
      reservation?.customer?.phone,
    ].some((field) =>
      String(field || "")
        .toLowerCase()
        .includes(query.toLowerCase())
    );

    // Check if the reservation date is within the selected date range
    const isWithinDateRange =
      dayjs(reservation.date).isSameOrAfter(dayjs(startDate)) &&
      dayjs(reservation.date).isSameOrBefore(dayjs(endDate));

    return matchesText && isWithinDateRange;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredReservation?.length / itemsPerPage) || 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReservations =
    filteredReservation?.slice(startIndex, endIndex) || [];

  const exportToCSV = () => {
    if (filteredReservation.length === 0 || !selectedStore) return;

    const replacer = (key, value) =>
      value === null || value === undefined ? "" : value;

    // Dynamically build headers based on selectedStore
    const headers = [
      "Customer Name",
      "Customer Phone Number",
      "Services",
      ...(selectedStore.type === "food"
        ? ["Table Number", "Number of Guest"]
        : ["Number of Guests"]),
      ...(selectedStore.services?.multipleOutlets ? ["Outlet"] : []),
      "Date",
      "Time",
      "Note",
      "Created At",
      "Updated At",
    ];

    // Format each row of data
    const rows = filteredReservation.map((reservation) => {
      const baseData = [
        replacer("name", reservation.name),
        replacer("phone", reservation.phone),
        Array.isArray(reservation.services)
          ? reservation.services.join(" | ")
          : "",
      ];

      const foodData =
        selectedStore.type === "food"
          ? [reservation.tableNumber || "", reservation.numberofGuests || ""]
          : [reservation.numberofGuests || ""];

      const outletData = selectedStore.services?.multipleOutlets
        ? [reservation.outlet || ""]
        : [];

      const dateData = [
        reservation.date || "",
        reservation.time || "",
        reservation.note || "",
        reservation.createdAt
          ? new Date(reservation.createdAt).toLocaleString()
          : "",
        reservation.updatedAt
          ? new Date(reservation.updatedAt).toLocaleString()
          : "",
      ];

      return [...baseData, ...foodData, ...outletData, ...dateData];
    });

    // Combine headers and rows into CSV format
    const csv = [
      headers.join(","), // Header row
      ...rows.map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\r\n");

    // Download the CSV
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "reservations.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                    ? "text-gray-400 hover:text-gray-200"
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
                className={`px-4 py-2 text-sm font-medium border rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 transition-colors ${
                  isDarkMode
                    ? "text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600"
                    : "text-gray-700 bg-gray-100 border-gray-300 hover:bg-gray-200"
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
      {/* Header Section */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between w-full mb-4 p-4 sm:p-6 border-b transition-colors ${
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
            Reservation
          </h1>
          <span
            className={`text-sm transition-colors ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Total: {filteredReservation ? filteredReservation.length : 0}{" "}
            reservations
          </span>
        </div>

        {/* Store Selection */}
        <div className="flex items-center">
          <StoreSelector
            selectedStoreId={selectedStoreId}
            onStoreIdChange={(storeId) => {
              setSelectedStoreId(storeId);
              localStorage.setItem("selectedValue", storeId);
              const store = stores.find((s) => s._id === storeId);
              setSelectedStore(store);
              localStorage.setItem("selectedStoreData", JSON.stringify(store));
            }}
            variant="default"
            customStores={stores}
            fetchOnMount={false}
          />
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full mb-6 px-4 sm:px-6 gap-4">
        {/* Left: Action Buttons */}
        <div className="flex  sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => setShowReservationModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Reservation</span>
            <span className="sm:hidden">Add Reservation</span>
          </button>

          <button
            onClick={() => setShowReservationSettingsModal(true)}
            className={`inline-flex cursor-pointer items-center gap-2 px-4 py-2.5 border rounded-lg transition-all duration-200 text-sm font-medium ${
              isDarkMode
                ? "text-gray-300 bg-gray-800 hover:bg-gray-700 border-gray-600 hover:border-gray-500"
                : "text-gray-700 bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Create New Reservation</span>
            <span className="sm:hidden">Create New Reservation</span>
          </button>

          <button
            title="Export CSV"
            onClick={exportToCSV}
            className={`inline-flex items-center gap-2 px-3 py-2.5 border rounded-lg transition-all duration-200 text-sm font-medium ${
              isDarkMode
                ? "text-gray-300 bg-gray-800 hover:bg-gray-800 border-gray-600 hover:border-gray-500"
                : "text-gray-700 bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300"
            }`}
          >
            <FileUp className="w-4 h-4" />
            <span className=" lg:inline">Export</span>
          </button>
        </div>

        {/* Right: Search and Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
              size={20}
            />
            <input
              type="text"
              placeholder="Search reservations..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`w-full sm:w-64 rounded-lg pl-10 pr-4 py-2.5 border focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent transition-colors ${
                isDarkMode
                  ? "bg-gray-800 text-gray-200 border-gray-600 placeholder-gray-400"
                  : "bg-white text-gray-700 border-gray-200"
              }`}
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span
              className={`text-sm whitespace-nowrap transition-colors ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Filter by:
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
              className={`px-4 py-2 pr-8 rounded-lg border focus:outline-none focus:ring-1 focus:ring-green-500 appearance-none bg-no-repeat bg-[position:right_12px_center] transition-colors ${
                isDarkMode
                  ? "bg-gray-800 text-gray-200 border-gray-600"
                  : "bg-white text-gray-700 border-gray-200"
              }`}
              style={{
                backgroundSize: "12px",
                backgroundImage: isDarkMode
                  ? "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')"
                  : "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')",
              }}
            >
              <option value="alltime">All Time</option>
              <option value="today">Today</option>
              <option value="thisweek">This Week</option>
              <option value="lastmonth">Last Month</option>
              <option value="daterange">Date Range</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto ">
        {/* Loading / Error State */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-green-600" />
          </div>
        )}

        {isError && (
          <div className="text-center py-20">
            <p
              className={`text-lg transition-colors ${
                isDarkMode ? "text-red-400" : "text-red-500"
              }`}
            >
              Failed to load reservations.
            </p>
          </div>
        )}

        {!isLoading && reservationsData?.length === 0 && selectedStoreId && (
          <div className="text-center py-20">
            <CalendarCheck
              className={`w-16 h-16 mx-auto mb-4 transition-colors ${
                isDarkMode ? "text-gray-600" : "text-gray-300"
              }`}
            />
            <p
              className={`text-lg transition-colors ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No reservations found.
            </p>
          </div>
        )}

        {/* Premium Table Design - Desktop */}
        {!isLoading && filteredReservation?.length > 0 && (
          <>
            {/* Desktop Table View */}
            <div
              className={`hidden lg:block rounded-xl shadow-sm border overflow-hidden mx-4 sm:mx-6 transition-colors ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              }`}
            >
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead
                    className={`border-b transition-colors ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <tr>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        S.N
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
                        Service
                      </th>
                      {selectedStore?.type === "food" && (
                        <>
                          <th
                            className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                              isDarkMode ? "text-gray-300" : "text-gray-500"
                            }`}
                          >
                            Table Number
                          </th>
                          <th
                            className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                              isDarkMode ? "text-gray-300" : "text-gray-500"
                            }`}
                          >
                            Number of Guest
                          </th>
                        </>
                      )}
                      {selectedStore?.type !== "food" && (
                        <th
                          className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                            isDarkMode ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          Number of Guests
                        </th>
                      )}
                      {selectedStore?.services?.multipleOutlets && (
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
                        Date & Time
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Note
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Status
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-500"
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
                    {currentReservations?.map((reservation, index) => (
                      <tr
                        key={index}
                        className={`transition-colors ${
                          isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"
                        }`}
                      >
                        {/* S.N */}
                        <td
                          className={`px-6 py-4 whitespace-nowrap transition-colors ${
                            isDarkMode ? "text-gray-300" : "text-gray-900"
                          }`}
                        >
                          {startIndex + index + 1}
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col justify-start">
                            <div
                              className={`text-sm font-medium transition-colors ${
                                isDarkMode ? "text-gray-200" : "text-gray-900"
                              }`}
                            >
                              {reservation?.customer?.name}
                            </div>
                            <div
                              className={`text-sm flex justify-items-center gap-1 transition-colors ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              +977 {reservation?.customer?.phone}
                            </div>
                          </div>
                        </td>

                        {/* Service */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-start">
                            <span
                              className={`text-sm flex flex-col transition-colors ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              {reservation.services.join(", ")}
                            </span>
                          </div>
                        </td>

                        {/* Conditional Inputs for Food Store */}
                        {selectedStore?.type === "food" && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div
                                className={`text-sm transition-colors ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {reservation.tableNumber || "---"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div
                                className={`text-sm transition-colors ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {reservation.numberofGuests || "---"}
                              </div>
                            </td>
                          </>
                        )}

                        {/* Number of Guests for non-food stores */}
                        {selectedStore?.type !== "food" && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className={`text-sm transition-colors ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              {reservation.numberofGuests || "---"}
                            </div>
                          </td>
                        )}

                        {/* Outlet */}
                        {selectedStore?.services?.multipleOutlets && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className={`text-sm transition-colors ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              {reservation.outlet || "---"}
                            </div>
                          </td>
                        )}

                        {/* Date & Time */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-start items-center gap-2">
                            <div
                              className={`text-sm flex flex-col transition-colors ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              <div>
                                {reservation.date
                                  ? dayjs(reservation.date).format("YYYY-MM-DD")
                                  : "---"}
                              </div>
                              {reservation.time || "12:00"}
                            </div>
                          </div>
                        </td>

                        {/* Note */}
                        <td className="px-6 py-4">
                          <div
                            className={`text-sm max-w-xs truncate transition-colors ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                            title={reservation.note || "---"}
                          >
                            {reservation.note || "---"}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              reservation.status === "confirmed" ||
                              reservation.status === "completed"
                                ? isDarkMode
                                  ? "bg-green-900/30 text-green-400"
                                  : "bg-green-100 text-green-800"
                                : reservation.status === "pending"
                                ? isDarkMode
                                  ? "bg-yellow-900/30 text-yellow-400"
                                  : "bg-yellow-100 text-yellow-800"
                                : reservation.status === "cancelled"
                                ? isDarkMode
                                  ? "bg-red-900/30 text-red-400"
                                  : "bg-red-100 text-red-800"
                                : isDarkMode
                                ? "bg-gray-700 text-gray-300"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {reservation.status === "noShow"
                              ? "No Show"
                              : reservation.status.charAt(0).toUpperCase() +
                                reservation.status.slice(1)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            {reservation.status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    confirmReservation(reservation._id)
                                  }
                                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() =>
                                    cancelReservation(reservation._id)
                                  }
                                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {reservation.status === "confirmed" && (
                              <>
                                <button
                                  onClick={() => noShow(reservation._id)}
                                  className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-800 transition-colors text-xs"
                                >
                                  No Show
                                </button>
                                <button
                                  onClick={() => completed(reservation._id)}
                                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs"
                                >
                                  Completed
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Accordion View */}
            <div className="lg:hidden mx-4 sm:mx-6">
              {currentReservations?.length > 0 ? (
                <div className="space-y-3">
                  {currentReservations?.map((reservation, index) => {
                    const isExpanded =
                      expandedReservation === startIndex + index;
                    return (
                      <div
                        key={startIndex + index}
                        className={`rounded-2xl border overflow-hidden shadow-sm transition-all duration-200 ${
                          isDarkMode ? "bg-gray-800" : "bg-white"
                        } ${
                          isExpanded
                            ? isDarkMode
                              ? "border-green-600 shadow-lg shadow-green-900/20 ring-1 ring-green-600/30"
                              : "border-green-300 shadow-lg shadow-green-100 ring-1 ring-green-200"
                            : isDarkMode
                            ? "border-gray-700"
                            : "border-gray-200"
                        }`}
                      >
                        {/* Mobile Card Header */}
                        <div
                          className={`p-4 cursor-pointer transition-colors ${
                            isExpanded
                              ? isDarkMode
                                ? "bg-green-900/30 hover:bg-green-900/40"
                                : "bg-green-50 hover:bg-green-100"
                              : isDarkMode
                              ? "hover:bg-gray-800"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => toggleReservation(startIndex + index)}
                        >
                          <div className="flex items-start justify-between">
                            {/* Left side with number and content */}
                            <div className="flex items-start space-x-3 flex-1">
                              {/* Number badge */}
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-semibold text-green-700">
                                  {startIndex + index + 1}
                                </span>
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <h3
                                      className={`text-base font-medium truncate transition-colors ${
                                        isDarkMode
                                          ? "text-gray-200"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {reservation?.customer?.name}
                                    </h3>
                                    <p
                                      className={`text-sm transition-colors ${
                                        isDarkMode
                                          ? "text-gray-400"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      {reservation.services.join(", ")}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end ml-2 flex-shrink-0">
                                    <span
                                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mb-1 ${
                                        reservation.status === "confirmed"
                                          ? isDarkMode
                                            ? "bg-green-900/30 text-green-400"
                                            : "bg-green-100 text-green-700"
                                          : reservation.status === "pending"
                                          ? isDarkMode
                                            ? "bg-yellow-900/30 text-yellow-400"
                                            : "bg-yellow-100 text-yellow-700"
                                          : reservation.status === "cancelled"
                                          ? isDarkMode
                                            ? "bg-red-900/30 text-red-400"
                                            : "bg-red-100 text-red-700"
                                          : isDarkMode
                                          ? "bg-gray-700 text-gray-300"
                                          : "bg-gray-100 text-gray-700"
                                      }`}
                                    >
                                      {reservation.status === "noShow"
                                        ? "No Show"
                                        : reservation.status
                                            .charAt(0)
                                            .toUpperCase() +
                                          reservation.status.slice(1)}
                                    </span>
                                    <p
                                      className={`text-xs transition-colors ${
                                        isDarkMode
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {reservation.date
                                        ? dayjs(reservation.date).format(
                                            "YYYY-MM-DD"
                                          )
                                        : "---"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Expand/Collapse arrow */}
                            <div className="ml-2 flex-shrink-0">
                              <svg
                                className={`w-5 h-5 transform transition-transform duration-200 ${
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
                            </div>
                          </div>
                        </div>

                        {/* Mobile Card Expanded Content */}
                        {isExpanded && (
                          <div
                            className={`px-4 pb-4 border-t transition-colors ${
                              isDarkMode
                                ? "border-green-600/30 bg-gradient-to-b from-green-900/20 to-gray-800"
                                : "border-green-200 bg-gradient-to-b from-green-25 to-white"
                            }`}
                          >
                            {/* Contact Information */}
                            <div className="mt-4">
                              <h4
                                className={`text-sm font-medium mb-3 transition-colors ${
                                  isDarkMode ? "text-white" : "text-gray-900"
                                }`}
                              >
                                Contact Information
                              </h4>
                              <div className="space-y-3">
                                <div
                                  className={`flex items-center text-sm transition-colors ${
                                    isDarkMode
                                      ? "text-gray-400"
                                      : "text-gray-600"
                                  }`}
                                >
                                  <svg
                                    className={`w-4 h-4 mr-2 transition-colors ${
                                      isDarkMode
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
                                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                  </svg>
                                  Phone Number
                                </div>
                                <p
                                  className={`text-sm font-medium ml-6 transition-colors ${
                                    isDarkMode
                                      ? "text-gray-300"
                                      : "text-gray-900"
                                  }`}
                                >
                                  +977 {reservation?.customer?.phone}
                                </p>

                                <div
                                  className={`flex items-center text-sm mt-3 transition-colors ${
                                    isDarkMode
                                      ? "text-gray-400"
                                      : "text-gray-600"
                                  }`}
                                >
                                  <svg
                                    className={`w-4 h-4 mr-2 transition-colors ${
                                      isDarkMode
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
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  Time
                                </div>
                                <p
                                  className={`text-sm font-medium ml-6 transition-colors ${
                                    isDarkMode
                                      ? "text-gray-300"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {reservation.time || "12:00"}
                                </p>

                                <div
                                  className={`flex items-center text-sm mt-3 transition-colors ${
                                    isDarkMode
                                      ? "text-gray-400"
                                      : "text-gray-600"
                                  }`}
                                >
                                  <svg
                                    className={`w-4 h-4 mr-2 transition-colors ${
                                      isDarkMode
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
                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                  Location
                                </div>
                                <p
                                  className={`text-sm font-medium ml-6 transition-colors ${
                                    isDarkMode
                                      ? "text-gray-300"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {reservation.outlet ||
                                    selectedStore?.outlets?.[0]?.location ||
                                    "Kathmandu"}
                                </p>
                              </div>
                            </div>

                            {/* Additional Details */}
                            <div className="mt-4">
                              <h4
                                className={`text-sm font-medium mb-3 transition-colors ${
                                  isDarkMode ? "text-white" : "text-gray-900"
                                }`}
                              >
                                Additional Details
                              </h4>
                              <div className="grid grid-cols-1 gap-3">
                                {selectedStore?.type === "food" && (
                                  <>
                                    <div className="flex justify-between">
                                      <span
                                        className={`text-sm transition-colors ${
                                          isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        Table Number:
                                      </span>
                                      <span
                                        className={`text-sm font-medium transition-colors ${
                                          isDarkMode
                                            ? "text-gray-300"
                                            : "text-gray-900"
                                        }`}
                                      >
                                        {reservation.tableNumber || "---"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span
                                        className={`text-sm transition-colors ${
                                          isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        Number of Guests:
                                      </span>
                                      <span
                                        className={`text-sm font-medium transition-colors ${
                                          isDarkMode
                                            ? "text-gray-300"
                                            : "text-gray-900"
                                        }`}
                                      >
                                        {reservation.numberofGuests || "---"}
                                      </span>
                                    </div>
                                  </>
                                )}
                                {selectedStore?.type !== "food" && (
                                  <div className="flex justify-between">
                                    <span
                                      className={`text-sm transition-colors ${
                                        isDarkMode
                                          ? "text-gray-400"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      Number of Guests:
                                    </span>
                                    <span
                                      className={`text-sm font-medium transition-colors ${
                                        isDarkMode
                                          ? "text-gray-300"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {reservation.numberofGuests || "---"}
                                    </span>
                                  </div>
                                )}
                                {reservation.note && (
                                  <div className="flex flex-col">
                                    <span
                                      className={`text-sm mb-1 transition-colors ${
                                        isDarkMode
                                          ? "text-gray-400"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      Note:
                                    </span>
                                    <span
                                      className={`text-sm transition-colors break-words ${
                                        isDarkMode
                                          ? "text-gray-300"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {reservation.note}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6">
                              <div className="flex gap-3">
                                {reservation.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        confirmReservation(reservation._id)
                                      }
                                      className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() =>
                                        cancelReservation(reservation._id)
                                      }
                                      className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}
                                {reservation.status === "confirmed" && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        noShow(reservation._id);
                                      }}
                                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                                    >
                                      No Show
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        completed(reservation._id);
                                      }}
                                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                                    >
                                      Completed
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  className={`rounded-xl shadow-sm border p-8 mx-4 sm:mx-6 transition-colors ${
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
                      <CalendarCheck
                        className={`w-6 h-6 transition-colors ${
                          isDarkMode ? "text-gray-400" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <p
                      className={`text-sm transition-colors ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      No reservations found
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Reservations will appear here when customers make bookings
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredReservation &&
              filteredReservation.length > itemsPerPage && (
                <div
                  className={`mx-4 md:mx-0 flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 border-t gap-4 sm:gap-0 transition-colors ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700"
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
                      {Math.min(endIndex, filteredReservation.length)} of{" "}
                      {filteredReservation.length} results
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
                          ? "text-gray-400 bg-gray-800 border-gray-600 hover:bg-gray-800"
                          : "text-gray-500 bg-white border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">‹</span>
                    </button>

                    <div className="hidden sm:flex items-center space-x-1">
                      {[...Array(Math.min(5, totalPages))].map((_, index) => {
                        const pageNumber =
                          currentPage <= 3
                            ? index + 1
                            : currentPage - 2 + index;
                        if (pageNumber > totalPages) return null;
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                              currentPage === pageNumber
                                ? "bg-green-600 text-white"
                                : isDarkMode
                                ? "text-gray-400 bg-gray-800 border border-gray-600 hover:bg-gray-800"
                                : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex sm:hidden items-center space-x-1">
                      {[...Array(Math.min(3, totalPages))].map((_, index) => {
                        const pageNumber =
                          currentPage <= 2
                            ? index + 1
                            : currentPage - 1 + index;
                        if (pageNumber > totalPages) return null;
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                              currentPage === pageNumber
                                ? "bg-green-600 text-white"
                                : isDarkMode
                                ? "text-gray-400 bg-gray-800 border border-gray-600 hover:bg-gray-800"
                                : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className={`px-3 sm:px-3 py-2 text-sm font-medium border rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
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
          </>
        )}
      </div>

      {showReservationModal && (
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 ease-out flex items-center justify-end z-50 p-4 ${
            isModalVisible ? "bg-opacity-50" : "bg-opacity-0"
          }`}
          onClick={handleModalClose}
        >
          <div
            className={`${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col transform transition-transform duration-300 ease-out ${
              isModalVisible ? "translate-x-0" : "translate-x-full"
            }`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Fixed */}
            <div
              className={`flex items-center justify-between p-6 border-b ${
                isDarkMode
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-200 bg-white"
              } sticky top-0 z-10 rounded-t-lg`}
            >
              <h2
                className={`flex gap-2 items-center text-xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <CalendarCheck className="h-5 w-5" />
                Add New Reservation
              </h2>
              <button
                onClick={handleModalClose}
                className={`transition-colors ${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-200"
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

            {/* Modal Content - Scrollable */}
            <div
              className="flex-1 overflow-y-auto"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Customer Information Section */}
                <div>
                  <h3
                    className={`flex gap-2 items-center text-lg font-medium mb-4 transition-colors ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Customer Information
                  </h3>

                  {/* Select Existing Customer */}
                  <div className="mb-4">
                    <label
                      className={`block text-sm font-medium mb-2 transition-colors ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Select Existing Customer (Optional)
                    </label>
                    <Select
                      name="customer"
                      options={customerOptions}
                      value={customerOptions.find(
                        (option) => option.value === formData.customer
                      )}
                      onChange={(selectedOption) => {
                        if (selectedOption) {
                          setFormData((prev) => ({
                            ...prev,
                            customer: selectedOption.value,
                            name: selectedOption.label,
                            email: selectedOption.email,
                            phone: selectedOption.phone,
                          }));
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            customer: null,
                            name: "",
                            email: "",
                            phone: "",
                          }));
                        }
                      }}
                      isClearable
                      placeholder="Search existing customers or leave empty for new customer"
                      className="text-sm"
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          backgroundColor: isDarkMode ? "#374151" : "#ffffff",
                          borderColor: isDarkMode ? "#4B5563" : "#D1D5DB",
                          "&:hover": {
                            borderColor: isDarkMode ? "#6B7280" : "#9CA3AF",
                          },
                          boxShadow: state.isFocused
                            ? isDarkMode
                              ? "0 0 0 1px #10B981"
                              : "0 0 0 1px #10B981"
                            : "none",
                        }),
                        menu: (provided) => ({
                          ...provided,
                          backgroundColor: isDarkMode ? "#374151" : "#ffffff",
                          border: isDarkMode
                            ? "1px solid #4B5563"
                            : "1px solid #D1D5DB",
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected
                            ? "#10B981"
                            : state.isFocused
                            ? isDarkMode
                              ? "#4B5563"
                              : "#F3F4F6"
                            : "transparent",
                          color: state.isSelected
                            ? "#ffffff"
                            : isDarkMode
                            ? "#ffffff"
                            : "#111827",
                          "&:hover": {
                            backgroundColor: state.isSelected
                              ? "#10B981"
                              : isDarkMode
                              ? "#4B5563"
                              : "#F3F4F6",
                          },
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          color: isDarkMode ? "#ffffff" : "#111827",
                        }),
                        placeholder: (provided) => ({
                          ...provided,
                          color: isDarkMode ? "#9CA3AF" : "#6B7280",
                        }),
                        input: (provided) => ({
                          ...provided,
                          color: isDarkMode ? "#ffffff" : "#111827",
                        }),
                      }}
                    />
                  </div>

                  {/* Customer Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
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
                        value={formData.name}
                        onChange={handleChange}
                        required
                        readOnly={!!formData.customer}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm transition-colors ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-600"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 disabled:bg-gray-100"
                        }`}
                        placeholder="Enter customer name"
                      />
                    </div>

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
                        value={formData.email}
                        onChange={handleChange}
                        required
                        readOnly={!!formData.customer}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm transition-colors ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-600"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 disabled:bg-gray-100"
                        }`}
                        placeholder="customer@example.com"
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
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        readOnly={!!formData.customer}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm transition-colors ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 disabled:bg-gray-600"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 disabled:bg-gray-100"
                        }`}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Services *
                      </label>
                      <Select
                        isMulti
                        name="services"
                        options={serviceOptions}
                        value={serviceOptions.filter((option) =>
                          formData.services?.includes(option.value)
                        )}
                        onChange={(selectedOptions) => {
                          const selectedValues = selectedOptions.map(
                            (opt) => opt.value
                          );
                          setFormData((prev) => ({
                            ...prev,
                            services: selectedValues,
                          }));
                        }}
                        placeholder="Select services..."
                        className="text-sm"
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            backgroundColor: isDarkMode ? "#374151" : "#ffffff",
                            borderColor: isDarkMode ? "#4B5563" : "#D1D5DB",
                            "&:hover": {
                              borderColor: isDarkMode ? "#6B7280" : "#9CA3AF",
                            },
                            boxShadow: state.isFocused
                              ? isDarkMode
                                ? "0 0 0 1px #10B981"
                                : "0 0 0 1px #10B981"
                              : "none",
                          }),
                          menu: (provided) => ({
                            ...provided,
                            backgroundColor: isDarkMode ? "#374151" : "#ffffff",
                            border: isDarkMode
                              ? "1px solid #4B5563"
                              : "1px solid #D1D5DB",
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isSelected
                              ? "#10B981"
                              : state.isFocused
                              ? isDarkMode
                                ? "#4B5563"
                                : "#F3F4F6"
                              : "transparent",
                            color: state.isSelected
                              ? "#ffffff"
                              : isDarkMode
                              ? "#ffffff"
                              : "#111827",
                            "&:hover": {
                              backgroundColor: state.isSelected
                                ? "#10B981"
                                : isDarkMode
                                ? "#4B5563"
                                : "#F3F4F6",
                            },
                          }),
                          multiValue: (provided) => ({
                            ...provided,
                            backgroundColor: isDarkMode ? "#4B5563" : "#E5E7EB",
                          }),
                          multiValueLabel: (provided) => ({
                            ...provided,
                            color: isDarkMode ? "#ffffff" : "#111827",
                          }),
                          multiValueRemove: (provided) => ({
                            ...provided,
                            color: isDarkMode ? "#9CA3AF" : "#6B7280",
                            "&:hover": {
                              backgroundColor: isDarkMode
                                ? "#6B7280"
                                : "#D1D5DB",
                              color: isDarkMode ? "#ffffff" : "#111827",
                            },
                          }),
                          placeholder: (provided) => ({
                            ...provided,
                            color: isDarkMode ? "#9CA3AF" : "#6B7280",
                          }),
                          input: (provided) => ({
                            ...provided,
                            color: isDarkMode ? "#ffffff" : "#111827",
                          }),
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Reservation Details Section */}
                <div>
                  <h3
                    className={`flex gap-2 items-center text-lg font-medium mb-4 transition-colors ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <svg
                      className="h-5 w-5"
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
                    Reservation Details
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Conditional Fields for Food Store */}
                    {selectedStore?.type === "food" && (
                      <>
                        <div>
                          <label
                            className={`block text-sm font-medium mb-2 transition-colors ${
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            Table Number *
                          </label>
                          <input
                            type="text"
                            name="tableNumber"
                            value={formData.tableNumber || ""}
                            onChange={handleChange}
                            required
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm transition-colors ${
                              isDarkMode
                                ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                                : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                            }`}
                            placeholder="Enter table number"
                          />
                        </div>

                        <div>
                          <label
                            className={`block text-sm font-medium mb-2 transition-colors ${
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            Number of Guests *
                          </label>
                          <input
                            type="number"
                            name="numberofGuests"
                            value={formData.numberofGuests || ""}
                            onChange={handleChange}
                            required
                            min="1"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm transition-colors ${
                              isDarkMode
                                ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                                : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                            }`}
                            placeholder="Enter number of guests"
                          />
                        </div>
                      </>
                    )}

                    {/* Outlet Selection */}
                    {selectedStore?.services?.multipleOutlets && (
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 transition-colors ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Outlet *
                        </label>
                        <select
                          name="outlet"
                          value={formData.outlet || ""}
                          onChange={handleChange}
                          required
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm transition-colors ${
                            isDarkMode
                              ? "border-gray-600 bg-gray-700 text-white"
                              : "border-gray-300 bg-white text-gray-900"
                          }`}
                        >
                          <option value="">Select Outlet</option>
                          {selectedStore?.outlets.map((outlet, i) => (
                            <option key={i} value={outlet.location}>
                              {outlet.location}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Date Selection */}
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Reservation Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={handleChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm transition-colors ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-white [color-scheme:dark]"
                            : "border-gray-300 bg-white text-gray-900"
                        }`}
                      />
                    </div>

                    {/* Time Selection */}
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {reservationSetting?.needTimeSlots
                          ? "Time Slot *"
                          : "Reservation Time *"}
                      </label>
                      {reservationSetting?.needTimeSlots ? (
                        <select
                          name="time"
                          value={formData.time}
                          onChange={handleChange}
                          required
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm transition-colors ${
                            isDarkMode
                              ? "border-gray-600 bg-gray-700 text-white"
                              : "border-gray-300 bg-white text-gray-900"
                          }`}
                        >
                          <option value="">Select a time slot</option>
                          {(selectedStore?.services?.multipleOutlets
                            ? reservationSetting.timeSlots?.filter(
                                (slot) => slot.outlet === formData.outlet
                              )
                            : reservationSetting.timeSlots
                          )?.map((slot, index) => (
                            <option key={index} value={slot.time}>
                              {slot.time}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="time"
                          name="time"
                          value={formData.time}
                          onChange={handleChange}
                          required
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm transition-colors ${
                            isDarkMode
                              ? "border-gray-600 bg-gray-700 text-white [color-scheme:dark]"
                              : "border-gray-300 bg-white text-gray-900"
                          }`}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  className={`flex justify-end space-x-3 pt-6 border-t transition-colors ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm transition-colors ${
                      isDarkMode
                        ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>
                        <CalendarCheck className="h-4 w-4" />
                        Create Reservation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Settings Modal */}
      {showReservationSettingsModal && (
        <ReservationSetting
          store={stores.find((s) => s._id === selectedStoreId) || selectedStore}
          isOpen={showReservationSettingsModal}
          onClose={() => setShowReservationSettingsModal(false)}
        />
      )}
    </div>
  );
};

export default Reservation;
