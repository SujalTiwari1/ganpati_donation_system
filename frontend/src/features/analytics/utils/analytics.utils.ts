import { Transaction, PaymentDistributionItem, DashboardSummary } from "@/types/api";
import {
  CollectionTrendDataPoint,
  DonationDistributionDataPoint,
  HeatmapDataPoint,
  VolunteerLeaderboardEntry,
  WhatsAppAnalyticsData,
} from "../types";
import { format, parseISO, startOfDay, startOfWeek, startOfMonth } from "date-fns";

export function processCollectionTrend(
  transactions: Transaction[],
  mode: "Daily" | "Weekly" | "Monthly"
): CollectionTrendDataPoint[] {
  const map = new Map<string, number>();

  transactions.forEach((tx) => {
    if (tx.status === "CANCELLED") return;
    const date = parseISO(tx.donationDate || tx.createdAt);
    let key = "";
    if (mode === "Daily") {
      key = format(startOfDay(date), "MMM dd, yyyy");
    } else if (mode === "Weekly") {
      key = format(startOfWeek(date), "MMM dd, yyyy");
    } else {
      key = format(startOfMonth(date), "MMM yyyy");
    }
    map.set(key, (map.get(key) || 0) + Number(tx.amount));
  });

  return Array.from(map.entries())
    .map(([date, amount]) => ({ date, amount }))
    .reverse(); // assuming transactions are descending by date
}

export function processDonationDistribution(
  transactions: Transaction[]
): DonationDistributionDataPoint[] {
  const ranges = [
    { label: "₹1–500", min: 1, max: 500, count: 0, total: 0 },
    { label: "₹501–1000", min: 501, max: 1000, count: 0, total: 0 },
    { label: "₹1001–2500", min: 1001, max: 2500, count: 0, total: 0 },
    { label: "₹2501–5000", min: 2501, max: 5000, count: 0, total: 0 },
    { label: "₹5001–10000", min: 5001, max: 10000, count: 0, total: 0 },
    { label: "₹10000+", min: 10001, max: Infinity, count: 0, total: 0 },
  ];

  transactions.forEach((tx) => {
    if (tx.status === "CANCELLED") return;
    const amount = Number(tx.amount);
    const range = ranges.find((r) => amount >= r.min && amount <= r.max);
    if (range) {
      range.count += 1;
      range.total += amount;
    }
  });

  return ranges
    .filter((r) => r.count > 0)
    .map((r) => ({ range: r.label, count: r.count, total: r.total }));
}

export function processVolunteerLeaderboard(
  transactions: Transaction[]
): VolunteerLeaderboardEntry[] {
  const map = new Map<string, { count: number; total: number }>();

  transactions.forEach((tx) => {
    if (tx.status === "CANCELLED") return;
    // Fallback to donor name if volunteerId is missing, though the backend returns volunteerId natively
    const volId = (tx as any).volunteerId || "Unknown Volunteer";
    const amount = Number(tx.amount);
    const existing = map.get(volId);
    if (existing) {
      existing.count += 1;
      existing.total += amount;
    } else {
      map.set(volId, { count: 1, total: amount });
    }
  });

  return Array.from(map.entries())
    .map(([id, stats]) => ({
      id,
      name: id.includes("-") ? `Volunteer ${id.slice(-4)}` : id,
      count: stats.count,
      total: stats.total,
      average: stats.total / stats.count,
    }))
    .sort((a, b) => b.total - a.total);
}

export function processWhatsAppAnalytics(transactions: Transaction[]): WhatsAppAnalyticsData {
  const data: WhatsAppAnalyticsData = {
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
    pending: 0,
    total: 0,
    deliveryRate: 0,
    readRate: 0,
    failureRate: 0,
  };

  transactions.forEach((tx) => {
    data.total += 1;
    switch (tx.whatsappStatus) {
      case "SENT":
        data.sent += 1;
        break;
      case "DELIVERED":
        data.delivered += 1;
        break;
      case "READ":
        data.read += 1;
        break;
      case "FAILED":
        data.failed += 1;
        break;
      case "PENDING":
      case "QUEUED":
        data.pending += 1;
        break;
    }
  });

  if (data.total > 0) {
    // Delivery rate includes delivered and read
    data.deliveryRate = ((data.delivered + data.read) / data.total) * 100;
    data.readRate = (data.read / data.total) * 100;
    data.failureRate = (data.failed / data.total) * 100;
  }

  return data;
}

export function processHeatmapData(transactions: Transaction[]): HeatmapDataPoint[] {
  const map = new Map<string, { amount: number; count: number }>();

  transactions.forEach((tx) => {
    if (tx.status === "CANCELLED") return;
    const date = parseISO(tx.donationDate || tx.createdAt);
    const key = format(date, "yyyy-MM-dd");
    const amount = Number(tx.amount);

    const existing = map.get(key);
    if (existing) {
      existing.amount += amount;
      existing.count += 1;
    } else {
      map.set(key, { amount, count: 1 });
    }
  });

  return Array.from(map.entries())
    .map(([date, stats]) => ({
      date,
      amount: stats.amount,
      count: stats.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
