import { apiClient, unwrap } from "@/api/client";
import type { ApiEnvelope, DashboardData } from "@/types/api";

export const dashboardService = {
  get: () => unwrap<DashboardData>(apiClient.get<ApiEnvelope<DashboardData>>("/dashboard")),
};