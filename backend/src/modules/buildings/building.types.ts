import { Building } from "@prisma/client";

export interface CreateBuildingInput {
    name: string;
    area: string;
    notes: string;
}

export interface UpdateBuildingInput {
    name?: string;
    area?: string;
    notes?: string;
}

export interface BuildingListQuery {
    page: number;
    limit: number;

    search?: string;

    sortBy?: "name" | "createdAt" | "updatedAt";

    sortOrder?: "asc" | "desc";
}

export interface BuildingPaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedBuildings {
    data: Building[];
    pagination: BuildingPaginationMeta;
}