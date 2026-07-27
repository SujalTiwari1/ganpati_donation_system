// src/modules/audit/audit.mapper.ts

import type { AuditLog } from "@prisma/client";

export const toAuditResponse = (audit: AuditLog) => ({
    id: audit.id,

    entity: audit.entity,

    entityId: audit.entityId,

    entityLabel: audit.entityLabel,

    action: audit.action,

    oldValue: audit.oldValue,

    newValue: audit.newValue,

    ipAddress: audit.ipAddress,

    userAgent: audit.userAgent,

    createdAt: audit.createdAt,

    userId: audit.userId,
});