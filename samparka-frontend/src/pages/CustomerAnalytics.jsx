import { Eye, MonitorDot, UserRoundPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/config";
import { toast } from "sonner";

import { useAuth } from "../context/AuthContext";

export default function CustomerAnalytics() {
  const [selected, setSelected] = useState(
    localStorage.getItem("selectedValue") || ""
  );
  const [storeId, setStoreId] = useState(selected || "");
  const [stores, setStores] = useState([]);
  const [customerAnalytics, setCustomerAnalytics] = useState([]);

  const { authState } = useAuth();
  const { userInfo: user, token } = authState;

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response =
          user.role === "admin"
            ? await api.get("/store", { headers: { token } })
            : await api.get("/store/myStores", { headers: { token } });

        if (response.data.success) {
          setStores(response.data.stores);
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message, { duration: 2000, theme: "colored" });
      }
    };

    fetchStores();
  }, [token]);

  useEffect(() => {
    localStorage.setItem("selectedValue", selected);
  }, [selected]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get(
          `/reward/getCustomerAnalytics/${selected}`,
          {
            headers: { token },
          }
        );
        if (response.data.success) {
          setCustomerAnalytics(response.data);
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrongg!");
      }
    };
    if (selected) {
      fetchAnalytics();
    }
  }, [storeId, selected, token]);

  return (
    <div className="p-4 sm:ml-64 bg-stone-800 min-h-screen mr-4 mt-4 rounded-xl text-white overflow-x-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">CUSTOMER ANALYTICS</h2>
        <div className="text-emerald-500">
          <select
            onChange={(e) => {
              setStoreId(e.target.value);
              setSelected(e.target.value);
            }}
            value={selected}
            className="w-36 px-3 py-2 rounded-lg bg-stone-900 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
          >
            <option  value="" disabled>Select Store</option>
            {stores.map((store) => {
              return (
                <option value={store._id} key={store._id}>
                  {store.name}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="p-4 bg-stone-900 rounded-lg shadow-md border border-transparent hover:border-teal-400 hover:shadow-green-400 transition">
          <div className="flex items-center justify-between">
            <Users className="text-teal-400 w-8 h-8" />
            <span className="text-2xl font-bold text-gray-300 -ml-4">
              {customerAnalytics.totalCustomers}
            </span>
          </div>
          <p className="text-teal-400 mt-2">Total Customers</p>
        </div>

        {/* Card 2 */}
        <div className="p-4 bg-stone-900 rounded-lg shadow-md border border-transparent hover:border-teal-400 hover:shadow-green-400 transition">
          <div className="flex items-center justify-between">
            <MonitorDot className="text-teal-400 w-8 h-8" />
            <span className="text-2xl font-bold text-gray-300 -ml-4">
              {customerAnalytics.activeUsers}
            </span>
          </div>
          <p className="text-teal-400 mt-2">Active Users</p>
        </div>

        {/* Card 3 */}
        <div className="p-4 bg-stone-900 rounded-lg shadow-md border border-transparent hover:border-teal-400 hover:shadow-green-400 transition">
          <div className="flex items-center justify-between">
            <UserRoundPlus className="text-teal-400 w-8 h-8" />
            <span className="text-2xl font-bold text-gray-300 -ml-4">
              {customerAnalytics.newUsers}
            </span>
          </div>
          <p className="text-teal-400 mt-2">New Users</p>
        </div>

        {/* Card 4 */}
        <div className="p-4 bg-stone-900 rounded-lg shadow-md border border-transparent hover:border-teal-400 hover:shadow-green-400 transition">
          <div className="flex items-center justify-between">
            <Eye className="text-teal-400 w-8 h-8" />
            <span className="text-2xl font-bold text-gray-300 -ml-4">
              {customerAnalytics.pageViews}
            </span>
          </div>
          <p className="text-teal-400 mt-2">Page Views</p>
        </div>
      </div>
    </div>
  );
}
