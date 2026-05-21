import React, { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Lottie from "lottie-react";
import api from "../api/config.js";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import loginAnimation from "../assets/Login-animation.json";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { updateAuth } = useAuth();
  const navigate = useNavigate();
  const ref = useRef();
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;

  useEffect(() => {
    if (user && token) {
      if (user.role == "admin") {
        navigate("/dashboard");
      } else {
        navigate("/store");
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/user/login", { email, password });
      if (response.data.success) {
        await updateAuth(response.data.userData, response.data.token);
        window.dispatchEvent(new Event("auth-change"));
        const redirectPath =
          response.data.userData.role === "admin" ? "/dashboard" : "/store";
        toast.success(response.data.message, {
          duration: 1000,
          onAutoClose: () => navigate(redirectPath),
        });
      } else {
        toast.error(response.data.message, { duration: 2000 });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed", { duration: 2000 });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const response = await api.get("/auth/google/login-url");
      if (response.data.success) {
        sessionStorage.setItem("authFlow", "login");
        window.location.href = response.data.url;
      } else {
        toast.error("Failed to initiate Google login");
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Failed to initiate Google login");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-white font-[Poppins,sans-serif] flex flex-col lg:flex-row">

      {/* ── Tablet only: Lottie banner on top ── */}
      <div className="hidden sm:flex lg:hidden w-full bg-[#eef6ee] items-center justify-center py-6 px-4">
        <Lottie
          animationData={loginAnimation}
          loop={true}
          className="w-full max-w-[320px]"
        />
      </div>

      {/* ── Left column (form) ── */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-6 sm:px-10 xl:px-16 text-center py-8 lg:py-0">

        {/* Logo */}
        <div>
          <img src="/SAMPARKA_black.png" alt="Samparka" className="w-48 sm:w-64 cursor-pointer" onClick={() => navigate("/")} />
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-2">
          Welcome back!
        </h1>
        <p className="text-sm text-gray-500 mb-6 sm:mb-8 max-w-xs">
          Simplify your workflow and boost your productivity with{" "}
          <span className="font-semibold text-gray-700">Samparka</span>. Get started for free.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-5 py-3 rounded-full border border-gray-300 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-gray-500 transition-colors bg-white"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-3 rounded-full border border-gray-300 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-gray-500 transition-colors bg-white pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {/* Forgot password */}
          <div className="text-right cursor-pointer">
            <span
              onClick={() => navigate("/forgotPassword")}
              className="text-sm text-gray-500 hover:text-gray-800 cursor-pointer transition-colors"
            >
              Forgot Password?
            </span>
          </div>

          {/* Login button */}
          <button
            type="submit"
            className="w-full py-3 cursor-pointer rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors focus:outline-none"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full max-w-sm mt-6">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-xs text-gray-400 whitespace-nowrap">or continue with</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* Google */}
        <div className="flex gap-4 mt-5 w-full max-w-sm justify-center cursor-pointer">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            title="Sign in with Google"
            className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
          >
            <img src="/logo/google-color.svg" alt="Google" className="w-5 h-5 brightness-0 invert" />
          </button>
        </div>

        {/* Sign up */}
        <p className="mt-8 sm:mt-10 text-sm text-gray-500 w-full max-w-sm text-center">
          Not a member?{" "}
          <Link to="/signup" className="text-green-700 font-semibold hover:underline">
            Register now
          </Link>
        </p>
      </div>

      {/* ── Right column — desktop only ── */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 p-6">
        <div className="w-full h-[90vh] bg-[#eef6ee] rounded-3xl flex flex-col items-center justify-center px-6">
          <Lottie
            animationData={loginAnimation}
            loop={true}
            className="w-full max-w-[560px]"
          />
          <p className="mt-6 text-center text-lg font-medium text-gray-800 leading-snug max-w-xs">
            Manage loyalty programs with{" "}
            <span className="font-bold">Samparka</span>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Login;
