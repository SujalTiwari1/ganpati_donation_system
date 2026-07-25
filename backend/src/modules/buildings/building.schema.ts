import { z } from "zod";

import {
    BUILDING_NAME_MAX_LENGTH,
    BUILDING_NAME_MIN_LENGTH,
    BUILDING_SORT_FIELDS,
} from "./building.constants";

import {
    idParamSchema,
    paginationSchema,
} from "../../shared/validators";

const buildingNameSchema = z
    .string()
    .trim()
    .min(
        BUILDING_NAME_MIN_LENGTH,
        `Building name must contain at least ${BUILDING_NAME_MIN_LENGTH} characters.`
    )
    .max(
        BUILDING_NAME_MAX_LENGTH,
        `Building name cannot exceed ${BUILDING_NAME_MAX_LENGTH} characters.`
    );

export const createBuildingSchema = z.object({
    name: buildingNameSchema,
    area: z.string().trim().max(150, "Area cannot exceed 150 characters").optional(),
    notes: z.string().trim().max(1000, "Notes cannot exceed 1000 characters").optional(),
});

export const updateBuildingSchema = z.object({
    params: idParamSchema.shape,
    body: z.object({
        name: buildingNameSchema.optional(),
        area: z.string().trim().max(150, "Area cannot exceed 150 characters").optional(),
        notes: z.string().trim().max(1000, "Notes cannot exceed 1000 characters").optional(),
    }),
});

export const getBuildingSchema = idParamSchema;

export const deleteBuildingSchema = idParamSchema;

export const restoreBuildingSchema = idParamSchema;

export const listBuildingsSchema = z.object({
    query: paginationSchema.extend({
        search: z.string().trim().optional(),

        sortBy: z
            .enum(BUILDING_SORT_FIELDS)
            .optional(),

        sortOrder: z
            .enum(["asc", "desc"])
            .optional(),
    }),
});