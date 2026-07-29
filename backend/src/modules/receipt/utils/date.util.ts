import { format } from "date-fns";

export const formatReceiptDate = (
    date: Date
): string => {
    return format(date, "dd MMM yyyy");
};

export const formatReceiptTime = (
    date: Date
): string => {
    return format(date, "hh:mm a");
};