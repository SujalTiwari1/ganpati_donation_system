import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/utils/format";

const DAILY_TARGET = 50000;

interface VolunteerTodayProgressProps {
  collectedToday: number;
  isLoading: boolean;
}

export function VolunteerTodayProgress({ collectedToday, isLoading }: VolunteerTodayProgressProps) {
  const progressPct = Math.min(Math.round((collectedToday / DAILY_TARGET) * 100), 100);
  const progressColor =
    progressPct >= 75 ? "text-emerald-600" : progressPct >= 50 ? "text-primary" : "text-amber-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1, ease: "easeOut" }}
    >
      <Card className="card-elevated rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="size-4 text-primary" />
            Today's Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="h-2.5 w-full animate-pulse rounded-full bg-muted/20" />
          ) : (
            <>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Today's Target</p>
                  <p className="font-display text-xl font-semibold text-foreground">
                    {formatCurrency(DAILY_TARGET)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Collected</p>
                  <p className="font-display text-xl font-semibold text-primary">
                    {formatCurrency(collectedToday)}
                  </p>
                </div>
              </div>
              <Progress value={progressPct} className="h-2.5" />
              <p className={`text-center text-sm font-medium ${progressColor}`}>
                {progressPct}% of today's target
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
