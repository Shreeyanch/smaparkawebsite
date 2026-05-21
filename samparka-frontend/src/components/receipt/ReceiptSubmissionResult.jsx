import { CheckCircle, Clock, XCircle } from "lucide-react";

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    label: "Under Review",
    message:
      "Your receipt is being reviewed by the store. You will be notified once points are awarded.",
  },
  auto_approved: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-900/20",
    label: "Points Awarded",
    message: "Your receipt was accepted and points have been added to your account.",
  },
  flagged: {
    icon: Clock,
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    label: "Points Awarded — Pending Final Review",
    message:
      "Points have been credited, but your receipt is under final review. They may be adjusted if needed.",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-900/20",
    label: "Not Approved",
    message:
      "This receipt could not be accepted. It may already have been submitted or does not meet the store's requirements.",
  },
};

const ReceiptSubmissionResult = ({ result, onReset }) => {
  const { status = "pending", pointsAwarded } = result?.data || result || {};
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  return (
    <div className={`rounded-2xl p-6 text-center space-y-4 ${cfg.bg}`}>
      <Icon className={`mx-auto ${cfg.color}`} size={56} />

      <h2 className={`text-xl font-bold ${cfg.color}`}>{cfg.label}</h2>

      {pointsAwarded > 0 && (
        <div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            +{pointsAwarded} pts
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            added to your account
          </p>
        </div>
      )}

      <p className="text-sm text-gray-600 dark:text-gray-400">{cfg.message}</p>

      <button
        onClick={onReset}
        className="mt-2 px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors text-sm"
      >
        Submit Another Receipt
      </button>
    </div>
  );
};

export default ReceiptSubmissionResult;
