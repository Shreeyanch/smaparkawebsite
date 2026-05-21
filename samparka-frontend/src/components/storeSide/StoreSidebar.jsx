import React, { useState, useEffect } from "react";
import { ensurePushSubscription, cachePushEndpoint, clearPushEndpoint } from "../../utils/pushSubscription";
import {
  Home,
  UserPlus,
  Gift,
  Menu,
  X,
  Users,
  History,
  CalendarCheck2,
  Sun,
  Moon,
  BellRing,
  BellOff,
  Activity,
  Receipt,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../../context/ThemeContext";
import api from "../../api/config.js";
import { Button } from "@mui/material";

const StoreSidebar = (store) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingRewardsCount, setPendingRewardsCount] = useState(0);
  const location = useLocation();
  const queryClient = useQueryClient();
  const { storeData } = queryClient.getQueryData(["store"]) || {
    storeData: store.store,
  };

  useEffect(() => {
    const checkNotificationPermission = async () => {
      if (!("Notification" in window)) {
        setNotificationPermission(false);
        return;
      }
      const permission = Notification.permission;

      if (permission !== "granted") {
        setNotificationPermission(false);
        return;
      }

      try {
        const res = await api.get(`/checkSub/${storeData._id}`);
        setNotificationPermission(res.data);
      } catch (err) {
        console.error("Failed to fetch notification subscription:", err);
        setNotificationPermission(false);
      }
    };

    if (storeData?._id) {
      checkNotificationPermission();
    }
  }, [storeData?._id]);

  // Silently re-register push subscription with backend if the endpoint changed
  // (e.g. after a service worker update). No user interaction required.
  useEffect(() => {
    if (storeData?._id && "Notification" in window && Notification.permission === "granted") {
      ensurePushSubscription(storeData._id);
    }
  }, [storeData?._id]);

  useEffect(() => {
    const url = storeData?.url || store?.store?.url;
    if (!url) return;
    api
      .get(`/store/getRedeemedRewards/${url}`)
      .then((res) => {
        if (res.data.success) {
          const count = res.data.redeemedRewards.filter(
            (r) => r.status === "pending"
          ).length;
          setPendingRewardsCount(count);
        }
      })
      .catch(() => {});
  }, [storeData?.url, store?.store?.url]);

  // Listen for SUBSCRIPTION_CHANGED messages from the service worker
  useEffect(() => {
    if (!navigator.serviceWorker) return;
    const handler = (event) => {
      if (event.data?.type === "SUBSCRIPTION_CHANGED" && storeData?._id) {
        ensurePushSubscription(storeData._id);
      }
    };
    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, [storeData?._id]);

  const toggleNotification = () => {
    // Perform the action based on the toggle state
    if (notificationPermission) {
      removeNotification(); // Call the removeNotification function
    } else {
      showNotification(); // Call the showNotification function
    }
  };

  const showNotification = async () => {
    if (!("Notification" in window)) {
      toast.info("This browser does not support notifications.");
      return;
    }
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.info("Please go to settings and enable notifications.");
        return;
      }
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        toast.error("Service worker not found.");
        return;
      }
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          "BNOFxo-K_WdOwjUVeBqxg4T-9OMCLsdC4PkV49pDPufEC9v-gAcKdXs_6FN7zQoea6hTQH5Ny7zpkoAkJ4cy0gU",
      });

      const userId = storeData._id;
      await api.post(
        "/subscribe",
        { userId, subscription },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      cachePushEndpoint(userId, subscription);
      setNotificationPermission(true);
      toast.success("Notifications enabled successfully!");
    } catch (error) {
      console.error("Error subscribing to notifications:", error);
      toast.error("Failed to subscribe to notifications.");
    } finally {
      setLoading(false);
    }
  };

  const removeNotification = async () => {
    setLoading(true);
    try {
      const userId = storeData._id;
      await api.delete(
        `/unsubscribe/${userId}`,
        { userId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      clearPushEndpoint(userId);
      setNotificationPermission(false);
      toast.success("Notifications disabled successfully!");
    } catch (error) {
      console.error("Error unsubscribing to notifications:", error);
      toast.error("Failed to unsubscribe to notifications.");
    } finally {
      setLoading(false);
    }
  };

  // Function to check if a navigation item is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Function to get navigation item classes based on active state
  const getNavItemClasses = (path) => {
    const baseClasses = `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
      isDarkMode ? "text-gray-300" : "text-gray-700"
    }`;
    if (isActive(path)) {
      return `${baseClasses} bg-green-600 text-white`;
    }
    return `${baseClasses} ${
      isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
    }`;
  };

  // Function to handle mobile navigation click
  const handleMobileNavClick = () => {
    if (window.innerWidth < 1024) {
      // lg breakpoint
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Header Bar (Visible on Small and Medium Screens) */}
      {!isOpen && (
        <div
          className={`lg:hidden sticky top-0 left-0 right-0 z-50 border-b shadow-sm ${
            isDarkMode ? "bg-gray-900 border-gray-700" : "bg-green-600"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo and Store Name */}
            <div className="flex items-center space-x-3">
              <img
                src={store.store.logo}
                alt={store.store.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
              />
              <div>
                <span className="text-white font-semibold text-sm">
                  {store.store.name}
                </span>
                <p className="text-gray-200 text-xs">Store Dashboard</p>
              </div>
            </div>

            {/* Right side icons */}
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <Button
                className="hover:scale-110 cursor-pointer transition-all"
                onClick={toggleNotification}
                disabled={loading}
                sx={{ minWidth: "auto", padding: "8px", borderRadius: "8px" }}
              >
                {notificationPermission ? (
                  <BellRing size={20} className="text-white" />
                ) : (
                  <BellOff size={20} className="text-white" />
                )}
              </Button>

              {/* Hamburger Menu Button */}
              <button
                className={`p-2 rounded-lg focus:outline-none focus:ring-1 transition-colors ${
                  isDarkMode
                    ? "text-gray-300 hover:bg-gray-800 focus:ring-gray-600"
                    : "text-white hover:bg-gray-800 focus:ring-gray-300"
                }`}
                onClick={() => setIsOpen(!isOpen)}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 z-[999] w-64 ${
          isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-200"
        } border-r shadow-sm transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:top-0 lg:h-screen ${
          isOpen ? "top-0 h-screen" : "top-[60px] h-[calc(100vh-60px)]"
        }`}
        aria-label="Sidebar"
      >
        <div className="h-full flex flex-col">
          {/* Header - Show on mobile when menu is open, always show on desktop */}
          <div
            className={`p-4 py-[30px] ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            } border-b ${isOpen ? "block" : "hidden lg:block"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={store.store.logo}
                  alt={store.store.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
                <div>
                  <span
                    className={`text-lg font-bold ${
                      isDarkMode ? "text-gray-100" : "text-gray-800"
                    }`}
                  >
                    {store.store.name}
                  </span>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Store Dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              <li>
                <Link
                  to="/store/points"
                  className={getNavItemClasses("/store/points")}
                  onClick={handleMobileNavClick}
                >
                  <Home
                    className={`w-5 h-5 ${
                      isActive("/store/points")
                        ? "text-white"
                        : isDarkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  />
                  <span>Points</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/store/customers"
                  className={getNavItemClasses("/store/customers")}
                  onClick={handleMobileNavClick}
                >
                  <Users
                    className={`w-5 h-5 ${
                      isActive("/store/customers")
                        ? "text-white"
                        : isDarkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  />
                  <span>Customers</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/store/viewRewards"
                  className={getNavItemClasses("/store/viewRewards")}
                  onClick={handleMobileNavClick}
                >
                  <Gift
                    className={`w-5 h-5 ${
                      isActive("/store/viewRewards")
                        ? "text-white"
                        : isDarkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  />
                  <span>Rewards</span>
                  {pendingRewardsCount > 0 && (
                    <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold leading-none">
                      {pendingRewardsCount > 99 ? "99+" : pendingRewardsCount}
                    </span>
                  )}
                </Link>
              </li>
              {store.store.services?.reservation && (
              <li>
                <Link
                  to="/store/viewReservations"
                  className={getNavItemClasses("/store/viewReservations")}
                  onClick={handleMobileNavClick}
                >
                  <CalendarCheck2
                    className={`w-5 h-5 ${
                      isActive("/store/viewReservations")
                        ? "text-white"
                        : isDarkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  />
                  <span>Reservations</span>
                </Link>
              </li>
              )}
              <li>
                <Link
                  to="/store/history"
                  className={getNavItemClasses("/store/history")}
                  onClick={handleMobileNavClick}
                >
                  <History
                    className={`w-5 h-5 ${
                      isActive("/store/history")
                        ? "text-white"
                        : isDarkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  />
                  <span>Points History</span>
                </Link>
              </li>
              {storeData?.receiptScan?.enabled && (
                <li>
                  <Link
                    to="/store/receipts"
                    className={getNavItemClasses("/store/receipts")}
                    onClick={handleMobileNavClick}
                  >
                    <Receipt
                      className={`w-5 h-5 ${
                        isActive("/store/receipts")
                          ? "text-white"
                          : isDarkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    />
                    <span>Receipts</span>
                  </Link>
                </li>
              )}
              {storeData?.loyaltyCard?.format === "L5" && (
                <li>
                  <Link
                    to="/store/visit-analytics"
                    className={getNavItemClasses("/store/visit-analytics")}
                    onClick={handleMobileNavClick}
                  >
                    <Activity
                      className={`w-5 h-5 ${
                        isActive("/store/visit-analytics")
                          ? "text-white"
                          : isDarkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    />
                    <span>Visit Analytics</span>
                  </Link>
                </li>
              )}
              <li>
                {/* <Link
                  to="/store/l5"
                  className={getNavItemClasses("/store/l5")}
                  onClick={handleMobileNavClick}
                >
                  <Gift
                    className={`w-5 h-5 ${
                      isActive("/store/l5")
                        ? "text-white"
                        : isDarkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  />
                  <span>L5 Dashboard</span>
                </Link> */}
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div
            className={`${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            } border-t p-4`}
          >
            {/* Notification and Theme Toggle */}
            <div className="flex items-center justify-center gap-3">
              {/* Notification Bell */}
              <button
                onClick={toggleNotification}
                disabled={loading}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  notificationPermission
                    ? isDarkMode
                      ? "bg-gray-700 text-gray-300 shadow-md"
                      : "bg-gray-100 text-gray-600 shadow-md"
                    : isDarkMode
                    ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {notificationPermission ? (
                  <BellRing className="w-4 h-4" />
                ) : (
                  <BellOff className="w-4 h-4" />
                )}
              </button>

              {/* Theme Toggle */}
              <div
                className={`flex gap-2 items-center ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-100"
                } p-1 rounded-full`}
              >
                <button
                  onClick={() => toggleTheme()}
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                    !isDarkMode
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-transparent text-gray-500"
                  }`}
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleTheme()}
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                    isDarkMode
                      ? "bg-gray-900 text-white shadow-md"
                      : "bg-transparent text-gray-500"
                  }`}
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay (for mobile and tablet view) */}
      {isOpen && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 bg-gray-900/50 lg:hidden z-30"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default StoreSidebar;
