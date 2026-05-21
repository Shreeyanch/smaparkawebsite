import { Award, CalendarCheck, Loader2, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import LoadingSpinner from "../../../components/LoadingSpinner";
import api from "../../../api/config";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { Filter } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import maskPhone from "./maskPhone";
import errorFunction from "./errorFunction";

// Extend dayjs with the required plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// Helper function to get status colors for dark mode compatibility
const getStatusColor = (status, isDarkMode = false) => {
  const colors = {
    confirmed: isDarkMode
      ? "bg-green-900/30 text-green-400 border border-green-700/50"
      : "bg-green-100 text-green-800",
    completed: isDarkMode
      ? "bg-green-900/30 text-green-400 border border-green-700/50"
      : "bg-green-100 text-green-800",
    pending: isDarkMode
      ? "bg-yellow-900/30 text-yellow-400 border border-yellow-700/50"
      : "bg-yellow-100 text-yellow-800",
    cancelled: isDarkMode
      ? "bg-red-900/30 text-red-400 border border-red-700/50"
      : "bg-red-100 text-red-800",
    noShow: isDarkMode
      ? "bg-gray-900/30 text-gray-400 border border-gray-700/50"
      : "bg-gray-100 text-gray-800",
  };
  return (
    colors[status] ||
    (isDarkMode
      ? "bg-gray-900/30 text-gray-400 border border-gray-700/50"
      : "bg-gray-100 text-gray-800")
  );
};

const Reservation = () => {
  const { isDarkMode } = useTheme();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("storeToken");
  const [query, setQuery] = useState("");
  const queryClient = useQueryClient();
  const { storeData } = queryClient.getQueryData(["store"]);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [formData, setFormData] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    // if (!token || !storeData?.services?.reservation) navigate("/store/login");
    if (!token) navigate("/store/login");
  }, [token]);

  // Fetch reservations using react-query
  const {
    data: reservationsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["reservations", storeData._id],
    queryFn: async () => {
      const res = await api.get(`/store/reservationS/${storeData._id}`, {
        headers: { token },
      });
      return res.data.reservations;
    },
    enabled: !!storeData._id, // only run when store selected
  });

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
    queryKey: ["reservationSettings", storeData?._id],
    queryFn: async () => {
      const res = await api.get(
        `/store/reservation-settings?store=${storeData?._id}`,
        { headers: { token } }
      );
      return res.data;
    },
    enabled: !!storeData?._id,
  });

  const { data: customers } = useQuery({
    queryKey: ["customers", storeData?._id],
    queryFn: async () => {
      const res = await api.get(`/store/getCustomersS/${storeData?._id}`, {
        headers: { token },
        params: { lite: true },
      });
      return res.data.customers;
    },
    enabled: !!storeData?._id, // only run when store selected
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
        `/store/manualReservation/${storeData.url}`,
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
      if (err.response?.status === 401) {
        errorFunction(navigate);
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  // const filteredReservation = reservationsData?.filter((reservation) => {
  //   const matchesText = [
  //     reservation?.customer?.name,
  //     reservation?.customer?.phone,
  //   ].some((field) =>
  //     String(field || "")
  //       .toLowerCase()
  //       .includes(query.toLowerCase())
  //   );

  //   // If store has multiple outlets, filter by outlet ID stored in localStorage
  //   if (storeData.services?.multipleOutlets) {
  //     const outletId = localStorage.getItem("outletId");

  //     const matchedOutlet = storeData.outlets?.find(
  //       (outlet) => outlet._id === outletId
  //     );

  //     const isSameOutlet = reservation.outlet === matchedOutlet?.location;

  //     return matchesText && isSameOutlet;
  //   }

  //   return matchesText;
  // });

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentFilter, setCurrentFilter] = useState("All Time");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  const currentDate = dayjs().format("YYYY-MM-DD");

  // Initialize dates to show all time on component mount
  useEffect(() => {
    if (storeData?.createdAt) {
      const storeCreationDate = dayjs(storeData.createdAt).format("YYYY-MM-DD");
      setStartDate(storeCreationDate);

      // Set end date far into the future to include all reservations
      setEndDate(dayjs().add(10, "year").format("YYYY-MM-DD"));
    }
  }, [storeData]);

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
      setTempStartDate(startDate);
      setTempEndDate(endDate);
      setIsDateModalOpen(true);
      return;
    }

    if (filterType === "lastmonth") {
      setStartDate(dayjs().subtract(1, "month").format("YYYY-MM-DD"));
      setEndDate(dayjs().add(10, "year").format("YYYY-MM-DD"));
      setCurrentFilter("Last Month");
    } else if (filterType === "alltime") {
      const storeCreationDate = dayjs(storeData.createdAt).format("YYYY-MM-DD");
      setStartDate(storeCreationDate); // Set the start date to the store's createdAt
      setEndDate(dayjs().add(10, "year").format("YYYY-MM-DD"));
      setCurrentFilter("All Time");
    } else if (filterType === "thisweek") {
      setStartDate(dayjs().subtract(7, "days").format("YYYY-MM-DD")); // 7 days ago
      setEndDate(dayjs().add(10, "year").format("YYYY-MM-DD"));
      setCurrentFilter("This Week");
    } else if (filterType === "today") {
      setStartDate(dayjs().format("YYYY-MM-DD")); // 7 days ago
      setEndDate(dayjs().add(10, "year").format("YYYY-MM-DD"));
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

    // If store has multiple outlets, filter by outlet ID stored in localStorage
    if (storeData.services?.multipleOutlets) {
      const outletId = localStorage.getItem("outletId");

      const matchedOutlet = storeData.outlets?.find(
        (outlet) => outlet._id === outletId
      );

      const isSameOutlet = reservation.outlet === matchedOutlet?.location;

      return matchesText && isSameOutlet && isWithinDateRange;
    }

    return matchesText && isWithinDateRange;
  });

  // State for mobile accordion
  const [expandedReservation, setExpandedReservation] = useState(null);

  const toggleReservation = (index) => {
    setExpandedReservation(expandedReservation === index ? null : index);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredReservation?.length / itemsPerPage) || 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReservations =
    filteredReservation?.slice(startIndex, endIndex) || [];

  return (
    <div
      className={`px-2 sm:px-0 md:px-4 lg:px-0 sm:ml-0 lg:ml-64 min-h-screen transition-colors ${
        isDarkMode ? "bg-gray-900" : "bg-[#f8fafb]"
      }`}
    >
      {loading && <LoadingSpinner />}

      {/* Date Range Modal */}
      {isDateModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsDateModalOpen(false)}
        >
          <div
            className={`rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transition-colors ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
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

      {/* Header Section */}
      <div
        className={`flex flex-col gap-4 sm:gap-6 w-full mb-6 sm:mb-8 p-4 sm:p-6 border-b transition-colors ${
          isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-[#f8fafb] border-gray-200"
        }`}
      >
        {/* Top Row: Title and Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Title and Total */}
          <div className="flex flex-col gap-1 sm:gap-2">
            <h1
              className={`text-xl sm:text-2xl lg:text-3xl font-semibold transition-colors ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Reservations
            </h1>
            <span
              className={`text-sm sm:text-base transition-colors ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Total: {filteredReservation ? filteredReservation.length : 0}{" "}
              reservations
            </span>
          </div>

          <button
            onClick={() => {
              // You can show a modal or navigate to a new page
              // For now, let’s assume you open a modal
              setShowReservationModal(true);
            }}
            className="flex items-center justify-center bg-green-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap text-sm sm:text-base font-medium shadow-sm hover:shadow-md w-full sm:w-auto"
          >
            <span className="mr-2">+</span>
            <span className="hidden xs:inline">Add New Reservation</span>
            <span className="xs:hidden">Add Reservation</span>
          </button>
        </div>

        {/* Bottom Row: Search and Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 sm:flex-initial">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
              size={18}
            />
            <input
              type="text"
              placeholder="Search reservations..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`w-full sm:w-64 lg:w-80 rounded-lg pl-10 pr-4 py-2.5 sm:py-3 border focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                isDarkMode
                  ? "bg-gray-900 text-white border-gray-600 placeholder-gray-400 focus:bg-gray-600"
                  : "bg-white text-gray-700 border-gray-200 placeholder-gray-500 focus:bg-gray-50"
              }`}
            />
          </div>

          {/* Filter Section */}
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-3">
            <span
              className={`text-sm font-medium whitespace-nowrap transition-colors hidden xs:block ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Filter by:
            </span>
            <div className="relative">
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
                className={`w-full xs:w-auto px-4 py-2.5 sm:py-3 pr-10 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none cursor-pointer transition-all duration-200 text-sm sm:text-base ${
                  isDarkMode
                    ? "bg-gray-900 text-white border-gray-600 focus:bg-gray-600"
                    : "bg-white text-gray-700 border-gray-200 focus:bg-gray-50"
                }`}
                style={{
                  backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iJHtpc0RhcmtNb2RlID8gJyNkMWQ1ZGInIDogJyM2YjcyODAnfSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  backgroundSize: "12px",
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
      </div>

      <div className="max-w-7xl mx-auto">
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

        {!isLoading && reservationsData?.length === 0 && (
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
              {/* Table Header */}
              {/* <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600">
                  Showing {currentReservations.length} reservations
                </p>
              </div> */}

              {/* Table */}
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
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        S.N
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Customer
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Service
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Location
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Number of Guests
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Date & Time
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Note
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Status
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
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
                    {currentReservations?.map((reservation, index) => (
                      <tr
                        key={index}
                        className={`transition-colors ${
                          isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"
                        }`}
                      >
                        {/* Customer */}

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`transition-colors ${
                              isDarkMode ? "text-gray-300" : "text-gray-900"
                            }`}
                          >
                            {startIndex + index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col justify-start">
                            <div
                              className={`text-sm font-medium transition-colors ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {reservation?.customer?.name}
                            </div>
                            <div
                              className={`text-sm flex justify-items-center gap-1 transition-colors ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              +977{" "}
                              {storeData?.showPhoneNumberOnSubAdmin
                                ? reservation?.customer?.phone
                                : maskPhone(reservation?.customer?.phone)}
                            </div>
                          </div>
                        </td>

                        {/* Service */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-start">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                isDarkMode ? "text-gray-200" : "text-black"
                              }`}
                            >
                              {reservation.services.join(", ")}
                            </span>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`flex justify-items-center text-sm transition-colors ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {reservation.outlet ||
                              storeData?.outlets?.[0]?.location ||
                              "Kathmandu"}
                          </div>
                        </td>

                        {/* Number of Guests */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`text-sm transition-colors ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {reservation.numberofGuests || "---"}
                          </div>
                        </td>

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
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              reservation.status,
                              isDarkMode
                            )}`}
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
                <div className="space-y-2">
                  {currentReservations?.map((reservation, index) => {
                    const isExpanded =
                      expandedReservation === startIndex + index;
                    return (
                      <div
                        key={startIndex + index}
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
                          onClick={() => toggleReservation(startIndex + index)}
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
                                      isDarkMode
                                        ? "text-white"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {reservation?.customer?.name}
                                  </h3>
                                  <p
                                    className={`text-xs mt-0.5 w-24 transition-colors ${
                                      isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {reservation.services.join(", ")}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end mx-4">
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-1 ${getStatusColor(
                                      reservation.status,
                                      isDarkMode
                                    )}`}
                                  >
                                    •{" "}
                                    {reservation.status === "noShow"
                                      ? "No Show"
                                      : reservation.status
                                          .charAt(0)
                                          .toUpperCase() +
                                        reservation.status.slice(1)}
                                  </span>
                                  <div
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
                                  </div>
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
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-xs mb-1 transition-colors ${
                                      isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    Phone Number
                                  </p>
                                  <p
                                    className={`text-sm transition-colors ${
                                      isDarkMode
                                        ? "text-gray-200"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    +977
                                    {storeData?.showPhoneNumberOnSubAdmin
                                      ? reservation?.customer?.phone
                                      : maskPhone(reservation?.customer?.phone)}
                                  </p>
                                </div>
                              </div>

                              {/* Time */}
                              <div className="flex items-center space-x-3">
                                <svg
                                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
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
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-xs mb-1 transition-colors ${
                                      isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    Time
                                  </p>
                                  <p
                                    className={`text-sm transition-colors ${
                                      isDarkMode
                                        ? "text-gray-200"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {reservation.time || "12:00"}
                                  </p>
                                </div>
                              </div>

                              {/* Location */}
                              <div className="flex items-center space-x-3">
                                <svg
                                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
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
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-xs mb-1 transition-colors ${
                                      isDarkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    Location
                                  </p>
                                  <p
                                    className={`text-sm transition-colors ${
                                      isDarkMode
                                        ? "text-gray-200"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {reservation.outlet ||
                                      storeData?.outlets?.[0]?.location ||
                                      "Kathmandu"}
                                  </p>
                                </div>
                              </div>

                              {/* Number of Guests */}
                              <div className="flex items-center space-x-3">
                                <svg
                                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
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
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
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
                                    Number of Guests
                                  </p>
                                  <p
                                    className={`text-sm transition-colors ${
                                      isDarkMode
                                        ? "text-gray-200"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {reservation.numberofGuests || "---"}
                                  </p>
                                </div>
                              </div>

                              {/* Note */}
                              {reservation.note && (
                                <div className="flex items-start space-x-3">
                                  <svg
                                    className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-colors ${
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
                                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
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
                                      Note
                                    </p>
                                    <p
                                      className={`text-sm break-words transition-colors ${
                                        isDarkMode
                                          ? "text-gray-200"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {reservation.note}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons */}
                              {(reservation.status === "pending" ||
                                reservation.status === "confirmed") && (
                                <div
                                  className={`pt-2 border-t transition-colors ${
                                    isDarkMode
                                      ? "border-gray-600"
                                      : "border-gray-200"
                                  }`}
                                >
                                  <div className="flex gap-2">
                                    {reservation.status === "pending" && (
                                      <>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            confirmReservation(reservation._id);
                                          }}
                                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                                        >
                                          Confirm
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            cancelReservation(reservation._id);
                                          }}
                                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
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
                          isDarkMode ? "text-gray-500" : "text-gray-400"
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
                    <p
                      className={`text-xs mt-1 transition-colors ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      Reservations will appear here when customers make bookings
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {filteredReservation &&
              filteredReservation.length > itemsPerPage && (
                <div
                  className={`mx-4 md:mx-0 flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4  gap-4 sm:gap-0 transition-colors ${
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
          </>
        )}
      </div>
      {showReservationModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowReservationModal(false)}
        >
          <div
            className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className={`flex items-center justify-between p-6 sm:p-8 pb-4 sm:pb-6 sticky top-0 rounded-t-2xl border-b transition-colors ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              }`}
            >
              <div>
                <h2
                  className={`text-xl sm:text-2xl font-semibold transition-colors ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Add New Reservation
                </h2>
                <p
                  className={`text-sm mt-1 transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Create a new reservation for your store
                </p>
              </div>
              <button
                onClick={() => setShowReservationModal(false)}
                className={`p-2 rounded-full transition-all duration-200 flex-shrink-0 ml-4 ${
                  isDarkMode
                    ? "text-gray-500 hover:text-gray-300 hover:bg-gray-700"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
              >
                <svg
                  className="w-5 h-5"
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

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="px-6 sm:px-8 pb-6 sm:pb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Select Customer */}
                <div className="sm:col-span-2 space-y-2">
                  <label
                    className={`block text-sm font-medium transition-colors ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Customer
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
                    placeholder="Select an existing customer or leave empty for new"
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: isDarkMode ? "#374151" : "#f9fafb",
                        borderColor: "transparent",
                        borderRadius: "0.75rem",
                        padding: "0.25rem",
                        boxShadow: "none",
                        "&:hover": {
                          borderColor: "transparent",
                        },
                        "&:focus-within": {
                          borderColor: "#10b981",
                          boxShadow: "0 0 0 1px #10b981",
                        },
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: isDarkMode ? "#ffffff" : "#111827",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: isDarkMode ? "#9ca3af" : "#6b7280",
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: isDarkMode ? "#374151" : "#ffffff",
                        borderRadius: "0.75rem",
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused
                          ? isDarkMode
                            ? "#4b5563"
                            : "#f3f4f6"
                          : "transparent",
                        color: isDarkMode ? "#ffffff" : "#111827",
                        "&:hover": {
                          backgroundColor: isDarkMode ? "#4b5563" : "#f3f4f6",
                        },
                      }),
                    }}
                  />
                </div>

                {/* Customer Name (for new customers) */}
                {!formData.customer && (
                  <div className="space-y-2">
                    <label
                      className={`block text-sm font-medium transition-colors ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Customer Name
                    </label>
                    <input
                      name="name"
                      placeholder="Enter customer name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border-0 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200 ${
                        isDarkMode
                          ? "bg-gray-700 text-white placeholder-gray-400 focus:bg-gray-600"
                          : "bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white"
                      }`}
                    />
                  </div>
                )}

                {/* Customer Email */}
                <div className="space-y-2">
                  <label
                    className={`block text-sm font-medium transition-colors ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Email Address
                  </label>
                  <input
                    name="email"
                    placeholder="customer@example.com"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    readOnly={!!formData.customer}
                    className={`w-full px-4 py-3 border-0 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200 ${
                      isDarkMode
                        ? "bg-gray-700 text-white placeholder-gray-400 focus:bg-gray-600"
                        : "bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white"
                    } ${
                      !!formData.customer
                        ? isDarkMode
                          ? "opacity-70"
                          : "opacity-60"
                        : ""
                    }`}
                  />
                </div>

                {/* Customer Phone */}
                <div className="space-y-2">
                  <label
                    className={`block text-sm font-medium transition-colors ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    placeholder="9800000000"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    readOnly={!!formData.customer}
                    className={`w-full px-4 py-3 border-0 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200 ${
                      isDarkMode
                        ? "bg-gray-700 text-white placeholder-gray-400 focus:bg-gray-600"
                        : "bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white"
                    } ${
                      !!formData.customer
                        ? isDarkMode
                          ? "opacity-70"
                          : "opacity-60"
                        : ""
                    }`}
                  />
                </div>

                {/* Services */}
                <div className="sm:col-span-2 space-y-2">
                  <label
                    className={`block text-sm font-medium transition-colors ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Services
                  </label>
                  <Select
                    isMulti
                    name="services"
                    options={serviceOptions}
                    className="basic-multi-select"
                    classNamePrefix="select"
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
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: isDarkMode ? "#374151" : "#f9fafb",
                        borderColor: "transparent",
                        borderRadius: "0.75rem",
                        padding: "0.25rem",
                        boxShadow: "none",
                        "&:hover": {
                          borderColor: "transparent",
                        },
                        "&:focus-within": {
                          borderColor: "#10b981",
                          boxShadow: "0 0 0 1px #10b981",
                        },
                      }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: isDarkMode ? "#4b5563" : "#e5e7eb",
                        borderRadius: "0.5rem",
                      }),
                      multiValueLabel: (base) => ({
                        ...base,
                        color: isDarkMode ? "#ffffff" : "#111827",
                      }),
                      multiValueRemove: (base) => ({
                        ...base,
                        color: isDarkMode ? "#ffffff" : "#111827",
                        "&:hover": {
                          backgroundColor: isDarkMode ? "#ef4444" : "#f87171",
                          color: "#ffffff",
                        },
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: isDarkMode ? "#9ca3af" : "#6b7280",
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: isDarkMode ? "#374151" : "#ffffff",
                        borderRadius: "0.75rem",
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused
                          ? isDarkMode
                            ? "#4b5563"
                            : "#f3f4f6"
                          : "transparent",
                        color: isDarkMode ? "#ffffff" : "#111827",
                        "&:hover": {
                          backgroundColor: isDarkMode ? "#4b5563" : "#f3f4f6",
                        },
                      }),
                    }}
                  />
                </div>

                {/* Conditional Inputs for Food Store */}
                {storeData?.type === "food" && (
                  <>
                    <div className="space-y-2">
                      <label
                        className={`block text-sm font-medium transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Table Number
                      </label>
                      <input
                        name="tableNumber"
                        placeholder="Table No"
                        type="text"
                        value={formData.tableNumber || ""}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-3 border-0 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200 ${
                          isDarkMode
                            ? "bg-gray-700 text-white placeholder-gray-400 focus:bg-gray-600"
                            : "bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white"
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        className={`block text-sm font-medium transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Number of Guests
                      </label>
                      <input
                        name="numberofGuests"
                        placeholder="No Of Guests"
                        type="number"
                        value={formData.numberofGuests || ""}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-3 border-0 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200 ${
                          isDarkMode
                            ? "bg-gray-700 text-white placeholder-gray-400 focus:bg-gray-600"
                            : "bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white"
                        }`}
                      />
                    </div>
                  </>
                )}

                {/* Outlet Dropdown */}
                {storeData?.services?.multipleOutlets && (
                  <div className="space-y-2">
                    <label
                      className={`block text-sm font-medium transition-colors ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Outlet
                    </label>
                    <select
                      name="outlet"
                      value={formData.outlet || ""}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border-0 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200 ${
                        isDarkMode
                          ? "bg-gray-700 text-white focus:bg-gray-600"
                          : "bg-gray-50 text-gray-900 focus:bg-white"
                      }`}
                    >
                      <option value="">Select Outlet</option>
                      {storeData?.outlets.map((outlet, i) => (
                        <option key={i} value={outlet.location}>
                          {outlet.location}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date Picker */}
                <div className="space-y-2">
                  <label
                    className={`block text-sm font-medium transition-colors ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Date
                  </label>
                  <input
                    name="date"
                    type="date"
                    value={formData.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border-0 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200 ${
                      isDarkMode
                        ? "bg-gray-700 text-white focus:bg-gray-600"
                        : "bg-gray-50 text-gray-900 focus:bg-white"
                    }`}
                  />
                </div>

                {/* Time Slot or Time Picker */}
                <div className="space-y-2">
                  <label
                    className={`block text-sm font-medium transition-colors ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Time
                  </label>
                  {reservationSetting?.needTimeSlots ? (
                    <select
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border-0 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200 ${
                        isDarkMode
                          ? "bg-gray-700 text-white focus:bg-gray-600"
                          : "bg-gray-50 text-gray-900 focus:bg-white"
                      }`}
                    >
                      <option value="">Select a time slot</option>
                      {(storeData?.services?.multipleOutlets
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
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 border-0 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200 ${
                        isDarkMode
                          ? "bg-gray-700 text-white focus:bg-gray-600"
                          : "bg-gray-50 text-gray-900 focus:bg-white"
                      }`}
                    />
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div
                className={`flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 sm:pt-8 mt-6 sm:mt-8 border-t transition-colors ${
                  isDarkMode ? "border-gray-700" : "border-gray-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setShowReservationModal(false)}
                  className={`w-full sm:w-auto px-6 py-3 text-sm font-medium rounded-xl focus:outline-none focus:ring-1 transition-all duration-200 order-2 sm:order-1 ${
                    isDarkMode
                      ? "text-gray-300 bg-gray-700 hover:bg-gray-600 focus:ring-gray-500"
                      : "text-gray-600 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200 min-w-[160px] flex items-center justify-center order-1 sm:order-2"
                >
                  Submit Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservation;
