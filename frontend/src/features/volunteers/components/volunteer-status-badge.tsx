import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VolunteerStatus } from "../types/volunteer.types";

export function VolunteerStatusBadge({
  status,
  className,
}: {
  status: VolunteerStatus;
  className?: string;
}) {
  const isActive = status === "ACTIVE";
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full font-medium tracking-wide",
        isActive
          ? "bg-success/12 text-success border-success/25"
          : "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}
