import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "../api/config";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { User, X, Lock, Mail } from "lucide-react";

const EditUser = ({ user, setIsEditModalOpen, handleChangeUserStatus, fetchUsers }) => {
  const [email, setEmail] = useState(user.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePassword, setChangePassword] = useState(false);
  const [status, setStatus] = useState(user.status || "active");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { authState } = useAuth();
  const { isDarkMode } = useTheme();
  const { token } = authState;

  // Trigger animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsEditModalOpen(false);
    }, 300); // Wait for animation to complete
  };

  const handleSave = async(e) => {
    e.preventDefault();
    if (changePassword && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    try {
      // Handle status change if it's different from original
      if (status !== user.status) {
        await handleChangeUserStatus(user._id, status);
      }

      // Handle email and password update
      const response = await api.put(
        `/admin/editUser/${user._id}`,
        {
          email,
          password: changePassword ? password : undefined,
          confirm_password: changePassword ? confirmPassword : undefined,
        },
        {
          headers: { token },
        }
      );
      if (response.data.success) {
        toast.success("User updated successfully", {
          duration: 2000,
        });
        // Refresh the users list
        if (fetchUsers) {
          fetchUsers();
        }
        setIsVisible(false);
        setTimeout(() => {
          setIsEditModalOpen(false);
        }, 300);
      } else {
        toast.error(response.data.message || "Failed to update user");
      }
    } catch (err) {
      toast.error("Failed to update user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black transition-opacity duration-300 ease-out flex items-center justify-end z-50 p-4 ${
        isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`rounded-lg max-w-lg w-full max-h-[90vh] flex flex-col transform transition-transform duration-300 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        } ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} 
        style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Fixed */}
        <div className={`flex items-center justify-between p-6 border-b sticky top-0 z-10 rounded-t-lg ${
          isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <h2 className={`flex gap-2 items-center text-xl font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <User className="h-5 w-5" />
            Edit User
          </h2>
          <button
            onClick={handleClose}
            className={`transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-white' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
          <form onSubmit={handleSave} className="p-6 space-y-6">
            {/* Account Status Section */}
            <div>
              <h3 className={`text-lg font-medium mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Account Status</h3>
              <div className={`border rounded-lg p-4 ${
                isDarkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  User Status
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={status === "active"}
                      onChange={(e) => setStatus(e.target.value)}
                      className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <span className={`ml-2 text-sm flex items-center ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <svg className="w-2 h-2 mr-1.5 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx={4} cy={4} r={3} />
                      </svg>
                      Active
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={status === "inactive"}
                      onChange={(e) => setStatus(e.target.value)}
                      className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <span className={`ml-2 text-sm flex items-center ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <svg className="w-2 h-2 mr-1.5 text-red-400" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx={4} cy={4} r={3} />
                      </svg>
                      Inactive
                    </span>
                  </label>
                </div>
                <p className={`mt-2 text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {status === "active" 
                    ? "User can log in and access their account." 
                    : "User cannot log in and access is restricted."
                  }
                </p>
              </div>
            </div>

            {/* Basic Information Section */}
            <div>
              <h3 className={`text-lg font-medium mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Basic Information</h3>
              <div>
                <label className={`flex gap-2 items-center text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Mail className="h-4 w-4" />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 accent-black ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            {/* Password Section */}
            <div>
              <h3 className={`flex gap-2 items-center text-lg font-medium mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Lock className="h-5 w-5" />
                Password Settings
              </h3>
              <div className={`border rounded-lg p-4 ${
                isDarkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="changePassword"
                    checked={changePassword}
                    onChange={() => setChangePassword(!changePassword)}
                    className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500 accent-black"
                  />
                  <span className={`ml-2 text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Change user password
                  </span>
                </label>

                {changePassword && (
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        New Password *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 accent-black ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Confirm New Password *
                      </label>
                      <input
                        type="password"
                        name="confirm_password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 accent-black ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                )}

                {!changePassword && (
                  <div className={`text-sm p-3 rounded-md ${
                    isDarkMode 
                      ? 'text-gray-300 bg-gray-700' 
                      : 'text-gray-600 bg-gray-50'
                  }`}>
                    <p>Password will remain unchanged. Check the box above to update the user's password.</p>
                  </div>
                )}
              </div>
            </div>

            {/* User Information Display */}
         
          </form>
        </div>

        {/* Action Buttons - Fixed Footer */}
        <div className={`flex justify-end space-x-3 p-6 border-t rounded-b-lg ${
          isDarkMode 
            ? 'border-gray-700 bg-gray-800' 
            : 'border-gray-200 bg-white'
        }`}>
          <button
            type="button"
            onClick={handleClose}
            className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Updating..." : "Update User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
