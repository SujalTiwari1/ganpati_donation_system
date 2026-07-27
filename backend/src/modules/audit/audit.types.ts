// src/modules/audit/audit.types.ts

import type {
    AuditAction,
    AuditEntity,
    Prisma,
} from "@prisma/client";

export interface CreateAuditLogInput {
    userId?: string;

    entity: AuditEntity;

    entityId?: string;

    entityLabel?: string;

    action: AuditAction;

    oldValue?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;

    newValue?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;

    ipAddress?: string;

    userAgent?: string;
}

export interface AuditLogListQuery {
    page: number;

    limit: number;

    search?: string;

    entity?: AuditEntity;

    action?: AuditAction;

    userId?: string;

    fromDate?: Date;

    toDate?: Date;

    sortOrder: "asc" | "desc";
}

export interface AuditPagination {
    page: number;

    limit: number;

    total: number;

    totalPages: number;
}