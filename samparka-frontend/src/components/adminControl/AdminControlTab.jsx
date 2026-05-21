import { useState, useMemo, useEffect } from "react";
import {
  Shield,
  Mail,
  Calendar,
  Play,
  BarChart2,
  Clock,
  Users,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Edit2,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/config";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import EventCalendarPanel from "./EventCalendarPanel";

/* ─── Store-selection modal ─────────────────────────────────────────────────── */
const TriggerReportModal = ({ stores, isDarkMode, onClose, onConfirm, sending }) => {
  const activeStores = stores.filter((s) => s.status === "active");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set(activeStores.map((s) => s._id)));
  const [notificationType, setNotificationType] = useState("report"); // "report" or "expiry"

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? activeStores.filter((s) => s.name.toLowerCase().includes(q)) : activeStores;
  }, [search, activeStores]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selected.has(s._id));

  const toggleStore = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allFilteredSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((s) => next.delete(s._id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((s) => next.add(s._id));
        return next;
      });
    }
  };

  const overlay = "fixed inset-0 z-50 flex items-center justify-center p-4";
  const backdrop = "absolute inset-0 bg-black/50 backdrop-blur-sm";
  const modalCls = `relative w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] ${
    isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
  }`;

  return (
    <div className={overlay}>
      <div className={backdrop} onClick={onClose} />
      <div className={modalCls}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Send Notification
              </h3>
              <p className={`text-xs mt-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Choose notification type and select stores
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-400 hover:bg-gray-100"}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notification Type Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setNotificationType("report")}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                notificationType === "report"
                  ? "bg-green-600 text-white"
                  : isDarkMode
                  ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <BarChart2 className="w-4 h-4 inline-block mr-2" />
              Daily Report
            </button>
            <button
              onClick={() => setNotificationType("expiry")}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                notificationType === "expiry"
                  ? "bg-orange-600 text-white"
                  : isDarkMode
                  ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Clock className="w-4 h-4 inline-block mr-2" />
              Expiry Alert
            </button>
          </div>
        </div>

        {/* Search + select-all */}
        <div className={`px-6 pt-4 pb-3 border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
          <div className="relative mb-3">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
            <input
              type="text"
              placeholder="Search stores..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-1 focus:ring-green-500 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={toggleAll}
              className={`text-xs font-medium transition-colors ${isDarkMode ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-700"}`}
            >
              {allFilteredSelected ? "Deselect all" : "Select all"}
              {search ? " (filtered)" : ""}
            </button>
            <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
              {selected.size} of {activeStores.length} selected
            </span>
          </div>
        </div>

        {/* Store list */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-1">
          {filtered.length === 0 && (
            <p className={`text-sm text-center py-6 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
              No stores match your search
            </p>
          )}
          {filtered.map((store) => {
            const isChecked = selected.has(store._id);
            const userCount = (store.user || []).length;
            return (
              <label
                key={store._id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  isChecked
                    ? isDarkMode ? "bg-green-900/20" : "bg-green-50"
                    : isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleStore(store._id)}
                  className="w-4 h-4 accent-green-600 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {store.name}
                  </p>
                  <p className={`text-xs truncate ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                    {store.type} &middot; {userCount} user{userCount !== 1 ? "s" : ""}
                    {userCount === 0 && <span className="text-amber-500 ml-1">(will be skipped — no users)</span>}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between gap-3 px-6 py-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
          <button
            onClick={onClose}
            disabled={sending}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
              isDarkMode
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } disabled:opacity-50`}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(Array.from(selected), notificationType)}
            disabled={sending || selected.size === 0}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              notificationType === "expiry"
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {sending
              ? "Sending..."
              : `Send ${notificationType === "expiry" ? "Expiry Alert" : "Report"} to ${selected.size} store${selected.size !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main component ────────────────────────────────────────────────────────── */
const AdminControlTab = ({ stores = [] }) => {
  const { isDarkMode } = useTheme();
  const { authState } = useAuth();
  const { token } = authState;

  const [activePanel, setActivePanel] = useState("events");
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [triggeringReport, setTriggeringReport] = useState(false);
  const [lastTriggerResult, setLastTriggerResult] = useState(null);
  const [showResultDetail, setShowResultDetail] = useState(false);

  // Report schedule state
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [scheduleHour, setScheduleHour] = useState(20);
  const [scheduleMinute, setScheduleMinute] = useState(0);

  // Expiry notification schedule state
  const [editingExpirySchedule, setEditingExpirySchedule] = useState(false);
  const [expiryScheduleHour, setExpiryScheduleHour] = useState(9);
  const [expiryScheduleMinute, setExpiryScheduleMinute] = useState(0);

  const queryClient = useQueryClient();

  // Fetch events
  const {
    data: eventsData,
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = useQuery({
    queryKey: ["adminEvents"],
    queryFn: async () => {
      const res = await api.get("/api/adminControl/events", {
        headers: { token },
      });
      return res.data;
    },
    staleTime: 30_000,
  });

  const events = eventsData?.data?.events || [];

  // Fetch current report schedule
  const { data: scheduleData } = useQuery({
    queryKey: ["reportSchedule"],
    queryFn: async () => {
      const res = await api.get("/api/adminControl/reportSchedule", {
        headers: { token },
      });
      return res.data;
    },
    staleTime: 60_000,
  });

  // Sync fetched schedule into local state (only when not actively editing)
  useEffect(() => {
    if (scheduleData?.data && !editingSchedule) {
      setScheduleHour(scheduleData.data.hour ?? 20);
      setScheduleMinute(scheduleData.data.minute ?? 0);
    }
  }, [scheduleData, editingSchedule]);

  // Fetch current expiry notification schedule
  const { data: expiryScheduleData } = useQuery({
    queryKey: ["expiryNotificationSchedule"],
    queryFn: async () => {
      const res = await api.get("/api/adminControl/expiryNotificationSchedule", {
        headers: { token },
      });
      return res.data;
    },
    staleTime: 60_000,
  });

  // Sync fetched expiry schedule into local state (only when not actively editing)
  useEffect(() => {
    if (expiryScheduleData?.data && !editingExpirySchedule) {
      setExpiryScheduleHour(expiryScheduleData.data.hour ?? 9);
      setExpiryScheduleMinute(expiryScheduleData.data.minute ?? 0);
    }
  }, [expiryScheduleData, editingExpirySchedule]);

  const saveScheduleMutation = useMutation({
    mutationFn: async ({ hour, minute }) => {
      const res = await api.put(
        "/api/adminControl/reportSchedule",
        { hour, minute },
        { headers: { token } }
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reportSchedule"] });
      setEditingSchedule(false);
      toast.success(data?.message || "Report schedule updated");
    },
    onError: (err) => {
      console.error("Save schedule error:", err);
      toast.error("Failed to update report schedule");
    },
  });

  const saveExpiryScheduleMutation = useMutation({
    mutationFn: async ({ hour, minute }) => {
      const res = await api.put(
        "/api/adminControl/expiryNotificationSchedule",
        { hour, minute },
        { headers: { token } }
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["expiryNotificationSchedule"] });
      setEditingExpirySchedule(false);
      toast.success(data?.message || "Expiry notification schedule updated");
    },
    onError: (err) => {
      console.error("Save expiry schedule error:", err);
      toast.error("Failed to update expiry notification schedule");
    },
  });

  const formatScheduleTime = (h, m) => {
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    const displayMin = String(m).padStart(2, "0");
    return `${displayHour}:${displayMin} ${period}`;
  };

  const handleConfirmTrigger = async (storeIds, notificationType) => {
    setTriggeringReport(true);
    setLastTriggerResult(null);
    try {
      // If all active stores selected, send without filter (backend sends to all)
      const allActiveIds = stores.filter((s) => s.status === "active").map((s) => s._id);
      const payload = storeIds.length === allActiveIds.length ? {} : { storeIds };

      // Choose endpoint based on notification type
      const endpoint = notificationType === "expiry"
        ? "/api/adminControl/sendExpiryNotificationNow"
        : "/api/adminControl/sendDailyReport";

      const res = await api.post(endpoint, payload, {
        headers: { token },
      });

      if (res.data.success) {
        setLastTriggerResult(res.data.data);
        setShowTriggerModal(false);
        setShowResultDetail(true);
        const notificationLabel = notificationType === "expiry" ? "Expiry notifications" : "Report";
        toast.success(`${notificationLabel} sent! ${res.data.data?.sent || 0} store(s) notified.`);
      } else {
        toast.error(res.data.message || "Failed to send notification");
      }
    } catch (error) {
      console.error("Trigger notification error:", error);
      toast.error("Something went wrong sending the notification");
    } finally {
      setTriggeringReport(false);
    }
  };

  const cardBase = isDarkMode
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-200";

  const panelBtnCls = (key) =>
    `flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      activePanel === key
        ? "bg-green-600 text-white"
        : isDarkMode
        ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
    }`;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Trigger modal */}
      {showTriggerModal && (
        <TriggerReportModal
          stores={stores}
          isDarkMode={isDarkMode}
          onClose={() => !triggeringReport && setShowTriggerModal(false)}
          onConfirm={handleConfirmTrigger}
          sending={triggeringReport}
        />
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-green-100">
            <Shield className="w-6 h-6 text-green-700" />
          </div>
          <div>
            <h2 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Admin Control
            </h2>
            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Manage event notifications and daily store performance reports
            </p>
          </div>
        </div>
      </div>

      {/* Quick info cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            icon: Mail,
            label: "Daily Reports",
            value: formatScheduleTime(scheduleHour, scheduleMinute),
            sub: "Auto-sent every night",
            color: "text-blue-600",
            bg: isDarkMode ? "bg-blue-900/20 border-blue-700/30" : "bg-blue-50 border-blue-200",
          },
          {
            icon: Users,
            label: "Stores Covered",
            value: stores.filter((s) => s.status === "active").length,
            sub: "Active stores",
            color: "text-green-600",
            bg: isDarkMode ? "bg-green-900/20 border-green-700/30" : "bg-green-50 border-green-200",
          },
          {
            icon: Calendar,
            label: "Scheduled Events",
            value: events.filter((e) => e.status === "scheduled").length,
            sub: "Pending to send",
            color: "text-yellow-600",
            bg: isDarkMode ? "bg-yellow-900/20 border-yellow-700/30" : "bg-yellow-50 border-yellow-200",
          },
          {
            icon: CheckCircle,
            label: "Events Sent",
            value: events.filter((e) => e.status === "sent").length,
            sub: "Delivered successfully",
            color: "text-purple-600",
            bg: isDarkMode ? "bg-purple-900/20 border-purple-700/30" : "bg-purple-50 border-purple-200",
          },
        ].map((card) => (
          <div key={card.label} className={`rounded-xl border p-4 ${card.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <card.icon className={`w-4 h-4 ${card.color}`} />
              <p className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                {card.label}
              </p>
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className={`text-xs mt-0.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Panel switcher */}
      <div className="flex gap-2">
        <button onClick={() => setActivePanel("events")} className={panelBtnCls("events")}>
          <Calendar className="w-4 h-4" />
          Event Calendar
        </button>
        <button onClick={() => setActivePanel("dailyReport")} className={panelBtnCls("dailyReport")}>
          <Mail className="w-4 h-4" />
          Daily Report
        </button>
      </div>

      {/* Event Calendar Panel */}
      {activePanel === "events" && (
        <EventCalendarPanel
          events={events}
          stores={stores}
          loading={eventsLoading}
          onRefresh={refetchEvents}
        />
      )}

      {/* Daily Report Panel */}
      {activePanel === "dailyReport" && (
        <div className="space-y-4">
          {/* What's in the report */}
          <div className={`rounded-2xl border p-6 ${cardBase}`}>
            <h3 className={`text-base font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              What&apos;s included in the daily report
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Users, label: "New customers added today" },
                { icon: TrendingUp, label: "Total visits today" },
                { icon: BarChart2, label: "Points earned & redeemed" },
                { icon: CheckCircle, label: "Customer segment breakdown" },
                { icon: Users, label: "Top 5 customers today" },
                { icon: TrendingUp, label: "30-day retention rate" },
                { icon: BarChart2, label: "Active customers (last 30 days)" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${isDarkMode ? "bg-green-900/30" : "bg-green-50"}`}>
                    <item.icon className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Configuration - Two Column Layout */}
          <div className={`rounded-2xl border p-6 ${cardBase}`}>
            <h3 className={`text-base font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Notification Schedules
            </h3>
            <p className={`text-sm mb-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Configure when automated notifications are sent to store owners
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Daily Report Schedule */}
              <div className={`rounded-xl border p-5 ${isDarkMode ? "bg-green-900/10 border-green-800" : "bg-green-50 border-green-200"}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart2 className={`w-4 h-4 ${isDarkMode ? "text-green-400" : "text-green-600"}`} />
                    <h4 className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      Daily Report
                    </h4>
                  </div>
                  {!editingSchedule ? (
                    <button
                      onClick={() => setEditingSchedule(true)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-white text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingSchedule(false)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                          : "bg-white text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </button>
                  )}
                </div>

                {!editingSchedule ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className={`w-4 h-4 ${isDarkMode ? "text-green-400" : "text-green-600"}`} />
                      <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {formatScheduleTime(scheduleHour, scheduleMinute)}
                      </p>
                    </div>
                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Performance metrics sent automatically to all store users every night
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Hour
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={23}
                          value={scheduleHour}
                          onChange={(e) => setScheduleHour(Number(e.target.value))}
                          className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            isDarkMode
                              ? "bg-gray-800 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Minute
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={59}
                          value={scheduleMinute}
                          onChange={(e) => setScheduleMinute(Number(e.target.value))}
                          className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            isDarkMode
                              ? "bg-gray-800 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                        />
                      </div>
                    </div>
                    <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                      Preview: {formatScheduleTime(scheduleHour, scheduleMinute)}
                    </p>
                    <button
                      onClick={() => saveScheduleMutation.mutate({ hour: scheduleHour, minute: scheduleMinute })}
                      disabled={saveScheduleMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saveScheduleMutation.isPending
                        ? <RefreshCw className="w-4 h-4 animate-spin" />
                        : <Save className="w-4 h-4" />}
                      {saveScheduleMutation.isPending ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>

              {/* Expiry Notification Schedule */}
              <div className={`rounded-xl border p-5 ${isDarkMode ? "bg-orange-900/10 border-orange-800" : "bg-orange-50 border-orange-200"}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
                    <h4 className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      Expiry Alerts
                    </h4>
                  </div>
                  {!editingExpirySchedule ? (
                    <button
                      onClick={() => setEditingExpirySchedule(true)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-white text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setExpiryScheduleHour(expiryScheduleData?.data?.hour ?? 9);
                        setExpiryScheduleMinute(expiryScheduleData?.data?.minute ?? 0);
                        setEditingExpirySchedule(false);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                          : "bg-white text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </button>
                  )}
                </div>

                {!editingExpirySchedule ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className={`w-4 h-4 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} />
                      <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {formatScheduleTime(expiryScheduleHour, expiryScheduleMinute)}
                      </p>
                    </div>
                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Expiry warnings sent to stores with ≤7 days remaining
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Hour
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={23}
                          value={expiryScheduleHour}
                          onChange={(e) => setExpiryScheduleHour(parseInt(e.target.value) || 0)}
                          className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            isDarkMode
                              ? "bg-gray-800 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <label className={`block text-xs font-medium mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Minute
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={59}
                          value={expiryScheduleMinute}
                          onChange={(e) => setExpiryScheduleMinute(parseInt(e.target.value) || 0)}
                          className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            isDarkMode
                              ? "bg-gray-800 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                        />
                      </div>
                    </div>
                    <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                      Preview: {formatScheduleTime(expiryScheduleHour, expiryScheduleMinute)}
                    </p>
                    <button
                      onClick={() => saveExpiryScheduleMutation.mutate({
                        hour: expiryScheduleHour,
                        minute: expiryScheduleMinute
                      })}
                      disabled={saveExpiryScheduleMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saveExpiryScheduleMutation.isPending
                        ? <RefreshCw className="w-4 h-4 animate-spin" />
                        : <Save className="w-4 h-4" />}
                      {saveExpiryScheduleMutation.isPending ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recipients info */}
          <div className={`rounded-2xl border p-6 ${cardBase}`}>
            <h3 className={`text-base font-semibold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Recipients
            </h3>
            <p className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Reports are sent to all users assigned to each active store. Stores without assigned users are skipped.
            </p>
            <div className="space-y-2">
              {stores
                .filter((s) => s.status === "active")
                .slice(0, 8)
                .map((store) => (
                  <div
                    key={store._id}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className={`text-sm ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                        {store.name}
                      </span>
                      <span className={`text-xs capitalize ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                        ({store.type})
                      </span>
                    </div>
                    <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                      {(store.user || []).length} user{(store.user || []).length !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              {stores.filter((s) => s.status === "active").length > 8 && (
                <p className={`text-xs text-center pt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                  + {stores.filter((s) => s.status === "active").length - 8} more active stores
                </p>
              )}
            </div>
          </div>

          {/* Manual trigger */}
          <div className={`rounded-2xl border p-6 ${cardBase}`}>
            <h3 className={`text-base font-semibold mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Manual Trigger
            </h3>
            <p className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Send daily reports or expiry notifications immediately. Choose notification type and select specific stores.
            </p>

            <button
              onClick={() => setShowTriggerModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              Send Notification Now
            </button>

            {/* Last run result */}
            {lastTriggerResult && (
              <div className={`mt-4 rounded-xl border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                <button
                  onClick={() => setShowResultDetail((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      Last Run Results
                    </span>
                    <span className="text-green-600 font-medium">{lastTriggerResult.sent} sent</span>
                    {lastTriggerResult.failed > 0 && (
                      <span className="text-red-500 font-medium">{lastTriggerResult.failed} failed</span>
                    )}
                    {lastTriggerResult.skipped > 0 && (
                      <span className={`font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {lastTriggerResult.skipped} skipped
                      </span>
                    )}
                  </div>
                  {showResultDetail
                    ? <ChevronUp className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                    : <ChevronDown className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                  }
                </button>

                {showResultDetail && lastTriggerResult.stores?.length > 0 && (
                  <div className={`border-t px-4 pb-3 pt-2 space-y-1 ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}>
                    {lastTriggerResult.stores.map((s, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className={`text-xs ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {s.store}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            s.status === "sent"
                              ? "text-green-600"
                              : s.status === "failed"
                              ? "text-red-500"
                              : isDarkMode
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          {s.status}
                          {s.recipients ? ` · ${s.recipients} recipient${s.recipients !== 1 ? "s" : ""}` : ""}
                          {s.reason ? ` · ${s.reason}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminControlTab;
