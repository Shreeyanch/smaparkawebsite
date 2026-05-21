import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/config";
import { toast } from "sonner";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateAuth, authState } = useAuth();
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState(null);
  const hasProcessed = useRef(false); // Prevent duplicate processing

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent duplicate execution (React StrictMode or re-renders)
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      // If already authenticated, redirect immediately
      if (authState.userInfo && authState.token) {
        const redirectPath = authState.userInfo.role === "admin" ? "/dashboard" : "/store";
        navigate(redirectPath, { replace: true });
        return;
      }

      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setErrorMessage("Google authentication was cancelled");
        setStatus("error");
        return;
      }

      if (!code) {
        setErrorMessage("No authorization code received");
        setStatus("error");
        return;
      }

      // Determine if this is a login or signup flow
      const authFlow = sessionStorage.getItem("authFlow") || "login";
      sessionStorage.removeItem("authFlow"); // Clean up

      try {
        if (authFlow === "signup") {
          // Handle SIGNUP flow
          const response = await api.post("/auth/google/signup", { code });

          if (response.data.success) {
            if (response.data.step === "verify_email") {
              // Proceed to email verification
              setStatus("success");
              toast.success("Verification code sent!");
              navigate("/verify-email", {
                state: {
                  email: response.data.email,
                  authProvider: "google",
                  name: response.data.name,
                },
                replace: true,
              });
            }
          } else if (response.data.userExists) {
            // User already exists - redirect to login
            toast.info(response.data.message);
            navigate("/login", { replace: true });
          } else {
            setErrorMessage(response.data.message || "Signup failed");
            setStatus("error");
          }
        } else {
          // Handle LOGIN flow
          const response = await api.post("/auth/google/login", { code });

          if (response.data.success) {
            // Login successful
            setStatus("success");
            await updateAuth(response.data.userData, response.data.token);
            window.dispatchEvent(new Event("auth-change"));
            toast.success("Login Successful!", { duration: 1000 });

            const redirectPath =
              response.data.userData.role === "admin" ? "/dashboard" : "/store";
            setTimeout(() => navigate(redirectPath, { replace: true }), 500);
          } else if (response.data.requiresSignup) {
            // User doesn't exist - redirect to signup
            toast.info("No account found. Please sign up first.");
            navigate("/signup", { replace: true });
          } else if (response.data.requiresVerification) {
            // Account pending verification
            toast.info("Please verify your email to continue.");
            navigate("/verify-email", {
              state: {
                email: response.data.email,
                authProvider: "google",
              },
              replace: true,
            });
          } else {
            setErrorMessage(response.data.message || "Authentication failed");
            setStatus("error");
          }
        }
      } catch (err) {
        console.error("OAuth callback error:", err);
        setErrorMessage(err.response?.data?.message || "Authentication failed");
        setStatus("error");
      }
    };

    handleCallback();
  }, [searchParams, navigate, authState.userInfo, authState.token, updateAuth]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800"></div>
        <p className="mt-4 text-gray-600">Processing...</p>
      </div>
    );
  }

  // Success state - show while redirecting (prevents flash of error)
  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    );
  }

  // Error state - only shown when authentication definitively fails
  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <p className="text-red-500 mb-4">{errorMessage}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-green-800 text-white rounded hover:bg-green-900"
            >
              Back to Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-4 py-2 border border-green-800 text-green-800 rounded hover:bg-green-50"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default GoogleCallback;