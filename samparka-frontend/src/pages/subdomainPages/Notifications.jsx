import React, { useCallback, useEffect, useState } from "react";
import { CheckCircle, Bell } from "lucide-react"; // optional, for icons
import { useNavigate } from "react-router-dom";
import { useStoreAuth } from "../../context/StoreAuthContext";
import api from "../../api/config";
import PoweredBySamparkaFooter from "../../components/PoweredBySamparkaFooter";

const NotificationsPage = ({ showPoweredBy = false }) => {
  const { authState, updateAuth, logout } = useStoreAuth();
  const { userInfo: user, token } = authState;
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) {
      navigate("/register");
    }
  }, [user, token, navigate]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get(
          `/customer/customer-notifications/${user._id}`,
          { headers: { token } }
        );
        // const data = await response.json();
        setNotifications(response.data);
      } catch (err) {
        console.error("Error fetching customer notifications:", err);
      }
    };

    fetchNotifications();
  }, [token, user._id]);

  const onBackClick = useCallback(() => {
    navigate("/profile");
  }, []);

  // Highlight unread notifications
  //   const unreadCount = notifications.filter((n) => !n.read).length;
  const unreadCount = 2;

  // 🟢 Mark all unread as read when page opens
  useEffect(() => {
    const markAllAsRead = async () => {
      const unread = notifications.filter((n) => !n.read);
      if (unread.length === 0) return;

      // Update frontend state immediately
      setNotifications((prev) =>
        prev.map((n) =>
          n.read ? n : { ...n, read: true, readAt: new Date().toISOString() }
        )
      );

      // Update each unread notification on backend
      try {
        await Promise.all(
          unread.map((n) =>
            api.put(
              `/customer/mark-notification-read/${n._id}/${user._id}`,
              {},
              { headers: { token } }
            )
          )
        );
      } catch (error) {
        console.error("Error marking notifications as read:", error);
      }
    };

    if (notifications.length > 0) {
      markAllAsRead();
    }
  }, [notifications, user._id, token]);

  // 🟢 Mark single notification as read when clicked
  const handleMarkAsRead = async (id) => {
    // Update frontend state instantly
    setNotifications((prev) =>
      prev.map((n) =>
        n._id === id
          ? { ...n, read: true, readAt: new Date().toISOString() }
          : n
      )
    );

    // Call backend
    try {
      await api.put(
        `/customer/mark-notification-read/${id}/${user._id}`,
        {},
        { headers: { token } }
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[480px] bg-white min-h-screen flex flex-col relative">
        {/* Header Section */}
        <div className="flex-none px-5 pt-8 pb-4">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={onBackClick}
              className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <svg
                className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Page Title */}
            <h1 className="text-base sm:text-sm font-bold text-gray-900">
              Notifications
            </h1>

            {/* Empty space for symmetry */}
            <div className="w-8 h-8 sm:w-7 sm:h-7"></div>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              No notifications yet.
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleMarkAsRead(n._id)}
                className={`p-4 mt-8 mx-8 rounded-lg border transition-colors cursor-pointer ${
                  n.read
                    ? "bg-white border-gray-100 hover:bg-gray-50"
                    : "bg-green-50 border-green-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 flex-1">
                      {n.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {n.read ? (
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                  ) : (
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full mt-1.5" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      {showPoweredBy && <PoweredBySamparkaFooter />}

      </div>
    </div>
  );
};

export default NotificationsPage;
