import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  accent?: "saffron" | "emerald" | "neutral";
  index?: number;
}

const accentStyles = {
  saffron: "bg-primary/12 text-primary",
  emerald: "bg-secondary/14 text-secondary",
  neutral: "bg-muted text-muted-foreground",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "neutral",
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: "easeOut" }}
    >
      <Card className="card-elevated h-full rounded-xl hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <span className={cn("rounded-lg p-2", accentStyles[accent])}>
              <Icon className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}