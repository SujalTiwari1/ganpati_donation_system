import type { Volunteer } from "../types/volunteer.types";

export function getVolunteerInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
}

export function isVolunteerActive(volunteer: Pick<Volunteer, "status">): boolean {
  return volunteer.status === "ACTIVE";
}

export function getVolunteerStatusLabel(status: string): string {
  return status === "ACTIVE" ? "Active" : "Inactive";
}
