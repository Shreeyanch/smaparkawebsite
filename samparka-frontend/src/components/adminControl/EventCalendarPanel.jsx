import { useState, useCallback } from "react";
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Store,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../api/config";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import CreateEventModal from "./CreateEventModal";

const EVENT_TYPE_LABELS = {
  marketing_campaign: "Marketing Campaign",
  seasonal_promotion: "Seasonal Promotion",
  customer_followup: "Customer Follow-up",
  general_announcement: "General Announcement",
  billing_reminder: "Billing Reminder",
};

const EVENT_TYPE_COLORS = {
  marketing_campaign: {
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  seasonal_promotion: {
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  customer_followup: {
    badge: "bg-purple-100 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  general_announcement: {
    badge: "bg-green-100 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  billing_reminder: {
    badge: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

const STATUS_CONFIG = {
  scheduled: {
    label: "Scheduled",
    icon: Clock,
    cls: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  sent: {
    label: "Sent",
    icon: CheckCircle,
    cls: "bg-green-100 text-green-700 border-green-200",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    cls: "bg-red-100 text-red-700 border-red-200",
  },
};

const EventCalendarPanel = ({ events, stores, onRefresh, loading }) => {
  const { isDarkMode } = useTheme();
  const { authState } = useAuth();
  const { token } = authState;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const handleDelete = async (event) => {
    if (!window.confirm(`Delete event "${event.title}"? This cannot be undone.`)) return;
    setDeletingId(event._id);
    try {
      const res = await api.delete(`/api/adminControl/events/${event._id}`, {
        headers: { token },
      });
      if (res.data.success) {
        toast.success("Event deleted");
        onRefresh();
      } else {
        toast.error(res.data.message || "Failed to delete event");
      }
    } catch (error) {
      console.error("Delete event error:", error);
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEventSaved = useCallback(() => {
    setEditingEvent(null);
    onRefresh();
  }, [onRefresh]);

  const filteredEvents = events.filter((e) => {
    if (filterStatus !== "all" && e.status !== filterStatus) return false;
    if (filterType !== "all" && e.type !== filterType) return false;
    return true;
  });

  const cardBase = isDarkMode
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-200";

  const scheduledCount = events.filter((e) => e.status === "scheduled").length;
  const sentCount = events.filter((e) => e.status === "sent").length;
  const failedCount = events.filter((e) => e.status === "failed").length;

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-lg font-700 font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Event Calendar
          </h2>
          <p className={`text-sm mt-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            Create events and suggestions that are emailed to store-assigned users on schedule.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`p-2 rounded-lg border transition-colors ${
              isDarkMode
                ? "border-gray-700 text-gray-400 hover:bg-gray-700"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Scheduled", count: scheduledCount, color: "text-yellow-600", bg: isDarkMode ? "bg-yellow-900/20 border-yellow-700/30" : "bg-yellow-50 border-yellow-200" },
          { label: "Sent", count: sentCount, color: "text-green-600", bg: isDarkMode ? "bg-green-900/20 border-green-700/30" : "bg-green-50 border-green-200" },
          { label: "Failed", count: failedCount, color: "text-red-600", bg: isDarkMode ? "bg-red-900/20 border-red-700/30" : "bg-red-50 border-red-200" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className={`text-xs mt-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`text-sm rounded-lg border px-3 py-1.5 outline-none focus:ring-2 focus:ring-green-500 ${
            isDarkMode
              ? "bg-gray-800 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-700"
          }`}
        >
          <option value="all">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>

        {/* Type filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={`text-sm rounded-lg border px-3 py-1.5 outline-none focus:ring-2 focus:ring-green-500 ${
            isDarkMode
              ? "bg-gray-800 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-700"
          }`}
        >
          <option value="all">All Types</option>
          {Object.entries(EVENT_TYPE_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        {(filterStatus !== "all" || filterType !== "all") && (
          <button
            onClick={() => { setFilterStatus("all"); setFilterType("all"); }}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
              isDarkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-600"
            }`}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Events list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <RefreshCw className="w-8 h-8 animate-spin text-green-500" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className={`rounded-2xl border p-12 text-center ${cardBase}`}>
          <Calendar className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? "text-gray-600" : "text-gray-300"}`} />
          <p className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            {events.length === 0 ? "No events yet" : "No events match filters"}
          </p>
          <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            {events.length === 0
              ? "Create your first event to send suggestions to store users."
              : "Try changing the filters above."}
          </p>
          {events.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => {
            const typeColor = EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS.general_announcement;
            const statusConf = STATUS_CONFIG[event.status] || STATUS_CONFIG.scheduled;
            const StatusIcon = statusConf.icon;
            const isExpanded = expandedId === event._id;
            const isDeleting = deletingId === event._id;

            return (
              <div
                key={event._id}
                className={`rounded-xl border transition-shadow ${cardBase} ${
                  isExpanded ? "shadow-md" : "shadow-sm hover:shadow-md"
                }`}
              >
                {/* Card header row */}
                <div className="flex items-start gap-3 p-4">
                  {/* Type dot */}
                  <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${typeColor.dot}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-xs font-medium border rounded-full px-2.5 py-0.5 ${typeColor.badge}`}>
                        {EVENT_TYPE_LABELS[event.type] || event.type}
                      </span>
                      <span className={`text-xs font-medium border rounded-full px-2.5 py-0.5 flex items-center gap-1 ${statusConf.cls}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConf.label}
                      </span>
                    </div>

                    <h3 className={`font-semibold text-sm leading-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {event.title}
                    </h3>

                    <div className={`flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(event.scheduledAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Store className="w-3 h-3" />
                        {event.targetStores?.length || 0} store{(event.targetStores?.length || 0) !== 1 ? "s" : ""}
                      </span>
                      {event.sentAt && (
                        <span className="text-green-600">
                          Sent {new Date(event.sentAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {event.status !== "sent" && (
                      <button
                        onClick={() => setEditingEvent(event)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDarkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(event)}
                      disabled={isDeleting}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDarkMode ? "hover:bg-red-900/30 text-gray-400 hover:text-red-400" : "hover:bg-red-50 text-gray-500 hover:text-red-500"
                      }`}
                    >
                      {isDeleting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : event._id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDarkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                      }`}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className={`px-4 pb-4 border-t pt-3 ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
                    <p className={`text-sm whitespace-pre-wrap leading-relaxed mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {event.description}
                    </p>

                    {event.targetStores?.length > 0 && (
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                          Target Stores
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {event.targetStores.map((s) => (
                            <span
                              key={typeof s === "object" ? s._id : s}
                              className={`text-xs px-2.5 py-1 rounded-full border ${
                                isDarkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-600"
                              }`}
                            >
                              {typeof s === "object" ? s.name : s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {event.status === "failed" && event.failureReason && (
                      <div className={`mt-3 rounded-lg p-3 text-xs ${isDarkMode ? "bg-red-900/20 text-red-400" : "bg-red-50 text-red-600"}`}>
                        <strong>Failure reason:</strong> {event.failureReason}
                      </div>
                    )}

                    {event.createdBy && (
                      <p className={`text-xs mt-3 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>
                        Created by {event.createdBy.email || event.createdBy.name} ·{" "}
                        {new Date(event.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateEventModal
          stores={stores}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleEventSaved}
        />
      )}
      {editingEvent && (
        <CreateEventModal
          stores={stores}
          existingEvent={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={handleEventSaved}
        />
      )}
    </div>
  );
};

export default EventCalendarPanel;
