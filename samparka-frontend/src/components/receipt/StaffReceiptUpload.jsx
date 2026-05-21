import { useState, useRef } from "react";
import { Camera, Send, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import receiptApi from "../../api/receiptApi";

const StaffReceiptUpload = ({ store, customerId, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [outletId, setOutletId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();
  const storeToken = localStorage.getItem("storeToken");

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    fileRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!file || !customerId || submitting) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("receipt", file);
      formData.append("customerId", customerId);
      if (outletId) formData.append("outletId", outletId);

      const res = await receiptApi.submitReceiptStaff(formData, storeToken);
      toast.success(res.data.message || "Receipt submitted successfully");
      onSuccess?.(res.data);
      setFile(null);
      setPreview(null);
      fileRef.current.value = "";
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit receipt");
    } finally {
      setSubmitting(false);
    }
  };

  const outlets = store?.outlets || [];

  return (
    <div className="space-y-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
        Upload Customer Receipt
      </h3>

      <div
        onClick={() => fileRef.current.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
          preview
            ? "border-green-400 bg-green-50 dark:bg-green-900/10"
            : "border-gray-300 dark:border-gray-600 hover:border-green-400"
        )}
      >
        {preview ? (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Receipt"
              className="max-h-40 rounded object-contain mx-auto"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400 py-2">
            <Camera size={28} />
            <span className="text-xs">Tap to upload receipt photo</span>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {outlets.length > 1 && (
        <select
          value={outletId}
          onChange={(e) => setOutletId(e.target.value)}
          className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">Select outlet (optional)</option>
          {outlets.map((o) => (
            <option key={o._id} value={o._id}>
              {o.location || o.name || o._id}
            </option>
          ))}
        </select>
      )}

      <button
        onClick={handleSubmit}
        disabled={!file || submitting}
        className={cn(
          "w-full py-2 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-colors",
          !file || submitting
            ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        )}
      >
        <Send size={16} />
        {submitting ? "Processing..." : "Submit Receipt"}
      </button>
    </div>
  );
};

export default StaffReceiptUpload;
