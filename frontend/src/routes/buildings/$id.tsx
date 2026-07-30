import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Building2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBuildings } from "@/hooks/queries/use-buildings";
import { useTransactions } from "@/hooks/queries/use-transactions";
import { formatCurrency, formatDate } from "@/utils/format";
import { titleCase } from "@/utils/format";
import type { Transaction } from "@/types/api";

export const Route = createFileRoute("/buildings/$id")({
  head: () => ({
    meta: [
      { title: "Building detail — Vargani CMS" },
      { name: "description", content: "Building transactions and collection totals." },
    ],
  }),
  component: BuildingDetailPage,
});

function BuildingDetailPage() {
  return (
    <AppShell>
      <BuildingDetailContent />
    </AppShell>
  );
}

function BuildingDetailContent() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();

  const { data: buildingsData, isLoading: buildingLoading } = useBuildings({
    search: id,
    limit: 100,
  });
  const building = buildingsData?.data.find((b) => b.id === id) ?? null;

  const { data: txData, isLoading: txLoading } = useTransactions(
    { limit: 100, sortBy: "createdAt", sortOrder: "desc" },
  );

  const allTx = txData?.data ?? [];
  const buildingTx = allTx.filter((t: Transaction) => t.building.id === id);
  const totalCollected = buildingTx.reduce(
    (sum: number, t: Transaction) => sum + Number(t.amount),
    0,
  );
  const confirmedCount = buildingTx.filter(
    (t: Transaction) => t.status === "CONFIRMED",
  ).length;

  if (buildingLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!building) {
    return (
      <Card>
        <ErrorState
          title="Building not found"
          message="This building may have been removed."
          onRetry={() => navigate({ to: "/buildings" })}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={building.name}
        description={building.area || "No area specified"}
        actions={
          <Button asChild variant="ghost" size="sm" className="active:scale-95">
            <Link to="/buildings">
              <ArrowLeft className="size-4" /> Back
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="card-elevated rounded-xl">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Collected</p>
            <p className="mt-2 font-display text-2xl font-semibold text-primary">
              {formatCurrency(totalCollected)}
            </p>
          </CardContent>
        </Card>
        <Card className="card-elevated rounded-xl">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Donations</p>
            <p className="mt-2 font-display text-2xl font-semibold text-foreground">
              {confirmedCount}
            </p>
          </CardContent>
        </Card>
        <Card className="card-elevated rounded-xl">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Status</p>
            <div className="mt-2">
              {building.deletedAt ? (
                <StatusBadge value="DELETED" tone="danger" />
              ) : (
                <StatusBadge value="ACTIVE" tone="success" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-elevated rounded-xl">
        <CardHeader>
          <CardTitle className="text-base">Building Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-border">
            <div className="flex justify-between py-3">
              <dt className="text-sm text-muted-foreground">Name</dt>
              <dd className="text-sm font-medium text-foreground">{building.name}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-sm text-muted-foreground">Normalized</dt>
              <dd className="font-mono text-sm text-foreground">{building.normalizedName}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-sm text-muted-foreground">Area</dt>
              <dd className="text-sm text-foreground">{building.area || "—"}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-sm text-muted-foreground">Notes</dt>
              <dd className="text-sm text-foreground">{building.notes || "—"}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-sm text-muted-foreground">Created</dt>
              <dd className="text-sm text-foreground">{formatDate(building.createdAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="card-elevated rounded-xl">
        <CardHeader>
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {txLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : buildingTx.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No transactions for this building"
              description="Donations recorded for this building will appear here."
            />
          ) : (
            <ul className="divide-y divide-border">
              {buildingTx.slice(0, 20).map((tx: Transaction) => (
                <li
                  key={tx.id}
                  className="flex items-center justify-between gap-4 px-6 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {tx.donor.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {tx.receiptNumber} · {tx.roomNumber} · {formatDate(tx.donationDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(tx.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {titleCase(tx.paymentMethod)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
