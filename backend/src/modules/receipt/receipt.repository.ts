import { prisma } from "../../database";

import { RECEIPT_INCLUDE } from "./receipt.types";

export class ReceiptRepository {
    async getReceiptData(transactionId: string) {
        return prisma.transaction.findFirst({
            where: {
                id: transactionId,
                deletedAt: null,
            },

            include: RECEIPT_INCLUDE,
        });
    }
}

export const receiptRepository = new ReceiptRepository();