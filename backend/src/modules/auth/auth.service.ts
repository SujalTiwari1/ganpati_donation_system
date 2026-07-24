import { UserStatus } from "@prisma/client";
import { authRepository } from "./auth.repository";
import { auditService } from "../audit/audit.service";
import { LoginInput, RegisterInput } from "./auth.schema";
import { comparePassword, generateAccessToken, hashPassword, toSafeUser } from "./auth.utils";
import { LoginResult, SafeUser } from "./auth.types";
import { UnauthorizedError, ConflictError } from "../../shared/errors";
import { AUTH_MESSAGES } from "./auth.constants";
import { logger } from "../../config/logger";

class AuthService {
  /**
   * Login flow: validate credentials -> ensure account is ACTIVE ->
   * update lastLoginAt -> issue JWT.
   */
  async login(input: LoginInput): Promise<LoginResult> {
    const { email, password } = input;

    const user = await authRepository.findByEmail(email);

    if (!user || user.deletedAt) {
      logger.warn("Failed login attempt: user not found", { email });
      throw new UnauthorizedError(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    if (user.status !== UserStatus.ACTIVE) {
      logger.warn("Failed login attempt: inactive account", { userId: user.id });
      throw new UnauthorizedError(AUTH_MESSAGES.ACCOUNT_INACTIVE);
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      logger.warn("Failed login attempt: incorrect password", { userId: user.id });
      throw new UnauthorizedError(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    const updatedUser = await authRepository.updateLastLogin(user.id);

    const accessToken = generateAccessToken({
      userId: updatedUser.id,
      role: updatedUser.role,
      email: updatedUser.email,
    });

    logger.info("Successful login", { userId: updatedUser.id, role: updatedUser.role });

    return { user: toSafeUser(updatedUser), accessToken };
  }

  /**
   * Register flow: only reachable by an authenticated ADMIN (enforced
   * by route middleware). Ensures email/mobile uniqueness, hashes the
   * password, creates the user, and writes an audit log entry.
   */
  async register(input: RegisterInput, createdById: string): Promise<SafeUser> {
    const { name, email, mobile, password, role } = input;

    const [existingByEmail, existingByMobile] = await Promise.all([
      authRepository.findByEmail(email),
      authRepository.findByMobile(mobile),
    ]);

    if (existingByEmail) {
      throw new ConflictError(AUTH_MESSAGES.EMAIL_EXISTS);
    }

    if (existingByMobile) {
      throw new ConflictError(AUTH_MESSAGES.MOBILE_EXISTS);
    }

    const passwordHash = await hashPassword(password);

    const user = await authRepository.create({
      name,
      email,
      mobile,
      passwordHash,
      role,
    });

    await auditService.record({
      actorId: createdById,
      action: "USER_CREATED",
      targetId: user.id,
      metadata: { role: user.role, email: user.email },
    });

    logger.info("User created", { createdById, newUserId: user.id, role: user.role });

    return toSafeUser(user);
  }

  /**
   * `GET /auth/me` always re-fetches from the database rather than
   * trusting stale JWT claims, so a deactivated/deleted user is
   * rejected immediately even with a still-valid token.
   */
  async getProfile(userId: string): Promise<SafeUser> {
    const user = await authRepository.findById(userId);

    if (!user || user.deletedAt || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError(AUTH_MESSAGES.UNAUTHENTICATED);
    }

    return toSafeUser(user);
  }
}

export const authService = new AuthService();
