import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  usersService,
  type UpdateMyProfilePayload,
} from "@/api/services/users.service";
import type { ApiError } from "@/api/client";

export const userKeys = {
  all: ["user"] as const,
  me: () => [...userKeys.all, "me"] as const,
  statistics: () => [...userKeys.all, "statistics"] as const,
  donations: (limit = 10) => [...userKeys.all, "donations", limit] as const,
};

export function useMyProfile() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => usersService.me(),
    staleTime: 60 * 1000,
  });
}

export function useMyStatistics() {
  return useQuery({
    queryKey: userKeys.statistics(),
    queryFn: () => usersService.myStatistics(),
    staleTime: 60 * 1000,
  });
}

export function useMyDonations(limit = 10) {
  return useQuery({
    queryKey: userKeys.donations(limit),
    queryFn: () => usersService.myDonations(limit),
    staleTime: 30 * 1000,
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateMyProfilePayload) => usersService.updateMyProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Profile updated successfully.");
    },
    onError: (error: ApiError) => toast.error("Update failed", { description: error.message }),
  });
}
