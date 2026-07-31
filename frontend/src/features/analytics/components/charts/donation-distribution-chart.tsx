import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";
import { DonationDistributionDataPoint } from "../../types";
import { motion } from "framer-motion";

interface DonationDistributionChartProps {
  data: DonationDistributionDataPoint[];
  isLoading?: boolean;
}

export function DonationDistributionChart({ data, isLoading }: DonationDistributionChartProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
      <Card className="h-full shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Donation Distribution</CardTitle>
          <CardDescription>Number of donations by amount range</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[250px] w-full animate-pulse bg-muted/20 rounded-md" />
          ) : data.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
              No donation data available.
            </div>
          ) : (
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis
                    dataKey="range"
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
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--color-muted)" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as DonationDistributionDataPoint;
                        return (
                          <div className="rounded-lg border bg-card p-3 shadow-sm">
                            <p className="font-medium text-card-foreground mb-1">{data.range}</p>
                            <p className="text-sm text-muted-foreground">
                              Donations: <span className="font-semibold text-foreground">{data.count}</span>
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 border-t pt-1">
                              Total: <span className="font-semibold text-foreground">{formatCurrency(data.total)}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--color-primary)"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
