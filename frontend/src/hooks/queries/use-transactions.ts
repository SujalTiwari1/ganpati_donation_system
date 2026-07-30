import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  transactionsService,
  type CreateTransactionPayload,
  type TransactionListParams,
} from "@/api/services/transactions.service";
import type { ApiError } from "@/api/client";

export const transactionKeys = {
  all: ["transactions"] as const,
  list: (params: TransactionListParams) => [...transactionKeys.all, "list", params] as const,
  detail: (id: string) => [...transactionKeys.all, "detail", id] as const,
};

export function useTransactions(params: TransactionListParams, enabled = true) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => transactionsService.list(params),
    staleTime: 60 * 1000,
    enabled,
  });
}

export function useTransaction(id: string | undefined) {
  return useQuery({
    queryKey: transactionKeys.detail(id ?? ""),
    queryFn: () => transactionsService.get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) => transactionsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { donorName?: string; roomNumber?: string } }) =>
      transactionsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      toast.success("Transaction updated");
    },
    onError: (error: ApiError) => toast.error("Update failed", { description: error.message }),
  });
}

export function useCancelTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Transaction cancelled");
    },
    onError: (error: ApiError) => toast.error("Cancellation failed", { description: error.message }),
  });
}