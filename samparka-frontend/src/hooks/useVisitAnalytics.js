import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import api from "../api/config";
import dayjs from "dayjs";

export default function useVisitAnalytics() {
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;

  const [selected, setSelected] = useState(localStorage.getItem("selectedValue") || "");
  const [stores, setStores] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [segments, setSegments] = useState([]);
  const [lastVisitDistribution, setLastVisitDistribution] = useState([]);
  const [trends, setTrends] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [selectedSegment, setSelectedSegment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLastVisitFilters, setSelectedLastVisitFilters] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);

  // L5-specific state
  const [selectedOutletView, setSelectedOutletView] = useState("all");
  const [outletAnalytics, setOutletAnalytics] = useState({});
  const [isLoadingOutlets, setIsLoadingOutlets] = useState(false);
  const [outletPointsFilter, setOutletPointsFilter] = useState("today");

  // Segment modal state
  const [segmentModalOpen, setSegmentModalOpen] = useState(false);
  const [segmentModalData, setSegmentModalData] = useState({ segment: null, viewMode: "segments" });

  // Quick compose modal state
  const [composeModalOpen, setComposeModalOpen] = useState(false);
  const [composeModalData, setComposeModalData] = useState({ segment: null, viewMode: "segments", total: 0 });

  // Date filters
  const [startDate, setStartDate] = useState(dayjs().subtract(30, "day").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [currentFilter, setCurrentFilter] = useState("Last Month");

  // Derived
  const selectedStore = useMemo(() => stores.find((s) => s._id === selected), [stores, selected]);
  const isL5Format = selectedStore?.loyaltyCard?.format === "L5";
  const storeOutlets = selectedStore?.outlets || [];
  const isMultiOutlet = !isL5Format && selectedStore?.services?.multipleOutlets === true && storeOutlets.length > 0;
  const displaySegments = useMemo(() => {
    if ((isL5Format || isMultiOutlet) && selectedOutletView !== "all" && outletAnalytics[selectedOutletView])
      return outletAnalytics[selectedOutletView].segments || [];
    return segments;
  }, [isL5Format, isMultiOutlet, selectedOutletView, outletAnalytics, segments]);

  const displayTrends = useMemo(() => {
    if ((isL5Format || isMultiOutlet) && selectedOutletView !== "all" && outletAnalytics[selectedOutletView])
      return outletAnalytics[selectedOutletView].trends || [];

    if ((isL5Format || isMultiOutlet) && selectedOutletView === "all" && Object.keys(outletAnalytics).length > 0) {
      const aggregated = {};
      Object.values(outletAnalytics).forEach((outlet) => {
        (outlet.trends || []).forEach((trend) => {
          const key = dayjs(trend.date).format("YYYY-MM-DD");
          if (!aggregated[key]) aggregated[key] = { date: trend.date, visitCount: 0, totalPoints: 0 };
          aggregated[key].visitCount += trend.visitCount || 0;
          aggregated[key].totalPoints += trend.totalPoints || 0;
        });
      });
      return Object.values(aggregated).sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
    }

    return trends;
  }, [isL5Format, isMultiOutlet, selectedOutletView, outletAnalytics, trends]);

  const displayLastVisitDistribution = useMemo(() => {
    if ((isL5Format || isMultiOutlet) && selectedOutletView !== "all" && outletAnalytics[selectedOutletView])
      return outletAnalytics[selectedOutletView].lastVisitDistribution || [];
    return lastVisitDistribution;
  }, [isL5Format, isMultiOutlet, selectedOutletView, outletAnalytics, lastVisitDistribution]);

  const displaySummary = useMemo(() => {
    if ((isL5Format || isMultiOutlet) && selectedOutletView !== "all" && outletAnalytics[selectedOutletView])
      return outletAnalytics[selectedOutletView].summary;
    return summary;
  }, [isL5Format, isMultiOutlet, selectedOutletView, outletAnalytics, summary]);

  const chartData = useMemo(
    () => displayTrends.map((item) => ({ date: dayjs(item.date).format("DD MMM"), value: item.visitCount || 0 })),
    [displayTrends]
  );

  const totalCustomersChartData = useMemo(() => {
    if (!displayTrends?.length) return [];
    const total = summary?.totalRegisteredCustomers || 0;
    return displayTrends.map((item, idx) => ({
      date: dayjs(item.date).format("DD MMM"),
      value: Math.round(total * ((idx + 1) / displayTrends.length)),
    }));
  }, [displayTrends, summary]);

  const customersVisitedChartData = useMemo(() => {
    if (!displayTrends?.length) return [];
    const avgVisits = displaySummary?.avgVisitsPerCustomer || 1;
    return displayTrends.map((item) => ({
      date: dayjs(item.date).format("DD MMM"),
      value: Math.round((item.visitCount || 0) / Math.max(avgVisits, 1)),
    }));
  }, [displayTrends, displaySummary]);

  // API calls
  const fetchStores = async () => {
    try {
      const res = user.role === "admin"
        ? await api.get("/store", { headers: { token } })
        : await api.get("/store/myStores", { headers: { token } });
      if (res.data.success) setStores(res.data.stores);
    } catch {
      toast.error("Failed to fetch stores");
    }
  };

  const fetchAnalytics = async () => {
    if (!selected) return;
    setIsLoading(true);
    try {
      const params = { startDate, endDate };
      const headers = { token };
      const [summaryRes, segmentsRes, lastVisitDistRes, trendsRes] = await Promise.all([
        api.get(`/api/visitAnalytics/summary/${selected}`, { headers, params }),
        api.get(`/api/visitAnalytics/segments/${selected}`, { headers, params }),
        api.get(`/api/visitAnalytics/lastVisitDistribution/${selected}`, { headers, params }),
        api.get(`/api/visitAnalytics/trends/${selected}`, { headers, params }),
      ]);
      if (summaryRes.data.success) setSummary(summaryRes.data.data);
      if (segmentsRes.data.success) setSegments(segmentsRes.data.data.segments);
      if (lastVisitDistRes.data.success) setLastVisitDistribution(lastVisitDistRes.data.data);
      if (trendsRes.data.success) setTrends(trendsRes.data.data);
    } catch {
      toast.error("Failed to fetch analytics");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async (page = 1) => {
    if (!selected) return;
    try {
      const res = await api.get(`/api/visitAnalytics/customers/${selected}`, {
        headers: { token },
        params: {
          segment: selectedSegment || undefined,
          search: searchQuery || undefined,
          lastVisitDays: selectedLastVisitFilters.length > 0 ? JSON.stringify(selectedLastVisitFilters) : undefined,
          page,
          limit: pagination.limit,
        },
      });
      if (res.data.success) {
        setCustomers(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      }
    } catch {
      toast.error("Failed to fetch customers");
    }
  };

  const fetchCustomerDetails = async (customerId) => {
    try {
      const res = await api.get(`/api/visitAnalytics/customer/${customerId}`, { headers: { token } });
      if (res.data.success) setCustomerDetails(res.data.data);
    } catch {
      toast.error("Failed to fetch customer details");
    }
  };

  const fetchOutletAnalytics = async () => {
    if (!selected || (!isL5Format && !isMultiOutlet) || !storeOutlets.length) return;
    setIsLoadingOutlets(true);
    try {
      const today = dayjs();
      const weekStart = today.subtract(7, "days").startOf("day");
      const monthStart = today.subtract(30, "days").startOf("day");
      const outletData = {};

      const batchSize = 4;
      const outletBatches = [];
      for (let i = 0; i < storeOutlets.length; i += batchSize) {
        outletBatches.push(storeOutlets.slice(i, i + batchSize));
      }

      for (const batch of outletBatches) {
        await Promise.all(
          batch.map(async (outlet) => {
            try {
              const [summaryRes, trendsAllRes, segmentsRes, lastVisitRes] = await Promise.all([
                api.get(`/api/visitAnalytics/summary/${selected}`, {
                  headers: { token },
                  params: { startDate, endDate, outletId: outlet._id },
                }),
                api.get(`/api/visitAnalytics/trends/${selected}`, {
                  headers: { token },
                  params: { period: "10000", outletId: outlet._id },
                }),
                api.get(`/api/visitAnalytics/segments/${selected}`, {
                  headers: { token },
                  params: { outletId: outlet._id, startDate, endDate },
                }),
                api.get(`/api/visitAnalytics/lastVisitDistribution/${selected}`, {
                  headers: { token },
                  params: { outletId: outlet._id, startDate, endDate },
                }),
              ]);

              const allTrends = trendsAllRes.data.success ? trendsAllRes.data.data : [];
              const sum = (filter) => allTrends.filter(filter).reduce((s, t) => s + (t.totalPoints || 0), 0);

              outletData[outlet._id] = {
                summary: summaryRes.data.success ? summaryRes.data.data : null,
                trends: allTrends.filter((t) => {
                  const d = dayjs(t.date);
                  return !d.isBefore(dayjs(startDate), "day") && !d.isAfter(dayjs(endDate), "day");
                }),
                segments: segmentsRes.data.success ? segmentsRes.data.data.segments : [],
                lastVisitDistribution: lastVisitRes.data.success ? lastVisitRes.data.data : [],
                pointsToday: sum((t) => dayjs(t.date).isSame(today, "day")),
                pointsYesterday: sum((t) => dayjs(t.date).isSame(today.subtract(1, "day"), "day")),
                pointsWeek: sum((t) => !dayjs(t.date).isBefore(weekStart, "day") && !dayjs(t.date).isAfter(today, "day")),
                pointsMonth: sum((t) => !dayjs(t.date).isBefore(monthStart, "day") && !dayjs(t.date).isAfter(today, "day")),
                pointsAllTime: allTrends.reduce((s, t) => s + (t.totalPoints || 0), 0),
                outlet,
              };
            } catch (error) {
              console.error(`❌ Failed to fetch analytics for outlet ${outlet._id}:`, error);
              outletData[outlet._id] = {
                summary: null, trends: [], segments: [], lastVisitDistribution: [],
                pointsToday: 0, pointsYesterday: 0, pointsWeek: 0, pointsMonth: 0, pointsAllTime: 0, outlet,
              };
            }
          })
        );
      }

      setOutletAnalytics(outletData);
    } catch (error) {
      console.error("❌ Failed to fetch outlet analytics:", error);
      toast.error("Failed to fetch outlet analytics");
    } finally {
      setIsLoadingOutlets(false);
    }
  };

  // Handlers
  const handleFilterChange = (filterType) => {
    const today = dayjs().format("YYYY-MM-DD");
    if (filterType === "thisweek") {
      setStartDate(dayjs().subtract(7, "days").format("YYYY-MM-DD"));
      setEndDate(today);
      setCurrentFilter("This Week");
    } else if (filterType === "lastMonth") {
      setStartDate(dayjs().subtract(30, "days").format("YYYY-MM-DD"));
      setEndDate(today);
      setCurrentFilter("Last Month");
    } else if (filterType === "allTime") {
      const store = stores.find((s) => s._id === selected);
      if (store) setStartDate(dayjs(store.createdAt).format("YYYY-MM-DD"));
      setEndDate(today);
      setCurrentFilter("All Time");
    } else if (filterType === "custom") {
      const from = dayjs(startDate);
      const to = dayjs(endDate);
      setCurrentFilter(`Custom: ${from.format("DD MMM YYYY")} - ${to.format("DD MMM YYYY")}`);
    }
  };

  const handleCustomRangeChange = (fromDate, toDate) => {
    if (!fromDate || !toDate) return;

    const from = dayjs(fromDate).startOf("day");
    const to = dayjs(toDate).endOf("day");

    if (from.isAfter(to)) return;

    setStartDate(from.format("YYYY-MM-DD"));
    setEndDate(to.format("YYYY-MM-DD"));
    setCurrentFilter(`Custom: ${from.format("DD MMM YYYY")} - ${to.format("DD MMM YYYY")}`);
  };

  const handleSegmentDoubleClick = (segment, viewMode) => {
    setSegmentModalData({
      segment,
      viewMode,
      outletId: (isL5Format || isMultiOutlet) && selectedOutletView !== "all" ? selectedOutletView : null,
    });
    setSegmentModalOpen(true);
  };

  const handleNotify = ({ segment, viewMode, total }) => {
    setSegmentModalOpen(false);
    setComposeModalData({ segment, viewMode, total });
    setComposeModalOpen(true);
  };

  const handleCloseCustomer = () => {
    setSelectedCustomer(null);
    setCustomerDetails(null);
  };

  // Effects
  useEffect(() => { fetchStores(); }, [token]);
  useEffect(() => { localStorage.setItem("selectedValue", selected); }, [selected]);

  useEffect(() => {
    if (!selected) return;

    const store = stores.find((s) => s._id === selected);
    if (!store) return;

    const storeIsL5 = store?.loyaltyCard?.format === "L5";
    const storeIsMultiOutlet = !storeIsL5 && store?.services?.multipleOutlets === true && (store?.outlets?.length > 0);

    if (storeIsL5 || storeIsMultiOutlet) {
      const allTimeStart = dayjs(store.createdAt).format("YYYY-MM-DD");
      const allTimeEnd = dayjs().format("YYYY-MM-DD");

      // If dates aren't already at all-time for this store, reset and re-run.
      if (startDate !== allTimeStart || endDate !== allTimeEnd) {
        setStartDate(allTimeStart);
        setEndDate(allTimeEnd);
        setCurrentFilter("All Time");
        return;
      }
    }

    fetchAnalytics();
    if (storeIsL5 || storeIsMultiOutlet) fetchOutletAnalytics();
  }, [selected, startDate, endDate, stores]);

  useEffect(() => { if (selected) fetchCustomers(1); }, [selected, selectedSegment, searchQuery, selectedLastVisitFilters]);
  useEffect(() => { if (selectedCustomer) fetchCustomerDetails(selectedCustomer); }, [selectedCustomer]);

  return {
    // State
    selected, setSelected,
    stores,
    activeTab, setActiveTab,
    isLoading,
    summary,
    customers, pagination,
    selectedSegment, setSelectedSegment,
    searchQuery, setSearchQuery,
    selectedLastVisitFilters, setSelectedLastVisitFilters,
    selectedCustomer, setSelectedCustomer,
    customerDetails,
    segmentModalOpen, setSegmentModalOpen,
    segmentModalData,
    composeModalOpen, setComposeModalOpen,
    composeModalData,
    selectedOutletView, setSelectedOutletView,
    outletAnalytics,
    isLoadingOutlets,
    outletPointsFilter, setOutletPointsFilter,
    currentFilter,
    startDate,
    endDate,
    isL5Format,
    isMultiOutlet,
    storeOutlets,
    // Derived / display
    displaySegments,
    displayTrends,
    displayLastVisitDistribution,
    displaySummary,
    chartData,
    totalCustomersChartData,
    customersVisitedChartData,
    // Handlers
    handleFilterChange,
    handleCustomRangeChange,
    handleSegmentDoubleClick,
    handleNotify,
    handleCloseCustomer,
    fetchCustomers,
  };
}
