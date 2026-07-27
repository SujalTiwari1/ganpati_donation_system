import { Prisma } from "@prisma/client";

import { prisma } from "../../database";

import type {
    AuditLogListQuery,
    CreateAuditLogInput,
} from "./audit.types";

const AUDIT_INCLUDE = {
    user: {
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
        },
    },
} satisfies Prisma.AuditLogInclude;

export class AuditRepository {
    /**
     * Create a new audit log.
     * Should only be called by AuditService.
     */
    async create(
        data: Prisma.AuditLogUncheckedCreateInput,
        tx: Prisma.TransactionClient = prisma
    ) {
        return tx.auditLog.create({
            data,
            include: AUDIT_INCLUDE,
        });
    }

    /**
     * Returns audit log by id.
     */
    async findById(id: string) {
        return prisma.auditLog.findUnique({
            where: {
                id,
            },
            include: AUDIT_INCLUDE,
        });
    }

    /**
     * Returns paginated audit logs.
     */
    async list(query: AuditLogListQuery) {
        return prisma.auditLog.findMany({
            where: this.buildWhere(query),

            include: AUDIT_INCLUDE,

            orderBy: {
                createdAt: query.sortOrder,
            },

            skip: (query.page - 1) * query.limit,

            take: query.limit,
        });
    }

    /**
     * Total count for pagination.
     */
    async count(query: AuditLogListQuery) {
        return prisma.auditLog.count({
            where: this.buildWhere(query),
        });
    }

    /**
     * Converts query DTO into Prisma where clause.
     */
    private buildWhere(
        query: AuditLogListQuery
    ): Prisma.AuditLogWhereInput {
        return {
            ...(query.entity && {
                entity: query.entity,
            }),

            ...(query.action && {
                action: query.action,
            }),

            ...(query.userId && {
                userId: query.userId,
            }),

            ...((query.fromDate || query.toDate) && {
                createdAt: {
                    ...(query.fromDate && {
                        gte: query.fromDate,
                    }),

                    ...(query.toDate && {
                        lte: query.toDate,
                    }),
                },
            }),

            ...(query.search && {
                OR: [
                    {
                        entityLabel: {
                            contains: query.search,
                            mode: "insensitive",
                        },
                    },

                    {
                        user: {
                            name: {
                                contains: query.search,
                                mode: "insensitive",
                            },
                        },
                    },

                    {
                        user: {
                            email: {
                                contains: query.search,
                                mode: "insensitive",
                            },
                        },
                    },
                ],
            }),
        };
    }
}

export const auditRepository = new AuditRepository();