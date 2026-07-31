import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getVolunteerInitials } from "../utils/volunteer.utils";

export function VolunteerAvatar({
  name,
  className,
  size = "default",
}: {
  name: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}) {
  const sizeClasses = {
    sm: "size-8 text-xs",
    default: "size-10 text-sm",
    lg: "size-16 text-xl",
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarFallback className="bg-primary/12 font-semibold text-primary">
        {getVolunteerInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
