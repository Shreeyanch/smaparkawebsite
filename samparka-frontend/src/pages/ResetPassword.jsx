import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/config";
import { Lock } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { updateAuth } = useAuth();

  useEffect(() => {
    const logoutIfLoggedIn = async () => {
      await updateAuth();
    };
    logoutIfLoggedIn();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      return (
        setMessage(""),
        setError("Passwords do not match"),
        toast.error("Passwords do not match")
      );
    }

    setLoading(true);

    try {
      const res = await api.post(`/user/resetPassword/${token}`, {
        password,
      });
      setError("");
      setMessage(res.data.message);
      toast.success(res.data.message);
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setMessage();
      toast.error(error.response?.data?.message || "Something went wrong");
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 h-screen bg-gray-100">
      {/* Center - Logo and Location */}
      <div className="flex flex-col items-center justify-center gap-[px]">
        <div className="h-[74px] flex flex-col items-center justify-center">
          <img
            className="w-auto relative h-[70px]"
            alt=""
            src="/SAMPARKA_black.png"
          />
        </div>
      </div>
      {loading && <LoadingSpinner />}
      <div className="w-96 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Reset Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password"
              required
              className="w-full px-10 py-2 mt-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-blue-500"
            />
            <Lock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="relative">
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm New Password"
              required
              className="w-full px-10 py-2 mt-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-blue-500"
            />
            <Lock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
          >
            Reset Password
          </button>
        </form>
        {error && (
          <div className="relative">
            {/* <CircleX className="absolute top-1/2 left-3 -translate-y-1/2 text-red-400 mr-2" /> */}
            <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
          </div>
        )}
        {message && (
          <div className="relative">
            {/* <Mail className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 mr-2" /> */}
            <p className="mt-4 text-sm text-gray-600 text-center">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
