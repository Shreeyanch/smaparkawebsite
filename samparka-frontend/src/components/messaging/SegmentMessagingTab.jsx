import { useState, useEffect } from "react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/config";
import CustomerSelector from "./CustomerSelector";
import MessageComposer from "./MessageComposer";
import SchedulePicker from "./SchedulePicker";
import CampaignHistory from "./CampaignHistory";
import { ArrowLeft, ArrowRight, Send, History, Users, MessageSquare, Clock } from "lucide-react";

export default function SegmentMessagingTab({ storeId, segments = [], storeData = null }) {
  const { isDarkMode } = useTheme();
  const { authState } = useAuth();
  const { token } = authState;

  // View mode: wizard or history
  const [viewMode, setViewMode] = useState("wizard"); // "wizard" | "history"

  // Wizard step
  const [step, setStep] = useState(1);

  // Selection state
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [recipientCount, setRecipientCount] = useState(0);

  // Message state
  const [channel, setChannel] = useState("push");
  const [messageType, setMessageType] = useState("custom");
  const [templateId, setTemplateId] = useState("");
  const [customMessage, setCustomMessage] = useState({ title: "", body: "" });
  const [templates, setTemplates] = useState([]);

  // Schedule state
  const [scheduleType, setScheduleType] = useState("now"); // "now" | "later"
  const [scheduledFor, setScheduledFor] = useState("");

  // Campaign name
  const [campaignName, setCampaignName] = useState("");

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Image state (email campaigns only)
  const [campaignImageKey, setCampaignImageKey] = useState(null);
  const [campaignImagePreview, setCampaignImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Special segment counts
  const [specialCounts, setSpecialCounts] = useState({ at_risk: 0, churned: 0 });
  const [totalAllCustomers, setTotalAllCustomers] = useState(0);

  // Fetch special segment counts
  useEffect(() => {
    if (storeId) {
      fetchSpecialCounts();
    }
  }, [storeId]);

  // Fetch templates when channel changes
  useEffect(() => {
    if (storeId && channel) {
      fetchTemplates();
    }
  }, [storeId, channel]);

  // Update recipient count when selection changes
  useEffect(() => {
    updateRecipientCount();
  }, [selectedSegments, selectedCustomers]);

  const fetchSpecialCounts = async () => {
    try {
      const [segCountRes, summaryRes] = await Promise.all([
        api.get(`/api/campaigns/${storeId}/customers/segment-counts`, { headers: { token } }),
        api.get(`/api/visitAnalytics/summary/${storeId}`, { headers: { token } }),
      ]);
      if (segCountRes.data.success) {
        setSpecialCounts(segCountRes.data.data);
      }
      if (summaryRes.data.success) {
        setTotalAllCustomers(summaryRes.data.data?.totalRegisteredCustomers || 0);
      }
    } catch (error) {
      console.error("Failed to fetch segment counts:", error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.get(
        `/api/campaigns/${storeId}/templates/${channel}`,
        { headers: { token } }
      );
      if (response.data.success) {
        setTemplates(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    }
  };

  const updateRecipientCount = async () => {
    if (selectedSegments.length === 0 && selectedCustomers.length === 0) {
      setRecipientCount(0);
      return;
    }

    try {
      const response = await api.post(
        `/api/campaigns/${storeId}/preview`,
        {
          segments: selectedSegments,
          customerIds: selectedCustomers.map((c) => c.customer),
        },
        { headers: { token } }
      );
      if (response.data.success) {
        setRecipientCount(response.data.data.count);
      }
    } catch (error) {
      console.error("Failed to preview recipients:", error);
    }
  };

  const handleSegmentToggle = (segmentName) => {
    setSelectedSegments((prev) =>
      prev.includes(segmentName)
        ? prev.filter((s) => s !== segmentName)
        : [...prev, segmentName]
    );
  };

  const handleCustomerToggle = (customer) => {
    setSelectedCustomers((prev) => {
      const exists = prev.find((c) => c.customer === customer.customer);
      if (exists) {
        return prev.filter((c) => c.customer !== customer.customer);
      }
      return [...prev, customer];
    });
  };

  const handleSelectAllInSegment = (customers) => {
    setSelectedCustomers((prev) => {
      const newCustomers = [...prev];
      customers.forEach((c) => {
        if (!newCustomers.find((nc) => nc.customer === c.customer)) {
          newCustomers.push(c);
        }
      });
      return newCustomers;
    });
  };

  const handleClearSelection = () => {
    setSelectedSegments([]);
    setSelectedCustomers([]);
    setRecipientCount(0);
  };

  const handleImageSelect = async (file) => {
    setCampaignImagePreview(URL.createObjectURL(file));
    setIsUploadingImage(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        initialQuality: 0.8,
      });
      const formData = new FormData();
      formData.append("image", compressed);
      const res = await api.post("/api/campaigns/upload-image", formData, {
        headers: { token },
      });
      if (res.data.success) {
        setCampaignImageKey(res.data.imageKey);
      } else {
        toast.error("Image upload failed");
        setCampaignImagePreview(null);
      }
    } catch {
      toast.error("Image upload failed");
      setCampaignImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageRemove = () => {
    setCampaignImageKey(null);
    setCampaignImagePreview(null);
  };

  const handleSendCampaign = async () => {
    if (recipientCount === 0) {
      toast.error("Please select at least one recipient");
      return;
    }

    if (!campaignName.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }

    if (messageType === "custom" && !customMessage.body.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (channel === "email" && messageType === "custom" && !customMessage.subject?.trim()) {
      toast.error("Please enter an email subject");
      return;
    }

    if (messageType === "template" && !templateId) {
      toast.error("Please select a template");
      return;
    }

    setIsSending(true);
    try {
      const payload = {
        name: campaignName,
        segments: selectedSegments,
        customerIds: selectedCustomers.map((c) => c.customer),
        channel,
        messageType,
        templateId: messageType === "template" ? templateId : undefined,
        customMessage: messageType === "custom" ? customMessage : undefined,
        sendNow: scheduleType === "now",
        scheduledFor: scheduleType === "later" ? scheduledFor : undefined,
        campaignImageKey: channel === "email" ? campaignImageKey : undefined,
      };

      const response = await api.post(
        `/api/campaigns/${storeId}`,
        payload,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Campaign created successfully!");
        // Reset form
        resetForm();
        setViewMode("history");
      }
    } catch (error) {
      console.error("Failed to create campaign:", error);
      toast.error(error.response?.data?.message || "Failed to create campaign");
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedSegments([]);
    setSelectedCustomers([]);
    setRecipientCount(0);
    setChannel("push");
    setMessageType("custom");
    setTemplateId("");
    setCustomMessage({ title: "", body: "" });
    setScheduleType("now");
    setScheduledFor("");
    setCampaignName("");
    setCampaignImageKey(null);
    setCampaignImagePreview(null);
  };

  const canProceedToStep2 = recipientCount > 0;
  const canProceedToStep3 =
    (messageType === "custom" && customMessage.body.trim()) ||
    (messageType === "template" && templateId);

  const steps = [
    { number: 1, title: "Select Recipients", icon: Users },
    { number: 2, title: "Compose Message", icon: MessageSquare },
    { number: 3, title: "Review & Send", icon: Send },
  ];

  if (viewMode === "history") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Campaign History
          </h2>
          <button
            onClick={() => setViewMode("wizard")}
            className="flex items-center gap-2 px-4 py-2 bg-[#4caf50] text-white rounded-lg hover:bg-[#45a049] transition-colors"
          >
            <Send className="w-4 h-4" />
            New Campaign
          </button>
        </div>
        <CampaignHistory storeId={storeId} token={token} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Send Message to Customers
        </h2>
        <button
          onClick={() => setViewMode("history")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isDarkMode
              ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <History className="w-4 h-4" />
          View History
        </button>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((s, index) => (
          <div key={s.number} className="flex items-center flex-1">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                  step === s.number
                    ? isDarkMode
                      ? "bg-[#4caf50] text-white"
                      : "bg-[#4caf50] text-white"
                    : step > s.number
                    ? isDarkMode
                      ? "bg-gray-700 text-green-400 border-2 border-green-400"
                      : "bg-gray-100 text-green-600 border-2 border-green-600"
                    : isDarkMode
                    ? "bg-gray-800 border-2 border-gray-700 text-gray-500"
                    : "bg-gray-50 border-2 border-gray-300 text-gray-400"
                }`}
              >
                <s.icon className="w-5 h-5" />
              </div>
              <span
                className={`text-sm font-medium whitespace-nowrap ${
                  step >= s.number
                    ? isDarkMode
                      ? "text-white"
                      : "text-gray-900"
                    : isDarkMode
                    ? "text-gray-500"
                    : "text-gray-400"
              }`}
            >
              {s.title}
            </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 ${
                  step > s.number
                    ? isDarkMode
                      ? "bg-green-500"
                      : "bg-green-500"
                    : isDarkMode
                    ? "bg-gray-700"
                    : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div
        className={`rounded-lg border p-6 ${
          isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        {step === 1 && (
          <CustomerSelector
            storeId={storeId}
            token={token}
            segments={segments}
            specialCounts={specialCounts}
            selectedSegments={selectedSegments}
            selectedCustomers={selectedCustomers}
            onSegmentToggle={handleSegmentToggle}
            onCustomerToggle={handleCustomerToggle}
            onSelectAllInSegment={handleSelectAllInSegment}
            onClearSelection={handleClearSelection}
            recipientCount={recipientCount}
            totalAllCustomers={totalAllCustomers}
          />
        )}

        {step === 2 && (
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
            storeData={storeData}
            campaignImagePreview={campaignImagePreview}
            isUploadingImage={isUploadingImage}
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
          />
        )}

        {step === 3 && (
          <div className="space-y-6">
            {/* Campaign name */}
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
                placeholder="e.g., Re-engage At-Risk Customers"
                className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#4caf50] transition-all ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>

            {/* Schedule */}
            <SchedulePicker
              scheduleType={scheduleType}
              onScheduleTypeChange={setScheduleType}
              scheduledFor={scheduledFor}
              onScheduledForChange={setScheduledFor}
            />

            {/* Summary */}
            <div
              className={`p-4 rounded-lg ${
                isDarkMode ? "bg-gray-800" : "bg-gray-50"
              }`}
            >
              <h3
                className={`font-medium mb-3 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Campaign Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                    Recipients
                  </span>
                  <span className={isDarkMode ? "text-white" : "text-gray-900"}>
                    {recipientCount} customer{recipientCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                    Channel
                  </span>
                  <span className={isDarkMode ? "text-white" : "text-gray-900"}>
                    {channel === "sms" ? "SMS" : channel === "push" ? "Push Notification" : channel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                    Message Type
                  </span>
                  <span className={isDarkMode ? "text-white" : "text-gray-900"}>
                    {messageType === "template" ? "Template" : "Custom"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                    Delivery
                  </span>
                  <span className={isDarkMode ? "text-white" : "text-gray-900"}>
                    {scheduleType === "now" ? "Send immediately" : `Scheduled for ${new Date(scheduledFor).toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isDarkMode
              ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !canProceedToStep2 : !canProceedToStep3}
              className="flex items-center gap-2 px-4 py-2 bg-[#4caf50] text-white rounded-lg hover:bg-[#45a049] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSendCampaign}
              disabled={isSending || !campaignName.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-[#4caf50] text-white rounded-lg hover:bg-[#45a049] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {scheduleType === "now" ? "Send Now" : "Schedule Campaign"}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
