import { CircleCheck as CheckCircle2, CircleAlert as AlertCircle, KeyRound, CircleUser as UserCircle, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import type { User } from "@/types/api";

interface VolunteerAccountInfoCardProps {
  user: User | null;
}

export function VolunteerAccountInfoCard({ user }: VolunteerAccountInfoCardProps) {
  if (!user) return null;

  const rows = [
    {
      icon: ShieldCheck,
      label: "Account Status",
      value: <StatusBadge value={user.status} />,
    },
    {
      icon: KeyRound,
      label: "Must Change Password",
      value: user.mustChangePassword ? (
        <span className="flex items-center gap-1 text-sm font-medium text-amber-600">
          <AlertCircle className="size-4" /> Yes
        </span>
      ) : (
        <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
          <CheckCircle2 className="size-4" /> No
        </span>
      ),
    },
    {
      icon: UserCircle,
      label: "Username",
      value: user.username ? `@${user.username}` : "—",
    },
    {
      icon: ShieldCheck,
      label: "Authentication Methods",
      value: "Email & Password",
    },
  ];

  return (
    <Card className="card-elevated rounded-xl">
      <CardHeader>
        <CardTitle className="text-base">Account Information</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="divide-y divide-border">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-3">
              <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                <row.icon className="size-4" /> {row.label}
              </dt>
              <dd className="text-sm font-medium text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
