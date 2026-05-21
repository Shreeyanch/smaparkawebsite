import { Search, Eye, ChevronDown, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useState, useRef, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const SEGMENT_COLORS = {
  first_visit: "bg-blue-100 text-blue-700",
  "2-3_visits": "bg-green-100 text-green-700",
  "4-10_visits": "bg-purple-100 text-purple-700",
  "10+_visits": "bg-orange-100 text-orange-700",
};

const SEGMENT_COLORS_DARK = {
  first_visit: "bg-blue-900/30 text-blue-400",
  "2-3_visits": "bg-green-900/30 text-green-400",
  "4-10_visits": "bg-purple-900/30 text-purple-400",
  "10+_visits": "bg-orange-900/30 text-orange-400",
};

const SEGMENT_LABELS = {
  first_visit: "1st",
  "2-3_visits": "2-3",
  "4-10_visits": "4-10",
  "10+_visits": "10+",
};

const LAST_VISIT_OPTIONS = [
  { value: "7", label: "< 1 week", color: "bg-green-500" },
  { value: "7+", label: "1 week+", color: "bg-blue-500" },
  { value: "30+", label: "1 month+", color: "bg-yellow-500" },
  { value: "90+", label: "3 months+", color: "bg-orange-500" },
  { value: "180+", label: "6 months+", color: "bg-red-500" },
];

// Helper function to get color class for days since last visit
const getLastVisitColor = (days, isDarkMode) => {
  if (days === null || days === undefined) return "";
  if (days < 7) return isDarkMode ? "text-green-400" : "text-green-600";
  if (days < 30) return isDarkMode ? "text-blue-400" : "text-blue-600";
  if (days < 90) return isDarkMode ? "text-yellow-400" : "text-yellow-600";
  if (days < 180) return isDarkMode ? "text-orange-400" : "text-orange-600";
  return isDarkMode ? "text-red-400" : "text-red-600";
};

export default function CustomerVisitTable({
  customers = [],
  pagination = { page: 1, limit: 10, total: 0, pages: 0 },
  selectedSegment,
  searchQuery,
  selectedLastVisitFilters = [],
  onSegmentChange,
  onSearchChange,
  onLastVisitFilterChange,
  onPageChange,
  onCustomerClick,
  segments = [],
}) {
  const { isDarkMode } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLastVisitFilter = (value) => {
    if (selectedLastVisitFilters.includes(value)) {
      onLastVisitFilterChange(selectedLastVisitFilters.filter((v) => v !== value));
    } else {
      onLastVisitFilterChange([...selectedLastVisitFilters, value]);
    }
  };

  const clearAllFilters = () => {
    onSegmentChange("");
    onLastVisitFilterChange([]);
    onSearchChange("");
  };

  const activeFiltersCount = 
    (selectedSegment ? 1 : 0) + 
    selectedLastVisitFilters.length + 
    (searchQuery ? 1 : 0);

  return (
    <div className={`rounded-lg border ${isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
      {/* Filters */}
      <div className="p-4 border-b space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`} />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>
          
          <select
            value={selectedSegment}
            onChange={(e) => onSegmentChange(e.target.value)}
            className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-purple-500 ${
              isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"
            }`}
          >
            <option value="">All Segments</option>
            {segments.map((seg) => (
              <option key={seg.name} value={seg.name}>
                {SEGMENT_LABELS[seg.name] || seg.name} ({seg.count})
              </option>
            ))}
          </select>

          {/* Last Visit Multi-Select Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-purple-500 min-w-[180px] justify-between ${
                isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"
              } ${selectedLastVisitFilters.length > 0 ? "ring-1 ring-purple-500" : ""}`}
            >
              <span className="flex items-center gap-2">
                Last Visit
                {selectedLastVisitFilters.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500 text-white">
                    {selectedLastVisitFilters.length}
                  </span>
                )}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
              <div className={`absolute z-10 mt-2 w-full rounded-lg border shadow-lg ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}>
                <div className="p-2 space-y-1">
                  {LAST_VISIT_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                        isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedLastVisitFilters.includes(option.value)}
                        onChange={() => toggleLastVisitFilter(option.value)}
                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`w-2 h-2 rounded-full ${option.color}`} />
                        <span className={isDarkMode ? "text-gray-200" : "text-gray-700"}>
                          {option.label}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Active filters:
            </span>
            {selectedSegment && (
              <span className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                isDarkMode ? "bg-purple-900/30 text-purple-400" : "bg-purple-100 text-purple-700"
              }`}>
                Segment: {SEGMENT_LABELS[selectedSegment] || selectedSegment}
                <button onClick={() => onSegmentChange("")} className="hover:opacity-70">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedLastVisitFilters.map((filter) => {
              const option = LAST_VISIT_OPTIONS.find((o) => o.value === filter);
              return (
                <span
                  key={filter}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                    isDarkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700"
                  }`}
                >
                  Last Visit: {option?.label}
                  <button onClick={() => toggleLastVisitFilter(filter)} className="hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
            {searchQuery && (
              <span className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
              }`}>
                Search: "{searchQuery}"
                <button onClick={() => onSearchChange("")} className="hover:opacity-70">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className={`text-xs font-medium underline ${
                isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={isDarkMode ? "bg-gray-800" : "bg-gray-50"}>
            <tr>
              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>Customer</th>
              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>Phone</th>
              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>Segment</th>
              <th className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>Visits</th>
              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>Last Visit</th>
              <th className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>Action</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}>
            {customers.length > 0 ? (
              customers.map((c) => (
                <tr key={c._id} className={isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"}>
                  <td className="px-4 py-3">
                    <div>
                      <p className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {c.customerName}
                      </p>
                      <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {c.customerEmail}
                      </p>
                    </div>
                  </td>
                  <td className={`px-4 py-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {c.customerPhone}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isDarkMode ? SEGMENT_COLORS_DARK[c.segment] : SEGMENT_COLORS[c.segment]
                    }`}>
                      {SEGMENT_LABELS[c.segment] || c.segment}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-center font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                    {c.visitCount}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className={`font-medium ${getLastVisitColor(c.daysSinceLastVisit, isDarkMode)}`}>
                        {c.lastVisit ? dayjs(c.lastVisit).fromNow() : "-"}
                      </span>
                      {/* {c.daysSinceLastVisit !== null && c.daysSinceLastVisit !== undefined && (
                        <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                          {c.daysSinceLastVisit} days ago
                        </span>
                      )} */}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onCustomerClick(c.customer)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                          : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className={`px-4 py-8 text-center ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-t ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}>
          <div className={`text-sm mb-3 sm:mb-0 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} customers
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`px-3 py-2 text-sm font-medium rounded-l-md disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode
                  ? "text-gray-300 bg-gray-900 border border-gray-600 hover:bg-gray-600"
                  : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNumber;
                if (pagination.pages <= 5) {
                  pageNumber = i + 1;
                } else if (pagination.page <= 3) {
                  pageNumber = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNumber = pagination.pages - 4 + i;
                } else {
                  pageNumber = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      pagination.page === pageNumber
                        ? "bg-green-600 text-white shadow-sm"
                        : isDarkMode
                        ? "text-gray-300 bg-gray-900 border border-gray-600 hover:bg-gray-600"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className={`px-3 py-2 text-sm font-medium rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode
                  ? "text-gray-300 bg-gray-900 border border-gray-600 hover:bg-gray-600"
                  : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
