import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VolunteerAvatar } from "./volunteer-avatar";
import { VolunteerStatusBadge } from "./volunteer-status-badge";
import { VolunteerActionsMenu } from "./volunteer-actions-menu";
import { formatDateTime, formatMobile } from "@/utils/format";
import type { Volunteer } from "../types/volunteer.types";

export function VolunteerTable({
  volunteers,
  onView,
  onEdit,
  onResetPassword,
  onToggleStatus,
}: {
  volunteers: Volunteer[];
  onView: (volunteer: Volunteer) => void;
  onEdit: (volunteer: Volunteer) => void;
  onResetPassword: (volunteer: Volunteer) => void;
  onToggleStatus: (volunteer: Volunteer) => void;
}) {
  return (
    <>
      {/* Desktop / Tablet table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Volunteer</th>
              <th className="px-4 py-3 font-medium">Username</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Must Change</th>
              <th className="px-4 py-3 font-medium">Last Login</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {volunteers.map((volunteer, index) => (
              <motion.tr
                key={volunteer.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.3) }}
                className="cursor-pointer transition-colors hover:bg-muted/40"
                onClick={() => onView(volunteer)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <VolunteerAvatar name={volunteer.name} size="sm" />
                    <span className="font-medium text-foreground">{volunteer.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {volunteer.username}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatMobile(volunteer.mobile)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{volunteer.email}</td>
                <td className="px-4 py-3">
                  <VolunteerStatusBadge status={volunteer.status} />
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={
                      volunteer.mustChangePassword
                        ? "border-warning/30 bg-warning/10 text-warning"
                        : "border-border bg-muted text-muted-foreground"
                    }
                  >
                    {volunteer.mustChangePassword ? "Yes" : "No"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {volunteer.lastLoginAt ? formatDateTime(volunteer.lastLoginAt) : "Never"}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDateTime(volunteer.createdAt)}
                </td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <VolunteerActionsMenu
                    volunteer={volunteer}
                    onView={() => onView(volunteer)}
                    onEdit={() => onEdit(volunteer)}
                    onResetPassword={() => onResetPassword(volunteer)}
                    onToggleStatus={() => onToggleStatus(volunteer)}
                  />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-border md:hidden">
        {volunteers.map((volunteer, index) => (
          <motion.div
            key={volunteer.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.3) }}
            className="cursor-pointer p-4 transition-colors hover:bg-muted/40"
            onClick={() => onView(volunteer)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <VolunteerAvatar name={volunteer.name} />
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{volunteer.name}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    @{volunteer.username}
                  </p>
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <VolunteerActionsMenu
                  volunteer={volunteer}
                  onView={() => onView(volunteer)}
                  onEdit={() => onEdit(volunteer)}
                  onResetPassword={() => onResetPassword(volunteer)}
                  onToggleStatus={() => onToggleStatus(volunteer)}
                />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <VolunteerStatusBadge status={volunteer.status} />
              {volunteer.mustChangePassword ? (
                <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">
                  Must change password
                </Badge>
              ) : null}
              <span>{formatMobile(volunteer.mobile)}</span>
              <span className="text-muted-foreground/60">·</span>
              <span>{volunteer.lastLoginAt ? formatDateTime(volunteer.lastLoginAt) : "Never logged in"}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}
