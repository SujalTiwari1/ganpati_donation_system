import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, Flower2 } from "lucide-react";
import { motion } from "framer-motion";
import { NAV_ITEMS } from "./nav-items";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

export function AppSidebar({
  collapsed,
  onToggle,
  onNavigate,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const { isAdmin } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-card transition-all duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Flower2 className="size-5" />
        </span>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold">Vargani CMS</p>
            <p className="truncate text-[11px] text-muted-foreground">Ganpati Collection Ledger</p>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {items.map((item) => {
          const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
          const link = (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute left-0 h-6 w-1 rounded-r bg-primary"
                />
              ) : null}
              <item.icon className="size-4 shrink-0" />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </Link>
          );

          return collapsed ? (
            <Tooltip key={item.to}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ) : (
            link
          );
        })}
      </nav>

      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn("w-full justify-start text-muted-foreground", collapsed && "justify-center")}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
          {!collapsed ? <span>Collapse</span> : null}
        </Button>
      </div>
    </aside>
  );
}