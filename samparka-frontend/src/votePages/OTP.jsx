import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import Cookies from "js-cookie";
import { toast } from "sonner";

const OTP = () => {
  const [userOTP, setUserOTP] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [storedOTP, setStoredOTP] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Read and decrypt the cookie
    const encryptedData = Cookies.get("vote_auth");

    if (encryptedData) {
      try {
        const bytes = CryptoJS.AES.decrypt(
          encryptedData,
          import.meta.env.VITE_CLIENT_SECRET_KEY
        );
        const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        if (decrypted.phoneNumber && decrypted.otp) {
          setPhoneNumber(decrypted.phoneNumber);
          setStoredOTP(decrypted.otp);
        } else {
          throw new Error("Incomplete OTP data");
        }
      } catch (err) {
        console.error("Failed to decrypt cookie", err);
        toast.error("Invalid or expired session. Please re-enter your number.");
        // navigate("/enter");
        return;
      }
    } else {
      console.error("No OTP cookie found");
      toast.error("No OTP found. Please re-enter your phone number.");
      // navigate("/enter");
      return;
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userOTP === storedOTP) {
      // OTP matched
      localStorage.setItem("phoneNumber", phoneNumber);
      Cookies.remove("vote_auth");
      // navigate("/vote");
    } else {
      toast.error("Invalid OTP. Please try again.");
      setUserOTP("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="bg-gray-100 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Verify OTP</h2>

        <>
          <p className="text-gray-600 mb-6">
            Enter the OTP sent to{" "}
            <span className="font-medium">{phoneNumber}</span>
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter OTP"
              value={userOTP}
              onChange={(e) => setUserOTP(e.target.value)}
              required
              className="border border-gray-400 rounded px-4 py-2 w-full mb-4 text-center focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition duration-300"
            >
              Verify
            </button>
          </form>
        </>
      </div>
    </div>
  );
};

export default OTP;
