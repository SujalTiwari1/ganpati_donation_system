import { Prisma } from "@prisma/client";
import { ToWords } from "to-words";

const toWords = new ToWords({
    localeCode: "en-IN",
    converterOptions: {
        currency: true,
        ignoreDecimal: false,
        ignoreZeroCurrency: false,
        doNotAddOnly: false,
    },
});

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export const formatCurrency = (
    amount: Prisma.Decimal | number
): string => {
    const value =
        amount instanceof Prisma.Decimal
            ? amount.toNumber()
            : amount;

    return currencyFormatter.format(value);
};

export const amountToWords = (
    amount: Prisma.Decimal | number
): string => {
    const value =
        amount instanceof Prisma.Decimal
            ? amount.toNumber()
            : amount;

    return toWords.convert(value);
};