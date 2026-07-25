import type { Building, Donor, Transaction } from "@prisma/client";

// What every list/get/create/update/cancel response actually returns —
// the donor and building are joined in so the client never has to make
// a second round trip to show "who" and "where" on a receipt.
export type TransactionWithRelations = Transaction & {
    donor: Pick<Donor, "id" | "name" | "mobile" | "roomNumber">;
    building: Pick<Building, "id" | "name">;
};

export interface PaginatedTransactions {
    data: TransactionWithRelations[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
