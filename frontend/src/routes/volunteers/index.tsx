import { createFileRoute } from "@tanstack/react-router";
import { VolunteersPage } from "@/features/volunteers/pages/volunteers-page";

export const Route = createFileRoute("/volunteers/")({
  head: () => ({
    meta: [
      { title: "Volunteer Management — Vargani CMS" },
      {
        name: "description",
        content: "Manage volunteer accounts, permissions and passwords.",
      },
      { property: "og:title", content: "Volunteer Management — Vargani CMS" },
      { property: "og:description", content: "Admin-only volunteer account management." },
    ],
  }),
  component: VolunteersPage,
});
