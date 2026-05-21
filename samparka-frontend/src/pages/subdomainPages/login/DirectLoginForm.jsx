/* eslint-disable react/prop-types */
import { useState } from "react";
import { countryCodes } from "../../../config/countryCodes";

const inputCls =
  "w-full border-b-2 border-gray-200 focus:border-seagreen-100 bg-transparent py-3 text-base text-gray-900 placeholder-gray-400 outline-none transition-colors";

const DirectLoginForm = ({ store, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
  });
  const [countryCode, setCountryCode] = useState("+977");

  const set = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, countryCode });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-poppins px-6 pb-8">
      {/* Logo + store name */}
      <div className="flex flex-col items-center pt-16 pb-8">
        <img
          src={store.frontLogo || store.logo}
          alt={store.name}
          className="h-20 w-auto object-contain mb-3"
        />
        <p className="text-xs text-gray-400 tracking-wide">{store.name}</p>
      </div>

      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          Join {store.name}
        </h1>
        <p className="text-sm text-gray-400">Sign in or create your loyalty account</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Your name</label>
          <input
            type="text"
            placeholder="Full name"
            value={formData.name}
            onChange={set("name")}
            required
            className={inputCls}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={set("email")}
            required
            className={inputCls}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Phone</label>
          <div className="flex gap-2">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-20 border-b-2 border-gray-200 focus:border-seagreen-100 bg-transparent py-3 text-sm text-gray-700 outline-none transition-colors"
            >
              {countryCodes.map(({ code, dial_code }) => (
                <option key={code} value={dial_code}>{dial_code}</option>
              ))}
            </select>
            <input
              type="tel"
              placeholder="Phone number"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value.replace(/\D/g, "") }))}
              required
              className={`flex-1 ${inputCls}`}
            />
          </div>
        </div>

        {/* Gender */}
        {store.needCustomerGender && (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Gender</label>
            <select value={formData.gender} onChange={set("gender")} required className={inputCls}>
              <option value="" disabled>Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">Others</option>
            </select>
          </div>
        )}

        {/* DOB */}
        {store.needCustomerDOB && (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Date of birth</label>
            <input
              type="date"
              value={formData.dob}
              onChange={set("dob")}
              required
              className={inputCls}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !formData.name || !formData.email || !formData.phone}
          className="mt-auto w-full bg-seagreen-100 text-white font-semibold py-4 rounded-2xl text-base transition-opacity disabled:opacity-40"
        >
          {isLoading ? "Please wait…" : "Continue"}
        </button>
      </form>

      {/* Powered by */}
      {store.services?.powered && (
        <a
          href="https://www.samparka.co/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 pt-8 hover:opacity-70 transition-opacity"
        >
          <span className="text-xs text-gray-400">Powered by</span>
          <img src="/SAMPARKA.png" alt="Samparka" className="h-4 w-auto" />
        </a>
      )}
    </div>
  );
};

export default DirectLoginForm;
