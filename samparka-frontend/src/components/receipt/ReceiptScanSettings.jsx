import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import receiptApi from "../../api/receiptApi";

const ReceiptScanSettings = ({ store, storeToken, onClose }) => {
  const [fraudThreshold, setFraudThreshold] = useState(
    store?.receiptScan?.autoApproveMaxFraudScore ?? 40
  );
  const [confThreshold, setConfThreshold] = useState(
    Math.round((store?.receiptScan?.autoApproveMinConfidence ?? 0.6) * 100)
  );

  const saveConfigMutation = useMutation({
    mutationFn: () =>
      receiptApi.updateScanConfig(storeToken, {
        autoApproveMaxFraudScore: Number(fraudThreshold),
        autoApproveMinConfidence: Number(confThreshold) / 100,
      }),
    onSuccess: () => {
      toast.success("Auto-approval settings saved");
      onClose();
    },
    onError: () => toast.error("Failed to save settings"),
  });

  return (
    <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Auto-Approval Thresholds
      </p>
      <p className="text-xs text-gray-400">
        Receipts meeting both criteria are automatically approved.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Fraud Score ≤ (0–100)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={fraudThreshold}
            onChange={(e) => setFraudThreshold(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            OCR Confidence ≥ (0–100%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={confThreshold}
            onChange={(e) => setConfThreshold(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      <button
        onClick={() => saveConfigMutation.mutate()}
        disabled={saveConfigMutation.isPending}
        className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
      >
        {saveConfigMutation.isPending ? "Saving…" : "Save Settings"}
      </button>
    </div>
  );
};

export default ReceiptScanSettings;
