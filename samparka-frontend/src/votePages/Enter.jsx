import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CryptoJS from "crypto-js";
import Cookies from "js-cookie";
import api from "../api/config";
import { toast } from "sonner";

const sendOTP = async (phoneNumber, otp) => {
  try {
    const response = await api.post("/vote/send-otp", {
      phoneNumber,
      otp,
    });
    if (response.data.success) {
      return { success: true };
    } else {
      return { success: false, error: response.data.error };
    }
  } catch (error) {
    return {
      success: false,
      error: error.response ? error.response.data : error.message,
    };
  }
};

const Enter = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Generate 6-digit random OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Send OTP
      const result = await sendOTP(phoneNumber, otp);

      if (result.success) {
        // Encrypt data with CryptoJS
        const data = { phoneNumber, otp };
        const encrypted = CryptoJS.AES.encrypt(
          JSON.stringify(data),
          import.meta.env.VITE_CLIENT_SECRET_KEY // keep this in .env
        ).toString();

        // Store encrypted data in cookie for 5 minutes
        Cookies.set("vote_auth", encrypted, { expires: 1 / 288 }); // 5 minutes = 1/288 day

        // Navigate to OTP page
        navigate("/otp");
      } else {
        toast.error(
          result?.error?.message || "Failed to send OTP. Please try again."
        );
      }
      // localStorage.setItem("phoneNumber", phoneNumber);
      // navigate("/vote");
    } catch (error) {
      console.error("Error during form submission:", error);
      toast.error("An error occurred. Please try again.");
      return;
    }
    // setPhoneNumber("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <h2 className="text-white text-2xl font-semibold mb-6 text-center">
            Enter Your Phone Number
          </h2>
          <label htmlFor="phone" className="block text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            placeholder="98XXXXXXXX"
            className="border border-gray-600 bg-gray-700 text-white rounded px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <button
            type="submit"
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition duration-300"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Enter;
