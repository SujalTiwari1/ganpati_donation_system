import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { ErrorState } from "@/components/common/error-state";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import { useMyStatistics, useMyDonations } from "@/hooks/queries/use-user";
import { VolunteerProfileHeader } from "@/features/volunteer/components/volunteer-profile-header";
import { VolunteerInfoCard } from "@/features/volunteer/components/volunteer-info-card";
import { VolunteerAccountInfoCard } from "@/features/volunteer/components/volunteer-account-info-card";
import { VolunteerStatisticsCard } from "@/features/volunteer/components/volunteer-statistics-card";
import { VolunteerRecentDonations } from "@/features/volunteer/components/volunteer-recent-donations";
import { VolunteerProfileActions } from "@/features/volunteer/components/volunteer-profile-actions";
import { VolunteerEditProfileDialog } from "@/features/volunteer/components/volunteer-edit-profile-dialog";

export function VolunteerProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);

  const {
    data: statistics,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErr,
    refetch,
  } = useMyStatistics();
  const { data: donationsData, isLoading: donationsLoading } = useMyDonations(10);

  const donations = donationsData?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your account and collection summary." />

      <VolunteerProfileHeader
        user={user}
        onEdit={() => setEditOpen(true)}
        onChangePassword={() => navigate({ to: "/change-password" })}
      />

      {statsError ? (
        <Card>
          <ErrorState message={(statsErr as Error)?.message} onRetry={() => void refetch()} />
        </Card>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <VolunteerInfoCard user={user} />
            <VolunteerAccountInfoCard user={user} />
          </div>

          <div>
            <h3 className="mb-4 text-base font-semibold text-foreground">Collection Statistics</h3>
            <VolunteerStatisticsCard statistics={statistics} isLoading={statsLoading} />
          </div>

          <VolunteerRecentDonations donations={donations} isLoading={donationsLoading} />

          <VolunteerProfileActions onEdit={() => setEditOpen(true)} />
        </>
      )}

      <VolunteerEditProfileDialog open={editOpen} onOpenChange={setEditOpen} user={user} />
    </div>
  );
}
