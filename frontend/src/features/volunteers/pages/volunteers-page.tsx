import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Users } from "lucide-react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { TableSkeleton } from "@/components/common/skeletons";
import { DataPagination } from "@/components/common/data-pagination";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { useUrlSearchParams } from "@/hooks/use-url-search-params";
import {
  useVolunteers,
  useVolunteerStats,
  useCreateVolunteer,
  useUpdateVolunteer,
  useResetVolunteerPassword,
  useChangeVolunteerStatus,
} from "../hooks/use-volunteers";
import { VolunteerStatsCards } from "../components/volunteer-stats-cards";
import { VolunteerFilters } from "../components/volunteer-filters";
import { VolunteerTable } from "../components/volunteer-table";
import { VolunteerForm } from "../components/volunteer-form";
import { VolunteerProfileDrawer } from "../components/volunteer-profile-drawer";
import { ResetPasswordDialog } from "../components/reset-password-dialog";
import { DeactivateDialog } from "../components/deactivate-dialog";
import type { Volunteer } from "../types/volunteer.types";
import type { CreateVolunteerForm, EditVolunteerForm } from "../schemas/volunteer.schema";

export function VolunteersPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) navigate({ to: "/dashboard", replace: true });
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <AppShell>
      <VolunteersContent />
    </AppShell>
  );
}

function VolunteersContent() {
  const { params: searchParams, setParams } = useUrlSearchParams();

  const page = Number(searchParams.get("page") ?? 1) || 1;
  const limit = Number(searchParams.get("limit") ?? 20) || 20;
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const sortRaw = searchParams.get("sortBy") ?? "createdAt:desc";

  const [sortBy, sortOrder] = sortRaw.includes(":")
    ? sortRaw.split(":")
    : [sortRaw, "desc"];

  const { data, isLoading, isError, error, refetch } = useVolunteers({
    page,
    limit,
    search: search || undefined,
    status: (status || undefined) as Volunteer["status"] | undefined,
    sortBy: sortBy as "name" | "createdAt" | "updatedAt",
    sortOrder: sortOrder as "asc" | "desc",
  });

  const { data: stats, isLoading: statsLoading } = useVolunteerStats();

  const createMutation = useCreateVolunteer();
  const updateMutation = useUpdateVolunteer();
  const resetPasswordMutation = useResetVolunteerPassword();
  const statusMutation = useChangeVolunteerStatus();

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);
  const [viewVolunteer, setViewVolunteer] = useState<Volunteer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<Volunteer | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<Volunteer | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);

  const rows = data?.data ?? [];
  const pagination = data?.pagination;

  const updateParams = (updates: Record<string, string | null>) => {
    setParams(updates);
  };

  const openCreate = () => {
    setFormMode("create");
    setEditingVolunteer(null);
    setFormOpen(true);
  };

  const openEdit = (volunteer: Volunteer) => {
    setFormMode("edit");
    setEditingVolunteer(volunteer);
    setFormOpen(true);
  };

  const openView = (volunteer: Volunteer) => {
    setViewVolunteer(volunteer);
    setDrawerOpen(true);
  };

  const openResetPassword = (volunteer: Volunteer) => {
    setResetTarget(volunteer);
    setResetOpen(true);
  };

  const openToggleStatus = (volunteer: Volunteer) => {
    setStatusTarget(volunteer);
    setStatusOpen(true);
  };

  const handleFormSubmit = async (values: CreateVolunteerForm | EditVolunteerForm) => {
    if (formMode === "create") {
      await createMutation.mutateAsync(values as CreateVolunteerForm);
    } else if (editingVolunteer) {
      await updateMutation.mutateAsync({
        id: editingVolunteer.id,
        payload: values as EditVolunteerForm,
      });
    }
    setFormOpen(false);
  };

  const handleResetPassword = async (password: string) => {
    if (!resetTarget) return;
    await resetPasswordMutation.mutateAsync({ id: resetTarget.id, payload: { password } });
    setResetOpen(false);
    setResetTarget(null);
  };

  const handleToggleStatus = async () => {
    if (!statusTarget) return;
    const newStatus = statusTarget.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await statusMutation.mutateAsync({ id: statusTarget.id, payload: { status: newStatus } });
    setStatusOpen(false);
    setStatusTarget(null);
  };

  const statusAction = statusTarget?.status === "ACTIVE" ? "deactivate" : "activate";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Volunteer Management"
        description="Manage volunteer accounts and permissions."
        actions={
          <Button onClick={openCreate} className="active:scale-95">
            <Plus className="size-4" /> Add Volunteer
          </Button>
        }
      />

      <VolunteerStatsCards stats={stats} isLoading={statsLoading} />

      <Card className="card-elevated rounded-xl">
        <VolunteerFilters
          search={search}
          onSearchChange={(value) => updateParams({ search: value, page: null })}
          status={status}
          onStatusChange={(value) => updateParams({ status: value || null, page: null })}
          sortBy={sortRaw}
          onSortByChange={(value) => updateParams({ sortBy: value, page: null })}
        />

        {isError ? (
          <ErrorState message={(error as Error)?.message} onRetry={() => void refetch()} />
        ) : isLoading ? (
          <TableSkeleton rows={8} columns={8} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No volunteers found"
            description="Create your first volunteer account."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="size-4" /> Add Volunteer
              </Button>
            }
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <VolunteerTable
              volunteers={rows}
              onView={openView}
              onEdit={openEdit}
              onResetPassword={openResetPassword}
              onToggleStatus={openToggleStatus}
            />
          </motion.div>
        )}

        {!isLoading && !isError && pagination ? (
          <DataPagination
            pagination={pagination}
            onPageChange={(p) => updateParams({ page: String(p) })}
            onLimitChange={(l) => updateParams({ limit: String(l), page: "1" })}
          />
        ) : null}
      </Card>

      {/* Create / Edit Dialog */}
      <VolunteerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        volunteer={editingVolunteer}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Profile Drawer */}
      <VolunteerProfileDrawer
        volunteer={viewVolunteer}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        volunteerName={resetTarget?.name ?? ""}
        onConfirm={handleResetPassword}
        isSubmitting={resetPasswordMutation.isPending}
      />

      {/* Activate / Deactivate Dialog */}
      <DeactivateDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        volunteerName={statusTarget?.name ?? ""}
        action={statusAction}
        onConfirm={handleToggleStatus}
        isSubmitting={statusMutation.isPending}
      />
    </div>
  );
}
