import { useAuth } from "@/providers/auth-provider";
import type { User, UserRole } from "@/types/api";

export function canManageVolunteers(user: User | null | undefined): boolean {
  return user?.role === "ADMIN";
}

export function canManageBuildings(user: User | null | undefined): boolean {
  return user?.role === "ADMIN";
}

export function canEditBuildings(user: User | null | undefined): boolean {
  return user?.role === "ADMIN";
}

export function canDeleteBuildings(user: User | null | undefined): boolean {
  return user?.role === "ADMIN";
}

export function canViewAnalytics(user: User | null | undefined): boolean {
  return user?.role === "ADMIN";
}

export function canCollectDonations(user: User | null | undefined): boolean {
  return user?.role === "ADMIN" || user?.role === "VOLUNTEER";
}

export function canViewSettings(user: User | null | undefined): boolean {
  return user?.role === "ADMIN";
}

export function isRole(user: User | null | undefined, ...roles: UserRole[]): boolean {
  return roles.includes(user?.role as UserRole);
}

export function usePermissions() {
  const { user } = useAuth();
  return {
    canManageVolunteers: canManageVolunteers(user),
    canManageBuildings: canManageBuildings(user),
    canEditBuildings: canEditBuildings(user),
    canDeleteBuildings: canDeleteBuildings(user),
    canViewAnalytics: canViewAnalytics(user),
    canCollectDonations: canCollectDonations(user),
    canViewSettings: canViewSettings(user),
    isAdmin: user?.role === "ADMIN",
    isVolunteer: user?.role === "VOLUNTEER",
  };
}
