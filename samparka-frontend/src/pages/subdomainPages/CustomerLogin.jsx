/* eslint-disable react/prop-types */
import { useQueryClient } from "@tanstack/react-query";
import { useStoreAuth } from "../../context/StoreAuthContext.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import LoadingSpinnerH from "../../components/LoadingSpinnerH.jsx";
import LoginStep from "./login/LoginStep.jsx";
import OTPStep from "./login/OTPStep.jsx";
import ProfileStep from "./login/ProfileStep.jsx";
import NotificationPrompt from "./login/NotificationPrompt.jsx";
import { useLoginFlow } from "./login/useLoginFlow.js";

const CustomerLogin = ({ url }) => {
  const { updateAuth } = useStoreAuth();
  const queryClient = useQueryClient();
  const store = queryClient.getQueryData(["store"])?.storeData;

  const {
    step, setStep, method, identifier, countryCode,
    isLoading, otpError, profileError,
    otpExpirySeconds, otpResendSeconds, loginCooldownSeconds, loginHint,
    handleSendPhoneOTP, handleSendEmailOTP, handleEmailOnlySubmit,
    handleVerifyOTP, handleResendOTP, handleProfileSubmit,
    showNotifPrompt, notifLoading,
    handleNotifAllow, handleNotifSkip,
  } = useLoginFlow({ store: store || {}, updateAuth });

  if (!store)
    return url === "himalayanjavaexpress" ? <LoadingSpinnerH /> : <LoadingSpinner />;

  // Dynamic step list: OTP stores have 3 steps, direct stores have 2
  const steps = (store.requireEmailOTP || store.requirePhoneOTP)
    ? ["identifier", "otp", "profile"]
    : ["identifier", "profile"];
  const stepIndex = steps.indexOf(step);

  return (
    <div className="w-full h-screen overflow-hidden">
      {isLoading && step === "identifier" && <LoadingSpinner />}
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${stepIndex * 100}vw)`, width: `${steps.length * 100}vw` }}
      >
        {/* Step 0 — Identifier */}
        <div style={{ width: "100vw" }}>
          <LoginStep
            store={store}
            onSubmitPhone={handleSendPhoneOTP}
            onSubmitEmail={store.requireEmailOTP ? handleSendEmailOTP : handleEmailOnlySubmit}
            isLoading={isLoading}
            cooldownSeconds={loginCooldownSeconds}
            hint={loginHint}
          />
        </div>

        {/* Step 1 — OTP (OTP stores only) */}
        {(store.requireEmailOTP || store.requirePhoneOTP) && (
          <div style={{ width: "100vw" }}>
            {step !== "identifier" && (
              <OTPStep
                store={store}
                method={method}
                identifier={identifier}
                countryCode={countryCode}
                onVerify={handleVerifyOTP}
                onResend={handleResendOTP}
                onBack={() => setStep("identifier")}
                isLoading={isLoading}
                error={otpError}
                expirySeconds={otpExpirySeconds}
                resendSeconds={otpResendSeconds}
              />
            )}
          </div>
        )}

        {/* Last step — Profile (new users only) */}
        <div style={{ width: "100vw" }}>
          {step === "profile" && (
            <ProfileStep
              store={store}
              method={method}
              onSubmit={handleProfileSubmit}
              isLoading={isLoading}
              error={profileError}
            />
          )}
        </div>
      </div>

      {/* Notification permission prompt — shown after registration or login */}
      {showNotifPrompt && (
        <NotificationPrompt
          onAllow={handleNotifAllow}
          onSkip={handleNotifSkip}
          isLoading={notifLoading}
        />
      )}
    </div>
  );
};

export default CustomerLogin;
