import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStoreAuth } from "../../context/StoreAuthContext";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import api from "../../api/config";
import { toast } from "sonner";
import LoadingSpinner from "../../components/LoadingSpinner";

const ReservationForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    service,
    reservationSetting,
    selectedOutlet: passedOutlet,
  } = location.state || {};
  const { authState } = useStoreAuth();
  const { userInfo: user, token } = authState;
  const queryClient = useQueryClient();
  const { storeData } = queryClient.getQueryData(["store"]) || {};

  const [loading, setLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showCustomTimeDialog, setShowCustomTimeDialog] = useState(false);
  const [showCalendarDialog, setShowCalendarDialog] = useState(false);
  const [customTime, setCustomTime] = useState("");
  const dateInputRef = useRef(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: "",
    numberofGuests: 1,
    tableNumber: "",
    outlet:
      passedOutlet?.location ||
      service?.outlet ||
      (storeData?.services?.multipleOutlets ? "" : undefined),
    services: service ? [service.name] : [],
    note: "",
  });

  const onBackClick = useCallback(() => navigate(-1), [navigate]);

  // Set selectedOutlet immediately if passed from previous page
  useEffect(() => {
    if (passedOutlet && passedOutlet.phone) {
      setSelectedOutlet(passedOutlet);
      // Also update formData.outlet if not already set
      if (passedOutlet.location) {
        setFormData((prev) => ({
          ...prev,
          outlet: passedOutlet.location,
        }));
      }
    }
  }, [passedOutlet]);

  // Auto-select outlet if store has only 0 or 1 outlet
  useEffect(() => {
    if (service?.outlet === "All Outlets" && storeData?.outlets) {
      if (storeData.outlets.length === 0) {
        // No outlets, use store name/location
        setFormData((prev) => ({
          ...prev,
          outlet: storeData.name || storeData.location || "Main Location",
        }));
      } else if (storeData.outlets.length === 1) {
        // Only one outlet, auto-select it
        const singleOutlet = storeData.outlets[0];
        setFormData((prev) => ({
          ...prev,
          outlet: singleOutlet.location,
        }));
        setSelectedOutlet(singleOutlet);
      }
    }
  }, [service, storeData]);

  // Fetch outlets with phone and mapLink from API
  const { data: outletsData } = useQuery({
    queryKey: ["outlets", storeData?._id],
    queryFn: async () => {
      const res = await api.get(`/store/getOutlets/${storeData._id}`);
      return res.data.outlets || [];
    },
    enabled: !!storeData?._id && (!!service?.outlet || !!passedOutlet),
    onSuccess: (data) => {
      // If passedOutlet is already a full object with phone/mapLink, use it
      if (passedOutlet && passedOutlet.phone) {
        setSelectedOutlet(passedOutlet);
      } else {
        // Otherwise, find the outlet by location
        const outletLocation =
          passedOutlet?.location || passedOutlet || service?.outlet;
        if (outletLocation && data) {
          const outlet = data.find((o) => o.location === outletLocation);
          if (outlet) {
            setSelectedOutlet(outlet);
          }
        }
      }
    },
  });

  const { data: reservationsData } = useQuery({
    queryKey: ["reservations", storeData?._id],
    queryFn: async () => {
      const res = await api.get(`/store/reservation/${storeData._id}`);
      return res.data.reservations;
    },
    enabled: !!storeData?._id && showBookingForm,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "outlet") {
      // Reset time when outlet changes and set selected outlet
      const outlet = outletsData?.find((o) => o.location === value);
      setSelectedOutlet(outlet);
      setFormData((prev) => ({ ...prev, time: "", [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const reservationMutation = useMutation({
    mutationFn: async (payload) => {
      return await api.post(`/customer/reservation/${storeData.url}`, payload, {
        headers: { token },
      });
    },
    onSuccess: (res, payload) => {
      if (res.data.success) {
        // Invalidate reservations query to update the admin panel
        queryClient.invalidateQueries({ queryKey: ["reservations"] });

        if (storeData.whatsapp) {
          let message = `*Reservation Details*\n\n`;
          message += `*Name:* ${user.name}\n`;
          message += `*Phone:* ${user.phone}\n`;

          if (service) {
            message += `*Service:* ${service.name}\n`;
          }

          if (payload.tableNumber) {
            message += `*Table No:* ${payload.tableNumber}\n`;
          }
          if (payload.numberOfGuests) {
            message += `*No of Guests:* ${payload.numberOfGuests}\n`;
          }
          if (payload.date) {
            message += `*Date:* ${payload.date}\n`;
          }
          if (payload.time) {
            message += `*Time:* ${payload.time}\n`;
          }

          message += `\n*Please confirm my reservation.*`;

          const whatsappUrl = `https://wa.me/${
            storeData.phone
          }?text=${encodeURIComponent(message)}`;

          toast.success(res.data.message, {
            onAutoClose: () => {
              setLoading(false);
              window.location.href = whatsappUrl;
            },
          });
        } else {
          setLoading(false);
          toast.success(res.data.message);
          navigate(-1);
        }
      } else {
        setLoading(false);
        toast.error(res.data.message);
      }
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message || "Reservation failed");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate outlet selection first (if required)
    if (service?.outlet === "All Outlets" && storeData?.outlets && storeData.outlets.length > 1 && !formData.outlet) {
      toast.error("Please select an outlet to continue");
      return;
    }

    // Validate date
    if (!formData.date) {
      toast.error("Please select a date for your reservation");
      return;
    }

    // Validate time
    if (!formData.time) {
      toast.error("Please select a time for your reservation");
      return;
    }

    // Validate number of guests
    if (!formData.numberofGuests || formData.numberofGuests < 1) {
      toast.error("Please specify the number of guests");
      return;
    }

    setLoading(true);
    reservationMutation.mutate(formData);
  };

  const handleReserveClick = () => {
    setShowBookingForm(true);
  };

  // Generate available dates (current week)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Generate time slots
  const timeSlots = service?.needTimeSlots
    ? service.timeSlots
        ?.filter((slot) => {
          // Filter by outlet if service is "All Outlets" and user selected an outlet
          if (service?.outlet === "All Outlets" && formData.outlet) {
            return slot.outlet === formData.outlet;
          }
          // Filter by outlet if service has a specific outlet
          if (service?.outlet && service.outlet !== "All Outlets") {
            return slot.outlet === service.outlet;
          }
          return true;
        })
        ?.filter((slot) => {
          // Filter out fully booked slots
          const reservationCount =
            reservationsData?.filter((reservation) => {
              const sameDate = reservation.date.split("T")[0] === formData.date;
              const sameTime = reservation.time === slot.time;
              const sameOutlet = formData.outlet
                ? reservation.outlet === formData.outlet
                : reservation.outlet === service?.outlet;
              return sameDate && sameTime && sameOutlet;
            }).length || 0;
          return reservationCount < slot.numberOfSlots;
        })
        ?.map((slot) => slot.time) || []
    : ["17:00", "18:00", "19:00", "20:00", "21:00"];

  // Format time for display (e.g., "17:00" -> "5:00 PM")
  const formatTimeDisplay = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Guest count options
  const guestOptions = ["1 - 2", "3 - 4", "5", "6", "7", "8+"];

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const formatDateDisplay = (date) => {
    return date.getDate();
  };

  const formatDayOfWeek = (date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
  };

  const formatMonthName = (date) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months[date.getMonth()];
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleNoteDialogOpen = () => {
    setShowNoteDialog(true);
  };

  const handleNoteDialogClose = () => {
    setShowNoteDialog(false);
  };

  const handleNoteSave = (note) => {
    setFormData((prev) => ({ ...prev, note }));
    setShowNoteDialog(false);
  };

  const handleCustomTimeOpen = () => {
    setShowCustomTimeDialog(true);
  };

  const handleCustomTimeClose = () => {
    setShowCustomTimeDialog(false);
    setCustomTime("");
  };

  const handleCustomTimeSave = () => {
    if (customTime) {
      setFormData((prev) => ({ ...prev, time: customTime }));
      setShowCustomTimeDialog(false);
      setCustomTime("");
    } else {
      toast.error("Please enter a time");
    }
  };

  const handleCallManager = () => {
    if (storeData?.phone) {
      window.location.href = `tel:${storeData.phone}`;
    }
  };

  const handleViewWebsite = () => {
    if (storeData?.website) {
      window.open(storeData.website, "_blank");
    }
  };

  const handleGoToMaps = () => {
    if (storeData?.address) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        storeData.address
      )}`;
      window.open(mapsUrl, "_blank");
    }
  };

  if (!service) {
    navigate(-1);
    return null;
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {loading && <LoadingSpinner />}

      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={onBackClick}
          className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <svg
            className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {!showBookingForm ? (
        <>
          {/* 2nd page */}
          {/* Service Name and Rating */}
          <div className="px-6 mb-6 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800 font-poppins">
              {service.name}
            </h1>
            {service.rating && (
              <span className="text-2xl font-semibold text-seagreen-100 font-poppins">
                {service.rating}
              </span>
            )}
          </div>

          {/* Service Image */}
          <div className="px-6 mb-6">
            <div className="w-full h-72 rounded-3xl overflow-hidden bg-gray-200">
              {service.images && service.images.length > 0 ? (
                <img
                  className="w-full h-full object-cover"
                  alt={service.name}
                  src={service.images[0]}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder-service.png";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {service.description && (
            <div className="px-6 mb-6">
              <p className="text-gray-600 font-poppins text-sm text-base leading-relaxed">
                {service.description}
              </p>
            </div>
          )}

          {/* Outlet Info and Action Buttons */}
          {service?.outlet && service?.outlet !== "All Outlets" && (
            <div className="px-6 mb-6">
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    className="w-5 h-5 text-seagreen-100"
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
                  <h2 className="text-sm font-bold text-gray-800 font-poppins">
                    {service.outlet}
                  </h2>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-around gap-4">
                  <button
                    onClick={() =>
                      selectedOutlet?.phone &&
                      (window.location.href = `tel:${selectedOutlet.phone}`)
                    }
                    disabled={!selectedOutlet?.phone}
                    className={`flex flex-col items-center gap-2 transition-colors ${
                      selectedOutlet?.phone
                        ? "text-gray-600 hover:text-seagreen-100 cursor-pointer"
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
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
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-poppins">Call outlet</span>
                  </button>

                  <button
                    onClick={() =>
                      selectedOutlet?.mapLink &&
                      window.open(selectedOutlet.mapLink, "_blank")
                    }
                    disabled={!selectedOutlet?.mapLink}
                    className={`flex flex-col items-center gap-2 transition-colors ${
                      selectedOutlet?.mapLink
                        ? "text-gray-600 hover:text-seagreen-100 cursor-pointer"
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-poppins">Go to maps</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Outlet Selection - For All Outlets services */}
          {service?.outlet === "All Outlets" && storeData?.outlets && storeData.outlets.length > 1 && (
            <div className="px-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 font-poppins mb-4">
                Select Outlet
              </h2>
              <select
                name="outlet"
                value={formData.outlet || ""}
                onChange={handleChange}
                className="w-full bg-gray-100 rounded-2xl py-4 px-5 text-base font-poppins outline-none border-2 border-transparent focus:border-seagreen-100 transition-colors"
              >
                <option value="">Select an outlet</option>
                {storeData?.outlets?.map((outlet) => (
                  <option key={outlet._id} value={outlet.location}>
                    {outlet.location}
                  </option>
                ))}
              </select>

              {/* Action Buttons - Show after outlet is selected */}
              {selectedOutlet && (
                <div className="mt-4 bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg
                      className="w-5 h-5 text-seagreen-100"
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
                    <h3 className="text-lg font-bold text-gray-800 font-poppins">
                      {selectedOutlet.location}
                    </h3>
                  </div>

                  <div className="flex items-center justify-around gap-4">
                    <button
                      onClick={() =>
                        selectedOutlet?.phone &&
                        (window.location.href = `tel:${selectedOutlet.phone}`)
                      }
                      disabled={!selectedOutlet?.phone}
                      className={`flex flex-col items-center gap-2 transition-colors ${
                        selectedOutlet?.phone
                          ? "text-gray-600 hover:text-seagreen-100 cursor-pointer"
                          : "text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
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
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <span className="text-xs font-poppins">Call outlet</span>
                    </button>

                    <button
                      onClick={() =>
                        selectedOutlet?.mapLink &&
                        window.open(selectedOutlet.mapLink, "_blank")
                      }
                      disabled={!selectedOutlet?.mapLink}
                      className={`flex flex-col items-center gap-2 transition-colors ${
                        selectedOutlet?.mapLink
                          ? "text-gray-600 hover:text-seagreen-100 cursor-pointer"
                          : "text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
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
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <span className="text-xs font-poppins">Go to maps</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reserve Button */}
          <div className="px-6">
            <button
              onClick={handleReserveClick}
              style={{ backgroundColor: storeData?.loyaltyCard?.cardColor }}
              className="w-full bg-seagreen-100 text-white py-2 rounded-3xl font-poppins text-md font-semibold hover:bg-seagreen-200 transition-all shadow-lg"
            >
              Reserve
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Booking Form */}
          <div className="px-6">
            {/* Outlet Selection - Only show if service is for All Outlets and store has multiple outlets */}
            {service?.outlet === "All Outlets" && storeData?.outlets && storeData.outlets.length > 1 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-800 font-poppins mb-4">
                  Select Outlet
                </h2>
                <select
                  name="outlet"
                  value={formData.outlet || ""}
                  onChange={handleChange}
                  className="w-full bg-gray-100 rounded-2xl py-4 px-5 text-base font-poppins outline-none border-2 border-transparent focus:border-seagreen-100 transition-colors"
                  required
                >
                  <option value="">Select an outlet</option>
                  {storeData?.outlets?.map((outlet) => (
                    <option key={outlet._id} value={outlet.location}>
                      {outlet.location}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800 font-poppins">
                    Select Date
                  </h2>
                  {formData.date && (
                    <p className="text-xs text-gray-500 font-poppins mt-1">
                      Selected:{" "}
                      {new Date(formData.date + "T00:00:00").toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  )}
                </div>
                {/* Calendar Icon */}
                <button
                  onClick={() => setShowCalendarDialog(true)}
                  style={{ backgroundColor: storeData?.loyaltyCard?.cardColor }}
                  className="w-10 h-10 rounded-xl bg-seagreen-100 flex items-center justify-center hover:bg-seagreen-200 transition-all"
                >
                  <svg
                    className="w-5 h-5 text-white"
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
                </button>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {getAvailableDates().map((date, index) => {
                  const dateStr = formatDate(date);
                  const isSelected = formData.date === dateStr;
                  const isTodayDate = isToday(date);
                  return (
                    <button
                      key={index}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          date: dateStr,
                          time: "",
                        }))
                      }
                      style={
                        isSelected
                          ? { backgroundColor: storeData?.loyaltyCard?.cardColor }
                          : {}
                      }
                      className={`relative flex flex-col items-center justify-center py-4 rounded-xl transition-all ${
                        isSelected
                          ? "text-white shadow-lg scale-105"
                          : "bg-white border-2 border-gray-200 text-gray-700 hover:border-seagreen-100 hover:shadow-md"
                      }`}
                    >
                      {isTodayDate && !isSelected && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-seagreen-100 rounded-full"></span>
                      )}
                      <span
                        className={`text-xs font-medium font-poppins mb-1 ${
                          isSelected ? "text-white opacity-90" : "text-gray-500"
                        }`}
                      >
                        {formatDayOfWeek(date)}
                      </span>
                      <span
                        className={`text-xl font-bold font-poppins ${
                          isSelected ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {formatDateDisplay(date)}
                      </span>
                      <span
                        className={`text-[10px] font-medium font-poppins mt-0.5 ${
                          isSelected ? "text-white opacity-80" : "text-gray-400"
                        }`}
                      >
                        {formatMonthName(date)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Selection */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 font-poppins mb-4">
                Time
              </h2>
              {service?.outlet === "All Outlets" && !formData.outlet ? (
                <p className="text-gray-500 font-poppins">
                  Please select an outlet first
                </p>
              ) : timeSlots.length === 0 && service?.needTimeSlots ? (
                <p className="text-gray-500 font-poppins">
                  No available time slots for this date
                </p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {timeSlots.map((time, index) => {
                    const isSelected = formData.time === time;
                    return (
                      <button
                        key={index}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, time }))
                        }
                        style={
                          isSelected
                            ? { backgroundColor: storeData?.loyaltyCard?.cardColor }
                            : {}
                        }
                        className={`py-3 px-6 rounded-2xl font-poppins text-sm transition-all ${
                          isSelected
                            ? "text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {formatTimeDisplay(time)}
                      </button>
                    );
                  })}

                  {/* Custom Time Button - Only show if needTimeSlots is false */}
                  {!service?.needTimeSlots && (
                    <button
                      onClick={handleCustomTimeOpen}
                      style={
                        formData.time && !timeSlots.includes(formData.time)
                          ? { backgroundColor: storeData?.loyaltyCard?.cardColor }
                          : {}
                      }
                      className={`py-3 px-6 rounded-2xl font-poppins text-base transition-all border-2 border-dashed ${
                        formData.time && !timeSlots.includes(formData.time)
                          ? "text-white border-seagreen-100"
                          : "bg-white text-gray-600 border-gray-300 hover:border-seagreen-100 hover:text-seagreen-100"
                      }`}
                    >
                      {formData.time && !timeSlots.includes(formData.time)
                        ? formatTimeDisplay(formData.time)
                        : "+ Custom Time"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Number of Guests - for all store types */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 font-poppins mb-4">
                Number of people
              </h2>
              <div className="flex items-center gap-3 max-w-xs">
                {/* Decrease Button */}
                <button
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      numberofGuests: Math.max(1, prev.numberofGuests - 1),
                    }))
                  }
                  disabled={formData.numberofGuests <= 1}
                  className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center text-md font-bold text-gray-700 hover:bg-gray-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  −
                </button>

                {/* Number Display */}
                <div className="flex-1 h-10 bg-gray-200 text-gray-800 rounded-xl py-2 px-4 text-center">
                  <span className="text-lg font-bold font-poppins">
                    {formData.numberofGuests}
                  </span>
                </div>

                {/* Increase Button */}
                <button
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      numberofGuests: prev.numberofGuests + 1,
                    }))
                  }
                  style={{ backgroundColor: storeData?.loyaltyCard?.cardColor }}
                  className="w-10 h-10 rounded-xl bg-seagreen-100 flex items-center justify-center text-md font-bold text-white hover:bg-seagreen-200 transition-all"
                >
                  +
                </button>
              </div>
            </div>

            {/* Extra Note Checkbox */}
            <div className="mb-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!formData.note}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleNoteDialogOpen();
                    } else {
                      setFormData((prev) => ({ ...prev, note: "" }));
                    }
                  }}
                  className="w-3 h-3 rounded border-gray-300 text-seagreen-100 focus:ring-seagreen-100 cursor-pointer"
                />
                <span className="text-sm font-poppins text-gray-700">
                  Add extra note{" "}
                  {formData.note && `(${formData.note.length} characters)`}
                </span>
              </label>
              {formData.note && (
                <div className="mt-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-gray-700 font-poppins flex-1 break-words">
                      {formData.note}
                    </p>
                    <button
                      onClick={handleNoteDialogOpen}
                      className="hover:opacity-80 transition-opacity flex-shrink-0"
                      title="Edit note"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        style={{ color: storeData?.loyaltyCard?.cardColor }}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Deposit Info and Confirm Button */}
            <div className="flex items-center justify-between mt-10">
              <div className="text-xl font-bold text-gray-800 font-poppins">
                {service.price ? `Price: रू ${service.price}` : "Reserve Now"}
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ backgroundColor: storeData?.loyaltyCard?.cardColor }}
                className="bg-seagreen-100 text-white p-3 rounded-2xl hover:bg-seagreen-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Note Dialog */}
      {showNoteDialog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleNoteDialogClose}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 font-poppins">
                Add Extra Note
              </h3>
              <button
                onClick={handleNoteDialogClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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

            <textarea
              value={formData.note}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, note: e.target.value }))
              }
              placeholder="Add any special requests or notes here..."
              className="w-full h-32 border-gray-200 text-base font-poppins border-[1px] border-solid bg-gray-100 rounded-2xl box-border p-4 outline-none resize-none"
              maxLength={500}
            />

            <div className="flex justify-between items-center mt-2 mb-4">
              <span className="text-sm text-gray-500 font-poppins">
                {formData.note.length}/500 characters
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleNoteDialogClose}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-poppins font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleNoteSave(formData.note)}
                style={{ backgroundColor: storeData?.loyaltyCard?.cardColor }}
                className="flex-1 py-3 rounded-2xl bg-seagreen-100 text-white font-poppins font-semibold hover:bg-seagreen-200 transition-all"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Time Dialog */}
      {showCustomTimeDialog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCustomTimeClose}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 font-poppins">
                Enter Custom Time
              </h3>
              <button
                onClick={handleCustomTimeClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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

            <p className="text-sm text-gray-600 font-poppins mb-4">
              Please enter your preferred time in 24-hour format (HH:MM)
            </p>

            <input
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="w-full border-gray-200 text-base font-poppins border-[1px] border-solid bg-gray-100 rounded-2xl box-border h-[50px] px-4 outline-none"
              placeholder="HH:MM"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCustomTimeClose}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-poppins font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomTimeSave}
                style={{ backgroundColor: storeData?.loyaltyCard?.cardColor }}
                className="flex-1 py-3 rounded-2xl bg-seagreen-100 text-white font-poppins font-semibold hover:bg-seagreen-200 transition-all"
              >
                Set Time
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Dialog */}
      {showCalendarDialog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCalendarDialog(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 font-poppins">
                Select Date
              </h3>
              <button
                onClick={() => setShowCalendarDialog(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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

            <input
              type="date"
              value={formData.date}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  date: e.target.value,
                  time: "",
                }));
              }}
              min={new Date().toISOString().split("T")[0]}
              className="w-full border-gray-200 text-base font-poppins border-[1px] border-solid bg-gray-100 rounded-2xl box-border h-[50px] px-4 outline-none"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCalendarDialog(false)}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-poppins font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCalendarDialog(false)}
                style={{ backgroundColor: storeData?.loyaltyCard?.cardColor }}
                className="flex-1 py-3 rounded-2xl bg-seagreen-100 text-white font-poppins font-semibold hover:bg-seagreen-200 transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationForm;
