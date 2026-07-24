import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { UnauthorizedError, ForbiddenError } from "../../shared/errors";
import { verifyAccessToken } from "./auth.utils";
import { AUTH_MESSAGES, BEARER_PREFIX } from "./auth.constants";
import { logger } from "../../config/logger";

/**
 * Verifies the `Authorization: Bearer <token>` header and attaches
 * the decoded payload to `req.user`. Must run before any
 * `requireRole(...)` middleware or a protected controller.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith(BEARER_PREFIX)) {
    return next(new UnauthorizedError(AUTH_MESSAGES.UNAUTHENTICATED));
  }

  const token = header.slice(BEARER_PREFIX.length).trim();

  if (!token) {
    return next(new UnauthorizedError(AUTH_MESSAGES.UNAUTHENTICATED));
  }

  const payload = verifyAccessToken(token);
  req.user = payload;
  next();
}

/**
 * Role-gate factory. `requireRole(UserRole.ADMIN)` restricts a route
 * to admins; `requireRole(UserRole.ADMIN, UserRole.VOLUNTEER)` allows
 * either. Adding a new role in the future (e.g. SUPER_ADMIN) never
 * requires touching this function — routes just list the roles they
 * accept.
 *
 * Must be used AFTER `authenticate` in the middleware chain.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError(AUTH_MESSAGES.UNAUTHENTICATED));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn("Unauthorized access attempt", {
        userId: req.user.userId,
        role: req.user.role,
        requiredRoles: allowedRoles,
      });
      return next(new ForbiddenError(AUTH_MESSAGES.FORBIDDEN_ROLE));
    }

    next();
  };
}

/** Convenience helper for pulling the current user's id inside a controller/service. */
export function getCurrentUser(req: Request) {
  if (!req.user) {
    throw new UnauthorizedError(AUTH_MESSAGES.UNAUTHENTICATED);
  }
  return req.user;
}
