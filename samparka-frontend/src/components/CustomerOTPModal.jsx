import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import api from "../api/config";
import { toast } from "sonner";

const CustomerOTPModal = ({
  isOpen,
  onClose,
  phoneNumber,
  countryCode,
  formData,
  storeURL,
  onVerifySuccess,
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [expiryCountdown, setExpiryCountdown] = useState(300); // 5 minutes
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setCountdown(60);
      setCanResend(false);
      setExpiryCountdown(300);
      // Focus first input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  // Resend countdown
  useEffect(() => {
    if (!isOpen || canResend) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, canResend]);

  // OTP expiry countdown
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setInterval(() => {
      setExpiryCountdown((prev) => {
        if (prev <= 1) {
          setError("OTP has expired. Please request a new one.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    // Focus last filled or first empty
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post(`/customer/verify-and-register/${storeURL}`, {
        ...formData,
        countryCode,
        otp: otpString,
      });

      if (response.data.success) {
        toast.success(response.data.message);
        onVerifySuccess(response.data.customer, response.data.token, response.data.isNew);
      } else {
        if (response.data.maxAttemptsReached) {
          setError("Too many failed attempts. Please request a new OTP.");
          setExpiryCountdown(0);
        } else if (response.data.expired) {
          setError("OTP has expired. Please request a new OTP.");
          setExpiryCountdown(0);
        } else {
          setError(response.data.message || "Verification failed");
          if (response.data.remainingAttempts !== undefined) {
            setError(`Invalid OTP. ${response.data.remainingAttempts} attempts remaining.`);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");

    try {
      const response = await api.post(`/customer/send-otp/${storeURL}`, {
        phone: phoneNumber,
        countryCode,
      });

      if (response.data.success) {
        toast.success("OTP sent successfully");
        setOtp(["", "", "", "", "", ""]);
        setCountdown(60);
        setCanResend(false);
        setExpiryCountdown(300);
        inputRefs.current[0]?.focus();
      } else {
        setError(response.data.message || "Failed to resend OTP");
        if (response.data.waitTime) {
          setCountdown(response.data.waitTime);
          setCanResend(false);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verify Your Phone
          </h2>
          <p className="text-gray-600 text-sm">
            Enter the 6-digit code sent to{" "}
            <span className="font-medium">
              {countryCode} {phoneNumber}
            </span>
          </p>
        </div>

        {/* OTP expiry timer */}
        {expiryCountdown > 0 && (
          <div className="text-center mb-4">
            <span className="text-sm text-gray-500">
              Code expires in{" "}
              <span className={`font-medium ${expiryCountdown < 60 ? "text-red-500" : "text-gray-700"}`}>
                {formatTime(expiryCountdown)}
              </span>
            </span>
          </div>
        )}

        {/* OTP Input */}
        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-12 h-14 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none focus:border-green-500 transition-colors ${
                error ? "border-red-300" : "border-gray-300"
              }`}
              disabled={loading || expiryCountdown === 0}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="text-center mb-4">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Verify button */}
        <button
          onClick={handleVerify}
          disabled={loading || otp.join("").length !== 6 || expiryCountdown === 0}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Verifying...
            </span>
          ) : (
            "Verify OTP"
          )}
        </button>

        {/* Resend */}
        <div className="text-center mt-4">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors disabled:opacity-50"
            >
              {resendLoading ? "Sending..." : "Resend OTP"}
            </button>
          ) : (
            <p className="text-gray-500 text-sm">
              Resend OTP in <span className="font-medium">{countdown}s</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerOTPModal;
