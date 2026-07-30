import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  PieChart,
  Receipt,
  Settings,
  User,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, adminOnly: true },
  { label: "Transactions", to: "/transactions", icon: Receipt },
  { label: "Buildings", to: "/buildings", icon: Building2 },
  { label: "Donors", to: "/donors", icon: Users },
  { label: "Analytics", to: "/analytics", icon: PieChart, adminOnly: true },
  { label: "Audit Logs", to: "/audit-logs", icon: ClipboardList, adminOnly: true },
  { label: "Profile", to: "/profile", icon: User },
  { label: "Settings", to: "/settings", icon: Settings },
];