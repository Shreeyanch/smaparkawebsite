import { Loader2, Receipt, AlertTriangle } from "lucide-react";

const FRAUD_BADGE = (score) => {
  if (score >= 70) return { label: "High Risk", color: "bg-red-100 text-red-700" };
  if (score >= 40) return { label: "Medium Risk", color: "bg-amber-100 text-amber-700" };
  return { label: "Low Risk", color: "bg-green-100 text-green-700" };
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

  // Points mode (custom assignment): no auto-calculation
  if (store.amount === false) return null;

  const raw = store.conversionRate;
  if (!raw || raw === "null" || raw === "undefined") return null;
  const rate = Number(raw);
  if (!rate || rate <= 0) return null;
  return store.isRounded
    ? Math.round(totalAmount / rate)
    : Math.round((totalAmount / rate) * 10) / 10;
}

const ReceiptReviewQueue = ({ submissions, isLoading, onSelect, store }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-green-500" size={32} />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 gap-3 text-gray-400">
        <Receipt size={48} />
        <p className="text-sm">No submissions in this category</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((s) => {
        const badge = FRAUD_BADGE(s.fraudScore || 0);
        const customer = s.customer;
        const amount = s.extractedData?.totalAmount;
        const isTerminal = ["approved", "auto_approved", "rejected", "reversed"].includes(s.status);
        const displayPoints = isTerminal
          ? (s.pointsAwarded ?? s.calculatedPoints ?? 0)
          : (s.calculatedPoints > 0 ? s.calculatedPoints : (computePreviewPoints(store, amount) ?? 0));
        const date = new Date(s.createdAt).toLocaleDateString("en-NP", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <button
            key={s._id}
            onClick={() => onSelect(s)}
            className="w-full text-left bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-green-400 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {customer?.name || "Unknown Customer"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {customer?.phone || customer?.email || ""}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${badge.color}`}>
                {badge.label}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                {amount != null && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Rs. {amount.toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-gray-400">{date}</p>
              </div>

              {s.fraudFlags?.isDuplicate && (
                <div className="flex items-center gap-1 text-red-500 text-xs">
                  <AlertTriangle size={14} />
                  <span>Duplicate</span>
                </div>
              )}

              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                {displayPoints} pts
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ReceiptReviewQueue;
