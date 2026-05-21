import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Verification = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const { userInfo, token } = location.state;

  const handleChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtp(value);
    }
  };

  const handleVerify = () => {
    if (otp === "277353") {
      // Save user info and token in localStorage
      localStorage.setItem("userInfo", userInfo);
      localStorage.setItem("token", token);
      setMessage("OTP Verified Successfully!");
      navigate("/loyality");
    } else {
      setMessage("Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className=" bg-white p-10 rounded-xl shadow-xl border-2 border-gray-200">
        <h1 className="text-2xl font-bold mb-4">Verify OTP</h1>
        <p className="text-gray-600 mb-6">
          Enter the 6-digit OTP sent to your mobile/email.
        </p>

        <div className="w-full max-w-sm">
          <input
            type="text"
            value={otp}
            onChange={handleChange}
            placeholder="Enter OTP"
            className="w-full px-4 py-2 text-lg border border-gray-300 rounded-lg focus:ring-green-500 focus:border-blue-500 outline-none"
          />
          <button
            onClick={handleVerify}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-lg transition"
          >
            Verify OTP
          </button>
        </div>

        {message && (
          <div className="mt-4 text-lg font-semibold text-center">
            <p
              className={
                message.includes("Success") ? "text-green-600" : "text-red-600"
              }
            >
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verification;
