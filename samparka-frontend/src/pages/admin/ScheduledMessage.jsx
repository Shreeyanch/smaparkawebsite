import React, { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import api from "../../api/config";
import { toast } from "sonner";
import { EllipsisVertical } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ScheduledMessage = () => {
  const [messages, setMessages] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentFee, setCurrentFee] = useState();
  const [fee, setFee] = useState();
  const { authState } = useAuth();
  const { token } = authState;
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const messageStatus = queryParams.get("status");

  const allStatus = [
    { name: "All", id: "all" },
    { name: "SUBMITTED", id: "submitted" },
    { name: "PROCESSING", id: "processing" },
    { name: "CONFIRMED", id: "confirmed" },
    { name: "SENT", id: "sent" },
  ];

  // Fetch Messages
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await api.get("/admin/getMessages", {
          headers: { token },
        });
        if (response.data.success) {
          setMessages(response.data.messages);
        } else {
          toast.error(response.data.message, { duration: 2000 });
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch scheduled messages.", {
          duration: 2000,
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchSMSFee = async () => {
      try {
        const response = await api.get("/user/getSMSFee", {
          headers: { token },
        });
        if (response.data.success) {
          setCurrentFee(response.data.fee);
        } else {
          toast.error(response.data.message, { duration: 2000 });
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch scheduled messages.", {
          duration: 2000,
        });
      }
    };

    fetchMessages();
    fetchSMSFee();
  }, [token]);

  const toggleDropdown = (messageId) => {
    setDropdownOpen((prev) => (prev === messageId ? null : messageId));
  };

  // filter messages
  const messagesToRender =
    !messageStatus || messageStatus === "all"
      ? messages
      : messages.filter((message) => message.status === messageStatus);

  // change Message Status
  const handleStatusChange = async (messageId, status) => {
    setLoading(true);
    try {
      const response = await api.put(
        "/admin/changeMessageStatus",
        { messageId, status },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message, {
          duration: 2000,

          onAutoClose: () => {
            navigate(`/work?status=${status}`);
            window.location.reload();
          },
        });
      }
    } catch (error) {
      toast.error("Error Changing Status", {
        duration: 2000,
      });
    } finally {
      setLoading(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put(
        "/admin/changeSMSFee",
        { fee },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message, {
          duration: 2000,

          onAutoClose: () => window.location.reload(),
        });
      } else {
        toast.error(response.data.message, {
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error("Failed to change SMS fee.", {
        duration: 2000,
      });
    } finally {
      setLoading(true);
    }
  };

  return (
    <div className="mx-auto mt-10 p-4 sm:ml-64 bg-stone-800 min-h-screen mr-6 mt-7 rounded rounded-xl">
      {loading && <LoadingSpinner />}
      <div className="mb-6 flex justify-between">
        <h2 className="text-2xl font-bold text-gray-200">Scheduled Messages</h2>
        <div>
          <p className="text-sm text-gray-200 font-bold">
            Current SMS Fee: NRP.{currentFee}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-sm text-white bg-green-800 rounded-md hover:bg-green-900"
          >
            Change SMS Fee
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex space-x-4 mb-4">
        {allStatus.map((status) => (
          <button
            onClick={() => navigate(`/sms?status=${status.id}`)}
            key={status.id}
            className={`p-2 px-4 rounded-md text-sm ${
              messageStatus
                ? status.id == messageStatus
                  ? "bg-teal-700 text-white"
                  : "bg-gray-200 text-gray-700"
                : status.id == "all"
                ? "bg-teal-700 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {status.name}
          </button>
        ))}
      </div>

      {/* Main Message Section */}
      {messages.length > 0 ? (
        <ul className="space-y-4">
          {messagesToRender.map((message) => (
            <li
              key={message._id}
              className="bg-stone-900 p-4 rounded-md shadow-md"
            >
              {/* Title */}
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold text-gray-300">
                  {message.title}
                </p>
                <div className="relative flex justify-end">
                  <EllipsisVertical
                    className="h-6 w-6 text-gray-500 cursor-pointer"
                    onClick={() => toggleDropdown(message._id)}
                  />
                  {dropdownOpen === message._id && (
                    <div className="absolute right-0 mt-5 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {allStatus
                        .filter(
                          (status) =>
                            status.id !== "all" && status.id !== message.status
                        )
                        .map((status) => (
                          <button
                            key={status.id}
                            onClick={() =>
                              handleStatusChange(message._id, status.id)
                            }
                            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-200 flex items-center"
                          >
                            {status.name}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Message and Status */}
              <div className="mt-2 text-gray-400 mb-2 flex justify-between items-center">
                <span className="mr-10">
                  <strong>Message:</strong> {message.message}
                </span>
                <span className="text-sm px-3 py-1 rounded-full bg-red-500 text-white">
                  {message.status.charAt(0).toUpperCase() +
                    message.status.slice(1)}
                </span>
              </div>

              {/* Created and Scheduled Dates */}
              <p className="text-sm text-gray-400">
                Created Date:{" "}
                <span className="font-medium">
                  {new Date(message.createdAt).toLocaleString()}
                </span>
              </p>
              <p className="text-sm text-gray-400">
                Scheduled Date:{" "}
                <span className="font-medium">
                  {new Date(message.dateandtime).toLocaleString()}
                </span>
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-200 text-center">
          No scheduled messages found.
        </p>
      )}

      {/* Modal for Changing SMS Fee */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Create New User</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Enter New SMS Fee
                </label>
                <input
                  type="text"
                  name="fee"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-green-200"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledMessage;
