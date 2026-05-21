import React, { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { toast } from "sonner";
import api from "../api/config.js";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const CompleteProfile = () => {
  const [formData, setFormData] = useState({
    username: "",
    country: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { updateAuth } = useAuth();

  // Get data from navigation state
  const email = location.state?.email;
  const name = location.state?.name;
  const picture = location.state?.picture;

  useEffect(() => {
    // Redirect if no email provided
    if (!email) {
      toast.error("Please complete the signup process first");
      navigate("/signup");
    }
  }, [email, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      toast.error("Username is required");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/google/complete-profile", {
        email,
        username: formData.username,
        country: formData.country,
      });

      if (response.data.success) {
        await updateAuth(response.data.userData, response.data.token);
        window.dispatchEvent(new Event("auth-change"));
        toast.success("Account created successfully!");
        
        // Redirect to appropriate page based on role
        const redirectPath = response.data.userData.role === "admin" ? "/dashboard" : "/store";
        setTimeout(() => navigate(redirectPath, { replace: true }), 500);
      } else {
        toast.error(response.data.message || "Failed to complete profile");
      }
    } catch (error) {
      console.error("Complete profile error:", error);
      toast.error(error.response?.data?.message || "Failed to complete profile");
    } finally {
      setLoading(false);
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
          {/* Profile Picture */}
          {picture ? (
            <img
              src={picture}
              alt={name || "Profile"}
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
          <h2 className="text-2xl font-semibold">Complete Your Profile</h2>
          <p className="text-gray-500 text-sm mt-2">
            Welcome, {name || "there"}! Just a few more details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Username *
            </label>
            <div className="relative">
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-10 py-2 mt-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              />
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 text-sm">@</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              This will be your unique identifier
            </p>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Country / Region
            </label>
            <div className="relative">
              <input
                type="text"
                name="country"
                placeholder="Enter your country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-10 py-2 mt-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              />
              <Globe className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-white bg-green-800 rounded-md hover:bg-green-900 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Complete Sign Up"}
          </button>
        </form>

        {/* Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-500 text-center">
            By completing your profile, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
