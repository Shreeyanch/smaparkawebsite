import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Globe } from "lucide-react";
import { toast } from "sonner";
import Lottie from "lottie-react";
import api from "../api/config.js";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import signupAnimation from "../assets/Signup-animation.json";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
  "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
  "Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo (Congo-Brazzaville)","Costa Rica",
  "Croatia","Cuba","Cyprus","Czechia","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt",
  "El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon",
  "Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
  "Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel",
  "Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos",
  "Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi",
  "Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova",
  "Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands",
  "New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau",
  "Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania",
  "Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal",
  "Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea",
  "South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan",
  "Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu",
  "Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela",
  "Vietnam","Yemen","Zambia","Zimbabwe",
];

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    country: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { authState } = useAuth();
  const { userInfo: user, token } = authState;
  const navigate = useNavigate();

  useEffect(() => {
    if (user && token) {
      if (user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/store");
      }
    }
  }, [user, token, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/google/email-signup", {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        username: formData.username,
        country: formData.country,
      });

      if (response.data.success) {
        toast.success("Verification code sent to your email!");
        navigate("/verify-email", {
          state: { email: formData.email, authProvider: "local" },
        });
      } else if (response.data.userExists) {
        toast.error(response.data.message);
        navigate("/login");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true);
      const response = await api.get("/auth/google/signup-url");
      if (response.data.success) {
        sessionStorage.setItem("authFlow", "signup");
        window.location.href = response.data.url;
      } else {
        toast.error("Failed to initiate Google signup");
      }
    } catch (error) {
      console.error("Google signup error:", error);
      toast.error("Failed to initiate Google signup");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-white font-[Poppins,sans-serif] flex flex-col lg:flex-row">

      {/* ── Tablet only: Lottie banner on top ── */}
      <div className="hidden sm:flex lg:hidden w-full bg-[#eef6ee] items-center justify-center py-6 px-4">
        <Lottie
          animationData={signupAnimation}
          loop={true}
          className="w-full max-w-[300px]"
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
          Create account
        </h1>
        <p className="text-sm text-gray-500 mb-5 max-w-xs">
          Join <span className="font-semibold text-gray-700">Samparka</span> and start managing loyalty programs for free.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-2">

          {/* Full Name */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-5 py-2.5 rounded-full border border-gray-300 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-gray-500 transition-colors bg-white"
          />

          {/* Username */}
          <div className="relative">
            <span className="absolute top-1/2 left-5 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">@</span>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full pl-9 pr-5 py-2.5 rounded-full border border-gray-300 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-gray-500 transition-colors bg-white"
            />
          </div>

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-5 py-2.5 rounded-full border border-gray-300 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-gray-500 transition-colors bg-white"
          />

          {/* Country */}
          <div className="relative">
            <Globe className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full pl-10 pr-5 py-2.5 rounded-full border border-gray-300 text-sm text-gray-800 outline-none focus:border-gray-500 transition-colors bg-white appearance-none"
            >
              <option value="">Country / Region</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-5 py-2.5 rounded-full border border-gray-300 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-gray-500 transition-colors bg-white pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-5 py-2.5 rounded-full border border-gray-300 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-gray-500 transition-colors bg-white pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 cursor-pointer rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full max-w-sm mt-6">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-xs text-gray-400 whitespace-nowrap">or continue with</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* Google button */}
        <div className="flex gap-4 mt-5 w-full max-w-sm justify-center ">
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            title="Sign up with Google"
            className="w-12 h-12 rounded-full cursor-pointer bg-gray-900 flex items-center justify-center hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
          >
            <img src="/logo/google-color.svg" alt="Google" className="w-5 h-5 brightness-0 invert" />
          </button>
        </div>

        {/* Login link */}
        <p className="mt-8 sm:mt-10 text-sm text-gray-500 w-full max-w-sm text-center pb-8 lg:pb-0">
          Already have an account?{" "}
          <Link to="/login" className="text-green-700 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>

      {/* ── Right column — desktop only ── */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 p-6">
        <div className="w-full h-[90vh] bg-[#eef6ee] rounded-3xl flex flex-col items-center justify-center px-6">
          <Lottie
            animationData={signupAnimation}
            loop={true}
            className="w-full max-w-[640px]"
          />
          <p className="mt-6 text-center text-lg font-medium text-gray-800 leading-snug max-w-xs">
            Start your loyalty journey with{" "}
            <span className="font-bold">Samparka</span>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Signup;
