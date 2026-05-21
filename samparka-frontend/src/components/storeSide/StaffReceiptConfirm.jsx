import { useState } from "react";
import { Send, CheckCircle2, Star, ArrowLeft, RefreshCcw } from "lucide-react";
import { cn } from "../../lib/utils.js";
import { toast } from "sonner";
import receiptApi from "../../api/receiptApi.js";
import { useTheme } from "../../context/ThemeContext";

const StaffReceiptConfirm = ({ customer, file, totalAmount, receiptNumber = "", ocrProvider, outletId, onNextCustomer, onSameCustomer }) => {
  const { isDarkMode } = useTheme();
  const token = localStorage.getItem("storeToken");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("receipt", file);
      formData.append("customerId", customer._id);
      if (outletId) formData.append("outletId", outletId);
      if (totalAmount) formData.append("totalAmount", String(totalAmount));
      if (receiptNumber) formData.append("receiptNumber", receiptNumber.trim());

      const res = await receiptApi.submitReceiptStaff(formData, token, ocrProvider);
      setResult(res.data?.data || res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit receipt");
    } finally {
      setSubmitting(false);
    }
  };

  const base = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";

  if (result) {
    const awarded = result.pointsAwarded;
    const status = result.status;
    const isPending = status === "pending" || status === "hold";

    return (
      <div className="flex flex-col items-center gap-4 py-2">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center",
          isPending ? "bg-yellow-100 dark:bg-yellow-900/30" : "bg-green-100 dark:bg-green-900/30"
        )}>
          {isPending
            ? <Star size={30} className="text-yellow-500" />
            : <CheckCircle2 size={30} className="text-green-500" />
          }
        </div>

        <div className="text-center">
          <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {isPending ? "Submitted for Review" : "Points Awarded!"}
          </p>
          <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            {customer.name}
          </p>
          {awarded != null && !isPending && (
            <p className="text-3xl font-bold text-green-500 mt-2">+{awarded} pts</p>
          )}
          {isPending && (
            <p className={`text-sm mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Receipt queued for admin approval
            </p>
          )}
        </div>

        <div className="flex gap-2 w-full pt-2">
          <button
            type="button"
            onClick={onSameCustomer}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-sm font-medium transition-colors",
              isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"
            )}
          >
            <RefreshCcw size={13} /> Same Customer
          </button>
          <button
            type="button"
            onClick={onNextCustomer}
            className="flex-1 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
          >
            Next Customer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`rounded-xl border p-4 space-y-3 ${base}`}>
        <p className={`text-xs font-medium uppercase tracking-wide ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          Confirm & Submit
        </p>
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Customer</span>
          <span className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{customer.name}</span>
        </div>
        {receiptNumber && (
          <div className="flex items-center justify-between gap-3">
            <span className={`text-sm shrink-0 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Bill / Invoice #</span>
            <span className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{receiptNumber}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Receipt Total</span>
          <span className="text-xl font-bold text-green-500">Rs. {totalAmount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>OCR Model</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${isDarkMode ? "border-gray-600 text-gray-300" : "border-gray-200 text-gray-500"}`}>
            {ocrProvider === "paddleocr" ? "PaddleOCR" : ocrProvider === "google_vision" ? "Google Vision" : "OpenAI GPT-4o"}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSameCustomer}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2.5 rounded-lg border text-sm transition-colors",
            isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
          )}
        >
          <ArrowLeft size={13} /> Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors",
            submitting ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          )}
        >
          <Send size={14} />
          {submitting ? "Processing..." : "Award Points"}
        </button>
      </div>
    </div>
  );
};

export default StaffReceiptConfirm;
