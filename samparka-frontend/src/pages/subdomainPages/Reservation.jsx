import { useState, useCallback, useEffect } from "react";
import FrameTell from "../../components/FrameTell";
import PortalPopup from "../../components/PortalPopup";
import { useNavigate } from "react-router-dom";
import api from "../../api/config";
import LoadingSpinner from "../../components/LoadingSpinner";
import LoadingSpinnerH from "../../components/LoadingSpinnerH.jsx";
import { useStoreAuth } from "../../context/StoreAuthContext";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import PoweredBySamparka from "../../components/PoweredBySamparka";
import ReservationHistory from "./ReservationHistory";

const Reservation = (subdomain) => {
  const [isFrameTellPopupOpen, setFrameTellPopupOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedService, setSelectedService] = useState(null);
  const [activeTab, setActiveTab] = useState("services");
  const { authState } = useStoreAuth();
  const { userInfo: user, token } = authState;
  const queryClient = useQueryClient();
  const { storeData } = queryClient.getQueryData(["store"]) || {};
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !storeData?.services?.reservation) navigate("/");
  }, [token]);

  const openFrameTellPopup = useCallback(() => setFrameTellPopupOpen(true), []);
  const closeFrameTellPopup = useCallback(
    () => setFrameTellPopupOpen(false),
    []
  );
  const onBackClick = useCallback(() => navigate("/loyality"), [navigate]);
  const onProfileClick = useCallback(() => navigate("/profile"), [navigate]);

  const { data: reservationSetting } = useQuery({
    queryKey: ["reservationSettings", storeData._id],
    queryFn: async () => {
      const res = await api.get(
        `/customer/reservation-settings?store=${storeData._id}`,
        { headers: { token } }
      );
      return res.data;
    },
    enabled: !!storeData._id,
    retry: false,
  });

  // Fetch outlets to get full outlet data
  const { data: outletsData } = useQuery({
    queryKey: ["outlets", storeData._id],
    queryFn: async () => {
      const res = await api.get(`/store/getOutlets/${storeData._id}`);
      
      return res.data.outlets || [];
    },
    enabled: !!storeData._id && !!storeData?.services?.multipleOutlets,
    retry: false,
  });

  // Get services array from reservation settings
  const services = reservationSetting?.services || [];

  // Get unique categories from all services
  const categories =
    services.length > 0
      ? ["All", ...new Set(services.map((s) => s.category || "Other"))]
      : ["All"];

  // Filter services based on search and category
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleServiceClick = (service) => {
    setSelectedService(service);
    // Find the full outlet object based on service.outlet
    const outletObject = outletsData?.find(
      (o) => o.location === service.outlet
    );
    navigate("/reservationForm", {
      state: { service, reservationSetting, selectedOutlet: outletObject },
    });
  };

  const serviceOptions =
    reservationSetting?.services?.map((service) => ({
      value: service.name,
      label: service.name,
    })) || [];

  if (!storeData)
    return subdomain == "himalayanjavaexpress" ? (
      <LoadingSpinnerH />
    ) : (
      <>
        <LoadingSpinner />
        <PoweredBySamparka />
      </>
    );

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header with back button and user avatar */}
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

        <div 
          onClick={onProfileClick}
          className="relative cursor-pointer transition-transform hover:scale-105"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="px-4 mb-6">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab("services")}
            style={
              activeTab === "services"
                ? { backgroundColor: storeData?.loyaltyCard?.cardColor }
                : {}
            }
            className={`flex-1 py-3 rounded-xl font-poppins text-sm font-semibold transition-all ${
              activeTab === "services"
                ? "text-white shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Services
          </button>
          <button
            onClick={() => setActiveTab("reservations")}
            style={
              activeTab === "reservations"
                ? { backgroundColor: storeData?.loyaltyCard?.cardColor }
                : {}
            }
            className={`flex-1 py-3 rounded-xl font-poppins text-sm font-semibold transition-all ${
              activeTab === "reservations"
                ? "text-white shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            My Reservations
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {activeTab === "services" && (
        <div className="px-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 rounded-2xl py-4 px-5 pr-16 text-base font-poppins outline-none"
            />
            <button
              style={{ backgroundColor: storeData.loyaltyCard.cardColor }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-seagreen-100 rounded-2xl p-3"
            >
              <svg
                className="w-6 h-6 text-white"
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
            </button>
          </div>
        </div>
      )}

      {/* Category Filters */}
      {activeTab === "services" && (
        <div className="px-4 mb-6">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 whitespace-nowrap font-poppins text-sm transition-all ${
                  selectedCategory === category
                    ? "text-black font-semibold border-b-2 border-black"
                    : "text-gray-400 font-normal"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Service List */}
      {activeTab === "services" && (
        <div className="px-4 space-y-4">
        {filteredServices.length > 0 ? (
          filteredServices.map((service, index) => (
            <div
              key={index}
              onClick={() => handleServiceClick(service)}
              className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-all"
            >
              {/* Service Image */}
              <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-200">
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
                      className="w-12 h-12 text-gray-400"
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

              {/* Service Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-black font-poppins truncate flex-1">
                    {service.name}
                  </h3>
                  {service.outlet && service.outlet !== storeData?.name && (
                    <span className="px-2 py-1 text-xs font-medium bg-seagreen-100 text-white rounded-full whitespace-nowrap flex-shrink-0">
                      {service.outlet}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-poppins mb-2 line-clamp-2">
                  {service.description || "No description available"}
                </p>
                {service.price && (
                  <p className="text-md font-bold text-black font-poppins">
                    रू {service.price}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 font-poppins text-base">
              No services available
            </p>
          </div>
        )}
        </div>
      )}

      {/* Reservations History */}
      {activeTab === "reservations" && (
        <ReservationHistory embedded={true} />
      )}

      {isFrameTellPopupOpen && (
        <PortalPopup
          overlayColor="rgba(113, 113, 113, 0.9)"
          placement="Centered"
          onOutsideClick={closeFrameTellPopup}
        >
          <FrameTell image={selectedImage} onClose={closeFrameTellPopup} />
        </PortalPopup>
      )}
    </div>
  );
};

export default Reservation;
