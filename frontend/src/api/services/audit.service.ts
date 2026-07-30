import { apiClient, unwrap } from "@/api/client";
import type { ApiEnvelope, AuditAction, AuditEntity, AuditLog, Paginated } from "@/types/api";

export interface AuditListParams {
  page?: number;
  limit?: number;
  search?: string;
  entity?: AuditEntity;
  action?: AuditAction;
  userId?: string;
  fromDate?: string;
  toDate?: string;
  sortOrder?: "asc" | "desc";
}

function clean(params: object) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== null),
  );
}

export const auditService = {
  list: (params: AuditListParams) =>
    unwrap<Paginated<AuditLog>>(
      apiClient.get<ApiEnvelope<Paginated<AuditLog>>>("/audit-logs", { params: clean(params) }),
    ),
  get: (id: string) =>
    unwrap<AuditLog>(apiClient.get<ApiEnvelope<AuditLog>>(`/audit-logs/${id}`)),
};