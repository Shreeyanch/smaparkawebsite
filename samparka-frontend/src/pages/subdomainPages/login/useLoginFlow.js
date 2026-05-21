import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../../../api/config.js";
import { giveRewardToUser } from "../../../api/wheelApi.js";
import { cachePushEndpoint } from "../../../utils/pushSubscription.js";

const VAPID_KEY =
  "BNOFxo-K_WdOwjUVeBqxg4T-9OMCLsdC4PkV49pDPufEC9v-gAcKdXs_6FN7zQoea6hTQH5Ny7zpkoAkJ4cy0gU";

export const useLoginFlow = ({ store, updateAuth }) => {
  const navigate = useNavigate();

  const [step, setStep] = useState("identifier");
  const [method, setMethod] = useState("email");
  const [identifier, setIdentifier] = useState("");
  const [countryCode, setCountryCode] = useState("+977");
  const [pendingOTP, setPendingOTP] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [otpExpiryAt, setOtpExpiryAt] = useState(null);
  const [otpResendAt, setOtpResendAt] = useState(null);
  const [otpExpirySeconds, setOtpExpirySeconds] = useState(0);
  const [otpResendSeconds, setOtpResendSeconds] = useState(0);
  const [globalResendAvailableAt, setGlobalResendAvailableAt] = useState(null);
  const [loginCooldownSeconds, setLoginCooldownSeconds] = useState(0);
  const [loginHint, setLoginHint] = useState("");
  const pendingLogin = useRef(null);

  const getRemainingSeconds = (timeMs) => {
    if (!timeMs) return 0;
    return Math.max(0, Math.ceil((timeMs - Date.now()) / 1000));
  };

  const normalizeIdentifier = (value, type) =>
    type === "email" ? value.trim().toLowerCase() : value.trim();

  useEffect(() => {
    const interval = setInterval(() => {
      setOtpExpirySeconds(getRemainingSeconds(otpExpiryAt));
      setOtpResendSeconds(getRemainingSeconds(otpResendAt));
      setLoginCooldownSeconds(getRemainingSeconds(globalResendAvailableAt));
    }, 1000);

    setOtpExpirySeconds(getRemainingSeconds(otpExpiryAt));
    setOtpResendSeconds(getRemainingSeconds(otpResendAt));
    setLoginCooldownSeconds(getRemainingSeconds(globalResendAvailableAt));

    return () => clearInterval(interval);
  }, [otpExpiryAt, otpResendAt, globalResendAvailableAt]);

  useEffect(() => {
    if (loginCooldownSeconds <= 0 && loginHint.startsWith("Resend available in")) {
      setLoginHint("");
    }
  }, [loginCooldownSeconds, loginHint]);

  const startOtpTimers = (expiresIn = 300) => {
    const now = Date.now();
    setOtpExpiryAt(now + expiresIn * 1000);
    setOtpResendAt(now + 60 * 1000);
    setGlobalResendAvailableAt(now + 60 * 1000);
  };

  const showCooldownHint = (seconds) => {
    const safeSeconds = Math.max(1, Number(seconds) || 1);
    setOtpResendAt(Date.now() + safeSeconds * 1000);
    setGlobalResendAvailableAt(Date.now() + safeSeconds * 1000);
    setLoginHint(`Resend available in ${safeSeconds}s`);
  };

  const doNavigate = (isNew, path) => {
    toast.success(isNew ? "Welcome! Registration successful" : "Welcome back!", {
      duration: 1000,
      onAutoClose: () => navigate(path || "/loyality"),
    });
  };

  const maybeShowNotifPrompt = (isNew, path) => {
    if ("Notification" in window && Notification.permission !== "granted") {
      setShowNotifPrompt(true);
    } else {
      doNavigate(isNew, path);
    }
  };

  const handleFinish = async (customer, token, isNew) => {
    await updateAuth(customer, token);
    const pendingReward = JSON.parse(sessionStorage.getItem("pendingReward"));
    if (pendingReward && isNew) await giveRewardToUser(customer._id, pendingReward);
    sessionStorage.removeItem("pendingReward");
    const redirect = sessionStorage.getItem("postLoginRedirect");
    if (redirect) sessionStorage.removeItem("postLoginRedirect");
    pendingLogin.current = { isNew, redirect, userId: customer._id };
    maybeShowNotifPrompt(isNew, redirect);
  };

  const handleNotifAllow = async () => {
    setNotifLoading(true);
    try {
      if (!("Notification" in window)) {
        toast.info("This browser does not support notifications.");
      } else {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: VAPID_KEY,
            });
            await api.post("/subscribe", {
              userId: pendingLogin.current.userId,
              subscription,
            });
            cachePushEndpoint(pendingLogin.current.userId, subscription);
          }
        } else {
          toast.info("You can enable notifications later from your loyalty card.");
        }
      }
    } catch (err) {
      console.error("❌ Notification subscribe error:", err);
    } finally {
      setNotifLoading(false);
      setShowNotifPrompt(false);
      const { isNew, redirect } = pendingLogin.current;
      doNavigate(isNew, redirect);
    }
  };

  const handleNotifSkip = () => {
    setShowNotifPrompt(false);
    const { isNew, redirect } = pendingLogin.current;
    doNavigate(isNew, redirect);
  };

  // OTP store: send SMS OTP
  const handleSendPhoneOTP = async (phone, code, options = {}) => {
    const { forceNew = false } = options;
    const normalizedPhone = normalizeIdentifier(phone, "phone");
    const now = Date.now();

    if (!forceNew && method === "phone" && identifier === normalizedPhone && otpExpiryAt && now < otpExpiryAt) {
      setOtpError("");
      setStep("otp");
      return;
    }

    if (now < (globalResendAvailableAt || 0)) {
      showCooldownHint(getRemainingSeconds(globalResendAvailableAt));
      return;
    }

    setLoginHint("");
    setIsLoading(true);
    try {
      const res = await api.post(`/customer/send-otp/${store.url}`, { phone: normalizedPhone, countryCode: code });
      if (res.data.success) {
        setIdentifier(normalizedPhone); setCountryCode(code); setMethod("phone"); setOtpError(""); setStep("otp");
        startOtpTimers(res.data.expiresIn || 300);
        toast.success("Verification code sent");
      } else if (res.data.waitTime) {
        showCooldownHint(res.data.waitTime);
      } else {
        toast.error(res.data.message || "Failed to send code");
      }
    } catch {
      toast.error("Failed to send code. Please try again.");
    }
    finally { setIsLoading(false); }
  };

  // OTP store: send email OTP
  const handleSendEmailOTP = async (email, options = {}) => {
    const { forceNew = false } = options;
    const normalizedEmail = normalizeIdentifier(email, "email");
    const now = Date.now();

    if (!forceNew && method === "email" && identifier === normalizedEmail && otpExpiryAt && now < otpExpiryAt) {
      setOtpError("");
      setStep("otp");
      return;
    }

    if (now < (globalResendAvailableAt || 0)) {
      showCooldownHint(getRemainingSeconds(globalResendAvailableAt));
      return;
    }

    setLoginHint("");
    setIsLoading(true);
    try {
      const res = await api.post(`/customer/send-email-otp/${store.url}`, { email: normalizedEmail });
      if (res.data.success) {
        setIdentifier(normalizedEmail); setMethod("email"); setOtpError(""); setStep("otp");
        startOtpTimers(res.data.expiresIn || 300);
        toast.success("Verification code sent to your email");
      } else if (res.data.waitTime) {
        showCooldownHint(res.data.waitTime);
      } else {
        toast.error(res.data.message || "Failed to send code");
      }
    } catch {
      toast.error("Failed to send code. Please try again.");
    }
    finally { setIsLoading(false); }
  };

  // Non-OTP store: email lookup — login if returning, profile if new
  const handleEmailOnlySubmit = async (email) => {
    setIsLoading(true);
    try {
      const res = await api.post(`/customer/register/${store.url}`, { email });
      if (res.data.success) {
        await handleFinish(res.data.customer, res.data.token, res.data.isNew);
      } else if (res.data.needsProfile) {
        setIdentifier(email); setMethod("email"); setStep("profile");
      } else { toast.error(res.data.message || "Something went wrong"); }
    } catch { toast.error("Something went wrong. Please try again."); }
    finally { setIsLoading(false); }
  };

  // OTP verify step
  const handleVerifyOTP = async (otp) => {
    setIsLoading(true); setOtpError("");
    try {
      const payload = method === "email"
        ? { email: identifier, otp, method: "email" }
        : { phone: identifier, countryCode, otp };
      const res = await api.post(`/customer/verify-and-register/${store.url}`, payload);
      if (res.data.success) { await handleFinish(res.data.customer, res.data.token, res.data.isNew); }
      else if (res.data.needsProfile) { setPendingOTP(otp); setStep("profile"); }
      else { setOtpError(res.data.message || "Verification failed"); }
    } catch { setOtpError("Verification failed. Please try again."); }
    finally { setIsLoading(false); }
  };

  const handleResendOTP = async () => {
    if (method === "email") await handleSendEmailOTP(identifier, { forceNew: true });
    else await handleSendPhoneOTP(identifier, countryCode, { forceNew: true });
  };

  // Profile submit — endpoint differs by store type
  const handleProfileSubmit = async (profileData) => {
    setIsLoading(true);
    try {
      let res;
      if (store.requireEmailOTP || store.requirePhoneOTP) {
        const payload = method === "email"
          ? { ...profileData, email: identifier, otp: pendingOTP, method: "email" }
          : { ...profileData, phone: identifier, countryCode, otp: pendingOTP };
        res = await api.post(`/customer/verify-and-register/${store.url}`, payload);
      } else {
        res = await api.post(`/customer/register/${store.url}`, { ...profileData, email: identifier });
      }
      if (res.data.success) { setProfileError(""); await handleFinish(res.data.customer, res.data.token, res.data.isNew); }
      else { const msg = res.data.message || "Registration failed"; setProfileError(msg); toast.error(msg); }
    } catch { toast.error("Registration failed. Please try again."); }
    finally { setIsLoading(false); }
  };

  return {
    step, setStep, method, identifier, countryCode,
    pendingOTP, isLoading, otpError, profileError,
    otpExpirySeconds, otpResendSeconds, loginCooldownSeconds, loginHint,
    handleSendPhoneOTP, handleSendEmailOTP, handleEmailOnlySubmit,
    handleVerifyOTP, handleResendOTP, handleProfileSubmit,
    showNotifPrompt, notifLoading,
    handleNotifAllow, handleNotifSkip,
  };
};
