import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { X, Send, Users, Clock, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "../../api/config";
import MessageComposer from "../messaging/MessageComposer";
import SchedulePicker from "../messaging/SchedulePicker";

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

export default function QuickComposeModal({
  isOpen,
  onClose,
  storeId,
  segment,
  viewMode,
  customerCount,
}) {
  const { isDarkMode } = useTheme();
  const { authState } = useAuth();
  const { token } = authState;

  // Form state
  const [campaignName, setCampaignName] = useState("");
  const [channel, setChannel] = useState("push");
  const [messageType, setMessageType] = useState("custom");
  const [templateId, setTemplateId] = useState("");
  const [customMessage, setCustomMessage] = useState({ title: "", body: "" });
  const [templates, setTemplates] = useState([]);
  const [scheduleType, setScheduleType] = useState("now");
  const [scheduledFor, setScheduledFor] = useState("");

  // For lastVisit mode
  const [resolvedCustomerIds, setResolvedCustomerIds] = useState([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  const [isSending, setIsSending] = useState(false);

  const segmentLabel =
    viewMode === "segments"
      ? SEGMENT_LABELS[segment]
      : LAST_VISIT_LABELS[segment];

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCampaignName("");
      setChannel("push");
      setMessageType("custom");
      setTemplateId("");
      setCustomMessage({ title: "", body: "" });
      setScheduleType("now");
      setScheduledFor("");
      setResolvedCustomerIds([]);
    }
  }, [isOpen]);

  // Fetch templates when channel changes
  useEffect(() => {
    if (isOpen && storeId && channel) {
      fetchTemplates();
    }
  }, [isOpen, storeId, channel]);

  // Resolve customer IDs for lastVisit mode
  useEffect(() => {
    if (isOpen && viewMode === "lastVisit" && segment && storeId) {
      fetchAllCustomerIds();
    }
  }, [isOpen, segment, viewMode, storeId]);

  const fetchTemplates = async () => {
    try {
      const response = await api.get(
        `/api/campaigns/${storeId}/templates/${channel}`,
        { headers: { token } }
      );
      if (response.data.success) {
        setTemplates(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    }
  };

  const fetchAllCustomerIds = async () => {
    setIsLoadingCustomers(true);
    try {
      const response = await api.get(
        `/api/visitAnalytics/customers/${storeId}`,
        {
          headers: { token },
          params: {
            lastVisitDays: JSON.stringify([segment]),
            page: 1,
            limit: 10000,
          },
        }
      );
      if (response.data.success) {
        const ids = (response.data.data || []).map((c) => c.customer);
        setResolvedCustomerIds(ids);
      }
    } catch (error) {
      toast.error("Failed to resolve customers");
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  // Validation
  const hasValidMessage =
    (messageType === "custom" && customMessage.body.trim()) ||
    (messageType === "template" && templateId);

  const hasValidSchedule =
    scheduleType === "now" ||
    (scheduleType === "later" &&
      scheduledFor &&
      new Date(scheduledFor) > new Date());

  const hasRecipients =
    viewMode === "segments" ||
    (viewMode === "lastVisit" && resolvedCustomerIds.length > 0);

  const canSend =
    campaignName.trim() &&
    hasValidMessage &&
    hasValidSchedule &&
    hasRecipients &&
    !isSending &&
    !isLoadingCustomers;

  const handleSend = async () => {
    if (!canSend) return;
    setIsSending(true);
    try {
      const payload = {
        name: campaignName.trim(),
        segments: viewMode === "segments" ? [segment] : [],
        customerIds: viewMode === "lastVisit" ? resolvedCustomerIds : [],
        channel,
        messageType,
        templateId: messageType === "template" ? templateId : undefined,
        customMessage: messageType === "custom" ? customMessage : undefined,
        sendNow: scheduleType === "now",
        scheduledFor: scheduleType === "later" ? scheduledFor : undefined,
      };

      const response = await api.post(
        `/api/campaigns/${storeId}`,
        payload,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(
          scheduleType === "now"
            ? "Campaign sent successfully!"
            : "Campaign scheduled successfully!"
        );
        onClose();
      } else {
        toast.error(response.data.message || "Failed to create campaign");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create campaign"
      );
    } finally {
      setIsSending(false);
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
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 9999 }}
      >
        <div
          className={`relative w-full max-w-2xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`p-5 border-b ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                      : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                  }`}
                  title="Go back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div
                  className={`p-2 rounded-lg ${
                    isDarkMode ? "bg-green-500/20" : "bg-[#e8f5e9]"
                  }`}
                >
                  <Send
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-green-400" : "text-[#388e3c]"
                    }`}
                  />
                </div>
                <div>
                  <h2
                    className={`text-lg font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Notify Customers
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                        isDarkMode
                          ? "bg-green-500/20 text-green-400"
                          : "bg-[#e8f5e9] text-[#388e3c]"
                      }`}
                    >
                      {segmentLabel}
                    </span>
                    <span
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {customerCount} customers
                    </span>
                    {isLoadingCustomers && (
                      <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto flex-1 p-5 space-y-6">
            {/* Campaign Name */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Campaign Name
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g., Re-engage 1st visit customers"
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>

            {/* Message Composer */}
            <MessageComposer
              channel={channel}
              onChannelChange={setChannel}
              messageType={messageType}
              onMessageTypeChange={setMessageType}
              templateId={templateId}
              onTemplateSelect={setTemplateId}
              customMessage={customMessage}
              onCustomMessageChange={setCustomMessage}
              templates={templates}
            />

            {/* Schedule Picker */}
            <SchedulePicker
              scheduleType={scheduleType}
              onScheduleTypeChange={setScheduleType}
              scheduledFor={scheduledFor}
              onScheduledForChange={setScheduledFor}
            />
          </div>

          {/* Footer */}
          <div
            className={`p-5 border-t flex items-center justify-between ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                canSend
                  ? isDarkMode
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-[#4caf50] text-white hover:bg-[#388e3c]"
                  : isDarkMode
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isSending
                ? "Sending..."
                : scheduleType === "now"
                ? "Send Now"
                : "Schedule Campaign"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
