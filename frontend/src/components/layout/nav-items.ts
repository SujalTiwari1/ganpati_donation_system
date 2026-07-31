import { Building2, ClipboardList, LayoutDashboard, ChartPie as PieChart, Receipt, Settings, User, Users, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Donations", to: "/transactions", icon: Receipt },
  { label: "Buildings", to: "/buildings", icon: Building2 },
  { label: "Donors", to: "/donors", icon: Users, adminOnly: true },
  { label: "Volunteers", to: "/volunteers", icon: UsersRound, adminOnly: true },
  { label: "Analytics", to: "/analytics", icon: PieChart, adminOnly: true },
  { label: "Audit Logs", to: "/audit-logs", icon: ClipboardList, adminOnly: true },
  { label: "Settings", to: "/settings", icon: Settings, adminOnly: true },
  { label: "Profile", to: "/profile", icon: User },
];
