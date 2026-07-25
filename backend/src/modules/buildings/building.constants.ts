import { Prisma } from "@prisma/client";

export const BUILDING_MESSAGES = {
    CREATED: "Building created successfully",
    UPDATED: "Building updated successfully",
    DELETED: "Building deleted successfully",
    RESTORED: "Building restored successfully",

    FETCHED: "Building fetched successfully",
    FETCHED_ALL: "Buildings fetched successfully",

    NOT_FOUND: "Building not found",

    ALREADY_EXISTS: "Building already exists",

    DELETE_FORBIDDEN:
        "Building cannot be deleted because it is associated with donors.",

    RESTORE_FORBIDDEN:
        "Building is already active.",
} as const;

export const BUILDING_SORT_FIELDS = [
    "name",
    "createdAt",
    "updatedAt",
] as const;

export type BuildingSortField =
    (typeof BUILDING_SORT_FIELDS)[number];

export const DEFAULT_BUILDING_SORT: Prisma.BuildingOrderByWithRelationInput =
{
    name: "asc",
};

export const BUILDING_SEARCH_FIELDS = [
    "name",
] as const;

export const BUILDING_NAME_MIN_LENGTH = 2;

export const BUILDING_NAME_MAX_LENGTH = 150;