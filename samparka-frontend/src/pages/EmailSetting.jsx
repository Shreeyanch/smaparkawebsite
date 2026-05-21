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
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TextEditor from "../components/emailSettingComponents/TextEditor";
import AfterLogin from "../components/emailSettingComponents/AfterLogin";
import AfterPointEarned from "../components/emailSettingComponents/AfterPointEarned";
import AfterRewardClaimed from "../components/emailSettingComponents/AfterRewardClaimed";
import AfterRewardRedeemed from "../components/emailSettingComponents/AfterRewardRedeemed";
import AfterRewardRedeemed_Admin from "../components/emailSettingComponents/AfterRewardRedeemed_Admin";
import { toast } from "sonner";
import config from "../api/config";
import { useAuth } from "../context/AuthContext";
import OnBirthday from "../components/emailSettingComponents/OnBirthday";
import AfterCreateCustomer from "../components/emailSettingComponents/AfterCreateCustomer";
import AfterReservationConfirm from "../components/emailSettingComponents/AfterReservationConfirm";
import AfterReservation_Admin from "../components/emailSettingComponents/AfterReservation_Admin";
import AfterPurchase_Admin from "../components/emailSettingComponents/AfterPurchase_Admin";
import EmailPreview from "../components/emailSettingComponents/EmailPreview";

const EmailSetting = ({ store: propStore, setLoading: propSetLoading }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const store = propStore || location.state?.store;

  // All hooks must be declared before any early return
  const [localLoading, setLocalLoading] = useState(false);
  const [mailMessage, setMailMessage] = useState({});
  const [previewData, setPreviewData] = useState({ subject: "", message: "" });
  const handlePreviewChange = ({ subject, message }) =>
    setPreviewData({ subject, message });
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
    if (!store) {
      toast.error("Store not found", {
        duration: 1000,
        onAutoClose: () => {
          navigate("/store");
        },
      });
      return;
    }
    if (!store?.email || store?.email === "" || !store?.pass || store?.pass === "") {
      toast.error("SMTP not configured", {
        duration: 1000,
        onAutoClose: () => {
          navigate(-1);
        },
      });
      return;
    }
    const getMessages = async () => {
      setLoading(true);
      try {
        const response = await config.get(`/store/getMessage/${store._id}`, {
          headers: { token },
        });
        if (response.data.success) {
          setMailMessage(response.data.mailSMS);
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

  // Guard renders after all hooks
  if (!store) return null;
  if (!store?.email || store?.email === "" || !store?.pass || store?.pass === "") return null;

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* {!propSetLoading && loading && <LoadingSpinner />} */}

      {/* Header */}
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } border-b px-6 py-4 mb-8`}
      >
        <div className="flex items-center gap-4">
          <div>
            <h1
              className={`text-2xl font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Email Settings
            </h1>
            <p
              className={`${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              } mt-1`}
            >
              Store: {store?.name}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6">
        {/* Navigation Tabs */}
        <div
          className={`${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } rounded-lg border p-6 mb-8`}
        >
          <h2
            className={`text-lg font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            } mb-4`}
          >
            Email Templates
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() =>
                navigate(
                  `${location.pathname}?setting=mail&status=afterLogin`,
                  {
                    state: { store },
                  }
                )
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
                  `${location.pathname}?setting=mail&status=afterCreateCustomer`,
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
                  `${location.pathname}?setting=mail&status=afterPointEarned`,
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
                  `${location.pathname}?setting=mail&status=afterRewardRedeemed`,
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
                  `${location.pathname}?setting=mail&status=afterRewardRedeemed_admin`,
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
                  `${location.pathname}?setting=mail&status=afterRewardClaimed`,
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
                  `${location.pathname}?setting=mail&status=afterReservation_Admin`,
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
                  `${location.pathname}?setting=mail&status=afterReservationConfirm`,
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
                  `${location.pathname}?setting=mail&status=afterPurchase_Admin`,
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
                Product Purchase
                <br />
                Admin
              </span>
            </button>

            <button
              onClick={() =>
                navigate(
                  `${location.pathname}?setting=mail&status=onBirthday`,
                  {
                    state: { store },
                  }
                )
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
                Email
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Right panel: Short Codes + Preview */}
          <div className="lg:order-2 lg:w-80 flex flex-col gap-4 lg:sticky lg:top-4 self-start">
            <div
              className={`${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              } border rounded-lg p-4 shadow-sm`}
            >
              <h3
                className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                } mb-4`}
              >
                Short Codes
              </h3>
              <div className="space-y-3 text-sm">
                <div
                  className={`flex justify-between items-center py-2 border-b ${
                    isDarkMode ? "border-gray-700" : "border-gray-100"
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
                    isDarkMode ? "border-gray-700" : "border-gray-100"
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
                    isDarkMode ? "border-gray-700" : "border-gray-100"
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
                    isDarkMode ? "border-gray-700" : "border-gray-100"
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
                    isDarkMode ? "border-gray-700" : "border-gray-100"
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
                      isDarkMode ? "border-gray-700" : "border-gray-100"
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

            {/* Live email preview */}
            <EmailPreview
              subject={previewData.subject}
              message={previewData.message}
              store={store}
            />
          </div>

          <div className="lg:order-1 flex-1">
            {status === "afterLogin" && mailMessage.mailAfterLogin && (
              <AfterLogin
                store={store}
                status={status}
                mailMessage={mailMessage.mailAfterLogin}
                onPreviewChange={handlePreviewChange}
              />
            )}
            {status === "afterCreateCustomer" &&
              mailMessage.mailAfterCreateCustomer && (
                <AfterCreateCustomer
                  store={store}
                  status={status}
                  mailMessage={mailMessage.mailAfterCreateCustomer}
                  onPreviewChange={handlePreviewChange}
                />
              )}
            {status === "afterPointEarned" && mailMessage.mailAfterLogin && (
              <AfterPointEarned
                store={store}
                status={status}
                mailMessage={mailMessage.mailAfterPointEarned}
                onPreviewChange={handlePreviewChange}
              />
            )}
            {status === "afterRewardRedeemed" && mailMessage.mailAfterLogin && (
              <AfterRewardRedeemed
                store={store}
                status={status}
                mailMessage={mailMessage.mailAfterRewardRedeemed}
                onPreviewChange={handlePreviewChange}
              />
            )}
            {status === "afterRewardRedeemed_admin" &&
              mailMessage.mailAfterLogin && (
                <AfterRewardRedeemed_Admin
                  store={store}
                  status={status}
                  mailMessage={mailMessage.mailAfterRewardRedeemed_Admin}
                  onPreviewChange={handlePreviewChange}
                />
              )}
            {status === "afterRewardClaimed" &&
              mailMessage.mailAfterRewardClaimed && (
                <AfterRewardClaimed
                  store={store}
                  status={status}
                  mailMessage={mailMessage.mailAfterRewardClaimed}
                  onPreviewChange={handlePreviewChange}
                />
              )}
            {status === "afterReservationConfirm" &&
              mailMessage.mailAfterLogin && (
                <AfterReservationConfirm
                  store={store}
                  status={status}
                  mailMessage={mailMessage.mailAfterReservationConfirm}
                  onPreviewChange={handlePreviewChange}
                />
              )}
            {status === "afterReservation_Admin" &&
              mailMessage.mailAfterLogin && (
                <AfterReservation_Admin
                  store={store}
                  status={status}
                  mailMessage={mailMessage.mailAfterReservation_Admin}
                  onPreviewChange={handlePreviewChange}
                />
              )}
            {status === "afterPurchase_Admin" &&
              mailMessage.mailAfterLogin && (
                <AfterPurchase_Admin
                  store={store}
                  status={status}
                  mailMessage={mailMessage.mailAfterPurchase_Admin}
                  onPreviewChange={handlePreviewChange}
                />
              )}
            {status === "onBirthday" && mailMessage.mailOnBirthday && (
              <OnBirthday
                store={store}
                status={status}
                mailMessage={mailMessage.mailOnBirthday}
                onPreviewChange={handlePreviewChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSetting;
