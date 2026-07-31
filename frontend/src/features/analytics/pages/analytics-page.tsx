import { useAnalyticsData } from "../hooks/use-analytics-data";
import { AnalyticsHeader } from "../components/analytics-header";
import { AnalyticsFilters } from "../components/analytics-filters";
import { AnalyticsCard } from "../components/analytics-card";
import { CollectionTrendChart } from "../components/charts/collection-trend-chart";
import { PaymentDistributionChart } from "../components/charts/payment-distribution-chart";
import { DonationDistributionChart } from "../components/charts/donation-distribution-chart";
import { VolunteerLeaderboard } from "../components/volunteer-leaderboard";
import { WhatsAppAnalytics } from "../components/whatsapp-analytics";
import { HeatmapCalendar } from "../components/charts/heatmap-calendar";
import { ExportPanel } from "../components/export-panel";
import { IndianRupee, Wallet, TrendingUp, Users } from "lucide-react";
import { formatCurrency } from "@/utils/format";

export function AnalyticsPage() {
  const {
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
    filteredTransactions,
  } = useAnalyticsData();

  // If a goal is defined from backend or custom config, we could pass it here.
  // For now, we omit the target as per the requirement: "If no target exists, gracefully hide this section."

  return (
    <div className="space-y-6 pb-10">
      <AnalyticsHeader onRefresh={refreshData} isRefreshing={isLoading} />
      
      <AnalyticsFilters filters={filters} onChange={setFilters} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          index={0}
          title="Total Collection"
          value={summary?.yearCollection ? formatCurrency(summary.yearCollection) : "—"}
          subtitle="This Year"
          icon={IndianRupee}
          isLoading={isLoading}
        />
        <AnalyticsCard
          index={1}
          title="Today's Collection"
          value={summary?.todayCollection !== undefined ? formatCurrency(summary.todayCollection) : "—"}
          subtitle={`${summary?.transactionsToday || 0} donations today`}
          icon={Wallet}
          isLoading={isLoading}
        />
        <AnalyticsCard
          index={2}
          title="Monthly Collection"
          value={summary?.monthCollection !== undefined ? formatCurrency(summary.monthCollection) : "—"}
          subtitle="This Month"
          icon={TrendingUp}
          isLoading={isLoading}
        />
        <AnalyticsCard
          index={3}
          title="Average Donation"
          value={summary?.averageDonation ? formatCurrency(summary.averageDonation) : "—"}
          subtitle={`Highest: ${summary?.highestDonation ? formatCurrency(summary.highestDonation) : "—"}`}
          icon={Users}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <CollectionTrendChart
          data={collectionTrend}
          mode={trendMode}
          onModeChange={setTrendMode}
          isLoading={isLoading}
        />
        <PaymentDistributionChart
          data={paymentDistribution}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <DonationDistributionChart
          data={donationDistribution}
          isLoading={isLoading}
        />
        <VolunteerLeaderboard
          data={volunteerLeaderboard}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <WhatsAppAnalytics
          data={whatsappAnalytics}
          transactions={filteredTransactions}
          isLoading={isLoading}
        />
        <HeatmapCalendar
          data={heatmapData}
          isLoading={isLoading}
        />
      </div>

      <ExportPanel />
    </div>
  );
}
