import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatCurrency(value: number | string | null | undefined, compact = false) {
  const amount = typeof value === "string" ? Number(value) : (value ?? 0);
  if (Number.isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: compact ? 1 : 2,
    minimumFractionDigits: compact ? 0 : 2,
    notation: compact ? "compact" : "standard",
  }).format(amount);
}

export function formatNumber(value: number | string | null | undefined) {
  const num = typeof value === "string" ? Number(value) : (value ?? 0);
  return new Intl.NumberFormat("en-IN").format(Number.isNaN(num) ? 0 : num);
}

function toDate(value: string | Date) {
  return typeof value === "string" ? parseISO(value) : value;
}

export function formatDate(value?: string | Date | null, pattern = "dd MMM yyyy") {
  if (!value) return "—";
  try {
    return format(toDate(value), pattern);
  } catch {
    return "—";
  }
}

export function formatDateTime(value?: string | Date | null) {
  return formatDate(value, "dd MMM yyyy, hh:mm a");
}

export function timeAgo(value?: string | Date | null) {
  if (!value) return "—";
  try {
    return formatDistanceToNow(toDate(value), { addSuffix: true });
  } catch {
    return "—";
  }
}

export function normalizeBuildingName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function formatMobile(mobile?: string | null) {
  if (!mobile) return "—";
  const digits = mobile.replace(/\D/g, "").slice(-10);
  return digits.length === 10 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : mobile;
}

export function initialsOf(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function titleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}