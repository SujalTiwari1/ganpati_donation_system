import { Router } from "express";
import { z } from "zod";

import { UserRole } from "@prisma/client";

import { authenticate, requireRole } from "../auth";
import { validate } from "../../middleware";

import { dashboardController } from "./dashboard.controller";

const router = Router();

// This endpoint takes no query parameters at all. Validating an empty,
// strict schema (rather than skipping validation because "there's nothing
// to validate") means a stray/typo'd query param is rejected with a clear
// 422 instead of being silently ignored — satisfies "validate every query
// parameter even if currently unused."
const emptyQuerySchema = z.object({}).strict();

router.get(
    "/",
    authenticate,
    requireRole(UserRole.ADMIN),
    validate(emptyQuerySchema, "query"),
    dashboardController.getDashboard
);

export { router as dashboardRouter };
