import React, { useEffect, useRef, useState, useCallback } from "react";
import LoadingSpinner from "../../../components/LoadingSpinner";
import PinInput from "../../../components/storeSide/PinInput";
import { QrCode } from "lucide-react";
import { toast } from "sonner";
import api from "../../../api/config";
import { useNavigate } from "react-router-dom";

/**
 * StoreLogin Component
 * 
 * PIN-based access gateway with server-side lockout enforcement.
 * All security logic is handled by the backend - frontend only displays status.
 * 
 * Lockout Phases (enforced server-side):
 * - Phase 0: 4 attempts → 30s lock
 * - Phase 1: 1 attempt → 1min lock + warning
 * - Phase 2: 1 attempt → 24h block
 */

// Get user's timezone for device fingerprinting
const getTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "unknown";
  }
};

const StoreLogin = (subdomain) => {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [loading, setIsLoading] = useState(false);
  const token = localStorage.getItem("storeToken");
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  
  // Lockout display state (driven by server responses)
  const [isLocked, setIsLocked] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false); // Show 24h block warning
  const timerRef = useRef(null);

  // Countdown timer for lock/block display
  const startCountdown = useCallback((seconds) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setRemainingTime(seconds);
    
    timerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setIsLocked(false);
          setIsBlocked(false);
          setStatusMessage("");
          setPin(["", "", "", ""]);
          toast.info("You can try again now", { duration: 2000 });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("outlet")) {
      localStorage.setItem("outletId", searchParams.get("outlet"));
    }
    if (token) {
      navigate("/store/points");
    }
  }, [token, navigate]);

  const handleChange = (index, value) => {
    if (isLocked || isBlocked) return;
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;
    
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (isLocked || isBlocked) return;
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async () => {
    if (isLocked || isBlocked || isSubmitting) return;

    const pinString = pin.join("");
    if (pinString.length !== 4) {
      toast.error("Please enter a complete 4-digit PIN", { duration: 2000 });
      return;
    }

    setIsSubmitting(true);
    setIsLoading(true);

    try {
      // Send request with timezone header for device fingerprinting
      const response = await api.post(
        `/store/verifyPIN/${subdomain.url}`,
        { pin: pinString },
        { headers: { "X-Timezone": getTimezone() } }
      );

      const { data } = response;

      if (data.success) {
        // Success - clear state and redirect
        setStatusMessage("");
        setIsLocked(false);
        setIsBlocked(false);
        localStorage.setItem("storeToken", data.token);
        toast.success(data.message, {
          duration: 1000,
          onAutoClose: () => navigate("/store/points"),
        });
      } else {
        // Failed attempt - server provides lockout info
        setPin(["", "", "", ""]);
        inputRefs.current[0]?.focus();

        // Handle blocked state (24h)
        if (data.blocked) {
          setIsBlocked(true);
          setIsLocked(false);
          setShowWarning(false);
          setStatusMessage(data.message);
          if (data.remainingTime) {
            startCountdown(data.remainingTime);
          }
          toast.error(data.message, { duration: 5000 });
        }
        // Handle locked state (30s or 1min)
        else if (data.locked) {
          setIsLocked(true);
          setIsBlocked(false);
          // Show warning if entering Phase 2 (next fail = 24h block)
          setShowWarning(data.lockPhase === 2 || data.warning === true);
          setStatusMessage(data.message);
          if (data.remainingTime) {
            startCountdown(data.remainingTime);
          }
          toast.error(data.message, { duration: 3000 });
        }
        // Not locked yet - show attempts remaining
        else {
          setShowWarning(false);
          setStatusMessage(data.message);
          toast.error(data.message, { duration: 2000 });
        }
      }
    } catch (error) {
      console.error("PIN verification error:", error);
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again.",
        { duration: 2000 }
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsSubmitting(false), 500);
    }
  };

  // Format time for display
  const formatTime = (seconds) => {
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
    return `${seconds}s`;
  };

  // Determine status text
  const getStatusText = () => {
    if (isBlocked && remainingTime > 0) {
      return `Blocked for ${formatTime(remainingTime)}`;
    }
    if (isLocked && remainingTime > 0) {
      return `Try again in ${formatTime(remainingTime)}`;
    }
    if (statusMessage) {
      return statusMessage;
    }
    return "Please enter the 4 digit PIN code to proceed.";
  };

  return (
    <div className="bg-gray-50">
      {loading && <LoadingSpinner />}
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 flex-col md:flex-row">
        <div className="max-w-md w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex-grow md:max-w-lg">
          {/* Header */}
          <div className="bg-green-600 p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <QrCode className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              SCAN TO REDEEM A REWARD
            </h2>
            <p className="text-white/90 text-sm leading-relaxed">
              Simply scan the code below to earn points and redeem a reward in
              the process.
            </p>
          </div>

          {/* PIN Input */}
          <div className="p-8 bg-white text-center">
            <p className={`text-sm mb-2 font-medium ${isBlocked ? "text-red-600" : "text-gray-600"}`}>
              {getStatusText()}
            </p>
            
            {/* Warning for Phase 2 - next fail = 24h block */}
            {showWarning && (
              <p className="text-xs text-red-500 mb-4">
                Warning: Next wrong PIN will block access for 24 hours
              </p>
            )}
            
            {!showWarning && <div className="mb-4" />}
            
            <PinInput
              pin={pin}
              handleChange={handleChange}
              handleKeyDown={handleKeyDown}
              handleSubmit={handleSubmit}
              inputRefs={inputRefs}
              disabled={isLocked || isBlocked || isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreLogin;
