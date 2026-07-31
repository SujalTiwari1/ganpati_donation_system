import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Building2,
  ClipboardList,
  IndianRupee,
  Plus,
  Receipt,
  Target,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { StatCardSkeleton, TableSkeleton } from "@/components/common/skeletons";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDashboard } from "@/hooks/queries/use-dashboard";
import { useTransactions } from "@/hooks/queries/use-transactions";
import { useAuth } from "@/providers/auth-provider";
import { formatCurrency, formatNumber, timeAgo, titleCase } from "@/utils/format";

const DAILY_TARGET = 50000;

export function VolunteerDashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useDashboard();
  const { data: txData } = useTransactions({ limit: 50, sortBy: "createdAt", sortOrder: "desc" });

  const summary = data?.summary;
  const recentTransactions = txData?.data ?? [];

  const todayCollection = summary?.todayCollection ?? 0;
  const progressPct = Math.min(Math.round((todayCollection / DAILY_TARGET) * 100), 100);

  const quickActions = [
    { label: "Collect Donation", to: "/transactions/new", icon: Plus },
    { label: "View Buildings", to: "/buildings", icon: Building2 },
    { label: "My Donations", to: "/transactions", icon: ClipboardList },
    { label: "Profile", to: "/profile", icon: User },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Namaskar, ${user?.name?.split(" ")[0] ?? "Volunteer"} 🙏`}
        description="Here's your collection summary for today."
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
          {/* Stat cards */}
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
                    title: "Total Collections",
                    value: formatCurrency(summary?.yearCollection),
                    subtitle: `${formatNumber(summary?.totalTransactions)} total receipts`,
                    icon: TrendingUp,
                    accent: "emerald" as const,
                  },
                  {
                    title: "Total Donations Collected",
                    value: formatNumber(summary?.totalTransactions),
                    subtitle: "Donations recorded",
                    icon: Receipt,
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
            {/* Recent Donations */}
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
                ) : recentTransactions.length === 0 ? (
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
                    {recentTransactions.slice(0, 6).map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-4 px-6 py-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {item.donor.name}
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
                            {titleCase(item.paymentMethod ?? "")}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Collection Progress + Quick Actions */}
            <div className="space-y-4 lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.1, ease: "easeOut" }}
              >
                <Card className="card-elevated h-full rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Target className="size-4 text-primary" />
                      Collection Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Today's Target</p>
                        <p className="font-display text-xl font-semibold text-foreground">
                          {formatCurrency(DAILY_TARGET)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Collected</p>
                        <p className="font-display text-xl font-semibold text-primary">
                          {formatCurrency(todayCollection)}
                        </p>
                      </div>
                    </div>
                    <Progress value={progressPct} className="h-2.5" />
                    <p className="text-center text-sm font-medium text-muted-foreground">
                      {progressPct}% of today's target
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <Card className="card-elevated rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, i) => (
                    <motion.div
                      key={action.to}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: 0.15 + i * 0.05 }}
                    >
                      <Button
                        asChild
                        variant="outline"
                        className="h-auto flex-col gap-2 py-4 active:scale-95"
                      >
                        <Link to={action.to}>
                          <action.icon className="size-5 text-primary" />
                          <span className="text-xs font-medium">{action.label}</span>
                        </Link>
                      </Button>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
