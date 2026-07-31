import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  buildingsService,
  type BuildingListParams,
  type BuildingPayload,
} from "@/api/services/buildings.service";
import type { ApiError } from "@/api/client";

export const buildingKeys = {
  all: ["buildings"] as const,
  list: (params: BuildingListParams) => [...buildingKeys.all, "list", params] as const,
  detail: (id: string) => [...buildingKeys.all, "detail", id] as const,
  donatedRooms: (id: string) => [...buildingKeys.all, "donated-rooms", id] as const,
};

export function useBuildings(params: BuildingListParams) {
  return useQuery({
    queryKey: buildingKeys.list(params),
    queryFn: () => buildingsService.list(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useBuilding(id: string) {
  return useQuery({
    queryKey: buildingKeys.detail(id),
    queryFn: () => buildingsService.get(id),
    staleTime: 5 * 60 * 1000,
  });
}

export function useBuildingDonatedRooms(id: string) {
  return useQuery({
    queryKey: buildingKeys.donatedRooms(id),
    queryFn: () => buildingsService.donatedRooms(id),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateBuilding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BuildingPayload) => buildingsService.create(payload),
    onSuccess: (building) => {
      queryClient.invalidateQueries({ queryKey: buildingKeys.all });
      toast.success("Building created", { description: building.name });
    },
    onError: (error: ApiError) => toast.error("Could not create building", { description: error.message }),
  });
}

export function useUpdateBuilding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<BuildingPayload> }) =>
      buildingsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buildingKeys.all });
      toast.success("Building updated");
    },
    onError: (error: ApiError) => toast.error("Could not update building", { description: error.message }),
  });
}

export function useDeleteBuilding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => buildingsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buildingKeys.all });
      toast.success("Building deleted");
    },
    onError: (error: ApiError) => toast.error("Could not delete building", { description: error.message }),
  });
}

export function useRestoreBuilding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => buildingsService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: buildingKeys.all });
      toast.success("Building restored");
    },
    onError: (error: ApiError) => toast.error("Could not restore building", { description: error.message }),
  });
}