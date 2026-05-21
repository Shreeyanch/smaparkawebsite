import { useState, useRef } from "react";
import { Camera, X } from "lucide-react";
import { cn } from "../../lib/utils";

const ReceiptUploadForm = ({ onSubmit, submitting, storeData, submitLabel = "Submit Receipt" }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [outletId, setOutletId] = useState("");
  const fileRef = useRef();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file || submitting) return;
    onSubmit({ file, outletId: outletId || undefined });
  };

  const outlets = storeData?.outlets || [];
  const hasMultipleOutlets = outlets.length > 1;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Upload a clear photo of your receipt to earn loyalty points.
      </p>

      {/* Image picker */}
      <div
        onClick={() => fileRef.current.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
          preview
            ? "border-green-400 bg-green-50 dark:bg-green-900/10"
            : "border-gray-300 dark:border-gray-600 hover:border-green-400 hover:bg-gray-50 dark:hover:bg-gray-800"
        )}
      >
        {preview ? (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Receipt preview"
              className="max-h-60 mx-auto rounded-lg object-contain"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400 py-4">
            <Camera size={40} />
            <span className="text-sm font-medium">Tap to take a photo or upload</span>
            <span className="text-xs">JPEG, PNG, WEBP up to 10 MB</span>
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

      {/* Outlet selector — only shown for multi-outlet stores */}
      {hasMultipleOutlets && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Which outlet did you visit?
          </label>
          <select
            value={outletId}
            onChange={(e) => setOutletId(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Select outlet (optional)</option>
            {outlets.map((o) => (
              <option key={o._id} value={o._id}>
                {o.location || o.name || o._id}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={!file || submitting}
        className={cn(
          "w-full py-3 rounded-xl font-semibold text-white transition-colors text-sm",
          !file || submitting
            ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 active:bg-green-800"
        )}
      >
        {submitting ? "Processing…" : submitLabel}
      </button>
    </form>
  );
};

export default ReceiptUploadForm;
