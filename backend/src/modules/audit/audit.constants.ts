// src/modules/audit/audit.constants.ts

export const AUDIT_MESSAGES = {
    NOT_FOUND: "Audit log not found.",
} as const;

export const AUDIT_DEFAULTS = {
    PAGE: 1,
    LIMIT: 20,
    MAX_LIMIT: 100,
    SORT_BY: "createdAt",
    SORT_ORDER: "desc",
} as const;