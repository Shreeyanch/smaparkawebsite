import { useState, useCallback, useEffect } from "react";
import api from "../../api/config";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useStoreAuth } from "../../context/StoreAuthContext";
import PoweredBySamparkaFooter from "../../components/PoweredBySamparkaFooter";

const ReservationHistory = ({ embedded = false, showPoweredBy = false }) => {
  const [isQrTogglePopupOpen, setQrTogglePopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const { authState, updateAuth, logout } = useStoreAuth();
  const { userInfo: user, token } = authState;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) {
      navigate("/register");
    }
  }, [user, token, navigate]);

  const getMyReservations = async () => {
    try {
      const response = await api.get("/customer/getReservations", {
        headers: { token },
      });
      if (response.data.success) {
        setReservations(response.data.reservations);

        const statuses = response.data.reservations.map((reservation) => {
          switch (reservation.status) {
            case "pending":
              return "Pending Approval";
            case "confirmed":
              return "Reservation Confirmed";
            case "cancelled":
              return "Reservation Cancelled";
            case "noShow":
              return "No Show";
            default:
              return "Unknown Status";
          }
        });
        setStatuses(statuses);
      }
    } catch (error) {
      toast.error(error.message, {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMyReservations();
    const scrollAnimElements = document.querySelectorAll(
      "[data-animate-on-scroll]"
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            const targetElement = entry.target;
            targetElement.classList.add("animate");
            observer.unobserve(targetElement);
          }
        }
      },
      {
        threshold: 0.15,
      }
    );
    for (let i = 0; i < scrollAnimElements.length; i++) {
      observer.observe(scrollAnimElements[i]);
    }

    return () => {
      for (let i = 0; i < scrollAnimElements.length; i++) {
        observer.unobserve(scrollAnimElements[i]);
      }
    };
  }, []);

  const onBackClick = useCallback(() => {
    navigate("/profile");
  }, []);

  // const filteredReservations = reservations.filter(
  //   (reservation) =>
  //     Array.isArray(reservation.services) &&
  //     reservation.services.some((service) =>
  //       service.toLowerCase().includes(searchQuery.toLowerCase())
  //     )
  // );

  const handleCancelReservation = async (reservationId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this reservation?"
    );
    if (!confirmCancel) return;

    try {
      const res = await api.put(`/store/reservation/cancel/${reservationId}`);
      if (res.data.success) {
        toast.success("Reservation cancelled successfully!");
        // Optionally refetch reservation data
        // queryClient.invalidateQueries(["reservations"]);
        getMyReservations();
      } else {
        toast.error(res.data.message || "Failed to cancel reservation.");
      }
    } catch (error) {
      toast.error("Error cancelling reservation.");
      console.error(error);
    }
  };

  return (
    <>
      {embedded ? (
        // Embedded view (inside tab)
        <div className="px-4 space-y-4">
          {/* Reservation List */}
          <div className="flex-1 space-y-4">
            {/* Search Bar */}
            {/* <div className="mb-6 pt-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reservations..."
                  className="w-full px-4 py-3 pl-10 bg-gray-100 rounded-lg border-0 text-sm font-medium text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                />
                <svg
                  className="absolute left-3 top-3.5 w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div> */}

            {/* Reservation List */}
            <div className="flex-1 space-y-4">
              {reservations
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((reservation) => (
                  <div
                    key={reservation._id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200"
                  >
                    {/* Header with title and status */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-sm text-gray-900 flex-1">
                        {reservation.services.join(", ")}
                      </h3>

                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-xs text-gray-600">
                          {reservation.status.charAt(0).toUpperCase() +
                            reservation.status.slice(1)}
                        </span>
                        <div
                          className={`w-3 h-3 rounded-full ${reservation.status === "expired"
                              ? "bg-gray-500"
                              : reservation.status === "claimed"
                                ? "bg-red-500"
                                : "bg-green-500"
                            }`}
                        ></div>
                      </div>
                    </div>

                    {reservation?.tableNumber && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">
                          Table No: {reservation.tableNumber}
                        </span>
                      </div>
                    )}
                    {reservation?.numberofGuests && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">
                          Number of Guests: {reservation.numberofGuests}
                        </span>
                      </div>
                    )}
                    {reservation?.outlet && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">
                          Outlet: {reservation.outlet}
                        </span>
                      </div>
                    )}

                    {/* Business and dates info */}
                    <div className="flex justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">
                          Reservation Date: {reservation.date.slice(0, 10)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Reservation Time: {reservation.time}
                        </p>
                      </div>
                      {reservation.status !== "cancelled" &&
                        new Date() <=
                        new Date(reservation.date).setDate(
                          new Date(reservation.date).getDate() + 1
                        ) && (
                          <span
                            className="flex text-xs gap-1 px-2 cursor-pointer rounded-2xl items-center bg-red-500 hover:bg-red-600 text-white"
                            onClick={() =>
                              handleCancelReservation(reservation._id)
                            }
                          >
                            <u>Cancel</u>
                          </span>
                        )}
                    </div>
                  </div>
                ))}

              {/* No Results */}
              {reservations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    No reservation found
                  </h3>
                  <p className="text-xs text-gray-500 text-center">
                    Try searching with different keywords or check back later
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Standalone view (full page)
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-full max-w-[480px] bg-white min-h-screen flex flex-col relative">
            {/* Header Section */}
            <div className="flex-none px-5 pt-8 pb-4">
              <div className="flex items-center justify-between">
                {/* Back Button */}
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

                {/* Page Title */}
                <h1 className="text-base sm:text-sm font-bold text-gray-900">
                  My Reservations
                </h1>

                {/* Empty space for symmetry */}
                <div className="w-8 h-8 sm:w-7 sm:h-7"></div>
              </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 flex flex-col px-5 pb-32 overflow-auto mt-10">
              {/* Reservation List */}
              <div className="flex-1 space-y-4">
                {reservations
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((reservation) => (
                    <div
                      key={reservation._id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200"
                    >
                      {/* Header with title and status */}
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-sm text-gray-900 flex-1">
                          {reservation.services.join(", ")}
                        </h3>

                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-xs text-gray-600">
                            {reservation.status.charAt(0).toUpperCase() +
                              reservation.status.slice(1)}
                          </span>
                          <div
                            className={`w-3 h-3 rounded-full ${reservation.status === "expired"
                                ? "bg-gray-500"
                                : reservation.status === "claimed"
                                  ? "bg-red-500"
                                  : "bg-green-500"
                              }`}
                          ></div>
                        </div>
                      </div>

                      {reservation?.tableNumber && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">
                            Table No: {reservation.tableNumber}
                          </span>
                        </div>
                      )}
                      {reservation?.numberofGuests && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">
                            Number of Guests: {reservation.numberofGuests}
                          </span>
                        </div>
                      )}
                      {reservation?.outlet && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">
                            Outlet: {reservation.outlet}
                          </span>
                        </div>
                      )}

                      {/* Business and dates info */}
                      <div className="flex justify-between">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">
                            Reservation Date: {reservation.date.slice(0, 10)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Reservation Time: {reservation.time}
                          </p>
                        </div>
                        {reservation.status !== "cancelled" &&
                          new Date() <=
                          new Date(reservation.date).setDate(
                            new Date(reservation.date).getDate() + 1
                          ) && (
                            <span
                              className="flex text-xs gap-1 px-2 cursor-pointer rounded-2xl items-center bg-red-500 hover:bg-red-600 text-white"
                              onClick={() =>
                                handleCancelReservation(reservation._id)
                              }
                            >
                              <u>Cancel</u>
                            </span>
                          )}
                      </div>
                    </div>
                  ))}

                {/* No Results */}
                {reservations.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      No reservation found
                    </h3>
                    <p className="text-xs text-gray-500 text-center">
                      Try searching with different keywords or check back later
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* footer */}
            {showPoweredBy && <PoweredBySamparkaFooter />}
          </div>
        </div>

      )}
    </>
  );
};

export default ReservationHistory;
