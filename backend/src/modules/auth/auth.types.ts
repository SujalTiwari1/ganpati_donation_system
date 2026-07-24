import { User, UserRole } from "@prisma/client";

/**
 * Shape of the JWT payload. Deliberately minimal — only what's needed
 * to identify and authorize the caller. Anything else (name, mobile,
 * etc.) must be fetched fresh from the DB via GET /auth/me so stale
 * tokens can never carry outdated profile data.
 */
export interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}

/** User shape returned to clients — passwordHash is never included. */
export type SafeUser = Omit<User, "passwordHash">;

export interface LoginResult {
  user: SafeUser;
  accessToken: string;
}

// Augment Express's Request so `req.user` is typed everywhere after
// the `authenticate` middleware runs, without needing `as any` casts
// in every controller.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
