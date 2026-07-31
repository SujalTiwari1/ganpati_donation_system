import { motion } from "framer-motion";
import { Calendar, KeyRound, LogIn } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { formatDate, formatDateTime, initialsOf } from "@/utils/format";
import type { User } from "@/types/api";

interface VolunteerProfileHeaderProps {
  user: User | null;
  onEdit: () => void;
  onChangePassword: () => void;
}

export function VolunteerProfileHeader({ user, onEdit, onChangePassword }: VolunteerProfileHeaderProps) {
  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card className="card-elevated rounded-xl">
        <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-start sm:text-left">
          <Avatar className="size-20 shrink-0">
            <AvatarFallback className="bg-primary/12 text-xl font-semibold text-primary">
              {initialsOf(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">{user.name}</h2>
              {user.username && (
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <StatusBadge value={user.role} tone="info" />
              <StatusBadge value={user.status} />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground sm:justify-start">
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" /> Joined {formatDate(user.createdAt)}
              </span>
              {user.lastLoginAt && (
                <span className="flex items-center gap-1">
                  <LogIn className="size-3.5" /> Last login {formatDateTime(user.lastLoginAt)}
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit Profile
            </Button>
            <Button variant="outline" size="sm" onClick={onChangePassword}>
              <KeyRound className="size-4" /> Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
