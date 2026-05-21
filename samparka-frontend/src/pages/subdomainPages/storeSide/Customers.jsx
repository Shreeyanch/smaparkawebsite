import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/config";
import { toast } from "sonner";
import _, { toInteger } from "lodash";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { Search, UserPlus, Eye, Plus, Cake, MoreVertical, X, BarChart2, Pencil, Gift } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { countryCodes } from "../../../config/countryCodes";
import { useQueryClient } from "@tanstack/react-query";
import maskPhone from "./maskPhone";
import errorFunction from "./errorFunction";
import maskEmail from "./maskEmail";
const originalPointsMap = new Map();

const Customers = (state) => {
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();
  // const store = state.store;
  const queryClient = useQueryClient();
  const { storeData: store } = queryClient.getQueryData(["store"]);
  const token = localStorage.getItem("storeToken");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pointsModal, setPointsModal] = useState(false);
  const [points, setPoints] = useState(0);
  const [storeID, setStoreID] = useState("");
  const [phone, setPhone] = useState("");
  const [billAmount, setBillAmount] = useState();
  const [billID, setBillID] = useState("");
  const [addingPoints, setAddingPoints] = useState();
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const { isDarkMode } = useTheme();
  const [selectedCountryCode, setSelectedCountryCode] = useState("+977");
  const [outletId, setOutletId] = useState(localStorage.getItem("outletId"));
  const [outlet, setOutlet] = useState("");
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [remarks, setRemarks] = useState("");

  // Outlet points modal state (L5 only)
  const [showOutletPointsModal, setShowOutletPointsModal] = useState(false);
  const [outletPointsResult, setOutletPointsResult] = useState(null);
  const [isLoadingOutletPoints, setIsLoadingOutletPoints] = useState(false);
  const [outletPointsError, setOutletPointsError] = useState("");
  const [openKebabId, setOpenKebabId] = useState(null);
  const [increasePointsModal, setIncreasePointsModal] = useState(false);
  const [pointsModalData, setPointsModalData] = useState({
    type: "", // 'increase', 'decrease', or 'change'
    userId: "",
    currentPoints: 0,
    newPoints: 0,
    store: null,
  });
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [claimRewardModalOpen, setClaimRewardModalOpen] = useState(false);
  const [claimRewardCustomer, setClaimRewardCustomer] = useState(null);
  const [availableRewards, setAvailableRewards] = useState([]);
  const [selectedRewardId, setSelectedRewardId] = useState("");
  const [claimRewardLoading, setClaimRewardLoading] = useState(false);
  const [claimRewardError, setClaimRewardError] = useState("");
  const [editCustomerData, setEditCustomerData] = useState({});
  const [editCustomerLoading, setEditCustomerLoading] = useState(false);
  const [editCustomerErrors, setEditCustomerErrors] = useState({ email: "", phone: "" });

  const getCustomers = async (storeId) => {
    setLoading(true);
    try {
      const response = await api.get(`/store/getCustomersS/${storeId}`, {
        headers: { token },
        params: { lite: true },
      });

      if (response.data.success) {
        setCustomers(
          response.data.customers.sort((a, b) => b.points - a.points)
        );
      }
    } catch (error) {
      if (error.response?.status === 401) {
        errorFunction(navigate);
      } else {
        console.error(error);
        toast.error(error.message, {
          duration: 2000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/store/login");
      return;
    }
    if (store?._id) {
      getCustomers(store._id);
    }
  }, [token, store?._id]);

  useEffect(() => {
    if (outletId && store?.services?.multipleOutlets) {
      const selectedOutlet = store.outlets.find((o) => o._id === outletId);
      setOutlet(selectedOutlet?.location);
    }
  }, [outletId]);

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post(
        `/store/createCustomerS/${store._id}`,
        { ...newCustomer, countryCode: selectedCountryCode },
        { headers: { token } }
      );
      if (response.data.success) {
        // Refetch customers data instead of reloading the page
        await getCustomers(store._id);
        // Reset the form
        setNewCustomer({ name: "", email: "", phone: "" });
        // Close the modal
        setIsModalOpen(false);
        toast.success(response.data.message, {
          duration: 2000,
        });
      } else {
        toast.error(response.data.message, {
          duration: 2000,
        });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        errorFunction(navigate);
      } else {
        console.log(error);
        toast.error(error.message, {
          duration: 2000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // const handleGivePoints = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   try {
  //     const response = await api.put(
  //       `/store/givePoints/${storeID}`,
  //       { phone, points },
  //       { headers: { token } }
  //     );
  //     if (response.data.success) {
  //       toast.success(response.data.message, {
  //         duration: 2000,
  //       });
  //     } else {
  //       toast.error(response.data.message, {
  //         duration: 2000,
  //       });
  //     }
  //   } catch (error) {
  //     console.log(error);

  //     toast.error(error.message, {
  //       duration: 2000,
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const filteredCustomers = customers.filter(
    (user) =>
      user &&
      [user.name, user.email, user.phone].some((field) =>
        String(field || "")
          .toLowerCase()
          .includes(query.toLowerCase())
      )
  );

  const tableColumnCount =
    5 +
    (store?.needCustomerDOB ? 1 : 0) +
    (store?.loyaltyCard?.format === "L34HA" ||
    store?.loyaltyCard?.format === "L3" ||
    store?.loyaltyCard?.format === "L4"
      ? 1
      : 0) +
    1; // always 1 for the actions column

  const renderTableSkeleton = (rows = 8) => (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={`skeleton-row-${rowIndex}`} className={isDarkMode ? "bg-gray-900" : "bg-white"}>
          {Array.from({ length: tableColumnCount }).map((__, colIndex) => (
            <td key={`skeleton-cell-${rowIndex}-${colIndex}`} className="px-6 py-4">
              <div
                className={`h-3 rounded-full animate-pulse ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
                style={{ width: `${60 + ((rowIndex + colIndex) % 4) * 10}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  const renderMobileSkeleton = (cards = 6) => (
    <div className="space-y-2">
      {Array.from({ length: cards }).map((_, index) => (
        <div
          key={`mobile-skeleton-${index}`}
          className={`rounded-lg shadow-sm border overflow-hidden ${
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div className={`px-4 py-3 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full animate-pulse ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              />
              <div className="flex-1 space-y-2">
                <div
                  className={`h-3 rounded-full animate-pulse ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                  style={{ width: "65%" }}
                />
                <div
                  className={`h-3 rounded-full animate-pulse ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                  style={{ width: "40%" }}
                />
              </div>
              <div
                className={`h-6 w-16 rounded-full animate-pulse ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const toggleCustomerExpansion = (customerId) => {
    setExpandedCustomer(expandedCustomer === customerId ? null : customerId);
  };

  const fetchOutletPointsForCustomer = useCallback(async (phone) => {
    setIsLoadingOutletPoints(true);
    setOutletPointsError("");
    setOutletPointsResult(null);
    setShowOutletPointsModal(true);
    try {
      const response = await api.get(
        `/api/l5/customer-points/${store._id}`,
        { headers: { token }, params: { phone } }
      );
      if (response.data.success) {
        setOutletPointsResult(response.data.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setOutletPointsError("No customer found with this phone number.");
      } else {
        setOutletPointsError("Failed to fetch customer points.");
      }
    } finally {
      setIsLoadingOutletPoints(false);
    }
  }, [store, token]);

  const openClaimRewardModal = async (customer) => {
    setClaimRewardCustomer(customer);
    setSelectedRewardId("");
    setClaimRewardError("");
    setClaimRewardModalOpen(true);
    try {
      const res = await api.get(`/reward/getRewards/${store._id}`);
      if (res.data.success) {
        const storeFormat = store?.loyaltyCard?.format;
        let rewards = res.data.rewards || [];
        if (storeFormat === "L5") {
          const l5Rewards = res.data.l5Config?.rewards || [];
          setAvailableRewards(l5Rewards.map((r) => ({
            _id: r._id || `l5-${r.threshold}`,
            name: r.rewardName || r.name || `${r.threshold} pts Reward`,
            threshold: r.threshold,
            rewardType: r.rewardType,
            discountPercentage: r.discountPercentage,
          })));
          return;
        }
        if (storeFormat === "L4") {
          rewards = rewards.filter((r) => r.type === "l4");
        } else if (storeFormat === "L6") {
          rewards = rewards.filter((r) => r.type === "l6");
        } else if (storeFormat === "L3" || storeFormat === "L34HA") {
          rewards = rewards.filter((r) => r.type === "constant");
        } else {
          rewards = rewards.filter((r) => !r.type || r.type === "standard");
        }
        setAvailableRewards(rewards);
      }
    } catch (error) {
      console.error("Failed to fetch rewards:", error);
      toast.error("Failed to load rewards");
    }
  };

  const handleClaimReward = async () => {
    if (!selectedRewardId) {
      setClaimRewardError("Please select a reward");
      return;
    }
    setClaimRewardLoading(true);
    setClaimRewardError("");
    try {
      const outletId = localStorage.getItem("outletId");
      const res = await api.post(
        `/store/claimRewardForCustomer/${store.url}`,
        {
          customerId: claimRewardCustomer._id,
          rewardId: selectedRewardId,
          outletId: outletId || undefined,
        },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success(res.data.message || "Reward claimed successfully");
        setClaimRewardModalOpen(false);
        setClaimRewardCustomer(null);
        setSelectedRewardId("");
        setClaimRewardError("");
        await getCustomers(store._id);
      } else {
        setClaimRewardError(res.data.message || "Cannot claim reward");
        toast.error("Cannot claim reward");
      }
    } catch (error) {
      console.error("Claim reward error:", error);
      const msg = error?.response?.data?.message || "Cannot claim reward";
      setClaimRewardError(msg);
      toast.error("Cannot claim reward");
    } finally {
      setClaimRewardLoading(false);
    }
  };

  const handleIncreasePoints = async () => {
    const { userId, currentPoints, store } = pointsModalData;

    // Handle L4 format separately - call editUserPoints with billAmount
    if (store?.loyaltyCard?.format === "L4") {
      if (!billAmount || billAmount <= 0) {
        toast.error("Please enter a valid bill amount");
        return;
      }

      setLoading(true);
      try {
        const response = await api.put(
          `/store/updatePointsS/${userId}`,
          {
            billAmount: Number(billAmount),
            billID: billID || "",
            remarks: remarks || "",
            outlet: outletId || undefined,
          },
          { headers: { token } }
        );

        if (response.data.success) {
          toast.success(response.data.message || "Points added successfully");
          // Refresh customers data
          getCustomers(store._id);
          setIncreasePointsModal(false);
          setBillID("");
          setBillAmount("");
          setRemarks("");
        } else {
          toast.error(response.data.message || "Failed to add points");
        }
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) {
          errorFunction(navigate);
        } else {
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Failed to add points"
          );
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    if (store?.amount) {
      let point;
      if (store.isRounded) {
        point = Math.round(
          toInteger(billAmount) / toInteger(store.conversionRate)
        );
      } else {
        point =
          Math.round((Number(billAmount) / Number(store.conversionRate)) * 10) /
          10;
      }
      setPointsModalData((prev) => ({
        ...prev,
        newPoints: currentPoints + point,
      }));
      await handlePointsConfirm(currentPoints + point);
    } else {
      setPointsModalData((prev) => ({
        ...prev,
        newPoints: currentPoints + addingPoints,
      }));
      await handlePointsConfirm(Number(currentPoints) + Number(addingPoints));
    }
  };

  const handlePointsConfirm = async (points) => {
    const { userId, newPoints, store } = pointsModalData;
    console.log('[handlePointsConfirm] Called with points:', points);
    console.log('[handlePointsConfirm] pointsModalData.newPoints:', newPoints);

    // Use points if it's defined (even if 0), otherwise use newPoints
    const finalPoints = points !== undefined && points !== null ? points : newPoints;
    console.log('[handlePointsConfirm] Final points value:', finalPoints);

    if (finalPoints === undefined || finalPoints === null) {
      console.error('[handlePointsConfirm] ERROR: finalPoints is undefined/null');
      toast.error("Points value is invalid");
      setLoading(false);
      return;
    }

    setLoading(true);
    // Update UI immediately
    setCustomers((prev) =>
      prev.map((customer) =>
        customer._id === userId
          ? { ...customer, points: finalPoints }
          : customer
      )
    );

    // Make API call
    try {
      let billIDValue = "";
      if (
        store?.needBillID &&
        finalPoints > pointsModalData.currentPoints
      ) {
        billIDValue = billID;
      }

      console.log('[handlePointsConfirm] Sending API request with:', {
        remarks,
        points: finalPoints,
        billID: billIDValue,
        outlet: outletId || undefined,
      });

      const response = await api.put(
        `/store/updatePointsS/${userId}`,
        {
          remarks,
          points: finalPoints,
          ...(billIDValue && { billID: billIDValue }),
          outlet: outletId || undefined,
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Points updated!", { duration: 1500 });
        originalPointsMap.delete(userId);
        // Refresh customers data silently
        // refreshCustomers();
      } else {
        toast.error("Failed to update points.");
        // Revert changes
        setCustomers((prev) =>
          prev.map((customer) =>
            customer._id === userId
              ? { ...customer, points: pointsModalData.currentPoints }
              : customer
          )
        );
      }
    } catch (error) {
      if (error.response?.status === 401) {
        errorFunction(navigate);
      } else {
        console.error(error);
        toast.error("Error updating points.");
        // Revert changes
        setCustomers((prev) =>
          prev.map((customer) =>
            customer._id === userId
              ? { ...customer, points: pointsModalData.currentPoints }
              : customer
          )
        );
      }
    } finally {
      setLoading(false);
    }

    setShowPointsModal(false);
    setIncreasePointsModal(false);
    setBillID("");
    setBillAmount();
    setAddingPoints();
    setRemarks("");
  };

  const handlePointsCancel = () => {
    const { userId, currentPoints } = pointsModalData;

    // Revert the UI changes if user cancels
    setCustomers((prev) =>
      prev.map((customer) =>
        customer._id === userId
          ? { ...customer, points: currentPoints }
          : customer
      )
    );

    originalPointsMap.delete(userId);
    setShowPointsModal(false);
    setIncreasePointsModal(false);
    setBillID("");
    setBillAmount();
    setAddingPoints();
    setRemarks("");
  };

  const handleOpenEditCustomer = (customer) => {
    setEditCustomerData({
      _id: customer._id,
      name: customer.name || "",
      email: customer.email || "",
      phone: String(customer.phone || ""),
      countryCode: customer.countryCode || "+977",
      dob: customer.dob ? customer.dob.split("T")[0] : "",
      gender: customer.gender || "",
    });
    setEditCustomerErrors({ email: "", phone: "" });
    setShowEditCustomerModal(true);
  };

  const handleEditCustomerSubmit = async (e) => {
    e.preventDefault();
    setEditCustomerLoading(true);
    try {
      const res = await api.put(
        `/store/editCustomerS/${editCustomerData._id}`,
        {
          name: editCustomerData.name,
          email: editCustomerData.email,
          phone: editCustomerData.phone,
          countryCode: editCustomerData.countryCode,
          dob: editCustomerData.dob || undefined,
          gender: editCustomerData.gender || undefined,
        },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("Customer updated successfully", { duration: 2000 });
        setCustomers((prev) =>
          prev.map((c) =>
            c._id === editCustomerData._id ? { ...c, ...res.data.customer } : c
          )
        );
        setShowEditCustomerModal(false);
      } else {
        toast.error(res.data.message || "Failed to update customer", { duration: 2000 });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        errorFunction(navigate);
      } else {
        console.error(err);
        toast.error("Failed to update customer", { duration: 2000 });
      }
    } finally {
      setEditCustomerLoading(false);
    }
  };



  return (
    <div
      className={`px-2 sm:px-0 md:px-4 lg:px-0 sm:ml-0 lg:ml-64 min-h-screen transition-colors ${
        isDarkMode ? "bg-gray-900" : "bg-[#f8fafb]"
      }`}
      onClick={() => openKebabId && setOpenKebabId(null)}
    >
      {loading && <LoadingSpinner />}

      {/* Outlet Points Modal (L5 only) */}
      {showOutletPointsModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowOutletPointsModal(false)}
          />
          <div
            className={`relative w-full max-w-md rounded-xl shadow-2xl flex flex-col overflow-hidden ${
              isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-5 py-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
              <h2 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Customer Points by Outlet
              </h2>
              <button
                onClick={() => setShowOutletPointsModal(false)}
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
              {isLoadingOutletPoints ? (
                <div className={`flex items-center justify-center py-10 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-3" />
                  Loading...
                </div>
              ) : outletPointsError ? (
                <p className="text-sm text-red-500 py-4 text-center">{outletPointsError}</p>
              ) : outletPointsResult && (
                <div className={`rounded-lg border overflow-hidden ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                  {/* Customer info */}
                  <div className={`px-4 py-3 ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                    <p className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {outletPointsResult.customer.name}
                    </p>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {outletPointsResult.customer.phone}
                      {outletPointsResult.customer.email && ` · ${outletPointsResult.customer.email}`}
                    </p>
                  </div>
                  {/* Outlet rows */}
                  {outletPointsResult.outlets.length > 0 ? (
                    <div className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-100"}`}>
                      {outletPointsResult.outlets.map((o) => (
                        <div key={o.outletId} className="flex items-center justify-between px-4 py-3">
                          <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                            {o.location}
                          </span>
                          <span className="text-sm font-semibold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">
                            {o.currentPoints} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`px-4 py-3 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      No points collected at any outlet yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Claim Reward Modal */}
      {claimRewardModalOpen && claimRewardCustomer && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div
            className={`w-full max-w-md rounded-2xl shadow-xl overflow-hidden ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className={`px-6 py-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Claim Reward
              </h3>
              <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                For {claimRewardCustomer.name}
              </p>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Select Reward
                </label>
                <select
                  value={selectedRewardId}
                  onChange={(e) => setSelectedRewardId(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    isDarkMode
                      ? "bg-gray-900 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="">Choose a reward...</option>
                  {availableRewards.map((reward) => (
                    <option key={reward._id} value={reward._id}>
                      {reward.name}
                      {reward.threshold ? ` (${reward.threshold} pts)` : ""}
                      {reward.points ? ` (${reward.points} pts)` : ""}
                      {reward.pointCost ? ` (${reward.pointCost} pts)` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRewardId && (
                <div className={`p-3 rounded-lg text-sm ${isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-700"}`}>
                  <p>Reward will be claimed immediately for <strong>{claimRewardCustomer.name}</strong>.</p>
                </div>
              )}

              {claimRewardError && (
                <div className={`p-3 rounded-lg text-sm border ${isDarkMode ? "bg-red-900/20 border-red-800 text-red-300" : "bg-red-50 border-red-200 text-red-700"}`}>
                  <p className="font-medium">Cannot claim reward</p>
                  <p className="mt-1">{claimRewardError}</p>
                </div>
              )}
            </div>

            <div className={`px-6 py-4 border-t flex gap-3 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
              <button
                onClick={() => {
                  setClaimRewardModalOpen(false);
                  setClaimRewardCustomer(null);
                  setSelectedRewardId("");
                }}
                className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  isDarkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                disabled={claimRewardLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleClaimReward}
                disabled={!selectedRewardId || claimRewardLoading}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                  !selectedRewardId || claimRewardLoading
                    ? "bg-green-600 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {claimRewardLoading ? "Claiming..." : "Claim Reward"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between w-full mb-6 sm:mb-8 p-4 sm:p-6 border-b transition-colors ${
          isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-[#f8fafb] border-gray-200"
        }`}
      >
        {/* Left: Title and Total */}
        <div className="flex flex-col gap-2 mb-4 sm:mb-0">
          <h1
            className={`text-xl sm:text-2xl font-semibold transition-colors ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Customers
          </h1>
          <span
            className={`text-sm transition-colors ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Total: {filteredCustomers ? filteredCustomers.length : 0} customers
            {filteredCustomers.length > 0 && (
              <span className="block sm:inline sm:ml-2">
                (Showing {startIndex + 1}-
                {Math.min(endIndex, filteredCustomers.length)} of{" "}
                {filteredCustomers.length})
              </span>
            )}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
              size={20}
            />
            <input
              type="text"
              placeholder="Search customers..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`w-full sm:w-64 rounded-lg pl-10 pr-4 py-2.5 border focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent transition-colors ${
                isDarkMode
                  ? "bg-gray-900 text-white border-gray-600 placeholder-gray-400"
                  : "bg-white text-gray-700 border-gray-200"
              }`}
            />
          </div>

          {/* Add Customer Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Desktop Table View - Hidden on mobile */}
      <div
        className={`hidden lg:block rounded-xl shadow-sm border overflow-x-auto mx-4 sm:mx-6 transition-colors ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-100"
        }`}
      >
        <table className="w-full">
          <thead
            className={`border-b transition-colors ${
              isDarkMode
                ? "bg-gray-900 border-gray-600"
                : "bg-gray-50 border-gray-100"
            }`}
          >
            <tr>
              <th
                className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                S.N.
              </th>
              <th
                className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Name
              </th>
              <th
                className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <div className="flex items-center gap-2">Email</div>
              </th>
              <th
                className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <div className="flex items-center gap-2">Phone Number</div>
              </th>
              {store?.needCustomerDOB && (
                <th
                  className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <div className="flex items-center gap-2">DOB</div>
                </th>
              )}
              <th
                className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <div className="flex items-center gap-2">Points</div>
              </th>
              {(store?.loyaltyCard?.format === "L34HA" ||
                store?.loyaltyCard?.format === "L3" ||
                store?.loyaltyCard?.format === "L4") && (
                <th
                  className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <div className="flex items-center gap-2">Tier</div>
                </th>
              )}
              <th className={`px-3 py-4 text-xs font-medium uppercase tracking-wider transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
            </tr>
          </thead>
          <tbody
            className={`divide-y transition-colors ${
              isDarkMode
                ? "bg-gray-900 divide-gray-700"
                : "bg-white divide-gray-100"
            }`}
          >
            {loading ? (
              renderTableSkeleton()
            ) : currentCustomers.length > 0 ? (
              currentCustomers
                .sort((a, b) => b.points - a.points)
                .map((user, index) => (
                  <tr
                    key={user._id}
                    className={`transition-colors ${
                      isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"
                    }`}
                  >
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium transition-colors ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div
                          className={`text-sm font-medium transition-colors ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {user.name}
                        </div>
                        <div
                          className={`text-xs transition-colors ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Joined{" "}
                          {new Date(
                            user.createdAt || Date.now()
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm transition-colors ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {store?.showEmailOnSubAdmin
                        ? user.email
                        : maskEmail(user.email)}{" "}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm transition-colors ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {user.countryCode || "+977"}{" "}
                      {store?.showPhoneNumberOnSubAdmin
                        ? user.phone
                        : maskPhone(user.phone)}
                    </td>
                    {store?.needCustomerDOB && (
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {user.dob ? user.dob.split("T")[0] : "---"}
                      </td>
                    )}
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span
                        className={`text-sm font-medium mr-2 transition-colors ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {" "}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isDarkMode
                            ? "bg-green-900/30 text-green-400"
                            : "bg-gray-100 text-green-800"
                        }`}
                      >
                        {user.points}
                      </span>
                    </div>
                  </td> */}
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                      {store?.letSubAdminToGiveManualPoints === false ? (
                        <div>
                          <span
                            className={`w-10 lg:w-12 px-1 lg:px-2 py-1 text-center text-xs lg:text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                              isDarkMode
                                ? "bg-gray-900 border-gray-600 text-white"
                                : "bg-gray-100 border-gray-300 text-gray-900"
                            }`}
                          >
                            {user.points}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 lg:gap-2">
                          <span
                            className={`w-10 lg:w-12 px-1 lg:px-2 py-1 text-center text-xs lg:text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                              isDarkMode
                                ? "bg-gray-900 border-gray-600 text-white"
                                : "bg-gray-100 border-gray-300 text-gray-900"
                            }`}
                          >
                            {user.points}
                          </span>
                          <button
                            className="w-6 h-6 lg:w-8 lg:h-8 rounded-xl bg-green-500 text-white hover:bg-green-600 flex items-center justify-center transition-colors"
                            onClick={() => {
                              setPointsModalData({
                                userId: user._id,
                                currentPoints: user.points,
                                store,
                              });
                              setIncreasePointsModal(true);
                            }}
                          >
                            <span className="text-xs lg:text-sm font-medium">
                              +
                            </span>
                          </button>
                        </div>
                      )}
                    </td>
                    {(store?.loyaltyCard?.format === "L34HA" ||
                      store?.loyaltyCard?.format === "L3" ||
                      store?.loyaltyCard?.format === "L4") && (
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        <span
                          className={`text-xs lg:text-sm border rounded-md px-2 lg:px-3 py-1 inline-block ${
                            isDarkMode
                              ? "bg-gray-900 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                        >
                          {user?.tier || "—"}
                        </span>
                      </td>
                    )}
                    {/* Actions kebab menu */}
                    <td className="px-3 py-4 whitespace-nowrap relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setOpenKebabId(openKebabId === user._id ? null : user._id)}
                        className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openKebabId === user._id && (
                        <div
                          className={`absolute right-0 top-full mt-1 w-52 rounded-lg shadow-lg border z-50 py-1 ${
                            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                          }`}
                        >
                          <button
                            onClick={() => {
                              setOpenKebabId(null);
                              handleOpenEditCustomer(user);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                              isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <Pencil size={14} />
                            Edit Customer
                          </button>
                          {store?.loyaltyCard?.format === "L5" && (
                            <button
                              onClick={() => {
                                setOpenKebabId(null);
                                fetchOutletPointsForCustomer(user.phone);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                                isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <BarChart2 size={14} />
                              Check Outlet Points
                            </button>
                          )}
                          {store?.letSubAdminToClaimRewards !== false && (
                            <button
                              onClick={() => {
                                setOpenKebabId(null);
                                openClaimRewardModal(user);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                                isDarkMode ? "text-green-300 hover:bg-gray-700" : "text-green-700 hover:bg-gray-50"
                              }`}
                            >
                              <Gift size={14} />
                              Claim Reward
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={tableColumnCount} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                      }`}
                    >
                      <UserPlus
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
                      No customers found
                    </p>
                    <p
                      className={`text-xs mt-1 transition-colors ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      Add your first customer to get started
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Accordion View - Hidden on desktop */}
      <div className="lg:hidden mx-4 sm:mx-6">
        {loading ? (
          renderMobileSkeleton()
        ) : currentCustomers.length > 0 ? (
          <div className="space-y-2">
            {currentCustomers
              .sort((a, b) => b.points - a.points)
              .map((user, index) => {
                const isExpanded = expandedCustomer === user._id;
                return (
                  <div
                    key={user._id}
                    className={`rounded-lg shadow-sm border overflow-hidden transition-all duration-200 ${
                      isDarkMode ? "bg-gray-800" : "bg-white"
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
                    {/* Accordion Header - Always Visible */}
                    <button
                      onClick={() => toggleCustomerExpansion(user._id)}
                      className={`w-full px-4 py-3 flex items-center justify-between transition-colors focus:outline-none ${
                        isExpanded
                          ? isDarkMode
                            ? "bg-green-900/30 hover:bg-green-900/40"
                            : "bg-gradient-to-r from-green-50 to-green-25 hover:from-green-75 hover:to-green-50"
                          : isDarkMode
                          ? "hover:bg-gray-800 focus:bg-gray-700"
                          : "hover:bg-gray-50 focus:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        {/* Customer Number Badge */}
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
                                  isDarkMode ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {user.name}
                              </h3>
                              <p
                                className={`text-xs mt-0.5 transition-colors ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                Joined{" "}
                                {new Date(
                                  user.createdAt || Date.now()
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                            <span
                              className={`ml-2 mr-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                isDarkMode
                                  ? "bg-green-900/30 text-green-400"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {user.points} pts
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expand/Collapse Icon */}
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

                    {/* Accordion Content - Expandable */}
                    {isExpanded && (
                      <div
                        className={`px-4 pb-4 border-t transition-colors ${
                          isDarkMode
                            ? "border-green-600/30 bg-gray-800/50"
                            : "border-green-200 bg-gradient-to-b from-green-25 to-white"
                        }`}
                      >
                        <div className="space-y-3 pt-3">
                          {/* Email */}
                          <div className="flex items-center space-x-3">
                            <svg
                              className={`w-4 h-4 flex-shrink-0 transition-colors ${
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
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs mb-1 transition-colors ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                Email
                              </p>
                              <p
                                className={`text-sm truncate transition-colors ${
                                  isDarkMode ? "text-gray-300" : "text-gray-900"
                                }`}
                              >
                                {store?.showEmailOnSubAdmin
                                  ? user.email
                                  : maskEmail(user.email)}
                              </p>
                            </div>
                          </div>

                          {/* Phone */}
                          <div className="flex items-center space-x-3">
                            <svg
                              className={`w-4 h-4 flex-shrink-0 transition-colors ${
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
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs mb-1 transition-colors ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                Phone
                              </p>
                              <p
                                className={`text-sm transition-colors ${
                                  isDarkMode ? "text-gray-300" : "text-gray-900"
                                }`}
                              >
                                {user.countryCode || "+977"}{" "}
                                {store?.showPhoneNumberOnSubAdmin
                                  ? user.phone
                                  : maskPhone(user.phone)}
                              </p>
                            </div>
                          </div>
                          {/* DOB */}
                          {store?.needCustomerDOB && (
                            <div className="flex items-center space-x-3">
                              <Cake
                                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                                  isDarkMode ? "text-gray-500" : "text-gray-400"
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-xs mb-1 transition-colors ${
                                    isDarkMode
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                  }`}
                                >
                                  Date of Birth
                                </p>
                                <p
                                  className={`text-sm transition-colors ${
                                    isDarkMode
                                      ? "text-gray-300"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {user.dob ? user.dob.split("T")[0] : "---"}
                                </p>
                              </div>
                            </div>
                          )}
                          {/* Points Management */}
                          {store?.letSubAdminToGiveManualPoints === false ? (
                            <div>
                              <label
                                className={`block text-xs font-medium mb-2 transition-colors ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                Points
                              </label>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`w-10 lg:w-12 px-1 lg:px-2 py-1 text-center text-xs lg:text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                    isDarkMode
                                      ? "bg-gray-900 border-gray-600 text-white"
                                      : "bg-gray-100 border-gray-300 text-gray-900"
                                  }`}
                                >
                                  {user.points}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <label
                                className={`block text-xs font-medium mb-2 transition-colors ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                Manage Points
                              </label>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`w-10 lg:w-12 px-1 lg:px-2 py-1 text-center text-xs lg:text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                    isDarkMode
                                      ? "bg-gray-900 border-gray-600 text-white"
                                      : "bg-gray-100 border-gray-300 text-gray-900"
                                  }`}
                                >
                                  {user.points}
                                </span>
                                <button
                                  className="w-6 h-6 lg:w-8 lg:h-8 rounded-xl bg-green-500 text-white hover:bg-green-600 flex items-center justify-center transition-colors"
                                  onClick={() => {
                                    setPointsModalData({
                                      userId: user._id,
                                      currentPoints: user.points,
                                      store,
                                    });
                                    setIncreasePointsModal(true);
                                  }}
                                >
                                  <span className="text-xs lg:text-sm font-medium">
                                    +
                                  </span>
                                </button>
                              </div>
                            </div>
                          )}
                          {(store?.loyaltyCard?.format === "L34HA" ||
                            store?.loyaltyCard?.format === "L3" ||
                            store?.loyaltyCard?.format === "L4") && (
                            <div>
                              <label
                                className={`block text-xs font-medium mb-2 transition-colors ${
                                  isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                Tier
                              </label>
                              <span
                                className={`text-sm border rounded-md px-3 py-1 inline-block ${
                                  isDarkMode
                                    ? "bg-gray-900 border-gray-600 text-white"
                                    : "bg-white border-gray-300 text-gray-900"
                                }`}
                              >
                                {user?.tier || "—"}
                              </span>
                            </div>
                          )}
                          {/* Edit Customer */}
                          <button
                            onClick={() => handleOpenEditCustomer(user)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                              isDarkMode
                                ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <Pencil size={14} />
                            Edit Customer
                          </button>
                          {/* Check Outlet Points - L5 only */}
                          {store?.loyaltyCard?.format === "L5" && (
                            <button
                              onClick={() => fetchOutletPointsForCustomer(user.phone)}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                isDarkMode
                                  ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                                  : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              <BarChart2 size={14} />
                              Check Outlet Points
                            </button>
                          )}
                          {store?.letSubAdminToClaimRewards !== false && (
                            <button
                              onClick={() => openClaimRewardModal(user)}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                isDarkMode
                                  ? "bg-green-600 border-green-500 text-white hover:bg-green-700"
                                  : "bg-green-600 border-green-400 text-white hover:bg-green-600"
                              }`}
                            >
                              <Gift size={14} />
                              Claim Reward
                            </button>
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
            className={`rounded-xl shadow-sm border p-8 transition-colors ${
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
                <UserPlus
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
                No customers found
              </p>
              <p
                className={`text-xs mt-1 transition-colors ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Add your first customer to get started
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredCustomers.length > itemsPerPage && (
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 mx-4 sm:mx-6 gap-4 sm:gap-0 transition-colors ${
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
              {Math.min(endIndex, filteredCustomers.length)} of{" "}
              {filteredCustomers.length} results
            </span>
          </div>

          <div className="flex items-center justify-center space-x-1 sm:space-x-2 order-1 sm:order-2">
            <button
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className={`px-3 sm:px-3 py-2 text-sm font-medium border rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                isDarkMode
                  ? "text-gray-400 bg-gray-700 border-gray-600 hover:bg-gray-600 disabled:hover:bg-gray-800"
                  : "text-gray-500 bg-white border-gray-300 hover:bg-gray-50 disabled:hover:bg-white"
              }`}
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">‹</span>
            </button>

            <div className="flex items-center space-x-1">
              {Array.from(
                {
                  length: Math.min(window.innerWidth < 640 ? 3 : 5, totalPages),
                },
                (_, i) => {
                  const maxVisible = window.innerWidth < 640 ? 3 : 5;
                  let pageNumber;
                  if (totalPages <= maxVisible) {
                    pageNumber = i + 1;
                  } else if (currentPage <= Math.floor(maxVisible / 2) + 1) {
                    pageNumber = i + 1;
                  } else if (
                    currentPage >=
                    totalPages - Math.floor(maxVisible / 2)
                  ) {
                    pageNumber = totalPages - maxVisible + 1 + i;
                  } else {
                    pageNumber = currentPage - Math.floor(maxVisible / 2) + i;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
                      className={`px-3 sm:px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        currentPage === pageNumber
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : isDarkMode
                          ? "text-gray-400 bg-gray-700 border border-gray-600 hover:bg-gray-600"
                          : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
              )}
            </div>

            <button
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className={`px-3 sm:px-3 py-2 text-sm font-medium border rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                isDarkMode
                  ? "text-gray-400 bg-gray-700 border-gray-600 hover:bg-gray-600 disabled:hover:bg-gray-800"
                  : "text-gray-500 bg-white border-gray-300 hover:bg-gray-50 disabled:hover:bg-white"
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">›</span>
            </button>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditCustomerModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditCustomerModal(false)}
        >
          <div
            className={`rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transition-colors ${
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
                  Edit Customer
                </h2>
                <p
                  className={`text-sm mt-1 transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Update customer profile details
                </p>
              </div>
              <button
                onClick={() => setShowEditCustomerModal(false)}
                className={`p-2 rounded-full transition-all duration-200 flex-shrink-0 ml-4 ${
                  isDarkMode
                    ? "text-gray-500 hover:text-gray-300 hover:bg-gray-700"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditCustomerSubmit} className="px-6 sm:px-8 pb-6 sm:pb-8">
              <div className="space-y-4 sm:space-y-5 pt-4 sm:pt-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label
                    className={`block text-sm font-medium transition-colors ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editCustomerData.name}
                    onChange={(e) =>
                      setEditCustomerData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    className={`w-full px-4 py-3 border-0 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200 ${
                      isDarkMode
                        ? "bg-gray-700 text-white placeholder-gray-400 focus:bg-gray-600"
                        : "bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white"
                    }`}
                    placeholder="Enter customer's full name"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label
                    className={`block text-sm font-medium transition-colors ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editCustomerData.email}
                    onChange={(e) => {
                      const val = e.target.value;
                      const duplicate = customers.find(
                        (c) =>
                          c._id !== editCustomerData._id &&
                          c.email?.toLowerCase() === val.toLowerCase()
                      );
                      setEditCustomerErrors((prev) => ({
                        ...prev,
                        email: duplicate
                          ? "This email is already linked to another customer"
                          : "",
                      }));
                      setEditCustomerData((prev) => ({ ...prev, email: val }));
                    }}
                    required
                    className={`w-full px-4 py-3 border-0 rounded-xl focus:outline-none focus:ring-1 transition-all duration-200 ${
                      editCustomerErrors.email
                        ? "ring-1 ring-red-500 bg-red-50 focus:ring-red-500"
                        : isDarkMode
                        ? "bg-gray-700 text-white placeholder-gray-400 focus:bg-gray-600 focus:ring-green-500"
                        : "bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-green-500"
                    }`}
                    placeholder="customer@example.com"
                  />
                  {editCustomerErrors.email && (
                    <p className="text-xs text-red-500">{editCustomerErrors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label
                    className={`block text-sm font-medium transition-colors ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <div className="relative">
                      <select
                        value={editCustomerData.countryCode}
                        onChange={(e) =>
                          setEditCustomerData((prev) => ({ ...prev, countryCode: e.target.value }))
                        }
                        className={`w-40 py-3 pl-3 pr-8 border-0 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200 appearance-none ${
                          isDarkMode
                            ? "bg-gray-700 text-white focus:bg-gray-600"
                            : "bg-gray-50 text-gray-900 focus:bg-white"
                        }`}
                      >
                        {countryCodes.map((country) => (
                          <option key={country.code} value={country.dial_code}>
                            {country.name} ({country.dial_code})
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg
                          className={`w-4 h-4 transition-colors ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
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
                      </div>
                    </div>
                    <input
                      type="tel"
                      value={editCustomerData.phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        const duplicate = customers.find(
                          (c) =>
                            c._id !== editCustomerData._id &&
                            String(c.phone) === String(val)
                        );
                        setEditCustomerErrors((prev) => ({
                          ...prev,
                          phone: duplicate
                            ? "This phone is already linked to another customer"
                            : "",
                        }));
                        setEditCustomerData((prev) => ({ ...prev, phone: val }));
                      }}
                      required
                      className={`flex-1 px-4 py-3 border-0 rounded-xl focus:outline-none focus:ring-1 transition-all duration-200 ${
                        editCustomerErrors.phone
                          ? "ring-1 ring-red-500 bg-red-50 focus:ring-red-500"
                          : isDarkMode
                          ? "bg-gray-700 text-white placeholder-gray-400 focus:bg-gray-600 focus:ring-green-500"
                          : "bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-green-500"
                      }`}
                      placeholder="9800000000"
                    />
                  </div>
                  {editCustomerErrors.phone && (
                    <p className="text-xs text-red-500">{editCustomerErrors.phone}</p>
                  )}
                </div>

                {/* DOB - conditional */}
                {store?.needCustomerDOB && (
                  <div className="space-y-2">
                    <label
                      className={`block text-sm font-medium transition-colors ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={editCustomerData.dob}
                      onChange={(e) =>
                        setEditCustomerData((prev) => ({ ...prev, dob: e.target.value }))
                      }
                      className={`w-full px-4 py-3 border-0 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200 ${
                        isDarkMode
                          ? "bg-gray-700 text-white focus:bg-gray-600"
                          : "bg-gray-50 text-gray-900 focus:bg-white"
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div
                className={`flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 sm:pt-8 mt-6 sm:mt-8 border-t transition-colors ${
                  isDarkMode ? "border-gray-700" : "border-gray-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setShowEditCustomerModal(false)}
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
                  disabled={
                    editCustomerLoading ||
                    !!editCustomerErrors.email ||
                    !!editCustomerErrors.phone
                  }
                  className="w-full sm:w-auto px-6 py-3 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-w-[120px] flex items-center justify-center order-1 sm:order-2"
                >
                  {editCustomerLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className={`rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transition-colors ${
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
                  Add New Customer
                </h2>
                <p
                  className={`text-sm mt-1 transition-colors ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Create a new customer profile for your store
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`p-2 rounded-full transition-all duration-200 flex-shrink-0 ml-4 ${
                  isDarkMode
                    ? "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
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
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <label
                    className={`block text-sm font-medium transition-colors ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newCustomer.name}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border-0 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200 ${
                      isDarkMode
                        ? "bg-gray-700 text-white placeholder-gray-400 focus:bg-gray-600"
                        : "bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white"
                    }`}
                    placeholder="Enter customer's full name"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className={`block text-sm font-medium transition-colors ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newCustomer.email}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border-0 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200 ${
                      isDarkMode
                        ? "bg-gray-700 text-white placeholder-gray-400 focus:bg-gray-600"
                        : "bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white"
                    }`}
                    placeholder="customer@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className={`block text-sm font-medium transition-colors ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    {/* Country Code Selector */}
                    <div className="relative">
                      <select
                        value={selectedCountryCode}
                        onChange={(e) => setSelectedCountryCode(e.target.value)}
                        className={`w-40 py-3 pl-3 pr-8 border-0 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200 appearance-none ${
                          isDarkMode
                            ? "bg-gray-700 text-white focus:bg-gray-600"
                            : "bg-gray-50 text-gray-900 focus:bg-white"
                        }`}
                      >
                        {countryCodes.map((country) => (
                          <option key={country.code} value={country.dial_code}>
                            {country.name} ({country.dial_code})
                          </option>
                        ))}
                      </select>
                      {/* Dropdown Icon */}
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg
                          className={`w-4 h-4 transition-colors ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
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
                      </div>
                    </div>

                    {/* Phone Number Input */}
                    <input
                      type="tel"
                      name="phone"
                      value={newCustomer.phone}
                      onChange={handleChange}
                      required
                      className={`flex-1 px-4 py-3 border-0 rounded-xl focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-200 ${
                        isDarkMode
                          ? "bg-gray-700 text-white placeholder-gray-400 focus:bg-gray-600"
                          : "bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white"
                      }`}
                      placeholder="9800000000"
                    />
                  </div>
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
                  onClick={() => setIsModalOpen(false)}
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
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-w-[120px] flex items-center justify-center order-1 sm:order-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Adding...
                    </>
                  ) : (
                    "Add Customer"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Points Update Confirmation Modal */}
      {showPointsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99]">
          <div
            className={`rounded-lg shadow-xl w-full max-w-md mx-4 transition-colors ${
              isDarkMode ? "bg-gray-900" : "bg-white"
            }`}
          >
            <div
              className={`px-6 py-4 border-b transition-colors ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      pointsModalData.type === "increase"
                        ? "bg-green-100"
                        : pointsModalData.type === "decrease"
                        ? "bg-orange-100"
                        : "bg-green-100"
                    }`}
                  >
                    <svg
                      className={`w-6 h-6 ${
                        pointsModalData.type === "increase"
                          ? "text-green-600"
                          : pointsModalData.type === "decrease"
                          ? "text-orange-600"
                          : "text-green-600"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {pointsModalData.type === "increase" ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      ) : pointsModalData.type === "decrease" ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M20 12H4"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      )}
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {pointsModalData.type === "increase"
                      ? "Increase Points"
                      : pointsModalData.type === "decrease"
                      ? "Decrease Points"
                      : "Update Points"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {pointsModalData.currentPoints} →{" "}
                    {pointsModalData.newPoints} points
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to{" "}
                {pointsModalData.type === "increase"
                  ? "increase"
                  : pointsModalData.type === "decrease"
                  ? "decrease"
                  : "update"}{" "}
                the points from {pointsModalData.currentPoints} to{" "}
                {pointsModalData.newPoints}?
              </p>

              {pointsModalData.store?.needBillID &&
                pointsModalData.newPoints > pointsModalData.currentPoints && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bill ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Bill ID"
                      value={billID}
                      onChange={(e) => setBillID(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handlePointsCancel}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePointsConfirm}
                disabled={
                  pointsModalData.store?.needBillID &&
                  pointsModalData.newPoints > pointsModalData.currentPoints &&
                  !billID
                }
                className={`px-4 py-2 text-sm text-white rounded-lg transition-colors ${
                  pointsModalData.type === "increase"
                    ? "bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                    : pointsModalData.type === "decrease"
                    ? "bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400"
                    : "bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                }`}
              >
                {pointsModalData.type === "increase"
                  ? "Increase Points"
                  : pointsModalData.type === "decrease"
                  ? "Decrease Points"
                  : "Update Points"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Points Increase Confirmation Modal */}
      {increasePointsModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90]"
          onClick={() => setIncreasePointsModal(false)}
        >
          <div
            className={`rounded-lg shadow-xl w-full max-w-md mx-4 transition-colors ${
              isDarkMode ? "bg-gray-900" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`px-6 py-4 border-b transition-colors ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3
                    className={`text-lg font-medium  ${
                      isDarkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    {" "}
                    Increase Points
                  </h3>
                </div>
              </div>
            </div>
            <div className="p-6">
              {pointsModalData.store?.needBillID && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bill ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Bill ID"
                    value={billID}
                    onChange={(e) => setBillID(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              )}
              {pointsModalData.store?.loyaltyCard?.format === "L4" ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bill Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Enter Bill Amount"
                    value={billAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers and decimal point
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setBillAmount(value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Points will be calculated as {(store?.pointEarnRate * 100) || 7}% of the bill amount
                  </p>
                </div>
              ) : pointsModalData.store?.amount ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bill Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Enter Bill Amount"
                    value={billAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers and decimal point
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setBillAmount(value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Points to Increase"
                    value={addingPoints}
                    onChange={(e) => setAddingPoints(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handlePointsCancel}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleIncreasePoints}
                disabled={
                  (pointsModalData.store?.needBillID && !billID) ||
                  (pointsModalData.store?.loyaltyCard?.format === "L4" && !billAmount) ||
                  (pointsModalData.store?.amount && !billAmount) ||
                  (!pointsModalData.store?.amount && !pointsModalData.store?.loyaltyCard?.format === "L4" && !addingPoints) ||
                  loading
                }
                className="px-4 py-2 text-sm text-white rounded-lg transition-colors bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
              >
                {"Increase Points"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Customers;
