import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../api/config";
import LoadingSpinner from "../components/LoadingSpinner";
import SegmentMessagingTab from "../components/messaging/SegmentMessagingTab";
import StoreSelector from "../components/common/StoreSelector";

export default function Messaging() {
  const { isDarkMode } = useTheme();
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;

  // State
  const [selected, setSelected] = useState(localStorage.getItem("selectedValue") || "");
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [segments, setSegments] = useState([]);

  // Fetch stores
  const fetchStores = async () => {
    try {
      const response = user.role === "admin"
        ? await api.get("/store", { headers: { token } })
        : await api.get("/store/myStores", { headers: { token } });
      if (response.data.success) setStores(response.data.stores);
    } catch (error) {
      toast.error("Failed to fetch stores");
    }
  };

  // Fetch segments
  const fetchSegments = async () => {
    if (!selected) return;
    setIsLoading(true);
    try {
      const response = await api.get(`/api/visitAnalytics/segments/${selected}`, {
        headers: { token },
      });

      if (response.data.success) {
        setSegments(response.data.data.segments);
      }
    } catch (error) {
      toast.error("Failed to fetch segments");
    } finally {
      setIsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchStores();
  }, [token]);

  useEffect(() => {
    localStorage.setItem("selectedValue", selected);
  }, [selected]);

  useEffect(() => {
    if (selected) {
      fetchSegments();
    }
  }, [selected]);

  return (
    <div className={`px-2 sm:px-4 pb-6 ml-0 lg:ml-64 min-h-screen transition-colors ${
      isDarkMode ? "bg-gray-900" : "bg-[#f2f5f9]"
    }`}>
      {isLoading && <LoadingSpinner />}

      {/* Header */}
      <header className={`p-4 lg:p-6 border-b transition-colors ${
        isDarkMode ? "bg-gray-900 border-gray-700" : "bg-[#f2f5f9] border-gray-200"
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Messaging
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Send targeted messages to customer segments
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-full sm:w-64">
              <StoreSelector
                selectedStoreId={selected}
                onStoreIdChange={setSelected}
                variant="default"
                customStores={stores}
                fetchOnMount={false}
              />
            </div>
          </div>
        </div>
      </header>

      {selected ? (
        <div className="p-4 lg:p-6">
          <SegmentMessagingTab
            storeId={selected}
            segments={segments}
            storeData={stores.find((s) => s._id === selected) || null}
          />
        </div>
      ) : (
        <div className={`flex items-center justify-center h-[60vh] ${
          isDarkMode ? "text-gray-400" : "text-gray-500"
        }`}>
          <p>Please select a store to send messages</p>
        </div>
      )}
    </div>
  );
}
