import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { IndianRupee, TrendingUp, Users, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { ChartSkeleton } from "@/components/common/skeletons";
import { ErrorState } from "@/components/common/error-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboard } from "@/hooks/queries/use-dashboard";
import { useTransactions } from "@/hooks/queries/use-transactions";
import { useAuth } from "@/providers/auth-provider";
import { formatCurrency, titleCase } from "@/utils/format";
import type { PaymentDistributionItem } from "@/types/api";

export const Route = createFileRoute("/analytics/")({
  head: () => ({
    meta: [
      { title: "Analytics — Vargani CMS" },
      {
        name: "description",
        content: "Collection trends, payment splits and leaderboard analytics.",
      },
      { property: "og:title", content: "Analytics — Vargani CMS" },
    ],
  }),
  component: AnalyticsPage,
});

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function AnalyticsPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) navigate({ to: "/dashboard", replace: true });
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <AppShell>
      <AnalyticsContent />
    </AppShell>
  );
}

function AnalyticsContent() {
  const { data: dashboardData, isLoading, isError, error, refetch } = useDashboard();
  const { data: txData } = useTransactions({ limit: 200, sortBy: "createdAt", sortOrder: "desc" });

  const summary = dashboardData?.summary;
  const distribution = dashboardData?.paymentDistribution ?? [];

  // Top buildings from transactions
  const topBuildings = (() => {
    const txs = txData?.data ?? [];
    const map = new Map<string, { name: string; total: number }>();
    for (const tx of txs) {
      const existing = map.get(tx.building.id);
      if (existing) existing.total += Number(tx.amount);
      else map.set(tx.building.id, { name: tx.building.name, total: Number(tx.amount) });
    }
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  })();

  // Top donors
  const topDonors = (() => {
    const txs = txData?.data ?? [];
    const map = new Map<string, { name: string; total: number; count: number }>();
    for (const tx of txs) {
      const existing = map.get(tx.donor.mobile);
      if (existing) {
        existing.total += Number(tx.amount);
        existing.count += 1;
      } else {
        map.set(tx.donor.mobile, {
          name: tx.donor.name,
          total: Number(tx.amount),
          count: 1,
        });
      }
    }
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  })();

  // Collection over time (last 30 days from transactions)
  const collectionOverTime = (() => {
    const txs = txData?.data ?? [];
    const map = new Map<string, number>();
    for (const tx of txs) {
      const date = new Date(tx.donationDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
      map.set(date, (map.get(date) ?? 0) + Number(tx.amount));
    }
    return Array.from(map.entries())
      .map(([date, amount]) => ({ date, amount }))
      .slice(0, 30)
      .reverse();
  })();

  const pieData = distribution.map((item: PaymentDistributionItem) => ({
    name: titleCase(item.mode ?? ""),
    value: Number(item.amount) || 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Collection trends, payment splits and leaderboards."
        actions={
          <Select defaultValue="2026">
            <SelectTrigger className="h-9 w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }).map((_, i) => {
                const y = new Date().getFullYear() - i;
                return (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
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
              ? Array.from({ length: 4 }).map((_, i) => (
                  <ChartSkeleton key={i} height={100} />
                ))
              : [
                  {
                    title: "Year Collection",
                    value: formatCurrency(summary?.yearCollection),
                    icon: IndianRupee,
                    accent: "saffron" as const,
                  },
                  {
                    title: "Average Donation",
                    value: formatCurrency(summary?.averageDonation),
                    icon: Wallet,
                    accent: "emerald" as const,
                  },
                  {
                    title: "Total Transactions",
                    value: String(summary?.totalTransactions ?? 0),
                    icon: TrendingUp,
                    accent: "saffron" as const,
                  },
                  {
                    title: "Highest Donation",
                    value: formatCurrency(summary?.highestDonation),
                    icon: Users,
                    accent: "emerald" as const,
                  },
                ].map((card, i) => (
                  <StatCard key={card.title} index={i} {...card} />
                ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="card-elevated rounded-xl">
              <CardHeader>
                <CardTitle className="text-base">Collection Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <ChartSkeleton height={260} />
                ) : (
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={collectionOverTime}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                        <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            background: "var(--color-popover)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "0.5rem",
                            fontSize: "0.8rem",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="var(--color-primary)"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="card-elevated rounded-xl">
              <CardHeader>
                <CardTitle className="text-base">Payment Method Split</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <ChartSkeleton height={260} />
                ) : pieData.length === 0 ? (
                  <p className="py-20 text-center text-sm text-muted-foreground">
                    No payment data yet.
                  </p>
                ) : (
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          outerRadius={95}
                          paddingAngle={3}
                          stroke="none"
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            background: "var(--color-popover)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "0.5rem",
                            fontSize: "0.8rem",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="card-elevated rounded-xl">
              <CardHeader>
                <CardTitle className="text-base">Top Buildings</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <ChartSkeleton height={260} />
                ) : topBuildings.length === 0 ? (
                  <p className="py-20 text-center text-sm text-muted-foreground">
                    No building data yet.
                  </p>
                ) : (
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topBuildings} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 11 }}
                          stroke="var(--color-muted-foreground)"
                          width={100}
                        />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            background: "var(--color-popover)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "0.5rem",
                            fontSize: "0.8rem",
                          }}
                        />
                        <Bar dataKey="total" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="card-elevated rounded-xl">
              <CardHeader>
                <CardTitle className="text-base">Top Donors</CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {isLoading ? (
                  <ChartSkeleton height={260} />
                ) : topDonors.length === 0 ? (
                  <p className="py-20 text-center text-sm text-muted-foreground">
                    No donor data yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {topDonors.map((donor, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-4 px-6 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid size-7 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                            {i + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-foreground">{donor.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {donor.count} donation{donor.count > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {formatCurrency(donor.total)}
                        </span>
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
