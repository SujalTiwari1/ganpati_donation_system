// src/modules/audit/audit.schema.ts

import { AuditAction, AuditEntity } from "@prisma/client";
import { z } from "zod";

import { AUDIT_DEFAULTS } from "./audit.constants";

export const listAuditLogsSchema = z.object({

    page: z.coerce
        .number()
        .int()
        .positive()
        .default(AUDIT_DEFAULTS.PAGE),

    limit: z.coerce
        .number()
        .int()
        .positive()
        .max(AUDIT_DEFAULTS.MAX_LIMIT)
        .default(AUDIT_DEFAULTS.LIMIT),

    search: z
        .string()
        .trim()
        .optional(),

    entity: z
        .nativeEnum(AuditEntity)
        .optional(),

    action: z
        .nativeEnum(AuditAction)
        .optional(),

    userId: z
        .uuid()
        .optional(),

    fromDate: z
        .coerce
        .date()
        .optional(),

    toDate: z
        .coerce
        .date()
        .optional(),

    sortOrder: z
        .enum(["asc", "desc"])
        .default(AUDIT_DEFAULTS.SORT_ORDER),

});