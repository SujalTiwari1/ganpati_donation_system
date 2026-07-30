import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { AppNavbar } from "./app-navbar";
import { AppSidebar } from "./app-sidebar";
import { CommandPalette } from "./command-palette";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { SIDEBAR_STORAGE_KEY } from "@/constants";
import { useAuth } from "@/providers/auth-provider";

export function AppShell({ children }: { children: ReactNode }) {
  const { isAuthenticated, isBooting } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "collapsed");
  }, []);

  useEffect(() => {
    if (!isBooting && !isAuthenticated) {
      navigate({ to: "/login", replace: true });
    }
  }, [isBooting, isAuthenticated, navigate]);

  const toggleSidebar = () => {
    setCollapsed((previous) => {
      const next = !previous;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "collapsed" : "expanded");
      return next;
    });
  };

  if (isBooting || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-sm space-y-3 px-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="sticky top-0 hidden h-screen lg:block">
        <AppSidebar collapsed={collapsed} onToggle={toggleSidebar} />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <AppSidebar
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppNavbar
          onOpenSearch={() => setSearchOpen(true)}
          onOpenMobileNav={() => setMobileOpen(true)}
        />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}