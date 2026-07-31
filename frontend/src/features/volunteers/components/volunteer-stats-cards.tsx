import { CircleCheck as CheckCircle2, Clock, UserCheck, UserX, Users } from "lucide-react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/common/stat-card";
import type { VolunteerStats } from "../types/volunteer.types";

export function VolunteerStatsCards({ stats, isLoading }: { stats?: VolunteerStats; isLoading: boolean }) {
  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
          >
            <div className="card-elevated h-[110px] animate-pulse rounded-xl bg-muted/40" />
          </motion.div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Volunteers",
      value: String(stats.total),
      icon: Users,
      accent: "saffron" as const,
    },
    {
      title: "Active Volunteers",
      value: String(stats.active),
      icon: UserCheck,
      accent: "emerald" as const,
    },
    {
      title: "Inactive Volunteers",
      value: String(stats.inactive),
      icon: UserX,
      accent: "neutral" as const,
    },
    {
      title: "Pending Password Change",
      value: String(stats.pendingPasswordChange),
      icon: Clock,
      accent: "saffron" as const,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, i) => (
        <StatCard key={card.title} index={i} {...card} />
      ))}
    </div>
  );
}
