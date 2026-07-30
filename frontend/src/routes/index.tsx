import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Flower2 } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vargani CMS — Ganpati Collection Management" },
      {
        name: "description",
        content:
          "Record donations, print receipts and track building-wise Ganpati vargani collections in real time.",
      },
      { property: "og:title", content: "Vargani CMS — Ganpati Collection Management" },
      {
        property: "og:description",
        content: "A fast, auditable dashboard for mandal donation collection.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { isAuthenticated, isBooting } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isBooting) return;
    navigate({ to: isAuthenticated ? "/dashboard" : "/login", replace: true });
  }, [isAuthenticated, isBooting, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <span className="grid size-12 animate-pulse place-items-center rounded-xl bg-primary text-primary-foreground">
          <Flower2 className="size-6" />
        </span>
        <h1 className="font-display text-lg font-semibold text-foreground">Vargani CMS</h1>
        <p className="text-sm">Loading your collection dashboard…</p>
      </div>
    </div>
  );
}
