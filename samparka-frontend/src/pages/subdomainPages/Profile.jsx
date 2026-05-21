import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStoreAuth } from "../../context/StoreAuthContext";
import api from "../../api/config";
import {
  BellRing,
  Gift,
  LogOut,
  UserRound,
  CalendarDays,
  Gem,
  History,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PoweredBySamparkaFooter from "../../components/PoweredBySamparkaFooter";

const fetchOffers = async (token, storeId) => {
  if (!token) {
    throw new Error("Token Not Provided");
  }

  try {
    const response = await api.get(`/customer/offers/${storeId}`, {
      headers: {
        token,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch offers");
  }
};

const Profile = () => {
  const queryClient = useQueryClient();
  const { storeData } = queryClient.getQueryData(["store"]);
  const { authState, updateAuth, logout } = useStoreAuth();
  const { userInfo: user, token } = authState;
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const offerViewedDate = localStorage.getItem("offerViewedDate")
    ? new Date(localStorage.getItem("offerViewedDate"))
    : new Date("1900");

  useEffect(() => {
    if (!user || !token) {
      navigate("/register");
    }
  }, [user, token, navigate]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get(
          `/customer/customer-notifications/${user._id}`,
          { headers: { token } }
        );
        // const data = await response.json();
        setNotifications(response.data);
      } catch (err) {
        console.error("Error fetching customer notifications:", err);
      }
    };

    fetchNotifications();
  }, [token, user._id]);

  const { data: onGoingOffers } = useQuery({
    queryKey: ["On Going Offers"],
    queryFn: () => fetchOffers(token, storeData._id),
    enabled: !!token && !!storeData._id,
  });

  const [isQrTogglePopupOpen, setQrTogglePopupOpen] = useState(false);

  const openQrTogglePopup = useCallback(() => {
    setQrTogglePopupOpen(true);
  }, []);

  const closeQrTogglePopup = useCallback(() => {
    setQrTogglePopupOpen(false);
  }, []);

  const onBackClick = useCallback(() => {
    navigate("/loyality");
    // window.location.href = '/loyality'; // or however you want to navigate back
  }, []);

  const onLinkGoToProfileSettingsClick = useCallback(() => {
    navigate("/ProfileSetting");
    // window.location.href = "/ProfileSetting"; // or however you want to navigate to profile settings
  }, []);

  const onLinkGoToRewardsClick = useCallback(() => {
    navigate("/myRewards");
  }, []);

  const onLinkGoToColltableStampClick = useCallback(() => {
    navigate("/collectablestamps");
  }, []);

  const menuSections = [
    {
      items: [
        {
          icon: UserRound,
          label: "Profile",
          action: onLinkGoToProfileSettingsClick,
          hasArrow: true,
        },
        {
          icon: BellRing,
          label: "Notifications",
          action: navigate.bind(null, "/notifications"),
          hasArrow: true,
        },
        {
          icon: History,
          label: "Point History",
          action: navigate.bind(null, "/pointHistory"),
          hasArrow: true,
        },
        // storeData?.services?.onGoingOffers && {
        //   icon: Gem,
        //   label: "Offers",
        //   action: navigate.bind(null, "/offers"),
        //   hasArrow: true,
        // },
        {
          icon: Gift,
          label: "Reward History",
          action: onLinkGoToRewardsClick,
          hasArrow: true,
        },
        storeData?.services?.reservation && {
          icon: CalendarDays,
          label: "Reservation History",
          action: navigate.bind(null, "/myReservations"),
          hasArrow: true,
        },
        {
          icon: LogOut,
          label: "Logout",
          action: logout,
          hasArrow: false,
          isDestructive: true,
        },
      ].filter(Boolean), // ✅ removes false, null, or undefined items
    },
  ];

  const unseenNotifications = notifications.filter((n) => !n.read);
  const [unViewedOffers, setUnViewedOffers] = useState([]);
  useEffect(() => {
    // Filter offers updated after the viewed date
    if (onGoingOffers?.length > 0) {
      setUnViewedOffers(
        onGoingOffers.filter(
          (offer) => new Date(offer.updatedAt) > offerViewedDate
        )
      );
    }
  }, [onGoingOffers]);

  return (
    <>
      <div className="min-h-screen w-full bg-white overflow-hidden">
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-full max-w-[480px] bg-white min-h-screen flex flex-col relative">
            {/* Header Section - Same as Loyalty */}
            <div className="flex-none px-5 pt-8 pb-4">
              <div className="flex items-center justify-between">
                {/* Back Button */}
                <div className="flex-1">
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
                </div>
              </div>
            </div>

            {/* Main Content - Scrollable - Same structure as Loyalty */}
            <div className="flex-1 flex flex-col px-5  overflow-hidden">
              {/* Profile Logo/Brand Image - Same positioning as Loyalty */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg transition-all duration-500 transform">
                    <div className="w-16 h-16 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center">
                      <span className="text-lg sm:text-base font-bold text-gray-700">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Info - Centered like logo */}
              <div className="flex flex-col items-center mb-8">
                <h1 className="text-base sm:text-sm font-bold text-gray-900 leading-tight">
                  {user?.name || "User Name"}
                </h1>
              </div>

              {/* Menu Sections - Same flex structure as Loyalty cards */}
              <div className="flex-1 flex flex-col max-w-full">
                <div className="space-y-6">
                  {menuSections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="space-y-3">
                      {/* Section Title */}
                      <h2 className="text-sm leading-5 font-bold text-gray-900 px-1">
                        {section.title}
                      </h2>

                      {/* Menu Items */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {section.items.map((item, itemIndex) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={itemIndex}
                              onClick={item.action}
                              className={`w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors ${
                                itemIndex !== section.items.length - 1
                                  ? "border-b border-gray-100"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Icon + Notification Dot */}
                                <div className="w-8 h-8 flex items-center justify-center relative">
                                  <Icon
                                    size={20}
                                    className="transition-all duration-300"
                                  />
                                  {item.label === "Notifications" &&
                                    unseenNotifications.length > 0 && (
                                      <span className="absolute top-1 right-1 block w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white" />
                                    )}
                                  {item.label === "Offers" &&
                                    unViewedOffers.length > 0 && (
                                      <span className="absolute top-1 right-1 block w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white" />
                                    )}
                                </div>

                                {/* Label */}
                                <span
                                  className={`text-sm leading-5 font-medium ${
                                    item.isDestructive
                                      ? "text-red-600"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {item.label}
                                </span>
                              </div>

                              {/* Arrow */}
                              {item.hasArrow && (
                                <div className="flex items-center justify-center relative">
                                  <svg
                                    className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                  {item.label === "Notifications" &&
                                    unseenNotifications.length > 0 && (
                                      <span className="absolute top-1 right-1 block w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white" />
                                    )}
                                  {item.label === "Offers" &&
                                    unViewedOffers.length > 0 && (
                                      <span className="absolute top-1 right-1 block w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white" />
                                    )}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* powered by samparka */}
        {storeData.services.powered && (
          <PoweredBySamparkaFooter/>
        )}
          </div>
        </div>
      </div>

      {/* QR Toggle Popup - Same overlay style as Loyalty */}
      {isQrTogglePopupOpen && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={closeQrTogglePopup}
        >
          <div
            className="bg-white rounded-2xl p-6 m-4 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01m4.01 0V8M12 8V4m0 0H8m4 0h4"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">QR Code Scanner</h2>
              <p className="text-gray-600 mb-6">
                Scan QR codes to earn points and rewards at participating
                stores.
              </p>
              <button
                onClick={closeQrTogglePopup}
                className="w-full px-4 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-900 transition-colors"
              >
                Open Scanner
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
