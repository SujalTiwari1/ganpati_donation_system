import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Eye, KeyRound, Pencil, Power, PowerOff } from "lucide-react";
import type { Volunteer } from "../types/volunteer.types";

export function VolunteerActionsMenu({
  volunteer,
  onView,
  onEdit,
  onResetPassword,
  onToggleStatus,
}: {
  volunteer: Volunteer;
  onView: () => void;
  onEdit: () => void;
  onResetPassword: () => void;
  onToggleStatus: () => void;
}) {
  const isActive = volunteer.status === "ACTIVE";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" aria-label="Volunteer actions">
          <svg className="size-4" viewBox="0 0 12 3" fill="currentColor">
            <circle cx="1.5" cy="1.5" r="1.5" />
            <circle cx="6" cy="1.5" r="1.5" />
            <circle cx="10.5" cy="1.5" r="1.5" />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onView}>
          <Eye className="size-4" /> View
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil className="size-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onResetPassword}>
          <KeyRound className="size-4" /> Reset Password
        </DropdownMenuItem>
        {isActive ? (
          <DropdownMenuItem onSelect={onToggleStatus} className="text-warning">
            <PowerOff className="size-4" /> Deactivate
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={onToggleStatus} className="text-success">
            <Power className="size-4" /> Activate
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
