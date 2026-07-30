const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

const SCALES = ["", "Thousand", "Lakh", "Crore"];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  return `${TENS[Math.floor(n / 10)]}${n % 10 ? " " + ONES[n % 10] : ""}`;
}

function threeDigits(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  let result = "";
  if (hundreds) result += `${ONES[hundreds]} Hundred`;
  if (rest) result += (result ? " " : "") + twoDigits(rest);
  return result;
}

/** Indian-system number to words (lakh/crore), for receipt previews. */
export function amountToWords(value: number | string): string {
  const num = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(num) || num === 0) return "Zero Rupees Only";

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  const parts: string[] = [];

  // Indian grouping: last 3 digits, then groups of 2 (lakh, crore)
  let remaining = rupees;
  const groups: number[] = [];
  groups.push(remaining % 1000);
  remaining = Math.floor(remaining / 1000);
  while (remaining > 0) {
    groups.push(remaining % 100);
    remaining = Math.floor(remaining / 100);
  }

  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    const scale = SCALES[i] ?? "";
    const words =
      i === 0 ? threeDigits(groups[i]) : twoDigits(groups[i]);
    parts.push(scale ? `${words} ${scale}` : words);
  }

  let result = parts.join(" ").trim();

  if (paise > 0) {
    result += ` and ${twoDigits(paise)} Paise`;
  }

  return `${result} Rupees Only`;
}
