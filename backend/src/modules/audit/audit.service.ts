import { Prisma } from "@prisma/client";

import { auditRepository, AuditRepository } from "./audit.repository";
import { AUDIT_MESSAGES } from "./audit.constants";
import type {
    AuditLogListQuery,
    CreateAuditLogInput,
} from "./audit.types";

import { NotFoundError } from "../../shared/errors";
import { prisma } from "../../database";

export class AuditService {
    constructor(
        private readonly repository: AuditRepository = auditRepository
    ) {}

    /**
     * Creates a new audit log.
     *
     * This method is intended to be called internally from other
     * modules (Authentication, Buildings, Transactions, etc.).
     */
    async record(
        input: CreateAuditLogInput,
        tx: Prisma.TransactionClient = prisma
    ) {
        return this.repository.create(
            {
                userId: input.userId,

                entity: input.entity,

                entityId: input.entityId,

                entityLabel: input.entityLabel,

                action: input.action,

                oldValue: input.oldValue,

                newValue: input.newValue,

                ipAddress: input.ipAddress,

                userAgent: input.userAgent,
            },
            tx
        );
    }

    /**
     * Returns paginated audit logs.
     */
    async list(query: AuditLogListQuery) {
        const [data, total] = await Promise.all([
            this.repository.list(query),
            this.repository.count(query),
        ]);

        return {
            data,

            pagination: {
                page: query.page,

                limit: query.limit,

                total,

                totalPages: Math.ceil(total / query.limit),
            },
        };
    }

    /**
     * Returns a single audit log.
     */
    async getById(id: string) {
        return this.ensureAuditLogExists(id);
    }

    /**
     * Ensures an audit log exists.
     */
    private async ensureAuditLogExists(id: string) {
        const auditLog = await this.repository.findById(id);

        if (!auditLog) {
            throw new NotFoundError(AUDIT_MESSAGES.NOT_FOUND);
        }

        return auditLog;
    }
}

export const auditService = new AuditService();