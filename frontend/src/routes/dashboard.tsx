import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CalendarDays,
  IndianRupee,
  Plus,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { StatCardSkeleton, TableSkeleton } from "@/components/common/skeletons";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PaymentSplitChart } from "@/components/dashboard/payment-split-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/hooks/queries/use-dashboard";
import { useAuth } from "@/providers/auth-provider";
import { formatCurrency, formatNumber, timeAgo, titleCase } from "@/utils/format";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Vargani CMS" },
      {
        name: "description",
        content: "Live overview of today's Ganpati vargani collection, receipts and payment split.",
      },
      { property: "og:title", content: "Dashboard — Vargani CMS" },
      { property: "og:description", content: "Live collection metrics for your mandal." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useDashboard();
  const summary = data?.summary;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Namaskar, ${user?.name?.split(" ")[0] ?? "Volunteer"} 🙏`}
        description="Here's how the vargani collection is going today."
        actions={
          <Button asChild className="active:scale-95">
            <Link to="/transactions/new">
              <Plus className="size-4" /> New Donation
            </Link>
          </Button>
        }
      />

      {isError ? (
        <Card>
          <ErrorState message={(error as Error)?.message} onRetry={() => void refetch()} />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => <StatCardSkeleton key={index} />)
              : [
                  {
                    title: "Today's Collection",
                    value: formatCurrency(summary?.todayCollection),
                    subtitle: `${formatNumber(summary?.transactionsToday)} receipts today`,
                    icon: IndianRupee,
                    accent: "saffron" as const,
                  },
                  {
                    title: "This Month",
                    value: formatCurrency(summary?.monthCollection),
                    subtitle: "Month-to-date collection",
                    icon: CalendarDays,
                    accent: "emerald" as const,
                  },
                  {
                    title: "This Year",
                    value: formatCurrency(summary?.yearCollection),
                    subtitle: `${formatNumber(summary?.totalTransactions)} total receipts`,
                    icon: TrendingUp,
                    accent: "saffron" as const,
                  },
                  {
                    title: "Average Donation",
                    value: formatCurrency(summary?.averageDonation),
                    subtitle: `Highest ${formatCurrency(summary?.highestDonation)}`,
                    icon: Wallet,
                    accent: "emerald" as const,
                  },
                ].map((card, index) => <StatCard key={card.title} index={index} {...card} />)}
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <PaymentSplitChart
                data={data?.paymentDistribution ?? []}
                isLoading={isLoading}
              />
            </div>

            <Card className="lg:col-span-3">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Recent Donations</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/transactions">
                    View all <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {isLoading ? (
                  <TableSkeleton rows={5} columns={4} />
                ) : (data?.recentTransactions.length ?? 0) === 0 ? (
                  <EmptyState
                    icon={Receipt}
                    title="No donations yet"
                    description="Once you record a donation it will appear here instantly."
                    action={
                      <Button asChild size="sm">
                        <Link to="/transactions/new">Record donation</Link>
                      </Button>
                    }
                  />
                ) : (
                  <ul className="divide-y divide-border">
                    {data?.recentTransactions.slice(0, 6).map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-4 px-6 py-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {item.donorName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {item.receiptNumber} · {item.building?.name ?? "—"} ·{" "}
                            {timeAgo(item.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold tabular-nums text-foreground">
                            {formatCurrency(item.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {titleCase(item.paymentMode ?? "")}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}