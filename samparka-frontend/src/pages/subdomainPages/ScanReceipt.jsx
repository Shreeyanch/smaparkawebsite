import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useStoreAuth } from "../../context/StoreAuthContext";
import receiptApi from "../../api/receiptApi";
import ReceiptUploadForm from "../../components/receipt/ReceiptUploadForm";
import ReceiptConfirmScreen from "../../components/receipt/ReceiptConfirmScreen";
import ReceiptSubmissionResult from "../../components/receipt/ReceiptSubmissionResult";
import ReceiptHistoryList from "../../components/receipt/ReceiptHistoryList";

const TABS = [
  { id: "upload", label: "Upload Receipt" },
  { id: "history", label: "My Submissions" },
];

// step: "upload" | "confirm" | "result"

const ScanReceipt = () => {
  const { authState } = useStoreAuth();
  const { token } = authState;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { storeData } = queryClient.getQueryData(["store"]) || {};

  const [activeTab, setActiveTab] = useState("upload");
  const [step, setStep] = useState("upload");
  const [extracting, setExtracting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingOutletId, setPendingOutletId] = useState(null);
  const [result, setResult] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState("paddleocr");

  if (!storeData?.receiptScan?.enabled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
          Receipt scanning is not enabled for this store.
        </p>
        <button
          onClick={() => navigate("/loyality")}
          className="mt-4 text-green-600 text-sm font-medium"
        >
          Go back
        </button>
      </div>
    );
  }

  // Step 1: Upload → send to backend OCR extract endpoint (no DB write)
  const handleUpload = async ({ file, outletId }) => {
    setExtracting(true);
    try {
      const formData = new FormData();
      formData.append("receipt", file);
      const response = await receiptApi.extractReceipt(formData, token, selectedProvider);
      setPendingFile(file);
      setPendingOutletId(outletId || null);
      setExtracted(response.data?.data || response.data);
      setStep("confirm");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to read receipt — please try again");
    } finally {
      setExtracting(false);
    }
  };

  // Step 2: Confirm → submit with (potentially edited) data
  const handleConfirm = async ({ confirmedData }) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("receipt", pendingFile);
      if (pendingOutletId) formData.append("outletId", pendingOutletId);
      // Pass confirmed overrides so the backend can use them if available
      if (confirmedData.storeName) formData.append("storeName", confirmedData.storeName);
      if (confirmedData.receiptNumber) formData.append("receiptNumber", confirmedData.receiptNumber);
      if (confirmedData.receiptDate) formData.append("receiptDate", confirmedData.receiptDate);
      if (confirmedData.totalAmount) formData.append("totalAmount", String(confirmedData.totalAmount));

      const response = await receiptApi.submitReceipt(formData, token);
      setResult(response.data);
      queryClient.invalidateQueries(["receiptHistory"]);
      setStep("result");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit receipt");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setExtracted(null);
    setPendingFile(null);
    setPendingOutletId(null);
    setResult(null);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    handleReset();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/loyality")}
          className="text-gray-600 dark:text-gray-300 p-1 -ml-1"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-base font-semibold text-gray-900 dark:text-white">
          Scan Receipt
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "upload" ? (
          <>
            {step === "upload" && (
              <>
                {/* OCR Model Selector (Admin Testing) */}
                <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    OCR Model (Admin Test)
                  </label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="radio"
                        name="provider"
                        value="paddleocr"
                        checked={selectedProvider === "paddleocr"}
                        onChange={(e) => setSelectedProvider(e.target.value)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          PaddleOCR
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Fast, rule-based parsing
                        </p>
                      </div>
                    </label>
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="radio"
                        name="provider"
                        value="google_vision"
                        checked={selectedProvider === "google_vision"}
                        onChange={(e) => setSelectedProvider(e.target.value)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Google Cloud Vision
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          AI-powered, slower but more accurate
                        </p>
                      </div>
                    </label>
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="radio"
                        name="provider"
                        value="gemini"
                        checked={selectedProvider === "gemini"}
                        onChange={(e) => setSelectedProvider(e.target.value)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Gemini Flash-Lite
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Google Gemini 2.5 Flash-Lite vision model
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <ReceiptUploadForm
                  onSubmit={handleUpload}
                  submitting={extracting}
                  storeData={storeData}
                  submitLabel="Scan Receipt"
                />
              </>
            )}
            {step === "confirm" && (
              <ReceiptConfirmScreen
                file={pendingFile}
                extracted={extracted}
                onConfirm={handleConfirm}
                onBack={handleReset}
                submitting={submitting}
              />
            )}
            {step === "result" && (
              <ReceiptSubmissionResult result={result} onReset={handleReset} />
            )}
          </>
        ) : (
          <ReceiptHistoryList token={token} />
        )}
      </div>
    </div>
  );
};

export default ScanReceipt;
