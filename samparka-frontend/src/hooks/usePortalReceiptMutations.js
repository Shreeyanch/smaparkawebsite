import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import receiptApi from "../api/receiptApi";

export const usePortalReceiptMutations = (token, onSuccess) => {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries(["portalQueue"]);

  const approveMutation = useMutation({
    mutationFn: ({ id, payload }) => receiptApi.approvePortal(id, token, payload),
    onSuccess: () => {
      toast.success("Receipt approved and points awarded");
      invalidate();
      onSuccess?.();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Approval failed"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, payload }) => receiptApi.rejectPortal(id, token, payload),
    onSuccess: () => {
      toast.success("Submission rejected");
      invalidate();
      onSuccess?.();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Rejection failed"),
  });

  const reverseMutation = useMutation({
    mutationFn: ({ id, payload }) => receiptApi.reversePortal(id, token, payload),
    onSuccess: () => {
      toast.success("Bill cancelled successfully");
      invalidate();
      onSuccess?.();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Cancellation failed"),
  });

  return { approveMutation, rejectMutation, reverseMutation };
};
