import { logger } from "../../config";

import { IST_OFFSET_MS, PAYMENT_METHOD_LABELS } from "./dashboard.constants";
import { DashboardRepository, dashboardRepository } from "./dashboard.repository";
import type {
    DashboardResponse,
    DashboardSummary,
    DateBoundaries,
    PaymentDistributionEntry,
    RecentTransactionEntry,
} from "./dashboard.types";

/**
 * Computes "start of today / this month / this year" as real UTC instants
 * that correspond to IST midnight - without a timezone library.
 *
 * Trick: shift "now" forward by the IST offset, then read it back using
 * the UTC getters. Those getters now report IST's wall-clock date, because
 * we shifted the underlying instant by exactly that offset. Build IST
 * midnight in that shifted frame with Date.UTC(), then shift back by
 * subtracting the offset to get the real UTC instant Postgres should
 * compare against (Transaction.createdAt is stored/compared in UTC).
 */
function getISTDateBoundaries(): DateBoundaries {
    const istShifted = new Date(Date.now() + IST_OFFSET_MS);

    const istYear = istShifted.getUTCFullYear();
    const istMonth = istShifted.getUTCMonth();
    const istDate = istShifted.getUTCDate();

    const todayStartIST = Date.UTC(istYear, istMonth, istDate, 0, 0, 0, 0);
    const monthStartIST = Date.UTC(istYear, istMonth, 1, 0, 0, 0, 0);
    const yearStartIST = Date.UTC(istYear, 0, 1, 0, 0, 0, 0);

    return {
        todayStart: new Date(todayStartIST - IST_OFFSET_MS),
        monthStart: new Date(monthStartIST - IST_OFFSET_MS),
        yearStart: new Date(yearStartIST - IST_OFFSET_MS),
    };
}

export class DashboardService {
    constructor(
        private readonly repository: DashboardRepository = dashboardRepository
    ) {}

    async getDashboard(adminId: string): Promise<DashboardResponse> {
        const startedAt = Date.now();
        const boundaries = getISTDateBoundaries();

        const [rawSummary, rawDistribution, rawRecent] = await Promise.all([
            this.repository.getSummary(boundaries),
            this.repository.getPaymentDistribution(),
            this.repository.getRecentTransactions(),
        ]);

        const summary: DashboardSummary = {
            todayCollection: Number(rawSummary.today._sum.amount ?? 0),
            transactionsToday: rawSummary.today._count,
            monthCollection: Number(rawSummary.month._sum.amount ?? 0),
            yearCollection: Number(rawSummary.year._sum.amount ?? 0),
            totalTransactions: rawSummary.allTime._count,
            averageDonation: Number(rawSummary.allTime._avg.amount ?? 0),
            highestDonation: Number(rawSummary.allTime._max.amount ?? 0),
        };

        const paymentDistribution: PaymentDistributionEntry[] = rawDistribution.map((row) => ({
            mode: PAYMENT_METHOD_LABELS[row.paymentMethod],
            count: row._count,
            amount: Number(row._sum.amount ?? 0),
        }));

        const recentTransactions: RecentTransactionEntry[] = rawRecent.map((tx) => ({
            id: tx.id,
            receiptNumber: tx.receiptNumber,
            donorName: tx.donor.name,
            amount: Number(tx.amount),
            paymentMode: PAYMENT_METHOD_LABELS[tx.paymentMethod],
            createdAt: tx.createdAt,
            building: tx.building,
        }));

        // Metadata only - never the actual figures. Winston's own format
        // already stamps a timestamp on every line, so no need to add one.
        logger.info("Dashboard viewed", {
            adminId,
            generatedInMs: Date.now() - startedAt,
        });

        return { summary, paymentDistribution, recentTransactions };
    }
}

export const dashboardService = new DashboardService();
