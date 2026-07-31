import { useState, useMemo } from "react";
import { useDashboard } from "@/hooks/queries/use-dashboard";
import { useTransactions } from "@/hooks/queries/use-transactions";
import { AnalyticsFiltersState } from "../types";
import {
  processCollectionTrend,
  processDonationDistribution,
  processHeatmapData,
  processVolunteerLeaderboard,
  processWhatsAppAnalytics,
} from "../utils/analytics.utils";

export function useAnalyticsData() {
  const [filters, setFilters] = useState<AnalyticsFiltersState>({
    year: new Date().getFullYear(),
  });

  const [trendMode, setTrendMode] = useState<"Daily" | "Weekly" | "Monthly">("Daily");

  const { data: dashboardData, isLoading: isLoadingDashboard, refetch: refetchDashboard } = useDashboard();
  
  // Use the API-supported filters directly on the transactions hook
  const { data: txData, isLoading: isLoadingTx, refetch: refetchTx } = useTransactions({
    limit: 100, // API maximum limit without pagination
    year: filters.year,
    fromDate: filters.fromDate ? filters.fromDate.toISOString() : undefined,
    toDate: filters.toDate ? filters.toDate.toISOString() : undefined,
    paymentMethod: filters.paymentMethod !== "ALL" ? filters.paymentMethod : undefined,
    status: filters.status !== "ALL" ? filters.status : undefined,
  });

  const isLoading = isLoadingDashboard || isLoadingTx;

  const refreshData = () => {
    refetchDashboard();
    refetchTx();
  };

  // 1. Client-side filtering for properties not supported by the API natively
  const filteredTransactions = useMemo(() => {
    if (!txData?.data) return [];
    
    return txData.data.filter((tx) => {
      // Volunteer Filter (assuming volunteerId is present natively as mentioned in Utils)
      if (filters.volunteerId && filters.volunteerId !== "ALL") {
        const volId = (tx as any).volunteerId;
        if (volId !== filters.volunteerId) return false;
      }
      
      // WhatsApp Status Filter
      if (filters.whatsappStatus && filters.whatsappStatus !== "ALL") {
        if (tx.whatsappStatus !== filters.whatsappStatus) return false;
      }
      
      return true;
    });
  }, [txData, filters.volunteerId, filters.whatsappStatus]);

  // 2. Computed Analytics
  const summary = dashboardData?.summary;
  const paymentDistribution = dashboardData?.paymentDistribution ?? [];

  const collectionTrend = useMemo(
    () => processCollectionTrend(filteredTransactions, trendMode),
    [filteredTransactions, trendMode]
  );

  const donationDistribution = useMemo(
    () => processDonationDistribution(filteredTransactions),
    [filteredTransactions]
  );

  const volunteerLeaderboard = useMemo(
    () => processVolunteerLeaderboard(filteredTransactions),
    [filteredTransactions]
  );

  const whatsappAnalytics = useMemo(
    () => processWhatsAppAnalytics(filteredTransactions),
    [filteredTransactions]
  );

  const heatmapData = useMemo(
    () => processHeatmapData(filteredTransactions),
    [filteredTransactions]
  );

  return {
    filters,
    setFilters,
    trendMode,
    setTrendMode,
    isLoading,
    refreshData,
    summary,
    paymentDistribution,
    collectionTrend,
    donationDistribution,
    volunteerLeaderboard,
    whatsappAnalytics,
    heatmapData,
    filteredTransactions, // raw list of the 100 max filtered items if needed for tables
  };
}
