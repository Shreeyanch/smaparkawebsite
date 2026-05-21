import { useState, useEffect, useCallback } from "react";
import { CheckCircle, AlertTriangle, XCircle, ChevronLeft, Loader2 } from "lucide-react";
import TotalAmountSelector from "./TotalAmountSelector";

const ConfidenceBadge = ({ confidence }) => {
  if (confidence >= 0.8) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle size={12} /> High confidence
      </span>
    );
  }
  if (confidence >= 0.5) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        <AlertTriangle size={12} /> Medium confidence
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
      <XCircle size={12} /> Low confidence — please check fields
    </span>
  );
};

const ReceiptConfirmScreen = ({ file, extracted, onConfirm, onBack, submitting }) => {
  const [form, setForm] = useState({
    storeName: "",
    customerName: "",
    receiptNumber: "",
    receiptDate: "",
    totalAmount: "",
  });

  useEffect(() => {
    if (extracted) {
      setForm({
        storeName: extracted.storeName || "",
        customerName: extracted.customerName || "",
        receiptNumber: extracted.receiptNumber || "",
        receiptDate: extracted.receiptDate || "",
        totalAmount: extracted.totalAmount != null ? String(extracted.totalAmount) : "",
      });
    }
  }, [extracted]);

  const imageUrl = file ? URL.createObjectURL(file) : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const total = parseFloat(form.totalAmount);
    if (!total || isNaN(total) || total <= 0) return;
    onConfirm({
      confirmedData: {
        storeName: form.storeName || null,
        customerName: form.customerName || null,
        receiptNumber: form.receiptNumber || null,
        receiptDate: form.receiptDate || null,
        totalAmount: total,
      },
    });
  };

  const field = (label, key, type = "text", required = false) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        required={required}
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        step={type === "number" ? "0.01" : undefined}
        min={type === "number" ? "0" : undefined}
      />
    </div>
  );

  const handleTotalAmountChange = useCallback((value) => {
    setForm((f) => ({ ...f, totalAmount: value }));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Back link */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 self-start"
      >
        <ChevronLeft size={16} /> Re-upload
      </button>

      {/* Receipt thumbnail + confidence */}
      {imageUrl && (
        <div className="flex items-start gap-3">
          <img
            src={imageUrl}
            alt="Receipt preview"
            className="w-20 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shrink-0"
          />
          <div className="flex flex-col gap-1.5 pt-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Confirm details</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Edit any fields the AI got wrong</p>
            <ConfidenceBadge confidence={extracted?.confidence ?? 0} />
            {extracted?.ocrProvider && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Scanned by {
                  extracted.ocrProvider === "paddleocr" ? "PaddleOCR" :
                  extracted.ocrProvider === "google_vision" ? "Google Vision" :
                  extracted.ocrProvider === "gemini" ? "Gemini Flash-Lite" :
                  extracted.ocrProvider
                }
              </p>
            )}
          </div>
        </div>
      )}

      {/* Editable form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {field("Store Name", "storeName")}
        {field("Customer Name", "customerName")}
        {field("Bill / Receipt #", "receiptNumber")}
        {field("Date", "receiptDate", "date")}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Total Amount<span className="text-red-500 ml-0.5">*</span>
          </label>
          <TotalAmountSelector
            candidates={extracted?.totalCandidates || []}
            amountValue={form.totalAmount}
            onAmountChange={handleTotalAmountChange}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 w-full py-3 rounded-xl bg-green-600 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <><Loader2 size={16} className="animate-spin" /> Submitting…</>
          ) : (
            "Looks Good — Submit"
          )}
        </button>
      </form>
    </div>
  );
};

export default ReceiptConfirmScreen;
