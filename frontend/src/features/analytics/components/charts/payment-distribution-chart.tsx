import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";
import { PaymentDistributionItem } from "@/types/api";
import { motion } from "framer-motion";

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

interface PaymentDistributionChartProps {
  data: PaymentDistributionItem[];
  isLoading?: boolean;
}

export function PaymentDistributionChart({ data, isLoading }: PaymentDistributionChartProps) {
  // Use amount for pie size
  const pieData = data.map(item => ({
    name: item.mode,
    value: Number(item.amount),
    count: item.count,
  }));

  const total = pieData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
      <Card className="h-full shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Payment Distribution</CardTitle>
          <CardDescription>Collection split by payment method</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[250px] w-full animate-pulse bg-muted/20 rounded-full mx-auto max-w-[250px]" />
          ) : data.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
              No payment data available.
            </div>
          ) : (
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1000}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const percentage = ((data.value / total) * 100).toFixed(1);
                        return (
                          <div className="rounded-lg border bg-card p-3 shadow-sm">
                            <p className="font-medium text-card-foreground mb-1">{data.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Amount: <span className="font-semibold text-foreground">{formatCurrency(data.value)}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Donations: <span className="font-semibold text-foreground">{data.count}</span>
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 border-t pt-1">
                              Share: <span className="font-semibold text-foreground">{percentage}%</span>
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
  );
}
