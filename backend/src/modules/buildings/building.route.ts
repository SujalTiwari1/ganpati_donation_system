import { Router } from "express";

import {
    authenticate,
    requireRole,
} from "../auth";

import { UserRole } from "@prisma/client";

import { validate } from "../../middleware";

import {
    createBuildingSchema,
    updateBuildingSchema,
    getBuildingSchema,
    deleteBuildingSchema,
    restoreBuildingSchema,
    listBuildingsSchema,
} from "./building.schema";

import { buildingController } from "./building.controller";

const router = Router();

router.post(
    "/",
    authenticate,
    requireRole(UserRole.ADMIN, UserRole.VOLUNTEER),
    validate(createBuildingSchema),
    buildingController.create
);

router.get(
    "/",
    authenticate,
    buildingController.list
);

router.get(
    "/:id",
    authenticate,
    buildingController.getById
);

router.patch(
    "/:id",
    authenticate,
    requireRole(UserRole.ADMIN, UserRole.VOLUNTEER),
    buildingController.update
);

router.delete(
    "/:id",
    authenticate,
    requireRole(UserRole.ADMIN),
    buildingController.delete
);

router.patch(
    "/:id/restore",
    authenticate,
    requireRole(UserRole.ADMIN),
    buildingController.restore
);

export { router as buildingRouter };