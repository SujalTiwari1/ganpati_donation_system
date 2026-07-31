import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";
import type { VolunteerDonation } from "@/api/services/users.service";

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

interface VolunteerPerformanceChartProps {
  donations: VolunteerDonation[];
  isLoading: boolean;
}

function buildTrendData(donations: VolunteerDonation[]) {
  const last7Days: { date: string; amount: number; label: string }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    last7Days.push({
      date: key,
      amount: 0,
      label: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
    });
  }
  const dayMap = new Map(last7Days.map((d) => [d.date, d]));
  for (const tx of donations) {
    const key = tx.createdAt.slice(0, 10);
    const entry = dayMap.get(key);
    if (entry) entry.amount += tx.amount;
  }
  return last7Days;
}

function buildDistributionData(donations: VolunteerDonation[]) {
  const map = new Map<string, number>();
  for (const tx of donations) {
    const method = tx.paymentMethod || "OTHER";
    map.set(method, (map.get(method) ?? 0) + tx.amount);
  }
  return Array.from(map.entries()).map(([name, value]) => ({
    name: name.charAt(0) + name.slice(1).toLowerCase().replace("_", " "),
    value,
  }));
}

export function VolunteerPerformanceChart({ donations, isLoading }: VolunteerPerformanceChartProps) {
  const trendData = buildTrendData(donations);
  const distributionData = buildDistributionData(donations);
  const totalDistribution = distributionData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Collection Trend</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[250px] w-full animate-pulse rounded-md bg-muted/20" />
            ) : donations.length === 0 ? (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                No collection data available yet.
              </div>
            ) : (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="volunteerTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                      stroke="var(--color-muted-foreground)"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      stroke="var(--color-muted-foreground)"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Collection"]}
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        borderColor: "var(--color-border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "var(--color-card-foreground)",
                      }}
                      itemStyle={{ color: "var(--color-foreground)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#volunteerTrend)"
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Donation Distribution</CardTitle>
            <CardDescription>By payment method</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="mx-auto h-[250px] w-full max-w-[250px] animate-pulse rounded-full bg-muted/20" />
            ) : distributionData.length === 0 ? (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                No distribution data available yet.
              </div>
            ) : (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      animationDuration={1000}
                    >
                      {distributionData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as { name: string; value: number };
                          const pct = totalDistribution > 0 ? ((data.value / totalDistribution) * 100).toFixed(1) : "0";
                          return (
                            <div className="rounded-lg border bg-card p-3 shadow-sm">
                              <p className="mb-1 font-medium text-card-foreground">{data.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Amount: <span className="font-semibold text-foreground">{formatCurrency(data.value)}</span>
                              </p>
                              <p className="mt-1 border-t pt-1 text-sm text-muted-foreground">
                                Share: <span className="font-semibold text-foreground">{pct}%</span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
