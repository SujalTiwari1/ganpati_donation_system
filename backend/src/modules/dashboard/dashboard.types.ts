// Internal only — computed by the service, consumed by the repository's
// getSummary() so the repository never has to know what "IST" means.
export interface DateBoundaries {
    todayStart: Date;
    monthStart: Date;
    yearStart: Date;
}

export interface DashboardSummary {
    todayCollection: number;
    monthCollection: number;
    yearCollection: number;
    transactionsToday: number;
    totalTransactions: number;
    averageDonation: number;
    highestDonation: number;
}

export interface PaymentDistributionEntry {
    mode: string; // display label, e.g. "Bank Transfer" — not the raw enum
    count: number;
    amount: number;
}

export interface RecentTransactionEntry {
    id: string;
    receiptNumber: string;
    donorName: string;
    amount: number;
    paymentMode: string; // display label, same convention as above
    createdAt: Date;
    building: {
        id: string;
        name: string;
    };
}

export interface DashboardResponse {
    summary: DashboardSummary;
    paymentDistribution: PaymentDistributionEntry[];
    recentTransactions: RecentTransactionEntry[];
}
