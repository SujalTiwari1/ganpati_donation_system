import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/api/services/dashboard.service";

export function useDashboard(enabled = true) {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardService.get(),
    staleTime: 60 * 1000,
    retry: (count, error: { status?: number }) => (error?.status === 403 ? false : count < 2),
    enabled,
  });
}