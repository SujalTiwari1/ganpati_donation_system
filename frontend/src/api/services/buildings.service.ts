import { apiClient, unwrap } from "@/api/client";
import type { ApiEnvelope, Building, Paginated } from "@/types/api";

export interface BuildingListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface BuildingPayload {
  name: string;
  area?: string;
  notes?: string;
}

export const buildingsService = {
  list: (params: BuildingListParams) =>
    unwrap<Paginated<Building>>(
      apiClient.get<ApiEnvelope<Paginated<Building>>>("/buildings", { params }),
    ),
  get: (id: string) =>
    unwrap<Building>(apiClient.get<ApiEnvelope<Building>>(`/buildings/${id}`)),
  create: (payload: BuildingPayload) =>
    unwrap<Building>(apiClient.post<ApiEnvelope<Building>>("/buildings", payload)),
  update: (id: string, payload: Partial<BuildingPayload>) =>
    unwrap<Building>(apiClient.patch<ApiEnvelope<Building>>(`/buildings/${id}`, payload)),
  remove: (id: string) =>
    unwrap<Partial<Building>>(apiClient.delete<ApiEnvelope<Partial<Building>>>(`/buildings/${id}`)),
  restore: (id: string) =>
    unwrap<null>(apiClient.patch<ApiEnvelope<null>>(`/buildings/${id}/restore`)),
};