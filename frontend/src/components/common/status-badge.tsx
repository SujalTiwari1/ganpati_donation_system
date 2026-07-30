import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { titleCase } from "@/utils/format";

type Tone = "success" | "warning" | "info" | "danger" | "neutral";

const toneClasses: Record<Tone, string> = {
  success: "bg-success/12 text-success border-success/25",
  warning: "bg-warning/15 text-warning-foreground border-warning/35 dark:text-warning",
  info: "bg-info/12 text-info border-info/25",
  danger: "bg-destructive/12 text-destructive border-destructive/25",
  neutral: "bg-muted text-muted-foreground border-border",
};

const map: Record<string, Tone> = {
  CONFIRMED: "success",
  DELIVERED: "success",
  READ: "success",
  ACTIVE: "success",
  SENT: "info",
  PENDING: "warning",
  QUEUED: "warning",
  CANCELLED: "danger",
  FAILED: "danger",
  SUSPENDED: "danger",
  DELETED: "danger",
  CREATE: "success",
  UPDATE: "info",
  DELETE: "danger",
  RESTORE: "success",
  LOGIN: "info",
  LOGOUT: "neutral",
  STATUS_CHANGE: "warning",
};

export function StatusBadge({
  value,
  tone,
  className,
}: {
  value: string;
  tone?: Tone;
  className?: string;
}) {
  const resolved = tone ?? map[value?.toUpperCase()] ?? "neutral";
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium tracking-wide", toneClasses[resolved], className)}
    >
      {titleCase(value ?? "")}
    </Badge>
  );
}