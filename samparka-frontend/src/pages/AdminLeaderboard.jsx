import React, { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { toast } from "sonner";
import api from "../api/config";
import LoadingSpinner from "../components/LoadingSpinner";
import LeaderboardFilterBar from "../components/LeaderboardFilterBar";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const AdminLeaderboard = () => {
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;
  const { isDarkMode } = useTheme();
  const [customers, setCustomers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [period, setPeriod] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const getStoresAdmin = async () => {
    try {
      const response = await api.get("/store", { headers: { token } });
      if (response.data.success) setStores(response.data.stores);
    } catch (error) {
      console.error(error);
      toast.error(error.message, { duration: 2000 });
    }
  };

  const getStoresClient = async () => {
    try {
      const response = await api.get("/store/myStores", { headers: { token } });
      if (response.data.success) setStores(response.data.stores);
    } catch (error) {
      console.error(error);
      toast.error(error.message, { duration: 2000 });
    }
  };

  useEffect(() => {
    setLoading(true);
    const fetch = user?.role === "admin" ? getStoresAdmin : getStoresClient;
    fetch().finally(() => setLoading(false));
  }, [token]);

  const fetchLeaderboard = async (storeId, activePeriod, start, end) => {
    if (!storeId) return;
    setLoading(true);
    try {
      let response;
      if (!activePeriod || activePeriod === "all") {
        response = await api.get(`/store/getCustomers/${storeId}`, {
          headers: { token },
        });
        if (response.data.success) {
          setCustomers(
            response.data.customers.map((c) => ({
              ...c,
              periodPoints: c.points > 0 ? c.points : 0,
            }))
          );
        }
      } else {
        const params = new URLSearchParams({ period: activePeriod });
        if (activePeriod === "custom" && start && end) {
          params.append("startDate", start);
          params.append("endDate", end);
        }
        response = await api.get(
          `/store/leaderboardByPeriod/${storeId}?${params}`,
          { headers: { token } }
        );
        if (response.data.success) {
          setCustomers(response.data.customers);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message, { duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when period or custom dates change
  useEffect(() => {
    if (!selectedStoreId) return;
    if (period === "custom" && (!customStart || !customEnd)) return;
    fetchLeaderboard(selectedStoreId, period, customStart, customEnd);
  }, [period, customStart, customEnd, selectedStoreId]);

  const handleStoreChange = (storeId) => {
    setSelectedStoreId(storeId);
    setPeriod("all");
    setCustomStart("");
    setCustomEnd("");
    fetchLeaderboard(storeId, "all", "", "");
  };

  const sortedCustomers = [...customers].sort(
    (a, b) => (b.periodPoints ?? 0) - (a.periodPoints ?? 0)
  );

  const getOrdinalSuffix = (rank) => {
    if (rank % 100 >= 11 && rank % 100 <= 13) return "th";
    switch (rank % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  const periodLabel =
    period === "week"
      ? "This Week"
      : period === "month"
      ? "This Month"
      : period === "custom" && customStart && customEnd
      ? `${customStart} – ${customEnd}`
      : "All Time";

  return (
    <div className="p-4 sm:ml-64 bg-stone-800 min-h-screen mr-6 mt-7 rounded rounded-xl">
      {loading && <LoadingSpinner />}

      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col gap-3 border-b pb-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy size={32} className="text-yellow-500" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>
                {selectedStoreId && (
                  <p className="text-xs text-gray-500 mt-0.5">{periodLabel}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-gray-800">Store:</div>
              <div className="text-emerald-500">
                <select
                  name="store"
                  id="store"
                  onChange={(e) => handleStoreChange(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-stone-900 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
                >
                  <option disabled selected>
                    Select Store
                  </option>
                  {stores &&
                    stores.map((store) => (
                      <option value={store._id} key={store._id}>
                        {store.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {selectedStoreId && (
            <LeaderboardFilterBar
              period={period}
              customStart={customStart}
              customEnd={customEnd}
              onPeriodChange={(p) => setPeriod(p)}
              onCustomDateChange={(s, e) => {
                setCustomStart(s);
                setCustomEnd(e);
              }}
              isDarkMode={isDarkMode}
            />
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="text-xs text-gray-600 uppercase bg-gray-300">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-center">
                  Points {period !== "all" ? `(${periodLabel})` : ""}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCustomers.length > 0 ? (
                sortedCustomers.map((customer, index) => (
                  <tr
                    key={customer._id}
                    className={`border-b ${
                      index % 2 === 0 ? "bg-gray-100" : "bg-white"
                    } hover:bg-gray-200 transition-all`}
                  >
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {index + 1}
                      <sup>{getOrdinalSuffix(index + 1)}</sup>
                    </td>
                    <td className="py-3 px-4">{customer.name}</td>
                    <td className="py-3 px-4 text-center font-semibold text-blue-600">
                      {(customer.periodPoints ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-4 text-center text-gray-500">
                    {selectedStoreId
                      ? "No customers with points in this period"
                      : "Select a store to view the leaderboard"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminLeaderboard;
