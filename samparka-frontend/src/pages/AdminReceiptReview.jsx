import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { Receipt } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import receiptApi from "../api/receiptApi";
import ReceiptPortalContent from "../components/receipt/ReceiptPortalContent";
import StoreSelector from "../components/common/StoreSelector";

const AdminReceiptReview = () => {
  const { authState } = useAuth();
  const { isDarkMode } = useTheme();
  const user = authState?.userInfo;
  const token = Cookies.get("token");
  const isAdmin = user?.role === "admin";

  const [selectedStoreId, setSelectedStoreId] = useState(null);

  const { data: stores = [] } = useQuery({
    queryKey: ["portalStores"],
    queryFn: () => receiptApi.listPortalStores(token).then((r) => r.data?.data || []),
    enabled: !!token,
  });

  // Auto-select for non-admin users (only one store assigned)
  useEffect(() => {
    if (!isAdmin && stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0]._id);
    }
  }, [stores, isAdmin, selectedStoreId]);

  const selectedStore = stores.find((s) => s._id === selectedStoreId) || null;

  return (
    <div
      className={`px-2 sm:px-0 md:px-4 lg:px-0 sm:ml-0 lg:ml-64 min-h-screen transition-colors ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header Section */}
      <div
        className={`border-b shadow-sm transition-colors ${
          isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-100"
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Title and Store Selection Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Title */}
            <div className="flex-1">
              <h1
                className={`text-2xl font-semibold mb-1 transition-colors flex items-center gap-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <Receipt size={22} /> Receipt Review
              </h1>
            </div>
            {/* Store Selection */}
            <div className="flex-shrink-0 min-w-[200px]">
              <StoreSelector
                selectedStore={selectedStore}
                onStoreChange={(store) => setSelectedStoreId(store._id)}
                variant="default"
                customStores={stores}
                fetchOnMount={false}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {!selectedStoreId ? (
          <div className="flex flex-col items-center py-16 gap-3 text-gray-400">
            <Receipt size={40} />
            <p className="text-sm">
              {isAdmin ? "Select a store to view receipts" : "No store assigned to your account"}
            </p>
          </div>
        ) : (
          <ReceiptPortalContent
            storeId={selectedStoreId}
            store={selectedStore}
            token={token}
          />
        )}
      </div>
    </div>
  );
};

export default AdminReceiptReview;
