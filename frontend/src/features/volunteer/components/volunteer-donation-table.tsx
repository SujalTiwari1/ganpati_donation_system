import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Plus, Receipt } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { TableSkeleton } from "@/components/common/skeletons";
import { StatusBadge } from "@/components/common/status-badge";
import { formatCurrency, formatDate, titleCase } from "@/utils/format";
import type { VolunteerDonation } from "@/api/services/users.service";

interface VolunteerDonationTableProps {
  donations: VolunteerDonation[];
  isLoading: boolean;
}

export function VolunteerDonationTable({ donations, isLoading }: VolunteerDonationTableProps) {
  return (
    <Card>
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
          <TableSkeleton rows={5} columns={5} />
        ) : donations.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No donations collected yet"
            description="Start collecting your first donation to see it here."
            action={
              <Button asChild size="sm">
                <Link to="/transactions/new">
                  <Plus className="size-4" /> Collect First Donation
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Receipt</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Donor</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground sm:table-cell">Building</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground md:table-cell">Payment</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Amount</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground lg:table-cell">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="border-b transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {item.receiptNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{item.donorName}</td>
                    <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                      {item.buildingName}
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                      {titleCase(item.paymentMethod)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-foreground">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-muted-foreground lg:table-cell">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge value={item.status} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
