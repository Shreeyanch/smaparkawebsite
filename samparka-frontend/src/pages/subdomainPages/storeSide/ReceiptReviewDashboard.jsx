import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Settings2 } from "lucide-react";
import receiptApi from "../../../api/receiptApi";
import ReceiptReviewQueue from "../../../components/receipt/ReceiptReviewQueue";
import ReceiptDetailModal from "../../../components/receipt/ReceiptDetailModal";
import ReceiptScanSettings from "../../../components/receipt/ReceiptScanSettings";
import { RECEIPT_STATUS_TABS } from "../../../constants/receiptConstants";

const ReceiptReviewDashboard = ({ store }) => {
  const storeToken = localStorage.getItem("storeToken");
  const queryClient = useQueryClient();
  const [activeStatus, setActiveStatus] = useState("pending");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["receiptQueue", activeStatus],
    queryFn: () =>
      receiptApi.listSubmissions(storeToken, activeStatus).then((r) => r.data),
    staleTime: 30000,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, payload }) => receiptApi.approve(id, storeToken, payload),
    onSuccess: () => {
      toast.success("Receipt approved and points awarded");
      queryClient.invalidateQueries(["receiptQueue"]);
      setSelectedSubmission(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Approval failed"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, payload }) => receiptApi.reject(id, storeToken, payload),
    onSuccess: () => {
      toast.success("Submission rejected");
      queryClient.invalidateQueries(["receiptQueue"]);
      setSelectedSubmission(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Rejection failed"),
  });

  const reverseMutation = useMutation({
    mutationFn: ({ id, payload }) => receiptApi.reverse(id, storeToken, payload),
    onSuccess: () => {
      toast.success("Bill cancelled successfully");
      queryClient.invalidateQueries(["receiptQueue"]);
      setSelectedSubmission(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Cancellation failed"),
  });

  if (!store?.receiptScan?.enabled) {
    return (
      <div className="lg:ml-64 p-6 flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-sm">Receipt scanning is not enabled for this store.</p>
      </div>
    );
  }

  return (
    <div className="lg:ml-64 min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Receipt Review</h1>
        <button
          onClick={() => setShowSettings((v) => !v)}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Auto-approval settings"
        >
          <Settings2 size={18} />
        </button>
      </div>

      {showSettings && (
        <ReceiptScanSettings
          store={store}
          storeToken={storeToken}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {RECEIPT_STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveStatus(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
              activeStatus === tab.id
                ? "bg-green-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-green-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ReceiptReviewQueue
        submissions={data?.data || []}
        isLoading={isLoading}
        onSelect={setSelectedSubmission}
        store={store}
      />

      {selectedSubmission && (
        <ReceiptDetailModal
          submission={selectedSubmission}
          store={store}
          onClose={() => setSelectedSubmission(null)}
          onApprove={(payload) =>
            approveMutation.mutate({ id: selectedSubmission._id, payload })
          }
          onReject={(payload) =>
            rejectMutation.mutate({ id: selectedSubmission._id, payload })
          }
          onReverse={(payload) => reverseMutation.mutate({ id: selectedSubmission._id, payload })}
          approving={approveMutation.isPending}
          rejecting={rejectMutation.isPending}
          reversing={reverseMutation.isPending}
        />
      )}
    </div>
  );
};

export default ReceiptReviewDashboard;
