import React, { useState } from "react";
import logo from "/images.jpeg";
import { User, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { updateAuth, authState } = useAuth();
  const { userInfo: user, token } = authState;

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = async () => {
    setDropdownOpen(!dropdownOpen);
    await updateAuth();
    toast.success("User Logged Out", {
      duration: 1000,
      onAutoClose: () => navigate("/login"),
    });
  };

  return (
    <nav className="flex items-center justify-between bg-stone-800 px-6 py-4 shadow-md sticky top-0 z-10">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <img src={logo} alt="Samparka Logo" className="h-8" />
        <span className="text-lg font-bold text-gray-200">Samparka</span>
      </div>
      {token ? (
        <div className="flex items-center space-x-4">
          {/* Admin-Only Buttons */}
          {/* {user.role === "admin" && (
            <div className="flex space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 text-sm text-white bg-green-800 rounded-md hover:bg-green-900"
              >
                Users
              </button>
              <button
                onClick={() => navigate("/work")}
                className="px-4 py-2 text-sm text-white bg-green-800 rounded-md hover:bg-green-900"
              >
                Work
              </button>
            </div>
          )} */}

          {/* User Icon with Dropdown */}
          <div className="relative">
            <button
              className="relative flex rounded-full bg-green-800 text-sm"
              onClick={toggleDropdown}
            >
              <User className="h-8 w-auto p-1 text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-md">
                <button className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:rounded-md">
                  User Profile
                </button>
                <button
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:rounded-md"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        //   {/* Login Button */}
        <button className="px-4 py-2 text-sm text-white bg-green-800 rounded-md hover:bg-green-900">
          Login
        </button>
      )}
    </nav>
  );
};

export default Navbar;
