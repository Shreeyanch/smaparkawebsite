import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Bell, Calendar, X } from "lucide-react";
import api from "../../api/config";

const EVENT_TYPE_STYLES = {
  marketing_campaign: { label: "Marketing", bg: "bg-purple-100", text: "text-purple-700" },
  seasonal_promotion: { label: "Promotion", bg: "bg-orange-100", text: "text-orange-700" },
  customer_followup: { label: "Follow-up", bg: "bg-blue-100", text: "text-blue-700" },
  general_announcement: { label: "Announcement", bg: "bg-green-100", text: "text-green-700" },
  billing_reminder: { label: "Billing", bg: "bg-red-100", text: "text-red-700" },
};

const StoreEventsBanner = ({ storeId }) => {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const token = localStorage.getItem("storeToken");

  const { data, isLoading } = useQuery({
    queryKey: ["storeEvents", storeId],
    queryFn: async () => {
      const res = await api.get(`/api/adminControl/events/store/${storeId}`, {
        headers: { token },
      });
      return res.data;
    },
    enabled: !!storeId && !!token,
    staleTime: 5 * 60 * 1000,
  });

  const events = data?.data?.events ?? [];

  // Only show scheduled (upcoming) events
  const upcomingEvents = events.filter((e) => e.status === "scheduled");

  if (isLoading || upcomingEvents.length === 0 || dismissed) return null;

  const typeStyle = (type) =>
    EVENT_TYPE_STYLES[type] ?? { label: type, bg: "bg-gray-100", text: "text-gray-600" };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const previewEvent = upcomingEvents[0];
  const previewStyle = typeStyle(previewEvent.type);

  return (
    <div className="mx-4 mt-4 rounded-xl border border-blue-200 bg-blue-50 shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100">
            <Bell className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-sm font-semibold text-blue-800">
            {upcomingEvents.length === 1
              ? "1 upcoming event from Samparka"
              : `${upcomingEvents.length} upcoming events from Samparka`}
          </span>
          {/* Preview badge of first event type */}
          <span
            className={`hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${previewStyle.bg} ${previewStyle.text}`}
          >
            {previewStyle.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                View
              </>
            )}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-lg p-1 text-blue-400 hover:bg-blue-100 hover:text-blue-600 transition-colors"
            title="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded event list */}
      {expanded && (
        <div className="border-t border-blue-200 divide-y divide-blue-100">
          {upcomingEvents.map((event) => {
            const style = typeStyle(event.type);
            return (
              <div key={event._id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {event.title}
                      </p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
                      >
                        {style.label}
                      </span>
                    </div>
                    {event.description && (
                      <p className="mt-0.5 text-xs text-gray-600 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(event.scheduledAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StoreEventsBanner;
