import { motion } from "framer-motion";
import { Building2, IndianRupee, Receipt, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/utils/format";
import type { VolunteerStatistics } from "@/api/services/users.service";

interface VolunteerStatisticsCardProps {
  statistics: VolunteerStatistics | undefined;
  isLoading: boolean;
}

export function VolunteerStatisticsCard({ statistics, isLoading }: VolunteerStatisticsCardProps) {
  const cards = [
    {
      label: "Total Collections",
      value: formatNumber(statistics?.totalCollections),
      icon: Receipt,
    },
    {
      label: "Total Amount",
      value: formatCurrency(statistics?.totalAmount),
      icon: IndianRupee,
    },
    {
      label: "Highest Donation",
      value: formatCurrency(statistics?.highestDonation),
      icon: TrendingUp,
    },
    {
      label: "Average Donation",
      value: formatCurrency(statistics?.averageDonation),
      icon: TrendingUp,
    },
    {
      label: "Buildings Visited",
      value: formatNumber(statistics?.buildingsVisited),
      icon: Building2,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
        >
          <Card className="card-elevated rounded-xl">
            <CardContent className="p-5">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-20 animate-pulse rounded bg-muted/20" />
                  <div className="h-7 w-24 animate-pulse rounded bg-muted/20" />
                </div>
              ) : (
                <>
                  <div className="mb-2 flex items-center gap-2">
                    <card.icon className="size-4 text-primary" />
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                  </div>
                  <p className="font-display text-xl font-semibold text-foreground">{card.value}</p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
