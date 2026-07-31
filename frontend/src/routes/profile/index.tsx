import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Mail, Phone, Shield, User as UserIcon } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";
import { useTransactions } from "@/hooks/queries/use-transactions";
import { formatCurrency, formatDate, formatMobile, initialsOf } from "@/utils/format";
import { VolunteerProfile } from "@/features/volunteer/pages/volunteer-profile";

export const Route = createFileRoute("/profile/")({
  head: () => ({
    meta: [
      { title: "Profile — Vargani CMS" },
      { name: "description", content: "Your account details and contribution stats." },
      { property: "og:title", content: "Profile — Vargani CMS" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { isAdmin } = useAuth();
  return (
    <AppShell>
      {isAdmin ? <AdminProfileContent /> : <VolunteerProfile />}
    </AppShell>
  );
}

function AdminProfileContent() {
  const { user } = useAuth();
  const { data: txData } = useTransactions({ limit: 100, sortBy: "createdAt", sortOrder: "desc" });

  if (!user) return null;

  const allTx = txData?.data ?? [];
  const totalCollected = allTx.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const confirmedCount = allTx.filter((t) => t.status === "CONFIRMED").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your account and contribution summary." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="card-elevated rounded-xl">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <Avatar className="size-20">
              <AvatarFallback className="bg-primary/12 text-xl font-semibold text-primary">
                {initialsOf(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">
                {user.name}
              </h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <StatusBadge value={user.role} tone="info" />
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card className="card-elevated rounded-xl">
            <CardHeader>
              <CardTitle className="text-base">Account Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-border">
                <div className="flex items-center justify-between py-3">
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserIcon className="size-4" /> Name
                  </dt>
                  <dd className="text-sm font-medium text-foreground">{user.name}</dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="size-4" /> Email
                  </dt>
                  <dd className="text-sm font-medium text-foreground">{user.email}</dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="size-4" /> Mobile
                  </dt>
                  <dd className="text-sm font-medium text-foreground">
                    {formatMobile(user.mobile)}
                  </dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="size-4" /> Role
                  </dt>
                  <dd>
                    <StatusBadge value={user.role} tone="info" />
                  </dd>
                </div>
                {user.createdAt ? (
                  <div className="flex items-center justify-between py-3">
                    <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="size-4" /> Joined
                    </dt>
                    <dd className="text-sm font-medium text-foreground">
                      {formatDate(user.createdAt)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="card-elevated rounded-xl">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Donations Recorded</p>
                <p className="mt-2 font-display text-2xl font-semibold text-foreground">
                  {confirmedCount}
                </p>
              </CardContent>
            </Card>
            <Card className="card-elevated rounded-xl">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="mt-2 font-display text-2xl font-semibold text-primary">
                  {formatCurrency(totalCollected)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
