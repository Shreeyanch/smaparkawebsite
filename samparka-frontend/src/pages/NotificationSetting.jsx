import React, { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Star,
  Gift,
  Trophy,
  Calendar,
  UserCheck,
  Cake,
  ArrowLeft,
  ShoppingBag,
  Clock,
  Zap
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import AfterLogin from "../components/notificationSettingComponents/OnBirthday";
import AfterPointEarned from "../components/notificationSettingComponents/AfterPointEarned";
import AfterRewardRedeemed from "../components/notificationSettingComponents/AfterRewardRedeemed";
import AfterRewardClaimed from "../components/notificationSettingComponents/AfterRewardClaimed";
import AfterRewardRedeemed_Admin from "../components/notificationSettingComponents/AfterRewardRedeemed_Admin";
import { toast } from "sonner";
import config from "../api/config";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AfterCreateCustomer from "../components/notificationSettingComponents/AfterCreateCustomer";
import OnBirthday from "../components/notificationSettingComponents/OnBirthday";
import AfterReservationConfirm from "../components/notificationSettingComponents/AfterReservationConfirm";
import AfterReservation_Admin from "../components/notificationSettingComponents/AfterReservation_Admin";
import AfterPurchase_Admin from "../components/notificationSettingComponents/AfterPurchase_Admin";
import OnPointExpire from "../components/notificationSettingComponents/OnPointExpire";

const NotificationSetting = ({ store: propStore, setLoading: propSetLoading }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const store = propStore || location.state?.store;
  const [localLoading, setLocalLoading] = useState(false);
  const [notifications, setNotifications] = useState({});
  const [initializingAll, setInitializingAll] = useState(false);
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;
  const { isDarkMode } = useTheme();
  const queryParams = new URLSearchParams(location.search);
  let status = queryParams.get("status");
  !status && (status = "afterPointEarned");

  // Use the passed setLoading if available, otherwise use local loading
  const setLoading = propSetLoading || setLocalLoading;
  const loading = propSetLoading ? false : localLoading;

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      try {
        const response = await config.get(`/store/getMessage/${store._id}`, {
          headers: { token },
        });
        if (response.data.success) {
          setNotifications(response.data.mailSMS);
        } else {
          toast.error(response.data.message, {
            duration: 2000,
          });
        }
      } catch (error) {
        toast.error(error.message, {
          duration: 2000,
        });
      } finally {
        setLoading(false);
      }
    };
    getMessages();
  }, []);

  const handleInitializeAll = async () => {
    setInitializingAll(true);
    try {
      const response = await config.post(
        `/store/initializeAllNotifications`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message, { duration: 3000 });
      } else {
        toast.error(response.data.message, { duration: 2000 });
      }
    } catch (error) {
      toast.error(error.message, { duration: 2000 });
    } finally {
      setInitializingAll(false);
    }
  };

  return (
    <div className={`min-h-screen ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* {!propSetLoading && loading && <LoadingSpinner />} */}
      
      {/* Header */}
      <div className={`border-b px-6 py-4 mb-8 ${
        isDarkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Notification Settings</h1>
            <p className={`mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Store: {store?.name}</p>
          </div>
          <button
            onClick={handleInitializeAll}
            disabled={initializingAll}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Automatically configure push notifications with default templates for all your stores"
          >
            <Zap size={16} />
            {initializingAll ? "Initializing..." : "Auto-Configure All Stores"}
          </button>
        </div>
      </div>

      <div className="px-6">
        {/* Navigation Tabs */}
        <div className={`rounded-lg border p-6 mb-8 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Notification Types</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() =>
                navigate(
                  `${location.pathname}?setting=notification&status=afterPointEarned`,
                  {
                    state: { store },
                  }
                )
              }
              className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-all border-2 ${
                status === "afterPointEarned"
                  ? `${isDarkMode ? 'bg-green-900/50 text-green-300 border-green-600' : 'bg-green-50 text-green-700 border-green-200'} shadow-sm`
                  : `${isDarkMode ? 'text-gray-400 border-gray-600 hover:text-gray-300 hover:bg-gray-800 hover:border-gray-500' : 'text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300'}`
              }`}
            >
              <Star size={20} className={status === "afterPointEarned" ? (isDarkMode ? "text-green-400" : "text-green-600") : (isDarkMode ? "text-gray-500" : "text-gray-500")} />
              <span className="text-center leading-tight">After Point<br />Earned</span>
            </button>
            
            <button
              onClick={() =>
                navigate(
                  `${location.pathname}?setting=notification&status=afterRewardRedeemed`,
                  {
                    state: { store },
                  }
                )
              }
              className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-all border-2 ${
                status === "afterRewardRedeemed"
                  ? `${isDarkMode ? 'bg-green-900/50 text-green-300 border-green-600' : 'bg-green-50 text-green-700 border-green-200'} shadow-sm`
                  : `${isDarkMode ? 'text-gray-400 border-gray-600 hover:text-gray-300 hover:bg-gray-800 hover:border-gray-500' : 'text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300'}`
              }`}
            >
              <Gift size={20} className={status === "afterRewardRedeemed" ? (isDarkMode ? "text-green-400" : "text-green-600") : (isDarkMode ? "text-gray-500" : "text-gray-500")} />
              <span className="text-center leading-tight">After Reward<br />Redeemed</span>
            </button>
            
            <button
              onClick={() =>
                navigate(
                  `${location.pathname}?setting=notification&status=afterRewardClaimed`,
                  {
                    state: { store },
                  }
                )
              }
              className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-all border-2 ${
                status === "afterRewardClaimed"
                  ? `${isDarkMode ? 'bg-green-900/50 text-green-300 border-green-600' : 'bg-green-50 text-green-700 border-green-200'} shadow-sm`
                  : `${isDarkMode ? 'text-gray-400 border-gray-600 hover:text-gray-300 hover:bg-gray-800 hover:border-gray-500' : 'text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300'}`
              }`}
            >
              <Trophy size={20} className={status === "afterRewardClaimed" ? (isDarkMode ? "text-green-400" : "text-green-600") : (isDarkMode ? "text-gray-500" : "text-gray-500")} />
              <span className="text-center leading-tight">After Reward<br />Claimed</span>
            </button>
            
            <button
              onClick={() =>
                navigate(
                  `${location.pathname}?setting=notification&status=afterReservation_Admin`,
                  {
                    state: { store },
                  }
                )
              }
              className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-all border-2 ${
                status === "afterReservation_Admin"
                  ? `${isDarkMode ? 'bg-green-900/50 text-green-300 border-green-600' : 'bg-green-50 text-green-700 border-green-200'} shadow-sm`
                  : `${isDarkMode ? 'text-gray-400 border-gray-600 hover:text-gray-300 hover:bg-gray-800 hover:border-gray-500' : 'text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300'}`
              }`}
            >
              <Calendar size={20} className={status === "afterReservation_Admin" ? (isDarkMode ? "text-green-400" : "text-green-600") : (isDarkMode ? "text-gray-500" : "text-gray-500")} />
              <span className="text-center leading-tight">Reservation<br />Admin</span>
            </button>
            
            <button
              onClick={() =>
                navigate(
                  `${location.pathname}?setting=notification&status=afterReservationConfirm`,
                  {
                    state: { store },
                  }
                )
              }
              className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-all border-2 ${
                status === "afterReservationConfirm"
                  ? `${isDarkMode ? 'bg-green-900/50 text-green-300 border-green-600' : 'bg-green-50 text-green-700 border-green-200'} shadow-sm`
                  : `${isDarkMode ? 'text-gray-400 border-gray-600 hover:text-gray-300 hover:bg-gray-800 hover:border-gray-500' : 'text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300'}`
              }`}
            >
              <UserCheck size={20} className={status === "afterReservationConfirm" ? (isDarkMode ? "text-green-400" : "text-green-600") : (isDarkMode ? "text-gray-500" : "text-gray-500")} />
              <span className="text-center leading-tight">Reservation<br />Confirmation</span>
            </button>

            <button
              onClick={() =>
                navigate(
                  `${location.pathname}?setting=notification&status=afterPurchase_Admin`,
                  {
                    state: { store },
                  }
                )
              }
              className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-all border-2 ${
                status === "afterPurchase_Admin"
                  ? `${isDarkMode ? 'bg-green-900/50 text-green-300 border-green-600' : 'bg-green-50 text-green-700 border-green-200'} shadow-sm`
                  : `${isDarkMode ? 'text-gray-400 border-gray-600 hover:text-gray-300 hover:bg-gray-800 hover:border-gray-500' : 'text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300'}`
              }`}
            >
              <ShoppingBag size={20} className={status === "afterPurchase_Admin" ? (isDarkMode ? "text-green-400" : "text-green-600") : (isDarkMode ? "text-gray-500" : "text-gray-500")} />
              <span className="text-center leading-tight">Order Purchase<br />Admin</span>
            </button>
            
            <button
              onClick={() =>
                navigate(
                  `${location.pathname}?setting=notification&status=onBirthday`,
                  {
                    state: { store },
                  }
                )
              }
              className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-all border-2 ${
                status === "onBirthday"
                  ? `${isDarkMode ? 'bg-green-900/50 text-green-300 border-green-600' : 'bg-green-50 text-green-700 border-green-200'} shadow-sm`
                  : `${isDarkMode ? 'text-gray-400 border-gray-600 hover:text-gray-300 hover:bg-gray-800 hover:border-gray-500' : 'text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300'}`
              }`}
            >
              <Cake size={20} className={status === "onBirthday" ? (isDarkMode ? "text-green-400" : "text-green-600") : (isDarkMode ? "text-gray-500" : "text-gray-500")} />
              <span className="text-center leading-tight">Birthday<br />Notification</span>
            </button>

            <button
              onClick={() =>
                navigate(
                  `${location.pathname}?setting=notification&status=onPointExpire`,
                  {
                    state: { store },
                  }
                )
              }
              className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-all border-2 ${
                status === "onPointExpire"
                  ? `${isDarkMode ? 'bg-green-900/50 text-green-300 border-green-600' : 'bg-green-50 text-green-700 border-green-200'} shadow-sm`
                  : `${isDarkMode ? 'text-gray-400 border-gray-600 hover:text-gray-300 hover:bg-gray-800 hover:border-gray-500' : 'text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300'}`
              }`}
            >
              <Clock size={20} className={status === "onPointExpire" ? (isDarkMode ? "text-green-400" : "text-green-600") : (isDarkMode ? "text-gray-500" : "text-gray-500")} />
              <span className="text-center leading-tight">Point Expiry<br />Notification</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Short Code Section - Show first on mobile */}
          <div className="lg:order-2 lg:w-80">
            <div className={`border rounded-lg p-4 shadow-sm lg:sticky lg:top-4 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Short Codes</h3>
              <div className="space-y-3 text-sm">
                <div className={`flex justify-between items-center py-2 border-b ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-100'
                }`}>
                  <span className={`font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Store Name</span>
                  <code className={`px-2 py-1 rounded text-xs ${
                    isDarkMode 
                      ? 'bg-green-900/50 text-green-300' 
                      : 'bg-green-50 text-green-600'
                  }`}>[store_name]</code>
                </div>
                <div className={`flex justify-between items-center py-2 border-b ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-100'
                }`}>
                  <span className={`font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Store Link</span>
                  <code className={`px-2 py-1 rounded text-xs ${
                    isDarkMode 
                      ? 'bg-green-900/50 text-green-300' 
                      : 'bg-green-50 text-green-600'
                  }`}>[store_link]</code>
                </div>
                <div className={`flex justify-between items-center py-2 border-b ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-100'
                }`}>
                  <span className={`font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Customer Name</span>
                  <code className={`px-2 py-1 rounded text-xs ${
                    isDarkMode 
                      ? 'bg-green-900/50 text-green-300' 
                      : 'bg-green-50 text-green-600'
                  }`}>[customer_name]</code>
                </div>
                <div className={`flex justify-between items-center py-2 border-b ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-100'
                }`}>
                  <span className={`font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Customer Email</span>
                  <code className={`px-2 py-1 rounded text-xs ${
                    isDarkMode 
                      ? 'bg-green-900/50 text-green-300' 
                      : 'bg-green-50 text-green-600'
                  }`}>[customer_email]</code>
                </div>
                <div className={`flex justify-between items-center py-2 border-b ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-100'
                }`}>
                  <span className={`font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Customer Phone</span>
                  <code className={`px-2 py-1 rounded text-xs ${
                    isDarkMode 
                      ? 'bg-green-900/50 text-green-300' 
                      : 'bg-green-50 text-green-600'
                  }`}>[customer_phone]</code>
                </div>
                {status == "afterPointEarned" && (
                  <div className={`flex justify-between items-center py-2 border-b ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-100'
                  }`}>
                    <span className={`font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Points</span>
                    <code className={`px-2 py-1 rounded text-xs ${
                      isDarkMode 
                        ? 'bg-green-900/50 text-green-300' 
                        : 'bg-green-50 text-green-600'
                    }`}>[points_earned]</code>
                  </div>
                )}
                {(status == "afterRewardRedeemed" ||
                  status == "afterRewardClaimed" ||
                  status == "afterRewardRedeemed_admin") && (
                  <div className="flex justify-between items-center py-2">
                    <span className={`font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Reward Name</span>
                    <code className={`px-2 py-1 rounded text-xs ${
                      isDarkMode 
                        ? 'bg-green-900/50 text-green-300' 
                        : 'bg-green-50 text-green-600'
                    }`}>[reward_name]</code>
                  </div>
                )}
                {status == "onPointExpire" && (
                  <div className={`flex justify-between items-center py-2 border-b ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-100'
                  }`}>
                    <span className={`font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Days Remaining</span>
                    <code className={`px-2 py-1 rounded text-xs ${
                      isDarkMode 
                        ? 'bg-green-900/50 text-green-300' 
                        : 'bg-green-50 text-green-600'
                    }`}>[days_remaining]</code>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:order-1 flex-1">
            {/* {status === "afterLogin" && notifications.notificationAfterLogin && (
              <AfterLogin
                store={store}
                status={status}
                notifications={notifications.notificationAfterLogin}
              />
            )}
            {status === "afterCreateCustomer" &&
              notifications.notificationAfterCreateCustomer && (
                <AfterCreateCustomer
                  store={store}
                  status={status}
                  notifications={notifications.notificationAfterCreateCustomer}
                />
              )} */}
            {status === "onBirthday" && notifications.notificationOnBirthday && (
              <OnBirthday
                store={store}
                status={status}
                notifications={notifications.notificationOnBirthday}
              />
            )}
            {status === "afterPointEarned" &&
              notifications.notificationAfterPointEarned && (
                <AfterPointEarned
                  store={store}
                  status={status}
                  notifications={notifications.notificationAfterPointEarned}
                />
              )}
            {status === "afterRewardRedeemed" &&
              notifications.notificationAfterRewardRedeemed && (
                <AfterRewardRedeemed
                  store={store}
                  status={status}
                  notifications={notifications.notificationAfterRewardRedeemed}
                />
              )}
            {status === "afterRewardClaimed" &&
              notifications.notificationAfterRewardClaimed && (
                <AfterRewardClaimed
                  store={store}
                  status={status}
                  notifications={notifications.notificationAfterRewardClaimed}
                />
              )}
            {/* {status === "afterRewardRedeemed_admin" &&
              notifications.notificationAfterLogin && (
                <AfterRewardRedeemed_Admin
                  store={store}
                  status={status}
                  notifications={
                    notifications.notificationAfterRewardRedeemed_Admin
                  }
                />
              )} */}

            {status === "afterReservationConfirm" &&
              notifications.notificationAfterReservationConfirm && (
                <AfterReservationConfirm
                  store={store}
                  status={status}
                  notifications={notifications.notificationAfterReservationConfirm}
                />
              )}

              {status === "afterReservation_Admin" &&
              notifications.notificationAfterReservation_Admin && (
                <AfterReservation_Admin
                  store={store}
                  status={status}
                  notifications={notifications.notificationAfterReservation_Admin}
                />
              )}
              {status === "afterPurchase_Admin" &&
              notifications.notificationAfterPurchase_Admin && (
                <AfterPurchase_Admin
                  store={store}
                  status={status}
                  notifications={notifications.notificationAfterPurchase_Admin}
                />
              )}
              {status === "onPointExpire" &&
              notifications.notificationOnPointExpire && (
                <OnPointExpire
                  store={store}
                  status={status}
                  notifications={notifications.notificationOnPointExpire}
                />
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSetting;
