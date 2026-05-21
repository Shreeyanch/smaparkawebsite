import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStoreAuth } from "../../context/StoreAuthContext";
import api from "../../api/config";
import { toast } from "sonner";
import LoadingSpinner from "../../components/LoadingSpinner";
import PoweredBySamparkaFooter from "../../components/PoweredBySamparkaFooter";

const ProfileSetting = ({ showPoweredBy = false }) => {
  const { authState, updateAuth, logout } = useStoreAuth();
  const { userInfo: user, token } = authState;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthdate: "",
  });

  useEffect(() => {
    if (!user || !token) {
      navigate("/register");
    } else {
      // Prefill the form with user data
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        birthdate: user?.dob ? user.dob.split("T")[0] : "", // Format date
      });
    }
  }, [user, token, navigate]);

  const onBackClick = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Name, Email, and Phone are required.");
      setLoading(false);
      return;
    }
    try {
      const response = await api.put(
        "/customer/edit",
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          dob: formData.birthdate, // send as dob
        },
        { headers: { token } }
      );

      const data = await response.data;
      if (!data.success) {
        toast.error(data.message || "Failed to update profile");
        return;
      }

      // ✅ Update context user info
      updateAuth(
        data.data, // new updated user
        token // existing token
      );

      toast.success("Profile updated successfully ✅");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingSpinner />}
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-full max-w-[480px] bg-white min-h-screen flex flex-col relative">
          {/* Header */}
          <div className="flex-none px-5 pt-8 pb-4">
            <div className="flex items-center justify-between">
              <button
                onClick={onBackClick}
                className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                {" "}
                <svg
                  className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {" "}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />{" "}
                </svg>{" "}
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-black text-white rounded-2xl font-semibold text-sm hover:bg-gray-900"
              >
                Save
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col px-5 pb-32 overflow-auto">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-700">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <h1 className="text-center text-base font-bold mb-8">
              Profile Setting
            </h1>

            {/* Form */}
            <div className="space-y-6 bg-white rounded-2xl p-6">
              {/* Name */}
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-medium">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Birthdate */}
              <div>
                <label className="text-sm font-medium">Birthdate</label>
                <input
                  type="date"
                  value={formData.birthdate}
                  onChange={(e) =>
                    handleInputChange("birthdate", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>
          {showPoweredBy && <PoweredBySamparkaFooter />}
        </div>
      </div>
    </>
  );
};

export default ProfileSetting;
