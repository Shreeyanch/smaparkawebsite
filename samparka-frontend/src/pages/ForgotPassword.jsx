import { useState } from "react";
import api from "../api/config";
import { CircleX, Mail } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/user/forgotPassword", { email });
      toast.success(res.data.message);
      setError("");
      setMessage(res.data.message);
    } catch (error) {
      setMessage("");
      toast.error(error.response?.data?.message || "Something went wrong");
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 bg-gray-100">
      {loading && <LoadingSpinner />}
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
      <div className="w-96 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Forgot Password?
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              required
              className="w-full px-10 py-2 mt-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-blue-500"
            />
            <Mail className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            type="submit"
            className="w-full py-2 text-white bg-green-800 rounded-md hover:bg-green-900 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            Send Reset Link
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
