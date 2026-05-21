import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { toast } from "sonner";
import api from "../api/config";
import {
  Bell,
  Users,
  MessageSquare,
  Send,
  History,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
} from "lucide-react";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    text: {
      primary: "#ffffff",
    },
  },
});

const columns = [
  { field: "name", headerName: "Name", width: 230 },
  { field: "email", headerName: "Email", width: 230 },
  { field: "phone", headerName: "Phone Number", width: 230 },
];

let rows = [];
const paginationModel = { page: 0, pageSize: 5 };

const CustomNotification = ({ store, onClose }) => {
  // Safety check
  if (!store) {
    return null;
  }

  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { token } = authState;
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [clickedIndex, setClickedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle back navigation
  const handleBack = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleClick = (index) => {
    setClickedIndex(clickedIndex === index ? null : index);
  };

  const handleCheckboxChange = (selected) => {
    setSelectedCustomers(selected);
  };

  const handleSendNotification = async () => {
    if (!title || !body) {
      toast.error("Please enter a title and body for the notification.");
      return;
    }

    const payload = {
      title,
      body,
      userIds: sendToAll ? customers.map((c) => c._id) : selectedCustomers,
      storeId: store._id,
    };

    setLoading(true);
    try {
      await api.post("/store/sendNotifications/multiple", payload, {
        headers: { token },
      });
      toast.success("Notification Sent");
      // Clear form after successful send
      setTitle("");
      setBody("");
      setSelectedCustomers([]);
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.success("Notification Sent");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/store/getCustomers/${store._id}`, {
        headers: { token },
      });

      if (response.data.success) {
        setCustomers(response.data.customers);
        rows = response.data.customers.map((customer) => ({
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        }));
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message, {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationHistory = async () => {
    try {
      const response = await api.get(`/store/notifications/${store._id}`, {
        headers: { token },
      });
      setNotificationHistory(response.data);
    } catch (error) {
      console.error("Error fetching notification history:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchCustomers();
    fetchNotificationHistory();
    setLoading(false);
  }, [token]);

  const filteredRows = rows.filter((row) =>
    row.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`fixed inset-0 bg-black transition-opacity duration-300 ease-out flex items-center justify-end z-50 p-4 ${
        isVisible ? "bg-opacity-50" : "bg-opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`flex gap-3 items-end justify-end w-full transform transition-transform duration-300 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* History Panel */}
        <div
          className={`z-10 rounded-lg max-w-sm w-full max-h-[78vh] flex flex-col shadow-xl border transform transition-transform duration-300 ease-out ${
            historyOpen ? "translate-x-0" : "translate-x-[110%]"
          } ${
            isDarkMode
              ? "bg-gray-800 border-gray-600"
              : "bg-white border-gray-200"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* History Header */}
          <div
            className={`flex items-center justify-between p-6 border-b rounded-t-lg ${
              isDarkMode
                ? "border-gray-600 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              History
            </h3>
            <button
              onClick={() => setHistoryOpen(false)}
              className={`transition-colors ${
                isDarkMode
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* History Content */}
          <div className="p-6 space-y-3 overflow-y-auto flex-1">
            {notificationHistory.length === 0 ? (
              <div className="text-center py-8">
                <Bell
                  className={`h-12 w-12 mx-auto mb-4 ${
                    isDarkMode ? "text-gray-600" : "text-gray-300"
                  }`}
                />
                <p
                  className={`${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  No notifications sent yet
                </p>
              </div>
            ) : (
              [...notificationHistory]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((message, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-gray-50 border-gray-200"
                    }`}
                    onClick={() => handleClick(index)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4
                        className={`font-medium text-sm ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {message.title}
                      </h4>
                      {clickedIndex === index ? (
                        <ChevronUp
                          className={`h-4 w-4 flex-shrink-0 ${
                            isDarkMode ? "text-gray-500" : "text-gray-400"
                          }`}
                        />
                      ) : (
                        <ChevronDown
                          className={`h-4 w-4 flex-shrink-0 ${
                            isDarkMode ? "text-gray-500" : "text-gray-400"
                          }`}
                        />
                      )}
                    </div>

                    {clickedIndex === index && (
                      <div
                        className={`mb-3 p-3 rounded border ${
                          isDarkMode
                            ? "bg-gray-600 border-gray-500"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {message.message}
                        </p>
                      </div>
                    )}

                    <p
                      className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Sent: {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Main Custom Notification Modal */}
        <div
          className={`z-20 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header - Fixed */}
          <div
            className={`flex items-center justify-between p-6 border-b sticky top-0 z-10 rounded-t-lg ${
              isDarkMode
                ? "border-gray-600 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            <h2
              className={`flex gap-2 items-center text-xl font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <Bell className="h-6 w-6" />
              Send Custom Notification
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setHistoryOpen(!historyOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-green-900/30 text-green-400 hover:bg-green-900/50"
                    : "bg-green-50 text-green-600 hover:bg-green-100"
                }`}
              >
                <History className="h-4 w-4" />
                History
              </button>
              <button
                onClick={handleBack}
                className={`transition-colors ${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {loading && (
              <div
                className={`absolute inset-0 bg-opacity-75 flex items-center justify-center z-20 ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <LoadingSpinner />
              </div>
            )}

            <div className="p-6 space-y-6">
              {/* Notification Content */}
              <div>
                <h3
                  className={`flex gap-2 items-center text-lg font-medium mb-4 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <MessageSquare className="h-5 w-5" />
                  Notification Content
                </h3>

                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Notification Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${
                        isDarkMode
                          ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                      }`}
                      placeholder="Enter notification title"
                      required
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Notification Message *
                    </label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 resize-none ${
                        isDarkMode
                          ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                      }`}
                      placeholder="Enter notification message"
                      rows="4"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <h3
                  className={`flex gap-2 items-center text-lg font-medium mb-4 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <Users className="h-5 w-5" />
                  Target Audience
                </h3>

                <div className="space-y-4">
                  <label
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      isDarkMode
                        ? "border-gray-600 hover:bg-gray-800"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={sendToAll}
                      onChange={() => setSendToAll(!sendToAll)}
                      className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500 accent-black"
                    />
                    <div className="flex-1">
                      <span
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Send to All Customers
                      </span>
                      <p
                        className={`text-xs ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        This will send the notification to all registered
                        customers
                      </p>
                    </div>
                  </label>

                  {!sendToAll && (
                    <div
                      className={`border rounded-lg p-4 ${
                        isDarkMode ? "border-gray-600" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Search
                          className={`h-4 w-4 ${
                            isDarkMode ? "text-gray-500" : "text-gray-400"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Select Specific Customers
                        </span>
                      </div>

                      <div
                        className={`border rounded-lg p-4 ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="mb-4">
                          <input
                            type="text"
                            placeholder="Search Customer"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${
                              isDarkMode
                                ? "border-gray-500 bg-gray-600 text-white placeholder-gray-400"
                                : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                            }`}
                          />
                        </div>

                        <div
                          className={`h-96 overflow-y-auto border rounded-md ${
                            isDarkMode ? "border-gray-500" : "border-gray-200"
                          }`}
                        >
                          <table className="w-full table-fixed">
                            <thead
                              className={`sticky top-0 ${
                                isDarkMode ? "bg-gray-600" : "bg-gray-50"
                              }`}
                            >
                              <tr>
                                <th className="w-12 px-2 py-3 text-left">
                                  <input
                                    type="checkbox"
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedCustomers(
                                          filteredRows.map((row) => row.id)
                                        );
                                      } else {
                                        setSelectedCustomers([]);
                                      }
                                    }}
                                    checked={
                                      selectedCustomers.length ===
                                        filteredRows.length &&
                                      filteredRows.length > 0
                                    }
                                    className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500 accent-black"
                                  />
                                </th>
                                <th
                                  className={`w-1/3 px-2 py-3 text-left text-sm font-medium truncate ${
                                    isDarkMode ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  Name
                                </th>
                                <th
                                  className={`w-1/3 px-2 py-3 text-left text-sm font-medium truncate ${
                                    isDarkMode ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  Email
                                </th>
                                <th
                                  className={`w-1/3 px-2 py-3 text-left text-sm font-medium truncate ${
                                    isDarkMode ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  Phone
                                </th>
                              </tr>
                            </thead>
                            <tbody
                              className={`divide-y ${
                                isDarkMode
                                  ? "bg-gray-700 divide-gray-600"
                                  : "bg-white divide-gray-200"
                              }`}
                            >
                              {filteredRows.map((row, index) => (
                                <tr
                                  key={row.id}
                                  className={`${
                                    isDarkMode
                                      ? "hover:bg-gray-600"
                                      : "hover:bg-gray-50"
                                  }`}
                                >
                                  <td className="px-2 py-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedCustomers.includes(
                                        row.id
                                      )}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedCustomers([
                                            ...selectedCustomers,
                                            row.id,
                                          ]);
                                        } else {
                                          setSelectedCustomers(
                                            selectedCustomers.filter(
                                              (id) => id !== row.id
                                            )
                                          );
                                        }
                                      }}
                                      className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500 accent-black"
                                    />
                                  </td>
                                  <td
                                    className={`px-2 py-3 text-sm truncate ${
                                      isDarkMode
                                        ? "text-gray-300"
                                        : "text-gray-900"
                                    }`}
                                    title={row.name}
                                  >
                                    {row.name}
                                  </td>
                                  <td
                                    className={`px-2 py-3 text-sm truncate ${
                                      isDarkMode
                                        ? "text-gray-300"
                                        : "text-gray-900"
                                    }`}
                                    title={row.email}
                                  >
                                    {row.email}
                                  </td>
                                  <td
                                    className={`px-2 py-3 text-sm truncate ${
                                      isDarkMode
                                        ? "text-gray-300"
                                        : "text-gray-900"
                                    }`}
                                    title={row.phone}
                                  >
                                    {row.phone}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {filteredRows.length === 0 && (
                            <div
                              className={`p-8 text-center ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              No customers found
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedCustomers.length > 0 && (
                        <div
                          className={`mt-3 p-3 rounded-md ${
                            isDarkMode
                              ? "bg-green-900/30 border border-green-700"
                              : "bg-green-50"
                          }`}
                        >
                          <p
                            className={`text-sm ${
                              isDarkMode ? "text-green-300" : "text-green-800"
                            }`}
                          >
                            {selectedCustomers.length} customer
                            {selectedCustomers.length > 1 ? "s" : ""} selected
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div
                className={`flex justify-end space-x-3 pt-6 border-t ${
                  isDarkMode ? "border-gray-600" : "border-gray-200"
                }`}
              >
                <button
                  type="button"
                  onClick={handleBack}
                  className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors ${
                    isDarkMode
                      ? "border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNotification}
                  disabled={loading || !title || !body}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                  {loading ? "Sending..." : "Send Notification"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomNotification;
