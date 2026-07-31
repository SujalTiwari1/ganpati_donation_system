import { UserStatus, AuditAction, AuditEntity } from "@prisma/client";
import { authRepository } from "./auth.repository";
import { auditService } from "../audit/audit.service";
import type { LoginInput, RegisterInput, ChangePasswordInput } from "./auth.schema";
import { comparePassword, generateAccessToken, hashPassword, toSafeUser } from "./auth.utils";
import type { LoginResult, SafeUser } from "./auth.types";
import { UnauthorizedError, ConflictError } from "../../shared/errors";
import { AUTH_MESSAGES } from "./auth.constants";
import { logger } from "../../config/logger";
import { prisma } from "../../database";

class AuthService {
  /**
   * Login flow: validate credentials -> ensure account is ACTIVE ->
   * update lastLoginAt -> issue JWT.
   */
  async login(input: LoginInput, ipAddress?: string, userAgent?: string): Promise<LoginResult> {
    const { identifier, password } = input;

    const user = await authRepository.findByIdentifier(identifier);

    if (!user || user.deletedAt) {
      logger.warn("Failed login attempt: user not found", { identifier });
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

    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await authRepository.updateLastLogin(user.id, tx);

      await auditService.record(
        {
          userId: updated.id,
          entity: AuditEntity.AUTH,
          action: AuditAction.LOGIN,
          entityLabel: updated.email ?? updated.username ?? updated.mobile ?? undefined,
          newValue: { lastLoginAt: updated.lastLoginAt },
          ipAddress,
          userAgent,
        },
        tx
      );

      return updated;
    });

    const accessToken = generateAccessToken({
      userId: updatedUser.id,
      role: updatedUser.role,
      email: updatedUser.email ?? updatedUser.username ?? updatedUser.mobile ?? "",
    });

    logger.info("Successful login", { userId: updatedUser.id, role: updatedUser.role });

    return { user: toSafeUser(updatedUser), accessToken };
  }

  /**
   * Register flow: only reachable by an authenticated ADMIN (enforced
   * by route middleware). Ensures email/mobile uniqueness, hashes the
   * password, creates the user, and writes an audit log entry.
   */
  async register(
    input: RegisterInput,
    createdById: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<SafeUser> {
    const { name, email, mobile, password, role, username } = input;

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

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await authRepository.create(
        {
          name,
          username,
          email,
          mobile,
          passwordHash,
          role,
        },
        tx
      );

      await auditService.record(
        {
          userId: createdById,
          entity: AuditEntity.USER,
          action: AuditAction.CREATE,
          entityLabel: createdUser.name,
          newValue: {
            id: createdUser.id,
            email: createdUser.email,
            role: createdUser.role,
          },
          ipAddress,
          userAgent,
        },
        tx
      );

      return createdUser;
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

  async logout(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const user = await authRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedError(AUTH_MESSAGES.UNAUTHENTICATED);
    }

    await auditService.record(
      {
        userId: user.id,
        entity: AuditEntity.AUTH,
        action: AuditAction.LOGOUT,
        entityLabel: user.email ?? user.username ?? user.mobile ?? undefined,
        oldValue: { lastLoginAt: user.lastLoginAt },
        ipAddress,
        userAgent,
      }
    );
  }

  async changePassword(userId: string, input: ChangePasswordInput, ipAddress?: string, userAgent?: string): Promise<void> {
    const user = await authRepository.findById(userId);

    if (!user || user.deletedAt || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedError(AUTH_MESSAGES.UNAUTHENTICATED);
    }

    const isPasswordValid = await comparePassword(input.currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Current password is incorrect.");
    }

    const passwordHash = await hashPassword(input.newPassword);

    await prisma.$transaction(async (tx) => {
      await authRepository.updatePassword(user.id, passwordHash, tx);

      await auditService.record(
        {
          userId: user.id,
          entity: AuditEntity.USER,
          action: AuditAction.PASSWORD_CHANGED,
          entityLabel: user.email ?? user.username ?? user.mobile ?? undefined,
          newValue: { passwordChanged: true }, // Not logging hashes or passwords
          ipAddress,
          userAgent,
        },
        tx
      );
    });

    logger.info("User changed password", { userId: user.id });
  }
}

export const authService = new AuthService();
