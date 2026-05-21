import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingBag,
  Mail,
  Users,
  Award,
  ShoppingBasket,
  ChevronRight,
  ChevronDown,
  Crown,
  ChartArea,
  Star,
  UsersRound,
  CreditCard,
  CalendarHeart,
  CalendarCheck2,
  User,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Settings,
  Bell,
  Gift,
  BookOpen,
  Sparkles,
  Receipt,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Leaderboard, WhatsApp } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { toast } from "sonner";
import api from "../api/config";

// Profile Avatar Component with fallback
const ProfileAvatar = ({ user, size = "sm", isDarkMode }) => {
  const [imageError, setImageError] = useState(false);
  const sizeClasses = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  // Reset error state if picture URL changes
  useEffect(() => {
    setImageError(false);
  }, [user?.picture]);

  const hasPicture = user?.picture && !imageError;

  if (hasPicture) {
    return (
      <img
        src={user.picture}
        alt={user.name || "Profile"}
        className={`${sizeClasses} rounded-full object-cover`}
        onError={() => setImageError(true)}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Fallback to icon
  return (
    <div
      className={`${sizeClasses} ${isDarkMode ? "bg-gray-700" : "bg-green-600"
        } rounded-full flex items-center justify-center`}
    >
      <User className={`${iconSize} text-white`} />
    </div>
  );
};

// Profile Dropdown Component showing user details
const ProfileDropdown = ({ user, isDarkMode, onClose, onLogout, position = "bottom" }) => {
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Format join date
  const formatJoinDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  // Get role display text
  const getRoleDisplay = (role) => {
    const roles = {
      admin: "Administrator",
      user: "Store Owner",
    };
    return roles[role] || role || "User";
  };

  const positionClasses =
    position === "top"
      ? "bottom-full mb-2 right-0"
      : position === "top-right"
        ? "bottom-full mb-2 left-0"
        : "top-full mt-2 right-0";

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose}></div>
      <div
        ref={dropdownRef}
        className={`absolute ${positionClasses} w-72 ${isDarkMode
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
          } border rounded-lg shadow-lg z-20 overflow-hidden`}
      >
        {/* Profile Header */}
        <div
          className={`px-4 py-4 ${isDarkMode ? "bg-gray-750" : "bg-gray-50"
            } border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
        >
          <div className="flex items-center gap-3">
            <ProfileAvatar user={user} size="md" isDarkMode={isDarkMode} />
            <div className="flex-1 min-w-0">
              <p
                className={`font-medium truncate ${isDarkMode ? "text-white" : "text-gray-900"
                  }`}
              >
                {user?.name || "User"}
              </p>
              <p
                className={`text-sm truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
              >
                {user?.email || "No email"}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="px-4 py-3 space-y-2">
          {/* Role */}
          <div className="flex items-center justify-between">
            <span
              className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
            >
              Role
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${user?.role === "admin"
                ? isDarkMode
                  ? "bg-purple-900/50 text-purple-300"
                  : "bg-purple-100 text-purple-700"
                : isDarkMode
                  ? "bg-green-900/50 text-green-300"
                  : "bg-green-100 text-green-700"
                }`}
            >
              {getRoleDisplay(user?.role)}
            </span>
          </div>

          {/* Member Since */}
          {user?.createdAt && formatJoinDate(user.createdAt) && (
            <div className="flex items-center justify-between">
              <span
                className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
              >
                Member since
              </span>
              <span
                className={`text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
              >
                {formatJoinDate(user.createdAt)}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          className={`border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
        />

        {/* Logout Button */}
        <div className="p-2">
          <button
            className={`w-full px-3 py-2 text-left text-sm ${isDarkMode
              ? "text-red-400 hover:bg-gray-700"
              : "text-red-600 hover:bg-red-50"
              } rounded-md transition-colors flex items-center gap-2`}
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
};

const Sidebar = () => {
  const { authState, updateAuth } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { userInfo: user, token } = authState;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
  const [mobileUserDropdownOpen, setMobileUserDropdownOpen] = useState(false);
  const [sidebarUserDropdownOpen, setSidebarUserDropdownOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [stores, setStores] = useState([]);
  const [activeServices, setActiveServices] = useState({
    loyalty: false,
    reservation: false,
    ecommerce: false,
    games: false,
    multipleOutlets: false,
    leaderboard: false,
    l4Reports: false, // L4 format with multiple outlets
    receiptScan: false,
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch stores for non-admin users to determine which services are available
  useEffect(() => {
    const fetchStores = async () => {
      if (user?.role === "admin" || !token) return;

      try {
        const response = await api.get("/store/myStores", { headers: { token } });
        if (response.data.success && response.data.stores) {
          setStores(response.data.stores);

          // Aggregate services from all stores
          const aggregatedServices = response.data.stores.reduce((acc, store) => {
            if (store.services) {
              acc.loyalty = acc.loyalty || store.services.loyalty;
              acc.reservation = acc.reservation || store.services.reservation;
              acc.ecommerce = acc.ecommerce || store.services.ecommerce?.status;
              acc.games = acc.games || store.services.games;
              acc.multipleOutlets = acc.multipleOutlets || store.services.multipleOutlets;
              acc.leaderboard = acc.leaderboard || store.services.leaderboard;
              // Show L4 reports if store is L4 format with multiple outlets
              acc.l4Reports = acc.l4Reports || (store.loyaltyCard?.format === "L4" && store.services.multipleOutlets);
            }
            acc.receiptScan = acc.receiptScan || (store.receiptScan?.enabled === true);
            return acc;
          }, {
            loyalty: false,
            reservation: false,
            ecommerce: false,
            games: false,
            multipleOutlets: false,
            leaderboard: false,
            l4Reports: false,
            receiptScan: false,
          });

          setActiveServices(aggregatedServices);
        }
      } catch (error) {
        console.error("Error fetching stores for sidebar:", error);
      }
    };

    fetchStores();
  }, [user?.role, token]);

  // Keep Settings dropdown open if we're on a settings-related page
  useEffect(() => {
    const settingsRoutes = ["/notification", "/billing", "/store-settings", "/loyalty-card-settings"];
    const isOnSettingsRoute = settingsRoutes.some(route => location.pathname === route);
    if (isOnSettingsRoute) {
      setIsSettingsDropdownOpen(true);
    }
  }, [location.pathname]);

  // Keep E-store dropdown open if we're on an e-store related page
  useEffect(() => {
    const estoreRoutes = ["/products", "/orders", "/analytics"];
    const isOnEstoreRoute = estoreRoutes.some(route => location.pathname === route);
    if (isOnEstoreRoute) {
      setIsDropdownOpen(true);
    }
  }, [location.pathname]);

  // Helper function to check if a service is available (admin sees all, users see based on their stores)
  const isServiceAvailable = (serviceKey) => {
    if (user?.role === "admin") return true;
    return activeServices[serviceKey];
  };

  // Function to handle mobile navigation click
  const handleMobileNavClick = () => {
    if (window.innerWidth < 1024) {
      // lg breakpoint
      setIsOpen(false);
    }
  };

  // Function to check if a navigation item is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Function to get navigation item classes based on active state
  const getNavItemClasses = (path) => {
    const baseClasses = `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isDarkMode ? "text-gray-300" : "text-gray-700"
      }`;
    if (isActive(path)) {
      return `${baseClasses} bg-green-600 text-white`;
    }
    return `${baseClasses} ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
      }`;
  };

  const handleAnalyticsClick = () => {
    setIsAnalyticsOpen(!isAnalyticsOpen);
  };

  const handleEcomClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
    navigate("/products");
  };

  const handleLogout = async () => {
    setMobileUserDropdownOpen(false);
    setSidebarUserDropdownOpen(false);
    await updateAuth();
    toast.success("User Logged Out", {
      duration: 1000,
      onAutoClose: () => navigate("/login"),
    });
  };

  const toggleMobileUserDropdown = () => {
    setMobileUserDropdownOpen(!mobileUserDropdownOpen);
    setSidebarUserDropdownOpen(false); // Close the other dropdown
  };

  const toggleSidebarUserDropdown = () => {
    setSidebarUserDropdownOpen(!sidebarUserDropdownOpen);
    setMobileUserDropdownOpen(false); // Close the other dropdown
  };

  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Header Bar (Visible on Small and Medium Screens) */}
      {!isOpen && (
        <div
          className={`lg:hidden sticky top-0 left-0 right-0 z-50 border-b shadow-sm ${isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-green-600 border-green-900"
            }`}
        >
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo and App Name */}
            <img
              src="/images/logo/logo_white.png"
              alt="Samparka Logo"
              className="h-8 w-auto"
            />

            {/* Right side icons */}
            <div className="flex items-center gap-2">
              {/* User Avatar with Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleMobileUserDropdown}
                  className="rounded-full transition-colors hover:ring-2 hover:ring-green-500"
                >
                  <ProfileAvatar user={user} size="sm" isDarkMode={isDarkMode} />
                </button>

                {/* User Dropdown Menu for Mobile */}
                {mobileUserDropdownOpen && (
                  <ProfileDropdown
                    user={user}
                    isDarkMode={isDarkMode}
                    onClose={() => setMobileUserDropdownOpen(false)}
                    onLogout={handleLogout}
                    position="bottom"
                  />
                )}
              </div>

              {/* Hamburger Menu Button */}
              <button
                className={`p-2 rounded-lg focus:outline-none focus:ring-1 transition-colors ${isDarkMode
                  ? "text-gray-300 hover:bg-gray-800 focus:ring-gray-600"
                  : "text-white hover:bg-green-700 focus:ring-gray-300"
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
        className={`fixed left-0 z-[999] w-64 ${isDarkMode
          ? "bg-gray-900 border-gray-700"
          : "bg-white border-gray-200"
          } border-r shadow-sm transition-transform ${isOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 lg:top-0 lg:h-screen ${isOpen ? "top-0 h-screen" : "top-[60px] h-[calc(100vh-60px)]"
          }`}
        aria-label="Sidebar"
      >
        <div className="h-full flex flex-col">
          {/* Header - Show on mobile when menu is open, always show on desktop */}
          <div
            className={`p-4 ${isDarkMode ? "border-gray-700" : "border-gray-200"
              } border-b ${isOpen ? "block" : "hidden lg:block"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img
                  src={
                    isDarkMode
                      ? "/images/logo/logo_white.png"
                      : "/images/logo/logo_black.png"
                  }
                  alt="Samparka Logo"
                  className="lg:h-14 h-12"
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {/* Admin only links */}
              {user.role === "admin" && (
                <li>
                  <Link
                    to="/dashboard"
                    className={getNavItemClasses("/dashboard")}
                    onClick={handleMobileNavClick}
                  >
                    <Users
                      className={`w-5 h-5 ${isActive("/dashboard")
                        ? "text-white"
                        : isDarkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                        }`}
                    />
                    <span>Admin</span>
                  </Link>
                </li>
              )}
              <li>
                <Link
                  to="/store"
                  className={getNavItemClasses("/store")}
                  onClick={handleMobileNavClick}
                >
                  <ShoppingBag
                    className={`w-5 h-5 ${isActive("/store")
                      ? "text-white"
                      : isDarkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                      }`}
                  />
                  <span>Store</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/reward"
                  className={getNavItemClasses("/reward")}
                  onClick={handleMobileNavClick}
                >
                  <Award
                    className={`w-5 h-5 ${isActive("/reward")
                      ? "text-white"
                      : isDarkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                      }`}
                  />
                  <span>Reward</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/offer"
                  className={getNavItemClasses("/offer")}
                  onClick={handleMobileNavClick}
                >
                  <Gift
                    className={`w-5 h-5 ${isActive("/offer")
                      ? "text-white"
                      : isDarkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                      }`}
                  />
                  <span>Offer</span>
                </Link>
              </li>

              {/* Receipt Review — visible to admin always, or when any store has receipt scan enabled */}
              {isServiceAvailable("receiptScan") && (
                <li>
                  <Link
                    to="/receipt-review"
                    className={getNavItemClasses("/receipt-review")}
                    onClick={handleMobileNavClick}
                  >
                    <Receipt
                      className={`w-5 h-5 ${isActive("/receipt-review")
                        ? "text-white"
                        : isDarkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                        }`}
                    />
                    <span>Receipt Review</span>
                  </Link>
                </li>
              )}

              {/* Admin only links */}
              {user.role === "admin" && (
                <li>
                  <Link
                    to="/whatsapp"
                    className={getNavItemClasses("/whatsapp")}
                    onClick={handleMobileNavClick}
                  >
                    <WhatsApp
                      className={`w-5 h-5 ${isActive("/whatsapp")
                        ? "text-white"
                        : isDarkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                        }`}
                    />
                    <span>Whatsapp</span>
                  </Link>
                </li>
              )}

              {/* 
              <li>
                <Link
                  to="/points_analytics"
                  className={getNavItemClasses("/points_analytics")}
                  onClick={handleMobileNavClick}
                >
                  <ChartArea
                    className={`w-5 h-5 ${
                      isActive("/points_analytics")
                        ? "text-white"
                        : isDarkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  />
                  <span>Analytics</span>
                </Link>
              </li> */}

              <li>
                <Link
                  to="/visit_analytics"
                  className={getNavItemClasses("/visit_analytics")}
                  onClick={handleMobileNavClick}
                >
                  <ChartArea
                    className={`w-5 h-5 ${isActive("/visit_analytics")
                      ? "text-white"
                      : isDarkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                      }`}
                  />

                  <span>Visit Analytics</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/ai-insights"
                  className={getNavItemClasses("/ai-insights")}
                  onClick={handleMobileNavClick}
                >
                  <Sparkles
                    className={`w-5 h-5 ${isActive("/ai-insights")
                      ? "text-white"
                      : isDarkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                      }`}
                  />
                  <span>Spark AI</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/impact"
                  className={getNavItemClasses("/impact")}
                  onClick={handleMobileNavClick}
                >
                  <Star
                    className={`w-5 h-5 ${isActive("/impact")
                      ? "text-white"
                      : isDarkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                      }`}
                  />
                  <span>Impact</span>
                </Link>
              </li>


              <li>
                <Link
                  to="/messaging"
                  className={getNavItemClasses("/messaging")}
                  onClick={handleMobileNavClick}
                >
                  <MessageSquare
                    className={`w-5 h-5 ${isActive("/messaging")
                      ? "text-white"
                      : isDarkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                      }`}
                  />
                  <span>Notification</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/customers"
                  className={getNavItemClasses("/customers")}
                  onClick={handleMobileNavClick}
                >
                  <Users
                    className={`w-5 h-5 ${isActive("/customers")
                      ? "text-white"
                      : isDarkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                      }`}
                  />
                  <span>Customers</span>
                </Link>
              </li>

              {isServiceAvailable("reservation") && (
                <li>
                  <Link
                    to="/reservation"
                    className={getNavItemClasses("/reservation")}
                    onClick={handleMobileNavClick}
                  >
                    <CalendarCheck2
                      className={`w-5 h-5 ${isActive("/reservation")
                        ? "text-white"
                        : isDarkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                        }`}
                    />
                    <span>Reservation</span>
                  </Link>
                </li>
              )}

              {/* E-store Dropdown - Only show if ecommerce service is available */}
              {isServiceAvailable("ecommerce") && (
                <li>
                  <div>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors ${isDarkMode
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <ShoppingBasket
                          className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                        />
                        <span>E-store</span>
                      </div>
                      {isDropdownOpen ? (
                        <ChevronDown
                          className={`w-4 h-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                        />
                      ) : (
                        <ChevronRight
                          className={`w-4 h-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                        />
                      )}
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-200 ${isDropdownOpen
                        ? "max-h-48 opacity-100"
                        : "max-h-0 opacity-0"
                        }`}
                    >
                      <ul className="mt-1 ml-8 space-y-1">
                        <li>
                          <Link
                            to="/products"
                            className={`block px-3 py-2 text-sm rounded-lg transition-colors ${isActive("/products")
                              ? "text-white bg-green-600"
                              : isDarkMode
                                ? "text-gray-400 hover:bg-gray-800"
                                : "text-gray-600 hover:bg-gray-100"
                              }`}
                            onClick={handleMobileNavClick}
                          >
                            Product
                          </Link>
                        </li>

                        <li>
                          <Link
                            to="/orders"
                            className={`block px-3 py-2 text-sm rounded-lg transition-colors ${isActive("/orders")
                              ? "text-white bg-green-600"
                              : isDarkMode
                                ? "text-gray-400 hover:bg-gray-800"
                                : "text-gray-600 hover:bg-gray-100"
                              }`}
                            onClick={handleMobileNavClick}
                          >
                            Order
                          </Link>
                        </li>

                        <li>
                          <Link
                            to="/analytics"
                            className={`block px-3 py-2 text-sm rounded-lg transition-colors ${isActive("/analytics")
                              ? "text-white bg-green-600"
                              : isDarkMode
                                ? "text-gray-400 hover:bg-gray-800"
                                : "text-gray-600 hover:bg-gray-100"
                              }`}
                            onClick={handleMobileNavClick}
                          >
                            Analytics
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </li>
              )}

              {/* Settings Dropdown */}
              <li>
                <div>
                  <button
                    onClick={() => setIsSettingsDropdownOpen(!isSettingsDropdownOpen)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors ${isDarkMode
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Settings
                        className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                      />
                      <span>Settings</span>
                    </div>
                    {isSettingsDropdownOpen ? (
                      <ChevronDown
                        className={`w-4 h-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                      />
                    ) : (
                      <ChevronRight
                        className={`w-4 h-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                      />
                    )}
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-200 ${isSettingsDropdownOpen
                        ? "max-h-60 opacity-100"
                        : "max-h-0 opacity-0"
                      }`}
                  >
                    <ul className="mt-1 ml-8 space-y-1">

                       <li>
                        <Link
                          to="/store-settings"
                          className={`block px-3 py-2 text-sm rounded-lg transition-colors ${isActive("/store-settings")
                              ? "text-white bg-green-600"
                              : isDarkMode
                                ? "text-gray-400 hover:bg-gray-800"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          onClick={handleMobileNavClick}
                        >
                          Store Settings
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/notification"
                          className={`block px-3 py-2 text-sm rounded-lg transition-colors ${isActive("/notification")
                              ? "text-white bg-green-600"
                              : isDarkMode
                                ? "text-gray-400 hover:bg-gray-800"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          onClick={handleMobileNavClick}
                        >
                          Notification Settings
                        </Link>
                      </li>
                     
                      <li>
                        <Link
                          to="/loyalty-card-settings"
                          className={`block px-3 py-2 text-sm rounded-lg transition-colors ${isActive("/loyalty-card-settings")
                              ? "text-white bg-green-600"
                              : isDarkMode
                                ? "text-gray-400 hover:bg-gray-800"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          onClick={handleMobileNavClick}
                        >
                          Loyalty Card Settings
                        </Link>
                      </li>
                    </ul>

                    {user.role === "user" && (
                      <ul className="mt-1 ml-8 space-y-1">
                        <li>
                          <Link
                            to="/billing"
                            className={`block px-3 py-2 text-sm rounded-lg transition-colors ${isActive("/billing")
                                ? "text-white bg-green-600"
                                : isDarkMode
                                  ? "text-gray-400 hover:bg-gray-800"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            onClick={handleMobileNavClick}
                          >
                            Billing
                          </Link>
                        </li>
                      </ul>
                    )}
{/* 
                    {user.role === "admin" && (
                      <ul className="mt-1 ml-8 space-y-1">
                        <li>
                          <Link
                            to="/dashboard?tab=settings"
                            className={`block px-3 py-2 text-sm rounded-lg transition-colors ${isActive("/dashboard")
                                ? "text-white bg-green-600"
                                : isDarkMode
                                  ? "text-gray-400 hover:bg-gray-800"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            onClick={handleMobileNavClick}
                          >
                            Admin Settings
                          </Link>
                        </li>
                      </ul>
                    )} */}

                  </div>
                </div>
              </li>

              {/* Tutorials */}
              <li className="relative">
                <style>{`
                  @keyframes pulse-glow {
                    0%, 100% {
                      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
                    }
                    50% {
                      box-shadow: 0 0 12px 4px rgba(34, 197, 94, 0.6);
                    }
                  }
                  .tutorial-pulse {
                    animation: pulse-glow 2s ease-in-out infinite;
                  }
                `}</style>
                <Link
                  to="/tutorials"
                  className={`${getNavItemClasses("/tutorials")} tutorial-pulse ${
                    !isActive("/tutorials") && "ring-2 ring-green-500/50"
                  }`}
                  onClick={handleMobileNavClick}
                >
                  <BookOpen
                    className={`w-5 h-5 ${
                      isActive("/tutorials")
                        ? "text-white"
                        : isDarkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                    }`}
                  />
                  <span>Tutorials</span>
                  {!isActive("/tutorials") && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                  )}
                </Link>
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div
            className={`${isDarkMode ? "border-gray-700" : "border-gray-200"
              } border-t p-4`}
          >
            <div className="flex items-center justify-center">
              {/* User Info with Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleSidebarUserDropdown}
                  className={`p-2 rounded-full ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                    } transition-colors`}
                >
                  <ProfileAvatar user={user} size="sm" isDarkMode={isDarkMode} />
                </button>

                {/* User Dropdown Menu */}
                {sidebarUserDropdownOpen && (
                  <ProfileDropdown
                    user={user}
                    isDarkMode={isDarkMode}
                    onClose={() => setSidebarUserDropdownOpen(false)}
                    onLogout={handleLogout}
                    position="top-right"
                  />
                )}
              </div>

              {/* Theme Toggle */}
              <div
                className={`flex gap-2 items-center ${isDarkMode ? "bg-gray-800" : "bg-gray-100"
                  } p-1 rounded-full`}
              >
                <button
                  onClick={() => toggleTheme()}
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${!isDarkMode
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-transparent text-gray-500"
                    }`}
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleTheme()}
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${isDarkMode
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

export default Sidebar;
