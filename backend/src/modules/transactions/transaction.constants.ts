export const TRANSACTION_MESSAGES = {
    CREATED: "Transaction recorded successfully",
    FETCHED: "Transaction fetched successfully",
    FETCHED_ALL: "Transactions fetched successfully",
    UPDATED: "Transaction updated successfully",
    CANCELLED: "Transaction cancelled successfully",
    NOT_FOUND: "Transaction not found",
    BUILDING_NOT_FOUND: "Building not found",
    ALREADY_CANCELLED: "This transaction is already cancelled",
    CANNOT_EDIT_CANCELLED: "Cancelled transactions cannot be edited",
    DUPLICATE_ROOM_COLLECTION:
        "A donation for this room has already been recorded for this festival. " +
        "Set overrideDuplicate to true with a reason to record it anyway.",
} as const;

export const TRANSACTION_SORTABLE_FIELDS = [
    "donationDate",
    "amount",
    "createdAt",
    "receiptNumber",
] as const;

// Set to e.g. "GVM-" if you want receipts formatted as GVM-2026-000001
// instead of the current 2026-000001.
export const RECEIPT_NUMBER_PREFIX = "";
export const RECEIPT_SEQ_PAD_LENGTH = 6;

export const MIN_TRANSACTION_AMOUNT = 1;
// Sanity ceiling, not a real business limit — adjust freely.
export const MAX_TRANSACTION_AMOUNT = 1_000_000;
