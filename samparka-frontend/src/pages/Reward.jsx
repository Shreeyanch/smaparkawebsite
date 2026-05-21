import React, { useEffect, useState } from "react";
import { Reorder } from "framer-motion";
import {
  Search,
  Plus,
  MoreVertical,
  Award,
  Trash2,
  Pencil,
  Copy,
  ChevronDown,
  ChevronRight,
  Percent,
  GripVertical,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/config";
import { toast } from "sonner";
import LoadingSpinner from "../components/LoadingSpinner";
import CreateRewardModal from "../components/CreateRewardModal";
import EditRewardModal from "../components/EditRewardModal";
import CreateConstantRewardModal from "../components/CreateConstantRewardModal";
import EditConstantRewardModal from "../components/EditConstantRewardModal";
import EditL5RewardModal from "../components/EditL5RewardModal";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import StoreSelector from "../components/common/StoreSelector";

const Reward = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [store, setStore] = useState({});
  const [rewards, setRewards] = useState([]);
  const [allRewards, setAllRewards] = useState([]);
  const [rewardType, setRewardType] = useState("standard");
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showRewardsView, setShowRewardsView] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateConstantModal, setShowCreateConstantModal] = useState(false);
  const [showEditConstantModal, setShowEditConstantModal] = useState(false);
  const [showEditL5Modal, setShowEditL5Modal] = useState(false);
  const [editReward, setEditReward] = useState(null);
  const [modelRewardId, setModelRewardId] = useState();
  const [isL5RewardDelete, setIsL5RewardDelete] = useState(false);
  const [query, setQuery] = useState("");
  const [Rewardquery, setRewardQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [defaultStoreSet, setDefaultStoreSet] = useState(false);
  const [showBillIdModal, setShowBillIdModal] = useState(false);
  const [billId, setBillId] = useState("");
  const [pendingRewardId, setPendingRewardId] = useState(null);
  const [showRecordsTable, setShowRecordsTable] = useState(false);
  const [l6Order, setL6Order] = useState([]);
  const [priorityDirty, setPriorityDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // Fetch stores based on user role
  const getStoresAdmin = async () => {
    try {
      const response = await api.get("/store", { headers: { token } });
      if (response.data.success) {
        setStores(response.data.stores);
        // Set default store if not already set
        if (response.data.stores.length > 0 && !defaultStoreSet) {
          const defaultStore = response.data.stores[0];
          setStore(defaultStore);
          getRewards(defaultStore._id, defaultStore);
          setDefaultStoreSet(true);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message, {
        duration: 2000,
      });
    }
  };

  useEffect(() => {
    const fetchRewards = async () => {
      setLoading(true);
      try {
        const response = await api.get(
          `/store/getRedeemedRewards/${store.url}`
        );

        if (response.data.success) {
          setAllRewards(response.data.redeemedRewards);
        } else {
          toast.error(response.data.message, { duration: 2000 });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (store?.url) {
      fetchRewards();
    }
  }, [store]);

  const getStoresClient = async () => {
    try {
      const response = await api.get("/store/myStores", { headers: { token } });

      if (response.data.success) {
        setStores(response.data.stores);
        // Set default store if not already set
        if (response.data.stores.length > 0 && !defaultStoreSet) {
          const defaultStore = response.data.stores[0];
          setStore(defaultStore);
          getRewards(defaultStore._id, defaultStore);
          setDefaultStoreSet(true);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message, {
        duration: 2000,
      });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user.role === "admin") {
        await getStoresAdmin();
      } else {
        await getStoresClient();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message, {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleView = () => {
    setShowRewardsView((prev) => !prev);
  };

  const getRewards = async (storeId, storeData = null) => {
    setLoading(true);
    try {
      
      const response = await api.get(`/reward/getRewards/${storeId}`, {
        headers: { token },
      });

      if (response.data.success) {
        let allRewardsData = response.data.rewards;
        
        // Use provided storeData or fall back to current store or stores array
        let currentStore = storeData || store;
        if (!currentStore || currentStore._id !== storeId) {
          // Find the store from stores array
          const foundStore = stores.find(s => s._id === storeId);
          if (foundStore) {
            currentStore = foundStore;
          }
        }
        
        // Use l5Config from API response if available (has signed URLs), otherwise fall back to store data
        const l5ConfigToUse = response.data.l5Config || currentStore?.loyaltyCard?.l5Config;
        
        
        // Add L5 threshold rewards if store has L5 format
        if (currentStore?.loyaltyCard?.format === "L5" && l5ConfigToUse?.rewards) {
          
          const l5Rewards = l5ConfigToUse.rewards.map(threshold => ({
            _id: `l5-${threshold.threshold}`,
            name: threshold.rewardName,
            description: threshold.description,
            type: "l5Threshold",
            threshold: threshold.threshold,
            rewardType: threshold.rewardType,
            discountPercentage: threshold.discountPercentage,
            image: threshold.image || null,
            validity: threshold.validity || "instant",
            evergreen: threshold.evergreen || false,
            template: {},
          }));
          
          allRewardsData = [...allRewardsData, ...l5Rewards];
        } else {
        }
        
        setRewards(allRewardsData);
        if (currentStore?.loyaltyCard?.format === "L6") {
          setL6Order(allRewardsData.filter(r => r.type === "l6"));
          setPriorityDirty(false);
        }
      } else {
        toast.error(response.data.message, {
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('[getRewards] Error:', error);
      toast.error(error.message, {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };



  const handleDeleteReward = async (rewardId) => {
    setLoading(true);
    try {
      let response;
      if (isL5RewardDelete) {
        // Use the L5-specific delete endpoint
        response = await api.delete(`/reward/deleteRewardThreshold?storeId=${store._id}&rewardId=${rewardId}`, {
          headers: { token },
        });
      } else {
        // Use the standard delete endpoint
        response = await api.delete(`/reward/deleteReward/${rewardId}`, {
          headers: { token },
        });
      }
      if (response.data.success) {
        setShowModal(false);
        setIsL5RewardDelete(false);
        toast.success(response.data.message, {
          duration: 2000,
        });
        // Refresh rewards list
        if (store._id) {
          getRewards(store._id);
        }
      } else {
        toast.error(response.data.message, {
          duration: 2000,
        });
      }
    } catch (e) {
      setShowModal(false);
      setIsL5RewardDelete(false);
      toast.error(e.message, {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    // Refresh rewards list after successful creation
    if (store._id) {
      getRewards(store._id);
    }
  };

  const handleEditSuccess = () => {
    // Refresh rewards list after successful edit
    if (store._id) {
      getRewards(store._id);
    }
    setShowEditModal(false);
    setEditReward(null);
  };

  const handleCreateConstantSuccess = () => {
    // Refresh rewards list after successful creation
    if (store._id) {
      getRewards(store._id);
    }
    setShowCreateConstantModal(false);
  };

  const handleEditConstantSuccess = () => {
    // Refresh rewards list after successful edit
    if (store._id) {
      getRewards(store._id);
    }
    setShowEditConstantModal(false);
    setEditReward(null);
  };

  const handleCreateThresholdSuccess = async () => {
    // Refresh store data and rewards list after successful creation
    if (store._id) {
      // Fetch fresh store data
      try {
        let storeData = null;
        if (user.role === "admin") {
          const response = await api.get("/store", { headers: { token } });
          if (response.data.success) {
            storeData = response.data.stores.find(s => s._id === store._id);
          }
        } else {
          const response = await api.get("/store/myStores", { headers: { token } });
          if (response.data.success) {
            storeData = response.data.stores.find(s => s._id === store._id);
          }
        }
        if (storeData) {
          setStore(storeData);
        }
      } catch (error) {
        console.error("Error refreshing store data:", error);
      }
      getRewards(store._id);
    }
    setShowCreateModal(false);
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  useEffect(() => {
    if (
      store?.loyaltyCard?.format !== "L3" &&
      store?.loyaltyCard?.format !== "L34HA" &&
      store?.loyaltyCard?.format !== "L4"
    ) {
      setRewardType("standard");
    } else {
      setRewardType("constant");
    }
  }, [store?.loyaltyCard?.format]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
    setExpandedRecord(null);
  }, [Rewardquery, statusFilter, store]);

  // Filter rewards based on search query
  const filteredRewardsRedeemed = allRewards.filter((reward) => {
    const searchLower = Rewardquery.toLowerCase();
    const matchesSearch = !Rewardquery || 
                         (reward.reward?.name?.toLowerCase().includes(searchLower)) ||
                         (reward.customer?.name?.toLowerCase().includes(searchLower)) ||
                         (reward.customer?.phone?.toString().toLowerCase().includes(searchLower));
    
    const matchesStatus = statusFilter === "all" || reward.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const filteredRewards = rewards.filter((reward) => {
    const matchesName = reward.name?.toLowerCase().includes(query.toLowerCase());
    // Treat missing type as "standard" for backward compatibility
    const rewardTypeNormalized = reward.type || "standard";
    const matchesType =
      rewardTypeNormalized === rewardType ||
      rewardTypeNormalized === "l5Threshold" ||
      // l4 rewards should show when rewardType is "constant" (L4 stores)
      (rewardType === "constant" && rewardTypeNormalized === "l4") ||
      // l6 rewards show for standard view
      (rewardType === "standard" && rewardTypeNormalized === "l6");
    return matchesName && matchesType;
  });

  const isL6Store = store?.loyaltyCard?.format === "L6";

  const orderedFilteredRewards = isL6Store && l6Order.length > 0
    ? l6Order.filter(r =>
        !filteredRewards.length ||
        filteredRewards.some(fr => fr._id === r._id)
      )
    : filteredRewards;

  const handleSavePriority = async () => {
    setSavingOrder(true);
    try {
      const order = l6Order.map((reward, index) => ({ rewardId: reward._id, priority: index }));
      const response = await api.put(
        `/reward/reorderL6Rewards?storeId=${store._id}`,
        { order },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Reward order saved", { duration: 2000 });
        setPriorityDirty(false);
      } else {
        toast.error(response.data.message, { duration: 2000 });
      }
    } catch (err) {
      toast.error(err.message || "Failed to save order", { duration: 2000 });
    } finally {
      setSavingOrder(false);
    }
  };
  const handleDuplicateReward = async (rewardId) => {
    try {
      const response = await api.post(
        `/reward/duplicateReward/${rewardId}`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Reward duplicated", { duration: 2000 });
        getRewards(store._id);
      } else {
        toast.error(response.data.message, { duration: 2000 });
      }
    } catch (err) {
      toast.error(err.message || "Failed to duplicate reward", { duration: 2000 });
    }
  };

  const getL6RewardCategory = (reward) => {
    if (!reward || reward.type !== "l6") return "-";
    const tier = reward.isTierBased === true || reward.isTierBased === "true";
    const point = reward.isPointBased === true || reward.isPointBased === "true";
    const mission = reward.isMissionBased === true || reward.isMissionBased === "true";
    const streak = reward.isStreakBased === true || reward.isStreakBased === "true";
    if (tier) return "Tier";
    if (point) return "Point";
    if (mission) return "Mission";
    if (streak) return "Streak";
    return "-";
  };
  const getL6CategoryBadgeClass = (category) => {
    if (category === "Tier") {
      return isDarkMode ? "bg-blue-900/40 text-blue-300" : "bg-blue-100 text-blue-700";
    }
    if (category === "Point") {
      return isDarkMode ? "bg-emerald-900/40 text-emerald-300" : "bg-emerald-100 text-emerald-700";
    }
    if (category === "Mission") {
      return isDarkMode ? "bg-amber-900/40 text-amber-300" : "bg-amber-100 text-amber-700";
    }
    if (category === "Streak") {
      return isDarkMode ? "bg-orange-900/40 text-orange-300" : "bg-orange-100 text-orange-700";
    }
    return isDarkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700";
  };
  

  // Pagination logic for records
  const totalPages = Math.ceil(filteredRewardsRedeemed.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = filteredRewardsRedeemed.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
    setExpandedRecord(null); // Close any expanded records when changing pages
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const toggleRecordExpansion = (recordId) => {
    setExpandedRecord(expandedRecord === recordId ? null : recordId);
  };

  const claimReward = async (rewardId) => {
    if (store.needBillIDForReward) {
      // Open modal to get bill ID
      setPendingRewardId(rewardId);
      setShowBillIdModal(true);
      return;
    }
    
    // Process claim without bill ID
    await processClaimReward(rewardId);
  };

  const processClaimReward = async (rewardId, billIdValue = null) => {
    setLoading(true);
    try {
      let rewardIdWithBill = rewardId;
      if (billIdValue) {
        rewardIdWithBill = `${rewardId}&billID=${billIdValue}`;
      }
      
      const response = await api.put(
        `/store/claimReward/${store.url}?rewardID=${rewardIdWithBill}`
      );
      
      if (response.data.success) {
        toast.success(response.data.message, {
          duration: 2000,
        });
        
        // Refresh the rewards data instead of reloading page
        if (store.url) {
          const rewardsResponse = await api.get(
            `/store/getRedeemedRewards/${store.url}`
          );
          if (rewardsResponse.data.success) {
            setAllRewards(rewardsResponse.data.redeemedRewards);
          }
        }
        
        // Close modal if it was open
        setShowBillIdModal(false);
        setBillId("");
        setPendingRewardId(null);
      } else {
        toast.error(response.data.message, { duration: 2000 });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message, { duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const handleBillIdSubmit = () => {
    if (!billId.trim()) {
      toast.error("Bill ID is required to claim the reward.", {
        duration: 2000,
      });
      return;
    }
    
    processClaimReward(pendingRewardId, billId.trim());
  };

  const handleBillIdModalClose = () => {
    setShowBillIdModal(false);
    setBillId("");
    setPendingRewardId(null);
  };

  const exportToCSV = () => {
    if (allRewards.length === 0) return;

    const replacer = (key, value) =>
      value === null || value === undefined ? "" : value;

    // Define headers
    const headers = [
      "Reward Name",
      "Customer Name",
      "Customer Phone Number",
      "Bill ID",
      "Redeemed Date",
      "Expiry Date",
      "Status",
      "Created At",
      "Updated At",
    ];

    // Format each row of data
    const rows = allRewards.map((reward) => [
      replacer("rewardName", reward.reward?.name),
      replacer("customerName", reward.customer?.name),
      replacer("customerPhone", reward.customer?.phone),
      replacer("billId", reward.billID),
      replacer(
        "redeemedDate",
        reward.redeemDate
          ? new Date(reward.redeemDate).toISOString().split("T")[0]
          : ""
      ),
      replacer(
        "expiryDate",
        reward.expiryDate
          ? new Date(reward.expiryDate).toISOString().split("T")[0]
          : ""
      ),
      replacer(
        "status",
        reward.status.charAt(0).toUpperCase() + reward.status.slice(1)
      ),
      replacer(
        "createdAt",
        reward.createdAt ? new Date(reward.createdAt).toISOString() : ""
      ),
      replacer(
        "updatedAt",
        reward.updatedAt ? new Date(reward.updatedAt).toISOString() : ""
      ),
    ]);

    // Combine headers and rows into CSV format
    const csv = [
      headers.join(","), // Header row
      ...rows.map((row) => row.map((value) => `"${value}"`).join(",")), // Wrap each value in quotes to handle commas safely
    ].join("\r\n");

    // Download the CSV
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "rewards.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Showing Reward Section
  return (
    <div className={`px-2 sm:px-4 ml-0 lg:ml-64 min-h-screen ${
      isDarkMode ? 'bg-gray-900' : 'bg-[#f2f5f9]'
    }`}>
      {loading && <LoadingSpinner />}
      
      {/* Header Section */}
      <div className={`flex flex-col lg:flex-row items-start lg:items-center justify-between w-full mb-4 lg:mb-6 p-2 lg:p-4 border-b-2 gap-4 ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-[#f2f5f9] border-gray-200'
      }`}>
        {/* Left: Title and Store Info */}
        <div className="flex flex-col gap-1 lg:gap-2">
          <h1 className={`text-xl lg:text-2xl font-medium ${
            isDarkMode ? 'text-white' : 'text-black'
          }`}>Reward Management</h1>
          <span className={`text-xs lg:text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-black'
          }`}>
            Total Rewards: {rewards.length}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
          {/* Center: Store Selector */}
          <div className="relative w-full sm:max-w-md sm:flex-1">
            <StoreSelector
              selectedStore={store}
              onStoreChange={(selectedStore) => {
                setStore(selectedStore);
                getRewards(selectedStore._id, selectedStore);
              }}
              variant="styled"
              customStores={stores}
              fetchOnMount={false}
            />
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center">
            <button
              onClick={exportToCSV}
              className="flex items-center bg-green-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-green-700 text-sm lg:text-base whitespace-nowrap"
            >
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Dynamic Layout */}
      <div className="px-2 sm:px-4">
        
        {!showRecordsTable ? (
          /* Centered Layout - When records are hidden */
          <div className="flex justify-center items-start w-full">
            <div className={`w-full rounded-lg shadow-sm border p-4 lg:p-6 ${
              isDarkMode 
                ? 'bg-gray-900 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              {/* Rewards Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 lg:mb-6 gap-3 ">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
                  <h2 className={`text-lg lg:text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Rewards</h2>

                  <div className="flex flex-col sm:flex-row justify-center gap-2">
                    <button
                      className={`px-3 py-2 rounded-md text-sm flex items-center justify-center gap-1 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg ${
                        isDarkMode 
                          ? 'bg-gray-700 text-white hover:bg-gray-600' 
                          : 'bg-black text-white hover:bg-gray-900'
                      }`}
                      onClick={() => {
                        if (rewardType === "standard") {
                          setShowCreateModal(true);
                        } else if (store?.loyaltyCard?.format === "L4" || store?.loyaltyCard?.format === "L6") {
                          setShowCreateModal(true);
                        } else {
                          setShowCreateConstantModal(true);
                        }
                      }}
                    >
                      <Plus size={16} />
                      Create
                    </button>

                    <button
                      onClick={() => setShowRecordsTable(true)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md text-sm flex items-center justify-center gap-1 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
                    >
                      <Award size={16} />
                      View Records
                    </button>
                    {isL6Store && priorityDirty && (
                      <button
                        onClick={handleSavePriority}
                        disabled={savingOrder}
                        className="px-3 py-2 rounded-md text-sm flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 transition-colors"
                      >
                        {savingOrder ? "Saving..." : "Save Order"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4 lg:mb-6">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-400'
                }`} size={16} />
                <input
                  type="text"
                  placeholder="Search by reward name"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={`w-full rounded-lg pl-10 pr-4 py-2 border-0 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm lg:text-base ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white placeholder-gray-400' 
                      : 'bg-gray-50 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Rewards List */}
              <div className="space-y-3 overflow-y-auto transition-all duration-700 ease-in-out max-h-[280px] sm:max-h-[380px] overflow-x-hidden ">
                <div className={`hidden text-sm pb-2 border-b ${
                  isDarkMode 
                    ? 'text-gray-400 border-gray-800' 
                    : 'text-gray-500 border-gray-200'
                } ${isL6Store ? 'sm:grid sm:grid-cols-[1fr_110px_90px] sm:items-center sm:gap-3' : 'sm:flex sm:justify-between sm:items-center'}`}>
                  <span>Reward Name</span>
                  {isL6Store && <span className="text-center">Category</span>}
                  <span className={isL6Store ? "text-right" : ""}>Action</span>
                </div>
                
                {orderedFilteredRewards.length > 0 ? (
                  isL6Store ? (
                    <Reorder.Group
                      as="div"
                      axis="y"
                      values={l6Order}
                      onReorder={(reordered) => { setL6Order(reordered); setPriorityDirty(true); }}
                      className="space-y-0"
                    >
                      {orderedFilteredRewards.map((reward) => (
                        <Reorder.Item
                          as="div"
                          key={reward._id}
                          value={reward}
                          className={`flex items-center justify-between py-3 border-b last:border-b-0 rounded-lg px-2 sm:grid sm:grid-cols-[20px_1fr_110px_auto] sm:items-center sm:gap-3 ${
                            isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-100 bg-white'
                          }`}
                        >
                          <GripVertical
                            size={16}
                            className={`cursor-grab active:cursor-grabbing flex-shrink-0 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}
                          />
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0">
                              {reward.image || reward.template?.image ? (
                                <img src={reward.image || reward.template?.image} alt={reward.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-yellow-400 flex items-center justify-center">
                                  <Award className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-800" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className={`font-medium text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{reward.name}</div>
                              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>L6 Reward</div>
                            </div>
                          </div>
                          <div className={`hidden sm:block text-xs px-2 py-1 rounded-md min-w-[72px] text-center ${getL6CategoryBadgeClass(getL6RewardCategory(reward))}`}>
                            {getL6RewardCategory(reward)}
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 sm:justify-end">
                            <button
                              onClick={() => { setEditReward(reward); setShowEditModal(true); }}
                              className={`p-1 transition-all duration-200 ease-in-out transform hover:scale-110 ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-400 hover:text-blue-600'}`}
                            >
                              <Pencil size={14} className="sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicateReward(reward._id)}
                              className={`p-1 transition-all duration-200 ease-in-out transform hover:scale-110 ${isDarkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-400 hover:text-green-600'}`}
                              title="Duplicate"
                            >
                              <Copy size={14} className="sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => { setShowModal(true); setModelRewardId(reward._id); setIsL5RewardDelete(false); }}
                              className={`p-1 transition-all duration-200 ease-in-out transform hover:scale-110 ${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-600'}`}
                            >
                              <Trash2 size={14} className="sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  ) : (
                  orderedFilteredRewards.map((reward, index) => (
                    <div key={reward._id || index} className={`flex items-center justify-between py-3 border-b last:border-b-0 transition-all duration-300 ease-in-out rounded-lg px-2 transform ${
                      isDarkMode
                        ? 'border-gray-700 hover:bg-gray-700 hover:shadow-sm'
                        : 'border-gray-100 hover:bg-gray-50 hover:shadow-sm'
                    }`}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0">
                          {reward.type === "l5Threshold" ? (
                            reward.image ? (
                              <img src={reward.image} alt={reward.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center ${
                                reward.rewardType === "discount"
                                  ? isDarkMode ? "bg-emerald-900/30" : "bg-emerald-100"
                                  : isDarkMode ? "bg-amber-900/30" : "bg-amber-100"
                              }`}>
                                {reward.rewardType === "discount" ? (
                                  <Percent className={`w-4 h-4 sm:w-6 sm:h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                ) : (
                                  <Award className={`w-4 h-4 sm:w-6 sm:h-6 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                                )}
                              </div>
                            )
                          ) : reward.image || reward.template?.image ? (
                            <img src={reward.image || reward.template?.image} alt={reward.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-yellow-400 flex items-center justify-center">
                              <Award className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-800" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`font-medium text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{reward.name}</div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {reward.type === "l5Threshold"
                              ? `${reward.threshold} pts ${reward.rewardType === "discount" ? `- ${reward.discountPercentage}% Off` : ""}`
                              : reward.type === "standard" ? "Standard Reward" : "Constant Reward"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 sm:justify-end">
                        <button
                          onClick={() => {
                            setEditReward(reward);
                            if (reward.type === "standard") setShowEditModal(true);
                            else if (reward.type === "l5Threshold") setShowEditL5Modal(true);
                            else setShowEditConstantModal(true);
                          }}
                          className={`p-1 transition-all duration-200 ease-in-out transform hover:scale-110 ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-400 hover:text-blue-600'}`}
                        >
                          <Pencil size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateReward(reward._id)}
                          className={`p-1 transition-all duration-200 ease-in-out transform hover:scale-110 ${isDarkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-400 hover:text-green-600'}`}
                          title="Duplicate"
                        >
                          <Copy size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => { setShowModal(true); setModelRewardId(reward._id); setIsL5RewardDelete(reward.type === "l5Threshold"); }}
                          className={`p-1 transition-all duration-200 ease-in-out transform hover:scale-110 ${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-600'}`}
                        >
                          <Trash2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        {reward.type === "l5Threshold" && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
                            L5
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                  )
                ) : (
                  <div className={`text-center py-8 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <Award className={`w-12 h-12 mx-auto mb-2 ${
                      isDarkMode ? 'text-gray-600' : 'text-gray-300'
                    }`} />
                    <p className="text-sm lg:text-base">No rewards found</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          /* Grid Layout - When records are shown */
          <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4">
            
            {/* Left Column - Rewards Management (Same position as centered) */}
            <div className="xl:col-span-1 flex justify-center">
              <div className={`w-full rounded-lg shadow-sm border p-4 lg:p-6 ${
                isDarkMode 
                  ? 'bg-gray-900 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                {/* Rewards Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 lg:mb-6 gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
                    <h2 className={`text-lg lg:text-xl font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Rewards</h2>

                    <div className="flex flex-col sm:flex-row justify-center gap-2">
                      <button
                        className={`px-3 py-2 rounded-md text-sm flex items-center justify-center gap-1 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg ${
                          isDarkMode
                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                            : 'bg-black text-white hover:bg-gray-900'
                        }`}
                        onClick={() => {
                          if (rewardType === "standard") {
                            setShowCreateModal(true);
                          } else if (store?.loyaltyCard?.format === "L4") {
                            setShowCreateModal(true);
                          } else {
                            setShowCreateConstantModal(true);
                          }
                        }}
                      >
                        <Plus size={16} />
                        Create
                      </button>
                      {isL6Store && priorityDirty && (
                        <button
                          onClick={handleSavePriority}
                          disabled={savingOrder}
                          className="px-3 py-2 rounded-md text-sm flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 transition-colors"
                        >
                          {savingOrder ? "Saving..." : "Save Order"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4 lg:mb-6">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-400'
                  }`} size={16} />
                  <input
                    type="text"
                    placeholder="Search by reward name"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={`w-full rounded-lg pl-10 pr-4 py-2 border-0 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm lg:text-base ${
                      isDarkMode 
                        ? 'bg-gray-700 text-white placeholder-gray-400' 
                        : 'bg-gray-50 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                {/* Rewards List */}
                <div className="space-y-3 overflow-y-auto transition-all duration-700 ease-in-out max-h-[280px] sm:max-h-[380px] overflow-x-hidden">
                  <div className={`hidden text-sm pb-2 border-b ${
                    isDarkMode 
                      ? 'text-gray-400 border-gray-800' 
                      : 'text-gray-500 border-gray-200'
                  } ${isL6Store ? 'sm:grid sm:grid-cols-[1fr_110px_90px] sm:items-center sm:gap-3' : 'sm:flex sm:justify-between sm:items-center'}`}>
                    <span>Reward Name</span>
                    {isL6Store && <span className="text-center">Category</span>}
                    <span className={isL6Store ? "text-right" : ""}>Action</span>
                  </div>
                  
                  {orderedFilteredRewards.length > 0 ? (
                    isL6Store ? (
                      <Reorder.Group
                        as="div"
                        axis="y"
                        values={l6Order}
                        onReorder={(reordered) => { setL6Order(reordered); setPriorityDirty(true); }}
                        className="space-y-0"
                      >
                        {orderedFilteredRewards.map((reward) => (
                          <Reorder.Item
                            as="div"
                            key={reward._id}
                            value={reward}
                            className={`flex items-center justify-between py-3 border-b last:border-b-0 rounded-lg px-2 sm:grid sm:grid-cols-[20px_1fr_110px_auto] sm:items-center sm:gap-3 ${
                              isDarkMode
                                ? 'border-gray-700 hover:bg-gray-700 hover:shadow-sm'
                                : 'border-gray-100 hover:bg-gray-50 hover:shadow-sm'
                            }`}
                          >
                            <GripVertical
                              size={16}
                              className={`cursor-grab active:cursor-grabbing flex-shrink-0 hidden sm:block ${
                                isDarkMode ? 'text-gray-600' : 'text-gray-300'
                              }`}
                            />
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0">
                                {reward.image || reward.template?.image ? (
                                  <img
                                    src={reward.image || reward.template?.image}
                                    alt={reward.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-yellow-400 flex items-center justify-center">
                                    <Award className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-800" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className={`font-medium text-sm truncate ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{reward.name}</div>
                                <div className={`text-xs ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {reward.type === "standard" ? "Standard Reward" : "Constant Reward"}
                                </div>
                              </div>
                            </div>
                            <div className={`hidden sm:block text-xs px-2 py-1 rounded-md min-w-[72px] text-center ${
                              getL6CategoryBadgeClass(getL6RewardCategory(reward))
                            }`}>
                              {getL6RewardCategory(reward)}
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 sm:justify-end">
                              <button
                                onClick={() => {
                                  setEditReward(reward);
                                  if (reward.type === "standard" || reward.type === "l6") {
                                    setShowEditModal(true);
                                  } else {
                                    setShowEditConstantModal(true);
                                  }
                                }}
                                className={`p-1 transition-all duration-200 ease-in-out transform hover:scale-110 ${
                                  isDarkMode
                                    ? 'text-gray-400 hover:text-blue-400'
                                    : 'text-gray-400 hover:text-blue-600'
                                }`}
                              >
                                <Pencil size={14} className="sm:w-4 sm:h-4" />
                              </button>
                              <button
                                onClick={() => handleDuplicateReward(reward._id)}
                                className={`p-1 transition-all duration-200 ease-in-out transform hover:scale-110 ${
                                  isDarkMode
                                    ? 'text-gray-400 hover:text-green-400'
                                    : 'text-gray-400 hover:text-green-600'
                                }`}
                                title="Duplicate"
                              >
                                <Copy size={14} className="sm:w-4 sm:h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setShowModal(true);
                                  setModelRewardId(reward._id);
                                  setIsL5RewardDelete(false);
                                }}
                                className={`p-1 transition-all duration-200 ease-in-out transform hover:scale-110 ${
                                  isDarkMode
                                    ? 'text-gray-400 hover:text-red-400'
                                    : 'text-gray-400 hover:text-red-600'
                                }`}
                              >
                                <Trash2 size={14} className="sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    ) : (
                    orderedFilteredRewards.map((reward, index) => (
                      <div key={reward._id || index} className={`flex items-center justify-between py-3 border-b last:border-b-0 transition-all duration-300 ease-in-out rounded-lg px-2 transform hover:scale-[1.02] ${
                        isDarkMode
                          ? 'border-gray-700 hover:bg-gray-700 hover:shadow-sm'
                          : 'border-gray-100 hover:bg-gray-50 hover:shadow-sm'
                      }`}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0">
                            {reward.image || reward.template?.image ? (
                              <img
                                src={reward.image || reward.template?.image}
                                alt={reward.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-yellow-400 flex items-center justify-center">
                                <Award className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-800" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`font-medium text-sm truncate ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>{reward.name}</div>
                            <div className={`text-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {reward.type === "standard" ? "Standard Reward" : "Constant Reward"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 sm:justify-end">
                          <button
                            onClick={() => {
                              setEditReward(reward);
                              if (reward.type === "standard" || reward.type === "l6") {
                                setShowEditModal(true);
                              } else {
                                setShowEditConstantModal(true);
                              }
                            }}
                            className={`p-1 transition-all duration-200 ease-in-out transform hover:scale-110 ${
                              isDarkMode
                                ? 'text-gray-400 hover:text-blue-400'
                                : 'text-gray-400 hover:text-blue-600'
                            }`}
                          >
                            <Pencil size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicateReward(reward._id)}
                            className={`p-1 transition-all duration-200 ease-in-out transform hover:scale-110 ${
                              isDarkMode
                                ? 'text-gray-400 hover:text-green-400'
                                : 'text-gray-400 hover:text-green-600'
                            }`}
                            title="Duplicate"
                          >
                            <Copy size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setShowModal(true);
                              setModelRewardId(reward._id);
                              setIsL5RewardDelete(false);
                            }}
                            className={`p-1 transition-all duration-200 ease-in-out transform hover:scale-110 ${
                              isDarkMode
                                ? 'text-gray-400 hover:text-red-400'
                                : 'text-gray-400 hover:text-red-600'
                            }`}
                          >
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                    )
                  ) : (
                    <div className={`text-center py-8 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <Award className={`w-12 h-12 mx-auto mb-2 ${
                        isDarkMode ? 'text-gray-600' : 'text-gray-300'
                      }`} />
                      <p className="text-sm lg:text-base">No rewards found</p>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Right Column - Records (Only show when showRecordsTable is true) */}
            <div className={`xl:col-span-2 rounded-lg shadow-sm border p-4 lg:p-6 ${
              isDarkMode 
                ? 'bg-gray-900 border-gray-700' 
                : 'bg-white border-gray-200'
            } ${
              showRecordsTable 
                ? 'opacity-100' 
                : 'opacity-0 pointer-events-none'
            }`}>
          {showRecordsTable && (
            <>
              {/* Records Header */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 lg:mb-6 gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full lg:w-auto gap-3">
                  <h2 className={`text-lg lg:text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Records</h2>
                  <button
                    onClick={() => setShowRecordsTable(!showRecordsTable)}
                    className={`px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                      showRecordsTable 
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                    }`}
                  >
                    {showRecordsTable ? 'Hide Records' : 'View Records'}
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
                  <div className="flex items-center gap-2 relative w-full sm:w-64">
                    <Search className={`absolute left-3 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} size={16} />
                    <input
                      type="text"
                      placeholder="Search"
                      value={Rewardquery}
                      onChange={(e) => setRewardQuery(e.target.value)}
                      className={`w-full rounded-lg pl-10 pr-4 py-2 border-0 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm lg:text-base ${
                        isDarkMode 
                          ? 'bg-gray-700 text-white placeholder-gray-400' 
                          : 'bg-gray-50 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm whitespace-nowrap ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>Filter by:</span>
                    <select 
                      className={`rounded-md px-3 py-1 text-sm border-0 focus:outline-none ${
                        isDarkMode 
                          ? 'bg-gray-700 text-gray-200' 
                          : 'bg-gray-50 text-gray-900'
                      }`}
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="claimed">Claimed</option>
                      <option value="pending">Pending</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </div>
              </div>

            {/* Records Table */}
            <div>
              {/* Desktop Table View - Hidden on mobile */}
              <div className="hidden lg:block max-h-[280px] sm:max-h-[380px] overflow-y-auto overflow-x-hidden">
                <table className="w-full border-collapse table-fixed">
                  <thead className={`sticky top-0 border-b ${
                    isDarkMode 
                      ? 'bg-gray-900 border-gray-800' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <tr>
                      <th className={`text-left text-xs font-medium py-2 lg:py-3 px-2 lg:px-3 w-1/6 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>SN</th>
                      <th className={`text-left text-xs font-medium py-2 lg:py-3 px-2 lg:px-3 w-1/4 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>Customer</th>
                      <th className={`text-left text-xs font-medium py-2 lg:py-3 px-2 lg:px-3 w-1/3 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>Reward</th>
                      <th className={`text-left text-xs font-medium py-2 lg:py-3 px-2 lg:px-3 w-1/4 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPageData.length > 0 ? (
                      currentPageData.map((reward, index) => (
                        <React.Fragment key={reward._id}>
                          <tr
                            className={`cursor-pointer border-b transition-all duration-300 ease-in-out ${
                              expandedRecord === reward._id 
                                ? (isDarkMode ? 'bg-green-900 border-green-600' : 'bg-green-50 border-green-400')
                                : (isDarkMode ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gray-50 border-gray-100')
                            }`}
                            onClick={() => toggleRecordExpansion(reward._id)}
                            style={{ animationDelay: `${index * 50}ms`, animationDuration: '300ms' }}
                          >
                            {/* Serial Number */}
                            <td className={`px-2 lg:px-3 py-2 pb-3 lg:pb-5 text-xs lg:text-sm font-medium ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {startIndex + index + 1}
                            </td>
                            
                            {/* Customer Name */}
                            <td className={`px-2 lg:px-3 py-2 pb-3 lg:pb-5 text-xs lg:text-sm truncate ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {reward.customer?.name || 'N/A'}
                            </td>
                            
                            {/* Reward Name */}
                            <td className={`px-2 lg:px-3 py-2 pb-3 lg:pb-5 text-xs lg:text-sm font-medium truncate ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {reward.reward?.name || 'N/A'}
                            </td>
                            
                            {/* Status with Expand/Collapse Icon */}
                            <td className="px-2 lg:px-3 py-2 pb-3 lg:pb-5">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`inline-flex items-center gap-1 px-1.5 lg:px-2 py-0.5 rounded-full text-xs font-medium ${
                                  reward.status === "claimed" || reward.status === "clamed"
                                    ? isDarkMode
                                      ? "text-green-400 bg-green-900/20"
                                      : "text-green-700 bg-green-100"
                                    : reward.status === "pending"
                                    ? isDarkMode
                                      ? "text-yellow-400 bg-yellow-900/20"
                                      : "text-yellow-700 bg-yellow-100"
                                    : isDarkMode
                                      ? "text-red-400 bg-red-900/20"
                                      : "text-red-700 bg-red-100"
                                }`}>
                                  <span className={`w-1 h-1 rounded-full ${
                                    reward.status === "claimed" || reward.status === "clamed"
                                      ? "bg-green-600"
                                      : reward.status === "pending"
                                      ? "bg-yellow-600"
                                      : "bg-red-600"
                                  }`}></span>
                                  {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
                                </span>
                                {expandedRecord === reward._id ? (
                                  <ChevronDown size={12} className="text-green-600 flex-shrink-0" />
                                ) : (
                                  <ChevronRight size={12} className={`flex-shrink-0 ${
                                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                  }`} />
                                )}
                              </div>
                            </td>
                          </tr>
                          {expandedRecord === reward._id && (
                            <tr className={`border-b ${
                              isDarkMode 
                                ? 'bg-transparent border-green-600/30' 
                                : 'bg-green-50 border-green-200'
                            }`}>
                              <td colSpan="4" className={`p-2 lg:p-3 border-t ${
                                isDarkMode ? 'border-green-600/30' : 'border-green-200'
                              }`}>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 text-xs">
                                  <div className="flex flex-col">
                                    <span className={`font-medium mb-1 ${
                                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>Expiry Date</span>
                                    <span className={`font-medium ${
                                      isDarkMode ? 'text-gray-100' : 'text-gray-900'
                                    }`}>
                                      {reward.expiryDate ? new Date(reward.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jul 11, 2025'}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className={`font-medium mb-1 ${
                                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>Phone Number</span>
                                    <span className={`font-medium ${
                                      isDarkMode ? 'text-gray-100' : 'text-gray-900'
                                    }`}>{reward.customer?.phone || 'N/A'}</span>
                                  </div>
                                  {store.needBillIDForReward && (
                                    <div className="flex flex-col">
                                      <span className={`font-medium mb-1 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                      }`}>Bill ID</span>
                                      <span className={`font-medium ${
                                        isDarkMode ? 'text-gray-100' : 'text-gray-900'
                                      }`}>#{reward.billID || '1212'}</span>
                                    </div>
                                  )}
                                  {reward.status === "pending" && (
                                    <div className="flex flex-col col-span-2 lg:col-span-1">
                                      <span className={`font-medium mb-1 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                      }`}>Action</span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          claimReward(reward._id);
                                        }}
                                        className="bg-green-600 text-white px-2 py-1 rounded-md text-xs hover:bg-green-700 transition-colors font-medium w-fit"
                                      >
                                        Claim Reward
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className={`text-center py-8 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <div className="flex flex-col items-center">
                            <Award className={`w-12 h-12 mb-2 ${
                              isDarkMode ? 'text-gray-600' : 'text-gray-300'
                            }`} />
                            <p className="text-sm lg:text-base">No records found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Accordion View (lg and below) */}
              <div className="lg:hidden">
                {currentPageData.length > 0 ? (
                  <div className="space-y-2 max-h-[280px] sm:max-h-[380px] overflow-y-auto">
                    {currentPageData.map((reward, index) => {
                      const isExpanded = expandedRecord === reward._id;
                      return (
                        <div key={reward._id} className={`rounded-lg shadow-sm border overflow-hidden transition-all duration-200 ${
                          isDarkMode ? 'bg-gray-900' : 'bg-white'
                        } ${
                          isExpanded 
                            ? isDarkMode 
                              ? 'border-green-600 shadow-lg shadow-green-900/20 ring-1 ring-green-600/30' 
                              : 'border-green-300 shadow-lg shadow-green-100 ring-1 ring-green-200'
                            : isDarkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                          {/* Accordion Header - Always Visible */}
                          <button
                            onClick={() => toggleRecordExpansion(reward._id)}
                            className={`w-full px-4 py-3 flex items-center justify-between transition-colors focus:outline-none ${
                              isExpanded 
                                ? isDarkMode 
                                  ? 'bg-green-900/30 hover:bg-green-900/40' 
                                  : 'bg-green-50 hover:bg-green-100'
                                : isDarkMode ? 'hover:bg-gray-700 focus:bg-gray-700' : 'hover:bg-gray-50 focus:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              {/* Row Number Badge */}
                              <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {startIndex + index + 1}
                              </span>

                              {/* Customer Info */}
                              <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h3 className={`font-medium text-sm truncate ${
                                      isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>{reward.customer?.name || 'N/A'}</h3>
                                    <p className={`text-xs mt-0.5 ${
                                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                      {reward.reward?.name || 'N/A'}
                                    </p>
                                  </div>
                                  <span className={`flex-shrink-0 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    reward.status === "claimed" || reward.status === "clamed"
                                      ? "text-green-700 bg-green-100"
                                      : reward.status === "pending"
                                      ? "text-yellow-700 bg-yellow-100"
                                      : "text-red-700 bg-red-100"
                                  }`}>
                                    <svg className={`w-2 h-2 mr-1.5 ${
                                      reward.status === "claimed" || reward.status === "clamed"
                                        ? 'text-green-400'
                                        : reward.status === "pending"
                                        ? 'text-yellow-400'
                                        : 'text-red-400'
                                    }`} fill="currentColor" viewBox="0 0 8 8">
                                      <circle cx={4} cy={4} r={3} />
                                    </svg>
                                    {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Expand/Collapse Icon */}
                            <svg 
                              className={`w-5 h-5 transition-all duration-200 ${
                                isExpanded 
                                  ? isDarkMode ? 'rotate-180 text-green-400' : 'rotate-180 text-green-600'
                                  : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                              }`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {/* Accordion Content - Expandable */}
                          {isExpanded && (
                            <div className={`px-4 pb-4 border-t ${
                              isDarkMode ? 'border-green-600/30 bg-transparent' : 'border-green-200 bg-green-50'
                            }`}>
                              <div className="space-y-3 pt-3">
                                {/* Phone Number */}
                                <div className="flex items-center space-x-3">
                                  <svg className={`w-4 h-4 flex-shrink-0 ${
                                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs mb-1 ${
                                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Phone Number</p>
                                    <p className={`text-sm ${
                                      isDarkMode ? 'text-gray-300' : 'text-gray-900'
                                    }`}>{reward.customer?.phone || 'N/A'}</p>
                                  </div>
                                </div>

                                {/* Redeemed Date */}
                                <div className="flex items-center space-x-3">
                                  <svg className={`w-4 h-4 flex-shrink-0 ${
                                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs mb-1 ${
                                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Redeemed Date</p>
                                    <p className={`text-sm ${
                                      isDarkMode ? 'text-gray-300' : 'text-gray-900'
                                    }`}>
                                      {new Date(reward.redeemDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                </div>

                                {/* Expiry Date */}
                                <div className="flex items-center space-x-3">
                                  <svg className={`w-4 h-4 flex-shrink-0 ${
                                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs mb-1 ${
                                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Expiry Date</p>
                                    <p className={`text-sm ${
                                      isDarkMode ? 'text-gray-300' : 'text-gray-900'
                                    }`}>
                                      {reward.expiryDate ? new Date(reward.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '------'}
                                    </p>
                                  </div>
                                </div>

                                {/* Bill ID (if needed) */}
                                {store.needBillIDForReward && (
                                  <div className="flex items-center space-x-3">
                                    <svg className={`w-4 h-4 flex-shrink-0 ${
                                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-xs mb-1 ${
                                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                      }`}>Bill ID</p>
                                      <p className={`text-sm ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-900'
                                      }`}>
                                        {reward.billID ? `#${reward.billID}` : '------'}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Action Button (if pending) */}
                                {reward.status === "pending" && (
                                  <div className={`pt-3 border-t ${
                                    isDarkMode ? 'border-green-600/30' : 'border-green-200'
                                  }`}>
                                    <label className={`block text-xs font-medium mb-2 ${
                                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Actions</label>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          claimReward(reward._id);
                                        }}
                                        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                      >
                                        Claim Reward
                                      </button>
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
                  <div className={`rounded-xl shadow-sm border p-8 ${
                    isDarkMode 
                      ? 'bg-gray-900 border-gray-700' 
                      : 'bg-white border-gray-100'
                  }`}>
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <Award className={`w-6 h-6 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                      </div>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>No records found</p>
                      <p className={`text-xs mt-1 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>Records will appear here when customers redeem rewards</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            {filteredRewardsRedeemed.length > itemsPerPage && (
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 border-t gap-4 sm:gap-0 ${
                isDarkMode 
                  ? 'bg-gray-900 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <div className={`flex items-center text-sm order-2 sm:order-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <span className="text-center sm:text-left">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredRewardsRedeemed.length)} of {filteredRewardsRedeemed.length} results
                  </span>
                </div>

                <div className="flex items-center justify-center space-x-1 sm:space-x-2 order-1 sm:order-2">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`px-3 sm:px-3 py-2 text-sm font-medium border rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDarkMode 
                        ? 'text-gray-400 bg-gray-900 border-gray-800 hover:bg-gray-700' 
                        : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
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
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === pageNum
                              ? 'bg-green-600 text-white'
                              : (isDarkMode 
                                  ? 'text-gray-300 bg-gray-900 border border-gray-800 hover:bg-gray-700' 
                                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50')
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
                          onClick={() => goToPage(pageNum)}
                          className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${currentPage === pageNum
                              ? 'bg-green-600 text-white'
                              : (isDarkMode 
                                  ? 'text-gray-300 bg-gray-900 border border-gray-800 hover:bg-gray-700' 
                                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50')
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 sm:px-3 py-2 text-sm font-medium border rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDarkMode 
                        ? 'text-gray-400 bg-gray-900 border-gray-800 hover:bg-gray-700' 
                        : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
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
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-gray-600/50 flex justify-center items-center z-40 p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className={`rounded-lg p-4 lg:p-6 w-full max-w-lg mx-auto shadow-lg ${
              isDarkMode 
                ? 'bg-gray-900 border border-gray-700' 
                : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={`text-lg lg:text-xl font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Delete Reward</h2>
            <p className={`mb-2 text-sm lg:text-base ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Are you sure you want to delete this reward?
            </p>
            <div className="flex flex-col sm:flex-row justify-end mt-4 gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg text-sm lg:text-base"
              >
                No
              </button>
              <button
                onClick={() => handleDeleteReward(modelRewardId)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg text-sm lg:text-base"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Reward Modal */}
      <CreateRewardModal
        store={store}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Reward Modal */}
      <EditRewardModal
        reward={editReward}
        store={store}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditReward(null);
        }}
        onSuccess={handleEditSuccess}
      />

      {/* Create Constant Reward Modal */}
      <CreateConstantRewardModal
        store={store}
        isOpen={showCreateConstantModal}
        onClose={() => setShowCreateConstantModal(false)}
        onSuccess={handleCreateConstantSuccess}
      />

      {/* Edit Constant Reward Modal */}
      <EditConstantRewardModal
        reward={editReward}
        store={store}
        isOpen={showEditConstantModal}
        onClose={() => {
          setShowEditConstantModal(false);
          setEditReward(null);
        }}
        onSuccess={handleEditConstantSuccess}
      />

      {/* Edit L5 Reward Modal */}
      <EditL5RewardModal
        reward={editReward}
        store={store}
        isOpen={showEditL5Modal}
        onClose={() => {
          setShowEditL5Modal(false);
          setEditReward(null);
        }}
        onSuccess={async () => {
          // Refresh store data and rewards list after successful edit
          if (store._id) {
            try {
              let storeData = null;
              if (user.role === "admin") {
                const response = await api.get("/store", { headers: { token } });
                if (response.data.success) {
                  storeData = response.data.stores.find(s => s._id === store._id);
                }
              } else {
                const response = await api.get("/store/myStores", { headers: { token } });
                if (response.data.success) {
                  storeData = response.data.stores.find(s => s._id === store._id);
                }
              }
              if (storeData) {
                setStore(storeData);
              }
            } catch (error) {
              console.error("Error refreshing store data:", error);
            }
            getRewards(store._id);
          }
          setShowEditL5Modal(false);
          setEditReward(null);
        }}
      />

      {/* Bill ID Modal */}
      {showBillIdModal && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4"
          onClick={handleBillIdModalClose}
        >
          <div 
            className={`rounded-lg p-4 lg:p-6 w-full max-w-md mx-auto shadow-lg ${
              isDarkMode 
                ? 'bg-gray-900 border border-gray-700' 
                : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={`text-lg lg:text-xl font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Enter Bill ID</h2>
            <p className={`mb-4 text-sm lg:text-base ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Please enter your bill ID to claim this reward:
            </p>
            <input
              type="text"
              value={billId}
              onChange={(e) => setBillId(e.target.value)}
              placeholder="Enter Bill ID"
              className={`w-full px-3 lg:px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent mb-4 text-sm lg:text-base ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-800 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleBillIdSubmit();
                }
              }}
            />
            <div className="flex flex-col sm:flex-row justify-end gap-2 lg:gap-3">
              <button
                onClick={handleBillIdModalClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg text-sm lg:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleBillIdSubmit}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-sm lg:text-base"
              >
                Claim Reward
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reward;
