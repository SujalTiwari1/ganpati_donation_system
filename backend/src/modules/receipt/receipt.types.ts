import type { Prisma } from "@prisma/client";

export interface ReceiptTemplateData extends Record<string, unknown> {
    receiptNumber: string;

    donorName: string;
    donorMobile: string;

    buildingName: string;
    roomNumber: string;

    amount: string;
    amountInWords: string;

    paymentMethod: string;

    donationDate: string;
    donationTime: string;

    volunteerName: string;

    festivalName: string;
}

export const RECEIPT_INCLUDE = {
    donor: {
        select: {
            id: true,
            name: true,
            mobile: true,
            roomNumber: true,
        },
    },

    building: {
        select: {
            id: true,
            name: true,
        },
    },

    volunteer: {
        select: {
            id: true,
            name: true,
        },
    },

    festival: {
        select: {
            id: true,
            name: true,
            year: true,
        },
    },
} satisfies Prisma.TransactionInclude;

export type ReceiptTransaction =
    Prisma.TransactionGetPayload<{
        include: typeof RECEIPT_INCLUDE;
    }>;