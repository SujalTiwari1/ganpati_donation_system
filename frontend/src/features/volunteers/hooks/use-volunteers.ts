import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  volunteersService,
} from "../services/volunteers.service";
import type {
  ChangeStatusPayload,
  CreateVolunteerPayload,
  ResetPasswordPayload,
  UpdateVolunteerPayload,
  VolunteerListParams,
} from "../types/volunteer.types";
import type { ApiError } from "@/api/client";

export const volunteerKeys = {
  all: ["volunteers"] as const,
  list: (params: VolunteerListParams) =>
    [...volunteerKeys.all, "list", params] as const,
  detail: (id: string) => [...volunteerKeys.all, "detail", id] as const,
  stats: () => [...volunteerKeys.all, "stats"] as const,
};

export function useVolunteers(params: VolunteerListParams, enabled = true) {
  return useQuery({
    queryKey: volunteerKeys.list(params),
    queryFn: () => volunteersService.list(params),
    staleTime: 30 * 1000,
    enabled,
  });
}

export function useVolunteer(id: string | undefined) {
  return useQuery({
    queryKey: volunteerKeys.detail(id ?? ""),
    queryFn: () => volunteersService.get(id as string),
    enabled: Boolean(id),
  });
}

export function useVolunteerStats(enabled = true) {
  return useQuery({
    queryKey: volunteerKeys.stats(),
    queryFn: () => volunteersService.getStats(),
    staleTime: 30 * 1000,
    enabled,
  });
}

export function useCreateVolunteer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVolunteerPayload) => volunteersService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: volunteerKeys.all });
      toast.success("Volunteer created");
    },
    onError: (error: ApiError) =>
      toast.error("Could not create volunteer", { description: error.message }),
  });
}

export function useUpdateVolunteer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVolunteerPayload }) =>
      volunteersService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: volunteerKeys.all });
      toast.success("Volunteer updated");
    },
    onError: (error: ApiError) =>
      toast.error("Could not update volunteer", { description: error.message }),
  });
}

export function useResetVolunteerPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResetPasswordPayload }) =>
      volunteersService.resetPassword(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: volunteerKeys.all });
      toast.success("Password reset successfully");
    },
    onError: (error: ApiError) =>
      toast.error("Could not reset password", { description: error.message }),
  });
}

export function useChangeVolunteerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ChangeStatusPayload }) =>
      volunteersService.changeStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: volunteerKeys.all });
      toast.success("Volunteer status updated");
    },
    onError: (error: ApiError) =>
      toast.error("Could not update status", { description: error.message }),
  });
}
