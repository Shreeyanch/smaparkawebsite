import React, { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useTheme } from "../context/ThemeContext";
import {
  UserPlus,
  UserCheck,
  Star,
  Gift,
  Trophy,
  Calendar,
  Users,
  Cake,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import AfterLogin from "../components/smsSettingComponents/OnBirthday";
import AfterPointEarned from "../components/smsSettingComponents/AfterPointEarned";
import AfterRewardClaimed from "../components/smsSettingComponents/AfterRewardClaimed";
import AfterRewardRedeemed from "../components/smsSettingComponents/AfterRewardRedeemed";
import AfterRewardRedeemed_Admin from "../components/smsSettingComponents/AfterRewardRedeemed_Admin";
import { toast } from "sonner";
import config from "../api/config";
import { useAuth } from "../context/AuthContext";
import AfterCreateCustomer from "../components/smsSettingComponents/AfterCreateCustomer";
import OnBirthday from "../components/smsSettingComponents/OnBirthday";
import AfterReservationConfirm from "../components/smsSettingComponents/AfterReservationConfirm";
import AfterReservation_Admin from "../components/smsSettingComponents/AfterReservation_Admin";
import AfterPurchase_Admin from "../components/smsSettingComponents/AfterPurchase_Admin";

const SMSSetting = ({ store: propStore, setLoading: propSetLoading }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const store = propStore || location.state?.store;
  if (!store) {
    toast.error("Store not found", {
      duration: 1000,
      onAutoClose: () => {
        navigate("/store");
      },
    });
    return null;
  }
  // Only check for SMS token when not used in modal (when propStore is not provided)
  if (!propStore && (!store.smsToken || store.smsToken === "")) {
    toast.error("SMS Token not found", {
      duration: 1000,
      onAutoClose: () => {
        navigate(-1);
      },
    });
    return null;
  }
  const [localLoading, setLocalLoading] = useState(false);
  const [smsMessage, setSmsMessage] = useState({});
  const { isDarkMode } = useTheme();
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;
  const queryParams = new URLSearchParams(location.search);
  let status = queryParams.get("status");
  !status && (status = "afterLogin");

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
          setSmsMessage(response.data.mailSMS);
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

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* {!propSetLoading && loading && <LoadingSpinner />} */}

      {/* Header */}
      <div
        className={`border-b px-6 py-4 mb-8 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center gap-4">
          <div>
            <h1
              className={`text-2xl font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              SMS Settings
            </h1>
            <p
              className={`mt-1 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Store: {store?.name}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6">
        {/* Navigation Tabs */}
        <div
          className={`rounded-lg border p-6 mb-8 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h2
            className={`text-lg font-semibold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            SMS Templates
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() =>
                navigate(`${location.pathname}?setting=sms&status=afterLogin`, {
                  state: { store },
                })
              }
              className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-all border-2 ${
                status === "afterLogin"
                  ? `${
                      isDarkMode
                        ? "bg-green-900/50 text-green-300 border-green-600"
                        : "bg-green-50 text-green-700 border-green-200"
                    } shadow-sm`
                  : `${
                      isDarkMode
                        ? "text-gray-400 border-gray-600 hover:text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                        : "text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300"
                    }`
              }`}
            >
              <UserPlus
                size={20}
                className={
                  status === "afterLogin"
                    ? isDarkMode
                      ? "text-green-400"
                      : "text-green-600"
                    : isDarkMode
                    ? "text-gray-500"
                    : "text-gray-500"
                }
              />
              <span className="text-center leading-tight">
                After User's
                <br />
                First Login
              </span>
            </button>

            <button
              onClick={() =>
                navigate(
                  `${location.pathname}?setting=sms&status=afterCreateCustomer`,
                  {
                    state: { store },
                  }
                )
              }
              className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-all border-2 ${
                status === "afterCreateCustomer"
                  ? `${
                      isDarkMode
                        ? "bg-green-900/50 text-green-300 border-green-600"
                        : "bg-green-50 text-green-700 border-green-200"
                    } shadow-sm`
                  : `${
                      isDarkMode
                        ? "text-gray-400 border-gray-600 hover:text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                        : "text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300"
                    }`
              }`}
            >
              <Users
                size={20}
                className={
                  status === "afterCreateCustomer"
                    ? isDarkMode
                      ? "text-green-400"
                      : "text-green-600"
                    : isDarkMode
                    ? "text-gray-500"
                    : "text-gray-500"
                }
              />
              <span className="text-center leading-tight">
                After Creating
                <br />
                User Manually
              </span>
            </button>

            <button
              onClick={() =>
                navigate(
                  `${location.pathname}?setting=sms&status=afterPointEarned`,
                  {
                    state: { store },
                  }
                )
              }
              className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-all border-2 ${
                status === "afterPointEarned"
                  ? `${
                      isDarkMode
                        ? "bg-green-900/50 text-green-300 border-green-600"
                        : "bg-green-50 text-green-700 border-green-200"
                    } shadow-sm`
                  : `${
                      isDarkMode
                        ? "text-gray-400 border-gray-600 hover:text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                        : "text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300"
                    }`
              }`}
            >
              <Star
                size={20}
                className={
                  status === "afterPointEarned"
                    ? isDarkMode
                      ? "text-green-400"
                      : "text-green-600"
                    : isDarkMode
                    ? "text-gray-500"
                    : "text-gray-500"
                }
              />
              <span className="text-center leading-tight">
                After Point
                <br />
                Earned
              </span>
            </button>

            <button
              onClick={() =>
                navigate(
                  `${location.pathname}?setting=sms&status=afterRewardRedeemed`,
                  {
                    state: { store },
                  }
                )
              }
              className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-all border-2 ${
                status === "afterRewardRedeemed"
                  ? `${
                      isDarkMode
                        ? "bg-green-900/50 text-green-300 border-green-600"
                        : "bg-green-50 text-green-700 border-green-200"
                    } shadow-sm`
                  : `${
                      isDarkMode
                        ? "text-gray-400 border-gray-600 hover:text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                        : "text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300"
                    }`
              }`}
            >
              <Gift
                size={20}
                className={
                  status === "afterRewardRedeemed"
                    ? isDarkMode
                      ? "text-green-400"
                      : "text-green-600"
                    : isDarkMode
                    ? "text-gray-500"
                    : "text-gray-500"
                }
              />
              <span className="text-center leading-tight">
                After Reward
                <br />
                Redeemed
              </span>
            </button>

            <button
              onClick={() =>
                navigate(
                  `${location.pathname}?setting=sms&status=afterRewardRedeemed_admin`,
                  {
                    state: { store },
                  }
                )
              }
              className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-all border-2 ${
                status === "afterRewardRedeemed_admin"
                  ? `${
                      isDarkMode
                        ? "bg-green-900/50 text-green-300 border-green-600"
                        : "bg-green-50 text-green-700 border-green-200"
                    } shadow-sm`
                  : `${
                      isDarkMode
                        ? "text-gray-400 border-gray-600 hover:text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                        : "text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300"
                    }`
              }`}
            >
              <Gift
                size={20}
                className={
                  status === "afterRewardRedeemed_admin"
                    ? isDarkMode
                      ? "text-green-400"
                      : "text-green-600"
                    : isDarkMode
                    ? "text-gray-500"
                    : "text-gray-500"
                }
              />
              <span className="text-center leading-tight">
                Reward Redeemed
                <br />
                Admin
              </span>
            </button>

            <button
              onClick={() =>
                navigate(
                  `${location.pathname}?setting=sms&status=afterRewardClaimed`,
                  {
                    state: { store },
                  }
                )
              }
              className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-all border-2 ${
                status === "afterRewardClaimed"
                  ? `${
                      isDarkMode
                        ? "bg-green-900/50 text-green-300 border-green-600"
                        : "bg-green-50 text-green-700 border-green-200"
                    } shadow-sm`
                  : `${
                      isDarkMode
                        ? "text-gray-400 border-gray-600 hover:text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                        : "text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300"
                    }`
              }`}
            >
              <Trophy
                size={20}
                className={
                  status === "afterRewardClaimed"
                    ? isDarkMode
                      ? "text-green-400"
                      : "text-green-600"
                    : isDarkMode
                    ? "text-gray-500"
                    : "text-gray-500"
                }
              />
              <span className="text-center leading-tight">
                After Reward
                <br />
                Claimed
              </span>
            </button>

            <button
              onClick={() =>
                navigate(
                  `${location.pathname}?setting=sms&status=afterReservation_Admin`,
                  {
                    state: { store },
                  }
                )
              }
              className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-all border-2 ${
                status === "afterReservation_Admin"
                  ? `${
                      isDarkMode
                        ? "bg-green-900/50 text-green-300 border-green-600"
                        : "bg-green-50 text-green-700 border-green-200"
                    } shadow-sm`
                  : `${
                      isDarkMode
                        ? "text-gray-400 border-gray-600 hover:text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                        : "text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300"
                    }`
              }`}
            >
              <Calendar
                size={20}
                className={
                  status === "afterReservation_Admin"
                    ? isDarkMode
                      ? "text-green-400"
                      : "text-green-600"
                    : isDarkMode
                    ? "text-gray-500"
                    : "text-gray-500"
                }
              />
              <span className="text-center leading-tight">
                Reservation
                <br />
                Admin
              </span>
            </button>

            <button
              onClick={() =>
                navigate(
                  `${location.pathname}?setting=sms&status=afterReservationConfirm`,
                  {
                    state: { store },
                  }
                )
              }
              className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-all border-2 ${
                status === "afterReservationConfirm"
                  ? `${
                      isDarkMode
                        ? "bg-green-900/50 text-green-300 border-green-600"
                        : "bg-green-50 text-green-700 border-green-200"
                    } shadow-sm`
                  : `${
                      isDarkMode
                        ? "text-gray-400 border-gray-600 hover:text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                        : "text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300"
                    }`
              }`}
            >
              <UserCheck
                size={20}
                className={
                  status === "afterReservationConfirm"
                    ? isDarkMode
                      ? "text-green-400"
                      : "text-green-600"
                    : isDarkMode
                    ? "text-gray-500"
                    : "text-gray-500"
                }
              />
              <span className="text-center leading-tight">
                Reservation
                <br />
                Confirmation
              </span>
            </button>

            <button
              onClick={() =>
                navigate(
                  `${location.pathname}?setting=sms&status=afterPurchase_Admin`,
                  {
                    state: { store },
                  }
                )
              }
              className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-all border-2 ${
                status === "afterPurchase_Admin"
                  ? `${
                      isDarkMode
                        ? "bg-green-900/50 text-green-300 border-green-600"
                        : "bg-green-50 text-green-700 border-green-200"
                    } shadow-sm`
                  : `${
                      isDarkMode
                        ? "text-gray-400 border-gray-600 hover:text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                        : "text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300"
                    }`
              }`}
            >
              <ShoppingBag
                size={20}
                className={
                  status === "afterPurchase_Admin"
                    ? isDarkMode
                      ? "text-green-400"
                      : "text-green-600"
                    : isDarkMode
                    ? "text-gray-500"
                    : "text-gray-500"
                }
              />
              <span className="text-center leading-tight">
                Order Purchase
                <br />
                Admin
              </span>
            </button>

            <button
              onClick={() =>
                navigate(`${location.pathname}?setting=sms&status=onBirthday`, {
                  state: { store },
                })
              }
              className={`flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-all border-2 ${
                status === "onBirthday"
                  ? `${
                      isDarkMode
                        ? "bg-green-900/50 text-green-300 border-green-600"
                        : "bg-green-50 text-green-700 border-green-200"
                    } shadow-sm`
                  : `${
                      isDarkMode
                        ? "text-gray-400 border-gray-600 hover:text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                        : "text-gray-600 border-gray-200 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300"
                    }`
              }`}
            >
              <Cake
                size={20}
                className={
                  status === "onBirthday"
                    ? isDarkMode
                      ? "text-green-400"
                      : "text-green-600"
                    : isDarkMode
                    ? "text-gray-500"
                    : "text-gray-500"
                }
              />
              <span className="text-center leading-tight">
                Birthday
                <br />
                SMS
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Short Code Section - Show first on mobile */}
          <div className="lg:order-2 lg:w-80">
            <div
              className={`border rounded-lg p-4 shadow-sm lg:sticky lg:top-4 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Short Codes
              </h3>
              <div className="space-y-3 text-sm">
                <div
                  className={`flex justify-between items-center py-2 border-b ${
                    isDarkMode ? "border-gray-600" : "border-gray-100"
                  }`}
                >
                  <span
                    className={`font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Store Name
                  </span>
                  <code
                    className={`px-2 py-1 rounded text-xs ${
                      isDarkMode
                        ? "bg-green-900/50 text-green-300"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    [store_name]
                  </code>
                </div>
                <div
                  className={`flex justify-between items-center py-2 border-b ${
                    isDarkMode ? "border-gray-600" : "border-gray-100"
                  }`}
                >
                  <span
                    className={`font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Store Link
                  </span>
                  <code
                    className={`px-2 py-1 rounded text-xs ${
                      isDarkMode
                        ? "bg-green-900/50 text-green-300"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    [store_link]
                  </code>
                </div>
                <div
                  className={`flex justify-between items-center py-2 border-b ${
                    isDarkMode ? "border-gray-600" : "border-gray-100"
                  }`}
                >
                  <span
                    className={`font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Customer Name
                  </span>
                  <code
                    className={`px-2 py-1 rounded text-xs ${
                      isDarkMode
                        ? "bg-green-900/50 text-green-300"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    [customer_name]
                  </code>
                </div>
                <div
                  className={`flex justify-between items-center py-2 border-b ${
                    isDarkMode ? "border-gray-600" : "border-gray-100"
                  }`}
                >
                  <span
                    className={`font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Customer Email
                  </span>
                  <code
                    className={`px-2 py-1 rounded text-xs ${
                      isDarkMode
                        ? "bg-green-900/50 text-green-300"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    [customer_email]
                  </code>
                </div>
                <div
                  className={`flex justify-between items-center py-2 border-b ${
                    isDarkMode ? "border-gray-600" : "border-gray-100"
                  }`}
                >
                  <span
                    className={`font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Customer Phone
                  </span>
                  <code
                    className={`px-2 py-1 rounded text-xs ${
                      isDarkMode
                        ? "bg-green-900/50 text-green-300"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    [customer_phone]
                  </code>
                </div>
                {status == "afterPointEarned" && (
                  <div
                    className={`flex justify-between items-center py-2 border-b ${
                      isDarkMode ? "border-gray-600" : "border-gray-100"
                    }`}
                  >
                    <span
                      className={`font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Points
                    </span>
                    <code
                      className={`px-2 py-1 rounded text-xs ${
                        isDarkMode
                          ? "bg-green-900/50 text-green-300"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      [points_earned]
                    </code>
                  </div>
                )}
                {(status == "afterRewardRedeemed" ||
                  status == "afterRewardClaimed" ||
                  status == "afterRewardRedeemed_admin") && (
                  <div className="flex justify-between items-center py-2">
                    <span
                      className={`font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Reward Name
                    </span>
                    <code
                      className={`px-2 py-1 rounded text-xs ${
                        isDarkMode
                          ? "bg-green-900/50 text-green-300"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      [reward_name]
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:order-1 flex-1">
            {status === "afterLogin" && smsMessage.smsAfterLogin && (
              <AfterLogin
                store={store}
                status={status}
                smsMessage={smsMessage.smsAfterLogin}
              />
            )}
            {status === "afterCreateCustomer" &&
              smsMessage.smsAfterCreateCustomer && (
                <AfterCreateCustomer
                  store={store}
                  status={status}
                  smsMessage={smsMessage.smsAfterCreateCustomer}
                />
              )}
            {status === "onBirthday" && smsMessage.smsOnBirthday && (
              <OnBirthday
                store={store}
                status={status}
                smsMessage={smsMessage.smsOnBirthday}
              />
            )}
            {status === "afterPointEarned" && smsMessage.smsAfterLogin && (
              <AfterPointEarned
                store={store}
                status={status}
                smsMessage={smsMessage.smsAfterPointEarned}
              />
            )}
            {status === "afterRewardClaimed" &&
              smsMessage.smsAfterRewardClaimed && (
                <AfterRewardClaimed
                  store={store}
                  status={status}
                  smsMessage={smsMessage.smsAfterRewardClaimed}
                />
              )}
            {status === "afterRewardRedeemed" && smsMessage.smsAfterLogin && (
              <AfterRewardRedeemed
                store={store}
                status={status}
                smsMessage={smsMessage.smsAfterRewardRedeemed}
              />
            )}
            {status === "afterRewardRedeemed_admin" &&
              smsMessage.smsAfterLogin && (
                <AfterRewardRedeemed_Admin
                  store={store}
                  status={status}
                  smsMessage={smsMessage.smsAfterRewardRedeemed_Admin}
                />
              )}

            {status === "afterReservationConfirm" &&
              smsMessage.smsAfterLogin && (
                <AfterReservationConfirm
                  store={store}
                  status={status}
                  smsMessage={smsMessage.smsAfterReservationConfirm}
                />
              )}

            {status === "afterReservation_Admin" &&
              smsMessage.smsAfterLogin && (
                <AfterReservation_Admin
                  store={store}
                  status={status}
                  smsMessage={smsMessage.smsAfterReservation_Admin}
                />
              )}

            {status === "afterPurchase_Admin" && smsMessage.smsAfterLogin && (
              <AfterPurchase_Admin
                store={store}
                status={status}
                smsMessage={smsMessage.smsAfterPurchase_Admin}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMSSetting;
