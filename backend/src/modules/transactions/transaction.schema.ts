import { z } from "zod";
import { PaymentMethod, TransactionStatus } from "@prisma/client";

import { mobileSchema } from "../../shared/validators";
import {
    MAX_TRANSACTION_AMOUNT,
    MIN_TRANSACTION_AMOUNT,
    TRANSACTION_SORTABLE_FIELDS,
} from "./transaction.constants";

const currentYear = new Date().getFullYear();
const yearSchema = z.coerce.number().int().min(2000).max(currentYear + 1);

export const createTransactionSchema = z
    .object({
        buildingId: z.string().uuid("buildingId must be a valid UUID").optional(),
        buildingNormalizedName: z.string().trim().min(1, "Building normalized name is required").optional(),
        donorName: z.string().trim().min(2, "Donor name is required").max(150),
        mobile: mobileSchema,
        roomNumber: z.string().trim().min(1, "Room number is required").max(20),
        amount: z.coerce
            .number()
            .positive("Amount must be greater than 0")
            .min(MIN_TRANSACTION_AMOUNT)
            .max(MAX_TRANSACTION_AMOUNT, "Amount seems unreasonably large"),
        paymentMethod: z.nativeEnum(PaymentMethod),
        year: yearSchema.default(currentYear),
        overrideDuplicate: z.boolean().optional().default(false),
        duplicateOverrideReason: z.string().trim().min(5).max(300).optional(),
    })
    .refine(
        (data) => !!data.buildingId || !!data.buildingNormalizedName,
        {
            message: "buildingId or buildingNormalizedName is required",
            path: ["buildingId", "buildingNormalizedName"],
        }
    )
    .refine(
        (data) => !data.overrideDuplicate || !!data.duplicateOverrideReason,
        {
            message: "duplicateOverrideReason is required when overrideDuplicate is true",
            path: ["duplicateOverrideReason"],
        }
    );

export const updateTransactionSchema = z
    .object({
        // Deliberately NOT here: receiptNumber, amount, buildingId, paymentMethod,
        // mobile — identity/financial fields require cancel + recreate, not edit.
        donorName: z.string().trim().min(2).max(150).optional(),
        roomNumber: z.string().trim().min(1).max(20).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field (donorName or roomNumber) must be provided",
    });

export const listTransactionsSchema = z
    .object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(100).default(20),
        search: z.string().trim().max(150).optional(),
        paymentMethod: z.nativeEnum(PaymentMethod).optional(),
        status: z.nativeEnum(TransactionStatus).optional(),
        year: yearSchema.optional(),
        fromDate: z.coerce.date().optional(),
        toDate: z.coerce.date().optional(),
        sortBy: z.enum(TRANSACTION_SORTABLE_FIELDS).optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    })
    .refine((data) => !data.fromDate || !data.toDate || data.fromDate <= data.toDate, {
        message: "fromDate must be before or equal to toDate",
        path: ["toDate"],
    });

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionListQuery = z.infer<typeof listTransactionsSchema>;
