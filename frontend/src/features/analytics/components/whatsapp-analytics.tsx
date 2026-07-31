import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WhatsAppAnalyticsData } from "../types";
import { Transaction } from "@/types/api";
import { motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, MessageSquareWarning } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface WhatsAppAnalyticsProps {
  data: WhatsAppAnalyticsData;
  transactions: Transaction[]; // Raw transactions to filter failed ones
  isLoading?: boolean;
}

const COLORS = {
  DELIVERED: "var(--color-primary)",
  SENT: "color-mix(in srgb, var(--color-primary) 60%, transparent)",
  PENDING: "color-mix(in srgb, var(--color-muted-foreground) 40%, transparent)",
  FAILED: "var(--color-destructive)",
};

export function WhatsAppAnalytics({ data, transactions, isLoading }: WhatsAppAnalyticsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const pieData = [
    { name: "Delivered & Read", value: data.delivered + data.read, color: COLORS.DELIVERED },
    { name: "Sent", value: data.sent, color: COLORS.SENT },
    { name: "Pending", value: data.pending, color: COLORS.PENDING },
    { name: "Failed", value: data.failed, color: COLORS.FAILED },
  ].filter(d => d.value > 0);

  const failedTransactions = transactions.filter(tx => tx.whatsappStatus === "FAILED");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
      <Card className="h-full shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">WhatsApp Analytics</CardTitle>
          <CardDescription>Receipt delivery performance</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-[120px] w-full animate-pulse bg-muted/20 rounded-md" />
              <div className="h-4 w-full animate-pulse bg-muted/20 rounded-md" />
              <div className="h-4 w-full animate-pulse bg-muted/20 rounded-md" />
            </div>
          ) : data.total === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              No WhatsApp data available.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
                <div className="h-[140px] w-[140px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex-1 w-full space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Delivery Rate</span>
                      <span className="font-medium">{data.deliveryRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={data.deliveryRate} className="h-2 bg-primary/20" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Read Rate</span>
                      <span className="font-medium">{data.readRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={data.readRate} className="h-2 bg-primary/40" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground text-destructive">Failure Rate</span>
                      <span className="font-medium text-destructive">{data.failureRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={data.failureRate} className="h-2 [&>div]:bg-destructive bg-destructive/20" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold">{data.total}</p>
                  <p className="text-xs text-muted-foreground">Total Messages</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-destructive">{data.failed}</p>
                  <p className="text-xs text-muted-foreground">Failed Messages</p>
                </div>
              </div>

              {failedTransactions.length > 0 && (
                <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4 border rounded-md">
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-3 text-sm font-medium hover:bg-muted/50 transition-colors">
                    <div className="flex items-center text-destructive">
                      <MessageSquareWarning className="h-4 w-4 mr-2" />
                      View Failure Logs ({failedTransactions.length})
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-0 border-t">
                      <Table>
                        <TableHeader className="bg-muted/30">
                          <TableRow>
                            <TableHead className="text-xs">Receipt</TableHead>
                            <TableHead className="text-xs">Recipient</TableHead>
                            <TableHead className="text-xs">Reason</TableHead>
                            <TableHead className="text-xs">Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {failedTransactions.map(tx => (
                            <TableRow key={tx.id}>
                              <TableCell className="text-xs font-medium">{tx.receiptNumber}</TableCell>
                              <TableCell className="text-xs">{tx.donor.mobile}</TableCell>
                              <TableCell className="text-xs">
                                <Badge variant="destructive" className="font-normal text-[10px] leading-tight px-1.5 py-0">
                                  {/* Just use a generic message if reason is long, or slice it */}
                                  {tx.whatsappStatus === "FAILED" ? "Delivery Failed" : tx.whatsappStatus}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {format(new Date(tx.createdAt), "MMM d")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
