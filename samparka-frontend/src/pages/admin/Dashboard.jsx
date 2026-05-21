import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/config";
import { toast } from "sonner";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  Activity,
  AlertTriangle,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  EllipsisVertical,
  Eye,
  Lock,
  LogOut,
  Pencil,
  RefreshCw,
  Search,
  Shield,
  Store,
  Trash2,
  User,
  UserCheck,
  UserRoundCheck,
  UserRoundX,
  UserX,
  Users,
  X,
  XCircle,
} from "lucide-react";
import EditUser from "../../components/EditUser";
import AdminControlTab from "../../components/adminControl/AdminControlTab";

const Dashboard = () => {
  const { isDarkMode } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [modelUserId, setModelUserId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [user, setUser] = useState({});
  const [stores, setStores] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddUserVisible, setIsAddUserVisible] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [isUserDetailsVisible, setIsUserDetailsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    confirm_password: "",
  });
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isPaginationExpanded, setIsPaginationExpanded] = useState(false);
  const [backupLoading, setBackupLoading] = useState({ dev: false, prod: false });
  const [backupProgress, setBackupProgress] = useState({ dev: 0, prod: 0 });
  const [restoreLoading, setRestoreLoading] = useState({ dev: false, prod: false });
  const [restoreProgress, setRestoreProgress] = useState({ dev: 0, prod: 0 });
  const [backupsList, setBackupsList] = useState({ dev: [], prod: [] });
  const [selectedBackup, setSelectedBackup] = useState({ dev: null, prod: null });
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "users");
  const [activityData, setActivityData] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const { authState } = useAuth();
  const { token } = authState;

  // Update URL when tab changes
  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true });
  }, [activeTab, setSearchParams]);

  const handleRunBackup = async (environment) => {
    setBackupLoading((prev) => ({ ...prev, [environment]: true }));
    setBackupProgress((prev) => ({ ...prev, [environment]: 0 }));
    
    // Simulate progress updates (since we can't get real-time progress from backend yet)
    const progressInterval = setInterval(() => {
      setBackupProgress((prev) => {
        const currentProgress = prev[environment];
        if (currentProgress < 90) {
          return { ...prev, [environment]: currentProgress + 10 };
        }
        return prev;
      });
    }, 500);
    
    try {
      const response = await api.post(
        "/admin/runBackup",
        { environment },
        { headers: { token } }
      );
      
      clearInterval(progressInterval);
      setBackupProgress((prev) => ({ ...prev, [environment]: 100 }));
      
      if (response.data.success) {
        toast.success(response.data.message, { duration: 3000 });
        // Reset progress after a short delay
        setTimeout(() => {
          setBackupProgress((prev) => ({ ...prev, [environment]: 0 }));
        }, 1000);
      } else {
        toast.error(response.data.message || "Backup failed", { duration: 3000 });
        setBackupProgress((prev) => ({ ...prev, [environment]: 0 }));
      }
    } catch (error) {
      clearInterval(progressInterval);
      setBackupProgress((prev) => ({ ...prev, [environment]: 0 }));
      console.error("Backup error:", error);
      console.error("Error response:", error.response?.data);
      toast.error("Failed to run backup: " + (error.response?.data?.message || error.message), { duration: 3000 });
    } finally {
      setBackupLoading((prev) => ({ ...prev, [environment]: false }));
    }
  };

  const handleRunRestore = async (environment) => {
    const backup = selectedBackup[environment];
    if (!backup) {
      toast.error("Please select a backup to restore", { duration: 3000 });
      return;
    }

    // CRITICAL: Validate backup path matches target environment
    const expectedEnvFolder = environment === 'prod' ? 'production' : 'development';
    const backupEnvFolder = backup.prefix.split('/')[1];
    
    if (backupEnvFolder !== expectedEnvFolder) {
      toast.error(
        `⚠️ Environment mismatch! Cannot restore ${backupEnvFolder} backup to ${environment} database.`,
        { duration: 5000 }
      );
      return;
    }

    const confirmMessage = `⚠️ CRITICAL OPERATION ⚠️\n\nAre you sure you want to restore ${environment.toUpperCase()} database from backup:\n${backup.date}\n\nThis will PERMANENTLY OVERWRITE ALL current ${environment.toUpperCase()} data!\n\nType "RESTORE ${environment.toUpperCase()}" to confirm.`;
    const userInput = window.prompt(confirmMessage);
    const expectedInput = `RESTORE ${environment.toUpperCase()}`;
    
    if (userInput !== expectedInput) {
      toast.info("Restore cancelled", { duration: 2000 });
      return;
    }

    setRestoreLoading((prev) => ({ ...prev, [environment]: true }));
    setRestoreProgress((prev) => ({ ...prev, [environment]: 0 }));
    
    const progressInterval = setInterval(() => {
      setRestoreProgress((prev) => {
        const currentProgress = prev[environment];
        if (currentProgress < 90) {
          return { ...prev, [environment]: currentProgress + 10 };
        }
        return prev;
      });
    }, 500);
    
    try {
      const response = await api.post(
        "/admin/runRestore",
        { environment, backupPath: backup.prefix },
        { headers: { token } }
      );
      
      clearInterval(progressInterval);
      setRestoreProgress((prev) => ({ ...prev, [environment]: 100 }));
      
      if (response.data.success) {
        toast.success(response.data.message, { duration: 3000 });
        setTimeout(() => {
          setRestoreProgress((prev) => ({ ...prev, [environment]: 0 }));
        }, 1000);
      } else {
        toast.error(response.data.message || "Restore failed", { duration: 3000 });
        setRestoreProgress((prev) => ({ ...prev, [environment]: 0 }));
      }
    } catch (error) {
      clearInterval(progressInterval);
      setRestoreProgress((prev) => ({ ...prev, [environment]: 0 }));
      console.error("Restore error:", error);
      toast.error("Failed to run restore: " + (error.response?.data?.message || error.message), { duration: 3000 });
    } finally {
      setRestoreLoading((prev) => ({ ...prev, [environment]: false }));
    }
  };

  const fetchBackups = async (environment) => {
    try {
      const response = await api.get(
        `/admin/listBackups?environment=${environment}`,
        { headers: { token } }
      );
      if (response.data.success) {
        setBackupsList((prev) => ({ ...prev, [environment]: response.data.backups }));
      }
    } catch (error) {
      console.error("Failed to fetch backups:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "settings") {
      fetchBackups("dev");
      fetchBackups("prod");
    }
  }, [activeTab]);

  const fetchStoreActivity = async () => {
    setActivityLoading(true);
    try {
      const res = await api.get("/admin/storeActivity", { headers: { token } });
      if (res.data.success) setActivityData(res.data.data);
    } catch (e) {
      toast.error("Failed to load activity data");
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "activity" && !activityData) {
      fetchStoreActivity();
    }
  }, [activeTab]);

  const getStoresAdmin = async () => {
    setLoading(true);
    try {
      const response = await api.get("/store", { headers: { token } });
      if (response.data.success) {
        setStores(response.data.stores);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const fetchUsers = async () => {
    setLoading(true);
    const response = await api.get("/admin/getUsers", { headers: { token } });
    if (response.data.success) {
      setUsers(response.data.users);
    }
    setLoading(false);
  };
  useEffect(() => {
    getStoresAdmin();
    fetchUsers();
  }, []);

  // Trigger animation when user details modal opens
  useEffect(() => {
    if (isUserDetailsModalOpen) {
      setIsUserDetailsVisible(true);
    }
  }, [isUserDetailsModalOpen]);

  // Trigger animation when add user modal opens
  useEffect(() => {
    if (isModalOpen) {
      setIsAddUserVisible(true);
    }
  }, [isModalOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If dropdown is open and click is outside the dropdown area
      if (dropdownOpen && !event.target.closest(".dropdown-container")) {
        setDropdownOpen(null);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Handle user details modal close with animation
  const handleUserDetailsClose = () => {
    setIsUserDetailsVisible(false);
    setTimeout(() => {
      setIsUserDetailsModalOpen(false);
      setSelectedUserDetails(null);
    }, 300); // Wait for animation to complete
  };

  // Handle add user modal close with animation
  const handleAddUserClose = () => {
    setIsAddUserVisible(false);
    setTimeout(() => {
      setIsModalOpen(false);
      setNewUser({ email: "", password: "", confirm_password: "" });
    }, 300); // Wait for animation to complete
  };

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post(
        "/admin/createUser",
        { newUser },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message, {
          duration: 2000,
          onAutoClose: () => window.location.reload(),
        });
        handleAddUserClose(); // Use animated close
      } else {
        toast.error(response.data.message, {
          duration: 2000,
        });
      }
    } catch (error) {

      toast.error(error, {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeUserStatus = async (userId, status) => {
    setLoading(true);
    try {
      const response = await api.put(
        `/admin/changeUserStatus/${userId}/${status}`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u._id === userId ? { ...u, status } : u))
        );
        setDropdownOpen(null);
        toast.success(response.data.message, {
          duration: 2000,
        });
      } else {
        toast.error(response.data.message, {
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error("Error changing user status", {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUser = users.filter((user) => {
    // Find all stores belonging to this user (store.user[0] can be string or object)
    const matchedStores = stores.filter((store) => {
      // store.user[0] could be an object (_id) or string (user id)
      const storeUserId =
        typeof store.user[0] === "object" ? store.user[0]?._id : store.user[0];
      return storeUserId === user._id;
    });

    // Check if user email or any of their store names match the query
    return (
      (user.email || "").toLowerCase().includes(query.toLowerCase()) ||
      matchedStores.some((store) =>
        (store.name || "").toLowerCase().includes(query.toLowerCase())
      )
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUser.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUser.slice(startIndex, endIndex);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const goToPage = (page) => setCurrentPage(page);
  const goToPrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // User Accordion Item Component
  const UserAccordionItem = ({ user, index, startIndex = 0 }) => {
    const isExpanded = expandedAccordion === user._id;

    const handleToggleExpand = () => {
      setExpandedAccordion(isExpanded ? null : user._id);
    };

    const userStores = stores.filter((store) => {
      const storeUserId =
        typeof store.user[0] === "object" ? store.user[0]._id : store.user[0];
      return storeUserId === user._id;
    });

    return (
      <div
        className={`rounded-lg shadow-sm border overflow-hidden transition-all duration-200 ${
          isDarkMode ? "bg-gray-900" : "bg-white"
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
        {/* Accordion Header */}
        <button
          onClick={handleToggleExpand}
          className={`w-full px-4 py-3 flex items-center justify-between transition-colors focus:outline-none ${
            isExpanded
              ? isDarkMode
                ? "bg-green-900/30 hover:bg-green-900/40"
                : "bg-green-50 hover:bg-green-100"
              : isDarkMode
              ? "hover:bg-gray-800 focus:bg-gray-700"
              : "hover:bg-gray-50 focus:bg-gray-50"
          }`}
        >
          <div className="flex items-center space-x-3 flex-1">
            {/* Number */}
            <span
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                isDarkMode
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {startIndex + index + 1}
            </span>

            {/* User Info */}
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className={`font-medium text-sm capitalize truncate ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {(user.email || "").split("@")[0].replace(/[^a-zA-Z]/g, " ")}
                    </h3>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                        user.role === "admin"
                          ? isDarkMode
                            ? "bg-purple-900/30 text-purple-400"
                            : "bg-purple-100 text-purple-700"
                          : isDarkMode
                          ? "bg-gray-700 text-gray-400"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.role === "admin" ? "Admin" : "User"}
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-0.5 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Joined{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === "active"
                      ? isDarkMode
                        ? "bg-green-900/20 text-green-400"
                        : "bg-green-100 text-green-800"
                      : isDarkMode
                      ? "bg-red-900/20 text-red-400"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <svg
                    className={`w-2 h-2 mr-1.5 ${
                      user.status === "active"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 8 8"
                  >
                    <circle cx={4} cy={4} r={3} />
                  </svg>
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          {/* Expand Icon */}
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

        {/* Expanded Content */}
        {isExpanded && (
          <div
            className={`px-4 pb-4 border-t border-green-200 ${
              isDarkMode ? "bg-transparent" : "bg-green-50"
            }`}
          >
            <div className="space-y-3 pt-3">
              {/* Email Address */}
              <div className="flex items-center space-x-3">
                <svg
                  className={`w-4 h-4 flex-shrink-0 ${
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
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs mb-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Email Address
                  </p>
                  <p
                    className={`text-sm break-all ${
                      isDarkMode ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Store Access */}
              <div className="flex items-center space-x-3">
                <svg
                  className={`w-4 h-4 flex-shrink-0 ${
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs mb-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Store Access
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {userStores.length > 0 ? (
                      <>
                        {userStores.slice(0, 3).map((store, idx) => (
                          <span
                            key={idx}
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              isDarkMode
                                ? "bg-gray-700 text-gray-300"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {store.name}
                          </span>
                        ))}
                        {userStores.length > 3 && (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              isDarkMode
                                ? "bg-green-900/20 text-green-400"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            +{userStores.length - 3} more
                          </span>
                        )}
                      </>
                    ) : (
                      <span
                        className={`text-sm ${
                          isDarkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        No stores assigned
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-green-200">
                <label
                  className={`block text-xs font-medium mb-2 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Actions
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUserDetails(user);
                      setIsUserDetailsModalOpen(true);
                      setIsUserDetailsVisible(false);
                    }}
                    title="View Details"
                    className={`flex items-center justify-center w-10 h-10 border rounded-lg transition-colors ${
                      isDarkMode
                        ? "text-gray-400 bg-gray-700 border-gray-600 hover:bg-gray-600 hover:text-gray-300"
                        : "text-gray-600 bg-white border-gray-300 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditModalOpen(true);
                      setUser(user);
                    }}
                    title="Edit User"
                    className="flex items-center justify-center w-10 h-10 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setModelUserId(user._id);
                      setShowDeleteModal(true);
                    }}
                    title="Delete User"
                    className="flex items-center justify-center w-10 h-10 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleForceLogout(user._id);
                    }}
                    title="Force Logout"
                    className={`flex items-center justify-center w-10 h-10 border rounded-lg transition-colors ${
                      isDarkMode
                        ? "text-orange-400 bg-orange-900/20 border-orange-700 hover:bg-orange-900/40"
                        : "text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100"
                    }`}
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await api.delete(`/admin/deleteUser/${modelUserId}`, {
        headers: { token },
      });
      if (response.data.success) {
        setUsers((prevUsers) => prevUsers.filter((u) => u._id !== modelUserId));
        toast.success(response.data.message, {
          duration: 2000,
        });
      } else {
        toast.error(response.data.message, {
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error("Error deleting user", {
        duration: 2000,
      });
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleForceLogout = async (userId) => {
    try {
      const response = await api.post(`/admin/forceLogout/${userId}`, {}, { headers: { token } });
      if (response.data.success) {
        toast.success("User logged out from all sessions", { duration: 2000 });
      } else {
        toast.error(response.data.message || "Failed to force logout", { duration: 2000 });
      }
    } catch {
      toast.error("Failed to force logout", { duration: 2000 });
    }
  };

  return (
    <div
      className={`px-2 sm:px-0 md:px-4 lg:px-0 sm:ml-0 lg:ml-64 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      } min-h-screen`}
    >
      {loading && <LoadingSpinner />}

      {/* Header Section */}
      <div
        className={`${
          isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-100"
        } border-b shadow-sm`}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            {/* Title Section */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <h1
                className={`text-base sm:text-xl lg:text-2xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } mb-1 truncate sm:wrap-break-word`}
              >
                {activeTab === "users" ? "User Management" : activeTab === "activity" ? "Store Activity" : activeTab === "adminControl" ? "Admin Control" : "Admin Settings"}
              </h1>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {activeTab === "users" ? `${users.length} user${users.length !== 1 ? "s" : ""} found` : activeTab === "activity" ? "Monitor store engagement by points distribution" : activeTab === "adminControl" ? "Schedule events and manage automated store reports" : "Manage database backups and system settings"}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 sm:gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "users"
                  ? "border-green-600 text-green-600"
                  : isDarkMode
                  ? "border-transparent text-gray-400 hover:text-gray-300"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                Users
              </div>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "settings"
                  ? "border-green-600 text-green-600"
                  : isDarkMode
                  ? "border-transparent text-gray-400 hover:text-gray-300"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <Database className="w-3 h-3 sm:w-4 sm:h-4" />
                Settings
              </div>
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "activity"
                  ? "border-green-600 text-green-600"
                  : isDarkMode
                  ? "border-transparent text-gray-400 hover:text-gray-300"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                Store Activity
              </div>
            </button>
            <button
              onClick={() => setActiveTab("adminControl")}
              className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "adminControl"
                  ? "border-green-600 text-green-600"
                  : isDarkMode
                  ? "border-transparent text-gray-400 hover:text-gray-300"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-1 sm:gap-2">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                Admin Control
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Users Tab Content */}
      {activeTab === "users" && (
        <>
          {/* Search and Actions Row */}
          <div className={`${
            isDarkMode
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-100"
          } border-b shadow-sm`}>
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search
                    className={`h-5 w-5 ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={`block w-full pl-10 pr-10 py-2.5 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                  }`}
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg
                      className={`h-4 w-4 ${
                        isDarkMode
                          ? "text-gray-500 hover:text-gray-300"
                          : "text-gray-400 hover:text-gray-600"
                      } transition-colors`}
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
              {/* Secondary Actions Group */}
              <div className="flex items-center gap-2">
                {/* Import Users */}
                <button
                  title="Import Users"
                  className={`inline-flex items-center gap-2 px-3 py-2.5 border rounded-lg transition-all duration-200 text-sm font-medium ${
                    isDarkMode
                      ? "text-gray-300 bg-gray-700 hover:bg-gray-600 border-gray-600 hover:border-gray-500"
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
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                  <span className="hidden lg:inline">Import</span>
                </button>

                {/* Export CSV */}
                <button
                  title="Export Users"
                  className={`inline-flex items-center gap-2 px-3 py-2.5 border rounded-lg transition-all duration-200 text-sm font-medium ${
                    isDarkMode
                      ? "text-gray-300 bg-gray-700 hover:bg-gray-600 border-gray-600 hover:border-gray-500"
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
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="hidden lg:inline">Export</span>
                </button>
              </div>

              {/* Primary Action - Create New User */}
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setIsAddUserVisible(false);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Add User</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="mb-6 mt-6 mx-2 sm:mx-4 lg:mx-6">
        <div
          className={`rounded-lg border p-3 sm:p-4 ${
            isDarkMode
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-2">
              <h2
                className={`text-sm sm:text-base font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Analytics Overview
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {/* Total Users */}
            <div
              className={`rounded-lg border p-4 transition-colors ${
                isDarkMode
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                  }`}
                >
                  <Users
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    Total Users
                  </p>
                  <p
                    className={`text-xl font-semibold transition-colors ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {users.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Active Users */}
            <div
              className={`rounded-lg border p-4 transition-colors ${
                isDarkMode
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDarkMode ? "bg-green-900/30" : "bg-green-100"
                  }`}
                >
                  <UserCheck
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-green-400" : "text-green-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    Active Users
                  </p>
                  <p
                    className={`text-xl font-semibold transition-colors ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {users.filter((user) => user.status === "active").length}
                  </p>
                </div>
              </div>
            </div>

            {/* Inactive Users */}
            <div
              className={`rounded-lg border p-4 transition-colors ${
                isDarkMode
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDarkMode ? "bg-orange-900/30" : "bg-orange-100"
                  }`}
                >
                  <UserX
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-orange-400" : "text-orange-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-orange-400" : "text-orange-600"
                    }`}
                  >
                    Inactive Users
                  </p>
                  <p
                    className={`text-xl font-semibold transition-colors ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {users.filter((user) => user.status === "inactive").length}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Stores */}
            <div
              className={`rounded-lg border p-4 transition-colors ${
                isDarkMode
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDarkMode ? "bg-purple-900/30" : "bg-purple-100"
                  }`}
                >
                  <Store
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-purple-400" : "text-purple-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-purple-400" : "text-purple-600"
                    }`}
                  >
                    Total Stores
                  </p>
                  <p
                    className={`text-xl font-semibold transition-colors ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {stores.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
            </div>
          </div>

      {/* Users List */}
      <div className="px-4 sm:px-6 lg:px-8 pb-6">
        {/* Desktop Table Header (hidden on mobile) */}
        <div
          className={`hidden lg:block rounded-t-lg shadow-sm border border-b-0 ${
            isDarkMode
              ? "bg-gray-900 border-gray-700 "
              : "bg-white border-gray-200"
          }`}
        >
          <div
            className={`px-6 py-4 border-b ${
              isDarkMode
                ? "border-gray-700 bg-gray-700"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div
              className={`grid grid-cols-12 gap-4 text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <div className="col-span-4">USER</div>
              <div className="col-span-4">STORE ACCESS</div>
              <div className="col-span-2">STATUS</div>
              <div className="col-span-2">ACTIONS</div>
            </div>
          </div>
        </div>

        {/* Users Container */}
        <div
          className={`space-y-3 lg:space-y-0 lg:rounded-b-lg lg:shadow-sm lg:border lg:border-t-0  ${
            isDarkMode
              ? "lg:bg-gray-900 lg:border-gray-700"
              : "lg:bg-white lg:border-gray-200"
          }`}
        >
          {paginatedUsers.length > 0 ? (
            <>
              {/* Mobile Accordion View */}
              <div className="lg:hidden space-y-3">
                {paginatedUsers.map((user, index) => (
                  <UserAccordionItem
                    key={user._id}
                    user={user}
                    index={index}
                    startIndex={startIndex}
                  />
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block divide-y divide-gray-200">
                {paginatedUsers.map((user, index) => {
                  const userStores = stores.filter((store) => {
                    const storeUserId =
                      typeof store.user[0] === "object"
                        ? store.user[0]._id
                        : store.user[0];
                    return storeUserId === user._id;
                  });

                  return (
                    <div
                      key={user._id}
                      className={`px-6 py-4 transition-colors ${
                        isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* User Info */}
                        <div className="col-span-4">
                          <div className="flex items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                                isDarkMode ? "bg-gray-700" : "bg-gray-100"
                              }`}
                            >
                              <span
                                className={`text-sm font-medium ${
                                  isDarkMode ? "text-gray-300" : "text-black"
                                }`}
                              >
                                {startIndex + index + 1}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`text-sm font-medium capitalize ${
                                    isDarkMode ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  {(user.email || "")
                                    .split("@")[0]
                                    .replace(/[^a-zA-Z]/g, " ")}
                                </div>
                                <span
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                                    user.role === "admin"
                                      ? isDarkMode
                                        ? "bg-purple-900/30 text-purple-400"
                                        : "bg-purple-100 text-purple-700"
                                      : isDarkMode
                                      ? "bg-gray-700 text-gray-400"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {user.role === "admin" ? "Admin" : "User"}
                                </span>
                              </div>
                              <div
                                className={`text-sm ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Store Access */}
                        <div className="col-span-4">
                          <div className="flex flex-wrap gap-1">
                            {userStores.length > 0 ? (
                              <>
                                {userStores.slice(0, 3).map((store, idx) => (
                                  <span
                                    key={idx}
                                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                                      isDarkMode
                                        ? "bg-gray-700 text-gray-300"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {store.name}
                                  </span>
                                ))}
                                {userStores.length > 3 && (
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                                      isDarkMode
                                        ? "bg-green-900/20 text-green-400"
                                        : "bg-green-100 text-green-700"
                                    }`}
                                  >
                                    +{userStores.length - 3} more
                                  </span>
                                )}
                              </>
                            ) : (
                              <span
                                className={`text-sm ${
                                  isDarkMode ? "text-gray-500" : "text-gray-400"
                                }`}
                              >
                                No stores assigned
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status */}
                        <div className="col-span-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.status === "active"
                                ? isDarkMode
                                  ? "bg-green-900/20 text-green-400"
                                  : "bg-green-100 text-green-800"
                                : isDarkMode
                                ? "bg-red-900/20 text-red-400"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            <svg
                              className={`w-1.5 h-1.5 mr-1.5 ${
                                user.status === "active"
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 8 8"
                            >
                              <circle cx={4} cy={4} r={3} />
                            </svg>
                            {user.status}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <div className="relative dropdown-container">
                              <button
                                onClick={() =>
                                  setDropdownOpen(
                                    dropdownOpen === user._id ? null : user._id
                                  )
                                }
                                className={`h-6 w-6 cursor-pointer ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                <EllipsisVertical className="w-4 h-4" />
                              </button>

                              {dropdownOpen === user._id && (
                                <div
                                  className={`absolute w-56 border rounded-xl shadow-xl z-10 overflow-hidden ${
                                    // Position dropdown to prevent overflow
                                    index >= paginatedUsers.length - 4
                                      ? "bottom-8 right-0" // For last two rows, show above
                                      : "right-0 mt-2" // For other rows, show below
                                  } ${
                                    isDarkMode
                                      ? "bg-gray-900 border-gray-700"
                                      : "bg-white border-gray-200"
                                  }`}
                                >
                                  <button
                                    onClick={() => {
                                      setSelectedUserDetails(user);
                                      setIsUserDetailsModalOpen(true);
                                      setIsUserDetailsVisible(false);
                                      setDropdownOpen(null);
                                    }}
                                    className={`w-full px-4 py-3 text-sm text-left flex items-center transition-colors border-b ${
                                      isDarkMode
                                        ? "text-gray-300 hover:bg-gray-800 border-gray-600"
                                        : "text-gray-700 hover:bg-gray-50 border-gray-100"
                                    }`}
                                  >
                                    <Eye
                                      className={`h-4 w-4 mr-3 ${
                                        isDarkMode
                                          ? "text-gray-500"
                                          : "text-gray-400"
                                      }`}
                                    />
                                    <span className="font-medium">
                                      View Details
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setIsEditModalOpen(true);
                                      setUser(user);
                                      setDropdownOpen(null);
                                    }}
                                    className={`w-full px-4 py-3 text-sm text-left flex items-center transition-colors border-b ${
                                      isDarkMode
                                        ? "text-gray-300 hover:bg-gray-800 border-gray-600"
                                        : "text-gray-700 hover:bg-gray-50 border-gray-100"
                                    }`}
                                  >
                                    <Pencil
                                      className={`h-4 w-4 mr-3 ${
                                        isDarkMode
                                          ? "text-gray-500"
                                          : "text-gray-400"
                                      }`}
                                    />
                                    <span className="font-medium">
                                      Edit User
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleForceLogout(user._id);
                                      setDropdownOpen(null);
                                    }}
                                    className={`w-full px-4 py-3 text-sm text-left flex items-center transition-colors border-b ${
                                      isDarkMode
                                        ? "text-orange-400 hover:bg-orange-900/20 border-gray-600"
                                        : "text-orange-600 hover:bg-orange-50 border-gray-100"
                                    }`}
                                  >
                                    <LogOut
                                      className={`h-4 w-4 mr-3 ${
                                        isDarkMode
                                          ? "text-orange-400"
                                          : "text-orange-500"
                                      }`}
                                    />
                                    <span className="font-medium">Force Logout</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setModelUserId(user._id);
                                      setShowDeleteModal(true);
                                      setDropdownOpen(null);
                                    }}
                                    className={`w-full px-4 py-3 text-sm text-left flex items-center transition-colors ${
                                      isDarkMode
                                        ? "text-red-400 hover:bg-red-900/20"
                                        : "text-red-600 hover:bg-red-50"
                                    }`}
                                  >
                                    <Trash2
                                      className={`h-4 w-4 mr-3 ${
                                        isDarkMode
                                          ? "text-red-400"
                                          : "text-red-500"
                                      }`}
                                    />
                                    <span className="font-medium">Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div
              className={`rounded-lg shadow-sm border px-6 py-12 text-center ${
                isDarkMode
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <svg
                className={`w-12 h-12 mx-auto mb-4 ${
                  isDarkMode ? "text-gray-600" : "text-gray-300"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No users found
              </p>
              <p
                className={`text-xs mt-1 ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Try adjusting your search criteria
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredUser.length > itemsPerPage && (
          <div
            className={`mt-3 lg:mt-0 rounded-lg ${
              isDarkMode ? "bg-gray-900" : "bg-white"
            }`}
          >
            {/* Mobile View */}
            <div className="lg:hidden">
              {/* Mobile Pagination Header */}
              <div
                className={`px-4 py-3 border-t ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <button
                  onClick={() => setIsPaginationExpanded(!isPaginationExpanded)}
                  className={`w-full flex items-center justify-between text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <span>
                    Page {currentPage} of {totalPages} • {filteredUser.length}{" "}
                    users
                  </span>
                  {isPaginationExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Mobile Pagination Content */}
              {isPaginationExpanded && (
                <div
                  className={`px-4 py-3 border-t space-y-4 ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  {/* Range Info */}
                  <div
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, filteredUser.length)} of{" "}
                    {filteredUser.length} users
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={goToPrevious}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 text-sm font-medium border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDarkMode
                          ? "text-gray-400 bg-gray-700 border-gray-600 hover:bg-gray-600 disabled:hover:bg-gray-800"
                          : "text-gray-500 bg-white border-gray-300 hover:bg-gray-50 disabled:hover:bg-white"
                      }`}
                    >
                      Previous
                    </button>

                    <div
                      className={`flex items-center space-x-2 text-sm font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <span>Page</span>
                      <span
                        className={`px-2 py-1 rounded ${
                          isDarkMode
                            ? "bg-gray-700 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {currentPage}
                      </span>
                      <span>of {totalPages}</span>
                    </div>

                    <button
                      onClick={goToNext}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 text-sm font-medium border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDarkMode
                          ? "text-gray-400 bg-gray-700 border-gray-600 hover:bg-gray-600 disabled:hover:bg-gray-800"
                          : "text-gray-500 bg-white border-gray-300 hover:bg-gray-50 disabled:hover:bg-white"
                      }`}
                    >
                      Next
                    </button>
                  </div>

                  {/* Page Number Grid - Mobile Optimized */}
                  <div className="grid grid-cols-6 gap-2">
                    {Array.from(
                      { length: Math.min(12, totalPages) },
                      (_, i) => {
                        let pageNumber;
                        if (totalPages <= 12) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 6) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 5) {
                          pageNumber = totalPages - 11 + i;
                        } else {
                          pageNumber = currentPage - 5 + i;
                        }

                        return (
                          <button
                            key={pageNumber}
                            onClick={() => goToPage(pageNumber)}
                            className={`px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
                              currentPage === pageNumber
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : isDarkMode
                                ? "text-gray-400 bg-gray-700 border border-gray-600 hover:bg-gray-600"
                                : "text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop View - Original Layout */}
            <div
              className={`hidden lg:flex px-6 py-4 border-t items-center justify-between ${
                isDarkMode
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div
                className={`flex items-center text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <span>
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredUser.length)} of{" "}
                  {filteredUser.length} users
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPrevious}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 text-sm font-medium border rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode
                      ? "text-gray-400 bg-gray-700 border-gray-600 hover:bg-gray-600 disabled:hover:bg-gray-800"
                      : "text-gray-500 bg-white border-gray-300 hover:bg-gray-50 disabled:hover:bg-white"
                  }`}
                >
                  Previous
                </button>

                <div className="flex items-center space-x-1">
                  {/* Page numbers */}
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
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : isDarkMode
                            ? "text-gray-400 bg-gray-700 border border-gray-600 hover:bg-gray-600"
                            : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
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
                  className={`px-3 py-2 text-sm font-medium border rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode
                      ? "text-gray-400 bg-gray-700 border-gray-600 hover:bg-gray-600 disabled:hover:bg-gray-800"
                      : "text-gray-500 bg-white border-gray-300 hover:bg-gray-50 disabled:hover:bg-white"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
        </>
      )}

      {/* Settings Section */}
      {activeTab === "settings" && (
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div
          className={`rounded-lg border shadow-sm overflow-hidden ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          {/* Settings Header */}
          <div
            className={`px-6 py-4 border-b ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <h2
              className={`text-lg font-semibold flex items-center gap-2 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <Database className="h-5 w-5" />
              Database Settings
            </h2>
            <p
              className={`text-sm mt-1 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Run database backup operations for different environments
            </p>
          </div>

          {/* Backup Actions */}
          <div className="px-6 py-5">
            <div className="space-y-4">
              <div>
                <h3
                  className={`text-sm font-medium mb-3 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Database Backups
                </h3>
                <div className="flex flex-wrap gap-3">
                  {/* Backup Dev Button */}
                  <div className="flex-1 min-w-[200px]">
                    <button
                      onClick={() => handleRunBackup("dev")}
                      disabled={backupLoading.dev || backupLoading.prod}
                      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDarkMode
                          ? "text-blue-400 bg-blue-900/20 hover:bg-blue-900/30 border-blue-800 hover:border-blue-700"
                          : "text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300"
                      }`}
                    >
                      {backupLoading.dev ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
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
                          Backing up...
                        </>
                      ) : (
                        <>
                          <Database className="w-4 h-4" />
                          Backup Dev
                        </>
                      )}
                    </button>
                    {backupLoading.dev && (
                      <div className="mt-2">
                        <div className={`w-full h-2 rounded-full overflow-hidden ${
                          isDarkMode ? "bg-gray-700" : "bg-gray-200"
                        }`}>
                          <div
                            className="h-full bg-blue-600 transition-all duration-300 ease-out"
                            style={{ width: `${backupProgress.dev}%` }}
                          ></div>
                        </div>
                        <p className={`text-xs mt-1 text-center ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}>
                          {backupProgress.dev}% complete
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Backup Prod Button */}
                  <div className="flex-1 min-w-[200px]">
                    <button
                      onClick={() => handleRunBackup("prod")}
                      disabled={backupLoading.dev || backupLoading.prod}
                      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDarkMode
                          ? "text-red-400 bg-red-900/20 hover:bg-red-900/30 border-red-800 hover:border-red-700"
                          : "text-red-700 bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300"
                      }`}
                    >
                      {backupLoading.prod ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
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
                          Backing up...
                        </>
                      ) : (
                        <>
                          <Database className="w-4 h-4" />
                          Backup Prod
                        </>
                      )}
                    </button>
                    {backupLoading.prod && (
                      <div className="mt-2">
                        <div className={`w-full h-2 rounded-full overflow-hidden ${
                          isDarkMode ? "bg-gray-700" : "bg-gray-200"
                        }`}>
                          <div
                            className="h-full bg-red-600 transition-all duration-300 ease-out"
                            style={{ width: `${backupProgress.prod}%` }}
                          ></div>
                        </div>
                        <p className={`text-xs mt-1 text-center ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}>
                          {backupProgress.prod}% complete
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <p
                  className={`text-xs mt-2 ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Run database backups for development or production environments. Backups are stored in S3.
                </p>
              </div>

              {/* Database Restore Section */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3
                  className={`text-sm font-medium mb-3 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Database Restore
                </h3>
                <div className="flex flex-wrap gap-3">
                  {/* Restore Dev */}
                  <div className="flex-1 min-w-[200px]">
                    <select
                      value={selectedBackup.dev?.prefix || ""}
                      onChange={(e) => {
                        const backup = backupsList.dev.find(b => b.prefix === e.target.value);
                        setSelectedBackup((prev) => ({ ...prev, dev: backup }));
                      }}
                      className={`w-full mb-2 px-3 py-2 text-sm border rounded-lg ${
                        isDarkMode
                          ? "border-gray-600 bg-gray-700 text-white"
                          : "border-gray-300 bg-white text-gray-900"
                      }`}
                      disabled={restoreLoading.dev || restoreLoading.prod}
                    >
                      <option value="">Select Dev Backup...</option>
                      {backupsList.dev.map((backup) => (
                        <option key={backup.prefix} value={backup.prefix}>
                          {backup.date}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleRunRestore("dev")}
                      disabled={restoreLoading.dev || restoreLoading.prod || !selectedBackup.dev}
                      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDarkMode
                          ? "text-green-400 bg-green-900/20 hover:bg-green-900/30 border-green-800 hover:border-green-700"
                          : "text-green-700 bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-300"
                      }`}
                    >
                      {restoreLoading.dev ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
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
                          Restoring...
                        </>
                      ) : (
                        <>
                          <Database className="w-4 h-4" />
                          Restore Dev
                        </>
                      )}
                    </button>
                    {restoreLoading.dev && (
                      <div className="mt-2">
                        <div className={`w-full h-2 rounded-full overflow-hidden ${
                          isDarkMode ? "bg-gray-700" : "bg-gray-200"
                        }`}>
                          <div
                            className="h-full bg-green-600 transition-all duration-300 ease-out"
                            style={{ width: `${restoreProgress.dev}%` }}
                          ></div>
                        </div>
                        <p className={`text-xs mt-1 text-center ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}>
                          {restoreProgress.dev}% complete
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Restore Prod */}
                  <div className="flex-1 min-w-[200px]">
                    <select
                      value={selectedBackup.prod?.prefix || ""}
                      onChange={(e) => {
                        const backup = backupsList.prod.find(b => b.prefix === e.target.value);
                        setSelectedBackup((prev) => ({ ...prev, prod: backup }));
                      }}
                      className={`w-full mb-2 px-3 py-2 text-sm border rounded-lg ${
                        isDarkMode
                          ? "border-gray-600 bg-gray-700 text-white"
                          : "border-gray-300 bg-white text-gray-900"
                      }`}
                      disabled={restoreLoading.dev || restoreLoading.prod}
                    >
                      <option value="">Select Prod Backup...</option>
                      {backupsList.prod.map((backup) => (
                        <option key={backup.prefix} value={backup.prefix}>
                          {backup.date}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleRunRestore("prod")}
                      disabled={restoreLoading.dev || restoreLoading.prod || !selectedBackup.prod}
                      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDarkMode
                          ? "text-orange-400 bg-orange-900/20 hover:bg-orange-900/30 border-orange-800 hover:border-orange-700"
                          : "text-orange-700 bg-orange-50 hover:bg-orange-100 border-orange-200 hover:border-orange-300"
                      }`}
                    >
                      {restoreLoading.prod ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
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
                          Restoring...
                        </>
                      ) : (
                        <>
                          <Database className="w-4 h-4" />
                          Restore Prod
                        </>
                      )}
                    </button>
                    {restoreLoading.prod && (
                      <div className="mt-2">
                        <div className={`w-full h-2 rounded-full overflow-hidden ${
                          isDarkMode ? "bg-gray-700" : "bg-gray-200"
                        }`}>
                          <div
                            className="h-full bg-orange-600 transition-all duration-300 ease-out"
                            style={{ width: `${restoreProgress.prod}%` }}
                          ></div>
                        </div>
                        <p className={`text-xs mt-1 text-center ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}>
                          {restoreProgress.prod}% complete
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <p
                  className={`text-xs mt-2 ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Select a backup from the dropdown and click restore. ⚠️ Warning: This will overwrite all current data!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Activity Tab Content */}
      {activeTab === "activity" && (
        <StoreActivitySection
          data={activityData}
          loading={activityLoading}
          isDarkMode={isDarkMode}
          onRefresh={fetchStoreActivity}
          token={token}
        />
      )}

      {activeTab === "adminControl" && (
        <AdminControlTab stores={stores} />
      )}

      {/* Modal for Edit User */}
      {isEditModalOpen && (
        <EditUser
          user={user}
          setIsEditModalOpen={setIsEditModalOpen}
          handleChangeUserStatus={handleChangeUserStatus}
          fetchUsers={fetchUsers}
        />
      )}

      {/* Modal for Creating New User */}
      {isModalOpen && (
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 ease-out flex items-center justify-end z-50 p-4 ${
            isAddUserVisible ? "bg-opacity-50" : "bg-opacity-0"
          }`}
          onClick={handleAddUserClose}
        >
          <div
            className={`rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col transform transition-transform duration-300 ease-out ${
              isAddUserVisible ? "translate-x-0" : "translate-x-full"
            } ${isDarkMode ? "bg-gray-900" : "bg-white"}`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Fixed */}
            <div
              className={`flex items-center justify-between p-6 border-b sticky top-0 z-10 rounded-t-lg ${
                isDarkMode
                  ? "border-gray-700 bg-gray-900"
                  : "border-gray-200 bg-white"
              }`}
            >
              <h2
                className={`flex gap-2 items-center text-xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <User className="h-5 w-5" />
                Add New User
              </h2>
              <button
                onClick={handleAddUserClose}
                className={`transition-colors ${
                  isDarkMode
                    ? "text-gray-500 hover:text-gray-300"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div
              className="flex-1 overflow-y-auto"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Information Section */}
                <div>
                  <h3
                    className={`text-lg font-medium mb-4 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Account Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label
                        className={`flex gap-2 items-center text-sm font-medium mb-2 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        <User className="h-4 w-4" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={newUser.email}
                        onChange={handleChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 accent-black ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                        }`}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div>
                  <h3
                    className={`flex gap-2 items-center text-lg font-medium mb-4 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <Lock className="h-5 w-5" />
                    Password Settings
                  </h3>
                  <div
                    className={`border rounded-lg p-4 space-y-4 ${
                      isDarkMode ? "border-gray-600" : "border-gray-200"
                    }`}
                  >
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Password *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={newUser.password}
                        onChange={handleChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 accent-black ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                        }`}
                        placeholder="Enter password"
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        name="confirm_password"
                        value={newUser.confirm_password}
                        onChange={handleChange}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 accent-black ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                        }`}
                        placeholder="Confirm password"
                      />
                    </div>
                    <div
                      className={`text-sm p-3 rounded-md ${
                        isDarkMode
                          ? "text-gray-300 bg-gray-700"
                          : "text-gray-600 bg-gray-50"
                      }`}
                    >
                      <p>
                        The new user will be created with{" "}
                        <span className="font-medium">active</span> status by
                        default.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Action Buttons - Fixed Footer */}
            <div
              className={`flex justify-end space-x-3 p-6 border-t rounded-b-lg ${
                isDarkMode
                  ? "border-gray-700 bg-gray-900"
                  : "border-gray-200 bg-white"
              }`}
            >
              <button
                type="button"
                onClick={handleAddUserClose}
                className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${
                  isDarkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className={`rounded-lg shadow-xl w-full max-w-md ${
              isDarkMode ? "bg-gray-900" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`px-6 py-4 border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <h2
                className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Delete User
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <p
                    className={`font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Are you sure you want to delete this user?
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "text-gray-300 bg-gray-700 hover:bg-gray-600"
                      : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Deleting..." : "Delete User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {isUserDetailsModalOpen && selectedUserDetails && (
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 ease-out flex items-center justify-end z-50 p-4 ${
            isUserDetailsVisible ? "bg-opacity-50" : "bg-opacity-0"
          }`}
          onClick={handleUserDetailsClose}
        >
          <div
            className={`rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col transform transition-transform duration-300 ease-out ${
              isUserDetailsVisible ? "translate-x-0" : "translate-x-full"
            } ${isDarkMode ? "bg-gray-900" : "bg-white"}`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Fixed */}
            <div
              className={`flex items-center justify-between p-6 border-b sticky top-0 z-10 rounded-t-lg ${
                isDarkMode
                  ? "border-gray-700 bg-gray-900"
                  : "border-gray-200 bg-white"
              }`}
            >
              <h2
                className={`flex gap-2 items-center text-xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <User className="h-5 w-5" />
                User Details
              </h2>
              <button
                onClick={handleUserDetailsClose}
                className={`transition-colors ${
                  isDarkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div
              className="flex-1 overflow-y-auto"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div className="p-6 space-y-6">
                {/* Basic Information Section */}
                <div>
                  <h3
                    className={`text-lg font-medium mb-4 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Full Name
                      </label>
                      <div
                        className={`w-full px-3 py-2 border rounded-md ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-white"
                            : "border-gray-300 bg-gray-50 text-gray-900"
                        }`}
                      >
                        {selectedUserDetails.email
                          .split("@")[0]
                          .replace(/[^a-zA-Z]/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </div>
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Email Address
                      </label>
                      <div
                        className={`w-full px-3 py-2 border rounded-md ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-white"
                            : "border-gray-300 bg-gray-50 text-gray-900"
                        }`}
                      >
                        {selectedUserDetails.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Information Section */}
                <div>
                  <h3
                    className={`text-lg font-medium mb-4 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Account Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Status
                      </label>
                      <div
                        className={`w-full px-3 py-2 border rounded-md ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700"
                            : "border-gray-300 bg-gray-50"
                        }`}
                      >
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            selectedUserDetails.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          <svg
                            className={`w-2 h-2 mr-1.5 ${
                              selectedUserDetails.status === "active"
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 8 8"
                          >
                            <circle cx={4} cy={4} r={3} />
                          </svg>
                          {selectedUserDetails.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Join Date
                      </label>
                      <div
                        className={`w-full px-3 py-2 border rounded-md ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-white"
                            : "border-gray-300 bg-gray-50 text-gray-900"
                        }`}
                      >
                        {new Date(
                          selectedUserDetails.createdAt
                        ).toLocaleDateString("en-CA")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Store Access Section */}
                <div>
                  <h3
                    className={`text-lg font-medium mb-4 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Store Access
                  </h3>
                  <div
                    className={`border rounded-lg p-4 ${
                      isDarkMode ? "border-gray-600" : "border-gray-200"
                    }`}
                  >
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const userStores = stores.filter((store) => {
                          const storeUserId =
                            typeof store.user[0] === "object"
                              ? store.user[0]._id
                              : store.user[0];
                          return storeUserId === selectedUserDetails._id;
                        });

                        if (userStores.length === 0) {
                          return (
                            <div className="w-full text-center py-4">
                              <div
                                className={`mb-2 ${
                                  isDarkMode ? "text-gray-500" : "text-gray-400"
                                }`}
                              >
                                <svg
                                  className="w-12 h-12 mx-auto"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                  />
                                </svg>
                              </div>
                              <span
                                className={`text-sm ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                No store access assigned
                              </span>
                            </div>
                          );
                        }

                        return userStores.map((store) => (
                          <span
                            key={store._id}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                          >
                            {store.name}
                          </span>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Fixed Footer */}
            <div
              className={`flex justify-end space-x-3 p-6 border-t rounded-b-lg ${
                isDarkMode
                  ? "border-gray-700 bg-gray-900"
                  : "border-gray-200 bg-white"
              }`}
            >
              <button
                type="button"
                onClick={handleUserDetailsClose}
                className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${
                  isDarkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleUserDetailsClose();
                  setTimeout(() => {
                    setIsEditModalOpen(true);
                    setUser(selectedUserDetails);
                  }, 300);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const formatRelativeTime = (date) => {
  if (!date) return "Never";
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
};

const StoreActivitySection = ({ data, loading, isDarkMode, onRefresh, token }) => {
  const [collapsed, setCollapsed] = useState({
    recently_active: false,
    cooling_down: false,
    inactive: false,
  });
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedStore, setSelectedStore] = useState(null);
  const [lastActivity, setLastActivity] = useState(null);
  const [lastActivityLoading, setLastActivityLoading] = useState(false);

  const fetchLastActivity = async (storeId) => {
    setLastActivity(null);
    setLastActivityLoading(true);
    try {
      const res = await api.get(`/admin/storeLastActivity/${storeId}`, {
        headers: { token },
      });
      if (res.data.success) setLastActivity(res.data.data);
    } catch {
      // silently fail — modal still shows store info
    } finally {
      setLastActivityLoading(false);
    }
  };

  const toggleSection = (key) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  const sortStores = (stores) => {
    return [...stores].sort((a, b) => {
      const timeA = new Date(a.lastActivity).getTime();
      const timeB = new Date(b.lastActivity).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });
  };

  const filterStores = (stores) => {
    if (showActiveOnly) {
      return stores.filter((store) => store.status === "active");
    }
    return stores;
  };

  const getFilteredCount = (stores) => filterStores(stores ?? []).length;

  const summaryCards = [
    {
      label: "Total Stores",
      value: showActiveOnly
        ? getFilteredCount([...(data?.recently_active ?? []), ...(data?.cooling_down ?? []), ...(data?.inactive ?? [])])
        : data?.summary?.total ?? "—",
      Icon: Store,
      color: isDarkMode ? "text-blue-400" : "text-blue-600",
      bg: isDarkMode ? "bg-blue-950/40" : "bg-blue-50",
      border: isDarkMode ? "border-blue-900" : "border-blue-100",
    },
    {
      label: "Recently Active",
      value: getFilteredCount(data?.recently_active),
      Icon: Activity,
      color: "text-emerald-500",
      bg: isDarkMode ? "bg-emerald-950/40" : "bg-emerald-50",
      border: isDarkMode ? "border-emerald-900" : "border-emerald-100",
    },
    {
      label: "Cooling Down",
      value: getFilteredCount(data?.cooling_down),
      Icon: AlertTriangle,
      color: "text-amber-500",
      bg: isDarkMode ? "bg-amber-950/40" : "bg-amber-50",
      border: isDarkMode ? "border-amber-900" : "border-amber-100",
    },
    {
      label: "Inactive",
      value: getFilteredCount(data?.inactive),
      Icon: XCircle,
      color: "text-red-500",
      bg: isDarkMode ? "bg-red-950/40" : "bg-red-50",
      border: isDarkMode ? "border-red-900" : "border-red-100",
    },
  ];

  const sections = [
    {
      key: "recently_active",
      label: "Recently Active",
      subtitle: "Active within 7 days",
      Icon: Clock,
      stores: sortStores(filterStores(data?.recently_active ?? [])),
      iconColor: "text-emerald-500",
      badgeBg: isDarkMode ? "bg-emerald-900/40 text-emerald-400" : "bg-emerald-100 text-emerald-700",
      dot: "bg-emerald-500",
      divider: isDarkMode ? "divide-gray-700/60" : "divide-gray-50",
      iconBg: isDarkMode ? "bg-emerald-950/60 border-emerald-900" : "bg-emerald-50 border-emerald-100",
    },
    {
      key: "cooling_down",
      label: "Cooling Down",
      subtitle: "7–30 days since last activity",
      Icon: AlertTriangle,
      stores: sortStores(filterStores(data?.cooling_down ?? [])),
      iconColor: "text-amber-500",
      badgeBg: isDarkMode ? "bg-amber-900/40 text-amber-400" : "bg-amber-100 text-amber-700",
      dot: "bg-amber-500",
      divider: isDarkMode ? "divide-gray-700/60" : "divide-gray-50",
      iconBg: isDarkMode ? "bg-amber-950/60 border-amber-900" : "bg-amber-50 border-amber-100",
    },
    {
      key: "inactive",
      label: "Inactive / Never Used",
      subtitle: "Over 30 days or no activity recorded",
      Icon: XCircle,
      stores: sortStores(filterStores(data?.inactive ?? [])),
      iconColor: "text-red-500",
      badgeBg: isDarkMode ? "bg-red-900/40 text-red-400" : "bg-red-100 text-red-700",
      dot: "bg-red-400",
      divider: isDarkMode ? "divide-gray-700/60" : "divide-gray-50",
      iconBg: isDarkMode ? "bg-red-950/60 border-red-900" : "bg-red-50 border-red-100",
    },
  ];

  const SkeletonPulse = ({ className }) => (
    <div
      className={`animate-pulse rounded ${
        isDarkMode ? "bg-gray-700" : "bg-gray-200"
      } ${className}`}
    />
  );

  return (
    <div className="px-4 sm:px-6 py-6 space-y-5">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p
            className={`text-xs font-medium tracking-wider uppercase ${
              isDarkMode ? "text-gray-500" : "text-gray-400"
            }`}
          >
            Updated {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Active Only Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Active Only
            </span>
            <div
              className={`relative w-10 h-5 rounded-full transition-colors ${
                showActiveOnly
                  ? "bg-emerald-500"
                  : isDarkMode
                  ? "bg-gray-600"
                  : "bg-gray-300"
              }`}
              onClick={() => setShowActiveOnly(!showActiveOnly)}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  showActiveOnly ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </div>
          </label>
          
          {/* Sort Order */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown size={12} className={isDarkMode ? "text-gray-500" : "text-gray-400"} />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className={`text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500 ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700 text-gray-300"
                  : "border-gray-200 bg-white text-gray-700"
              }`}
            >
              <option value="desc">Latest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isDarkMode
                ? "border-gray-600 text-gray-300 hover:bg-gray-700/60"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map(({ label, value, Icon, color, bg, border }) => (
          <div key={label} className={`rounded-xl border px-4 py-3.5 ${bg} ${border}`}>
            {loading ? (
              <div className="space-y-2.5">
                <SkeletonPulse className="h-3 w-20" />
                <SkeletonPulse className="h-7 w-12" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon size={12} className={color} />
                  <span
                    className={`text-xs font-medium ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                <p
                  className={`text-2xl font-bold tabular-nums ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {value}
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {loading
          ? [1, 2, 3].map((i) => (
              <div
                key={i}
                className={`rounded-xl border overflow-hidden ${
                  isDarkMode
                    ? "border-gray-700 bg-gray-800"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-3 px-5 py-4">
                  <SkeletonPulse className="w-8 h-8 rounded-lg" />
                  <div className="space-y-1.5 flex-1">
                    <SkeletonPulse className="h-4 w-32" />
                    <SkeletonPulse className="h-3 w-44" />
                  </div>
                </div>
                <div
                  className={`border-t ${
                    isDarkMode ? "border-gray-700" : "border-gray-100"
                  }`}
                >
                  {[1, 2, 3, 4].map((j) => (
                    <div
                      key={j}
                      className={`flex items-center justify-between px-5 py-3 border-b last:border-0 ${
                        isDarkMode
                          ? "border-gray-700/50"
                          : "border-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <SkeletonPulse className="w-1.5 h-1.5 rounded-full" />
                        <SkeletonPulse className="h-4 w-36" />
                        <SkeletonPulse className="h-5 w-12 rounded-full" />
                      </div>
                      <SkeletonPulse className="h-3 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            ))
          : sections.map(
              ({ key, label, subtitle, Icon, stores, iconColor, badgeBg, dot, divider, iconBg }) => {
                const isCollapsed = collapsed[key];
                return (
                  <div
                    key={key}
                    className={`rounded-xl border overflow-hidden transition-colors ${
                      isDarkMode
                        ? "border-gray-700 bg-gray-800"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <button
                      onClick={() => toggleSection(key)}
                      className={`w-full flex items-center justify-between px-5 py-4 transition-colors text-left ${
                        isDarkMode
                          ? "hover:bg-gray-700/40"
                          : "hover:bg-gray-50/80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border ${iconBg}`}
                        >
                          <Icon size={14} className={iconColor} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-semibold ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {label}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-semibold tabular-nums ${badgeBg}`}
                            >
                              {stores.length}
                            </span>
                          </div>
                          <p
                            className={`text-xs mt-0.5 ${
                              isDarkMode ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            {subtitle}
                          </p>
                        </div>
                      </div>
                      {isCollapsed ? (
                        <ChevronDown
                          size={15}
                          className={
                            isDarkMode ? "text-gray-500" : "text-gray-400"
                          }
                        />
                      ) : (
                        <ChevronUp
                          size={15}
                          className={
                            isDarkMode ? "text-gray-500" : "text-gray-400"
                          }
                        />
                      )}
                    </button>

                    {!isCollapsed && (
                      <div
                        className={`border-t ${
                          isDarkMode ? "border-gray-700" : "border-gray-100"
                        }`}
                      >
                        {stores.length === 0 ? (
                          <p
                            className={`px-5 py-7 text-center text-sm ${
                              isDarkMode ? "text-gray-600" : "text-gray-400"
                            }`}
                          >
                            No stores in this category
                          </p>
                        ) : (
                          <div className={`divide-y ${divider}`}>
                            {stores.map((store) => (
                              <div
                                key={store._id}
                                className={`flex items-center justify-between px-5 py-3 transition-colors cursor-pointer ${
                                  isDarkMode
                                    ? "hover:bg-gray-700/25"
                                    : "hover:bg-gray-50/60"
                                }`}
                                onClick={() => {
                                  setSelectedStore(store);
                                  fetchLastActivity(store._id);
                                }}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <span
                                    className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${dot}`}
                                  />
                                  <span
                                    className={`text-sm font-medium truncate ${
                                      isDarkMode
                                        ? "text-gray-200"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {store.name}
                                  </span>
                                  <span
                                    className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                                      store.status === "active"
                                        ? isDarkMode
                                          ? "bg-emerald-900/40 text-emerald-400"
                                          : "bg-emerald-100 text-emerald-700"
                                        : isDarkMode
                                        ? "bg-gray-700 text-gray-500"
                                        : "bg-gray-100 text-gray-500"
                                    }`}
                                  >
                                    {store.status}
                                  </span>
                                </div>
                                <span
                                  className={`flex-shrink-0 ml-3 text-xs tabular-nums ${
                                    isDarkMode
                                      ? "text-gray-500"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {formatRelativeTime(store.lastActivity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }
            )}
      </div>

      {/* Store Details Modal */}
      {selectedStore && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => { setSelectedStore(null); setLastActivity(null); }}
        >
          <div
            className={`rounded-xl shadow-xl w-full max-w-lg ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`flex items-center justify-between px-6 py-4 border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <h2
                className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Store Details
              </h2>
              <button
                onClick={() => { setSelectedStore(null); setLastActivity(null); }}
                className={isDarkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-600"}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className={`text-xs font-medium uppercase ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Store Name
                </p>
                <p className={`text-sm font-medium mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {selectedStore.name}
                </p>
              </div>
              <div>
                <p className={`text-xs font-medium uppercase ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Status
                </p>
                <p className={`mt-1`}>
                  <span
                    className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${
                      selectedStore.status === "active"
                        ? isDarkMode
                          ? "bg-emerald-900/40 text-emerald-400"
                          : "bg-emerald-100 text-emerald-700"
                        : isDarkMode
                        ? "bg-gray-700 text-gray-500"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {selectedStore.status}
                  </span>
                </p>
              </div>
              {/* Last Transaction Detail */}
              <div
                className={`rounded-lg border p-4 space-y-3 ${
                  isDarkMode
                    ? "border-gray-700 bg-gray-700/40"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <Clock size={11} />
                  Last Transaction
                </p>

                {lastActivityLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-3 rounded animate-pulse ${
                          isDarkMode ? "bg-gray-600" : "bg-gray-200"
                        }`}
                        style={{ width: `${[70, 50, 85][i - 1]}%` }}
                      />
                    ))}
                  </div>
                ) : lastActivity ? (
                  <div className="space-y-2.5">
                    {/* Points + time */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-lg font-bold tabular-nums ${
                          lastActivity.points >= 0
                            ? "text-emerald-500"
                            : "text-red-500"
                        }`}
                      >
                        {lastActivity.points >= 0 ? "+" : ""}
                        {lastActivity.points} pts
                      </span>
                      <span
                        className={`text-xs ${
                          isDarkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        {new Date(lastActivity.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Customer */}
                    {lastActivity.customer && (
                      <div className="flex items-start gap-1.5">
                        <span
                          className={`text-xs font-medium w-20 flex-shrink-0 ${
                            isDarkMode ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          Customer
                        </span>
                        <span
                          className={`text-xs ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          {lastActivity.customer.name}
                          {lastActivity.customer.phone &&
                            ` · ${lastActivity.customer.countryCode || ""}${lastActivity.customer.phone}`}
                        </span>
                      </div>
                    )}

                    {/* Bill ID */}
                    {lastActivity.billID && (
                      <div className="flex items-start gap-1.5">
                        <span
                          className={`text-xs font-medium w-20 flex-shrink-0 ${
                            isDarkMode ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          Bill ID
                        </span>
                        <span
                          className={`text-xs font-mono ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          {lastActivity.billID}
                        </span>
                      </div>
                    )}

                    {/* Outlet */}
                    {lastActivity.outlet && (
                      <div className="flex items-start gap-1.5">
                        <span
                          className={`text-xs font-medium w-20 flex-shrink-0 ${
                            isDarkMode ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          Outlet
                        </span>
                        <span
                          className={`text-xs ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          {lastActivity.outlet}
                        </span>
                      </div>
                    )}

                    {/* Remarks */}
                    {lastActivity.remarks && (
                      <div className="flex items-start gap-1.5">
                        <span
                          className={`text-xs font-medium w-20 flex-shrink-0 ${
                            isDarkMode ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          Remarks
                        </span>
                        <span
                          className={`text-xs ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          {lastActivity.remarks}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    No transactions recorded yet
                  </p>
                )}
              </div>
              {selectedStore.email && (
                <div>
                  <p className={`text-xs font-medium uppercase ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                    Email
                  </p>
                  <p className={`text-sm mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {selectedStore.email}
                  </p>
                </div>
              )}
              {selectedStore.phone && (
                <div>
                  <p className={`text-xs font-medium uppercase ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                    Phone
                  </p>
                  <p className={`text-sm mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {selectedStore.phone}
                  </p>
                </div>
              )}
              {selectedStore.user && selectedStore.user.length > 0 && (
                <div>
                  <p className={`text-xs font-medium uppercase ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                    Assigned User{selectedStore.user.length > 1 ? "s" : ""}
                  </p>
                  <div className="mt-1 space-y-1">
                    {selectedStore.user.map((user, index) => (
                      <p key={index} className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {user.email && `(${user.email})`}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {selectedStore.address && (
                <div>
                  <p className={`text-xs font-medium uppercase ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                    Address
                  </p>
                  <p className={`text-sm mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {selectedStore.address}
                  </p>
                </div>
              )}
              {selectedStore.category && (
                <div>
                  <p className={`text-xs font-medium uppercase ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                    Category
                  </p>
                  <p className={`text-sm mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {selectedStore.category}
                  </p>
                </div>
              )}
              {selectedStore.createdAt && (
                <div>
                  <p className={`text-xs font-medium uppercase ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                    Created At
                  </p>
                  <p className={`text-sm mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {new Date(selectedStore.createdAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            <div
              className={`flex justify-end px-6 py-4 border-t ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                onClick={() => { setSelectedStore(null); setLastActivity(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
