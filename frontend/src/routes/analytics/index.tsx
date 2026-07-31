import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/providers/auth-provider";
import { AnalyticsPage } from "@/features/analytics/pages/analytics-page";

export const Route = createFileRoute("/analytics/")({
  head: () => ({
    meta: [
      { title: "Analytics — Vargani CMS" },
      {
        name: "description",
        content: "Enterprise dashboard for collection trends, performance and statistics.",
      },
      { property: "og:title", content: "Analytics — Vargani CMS" },
    ],
  }),
  component: AnalyticsRoute,
});

function AnalyticsRoute() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) navigate({ to: "/dashboard", replace: true });
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <AppShell>
      <AnalyticsPage />
    </AppShell>
  );
}
