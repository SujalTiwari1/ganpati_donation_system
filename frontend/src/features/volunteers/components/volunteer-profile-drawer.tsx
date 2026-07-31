import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { VolunteerAvatar } from "./volunteer-avatar";
import { VolunteerStatusBadge } from "./volunteer-status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatMobile } from "@/utils/format";
import type { Volunteer } from "../types/volunteer.types";

export function VolunteerProfileDrawer({
  volunteer,
  open,
  onOpenChange,
  isLoading,
}: {
  volunteer: Volunteer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {isLoading || !volunteer ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
            <div className="space-y-3 pt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle className="sr-only">Volunteer Profile</SheetTitle>
              <SheetDescription className="sr-only">
                Detailed information about {volunteer.name}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6 p-6">
              {/* Profile header */}
              <div className="flex flex-col items-center gap-3 text-center">
                <VolunteerAvatar name={volunteer.name} size="lg" />
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    {volunteer.name}
                  </h2>
                  <p className="font-mono text-sm text-muted-foreground">
                    @{volunteer.username}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <VolunteerStatusBadge status={volunteer.status} />
                  {volunteer.mustChangePassword ? (
                    <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">
                      Must change password
                    </Badge>
                  ) : null}
                </div>
              </div>

              {/* Profile info */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Profile Information
                </p>
                <dl className="divide-y divide-border rounded-lg border border-border">
                  <div className="flex items-center justify-between px-4 py-3">
                    <dt className="text-sm text-muted-foreground">Name</dt>
                    <dd className="text-sm font-medium text-foreground">{volunteer.name}</dd>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <dt className="text-sm text-muted-foreground">Username</dt>
                    <dd className="font-mono text-sm text-foreground">{volunteer.username}</dd>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <dt className="text-sm text-muted-foreground">Phone</dt>
                    <dd className="text-sm text-foreground">{formatMobile(volunteer.mobile)}</dd>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <dt className="text-sm text-muted-foreground">Email</dt>
                    <dd className="text-sm text-foreground">{volunteer.email}</dd>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <dt className="text-sm text-muted-foreground">Status</dt>
                    <dd>
                      <VolunteerStatusBadge status={volunteer.status} />
                    </dd>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <dt className="text-sm text-muted-foreground">Created Date</dt>
                    <dd className="text-sm text-foreground">{formatDateTime(volunteer.createdAt)}</dd>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <dt className="text-sm text-muted-foreground">Last Login</dt>
                    <dd className="text-sm text-foreground">
                      {volunteer.lastLoginAt ? formatDateTime(volunteer.lastLoginAt) : "Never"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <dt className="text-sm text-muted-foreground">Password Changed</dt>
                    <dd className="text-sm text-foreground">
                      {volunteer.mustChangePassword ? "No — pending change" : "Yes"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <dt className="text-sm text-muted-foreground">Must Change Password</dt>
                    <dd className="text-sm text-foreground">
                      {volunteer.mustChangePassword ? "Yes" : "No"}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Future placeholders */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Collection Stats
                </p>
                <div className="rounded-lg border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Recent Donations
                </p>
                <div className="rounded-lg border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Recent Activity
                </p>
                <div className="rounded-lg border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
