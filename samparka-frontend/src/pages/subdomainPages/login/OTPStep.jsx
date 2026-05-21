/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Mail, Smartphone } from "lucide-react";

const OTPStep = ({
  store,
  method,
  identifier,
  countryCode,
  onVerify,
  onResend,
  onBack,
  isLoading,
  error,
  expirySeconds = 0,
  resendSeconds = 0,
}) => {
  const cardColor = store?.loyaltyCard?.cardColor || "#016e49";
  const textColor = store?.loyaltyCard?.textColor || "#ffffff";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 120);
    setOtp(["", "", "", "", "", ""]);
  }, []);

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!data) return;
    const next = [...otp];
    data.split("").forEach((c, i) => { next[i] = c; });
    setOtp(next);
    inputRefs.current[Math.min(data.length, 5)]?.focus();
  };

  const handleResend = async () => {
    await onResend();
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const maskedIdentifier =
    method === "phone"
      ? `${countryCode} ${"•".repeat(Math.max(0, identifier.length - 3))}${identifier.slice(-3)}`
      : identifier.replace(/(.{2}).+(@.+)/, "$1••••$2");

  const isExpired = expirySeconds === 0;
  const otpFilled = otp.join("").length === 6;
  const MethodIcon = method === "phone" ? Smartphone : Mail;

  return (
    <div className="min-h-screen bg-slate-50 font-poppins px-6 py-8">
      <div className="mx-auto flex min-h-[92vh] w-full max-w-md flex-col">
        <button
          onClick={onBack}
          className="inline-flex w-fit items-center gap-2 rounded-lg px-1 py-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${cardColor}18`, color: cardColor }}
            >
              <MethodIcon size={20} strokeWidth={2.2} />
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-slate-900">Enter verification code</h1>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            We sent a 6-digit code to <span className="font-semibold text-slate-700">{maskedIdentifier}</span>
          </p>

          {!isExpired && (
            <p className={`mt-4 text-sm font-medium ${expirySeconds < 60 ? "text-red-600" : "text-slate-500"}`}>
              Code expires in {fmt(expirySeconds)}
            </p>
          )}

          <div className="mt-6 grid grid-cols-6 gap-2">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={isLoading || isExpired}
            className={`h-14 w-full rounded-xl border text-center text-xl font-semibold outline-none transition-colors ${
              error
                ? "border-red-400 text-red-600"
                : digit
                  ? "border-seagreen-100 text-slate-900"
                  : "border-slate-200 text-slate-900"
            } focus:border-seagreen-100 focus:ring-2 focus:ring-seagreen-100/30 disabled:bg-slate-100 disabled:text-slate-400`}
          />
        ))}
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          {isExpired && <p className="mt-4 text-sm text-red-600">Code expired. Request a new code to continue.</p>}

          <button
            onClick={() => onVerify(otp.join(""))}
            disabled={isLoading || !otpFilled || isExpired}
            className="mt-6 w-full rounded-xl py-3.5 text-base font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: cardColor, color: textColor }}
          >
            {isLoading ? "Verifying..." : "Verify"}
          </button>

          <div className="mt-5 text-center">
            {resendSeconds > 0 ? (
              <p className="text-sm text-slate-500">
                Resend code in <span className="font-semibold text-slate-700">{resendSeconds}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-sm font-semibold transition-opacity hover:opacity-75"
                style={{ color: cardColor }}
              >
                Resend code
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPStep;
