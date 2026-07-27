import { PaymentMethod, TransactionStatus } from "@prisma/client";

export const DASHBOARD_MESSAGES = {
    FETCHED: "Dashboard data fetched successfully",
} as const;

export const MAX_RECENT_TRANSACTIONS = 10;

// The only status that counts toward collection totals. Deliberately
// excludes CANCELLED (obviously) as well as PENDING and REFUNDED — the
// create/cancel flows in the Transaction module never set those today,
// but if a future feature does, they shouldn't silently inflate the
// dashboard's numbers.
export const DASHBOARD_ACTIVE_STATUS = TransactionStatus.CONFIRMED;

// Display labels for the pie chart / recent-transactions list. Includes
// CARD and OTHER even though the original spec only named four modes —
// the schema's PaymentMethod enum grew since that doc was written.
// Unused modes simply never appear in a groupBy result, so this stays
// correct either way without maintenance.
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    CASH: "Cash",
    UPI: "UPI",
    CARD: "Card",
    BANK_TRANSFER: "Bank Transfer",
    CHEQUE: "Cheque",
    OTHER: "Other",
};

// IST is UTC+5:30, fixed (India does not observe daylight saving).
export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
