export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export const TOKEN_STORAGE_KEY = "vargani.token";
export const USER_STORAGE_KEY = "vargani.user";
export const THEME_STORAGE_KEY = "vargani.theme";
export const SETTINGS_STORAGE_KEY = "vargani.settings";
export const SIDEBAR_STORAGE_KEY = "vargani.sidebar";

export const PAYMENT_METHODS = [
  "CASH",
  "UPI",
  "CARD",
  "BANK_TRANSFER",
  "CHEQUE",
  "OTHER",
] as const;

export const TRANSACTION_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "FAILED"] as const;

export const WHATSAPP_STATUSES = [
  "PENDING",
  "SENT",
  "DELIVERED",
  "READ",
  "FAILED",
] as const;

export const AUDIT_ENTITIES = ["AUTH", "BUILDING", "TRANSACTION", "SETTINGS", "USER"] as const;

export const AUDIT_ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "RESTORE",
  "LOGIN",
  "LOGOUT",
  "STATUS_CHANGE",
] as const;