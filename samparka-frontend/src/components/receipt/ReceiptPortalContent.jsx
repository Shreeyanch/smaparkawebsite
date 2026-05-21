import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Receipt, BarChart2, Settings2 } from "lucide-react";
import receiptApi from "../../api/receiptApi";
import { usePortalReceiptMutations } from "../../hooks/usePortalReceiptMutations";
import { RECEIPT_STATUS_TABS } from "../../constants/receiptConstants";
import ReceiptReviewQueue from "./ReceiptReviewQueue";
import ReceiptDetailModal from "./ReceiptDetailModal";
import ReceiptPortalSettings from "./ReceiptPortalSettings";
import ItemAnalyticsTab from "./ItemAnalyticsTab";

const VIEW_TABS = [
  { id: "queue", label: "Review Queue", Icon: Receipt },
  { id: "analytics", label: "Item Analytics", Icon: BarChart2 },
];

const tabClass = (active) =>
  `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${
    active
      ? "bg-green-600 text-white"
      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-green-400"
  }`;

const ReceiptPortalContent = ({ storeId, store, token }) => {
  const [activeView, setActiveView] = useState("queue");
  const [activeStatus, setActiveStatus] = useState("pending");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["portalQueue", storeId, activeStatus],
    queryFn: () =>
      receiptApi.listPortalSubmissions(token, storeId, activeStatus).then((r) => r.data),
    enabled: !!storeId && !!token,
    staleTime: 30000,
  });

  const { approveMutation, rejectMutation, reverseMutation } = usePortalReceiptMutations(
    token,
    () => setSelectedSubmission(null)
  );

  return (
    <>
      {showSettings && (
        <ReceiptPortalSettings
          store={store}
          userToken={token}
          onClose={() => setShowSettings(false)}
        />
      )}

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {VIEW_TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setActiveView(id)} className={tabClass(activeView === id)}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowSettings((v) => !v)}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Auto-approval settings"
        >
          <Settings2 size={18} />
        </button>
      </div>

      {activeView === "queue" ? (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {RECEIPT_STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveStatus(tab.id)}
                className={tabClass(activeStatus === tab.id)}
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
        </>
      ) : (
        <ItemAnalyticsTab storeId={storeId} token={token} />
      )}

      {selectedSubmission && (
        <ReceiptDetailModal
          submission={selectedSubmission}
          store={store}
          onClose={() => setSelectedSubmission(null)}
          onApprove={(payload) => approveMutation.mutate({ id: selectedSubmission._id, payload })}
          onReject={(payload) => rejectMutation.mutate({ id: selectedSubmission._id, payload })}
          onReverse={(payload) => reverseMutation.mutate({ id: selectedSubmission._id, payload })}
          approving={approveMutation.isPending}
          rejecting={rejectMutation.isPending}
          reversing={reverseMutation.isPending}
        />
      )}
    </>
  );
};

export default ReceiptPortalContent;
