import { motion } from "framer-motion";
import {
  KeyRound,
  LogIn,
  Receipt,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { timeAgo, titleCase } from "@/utils/format";
import type { AuditLog } from "@/types/api";

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  CREATE: Receipt,
  UPDATE: UserCog,
  LOGIN: LogIn,
  LOGOUT: LogIn,
  STATUS_CHANGE: UserCog,
  PASSWORD_CHANGED: KeyRound,
};

const ACTIVITY_LABELS: Record<string, string> = {
  CREATE: "Donation Created",
  UPDATE: "Profile Updated",
  LOGIN: "Login",
  LOGOUT: "Logout",
  STATUS_CHANGE: "Status Updated",
  PASSWORD_CHANGED: "Password Changed",
};

interface VolunteerActivityTimelineProps {
  activities: AuditLog[];
  isLoading: boolean;
}

export function VolunteerActivityTimeline({ activities, isLoading }: VolunteerActivityTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="size-9 animate-pulse rounded-full bg-muted/20" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-32 animate-pulse rounded bg-muted/20" />
                  <div className="h-2 w-20 animate-pulse rounded bg-muted/20" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No recent activity to show.
          </div>
        ) : (
          <ol className="relative space-y-4">
            {activities.map((activity, index) => {
              const Icon = ACTIVITY_ICONS[activity.action] ?? Receipt;
              const label = ACTIVITY_LABELS[activity.action] ?? titleCase(activity.action);
              return (
                <motion.li
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    {activity.entityLabel && (
                      <p className="truncate text-xs text-muted-foreground">{activity.entityLabel}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{timeAgo(activity.createdAt)}</p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
