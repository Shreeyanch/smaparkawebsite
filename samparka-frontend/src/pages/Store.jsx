import React, { useEffect, useState } from "react";
import VisitModal from "../components/VisitModal";
import {
  MapPin,

  EllipsisVertical,
  Trash2,
  Pencil,
  ExternalLink,

  Plus,

  BadgeCheck,
  Search,

  StoreIcon,
  QrCode,
  ChartArea,
  KeyRound,
} from "lucide-react";
import Switch from "../components/Switch";
import { useNavigate } from "react-router-dom";
import api from "../api/config";
import { toast } from "sonner";
import LoadingSpinner from "../components/LoadingSpinner";
import EditStore from "./EditStore";
import ChangePIN from "./ChangePIN";
import CustomerCode from "./CustomerCode";
import AdminWheelModal from "../components/AdminWheelModal";
import ReservationSetting from "./ReservationSetting";
import CustomNotification from "./CustomNotification";
import ConfigModal from "../components/ConfigModal";
import CustomizeLoyaltyCard from "./CustomizeLoyalityCard";
import MessageNotificationSettingModal from "../components/MessageNotificationSettingModal";
import AddStore from "./admin/AddStore";
import AddStoreUser from "./user/AddStoreUser";
import Services from "./admin/Services";
import CreateOutlet from "./admin/CreateOutlet";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import StoreQRModal from "../components/StoreQRModal";

const Store = () => {
  const { isDarkMode } = useTheme();
  const [stores, setStores] = useState([]);

  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteOutletModal, setShowDeleteOutletModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [showAdminWheelModal, setShowAdminWheelModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showCustomNotificationModal, setShowCustomNotificationModal] =
    useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showLoyaltyCardModal, setShowLoyaltyCardModal] = useState(false);
  const [showMessageNotificationModal, setShowMessageNotificationModal] =
    useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [showAddStoreUserModal, setShowAddStoreUserModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showCreateOutletModal, setShowCreateOutletModal] = useState(false);
  const [showStoreQRModal, setShowStoreQRModal] = useState(false);
  const [showCustomerCodeModal, setShowCustomerCodeModal] = useState(false);
  const [customerCodeStore, setCustomerCodeStore] = useState(null);
  const [editStore, setEditStore] = useState(null);
  const [qrStore, setQrStore] = useState(null);
  const [visitStore, setVisitStore] = useState(null);
  const [changePinStore, setChangePinStore] = useState(null);
  const [wheelStore, setWheelStore] = useState(null);
  const [reservationStore, setReservationStore] = useState(null);
  const [customNotificationStore, setCustomNotificationStore] = useState(null);
  const [configStore, setConfigStore] = useState(null);
  const [loyaltyCardStore, setLoyaltyCardStore] = useState(null);
  const [messageNotificationStore, setMessageNotificationStore] =
    useState(null);
  const [servicesStore, setServicesStore] = useState(null);
  const [createOutletStore, setCreateOutletStore] = useState(null);
  const [deleteOutletId, setDeleteOutletId] = useState();
  const [modelStoreId, setModelStoreId] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;
  const [query, setQuery] = useState("");



  const getStoresAdmin = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/store", { headers: { token } });
      if (response.data.success) {
        setStores(response.data.stores);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };
  const getStoresClient = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/store/myStores", { headers: { token } });
      if (response.data.success) {
        setStores(response.data.stores);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (user && token) {
      if (user.role == "admin") {
        getStoresAdmin();
      } else {
        getStoresClient();
      }
    } else {
      navigate("/");
    }
  }, []);

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

  const handleDeleteOutlet = async (outletId) => {
    setIsLoading(true);
    try {
      const response = await api.delete(`/store/deleteOutlet/${outletId}`, {
        headers: { token },
      });
      if (response.data.success) {
        setShowDeleteOutletModal(false);
        toast.success(response.data.message, {
          duration: 2000,

          onAutoClose: () => window.location.reload(),
        });
      } else {
        toast.error(response.data.message, {
          duration: 2000,
        });
      }
    } catch (e) {
      setShowDeleteOutletModal(false);
      toast.error(e.message, {
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStore = async (storeId) => {
    setIsLoading(true);
    try {
      const response = await api.delete(
        `/store/deleteStore?storeId=${storeId}`,
        {
          headers: { token },
        }
      );
      if (response.data.success) {
        setShowModal(false);
        toast.success(response.data.message, {
          duration: 2000,

          onAutoClose: () => window.location.reload(),
        });
      } else {
        toast.error(response.data.message, {
          duration: 2000,
        });
      }
    } catch (e) {
      setShowModal(false);
      toast.error(e.message, {
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (storeId, currentStatus, subscriptionEndDate) => {
    // Check if store subscription has expired (only when trying to activate)
    if (currentStatus === "deactive" && subscriptionEndDate) {
      const endDate = new Date(subscriptionEndDate);
      const now = new Date();
      if (endDate < now) {
        toast.error("Cannot activate store. Subscription has expired. Please renew your subscription.", {
          duration: 3000,
        });
        return;
      }
    }

    setIsLoading(true);
    const newStatus = currentStatus === "active" ? "deactive" : "active";

    try {
      const response = await api.put(
        `/store/changeStoreStatus/${storeId}`,
        { status: newStatus },
        { headers: { token } }
      );

      if (response.data.success) {
        setStores((prevStores) =>
          prevStores.map((store) =>
            store._id === storeId ? { ...store, status: newStatus } : store
          )
        );

        toast.success(response.data.message, {
          duration: 2000,
        });
      } else {
        toast.error(response.data.message, {
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error(error.message, {
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [filter, setFilter] = useState("");

  const filteredStores = stores.filter((store) => {
    const matchesText = [store.name, store.location].some((field) =>
      field.toLowerCase().includes(query.toLowerCase())
    );

    const matchesStatus =
      filter === ""
        ? true // show all if no filter selected
        : store.status === filter;

    return matchesText && matchesStatus;
  });

  return (
    <div
      className={`px-2 sm:px-4 ml-0 lg:ml-64 min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-[#f2f5f9]"
        }`}
    >
      {isLoading && <LoadingSpinner />}

      {/* Header Section */}
      <div
        className={`flex flex-col lg:flex-row lg:items-center lg:justify-between w-full mb-6 p-4 border-b-2 gap-4 ${isDarkMode
          ? "bg-gray-900 border-gray-700"
          : "bg-[#f2f5f9] border-gray-200"
          }`}
      >
        {/* Left: Title and Total */}
        <div className="flex flex-col gap-2">
          <h1
            className={`text-2xl font-medium ${isDarkMode ? "text-white" : "text-black"
              }`}
          >
            Stores
          </h1>
          <span
            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-black"}`}
          >
            Total: {filteredStores ? filteredStores.length : 0}
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          {/* My QR */}
          {user.role == "user" && stores.length > 0 && (
            <button
              onClick={() => {
                setQrStore(stores[0]);
                setShowStoreQRModal(true);
              }}
              className={`flex items-center gap-2 py-2 px-6 rounded-lg border transition-colors ${isDarkMode
                ? "bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
            >
              <QrCode className="w-4 h-4" />
              My App's QR
            </button>
          )}

          {/* Outlets - Only show for users with stores that have outlets */}
          {user.role == "user" && stores.length > 0 && stores.some(s => s.services?.multipleOutlets && s.outlets?.length > 0) ? (
            <button
              onClick={() => {
                setVisitStore(stores[0]);
                setShowVisitModal(true);
              }}
              className={`flex items-center gap-2 py-2 px-6 rounded-lg border transition-colors ${isDarkMode
                ? "bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
            >
              <MapPin className="w-4 h-4" />
              Subadmin
            </button>
          ) : user.role == "user" && stores.length > 0 && (
            <button
              onClick={() => {
                const store = stores[0];
                const baseUrl = import.meta.env.VITE_CLIENT_BASE_URL.replace(/^https?:\/\//, '');
                const protocol = baseUrl.includes('localhost') ? 'http' : 'https';
                const url = `${protocol}://${store.url}.${baseUrl}/store/points`;
                window.open(url, '_blank');
              }}
              className={`flex items-center gap-2 py-2 px-6 rounded-lg border transition-colors ${isDarkMode
                ? "bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
            >
              <ExternalLink className="w-4 h-4" />
              Visit Outlet
            </button>
          )}


          {/* Center: Search Bar - Admin only */}
          {user.role === "admin" && (
            <div className="relative w-full md:max-w-md lg:mx-2 lg:flex-1">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-gray-500" : "text-gray-500"
                  }`}
                size={20}
              />
              <input
                type="text"
                placeholder="Search by store name or location"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`w-full rounded-lg pl-10 pr-4 py-2 border focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${isDarkMode
                  ? "bg-gray-800 text-gray-200 border-gray-600 placeholder-gray-400"
                  : "bg-white text-gray-700 border-gray-200"
                  }`}
              />
            </div>
          )}

          {/* Right: Filter Dropdown - Admin only */}
          {user.role === "admin" && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={`px-4 py-2 pr-8 rounded-lg border focus:outline-none focus:ring-1 focus:ring-green-500 appearance-none bg-no-repeat bg-[position:right_12px_center] ${isDarkMode
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
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="deactive">Inactive</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Empty State for Users with No Stores */}
      {user.role !== "admin" && stores.length === 0 && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          <div
            onClick={() => setShowAddStoreUserModal(true)}
            className={`border-2 border-dashed p-6 rounded-lg flex flex-col items-center justify-center min-h-[300px] cursor-pointer transition-colors ${isDarkMode
              ? "bg-gray-800 border-gray-600 hover:border-blue-500 hover:bg-gray-800"
              : "bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
            >
              <Plus
                size={24}
                className={`${isDarkMode ? "text-gray-400" : "text-gray-400"}`}
              />
            </div>
            <span
              className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              Create New Store
            </span>

          </div>
        </div>
      )}

      {/* Store List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {/* Create New Store */}
        {user.role == "admin" && (
          <div
            onClick={() => setShowAddStoreModal(true)}
            className={`border-2 border-dashed p-6 rounded-lg flex flex-col items-center justify-center min-h-[200px] cursor-pointer transition-colors ${isDarkMode
              ? "bg-gray-800 border-gray-600 hover:border-blue-500 hover:bg-gray-800"
              : "bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
            >
              <Plus
                size={24}
                className={`${isDarkMode ? "text-gray-400" : "text-gray-400"}`}
              />
            </div>
            <span
              className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              Create New Store
            </span>

          </div>
        )}
        {filteredStores.length > 0 ? (
          filteredStores.map((store, index) => (
            <div
              key={index}
              className={`p-8 rounded-lg shadow-md relative ${isDarkMode
                ? "bg-gray-900 border-2 p-4 rounded-xl border-gray-600"
                : "bg-white"
                }`}
            >
              {/* Top Section: Logo, Status Badge, and Menu */}
              <div className="flex justify-between items-center mb-6">
                <img
                  src={store.logo}
                  alt={store.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex items-center gap-3 flex-1 justify-end">
                  {/* Toggle Switch */}
                  {(() => {
                    const isExpired = store.subscriptionEndDate && new Date(store.subscriptionEndDate) < new Date();
                    const isDisabled = isExpired && store.status === "deactive";
                    const canToggle = user.role === "admin" && !isDisabled;
                    return (
                      <div
                        onClick={() => canToggle && handleStatusChange(store._id, store.status, store.subscriptionEndDate)}
                        title={
                          user.role !== "admin"
                            ? "Only admins can change store status"
                            : isDisabled
                              ? "Subscription expired. Please renew to activate."
                              : ""
                        }
                        className={`relative inline-flex h-8 w-24 items-center rounded-full transition-colors duration-200 ${canToggle ? "cursor-pointer" : "cursor-not-allowed"
                          } ${store.status === "active"
                            ? isDarkMode
                              ? "bg-green-900/30"
                              : "bg-[#E8FFF3]"
                            : isDarkMode
                              ? "bg-red-900/30"
                              : "bg-[#FFE8E8]"
                          }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full transition-transform duration-200 shadow-md ${store.status === "active"
                            ? isDarkMode
                              ? "bg-green-500 translate-x-[68px]"
                              : "bg-[#59D2A4] translate-x-[68px]"
                            : isDarkMode
                              ? "bg-red-500 translate-x-1"
                              : "bg-[#DF5757] translate-x-1"
                            }`}
                        />
                        <span
                          className={`absolute inset-0 flex items-center justify-center text-xs font-semibold ${store.status === "active"
                            ? isDarkMode
                              ? "pr-8 text-green-400"
                              : "pr-8 text-[#59D2A4]"
                            : isDarkMode
                              ? "pl-8 text-red-400"
                              : "pl-8 text-[#DF5757]"
                            }`}
                        >
                          {store.status === "active" ? "Active" : isExpired ? "Expired" : "Inactive"}
                        </span>
                      </div>
                    );
                  })()}
                  <div className="relative dropdown-container">
                    <EllipsisVertical
                      className={`h-6 w-6 cursor-pointer ${isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      onClick={() =>
                        setDropdownOpen(
                          dropdownOpen === store._id ? null : store._id
                        )
                      }
                    />
                    {dropdownOpen === store._id && (
                      <div
                        className={`absolute right-0 mt-2 w-56 border rounded-xl shadow-xl z-10 overflow-hidden ${isDarkMode
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white border-gray-200"
                          }`}
                      >
                        {/* visit - Admin only */}
                        {user.role === "admin" && (
                          <>
                            {store.services.multipleOutlets ? (
                              <>
                                <div className="relative">
                                  <button
                                    className={`w-full px-4 py-3 text-sm text-left flex items-center justify-between transition-colors border-b last:border-b-0 ${isDarkMode
                                      ? "text-gray-300 hover:bg-gray-800 border-gray-700"
                                      : "text-gray-700 hover:bg-gray-50 border-gray-100"
                                      }`}
                                    onClick={() => {
                                      setVisitStore(store);
                                      setShowVisitModal(true);
                                      setDropdownOpen(null);
                                    }}
                                  >
                                    <div className="flex items-center">
                                      <ExternalLink
                                        className={`h-4 w-4 mr-3 ${isDarkMode
                                          ? "text-gray-500"
                                          : "text-gray-400"
                                          }`}
                                      />
                                      <span className="font-medium">Visit</span>
                                    </div>
                                  </button>
                                </div>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setVisitStore(store);
                                  setShowVisitModal(true);
                                  setDropdownOpen(null);
                                }}
                                className={`w-full px-4 py-3 text-sm text-left flex items-center transition-colors border-b ${isDarkMode
                                  ? "text-gray-300 hover:bg-gray-800 border-gray-700"
                                  : "text-gray-700 hover:bg-gray-50 border-gray-100"
                                  }`}
                              >
                                <ExternalLink
                                  className={`h-4 w-4 mr-3 ${isDarkMode ? "text-gray-500" : "text-gray-400"
                                    }`}
                                />
                                <span className="font-medium">Visit</span>
                              </button>
                            )}
                          </>
                        )}

                        {/* edit */}
                        <button
                          onClick={() => {
                            setEditStore(store);
                            setShowEditModal(true);
                            setDropdownOpen(null);
                          }}
                          className={`w-full px-4 py-3 text-sm text-left flex items-center transition-colors border-b ${isDarkMode
                            ? "text-gray-300 hover:bg-gray-800 border-gray-700"
                            : "text-gray-700 hover:bg-gray-50 border-gray-100"
                            }`}
                        >
                          <Pencil
                            className={`h-4 w-4 mr-3 ${isDarkMode ? "text-gray-500" : "text-gray-400"
                              }`}
                          />
                          <span className="font-medium">Edit</span>
                        </button>

                        {/* customer code */}
                        <button
                          onClick={() => {
                            setCustomerCodeStore(store);
                            setShowCustomerCodeModal(true);
                            setDropdownOpen(null);
                          }}
                          className={`w-full px-4 py-3 text-sm text-left flex items-center transition-colors border-b ${isDarkMode
                            ? "text-gray-300 hover:bg-gray-800 border-gray-700"
                            : "text-gray-700 hover:bg-gray-50 border-gray-100"
                            }`}
                        >
                          <KeyRound
                            className={`h-4 w-4 mr-3 ${isDarkMode ? "text-gray-500" : "text-gray-400"
                              }`}
                          />
                          <span className="font-medium">Customer Code</span>
                        </button>

                        {/* visit - Admin only */}
                        {user.role === "admin" && (
                          <>
                            <div className="relative">
                              <button
                                className={`w-full px-4 py-3 text-sm text-left flex items-center justify-between transition-colors border-b last:border-b-0 ${isDarkMode
                                  ? "text-gray-300 hover:bg-gray-800 border-gray-700"
                                  : "text-gray-700 hover:bg-gray-50 border-gray-100"
                                  }`}
                                onClick={() => {
                                  setQrStore(store);
                                  setShowStoreQRModal(true);
                                  setDropdownOpen(null);
                                }}
                              >
                                <div className="flex items-center">
                                  <QrCode className={`h-4 w-4 mr-3 ${isDarkMode
                                    ? "text-gray-500"
                                    : "text-gray-400"
                                    }`} />

                                  <span className="font-medium">QR Stand</span>
                                </div>
                              </button>
                            </div>
                          </>
                        )}

                        {/* change pin */}
                        {/* <button
                          onClick={() => {
                            setChangePinStore(store);
                            setShowChangePinModal(true);
                            setDropdownOpen(null);
                          }}
                          className={`w-full px-4 py-3 text-sm text-left flex items-center transition-colors border-b ${isDarkMode
                            ? "text-gray-300 hover:bg-gray-800 border-gray-700"
                            : "text-gray-700 hover:bg-gray-50 border-gray-100"
                            }`}
                        >
                          <Asterisk
                            className={`h-4 w-4 mr-3 ${isDarkMode ? "text-gray-500" : "text-gray-400"
                              }`}
                          />
                          <span className="font-medium">Change PIN</span>
                        </button> */}

                        {/* loyality card */}
                        {/* <button
                          onClick={() => {
                            setLoyaltyCardStore(store);
                            setShowLoyaltyCardModal(true);
                            setDropdownOpen(null);
                          }}
                          className={`w-full px-4 py-3 text-sm text-left flex items-center transition-colors border-b ${isDarkMode
                            ? "text-gray-300 hover:bg-gray-800 border-gray-700"
                            : "text-gray-700 hover:bg-gray-50 border-gray-100"
                            }`}
                        >
                          <IdCard
                            className={`h-4 w-4 mr-3 ${isDarkMode ? "text-gray-500" : "text-gray-400"
                              }`}
                          />
                          <span className="font-medium">Loyalty Card</span>
                        </button> */}

                        {/* Spin The Wheel */}
                        {/* {(store.loyaltyCard?.format == "L1" ||
                          store.loyaltyCard?.format == "L2") && (
                            <button
                              onClick={() => {
                                setWheelStore(store);
                                setShowAdminWheelModal(true);
                                setDropdownOpen(null);
                              }}
                              className={`w-full px-4 py-3 text-sm text-left flex items-center transition-colors border-b ${
                                isDarkMode 
                                  ? 'text-gray-300 hover:bg-gray-800 border-gray-700' 
                                  : 'text-gray-700 hover:bg-gray-50 border-gray-100'
                              }`}
                            >
                              <ShipWheel className={`h-4 w-4 mr-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                              <span className="font-medium">Spin The Wheel</span>
                            </button>
                          )} */}

                        {user.role == "admin" && (
                          <>
                            <button
                              onClick={() => {
                                setServicesStore(store);
                                setShowServicesModal(true);
                                setDropdownOpen(null);
                              }}
                              className={`w-full px-4 py-3 text-sm text-left flex items-center transition-colors border-b ${isDarkMode
                                ? "text-gray-300 hover:bg-gray-800 border-gray-700"
                                : "text-gray-700 hover:bg-gray-50 border-gray-100"
                                }`}
                            >
                              <BadgeCheck
                                className={`h-4 w-4 mr-3 ${isDarkMode ? "text-gray-500" : "text-gray-400"
                                  }`}
                              />
                              <span className="font-medium">Services</span>
                            </button>
                            {store.services.multipleOutlets && (
                              <button
                                onClick={() => {
                                  setCreateOutletStore(store);
                                  setShowCreateOutletModal(true);
                                  setDropdownOpen(null);
                                }}
                                className={`w-full px-4 py-3 text-sm text-left flex items-center transition-colors border-b ${isDarkMode
                                  ? "text-gray-300 hover:bg-gray-800 border-gray-700"
                                  : "text-gray-700 hover:bg-gray-50 border-gray-100"
                                  }`}
                              >
                                <StoreIcon
                                  className={`h-4 w-4 mr-3 ${isDarkMode
                                    ? "text-gray-500"
                                    : "text-gray-400"
                                    }`}
                                />
                                <span className="font-medium">
                                  Create Outlet
                                </span>
                              </button>
                            )}
                          </>
                        )}

                        {/* on going offers */}
                        {/* {store.services.onGoingOffers && (
                          <button
                            onClick={() => {
                              setDropdownOpen(null);
                              navigate("/offer");
                            }}
                            className={`w-full px-4 py-3 text-sm text-left flex items-center transition-colors border-b ${isDarkMode
                              ? "text-gray-300 hover:bg-gray-800 border-gray-700"
                              : "text-gray-700 hover:bg-gray-50 border-gray-100"
                              }`}
                          >
                            <Gift
                              className={`h-4 w-4 mr-3 ${isDarkMode ? "text-gray-500" : "text-gray-400"
                                }`}
                            />
                            <span className="font-medium">Offers</span>
                          </button>
                        )} */}

                        {/* reservation */}
                        {/* {store.services.reservation && (
                          <button
                            onClick={() => {
                              setReservationStore(store);
                              setShowReservationModal(true);
                              setDropdownOpen(null);
                            }}
                            className={`w-full px-4 py-3 text-sm text-left flex items-center transition-colors border-b ${isDarkMode
                              ? "text-gray-300 hover:bg-gray-800 border-gray-700"
                              : "text-gray-700 hover:bg-gray-50 border-gray-100"
                              }`}
                          >
                            <CalendarCheck
                              className={`h-4 w-4 mr-3 ${isDarkMode ? "text-gray-500" : "text-gray-400"
                                }`}
                            />
                            <span className="font-medium">
                              Reservation Setting
                            </span>
                          </button>
                        )} */}


                        {/* customNotification */}
                        {/* <button
                          onClick={() => {
                            setCustomNotificationStore(store);
                            setShowCustomNotificationModal(true);
                            setDropdownOpen(null);
                          }}
                          className={`w-full px-4 py-3 text-sm text-left flex items-center transition-colors border-b ${isDarkMode
                            ? "text-gray-300 hover:bg-gray-800 border-gray-700"
                            : "text-gray-700 hover:bg-gray-50 border-gray-100"
                            }`}
                        >
                          <BellRing
                            className={`h-4 w-4 mr-3 ${isDarkMode ? "text-gray-500" : "text-gray-400"
                              }`}
                          />
                          <span className="font-medium">
                            Custom Notification
                          </span>
                        </button> */}

                        {/* config */}
                        {/* <button
                          onClick={() => {
                            setConfigStore(store);
                            setShowConfigModal(true);
                            setDropdownOpen(null);
                          }}
                          className={`w-full px-4 py-3 text-sm text-left flex items-center transition-colors border-b ${isDarkMode
                            ? "text-gray-300 hover:bg-gray-800 border-gray-700"
                            : "text-gray-700 hover:bg-gray-50 border-gray-100"
                            }`}
                        >
                          <Settings
                            className={`h-4 w-4 mr-3 ${isDarkMode ? "text-gray-500" : "text-gray-400"
                              }`}
                          />
                          <span className="font-medium">Config</span>
                        </button> */}

                        {/* Message Notification Setting */}
                        {/* <button
                          onClick={() => {
                            setMessageNotificationStore(store);
                            setShowMessageNotificationModal(true);
                            setDropdownOpen(null);
                          }}
                          className={`w-full px-4 py-3 text-sm text-left flex items-center transition-colors border-b ${isDarkMode
                            ? "text-gray-300 hover:bg-gray-800 border-gray-700"
                            : "text-gray-700 hover:bg-gray-50 border-gray-100"
                            }`}
                        >
                          <BellPlus
                            className={`h-4 w-4 mr-3 ${isDarkMode ? "text-gray-500" : "text-gray-400"
                              }`}
                          />
                          <span className="font-medium">
                            Message/Notification Setting
                          </span>
                        </button> */}

                        {/* L4 Settlement - Admin only, L4 format stores only */}
                        {user.role === "admin" && store.loyaltyCard?.format === "L4" && (
                          <button
                            onClick={() => {
                              setDropdownOpen(null);
                              navigate("/l4-settlement-report", {
                                state: { storeId: store._id },
                              });
                            }}
                            className={`w-full px-4 py-3 text-sm text-left flex items-center transition-colors border-b ${isDarkMode
                              ? "text-gray-300 hover:bg-gray-800 border-gray-700"
                              : "text-gray-700 hover:bg-gray-50 border-gray-100"
                              }`}
                          >
                            <ChartArea
                              className={`h-4 w-4 mr-3 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                            />
                            <span className="font-medium">L4 Settlement</span>
                          </button>
                        )}

                        {user.role == "admin" && (
                          <button
                            onClick={() => {
                              setShowModal(true);
                              setModelStoreId(store._id);
                            }}
                            className={`w-full px-4 py-3 text-sm text-left flex items-center transition-colors ${isDarkMode
                              ? "text-red-400 hover:bg-red-900/20"
                              : "text-red-600 hover:bg-red-50"
                              }`}
                          >
                            <Trash2 className="h-4 w-4 mr-3 text-red-500" />
                            <span className="font-medium">Delete</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Store Name */}
              <h2
                className={`text-xl font-semibold mb-2 ${isDarkMode ? "text-white" : "text-black"
                  }`}
              >
                {store.name}
              </h2>

              {/* Location */}
              <p
                className={`mb-8 ${isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
              >
                {store.location}
              </p>

              {/* Date Information */}
              {store.subscriptionStartDate && store.subscriptionEndDate ? (
                <>
                  <div className="flex justify-between mb-12 gap-4">
                    <div
                      className={`text-left border-2 p-4 rounded-xl border-dashed ${isDarkMode ? "border-gray-600" : "border-gray-300"
                        }`}
                    >
                      <div
                        className={`text-lg font-semibold mb-1 ${isDarkMode ? "text-white" : "text-black"
                          }`}
                      >
                        {new Date(
                          store.subscriptionStartDate
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div
                        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                      >
                        Start Date
                      </div>
                    </div>
                    <div
                      className={`text-left border-2 p-4 rounded-xl border-dashed ${isDarkMode ? "border-gray-600" : "border-gray-300"
                        }`}
                    >
                      <div
                        className={`text-lg font-semibold mb-1 ${isDarkMode ? "text-white" : "text-black"
                          }`}
                      >
                        {new Date(store.subscriptionEndDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </div>
                      <div
                        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                      >
                        End Date
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    {(() => {
                      const startDate = new Date(store.subscriptionStartDate);
                      const endDate = new Date(store.subscriptionEndDate);
                      const currentDate = new Date();
                      const totalDays = Math.ceil(
                        (endDate - startDate) / (1000 * 60 * 60 * 24)
                      );
                      const elapsedDays = Math.ceil(
                        (currentDate - startDate) / (1000 * 60 * 60 * 24)
                      );
                      const progressPercentage = Math.min(
                        Math.max((elapsedDays / totalDays) * 100, 0),
                        100
                      );

                      // Determine color based on progress percentage
                      let progressColor = "bg-green-500"; // Default green (less than 50%)
                      if (progressPercentage >= 80) {
                        progressColor = "bg-red-500";
                      } else if (progressPercentage >= 50) {
                        progressColor = "bg-yellow-500";
                      }

                      return (
                        <div
                          className={`w-full rounded-full h-[5px] ${isDarkMode ? "bg-gray-700" : "bg-gray-300"
                            }`}
                        >
                          <div
                            className={`${progressColor} h-[5px] rounded-full transition-all duration-300`}
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Days Remaining */}
                  <div className="text-center text-gray-600 text-lg">
                    {(() => {
                      const daysRemaining = Math.max(
                        Math.ceil(
                          (new Date(store.subscriptionEndDate) - new Date()) /
                          (1000 * 60 * 60 * 24)
                        ),
                        0
                      );

                      if (daysRemaining === 0) {
                        return (
                          <span
                            className={`font-lg ${isDarkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                          >
                            Expired
                          </span>
                        );
                      } else {
                        return `${daysRemaining} Days Remaining`;
                      }
                    })()}
                  </div>
                </>
              ) : (
                <div
                  className={`text-center ${isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                >
                  <div className="flex justify-center mb-8 gap-4">
                    <div
                      className={`text-left border-2 p-4 rounded-xl border-dashed ${isDarkMode ? "border-gray-600" : "border-gray-300"
                        }`}
                    >
                      <div
                        className={`text-lg font-semibold mb-1 ${isDarkMode ? "text-white" : "text-black"
                          }`}
                      >
                        {new Date(store.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div
                        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                      >
                        Created Date
                      </div>
                    </div>
                  </div>

                  {/* <p className="text-sm mb-2">
                    <Calendar className="w-4 h-4 mr-1 inline" />
                    Created: {new Date(store.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <div className="flex justify-center">
                    <Switch
                      status={store.status === "active"}
                      onChange={() => handleStatusChange(store._id, store.status)}
                    />
                  </div> */}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 w-full flex justify-center">
            <div
              className={`text-lg max-w-2xl ${isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
            >

              Start managing your business, loyalty
              programs, and customer engagement by creating a new store.
            </div>
          </div>
        )}
      </div>

      {/* Delete Outlet Modal */}
      {showDeleteOutletModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[2000]"
          onClick={() => setShowDeleteOutletModal(false)}
        >
          <div
            className={`rounded-lg p-6 w-full max-w-lg mx-auto shadow-lg ${isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className={`text-xl font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"
                }`}
            >
              Delete Store
            </h2>
            <p
              className={`mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
            >
              Are you sure you want to delete this store?
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowDeleteOutletModal(false)}
                className={`font-semibold py-2 px-4 rounded-lg mr-2 transition-colors ${isDarkMode
                  ? "bg-gray-600 hover:bg-gray-800 text-gray-200"
                  : "bg-gray-300 hover:bg-gray-400 text-gray-800"
                  }`}
              >
                No
              </button>
              <button
                onClick={() => handleDeleteOutlet(deleteOutletId)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Store Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40"
          onClick={() => setShowModal(false)}
        >
          <div
            className={`lg:ml-64 rounded-lg p-6 w-full max-w-lg  shadow-lg ${isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className={`text-xl font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"
                }`}
            >
              Delete Store
            </h2>
            <p
              className={`mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
            >
              Are you sure you want to delete this store?
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowModal(false)}
                className={`font-semibold py-2 px-4 rounded-lg mr-2 transition-colors ${isDarkMode
                  ? "bg-gray-600 hover:bg-gray-800 text-gray-200"
                  : "bg-gray-300 hover:bg-gray-400 text-gray-800"
                  }`}
              >
                No
              </button>
              <button
                onClick={() => handleDeleteStore(modelStoreId)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Store Modal */}
      {showEditModal && editStore && (
        <EditStore
          store={editStore}
          onClose={() => {
            setShowEditModal(false);
            setEditStore(null);
          }}
          onSuccess={() => {
            // Refresh stores list after successful edit
            if (user.role === "admin") {
              getStoresAdmin();
            } else {
              getStoresClient();
            }
            setShowEditModal(false);
            setEditStore(null);
          }}
        />
      )}

      {/* Add Store Modal (Admin) */}
      {showAddStoreModal && (
        <AddStore
          onClose={() => {
            setShowAddStoreModal(false);
          }}
          onSuccess={() => {
            // Refresh stores list after successful add
            if (user.role === "admin") {
              getStoresAdmin();
            } else {
              getStoresClient();
            }
            setShowAddStoreModal(false);
          }}
        />
      )}

      {/* Add Store Modal (User) */}
      {showAddStoreUserModal && (
        <AddStoreUser
          onClose={() => {
            setShowAddStoreUserModal(false);
          }}
          onSuccess={() => {
            // Refresh stores list after successful add
            getStoresClient();
            setShowAddStoreUserModal(false);
          }}
        />
      )}

      {/* Change PIN Modal */}
      {showChangePinModal && changePinStore && (
        <ChangePIN
          store={changePinStore}
          isOpen={showChangePinModal}
          onClose={() => {
            setShowChangePinModal(false);
            setChangePinStore(null);
          }}
        />
      )}

      {/* Admin Wheel Modal */}
      {showAdminWheelModal && wheelStore && (
        <AdminWheelModal
          store={wheelStore}
          isOpen={showAdminWheelModal}
          onClose={() => {
            setShowAdminWheelModal(false);
            setWheelStore(null);
          }}
        />
      )}



      {/* Reservation Setting Modal */}
      {showReservationModal && reservationStore && (
        <ReservationSetting
          store={reservationStore}
          isOpen={showReservationModal}
          onClose={() => {
            setShowReservationModal(false);
            setReservationStore(null);
          }}
        />
      )}

      {/* Custom Notification Modal */}
      {showCustomNotificationModal && customNotificationStore && (
        <CustomNotification
          store={customNotificationStore}
          onClose={() => {
            setShowCustomNotificationModal(false);
            setCustomNotificationStore(null);
          }}
        />
      )}

      {/* Config Modal */}
      {showConfigModal && configStore && (
        <ConfigModal
          store={configStore}
          isOpen={showConfigModal}
          onClose={() => {
            setShowConfigModal(false);
            setConfigStore(null);
          }}
        />
      )}

      {/* Loyalty Card Modal */}
      {showLoyaltyCardModal && loyaltyCardStore && (
        <CustomizeLoyaltyCard
          store={loyaltyCardStore}
          onClose={() => {
            setShowLoyaltyCardModal(false);
            setLoyaltyCardStore(null);
          }}
        />
      )}

      {/* Message Notification Setting Modal */}
      {showMessageNotificationModal && messageNotificationStore && (
        <MessageNotificationSettingModal
          store={messageNotificationStore}
          isOpen={showMessageNotificationModal}
          onClose={() => {
            setShowMessageNotificationModal(false);
            setMessageNotificationStore(null);
          }}
        />
      )}

      {/* Services Modal */}
      {showServicesModal && servicesStore && (
        <Services
          store={servicesStore}
          onClose={() => {
            setShowServicesModal(false);
            setServicesStore(null);
          }}
          onSuccess={() => {
            // Refresh stores list after successful service update
            if (user.role === "admin") {
              getStoresAdmin();
            } else {
              getStoresClient();
            }
            // Don't close modal - let user close it manually
          }}
        />
      )}

      {/* Create Outlet Modal */}
      {showCreateOutletModal && createOutletStore && (
        <CreateOutlet
          store={createOutletStore}
          onClose={() => {
            setShowCreateOutletModal(false);
            setCreateOutletStore(null);
          }}
          onSuccess={() => {
            // Refresh stores list after successful outlet creation
            if (user.role === "admin") {
              getStoresAdmin();
            } else {
              getStoresClient();
            }
            setShowCreateOutletModal(false);
            setCreateOutletStore(null);
          }}
        />
      )}

      {/* Visit Modal */}
      <VisitModal
        isOpen={showVisitModal}
        visitStore={visitStore}
        onClose={() => {
          setShowVisitModal(false);
          setVisitStore(null);
        }}
      />

      {/* Customer Code Modal */}
      {showCustomerCodeModal && customerCodeStore && (
        <CustomerCode
          store={customerCodeStore}
          isOpen={showCustomerCodeModal}
          onClose={() => {
            setShowCustomerCodeModal(false);
            setCustomerCodeStore(null);
          }}
          onSuccess={(newCode) => {
            setStores((prev) =>
              prev.map((s) =>
                s._id === customerCodeStore._id
                  ? { ...s, customerCode: newCode }
                  : s
              )
            );
          }}
        />
      )}

      {/* Store QR Modal */}
      <StoreQRModal
        isOpen={showStoreQRModal}
        store={qrStore}
        onClose={() => {
          setShowStoreQRModal(false);
          setQrStore(null);
        }}
        onStoreUpdate={(updatedStore) => {
          setStores((prev) =>
            prev.map((s) => (s._id === updatedStore._id ? { ...s, ...updatedStore } : s))
          );
          setQrStore(updatedStore);
        }}
      />
    </div>
  );
};

export default Store;
