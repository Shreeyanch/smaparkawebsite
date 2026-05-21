import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { KeyRound, Store, X, Eye, EyeOff } from "lucide-react";
import api from "../api/config.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const CustomerCode = ({ store, isOpen, onClose, onSuccess }) => {
  const { authState } = useAuth();
  const { isDarkMode } = useTheme();
  const { token } = authState;

  const [code, setCode] = useState(store?.customerCode || "666666");
  const [showCode, setShowCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode(store?.customerCode || "666666");
      setShowCode(false);
      setIsLoading(false);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, store]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      toast.error("Customer code must be exactly 6 digits");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post(
        `/store/changeCustomerCode/${store._id}`,
        { customerCode: code },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("Customer code updated");
        onSuccess?.(res.data.customerCode);
        handleClose();
      } else {
        toast.error(res.data.message || "Failed to update customer code");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black transition-opacity duration-300 flex items-center justify-end z-50 p-4 ${isVisible ? "bg-opacity-50" : "bg-opacity-0"}`}
      onClick={handleClose}
    >
      <div
        className={`rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ease-out ${isDarkMode ? "bg-gray-800" : "bg-white"} ${isVisible ? "translate-x-0" : "translate-x-full"}`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex items-center justify-between p-6 border-b sticky top-0 z-10 rounded-t-lg ${isDarkMode ? "border-gray-600 bg-gray-800" : "border-gray-200 bg-white"}`}
        >
          <h2
            className={`flex gap-2 text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            <KeyRound className="h-6 w-6" />
            Customer Code
          </h2>
          <button
            onClick={handleClose}
            className={`transition-colors ${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"}`}
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div
            className={`flex items-center gap-2 mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            <Store className="h-5 w-5" />
            <span className="text-sm font-medium">Store: {store?.name}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 relative">
          {isLoading && (
            <div
              className={`absolute inset-0 bg-opacity-75 flex items-center justify-center rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
            >
              <LoadingSpinner />
            </div>
          )}

          <div>
            <label
              className={`flex gap-2 text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              <KeyRound className="h-5 w-5" />
              Customer Code *
            </label>
            <div className="relative">
              <input
                type={showCode ? "text" : "password"}
                inputMode="numeric"
                minLength={6}
                maxLength={6}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
                className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent tracking-widest ${isDarkMode ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"}`}
                placeholder="6-digit code"
              />
              <button
                type="button"
                onClick={() => setShowCode((v) => !v)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 ${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
              >
                {showCode ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p
              className={`mt-1 text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              Customers can enter this 6-digit code in place of an OTP to log
              in.
            </p>
          </div>

          <div
            className={`border rounded-md p-4 ${isDarkMode ? "bg-yellow-900/20 border-yellow-700" : "bg-yellow-50 border-yellow-200"}`}
          >
            <h3
              className={`text-sm font-medium mb-1 ${isDarkMode ? "text-yellow-300" : "text-yellow-800"}`}
            >
              Keep this code private
            </h3>
            <p
              className={`text-sm ${isDarkMode ? "text-yellow-200" : "text-yellow-700"}`}
            >
              Anyone with this code can log into any customer account on this
              store. Share it only with trusted staff.
            </p>
          </div>

          <div
            className={`flex justify-end space-x-3 pt-6 border-t ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}
          >
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!/^\d{6}$/.test(code) || isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save Code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerCode;
