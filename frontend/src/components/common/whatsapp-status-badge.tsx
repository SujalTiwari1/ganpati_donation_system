import { Check, CheckCheck, Clock, TriangleAlert as AlertTriangle, Loader as Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { titleCase } from "@/utils/format";
import type { WhatsappStatus } from "@/types/api";

const config: Record<WhatsappStatus, { icon: typeof Clock; tone: string; label: string }> = {
  PENDING: { icon: Loader2, tone: "text-warning", label: "Pending" },
  SENT: { icon: Check, tone: "text-info", label: "Sent" },
  DELIVERED: { icon: CheckCheck, tone: "text-success", label: "Delivered" },
  READ: { icon: CheckCheck, tone: "text-info", label: "Read" },
  FAILED: { icon: AlertTriangle, tone: "text-destructive", label: "Failed" },
};

export function WhatsAppStatusBadge({
  status,
  className,
}: {
  status: WhatsappStatus;
  className?: string;
}) {
  const entry = config[status] ?? config.PENDING;
  const Icon = entry.icon;
  const spin = status === "PENDING";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium",
        entry.tone,
        className,
      )}
    >
      <Icon className={cn("size-3.5", spin && "animate-spin")} />
      {entry.label}
    </span>
  );
}

export function whatsappStatusLabel(status: WhatsappStatus): string {
  return config[status]?.label ?? titleCase(status);
}
