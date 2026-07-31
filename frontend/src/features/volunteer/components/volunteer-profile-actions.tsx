import { useNavigate } from "@tanstack/react-router";
import { KeyRound, LogOut, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

interface VolunteerProfileActionsProps {
  onEdit: () => void;
}

export function VolunteerProfileActions({ onEdit }: VolunteerProfileActionsProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button variant="outline" onClick={onEdit} className="active:scale-95">
        <UserCog className="size-4" /> Edit Profile
      </Button>
      <Button
        variant="outline"
        onClick={() => navigate({ to: "/change-password" })}
        className="active:scale-95"
      >
        <KeyRound className="size-4" /> Change Password
      </Button>
      <Button
        variant="destructive"
        onClick={() => void logout()}
        className="active:scale-95"
      >
        <LogOut className="size-4" /> Logout
      </Button>
    </div>
  );
}
