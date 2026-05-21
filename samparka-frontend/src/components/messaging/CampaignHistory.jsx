import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/config";
import {
  MessageSquare,
  Bell,
  Mail,
  MessageCircle,
  CheckCircle,
  Clock,
  XCircle,
  Loader,
  Ban,
  Eye,
  X,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const CHANNEL_ICONS = {
  sms: MessageSquare,
  push: Bell,
  email: Mail,
  whatsapp: MessageCircle,
};

const STATUS_CONFIG = {
  draft: { icon: Clock, color: "gray", label: "Draft" },
  scheduled: { icon: Clock, color: "blue", label: "Scheduled" },
  processing: { icon: Loader, color: "yellow", label: "Processing" },
  completed: { icon: CheckCircle, color: "green", label: "Completed" },
  failed: { icon: XCircle, color: "red", label: "Service Not Configured" },
  cancelled: { icon: Ban, color: "gray", label: "Cancelled" },
};

const getStatusStyles = (status, isDarkMode) => {
  const config = STATUS_CONFIG[status];
  if (!config) return "";

  const colors = {
    gray: isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700",
    blue: isDarkMode ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-700",
    yellow: isDarkMode ? "bg-yellow-900/50 text-yellow-400" : "bg-yellow-100 text-yellow-700",
    green: isDarkMode ? "bg-green-900/50 text-green-400" : "bg-green-100 text-green-700",
    red: isDarkMode ? "bg-red-900/50 text-red-400" : "bg-red-100 text-red-700",
  };

  return colors[config.color] || "";
};

const formatErrorMessage = (error) => {
  if (!error) return "";
  
  // Convert technical error messages to user-friendly ones
  if (error.includes("NO_SUBSCRIPTION") || error.includes("no subscription")) {
    return "Push notification service is not configured for your store.";
  }
  if (error.includes("INVALID_CREDENTIALS") || error.includes("authentication")) {
    return "Service authentication failed. Please verify your service credentials in settings.";
  }
  if (error.includes("INSUFFICIENT_BALANCE") || error.includes("balance")) {
    return "Insufficient balance to send messages. Please recharge your account.";
  }
  
  // Return the original error if no match found
  return error;
};

export default function CampaignHistory({ storeId, token }) {
  const { isDarkMode } = useTheme();
  const { authState } = useAuth();
  const isAdmin = authState.userInfo?.role === "admin";

  const [campaigns, setCampaigns] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    fetchCampaigns(1);
  }, [storeId, statusFilter]);

  const fetchCampaigns = async (page) => {
    if (!storeId) return;
    setIsLoading(true);

    try {
      const response = await api.get(`/api/campaigns/${storeId}`, {
        headers: { token },
        params: {
          page,
          limit: pagination.limit,
          status: statusFilter || undefined,
        },
      });

      if (response.data.success) {
        setCampaigns(response.data.data || []);
        setPagination(response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCampaignDetails = async (campaignId) => {
    try {
      const response = await api.get(`/api/campaigns/${storeId}/campaign/${campaignId}`, {
        headers: { token },
      });

      if (response.data.success) {
        setSelectedCampaign(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch campaign details:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex justify-end">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#4caf50] ${
            isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"
          }`}
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="scheduled">Scheduled</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Campaign list */}
      <div className={`rounded-lg border overflow-hidden ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
        <table className="w-full">
          <thead className={isDarkMode ? "bg-gray-800" : "bg-gray-50"}>
            <tr>
              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>Campaign</th>
              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>Channel</th>
              <th className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>Recipients</th>
              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>Status</th>
              <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>Date</th>
              <th className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}>Action</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-200"}`}>
            {isLoading ? (
              <tr>
                <td colSpan={6} className={`px-4 py-8 text-center ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : campaigns.length > 0 ? (
              campaigns.map((campaign) => {
                const ChannelIcon = CHANNEL_ICONS[campaign.channel] || MessageSquare;
                const statusConfig = STATUS_CONFIG[campaign.status];
                const StatusIcon = statusConfig?.icon || Clock;

                return (
                  <tr key={campaign._id} className={isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"}>
                    <td className="px-4 py-3">
                      <p className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {campaign.name}
                      </p>
                      {campaign.segments?.length > 0 && (
                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Segments: {campaign.segments.join(", ")}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ChannelIcon className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                        <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                          {campaign.channel?.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-center font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {campaign.recipientCount}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles(campaign.status, isDarkMode)}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig?.label || campaign.status}
                      </span>
                    </td>
                    <td className={`px-4 py-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {campaign.status === "scheduled" && campaign.scheduledFor ? (
                        <div>
                          <p className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {dayjs(campaign.scheduledFor).format("MMM D, YYYY")}
                          </p>
                          <p className="text-xs">
                            {dayjs(campaign.scheduledFor).format("h:mm A")}
                          </p>
                        </div>
                      ) : campaign.sentAt ? (
                        <div>
                          <p className="text-sm">{dayjs(campaign.sentAt).fromNow()}</p>
                          <p className="text-xs">{dayjs(campaign.sentAt).format("MMM D, h:mm A")}</p>
                        </div>
                      ) : (
                        <p className="text-sm">{dayjs(campaign.createdAt).fromNow()}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => fetchCampaignDetails(campaign._id)}
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
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className={`px-4 py-8 text-center ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  No campaigns found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className={`flex items-center justify-between px-4 py-3 border-t ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}>
            <div className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Page {pagination.page} of {pagination.pages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchCampaigns(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-3 py-1 text-sm rounded disabled:opacity-50 ${
                  isDarkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => fetchCampaigns(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className={`px-3 py-1 text-sm rounded disabled:opacity-50 ${
                  isDarkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Campaign detail modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`w-full max-w-lg mx-4 rounded-lg shadow-xl ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Campaign Details
              </h3>
              <button
                onClick={() => setSelectedCampaign(null)}
                className={`p-1 rounded-lg ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Name</label>
                <p className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {selectedCampaign.name}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Channel</label>
                  <p className={isDarkMode ? "text-white" : "text-gray-900"}>
                    {selectedCampaign.channel?.toUpperCase()}
                  </p>
                </div>
                <div>
                  <label className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Status</label>
                  <p className={isDarkMode ? "text-white" : "text-gray-900"}>
                    {STATUS_CONFIG[selectedCampaign.status]?.label || selectedCampaign.status}
                  </p>
                </div>
              </div>
              <div className={`grid ${isAdmin ? "grid-cols-3" : "grid-cols-1"} gap-4`}>
                <div>
                  <label className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Recipients</label>
                  <p className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {selectedCampaign.recipientCount}
                  </p>
                </div>
                {isAdmin && (
                <div>
                  <label className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Sent</label>
                  <p className={`font-medium text-green-500`}>
                    {selectedCampaign.sendSucceeded || 0}
                  </p>
                </div>
                )}
                {isAdmin && (
                <div>
                  <label className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Failed</label>
                  <p className={`font-medium text-red-500`}>
                    {selectedCampaign.sendFailed || 0}
                  </p>
                </div>
                )}
              </div>
              {selectedCampaign.segments?.length > 0 && (
                <div>
                  <label className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Segments</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedCampaign.segments.map((seg) => (
                      <span
                        key={seg}
                        className={`px-2 py-1 rounded text-xs ${
                          isDarkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {seg}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedCampaign.customMessage?.body && (
                <div>
                  <label className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Message</label>
                  <div className={`mt-1 p-3 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                    {selectedCampaign.customMessage.title && (
                      <p className={`font-medium mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {selectedCampaign.customMessage.title}
                      </p>
                    )}
                    <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {selectedCampaign.customMessage.body}
                    </p>
                  </div>
                </div>
              )}
              {isAdmin && selectedCampaign.lastError && (
                <div>
                  <label className={`text-sm ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`}>Note: Why some recipients didn't receive</label>
                  <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {formatErrorMessage(selectedCampaign.lastError)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
