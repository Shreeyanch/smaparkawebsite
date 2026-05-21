import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import api from "../api/config.js";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const VerifyEmail = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { updateAuth } = useAuth();

  // Get email and authProvider from navigation state
  const email = location.state?.email;
  const authProvider = location.state?.authProvider || "local";
  const name = location.state?.name;
  const picture = location.state?.picture;

  useEffect(() => {
    // Redirect if no email provided
    if (!email) {
      toast.error("Please start the signup process first");
      navigate("/signup");
      return;
    }

    // Focus first input
    inputRefs.current[0]?.focus();
  }, [email, navigate]);

  useEffect(() => {
    // Countdown timer for resend
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newCode = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
      setCode(newCode);
      // Focus the last filled input or the next empty one
      const lastIndex = Math.min(pastedData.length, 5);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/google/verify-email", {
        email,
        code: verificationCode,
      });

      if (response.data.success) {
        if (response.data.step === "complete") {
          // Email/password signup complete - login the user
          await updateAuth(response.data.userData, response.data.token);
          window.dispatchEvent(new Event("auth-change"));
          toast.success("Account created successfully!");
          
          // Redirect to appropriate page based on role
          const redirectPath = response.data.userData.role === "admin" ? "/dashboard" : "/store";
          setTimeout(() => navigate(redirectPath, { replace: true }), 500);
        } else if (response.data.step === "complete_profile") {
          // Google signup - proceed to complete profile
          toast.success("Email verified!");
          navigate("/complete-profile", {
            state: {
              email: response.data.email,
              name: response.data.name,
              picture: response.data.picture,
            },
          });
        }
      } else {
        if (response.data.codeExpired) {
          toast.error("Code expired. Please request a new one.");
        } else {
          toast.error(response.data.message || "Verification failed");
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setResending(true);
    try {
      const response = await api.post("/auth/google/resend-code", { email });
      
      if (response.data.success) {
        toast.success("Verification code sent!");
        setCountdown(60); // 60 second cooldown
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(response.data.message || "Failed to resend code");
      }
    } catch (error) {
      console.error("Resend error:", error);
      toast.error(error.response?.data?.message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Logo */}
      <div className="flex flex-col items-center justify-center mb-4">
        <div className="h-[74px] flex flex-col items-center justify-center">
          <img
            className="w-auto relative h-[70px]"
            alt="Samparka Logo"
            src="/SAMPARKA_black.png"
          />
        </div>
      </div>

      <div className="w-96 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold">Verify Your Email</h2>
          <p className="text-gray-500 text-sm mt-2">
            We've sent a 6-digit code to
          </p>
          <p className="text-gray-700 font-medium">{email}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Code Input */}
          <div className="flex justify-center gap-2 mb-6">
            {code.map((digit, index) => (
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
                className="w-12 h-14 text-center text-xl font-semibold border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || code.join("").length !== 6}
            className="w-full py-2 text-white bg-green-800 rounded-md hover:bg-green-900 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        {/* Resend Code */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Didn't receive the code?{" "}
            <button
              onClick={handleResend}
              disabled={resending || countdown > 0}
              className="text-green-700 hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : resending ? "Sending..." : "Resend"}
            </button>
          </p>
        </div>

        {/* Back to Signup */}
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/signup")}
            className="text-sm text-gray-500 hover:underline"
          >
            ← Back to Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
