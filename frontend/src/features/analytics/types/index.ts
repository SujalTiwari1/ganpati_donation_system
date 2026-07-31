import { PaymentMethod, TransactionStatus, WhatsappStatus } from "@/types/api";

export interface AnalyticsFiltersState {
  year?: number;
  fromDate?: Date;
  toDate?: Date;
  volunteerId?: string;
  paymentMethod?: PaymentMethod | "ALL";
  status?: TransactionStatus | "ALL";
  whatsappStatus?: WhatsappStatus | "ALL";
}

export interface CollectionTrendDataPoint {
  date: string;
  amount: number;
}

export interface PaymentDistributionDataPoint {
  name: string;
  value: number;
  count: number;
}

export interface DonationDistributionDataPoint {
  range: string;
  count: number;
  total: number;
}

export interface VolunteerLeaderboardEntry {
  id: string;
  name: string;
  count: number;
  total: number;
  average: number;
}

export interface HeatmapDataPoint {
  date: string;
  amount: number;
  count: number;
}

export interface WhatsAppAnalyticsData {
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  pending: number;
  total: number;
  deliveryRate: number;
  readRate: number;
  failureRate: number;
}
