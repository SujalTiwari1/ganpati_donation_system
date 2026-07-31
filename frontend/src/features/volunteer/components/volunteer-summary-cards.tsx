import { motion } from "framer-motion";
import { CalendarDays, IndianRupee, Receipt, Wallet } from "lucide-react";
import { StatCard } from "@/components/common/stat-card";
import { StatCardSkeleton } from "@/components/common/skeletons";
import { formatCurrency, formatNumber } from "@/utils/format";
import type { VolunteerStatistics } from "@/api/services/users.service";

interface VolunteerSummaryCardsProps {
  statistics: VolunteerStatistics | undefined;
  isLoading: boolean;
}

export function VolunteerSummaryCards({ statistics, isLoading }: VolunteerSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Today's Collection",
      value: formatCurrency(statistics?.totalAmount),
      subtitle: `${formatNumber(statistics?.totalCollections)} receipts total`,
      icon: IndianRupee,
      accent: "saffron" as const,
    },
    {
      title: "This Month Collection",
      value: formatCurrency(statistics?.totalAmount),
      subtitle: "Month-to-date collection",
      icon: CalendarDays,
      accent: "emerald" as const,
    },
    {
      title: "Total Donations Collected",
      value: formatNumber(statistics?.totalCollections),
      subtitle: "Donations recorded by you",
      icon: Receipt,
      accent: "saffron" as const,
    },
    {
      title: "Average Donation Amount",
      value: formatCurrency(statistics?.averageDonation),
      subtitle: `Highest ${formatCurrency(statistics?.highestDonation)}`,
      icon: Wallet,
      accent: "emerald" as const,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <StatCard key={card.title} index={index} {...card} />
      ))}
    </div>
  );
}
