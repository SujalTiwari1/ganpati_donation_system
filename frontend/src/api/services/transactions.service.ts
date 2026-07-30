import { apiClient, unwrap } from "@/api/client";
import type {
  ApiEnvelope,
  Paginated,
  PaymentMethod,
  Transaction,
  TransactionStatus,
} from "@/types/api";

export interface TransactionListParams {
  page?: number;
  limit?: number;
  search?: string;
  paymentMethod?: PaymentMethod;
  status?: TransactionStatus;
  year?: number;
  fromDate?: string;
  toDate?: string;
  sortBy?: "donationDate" | "amount" | "createdAt" | "receiptNumber";
  sortOrder?: "asc" | "desc";
}

export interface CreateTransactionPayload {
  buildingId?: string;
  buildingNormalizedName?: string;
  donorName: string;
  mobile: string;
  roomNumber: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  year?: number;
  overrideDuplicate?: boolean;
  duplicateOverrideReason?: string;
}

function clean(params: object) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== null),
  );
}

export const transactionsService = {
  list: (params: TransactionListParams) =>
    unwrap<Paginated<Transaction>>(
      apiClient.get<ApiEnvelope<Paginated<Transaction>>>("/transactions", {
        params: clean(params),
      }),
    ),
  get: (id: string) =>
    unwrap<Transaction>(apiClient.get<ApiEnvelope<Transaction>>(`/transactions/${id}`)),
  create: (payload: CreateTransactionPayload) =>
    unwrap<Transaction>(
      apiClient.post<ApiEnvelope<Transaction>>("/transactions", clean(payload)),
    ),
  update: (id: string, payload: { donorName?: string; roomNumber?: string }) =>
    unwrap<Transaction>(apiClient.patch<ApiEnvelope<Transaction>>(`/transactions/${id}`, payload)),
  cancel: (id: string) =>
    unwrap<Transaction>(apiClient.patch<ApiEnvelope<Transaction>>(`/transactions/${id}/cancel`)),
  receiptBlob: async (id: string) => {
    const response = await apiClient.get(`/transactions/${id}/receipt`, {
      responseType: "blob",
    });
    return response.data as Blob;
  },
};