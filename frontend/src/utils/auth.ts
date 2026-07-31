import type { UserRole } from "@/types/api";

/**
 * Returns the appropriate dashboard route for a given user role.
 * Centralizing this ensures no hardcoded redirects throughout the app.
 */
export function getDashboardRoute(role?: UserRole): string {
  // In this app, both ADMIN and VOLUNTEER roles share the same /dashboard
  // route but see different components based on their role inside that route.
  if (role === "ADMIN") {
    return "/dashboard";
  }
  
  if (role === "VOLUNTEER") {
    return "/dashboard";
  }
  
  return "/dashboard";
}
