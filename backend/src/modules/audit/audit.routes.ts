import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate, requireRole } from "../auth";
import { validate } from "../../middleware";
import { idParamSchema } from "../../shared/validators";

import { listAuditLogsSchema } from "./audit.schema";

import { auditController } from "./audit.controller";

const router = Router();

router.use(authenticate);
router.use(requireRole(UserRole.ADMIN));

router.get(
    "/",
    validate(listAuditLogsSchema, "query"),
    auditController.list
);

router.get(
    "/:id",
    validate(idParamSchema, "params"),
    auditController.getById
);

export { router as auditRoutes };