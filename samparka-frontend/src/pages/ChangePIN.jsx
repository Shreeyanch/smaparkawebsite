import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/config.js";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { Lock, X, Key, Store } from "lucide-react";

const ChangePIN = ({ store, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [oldPIN, setOldPIN] = useState("");
  const [newPIN, setNewPIN] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { authState } = useAuth();
  const { isDarkMode } = useTheme();
  const { userInfo: user, token } = authState;

  // Handle modal animation
  useEffect(() => {
    if (isOpen) {
      setOldPIN("");
      setNewPIN("");
      setIsLoading(false);
      // Trigger animation after a short delay
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300); // Wait for animation to complete
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oldPIN || !newPIN) {
      toast.error("Both fields are required!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(
        `/store/changePIN/${store._id}`,
        { oldPIN, newPIN },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("PIN changed successfully!");
        handleClose();
      } else {
        toast.error(response.data.message || "Failed to change PIN.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black transition-opacity duration-300 flex items-center justify-end z-50 p-4 ${isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
      onClick={handleClose}
    >
      <div
        className={`rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ease-out ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } ${isVisible ? 'translate-x-0' : 'translate-x-full'
          }`}
        style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between p-6 border-b sticky top-0 z-10 rounded-t-lg ${
          isDarkMode 
            ? 'border-gray-600 bg-gray-800' 
            : 'border-gray-200 bg-white'
        }`}>
          <h2 className={`flex gap-2 text-xl font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <Lock className="h-6 w-6" />
            Change PIN
          </h2>
          <button
            onClick={handleClose}
            className={`transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-gray-200' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Store Info */}
        <div className="px-6 pt-4">
          <div className={`flex items-center gap-2 mb-4 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <Store className="h-5 w-5" />
            <span className="text-sm font-medium">Store: {store?.name}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 relative">
          {/* Loading Spinner - only show during form submission */}
          {isLoading && (
            <div className={`absolute inset-0 bg-opacity-75 flex items-center justify-center rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <LoadingSpinner />
            </div>
          )}

          {/* Old PIN */}
          <div>
            <label className={`flex gap-2 text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <Key className="h-5 w-5" />
              Current PIN *
            </label>
            <input
              type="password"
              id="oldPin"
              name="oldPin"
              minLength={4}
              maxLength={4}
              value={oldPIN}
              onChange={(e) => setOldPIN(e.target.value)}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter current PIN"
            />
            <p className={`mt-1 text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Enter your current 4-digit PIN
            </p>
          </div>

          {/* New PIN */}
          <div>
            <label className={`flex gap-2 text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <Lock className="h-5 w-5" />
              New PIN *
            </label>
            <input
              type="password"
              id="newPin"
              name="newPin"
              value={newPIN}
              minLength={4}
              maxLength={4}
              onChange={(e) => setNewPIN(e.target.value)}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter new PIN"
            />
            <p className={`mt-1 text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Choose a new 4-digit PIN for your store
            </p>
          </div>

          {/* Security Notice */}
          <div className={`border rounded-md p-4 ${
            isDarkMode 
              ? 'bg-green-900/20 border-green-700' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Lock className={`h-5 w-5 ${
                  isDarkMode ? 'text-green-400' : 'text-green-400'
                }`} />
                <h3 className={`text-sm font-medium ${
                  isDarkMode ? 'text-green-300' : 'text-green-800'
                }`}>
                  Security Notice
                </h3>
              </div>

              <div className={`mt-2 text-sm ${
                isDarkMode ? 'text-green-200' : 'text-green-700'
              }`}>
                <p>
                  Your PIN is used to secure access to your store. Make sure to:
                </p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Choose a unique 4-digit combination</li>
                  <li>Don't share your PIN with unauthorized personnel</li>
                  <li>Change your PIN regularly for better security</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`flex justify-end space-x-3 pt-6 border-t ${
            isDarkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!oldPIN || !newPIN || isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Changing..." : "Change PIN"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePIN;
