import { useQuery } from "@tanstack/react-query";
import { auditService, type AuditListParams } from "@/api/services/audit.service";

export function useAuditLogs(params: AuditListParams, enabled = true) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => auditService.list(params),
    staleTime: 30 * 1000,
    retry: (count, error: { status?: number }) => (error?.status === 403 ? false : count < 2),
    enabled,
  });
}