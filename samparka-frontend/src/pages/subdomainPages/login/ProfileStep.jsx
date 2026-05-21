/* eslint-disable react/prop-types */
import { useState, useRef } from "react";
import { countryCodes } from "../../../config/countryCodes";
import api from "../../../api/config";
import TermsAndConditions from "../../../components/termsAndConditions";

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-seagreen-100 focus:ring-4 focus:ring-seagreen-100/15";

const ProfileStep = ({ store, method, onSubmit, isLoading, error }) => {
  const cardColor = store?.loyaltyCard?.cardColor || "#016e49";
  const textColor = store?.loyaltyCard?.textColor || "#ffffff";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+977");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const acceptTerms = () => {
    setTermsAccepted(true);
    setShowTerms(false);
  };
  const monthRef = useRef(null);
  const dayRef = useRef(null);

  const updateDob = (day, month, year) => {
    if (day && month && year && year.length === 4) {
      setDob(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
    } else {
      setDob("");
    }
  };

  const [phoneError, setPhoneError] = useState("");
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [checkingEmail, setCheckingEmail] = useState(false);

  const handleEmailBlur = async () => {
    if (!email || !email.includes("@")) return;
    setCheckingEmail(true);
    try {
      const res = await api.get(`/customer/check-email/${store.url}?email=${encodeURIComponent(email.trim())}`);
      if (res.data.success && res.data.exists) {
        setEmailError("This email is already registered with another account");
      } else {
        setEmailError("");
      }
    } catch {
      // silent fail — let backend handle on submit
    } finally {
      setCheckingEmail(false);
    }
  };

  const handlePhoneBlur = async () => {
    if (!phone || phone.length < 5) return;
    setCheckingPhone(true);
    try {
      const res = await api.get(`/customer/check-phone/${store.url}?phone=${phone}`);
      if (res.data.success && res.data.exists) {
        setPhoneError("This phone number is already registered with another account");
      } else {
        setPhoneError("");
      }
    } catch {
      // silent fail — let backend handle on submit
    } finally {
      setCheckingPhone(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, email, phone, countryCode, gender, dob, termsAccepted });
  };

  return (
    <>
    {showTerms && (
      <TermsAndConditions onAccept={acceptTerms} />
    )}
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbfa_0%,#eef5f3_100%)] px-4 py-6 font-poppins sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.45)]">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: cardColor }}>Account setup</p>
          <h1 className="mt-3 text-[30px] font-semibold leading-tight text-slate-900">Complete your profile</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Add your details so we can personalize your rewards and updates.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Full name</label>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputCls}
          />
          </div>

          {method === "phone" && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              onBlur={handleEmailBlur}
              required
              className={`${emailError ? "ring-1 ring-red-500 border-red-300 focus:border-red-400 focus:ring-red-400/20" : ""} ${inputCls}`}
            />
            {emailError && (
              <p className="mt-1.5 text-sm text-red-600">{emailError}</p>
            )}
            </div>
          )}

          {method === "email" && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Phone number</label>
              <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-28 rounded-xl border border-slate-200 bg-white px-3 py-3.5 text-sm text-slate-700 outline-none transition focus:border-seagreen-100 focus:ring-4 focus:ring-seagreen-100/15"
              >
                {countryCodes.map(({ code, dial_code }) => (
                  <option key={code} value={dial_code}>{dial_code}</option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ""));
                  if (phoneError) setPhoneError("");
                }}
                onBlur={handlePhoneBlur}
                required
                className={`flex-1 ${phoneError ? "ring-1 ring-red-500 border-red-300 focus:border-red-400 focus:ring-red-400/20" : ""} ${inputCls}`}
              />
              </div>
              {phoneError && (
                <p className="mt-1.5 text-sm text-red-600">{phoneError}</p>
              )}
            </div>
          )}

          {store.needCustomerGender && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className={inputCls}
            >
              <option value="" disabled>Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">Others</option>
            </select>
            </div>
          )}

          {store.needCustomerDOB && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Date of birth</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="YYYY"
                  value={dobYear}
                  onChange={(e) => {
                    const v = e.target.value.slice(0, 4);
                    if (v.length === 4 && parseInt(v) > new Date().getFullYear()) return;
                    setDobYear(v);
                    updateDob(dobDay, dobMonth, v);
                    if (v.length === 4) monthRef.current?.focus();
                  }}
                  required
                  className="min-w-0 flex-[2] rounded-xl border border-slate-200 bg-white px-3 py-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-seagreen-100 focus:ring-4 focus:ring-seagreen-100/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <input
                  ref={monthRef}
                  type="number"
                  placeholder="MM"
                  min="1"
                  max="12"
                  value={dobMonth}
                  onChange={(e) => {
                    const v = e.target.value.slice(0, 2);
                    setDobMonth(v);
                    updateDob(dobDay, v, dobYear);
                    if (v.length === 2) dayRef.current?.focus();
                  }}
                  required
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-seagreen-100 focus:ring-4 focus:ring-seagreen-100/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <input
                  ref={dayRef}
                  type="number"
                  placeholder="DD"
                  min="1"
                  max="31"
                  value={dobDay}
                  onChange={(e) => {
                    const v = e.target.value.slice(0, 2);
                    setDobDay(v);
                    updateDob(v, dobMonth, dobYear);
                  }}
                  required
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-seagreen-100 focus:ring-4 focus:ring-seagreen-100/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => {
                if (e.target.checked) acceptTerms();
                else setTermsAccepted(false);
              }}
              className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-seagreen-100"
            />
            <label htmlFor="terms" className="cursor-pointer text-sm text-slate-600">
              I accept the Terms & Conditions
            </label>
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-[11px] font-bold text-slate-500 transition hover:border-seagreen-100 hover:text-seagreen-100"
            >
              i
            </button>
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || checkingPhone || checkingEmail || !!phoneError || !!emailError || !name || (method === "phone" && !email) || (method === "email" && !phone) || (store.needCustomerDOB && !dob) || !termsAccepted}
            className="mt-auto w-full rounded-xl py-3.5 text-base font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: cardColor, color: textColor }}
          >
            {(checkingPhone || checkingEmail) ? "Checking..." : isLoading ? "Setting up..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
    </>
  );
};

export default ProfileStep;
