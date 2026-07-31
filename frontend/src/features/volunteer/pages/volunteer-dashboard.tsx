import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/common/error-state";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { useMyStatistics, useMyDonations } from "@/hooks/queries/use-user";
import { useAuditLogs } from "@/hooks/queries/use-audit-logs";
import { VolunteerSummaryCards } from "@/features/volunteer/components/volunteer-summary-cards";
import { VolunteerQuickActions } from "@/features/volunteer/components/volunteer-quick-actions";
import { VolunteerDonationTable } from "@/features/volunteer/components/volunteer-donation-table";
import { VolunteerPerformanceChart } from "@/features/volunteer/components/volunteer-performance-chart";
import { VolunteerTodayProgress } from "@/features/volunteer/components/volunteer-today-progress";
import { VolunteerActivityTimeline } from "@/features/volunteer/components/volunteer-activity-timeline";

export function VolunteerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: statistics,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErr,
    refetch: refetchStats,
  } = useMyStatistics();

  const {
    data: donationsData,
    isLoading: donationsLoading,
  } = useMyDonations(10);

  const { data: auditData, isLoading: auditLoading } = useAuditLogs(
    { limit: 5, sortOrder: "desc", userId: user?.id },
    Boolean(user?.id),
  );

  const donations = donationsData?.data ?? [];
  const activities = auditData?.data ?? [];
  const collectedToday = statistics?.totalAmount ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your collection activities."
        actions={
          <Button onClick={() => navigate({ to: "/transactions/new" })} className="active:scale-95">
            <Plus className="size-4" /> New Donation
          </Button>
        }
      />

      {statsError ? (
        <Card>
          <ErrorState message={(statsErr as Error)?.message} onRetry={() => void refetchStats()} />
        </Card>
      ) : (
        <>
          <VolunteerSummaryCards statistics={statistics} isLoading={statsLoading} />

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <VolunteerDonationTable donations={donations} isLoading={donationsLoading} />
            </div>
            <div className="space-y-4 lg:col-span-2">
              <VolunteerTodayProgress collectedToday={collectedToday} isLoading={statsLoading} />
              <VolunteerQuickActions />
            </div>
          </div>

          <VolunteerPerformanceChart donations={donations} isLoading={donationsLoading} />

          <VolunteerActivityTimeline activities={activities} isLoading={auditLoading} />
        </>
      )}
    </div>
  );
}
