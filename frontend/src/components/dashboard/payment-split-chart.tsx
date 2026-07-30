import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { formatCurrency, titleCase } from "@/utils/format";
import type { PaymentDistributionItem } from "@/types/api";
import { PieChart as PieIcon } from "lucide-react";

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export function PaymentSplitChart({
  data,
  isLoading,
}: {
  data: PaymentDistributionItem[];
  isLoading?: boolean;
}) {
  const chartData = data.map((item) => ({
    name: titleCase(item.mode ?? ""),
    value: Number(item.amount) || 0,
    count: item.count,
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Payment Split</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[260px] w-full rounded-lg" />
        ) : chartData.length === 0 ? (
          <EmptyState icon={PieIcon} title="No payments recorded yet" />
        ) : (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                    fontSize: "0.8rem",
                    color: "var(--color-popover-foreground)",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}