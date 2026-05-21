import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import api from "../../api/config";
import { Search, Users as UsersIcon, Check } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import FilterTabs from "./FilterTabs";
import SegmentChips from "./SegmentChips";
import LastVisitChips from "./LastVisitChips";
import SelectedFilters from "./SelectedFilters";
import CustomerTable from "./CustomerTable";

dayjs.extend(relativeTime);

export default function CustomerSelector({
  storeId,
  token,
  segments = [],
  specialCounts = {},
  selectedSegments = [],
  selectedCustomers = [],
  onSegmentToggle,
  onCustomerToggle,
  onSelectAllInSegment,
  onClearSelection,
  recipientCount = 0,
  totalAllCustomers = 0,
}) {
  const { isDarkMode } = useTheme();

  // Customer list state
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSegment, setFilterSegment] = useState("");
  const [lastVisitFilters, setLastVisitFilters] = useState([]);
  const [filterType, setFilterType] = useState("segment");
  const [isLoading, setIsLoading] = useState(false);
  const [lastVisitDistribution, setLastVisitDistribution] = useState([]);
  const [isSelectingAll, setIsSelectingAll] = useState(false);
  const [isLastVisitSelectAllExplicit, setIsLastVisitSelectAllExplicit] = useState(false);
  const selectedCustomersRef = useRef(selectedCustomers);

  const primarySegments = segments.map((s) => ({ name: s.name, count: s.count }));

  const specialSegments = [{ name: "at_risk", count: specialCounts.at_risk || 0 }];
  const allSegments = [...primarySegments, ...specialSegments];

  // Helper function for last visit filtering
  const matchesLastVisitFilter = (customer, filter) => {
    const now = dayjs();
    
    if (!customer.lastVisit) {
      // If no last visit, consider them as 120+ days
      return filter === "120+";
    }
    
    const lastVisit = dayjs(customer.lastVisit);
    const daysSinceVisit = now.diff(lastVisit, 'day');
    
    // Match SegmentDonut.jsx logic
    if (filter === "7") {
      return daysSinceVisit <= 7;
    } else if (filter === "30") {
      return daysSinceVisit > 7 && daysSinceVisit <= 30;
    } else if (filter === "60") {
      return daysSinceVisit > 30 && daysSinceVisit <= 60;
    } else if (filter === "90") {
      return daysSinceVisit > 60 && daysSinceVisit <= 90;
    } else if (filter === "120+") {
      return daysSinceVisit > 90;
    }
    
    return false;
  };

  const fetchLastVisitDistribution = useCallback(async () => {
    if (!storeId) return;

    try {
      const response = await api.get(
        `/api/visitAnalytics/lastVisitDistribution/${storeId}`,
        { headers: { token } }
      );

      if (response.data.success) {
        setLastVisitDistribution(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch last visit distribution:", error);
    }
  }, [storeId, token]);

  const fetchCustomers = useCallback(async (page) => {
    if (!storeId) return;
    setIsLoading(true);

    try {
      const params = {
        search: searchQuery || undefined,
        page,
        limit: pagination.limit,
        includeAll: 'true', // Include all customers, not just those with analytics
      };

      // Handle segment filtering
      if (selectedSegments.length > 0) {
        // For multiple segments, we'll need to filter on the frontend since the API doesn't support multiple segments
        params.segment = selectedSegments[0]; // Use first segment for now
      } else if (filterSegment) {
        params.segment = filterSegment;
      }

      // Handle last visit filtering
      if (lastVisitFilters.length > 0) {
        params.lastVisitDays = JSON.stringify(lastVisitFilters);
      }

      const response = await api.get(`/api/visitAnalytics/customers/${storeId}`, {
        headers: { token },
        params,
      });

      if (response.data.success) {
        setCustomers(response.data.data || []);
        setPagination(response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setIsLoading(false);
    }
  }, [storeId, searchQuery, pagination.limit, selectedSegments, filterSegment, lastVisitFilters, token]);

  useEffect(() => {
    selectedCustomersRef.current = selectedCustomers;
  }, [selectedCustomers]);

  // Initial load
  useEffect(() => {
    if (storeId) {
      fetchCustomers(1);
      fetchLastVisitDistribution();
    }
  }, [storeId, fetchCustomers, fetchLastVisitDistribution]);

  // Fetch when filters change
  useEffect(() => {
    if (storeId && (filterSegment || lastVisitFilters.length > 0 || selectedSegments.length > 0)) {
      fetchCustomers(1);
    }
  }, [filterSegment, lastVisitFilters, selectedSegments, storeId, fetchCustomers]);

  // Auto-select customers when segment filters change
  useEffect(() => {
    if (filterType !== "segment" || selectedSegments.length === 0 || !storeId) return;

    let isActive = true;

    const fetchAndSelectAllBySegment = async () => {
      try {
        const uniqueCustomers = new Map();

        for (const segment of selectedSegments) {
          let currentPage = 1;
          let hasMore = true;

          while (hasMore) {
            const response = await api.get(`/api/visitAnalytics/customers/${storeId}`, {
              headers: { token },
              params: {
                page: currentPage,
                limit: 100,
                includeAll: "true",
                segment,
              },
            });

            if (!isActive) return;

            if (response.data.success) {
              const fetchedCustomers = response.data.data || [];
              fetchedCustomers.forEach((c) => {
                const customerId = String(c.customer);
                if (!uniqueCustomers.has(customerId)) {
                  uniqueCustomers.set(customerId, {
                    customer: c.customer,
                    customerName: c.customerName,
                    customerPhone: c.customerPhone,
                    customerEmail: c.customerEmail,
                  });
                }
              });

              const pag = response.data.pagination;
              hasMore = Boolean(pag && currentPage < pag.pages);
              currentPage += 1;
            } else {
              hasMore = false;
            }
          }
        }

        const targetIds = new Set(uniqueCustomers.keys());
        const selectedMap = new Map(selectedCustomersRef.current.map((sc) => [String(sc.customer), sc]));

        // Remove customers that are no longer part of selected segment filters
        selectedMap.forEach((selectedCustomer, selectedId) => {
          if (!targetIds.has(selectedId)) {
            onCustomerToggle(selectedCustomer);
          }
        });

        // Add missing customers from selected segment filters
        uniqueCustomers.forEach((customerData, customerId) => {
          if (!selectedMap.has(customerId)) {
            onCustomerToggle(customerData);
          }
        });
      } catch (error) {
        console.error("❌ Failed to fetch segment customers:", error);
      }
    };

    fetchAndSelectAllBySegment();

    return () => {
      isActive = false;
    };
  }, [selectedSegments, storeId, token, filterType, onCustomerToggle]);

  // Auto-select customers when last visit filters change
  useEffect(() => {
    if (lastVisitFilters.length > 0 && storeId) {
      const fetchAndSelectAll = async () => {
        try {
          let allCustomers = [];
          let currentPage = 1;
          let hasMore = true;
          
          while (hasMore) {
            const response = await api.get(`/api/visitAnalytics/customers/${storeId}`, {
              headers: { token },
              params: { 
                page: currentPage, 
                limit: 100, 
                includeAll: 'true',
                lastVisitDays: JSON.stringify(lastVisitFilters)
              },
            });
            
            if (response.data.success) {
              const fetchedCustomers = response.data.data || [];
              allCustomers = [...allCustomers, ...fetchedCustomers];
              
              const pag = response.data.pagination;
              hasMore = pag && currentPage < pag.pages;
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
          console.error("❌ Failed to fetch filtered customers:", error);
        }
      };
      
      fetchAndSelectAll();
    }
  }, [lastVisitFilters, storeId, token]);

  // Search debounce
  useEffect(() => {
    if (!storeId) return;
    
    const timer = setTimeout(() => {
      fetchCustomers(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, storeId, fetchCustomers]);

  useEffect(() => {
    if (selectedCustomers.length === 0) {
      setIsLastVisitSelectAllExplicit(false);
    }
  }, [selectedCustomers.length]);

  // Compute matching customers based on active filters
  const matchingCustomers = useMemo(() => {
    if (filterType === "segment" && selectedSegments.length > 0) {
      return customers.filter(c => selectedSegments.includes(c.segment));
    } else if (filterType === "lastVisit" && lastVisitFilters.length > 0) {
      return customers.filter(c => 
        lastVisitFilters.some(filter => matchesLastVisitFilter(c, filter))
      );
    }
    return [];
  }, [customers, selectedSegments, lastVisitFilters, filterType]);

  return (
    <div className="space-y-6">
      
      {/* Filter Type Toggle */}
      <FilterTabs 
        filterType={filterType} 
        onFilterTypeChange={(type) => {
          setFilterType(type);
          setIsLastVisitSelectAllExplicit(false);
          if (type === "segment") {
            setLastVisitFilters([]);
          } else {
            selectedSegments.forEach(seg => onSegmentToggle(seg));
          }
        }}
      />
 
      {/* Segment chips */}
      {filterType === "segment" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">


 

            <h3 className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Select by Segment
            </h3>

            
          </div>
          <div className="flex flex-wrap gap-2">
            {/* All Store Customers chip - selects ALL registered customers including unvisited */}
            <button
              onClick={async () => {
                setIsSelectingAll(true);
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
                      const fetched = response.data.data || [];
                      allCustomers = [...allCustomers, ...fetched];
                      const pag = response.data.pagination;
                      hasMore = pag && currentPage < pag.pages;
                      currentPage++;
                    } else {
                      hasMore = false;
                    }
                  }

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
                  console.error("Failed to fetch all store customers:", error);
                } finally {
                  setIsSelectingAll(false);
                }
              }}
              disabled={isSelectingAll || totalAllCustomers === 0}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isSelectingAll
                  ? isDarkMode
                    ? "bg-gray-700 text-gray-400 border-gray-600"
                    : "bg-gray-100 text-gray-500 border-gray-300"
                  : totalAllCustomers > 0 && selectedCustomers.length >= totalAllCustomers
                  ? "bg-green-500 text-white border-green-500"
                  : isDarkMode
                  ? "bg-gray-800 text-green-400 border-green-700/50 hover:bg-gray-700"
                  : "bg-white text-green-600 border-green-300 hover:bg-green-50"
              }`}
            >
              {isSelectingAll ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span className="font-medium">Selecting...</span>
                </>
              ) : (
                <>
                  {totalAllCustomers > 0 && selectedCustomers.length >= totalAllCustomers && (
                    <Check className="w-4 h-4" />
                  )}
                  <UsersIcon className="w-4 h-4" />
                  <span className="font-medium">All Store Customers</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    totalAllCustomers > 0 && selectedCustomers.length >= totalAllCustomers
                      ? "bg-white/20"
                      : isDarkMode
                      ? "bg-white/10"
                      : "bg-black/10"
                  }`}>
                    {totalAllCustomers}
                  </span>
                </>
              )}
            </button>
          <SegmentChips
            segments={primarySegments}
            selectedSegments={selectedSegments}
            onSegmentToggle={onSegmentToggle}
          />
          {specialSegments[0].count > 0 && (
            <div className="w-full mt-1">
              <p className={`text-xs mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Special segment (overlaps with primary segments)
              </p>
              <SegmentChips
                segments={specialSegments}
                selectedSegments={selectedSegments}
                onSegmentToggle={onSegmentToggle}
              />
            </div>
          )}
          </div>
        </div>
      )}

      {/* Last Visit chips */}
      {filterType === "lastVisit" && (
        <LastVisitChips 
          lastVisitFilters={lastVisitFilters}
          lastVisitDistribution={lastVisitDistribution}
          onToggle={(value) => {
            setIsLastVisitSelectAllExplicit(false);
            if (lastVisitFilters.includes(value)) {
              setLastVisitFilters(prev => prev.filter(f => f !== value));
            } else {
              setLastVisitFilters(prev => [...prev, value]);
            }
          }}
          onClear={() => {
            setIsLastVisitSelectAllExplicit(false);
            setLastVisitFilters([]);
          }}
          storeId={storeId}
          token={token}
          pagination={pagination}
          selectedCustomers={selectedCustomers}
          onCustomerToggle={onCustomerToggle}
          isSelectingAll={isSelectingAll}
          setIsSelectingAll={setIsSelectingAll}
          isLastVisitSelectAllExplicit={isLastVisitSelectAllExplicit}
          setIsLastVisitSelectAllExplicit={setIsLastVisitSelectAllExplicit}
        />
      )}

      {/* Selected Filters Display */}
      <SelectedFilters 
        selectedSegments={selectedSegments}
        lastVisitFilters={lastVisitFilters}
        allSegments={allSegments}
        onRemoveSegment={onSegmentToggle}
        onRemoveLastVisit={(value) => setLastVisitFilters(prev => prev.filter(f => f !== value))}
      />

      {/* Divider */}
      <div className="relative">
        <div className={`absolute inset-0 flex items-center ${isDarkMode ? "bg-gray-900" : ""}`}>
          <div className={`w-full border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`} />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className={`px-3 ${isDarkMode ? "bg-gray-900 text-gray-400" : "bg-white text-gray-500"}`}>
            or select individual customers
          </span>
        </div>
      </div>
        {/* Recipient Count Footer */}
      {recipientCount > 0 && (
        <div
          className={`flex items-center justify-between p-4 rounded-lg ${
            isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-200"
          }`}
        >
          <div className="flex items-center gap-4">
            <UsersIcon className="w-5 h-5 text-[#4caf50]" />
            <span className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {recipientCount} recipient{recipientCount !== 1 ? "s" : ""} selected
            </span>
            {selectedSegments.length > 0 && (
              <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                ({selectedSegments.length} segment{selectedSegments.length !== 1 ? "s" : ""})
              </span>
            )}
            
          </div>
          <button
            onClick={onClearSelection}
            className={`text-sm transition-colors ${
              isDarkMode ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-800"
            }`}
          >
            Clear All
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative flex-1">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
          isDarkMode ? "text-gray-400" : "text-gray-500"
        }`} />
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#4caf50] ${
            isDarkMode
              ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
          }`}
        />
      </div>

      {/* Customer Table */}
      <CustomerTable
        customers={customers}
        selectedCustomers={selectedCustomers}
        matchingCustomers={matchingCustomers}
        isLoading={isLoading}
        onCustomerToggle={onCustomerToggle}
        pagination={pagination}
        onPageChange={fetchCustomers}
        totalAllCustomers={totalAllCustomers}
      />

    
    </div>
  );
}
