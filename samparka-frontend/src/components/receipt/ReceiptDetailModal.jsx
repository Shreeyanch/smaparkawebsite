import { useState } from "react";
import { X, AlertTriangle, CheckCircle, Ban } from "lucide-react";
import { cn } from "../../lib/utils";

const FLAG_LABELS = {
  isDuplicate: "Duplicate receipt",
  isStale: "Receipt too old",
  storeMismatch: "Store name mismatch",
  lowConfidence: "Low OCR confidence",
  amountAnomaly: "Unusual amount",
  velocityExceeded: "Too many submissions",
};

function computePreviewPoints(store, totalAmount) {
  if (!totalAmount || !store) return null;

  const format = store.loyaltyCard?.format;
  if (format === "L4") {
    const earnRate = store.pointEarnRate || 0.07;
    const rawPoints = totalAmount * earnRate;
    return store.isRounded
      ? Math.round(rawPoints)
      : Math.round(rawPoints * 10) / 10;
  }

  const raw = store.conversionRate;
  if (!raw || raw === "null" || raw === "undefined") return null;
  const rate = Number(raw);
  if (!rate || rate <= 0) return null;
  return store.isRounded
    ? Math.round(totalAmount / rate)
    : Math.round((totalAmount / rate) * 10) / 10;
}

const ReceiptDetailModal = ({
  submission,
  store,
  onClose,
  onApprove,
  onReject,
  onReverse,
  approving,
  rejecting,
  reversing,
}) => {
  const [notes, setNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [cancelNotes, setCancelNotes] = useState("");
  const [view, setView] = useState("detail");
  const [customPoints, setCustomPoints] = useState("");

  const { extractedData, fraudFlags = {}, fraudScore = 0, calculatedPoints, pointsAwarded } = submission;
  const activeFlags = Object.entries(fraudFlags).filter(([, v]) => v === true);
  const canReverse = ["approved", "auto_approved", "flagged"].includes(submission.status);
  const canApproveReject = ["pending", "flagged"].includes(submission.status);

  // Compute live preview from store config + extracted total
  const previewPoints = computePreviewPoints(store, extractedData?.totalAmount);
  // For terminal statuses, show the actual awarded points (immune to rate changes).
  // For pending/flagged, use the stored calculated value or a live preview for planning.
  const isTerminal = ["approved", "auto_approved", "rejected", "reversed"].includes(submission.status);
  const displayPoints = isTerminal
    ? (pointsAwarded ?? calculatedPoints ?? 0)
    : (calculatedPoints > 0 ? calculatedPoints : (previewPoints ?? 0));
  // Whether the store uses automatic point calculation (amount-based) or manual entry.
  // store.amount === true  → Amount/Rupee mode: auto-calculate from conversionRate
  // store.amount === false → Points mode: staff enters points manually
  // store.amount === undefined → legacy store: fall back to conversionRate check
  const storeFormat = store?.loyaltyCard?.format;
  const isL4 = storeFormat === "L4";
  const isAmountMode = isL4
    ? !!(store.pointEarnRate && store.pointEarnRate > 0)
    : store?.amount !== false &&
      !!(store?.conversionRate && store.conversionRate !== "null" && Number(store.conversionRate) > 0);

  const handleApprove = () => {
    const payload = { notes };
    if (!isAmountMode && customPoints) {
      payload.pointsOverride = Number(customPoints);
    }
    onApprove(payload);
  };

  const approveLabel = () => {
    if (approving) return "Approving...";
    if (!isAmountMode) return customPoints ? `Approve & Award ${customPoints} Points` : "Approve (set points above)";
    return `Approve & Award ${displayPoints} Points`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-900 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="font-bold text-gray-900 dark:text-white">Receipt Detail</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {submission.imageUrl && (
            <img src={submission.imageUrl} alt="Receipt" className="w-full rounded-xl object-contain max-h-64 border border-gray-100 dark:border-gray-700" />
          )}

          {/* Extracted data */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-1.5 text-sm">
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Extracted Data</p>
            {extractedData?.storeName && <p className="text-gray-600 dark:text-gray-400">Store: <span className="font-medium text-gray-900 dark:text-white">{extractedData.storeName}</span></p>}
            {extractedData?.receiptDate && <p className="text-gray-600 dark:text-gray-400">Date: <span className="font-medium text-gray-900 dark:text-white">{new Date(extractedData.receiptDate).toLocaleDateString()}</span></p>}
            {extractedData?.receiptNumber && <p className="text-gray-600 dark:text-gray-400">Bill #: <span className="font-medium text-gray-900 dark:text-white">{extractedData.receiptNumber}</span></p>}
            {extractedData?.totalAmount != null && <p className="text-gray-600 dark:text-gray-400">Total: <span className="font-medium text-gray-900 dark:text-white">Rs. {extractedData.totalAmount.toLocaleString()}</span></p>}
            <p className="text-gray-600 dark:text-gray-400">
              Calculated Points:{" "}
              <span className={`font-bold ${displayPoints > 0 ? "text-green-600" : "text-amber-500"}`}>
                {isAmountMode
                  ? (displayPoints > 0 ? displayPoints : "—")
                  : (calculatedPoints > 0 ? calculatedPoints : "Enter below")}
              </span>
            </p>
            {extractedData?.confidence != null && (
              <p className="text-gray-600 dark:text-gray-400">OCR Confidence: <span className={extractedData.confidence >= 0.6 ? "text-green-600" : "text-red-500"}>{Math.round(extractedData.confidence * 100)}%</span></p>
            )}
          </div>

          {/* Custom points for Points-mode stores */}
          {canApproveReject && !isAmountMode && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 space-y-2">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                This store uses custom point assignment. Enter how many points to award:
              </p>
              <input
                type="number"
                min="1"
                value={customPoints}
                onChange={(e) => setCustomPoints(e.target.value)}
                placeholder="e.g. 10"
                className="w-full border border-amber-300 dark:border-amber-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          )}

          {/* Fraud analysis */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fraud Score</p>
              <span className={cn("text-sm font-bold px-2 py-0.5 rounded-full",
                fraudScore >= 70 ? "bg-red-100 text-red-700" : fraudScore >= 40 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
              )}>{fraudScore}/100</span>
            </div>
            {activeFlags.length > 0 ? (
              <div className="space-y-1">
                {activeFlags.map(([key]) => (
                  <div key={key} className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                    <AlertTriangle size={12} /><span>{FLAG_LABELS[key] || key}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle size={12} /><span>No fraud flags detected</span>
              </div>
            )}
          </div>

          {canApproveReject && (
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." rows={2}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none" />
          )}

          {view === "reject" && (
            <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Rejection reason (shown to customer)"
              className="w-full border border-red-300 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
          )}

          <div className="flex flex-col gap-2 pt-2">
            {canApproveReject && view === "detail" && (
              <>
                <button onClick={handleApprove} disabled={approving || (!isAmountMode && !customPoints)}
                  className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                  {approveLabel()}
                </button>
                <button onClick={() => setView("reject")}
                  className="w-full py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-100 transition-colors">
                  Reject
                </button>
              </>
            )}
            {view === "reject" && (
              <>
                <button onClick={() => onReject({ reason: rejectReason, notes })} disabled={rejecting}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                  {rejecting ? "Rejecting..." : "Confirm Rejection"}
                </button>
                <button onClick={() => setView("detail")} className="text-sm text-gray-500 hover:text-gray-700 py-1">Cancel</button>
              </>
            )}
            {view === "cancel" && (
              <>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 space-y-1 text-sm text-red-700 dark:text-red-400">
                  <p className="font-semibold">Cancel this bill?</p>
                  <ul className="space-y-0.5 text-xs list-disc list-inside">
                    <li>{displayPoints} points will be removed from the customer</li>
                    <li>Bill will be excluded from item analytics</li>
                    <li>This action cannot be undone</li>
                  </ul>
                </div>
                <textarea value={cancelNotes} onChange={(e) => setCancelNotes(e.target.value)}
                  placeholder="Reason for cancellation (optional)" rows={2}
                  className="w-full border border-red-300 dark:border-red-700 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none" />
                <button onClick={() => onReverse({ cancellationNotes: cancelNotes })} disabled={reversing}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                  {reversing ? "Cancelling..." : "Confirm Cancel Bill"}
                </button>
                <button onClick={() => { setView("detail"); setCancelNotes(""); }}
                  className="text-sm text-gray-500 hover:text-gray-700 py-1">Back</button>
              </>
            )}
            {canReverse && view === "detail" && (
              <button onClick={() => setView("cancel")} disabled={reversing}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50">
                <Ban size={14} />Cancel Bill
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptDetailModal;
