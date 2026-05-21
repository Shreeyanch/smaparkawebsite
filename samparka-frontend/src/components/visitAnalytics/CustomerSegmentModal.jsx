import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { X, Search, Users, Send, ArrowLeft } from "lucide-react";
import api from "../../api/config";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";

const SEGMENT_LABELS = {
  first_visit: "1st Visit",
  second_visit: "2nd Visit",
  third_visit: "3rd Visit",
  fourth_visit: "4th Visit",
  "5+_visits": "5+ Visits",
};

const LAST_VISIT_LABELS = {
  "7": "1 Week",
  "30": "1 Month",
  "60": "2 Months",
  "90": "3 Months",
  "120+": "4 Months+",
};

export default function CustomerSegmentModal({
  isOpen,
  onClose,
  segment,
  storeId,
  store,
  viewMode, // "segments" | "lastVisit"
  outletId, // Optional: filter by specific outlet
  startDate,
  endDate,
  onNotify
}) {
  const { isDarkMode } = useTheme();
  const { authState } = useAuth();
  const { token } = authState;

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  const segmentLabel = viewMode === "segments"
    ? SEGMENT_LABELS[segment]
    : LAST_VISIT_LABELS[segment];

  const shouldShowTier = store?.loyaltyCard?.format === "L3" || store?.loyaltyCard?.format === "L34HA";


  useEffect(() => {
    if (isOpen && segment && storeId) {
      fetchCustomers(1);
    }
  }, [isOpen, segment, storeId, searchQuery, outletId, startDate, endDate]);

  const fetchCustomers = async (page) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        search: searchQuery || undefined,
      };

      if (viewMode === "segments" && segment === "no_visits") {
        params.includeAll = "true";
      }

      // Add appropriate filter based on view mode
      if (viewMode === "segments") {
        params.segment = segment;
      } else {
        params.lastVisitDays = JSON.stringify([segment]);
      }

      // Add outlet filter if specified
      if (outletId) {
        params.outletId = outletId;
      }

      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }

      const response = await api.get(`/api/visitAnalytics/customers/${storeId}`, {
        headers: { token },
        params,
      });

      if (response.data.success) {
        setCustomers(response.data.data || []);
        setPagination(response.data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50"
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4" style={{ zIndex: 9999 }}>
        <div 
          className={`relative w-full max-w-5xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`sticky top-0 z-10 p-4 sm:p-6 border-b ${
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                    isDarkMode
                      ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                      : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                  }`}
                  title="Go back"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  isDarkMode ? "bg-green-500/20" : "bg-[#e8f5e9]"
                }`}>
                  <Users className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    isDarkMode ? "text-green-400" : "text-[#388e3c]"
                  }`} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className={`text-base sm:text-xl font-semibold truncate ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                    {segmentLabel} Customers
                  </h2>
                  <p className={`text-xs sm:text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                    {pagination.total} total
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {pagination.total > 0 && onNotify && (
                  <>
                    {/* Mobile: Icon only */}
                    <button
                      onClick={() => onNotify({ segment, viewMode, total: pagination.total })}
                      className={`sm:hidden p-2 rounded-lg text-sm font-medium transition-colors ${
                        isDarkMode
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-[#4caf50] text-white hover:bg-[#388e3c]"
                      }`}
                      title={`Notify ${pagination.total} customers`}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    {/* Desktop: Full button */}
                    <button
                      onClick={() => onNotify({ segment, viewMode, total: pagination.total })}
                      className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isDarkMode
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-[#4caf50] text-white hover:bg-[#388e3c]"
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      Notify {pagination.total}
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "hover:bg-gray-700 text-gray-400"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`} />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500"
                } focus:outline-none focus:ring-2 focus:ring-green-500/20`}
              />
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-220px)] p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
              </div>
            ) : customers.length === 0 ? (
              <div className={`text-center py-12 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                No customers found
              </div>
            ) : (
              <>
                {/* Mobile/Tablet Accordion View */}
                <div className="lg:hidden space-y-3">
                  {customers.map((customer) => (
                    <div
                      key={customer._id}
                      className={`rounded-lg border transition-colors ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className={`font-semibold text-base ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}>
                              {customer.customerName}
                            </h3>
                            <div className={`text-sm mt-1 ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}>
                              {customer.customerPhone && <p>{customer.customerPhone}</p>}
                              {customer.customerEmail && (
                                <p className="truncate">{customer.customerEmail}</p>
                              )}
                            </div>
                          </div>
                          {shouldShowTier && (
                            <span className={`ml-2 inline-block px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm ${
                              customer.customerTier?.toLowerCase().includes("gold")
                                ? "bg-gradient-to-br from-amber-100 to-yellow-200 text-amber-800 border border-amber-300"
                                : customer.customerTier?.toLowerCase().includes("silver")
                                ? "bg-gradient-to-br from-gray-100 to-slate-200 text-slate-700 border border-slate-300"
                                : customer.customerTier?.toLowerCase().includes("bronze")
                                ? "bg-gradient-to-br from-orange-100 to-amber-200 text-orange-800 border border-orange-300"
                                : customer.customerTier?.toLowerCase().includes("platinum")
                                ? "bg-gradient-to-br from-indigo-100 to-purple-200 text-indigo-800 border border-indigo-300"
                                : isDarkMode
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}>
                              {customer.customerTier || "Basic"}
                            </span>
                          )}
                        </div>
                        
                        <div className={`grid grid-cols-2 gap-3 pt-3 border-t ${
                          isDarkMode ? "border-gray-600" : "border-gray-200"
                        }`}>
                          {viewMode === "segments" && segment === "5+_visits" && (
                            <div>
                              <p className={`text-xs ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}>
                                Visits
                              </p>
                              <p className={`text-sm font-semibold ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}>
                                {customer.visitCount}
                              </p>
                            </div>
                          )}
                          {viewMode === "lastVisit" && (
                            <div>
                              <p className={`text-xs ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}>
                                Days Ago
                              </p>
                              <p className={`text-sm font-semibold ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}>
                                {customer.lastVisit
                                  ? `${dayjs().diff(dayjs(customer.lastVisit), "day")}d`
                                  : "N/A"
                                }
                              </p>
                            </div>
                          )}
                          <div>
                            <p className={`text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}>
                              Points
                            </p>
                            <p className={`text-sm font-semibold ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}>
                              {customer.customerPoints || 0}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}>
                              Last Visit
                            </p>
                            <p className={`text-sm ${
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }`}>
                              {customer.lastVisit
                                ? dayjs(customer.lastVisit).format("MMM D, YYYY")
                                : "N/A"
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                  <thead>
                    <tr className={`border-b ${
                      isDarkMode ? "border-gray-700" : "border-gray-200"
                    }`}>
                      <th className={`text-left py-3 px-4 font-semibold text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Customer
                      </th>
                      <th className={`text-left py-3 px-4 font-semibold text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Contact
                      </th>
                      {shouldShowTier && (
                        <th className={`text-center py-3 px-4 font-semibold text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                          Tier
                        </th>
                      )}
                      {viewMode === "segments" && segment === "5+_visits" && (
                        <th className={`text-center py-3 px-4 font-semibold text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                          Visits
                        </th>
                      )}
                      {viewMode === "lastVisit" && (
                        <th className={`text-center py-3 px-4 font-semibold text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                          Days Ago
                        </th>
                      )}
                      <th className={`text-center py-3 px-4 font-semibold text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Points
                      </th>
                      <th className={`text-center py-3 px-4 font-semibold text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Last Visit
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr
                        key={customer._id}
                        className={`border-b transition-colors ${
                          isDarkMode
                            ? "border-gray-700 hover:bg-gray-700/50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <td className="py-3 px-4">
                          <p className={`font-medium ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}>
                            {customer.customerName}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {customer.customerEmail && (
                              <p className="truncate max-w-[200px]">{customer.customerEmail}</p>
                            )}
                            {customer.customerPhone && (
                              <p>{customer.customerPhone}</p>
                            )}
                          </div>
                        </td>
                        {shouldShowTier && (
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm ${
                              customer.customerTier?.toLowerCase().includes("gold")
                                ? "bg-gradient-to-br from-amber-100 to-yellow-200 text-amber-800 border border-amber-300"
                                : customer.customerTier?.toLowerCase().includes("silver")
                                ? "bg-gradient-to-br from-gray-100 to-slate-200 text-slate-700 border border-slate-300"
                                : customer.customerTier?.toLowerCase().includes("bronze")
                                ? "bg-gradient-to-br from-orange-100 to-amber-200 text-orange-800 border border-orange-300"
                                : customer.customerTier?.toLowerCase().includes("platinum")
                                ? "bg-gradient-to-br from-indigo-100 to-purple-200 text-indigo-800 border border-indigo-300"
                                : isDarkMode
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}>
                              {customer.customerTier || "Basic"}
                            </span>
                          </td>
                        )}
                        {viewMode === "segments" && segment === "5+_visits" && (
                          <td className="py-3 px-4 text-center">
                            <p className={`font-semibold ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}>
                              {customer.visitCount}
                            </p>
                          </td>
                        )}
                        {viewMode === "lastVisit" && (
                          <td className="py-3 px-4 text-center">
                            <p className={`font-semibold ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}>
                              {customer.lastVisit
                                ? `${dayjs().diff(dayjs(customer.lastVisit), "day")}d`
                                : "N/A"
                              }
                            </p>
                          </td>
                        )}
                        <td className="py-3 px-4 text-center">
                          <p className={`font-semibold ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}>
                            {customer.customerPoints || 0}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <p className={`text-sm ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}>
                            {customer.lastVisit
                              ? dayjs(customer.lastVisit).format("MMM D, YYYY")
                              : "N/A"
                            }
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </div>

          {/* Footer with Pagination */}
          {pagination.pages > 1 && (
            <div className={`sticky bottom-0 p-4 border-t ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}>
              <div className="flex items-center justify-between">
                <p className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  Page {pagination.page} of {pagination.pages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchCustomers(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      pagination.page === 1
                        ? isDarkMode
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : isDarkMode
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchCustomers(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      pagination.page === pagination.pages
                        ? isDarkMode
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : isDarkMode
                        ? isDarkMode ? "bg-green-600 text-white hover:bg-green-700" : "bg-[#4caf50] text-white hover:bg-[#388e3c]"
                        : isDarkMode ? "bg-green-600 text-white hover:bg-green-700" : "bg-[#4caf50] text-white hover:bg-[#388e3c]"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
