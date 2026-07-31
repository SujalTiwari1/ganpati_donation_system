import type {
  AUDIT_ACTIONS,
  AUDIT_ENTITIES,
  PAYMENT_METHODS,
  TRANSACTION_STATUSES,
  WHATSAPP_STATUSES,
} from "@/constants";

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];
export type WhatsappStatus = (typeof WHATSAPP_STATUSES)[number];
export type AuditEntity = (typeof AUDIT_ENTITIES)[number];
export type AuditAction = (typeof AUDIT_ACTIONS)[number];
export type UserRole = "ADMIN" | "VOLUNTEER";

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  mobile: string;
  role: UserRole;
  status: "ACTIVE" | "SUSPENDED" | string;
  mustChangePassword?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface Building {
  id: string;
  name: string;
  normalizedName: string;
  area?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdById?: string | null;
  updatedById?: string | null;
  deletedById?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Donor {
  id: string;
  name: string;
  mobile: string;
  roomNumber?: string | null;
  building?: Pick<Building, "id" | "name"> | null;
}

export interface Transaction {
  id: string;
  receiptNumber: string;
  roomNumber?: string | null;
  amount: string | number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  whatsappStatus: WhatsappStatus;
  notes?: string | null;
  year?: number;
  donationDate: string;
  createdAt: string;
  updatedAt?: string;
  donor: Donor;
  building: Pick<Building, "id" | "name">;
  isDuplicate?: boolean;
  duplicateOverrideReason?: string | null;
}

export interface DashboardSummary {
  todayCollection: number;
  transactionsToday: number;
  monthCollection: number;
  yearCollection: number;
  totalTransactions: number;
  averageDonation: number;
  highestDonation: number;
}

export interface PaymentDistributionItem {
  mode: string;
  count: number;
  amount: number;
}

export interface DashboardRecentTransaction {
  id: string;
  receiptNumber: string;
  donorName: string;
  amount: number;
  paymentMode: string;
  createdAt: string;
  building?: Pick<Building, "id" | "name">;
}

export interface DashboardData {
  summary: DashboardSummary;
  paymentDistribution: PaymentDistributionItem[];
  recentTransactions: DashboardRecentTransaction[];
}

export interface AuditLog {
  id: string;
  entity: AuditEntity;
  entityId: string | null;
  entityLabel: string | null;
  action: AuditAction;
  oldValue: unknown;
  newValue: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  userId: string | null;
  user?: Pick<User, "id" | "name" | "email"> | null;
}