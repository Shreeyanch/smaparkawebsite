import { Check, Calendar } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import api from "../../api/config";

// Match SegmentDonut.jsx structure
const LAST_VISIT_OPTIONS = [
  { value: "7", label: "1 Week", type: "recent" },
  { value: "30", label: "1 Month", type: "recent" },
  { value: "60", label: "2 Months", type: "recent" },
  { value: "90", label: "3 Months", type: "inactive" },
  { value: "120+", label: "4 Months+", type: "inactive" },
];

const getLastVisitStyles = (isDarkMode, isSelected) => {
  if (isSelected) {
    return isDarkMode
      ? "bg-[#4caf50] text-white border-[#4caf50]"
      : "bg-[#4caf50] text-white border-[#4caf50]";
  }
  return isDarkMode
    ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50";
};

export default function LastVisitChips({ 
  lastVisitFilters, 
  lastVisitDistribution = [], 
  onToggle, 
  onClear,
  storeId,
  token,
  pagination,
  selectedCustomers,
  onCustomerToggle,
  isSelectingAll,
  setIsSelectingAll,
  isLastVisitSelectAllExplicit,
  setIsLastVisitSelectAllExplicit
}) {
  const { isDarkMode } = useTheme();

  // Get count for a specific range value
  const getCountForRange = (value) => {
    const item = lastVisitDistribution.find(d => d.range === value);
    return item ? item.count : 0;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
          Select by Time Since Last Visit
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={async () => {
            // Fetch all customers in batches and select them
            setIsSelectingAll(true);
            setIsLastVisitSelectAllExplicit(true);
            try {
              let allCustomers = [];
              let currentPage = 1;
              let hasMore = true;
              
              while (hasMore) {
                const response = await api.get(`/api/visitAnalytics/customers/${storeId}`, {
                  headers: { token },
                  params: { page: currentPage, limit: 100, includeAll: 'true' },
                });
                
                if (response.data.success) {
                  const customers = response.data.data || [];
                  allCustomers = [...allCustomers, ...customers];
                  
                  // Check if there are more pages
                  const pagination = response.data.pagination;
                  hasMore = pagination && currentPage < pagination.pages;
                  currentPage++;
                } else {
                  hasMore = false;
                }
              }
              
              // Select all fetched customers
              allCustomers.forEach(c => {
                const customerData = {
                  customer: c.customer,
                  customerName: c.customerName,
                  customerPhone: c.customerPhone,
                  customerEmail: c.customerEmail,
                };
                if (!selectedCustomers.some(sc => sc.customer === c.customer)) {
                  onCustomerToggle(customerData);
                }
              });
            } catch (error) {
              console.error("Failed to fetch all customers:", error);
            } finally {
              setIsSelectingAll(false);
            }
          }}
          disabled={isSelectingAll}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            isSelectingAll
              ? isDarkMode
                ? "bg-gray-700 text-gray-400 border-gray-600"
                : "bg-gray-100 text-gray-500 border-gray-300"
              : isLastVisitSelectAllExplicit
              ? "bg-[#4caf50] text-white border-[#4caf50]"
              : isDarkMode
              ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          {isSelectingAll ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="font-medium">Selecting...</span>
            </>
          ) : (
            <>
              {isLastVisitSelectAllExplicit && (
                <Check className="w-4 h-4" />
              )}
              <span className="font-medium">Select All Customers</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                isLastVisitSelectAllExplicit
                  ? "bg-white/20"
                  : isDarkMode
                  ? "bg-white/10"
                  : "bg-black/10"
              }`}>
                {pagination.total || 0}
              </span>
            </>
          )}
        </button>
        {LAST_VISIT_OPTIONS.map((opt) => {
          const isSelected = lastVisitFilters.includes(opt.value);
          const count = getCountForRange(opt.value);

          return (
            <button
              key={opt.value}
              onClick={() => onToggle(opt.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${getLastVisitStyles(
                isDarkMode,
                isSelected
              )}`}
            >
              {isSelected && <Check className="w-4 h-4" />}
              {!isSelected && <Calendar className="w-4 h-4" />}
              <span className="font-medium">{opt.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                isSelected
                  ? "bg-white/20"
                  : isDarkMode
                  ? "bg-white/10"
                  : "bg-black/10"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
        {lastVisitFilters.length > 0 && (
          <button
            onClick={onClear}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              isDarkMode
                ? "text-red-400 hover:bg-red-900/20"
                : "text-red-600 hover:bg-red-50"
            }`}
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}
