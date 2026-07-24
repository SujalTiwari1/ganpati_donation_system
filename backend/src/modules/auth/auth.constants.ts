import { UserRole } from "@prisma/client";

export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  REGISTER_SUCCESS: "User registered successfully",
  PROFILE_FETCHED: "Profile fetched successfully",
  INVALID_CREDENTIALS: "Invalid email or password",
  ACCOUNT_INACTIVE: "Your account has been deactivated. Contact an administrator.",
  EMAIL_EXISTS: "A user with this email already exists",
  MOBILE_EXISTS: "A user with this mobile number already exists",
  UNAUTHENTICATED: "Authentication required",
  TOKEN_INVALID: "Invalid or expired token",
  FORBIDDEN_ROLE: "You do not have permission to perform this action",
} as const;

export const BEARER_PREFIX = "Bearer ";

/**
 * Central role registry. Authorization middleware and services key off
 * this instead of scattering role checks, so adding SUPER_ADMIN,
 * ACCOUNTANT, AUDITOR, etc. later only means adding an enum value in
 * Prisma schema + extending this list — no controller/middleware
 * rewrites required.
 */
export const ALL_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.VOLUNTEER];
