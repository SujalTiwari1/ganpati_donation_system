import { prisma } from "../../database";

import { DASHBOARD_ACTIVE_STATUS, MAX_RECENT_TRANSACTIONS } from "./dashboard.constants";
import type { DateBoundaries } from "./dashboard.types";

export class DashboardRepository {
    /**
     * Four independent aggregates, run in parallel:
     *   - today   → _sum + _count in ONE query (todayCollection + transactionsToday)
     *   - month   → _sum only
     *   - year    → _sum only
     *   - allTime → _count + _avg + _max in ONE query (totalTransactions,
     *               averageDonation, highestDonation)
     * Prisma supports multiple aggregate functions in a single `aggregate()`
     * call, so this is 4 round trips total, not 7 — each one already
     * consolidated as far as a single WHERE clause allows.
     */
    async getSummary(boundaries: DateBoundaries) {
        const [today, month, year, allTime] = await Promise.all([
            prisma.transaction.aggregate({
                where: {
                    status: DASHBOARD_ACTIVE_STATUS,
                    deletedAt: null,
                    createdAt: { gte: boundaries.todayStart },
                },
                _sum: { amount: true },
                _count: true,
            }),
            prisma.transaction.aggregate({
                where: {
                    status: DASHBOARD_ACTIVE_STATUS,
                    deletedAt: null,
                    createdAt: { gte: boundaries.monthStart },
                },
                _sum: { amount: true },
            }),
            prisma.transaction.aggregate({
                where: {
                    status: DASHBOARD_ACTIVE_STATUS,
                    deletedAt: null,
                    createdAt: { gte: boundaries.yearStart },
                },
                _sum: { amount: true },
            }),
            prisma.transaction.aggregate({
                where: {
                    status: DASHBOARD_ACTIVE_STATUS,
                    deletedAt: null,
                },
                _count: true,
                _avg: { amount: true },
                _max: { amount: true },
            }),
        ]);

        return { today, month, year, allTime };
    }

    /** One groupBy query — Postgres does the bucketing, not application code. */
    async getPaymentDistribution() {
        return prisma.transaction.groupBy({
            by: ["paymentMethod"],
            where: {
                status: DASHBOARD_ACTIVE_STATUS,
                deletedAt: null,
            },
            _sum: { amount: true },
            _count: true,
        });
    }

    /** Served entirely by idx_transactions_created_at (+ status via BitmapAnd). */
    async getRecentTransactions() {
        return prisma.transaction.findMany({
            where: {
                status: DASHBOARD_ACTIVE_STATUS,
                deletedAt: null,
            },
            orderBy: { createdAt: "desc" },
            take: MAX_RECENT_TRANSACTIONS,
            select: {
                id: true,
                receiptNumber: true,
                amount: true,
                paymentMethod: true,
                createdAt: true,
                donor: { select: { name: true } },
                building: { select: { id: true, name: true } },
            },
        });
    }
}

export const dashboardRepository = new DashboardRepository();
