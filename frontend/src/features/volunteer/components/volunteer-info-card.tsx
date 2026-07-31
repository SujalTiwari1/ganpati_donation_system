import { Calendar, KeyRound, Mail, Phone, Shield, User as UserIcon, CircleUser as UserCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import { formatDate, formatDateTime, formatMobile } from "@/utils/format";
import type { User } from "@/types/api";

interface VolunteerInfoCardProps {
  user: User | null;
  passwordLastChanged?: string | null;
}

export function VolunteerInfoCard({ user, passwordLastChanged }: VolunteerInfoCardProps) {
  if (!user) return null;

  const rows = [
    { icon: UserIcon, label: "Full Name", value: user.name },
    { icon: UserCircle, label: "Username", value: user.username ? `@${user.username}` : "—" },
    { icon: Mail, label: "Email", value: user.email || "—" },
    { icon: Phone, label: "Phone", value: formatMobile(user.mobile) },
    { icon: Shield, label: "Role", value: <StatusBadge value={user.role} tone="info" /> },
    { icon: Shield, label: "Status", value: <StatusBadge value={user.status} /> },
    { icon: Calendar, label: "Member Since", value: formatDate(user.createdAt) },
    {
      icon: KeyRound,
      label: "Password Last Changed",
      value: passwordLastChanged ? formatDateTime(passwordLastChanged) : "—",
    },
    {
      icon: Calendar,
      label: "Last Login",
      value: user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "—",
    },
  ];

  return (
    <Card className="card-elevated rounded-xl">
      <CardHeader>
        <CardTitle className="text-base">Personal Information</CardTitle>
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
