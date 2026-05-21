import { useState, useEffect } from "react";
import { User, Camera, CheckCircle } from "lucide-react";
import { cn } from "../../lib/utils.js";
import { useTheme } from "../../context/ThemeContext";
import { useQueryClient } from "@tanstack/react-query";
import StaffCustomerSearch from "./StaffCustomerSearch.jsx";
import StaffReceiptCapture from "./StaffReceiptCapture.jsx";
import StaffReceiptConfirm from "./StaffReceiptConfirm.jsx";

const STEPS = [
  { id: 1, label: "Find Customer", icon: User },
  { id: 2, label: "Scan Receipt", icon: Camera },
  { id: 3, label: "Confirm", icon: CheckCircle },
];

const StepIndicator = ({ currentStep, isDarkMode }) => (
  <div className="flex items-center justify-center gap-1 mb-5">
    {STEPS.map((s, i) => {
      const Icon = s.icon;
      const done = currentStep > s.id;
      const active = currentStep === s.id;
      return (
        <div key={s.id} className="flex items-center gap-1">
          <div className="flex flex-col items-center gap-1">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
              done ? "bg-green-500"
                : active ? isDarkMode ? "bg-green-600" : "bg-green-600"
                : isDarkMode ? "bg-gray-700" : "bg-gray-100"
            )}>
              <Icon
                size={14}
                className={done || active ? "text-white" : isDarkMode ? "text-gray-500" : "text-gray-400"}
              />
            </div>
            <span className={cn(
              "text-[10px] font-medium whitespace-nowrap",
              active ? "text-green-500"
                : done ? isDarkMode ? "text-gray-400" : "text-gray-500"
                : isDarkMode ? "text-gray-600" : "text-gray-400"
            )}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn(
              "w-6 h-0.5 mb-4 transition-colors",
              currentStep > s.id
                ? "bg-green-500"
                : isDarkMode ? "bg-gray-700" : "bg-gray-200"
            )} />
          )}
        </div>
      );
    })}
  </div>
);

const StaffScanReceiptTab = ({ store }) => {
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  const outletId = store?.services?.multipleOutlets
    ? localStorage.getItem("outletId") || null
    : null;

  // Read ocrProvider from cache immediately, then refetch to pick up any
  // admin changes (the ["store"] query uses staleTime:Infinity so it never
  // auto-refreshes — we force a one-time refetch on mount).
  const [ocrProvider, setOcrProvider] = useState(
    store?.receiptScan?.ocrProvider || "paddleocr"
  );

  useEffect(() => {
    queryClient.refetchQueries({ queryKey: ["store"] }).then(() => {
      const fresh = queryClient.getQueryData(["store"])?.storeData?.receiptScan?.ocrProvider;
      if (fresh) setOcrProvider(fresh);
    });
  }, []);

  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState(null);
  const [captureData, setCaptureData] = useState(null);

  const handleSelectCustomer = (c) => {
    setCustomer(c);
    setStep(2);
  };

  const handleCaptureContinue = (data) => {
    setCaptureData(data);
    setStep(3);
  };

  const resetToCustomerSearch = () => {
    setCustomer(null);
    setCaptureData(null);
    setStep(1);
  };

  const resetToCapture = () => {
    setCaptureData(null);
    setStep(2);
  };

  return (
    <div className="space-y-1">
      <StepIndicator currentStep={step} isDarkMode={isDarkMode} />

      {step === 1 && (
        <StaffCustomerSearch
          storeId={store._id}
          onSelect={handleSelectCustomer}
        />
      )}

      {step === 2 && (
        <StaffReceiptCapture
          customer={customer}
          ocrProvider={ocrProvider}
          onContinue={handleCaptureContinue}
          onBack={() => { setCustomer(null); setStep(1); }}
        />
      )}

      {step === 3 && (
        <StaffReceiptConfirm
          customer={customer}
          file={captureData.file}
          totalAmount={captureData.totalAmount}
          receiptNumber={captureData.extracted?.receiptNumber || ""}
          ocrProvider={ocrProvider}
          outletId={outletId}
          onNextCustomer={resetToCustomerSearch}
          onSameCustomer={resetToCapture}
        />
      )}
    </div>
  );
};

export default StaffScanReceiptTab;
