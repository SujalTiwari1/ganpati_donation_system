import { apiClient, unwrap } from "@/api/client";
import type { ApiEnvelope, Paginated } from "@/types/api";
import type {
  ChangeStatusPayload,
  CreateVolunteerPayload,
  ResetPasswordPayload,
  UpdateVolunteerPayload,
  Volunteer,
  VolunteerListParams,
  VolunteerStats,
} from "../types/volunteer.types";

export const volunteersService = {
  list: (params: VolunteerListParams) =>
    unwrap<Paginated<Volunteer>>(
      apiClient.get<ApiEnvelope<Paginated<Volunteer>>>("/users", {
        params: { ...params, role: "VOLUNTEER" },
      }),
    ),

  get: (id: string) =>
    unwrap<Volunteer>(apiClient.get<ApiEnvelope<Volunteer>>(`/users/${id}`)),

  getStats: () =>
    unwrap<VolunteerStats>(apiClient.get<ApiEnvelope<VolunteerStats>>("/users/stats")),

  create: (payload: CreateVolunteerPayload) =>
    unwrap<Volunteer>(apiClient.post<ApiEnvelope<Volunteer>>("/users", payload)),

  update: (id: string, payload: UpdateVolunteerPayload) =>
    unwrap<Volunteer>(apiClient.patch<ApiEnvelope<Volunteer>>(`/users/${id}`, payload)),

  resetPassword: (id: string, payload: ResetPasswordPayload) =>
    unwrap<null>(
      apiClient.patch<ApiEnvelope<null>>(`/users/${id}/reset-password`, payload),
    ),

  changeStatus: (id: string, payload: ChangeStatusPayload) =>
    unwrap<Volunteer>(
      apiClient.patch<ApiEnvelope<Volunteer>>(`/users/${id}/change-status`, payload),
    ),
};
