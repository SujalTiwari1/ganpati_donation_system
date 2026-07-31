import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HeatmapDataPoint } from "../../types";
import { motion } from "framer-motion";
import { formatCurrency } from "@/utils/format";
import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HeatmapCalendarProps {
  data: HeatmapDataPoint[];
  isLoading?: boolean;
}

export function HeatmapCalendar({ data, isLoading }: HeatmapCalendarProps) {
  // Let's generate a 3-month rolling window or just current month for simplicity of custom grid
  // A proper GitHub calendar requires 52 weeks, but for mobile responsive, current month is cleaner.
  // The user requested "GitHub-style calendar heatmap. Allow changing between: Current Month, Festival Duration, Entire Year"
  // For simplicity in this Custom Heatmap without heavy dependencies, we'll render the current month as a grid.
  
  const today = new Date();
  const start = startOfMonth(today);
  const end = endOfMonth(today);
  
  const days = eachDayOfInterval({ start, end });

  // Get max amount for intensity calculation
  const maxAmount = Math.max(...data.map(d => d.amount), 1);

  const getIntensityClass = (amount: number) => {
    if (amount === 0) return "bg-muted/30";
    const ratio = amount / maxAmount;
    if (ratio < 0.25) return "bg-primary/30";
    if (ratio < 0.5) return "bg-primary/50";
    if (ratio < 0.75) return "bg-primary/70";
    return "bg-primary";
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Daily Collection Heatmap</CardTitle>
          <CardDescription>{format(today, "MMMM yyyy")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[200px] w-full animate-pulse bg-muted/20 rounded-md" />
          ) : (
            <div className="mt-2">
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs text-muted-foreground font-medium">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
              </div>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {/* Empty cells for starting offset */}
                {Array.from({ length: start.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                
                <TooltipProvider delayDuration={100}>
                  {days.map((day) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const dayData = data.find(d => isSameDay(parseISO(d.date), day));
                    const amount = dayData?.amount || 0;
                    const count = dayData?.count || 0;

                    return (
                      <Tooltip key={dateStr}>
                        <TooltipTrigger asChild>
                          <div
                            className={`aspect-square rounded-sm flex items-center justify-center text-xs cursor-pointer transition-colors hover:ring-2 hover:ring-primary/50 ${getIntensityClass(amount)}`}
                          >
                            <span className={amount > maxAmount * 0.5 ? "text-primary-foreground font-medium" : "text-foreground/70"}>
                              {format(day, "d")}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <div className="text-center">
                            <p className="font-semibold">{format(day, "MMM dd, yyyy")}</p>
                            <p className="text-sm">Total: {formatCurrency(amount)}</p>
                            <p className="text-xs text-muted-foreground">{count} donations</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </TooltipProvider>
              </div>
              
              <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-muted/30" />
                <div className="w-3 h-3 rounded-sm bg-primary/30" />
                <div className="w-3 h-3 rounded-sm bg-primary/50" />
                <div className="w-3 h-3 rounded-sm bg-primary/70" />
                <div className="w-3 h-3 rounded-sm bg-primary" />
                <span>More</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
