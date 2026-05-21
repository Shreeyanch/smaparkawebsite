import { useQuery } from "@tanstack/react-query";
import { Loader2, Receipt } from "lucide-react";
import receiptApi from "../../api/receiptApi";

const STATUS_LABELS = {
  pending: { label: "Pending Review", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  approved: { label: "Approved", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  auto_approved: { label: "Approved", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  flagged: { label: "Under Review", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  reversed: { label: "Reversed", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

const ReceiptHistoryList = ({ token }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["receiptHistory"],
    queryFn: () => receiptApi.getCustomerHistory(token).then((r) => r.data),
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-green-500" size={32} />
      </div>
    );
  }

  const submissions = data?.data || [];

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 gap-3 text-gray-400">
        <Receipt size={48} />
        <p className="text-sm">No receipt submissions yet</p>
        <p className="text-xs text-center text-gray-400">
          Submit a receipt to earn points for your purchases
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((s) => {
        const cfg = STATUS_LABELS[s.status] || STATUS_LABELS.pending;
        const amount = s.extractedData?.totalAmount;
        const date = new Date(s.createdAt).toLocaleDateString("en-NP", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        return (
          <div
            key={s._id}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${cfg.color}`}>
                {cfg.label}
              </span>
              {s.pointsAwarded > 0 && (
                <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                  +{s.pointsAwarded} pts
                </span>
              )}
            </div>

            {amount != null && (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Total: Rs. {amount.toLocaleString()}
              </p>
            )}

            {s.extractedData?.receiptNumber && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Bill #{s.extractedData.receiptNumber}
              </p>
            )}

            <p className="text-xs text-gray-400 mt-1">{date}</p>
          </div>
        );
      })}
    </div>
  );
};

export default ReceiptHistoryList;
