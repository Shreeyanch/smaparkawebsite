/* eslint-disable react/prop-types */
import { useState } from "react";
import { countryCodes } from "../../../config/countryCodes";

const LoginStep = ({ store, onSubmitPhone, onSubmitEmail, isLoading, cooldownSeconds, hint }) => {
  const [value, setValue] = useState("");
  const [countryCode, setCountryCode] = useState("+977");

  const requireEmail = !!store.requireEmailOTP;
  const requirePhone = !!store.requirePhoneOTP;
  // isEmailOnly: only email accepted (email OTP or non-OTP fallback), no phone option
  const isEmailOnly = !requirePhone;
  // isPhoneOnly: only phone accepted, no email option
  const isPhoneOnly = requirePhone && !requireEmail;
  const looksLikeEmail = isEmailOnly || value.includes("@");
  const detectedMethod = looksLikeEmail ? "email" : "phone";
  const showCountryCode = isPhoneOnly || (!looksLikeEmail && value.length > 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isPhoneOnly || detectedMethod === "phone") {
      onSubmitPhone(value.trim(), countryCode);
    } else {
      onSubmitEmail(value.trim());
    }
  };

  const subtext = isPhoneOnly
    ? value.length === 0
      ? "Enter your phone number"
      : "We'll send a verification code to your phone"
    : isEmailOnly
    ? "Enter your email to sign in or get started"
    : value.length === 0
    ? "Enter your phone number or email"
    : detectedMethod === "email"
    ? "We'll send a verification code to your email"
    : "We'll send a verification code to your phone";

  return (
    <div className="flex flex-col h-screen overflow-y-auto bg-white font-poppins px-6 pb-8">
      {/* Logo */}
      <div className="flex flex-col items-center pt-16 pb-10">
        <img
          src={store.frontLogo || store.logo}
          alt={store.name}
          className="h-20 w-auto object-contain mb-3"
        />
        <p className="text-xs text-gray-400 tracking-wide">{store.name}</p>
      </div>

      {/* Heading */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Sign in to continue
        </h1>
        <p className="text-sm text-gray-400">{subtext}</p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          inputMode={
            isPhoneOnly
              ? "numeric"
              : isEmailOnly
              ? "email"
              : detectedMethod === "email"
              ? "email"
              : "numeric"
          }
          placeholder={
            isPhoneOnly ? "Phone number" : isEmailOnly ? "Email address" : "Phone or email"
          }
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          autoFocus
          required
          className="w-full border-b-2 border-gray-200 focus:border-seagreen-100 bg-transparent py-3 text-lg text-gray-900 placeholder-gray-300 outline-none transition-colors"
        />

        {/* Country code — for phone-only stores (always) or when phone detected in combined mode */}
        {showCountryCode && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Country code</span>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="border-b border-gray-200 focus:border-seagreen-100 bg-transparent py-1 text-sm text-gray-700 outline-none transition-colors"
            >
              {countryCodes.map(({ code, dial_code }) => (
                <option key={code} value={dial_code}>
                  {dial_code}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="mt-6 w-full font-semibold py-4 rounded-2xl text-base transition-opacity disabled:opacity-40"
          style={{
            backgroundColor: store.loyaltyCard?.cardColor || "#275b44",
            color: store.loyaltyCard?.textColor || "#ffffff",
          }}
        >
          {isLoading ? "Sending code…" : "Continue"}
        </button>

        {hint && (
          <p className="text-sm text-slate-500 text-center mt-2">
            {cooldownSeconds > 0 ? `Resend available in ${cooldownSeconds}s` : hint}
          </p>
        )}
      </form>

      {/* Trust note */}
      <p className="text-center text-xs text-gray-400 mt-6">
         Your information is private and secure
      </p>

      {/* Powered by */}
      {store.services?.powered && (
        <a
          href="https://www.samparka.co/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 mt-auto pt-8 hover:opacity-70 transition-opacity"
        >
          <span className="text-xs text-gray-400">Powered by</span>
          <img src="/SAMPARKA.png" alt="Samparka" className="h-4 w-auto" />
        </a>
      )}
    </div>
  );
};

export default LoginStep;
