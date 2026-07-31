import { AuditAction, AuditEntity, UserRole, UserStatus, type User } from "@prisma/client";
import { logger } from "../../config";
import { prisma } from "../../database";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../../shared/errors";
import { auditService } from "../audit/audit.service";
import { hashPassword } from "../auth/auth.utils";
import { toSafeUser } from "../auth/auth.utils";
import { USER_MESSAGES } from "./user.constants";
import {
  UserRepository,
  userRepository,
} from "./user.repository";
import type {
  ChangeStatusInput,
  CreateUserInput,
  PaginatedUsers,
  ResetPasswordInput,
  SafeUserWithMeta,
  UpdateUserInput,
  UserListQuery,
  VolunteerDonation,
  VolunteerStatistics,
  VolunteerDonationListResult,
} from "./user.types";

function toSafeUserWithMeta(user: User): SafeUserWithMeta {
  const safe = toSafeUser(user);
  return {
    ...safe,
    username: safe.username ?? "",
    email: safe.email ?? "",
    mobile: safe.mobile ?? "",
    mustChangePassword: safe.mustChangePassword,
    lastLoginAt: safe.lastLoginAt ? safe.lastLoginAt.toISOString() : null,
    createdAt: safe.createdAt.toISOString(),
    updatedAt: safe.updatedAt.toISOString(),
  };
}

export class UserService {
  constructor(
    private readonly repository: UserRepository = userRepository,
  ) {}

  async create(
    input: CreateUserInput,
    createdById: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<SafeUserWithMeta> {
    const [existingByEmail, existingByMobile, existingByUsername] = await Promise.all([
      this.repository.findByEmail(input.email),
      this.repository.findByMobile(input.mobile),
      this.repository.findByUsername(input.username),
    ]);

    if (existingByEmail) throw new ConflictError(USER_MESSAGES.EMAIL_EXISTS);
    if (existingByMobile) throw new ConflictError(USER_MESSAGES.MOBILE_EXISTS);
    if (existingByUsername) throw new ConflictError(USER_MESSAGES.USERNAME_EXISTS);

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.$transaction(async (tx) => {
      const created = await this.repository.create(
        {
          name: input.name,
          username: input.username,
          email: input.email,
          mobile: input.mobile,
          passwordHash,
          role: input.role,
          status: input.status ?? UserStatus.ACTIVE,
          mustChangePassword: true,
        },
        tx,
      );

      await auditService.record(
        {
          userId: createdById,
          entity: AuditEntity.USER,
          action: AuditAction.CREATE,
          entityId: created.id,
          entityLabel: created.name,
          newValue: { id: created.id, username: created.username, email: created.email, role: created.role },
          ipAddress,
          userAgent,
        },
        tx,
      );

      return created;
    });

    logger.info("Volunteer created", { createdById, newUserId: user.id });
    return toSafeUserWithMeta(user);
  }

  async list(query: UserListQuery): Promise<PaginatedUsers> {
    const [users, total] = await Promise.all([
      this.repository.list(query),
      this.repository.count(query),
    ]);

    return {
      data: users.map(toSafeUserWithMeta),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async getById(id: string): Promise<SafeUserWithMeta> {
    const user = await this.getUserOrThrow(id);
    return toSafeUserWithMeta(user);
  }

  async update(
    id: string,
    input: UpdateUserInput,
    currentUserId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<SafeUserWithMeta> {
    const user = await this.getUserOrThrow(id);

    if (input.email && input.email !== user.email) {
      const existing = await this.repository.findByEmail(input.email);
      if (existing) throw new ConflictError(USER_MESSAGES.EMAIL_EXISTS);
    }
    if (input.mobile && input.mobile !== user.mobile) {
      const existing = await this.repository.findByMobile(input.mobile);
      if (existing) throw new ConflictError(USER_MESSAGES.MOBILE_EXISTS);
    }
    if (input.username && input.username !== user.username) {
      const existing = await this.repository.findByUsername(input.username);
      if (existing) throw new ConflictError(USER_MESSAGES.USERNAME_EXISTS);
    }

    const data: Record<string, unknown> = {};
    if (input.name !== undefined) data.name = input.name.trim();
    if (input.username !== undefined) data.username = input.username.trim();
    if (input.email !== undefined) data.email = input.email.trim().toLowerCase();
    if (input.mobile !== undefined) data.mobile = input.mobile.trim();
    if (input.status !== undefined) data.status = input.status;

    const updated = await prisma.$transaction(async (tx) => {
      const result = await this.repository.update(user.id, data, tx);

      await auditService.record(
        {
          userId: currentUserId,
          entity: AuditEntity.USER,
          action: AuditAction.UPDATE,
          entityId: result.id,
          entityLabel: result.name,
          oldValue: { name: user.name, username: user.username, email: user.email, status: user.status },
          newValue: { name: result.name, username: result.username, email: result.email, status: result.status },
          ipAddress,
          userAgent,
        },
        tx,
      );

      return result;
    });

    logger.info("Volunteer updated", { volunteerId: updated.id, updatedBy: currentUserId });
    return toSafeUserWithMeta(updated);
  }

  async resetPassword(
    id: string,
    input: ResetPasswordInput,
    currentUserId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    if (id === currentUserId) {
      throw new ForbiddenError(USER_MESSAGES.CANNOT_RESET_OWN);
    }

    const user = await this.getUserOrThrow(id);
    const passwordHash = await hashPassword(input.password);

    await prisma.$transaction(async (tx) => {
      await this.repository.update(
        user.id,
        { passwordHash, mustChangePassword: true },
        tx,
      );

      await auditService.record(
        {
          userId: currentUserId,
          entity: AuditEntity.USER,
          action: AuditAction.STATUS_CHANGE,
          entityId: user.id,
          entityLabel: user.name,
          oldValue: { passwordReset: false },
          newValue: { passwordReset: true },
          ipAddress,
          userAgent,
        },
        tx,
      );
    });

    logger.info("Volunteer password reset", { volunteerId: user.id, resetBy: currentUserId });
  }

  async changeStatus(
    id: string,
    input: ChangeStatusInput,
    currentUserId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<SafeUserWithMeta> {
    if (id === currentUserId && input.status === UserStatus.SUSPENDED) {
      throw new ForbiddenError(USER_MESSAGES.CANNOT_DEACTIVATE_SELF);
    }

    const user = await this.getUserOrThrow(id);

    const updated = await prisma.$transaction(async (tx) => {
      const result = await this.repository.update(
        user.id,
        { status: input.status },
        tx,
      );

      await auditService.record(
        {
          userId: currentUserId,
          entity: AuditEntity.USER,
          action: AuditAction.STATUS_CHANGE,
          entityId: result.id,
          entityLabel: result.name,
          oldValue: { status: user.status },
          newValue: { status: result.status },
          ipAddress,
          userAgent,
        },
        tx,
      );

      return result;
    });

    logger.info("Volunteer status changed", {
      volunteerId: updated.id,
      newStatus: updated.status,
      changedBy: currentUserId,
    });
    return toSafeUserWithMeta(updated);
  }

  async getStats(role: UserRole = UserRole.VOLUNTEER) {
    const { active, inactive, mustChange } = await this.repository.countByStatus(role);
    return {
      total: active + inactive,
      active,
      inactive,
      pendingPasswordChange: mustChange,
    };
  }

  async getMyProfile(userId: string): Promise<SafeUserWithMeta> {
    const user = await this.getUserOrThrow(userId);
    return toSafeUserWithMeta(user);
  }

  async updateMyProfile(
    userId: string,
    input: { name?: string; email?: string; mobile?: string; username?: string },
    ipAddress?: string,
    userAgent?: string,
  ): Promise<SafeUserWithMeta> {
    const user = await this.getUserOrThrow(userId);

    if (input.email && input.email !== user.email) {
      const existing = await this.repository.findByEmail(input.email);
      if (existing) throw new ConflictError(USER_MESSAGES.EMAIL_EXISTS);
    }
    if (input.mobile && input.mobile !== user.mobile) {
      const existing = await this.repository.findByMobile(input.mobile);
      if (existing) throw new ConflictError(USER_MESSAGES.MOBILE_EXISTS);
    }
    if (input.username && input.username !== user.username) {
      const existing = await this.repository.findByUsername(input.username);
      if (existing) throw new ConflictError(USER_MESSAGES.USERNAME_EXISTS);
    }

    const data: Record<string, unknown> = {};
    if (input.name !== undefined) data.name = input.name.trim();
    if (input.username !== undefined) data.username = input.username.trim();
    if (input.email !== undefined) data.email = input.email.trim().toLowerCase();
    if (input.mobile !== undefined) data.mobile = input.mobile.trim();

    const updated = await prisma.$transaction(async (tx) => {
      const result = await this.repository.update(user.id, data, tx);
      await auditService.record(
        {
          userId: userId,
          entity: AuditEntity.USER,
          action: AuditAction.UPDATE,
          entityId: result.id,
          entityLabel: result.name,
          oldValue: { name: user.name, username: user.username, email: user.email, mobile: user.mobile },
          newValue: { name: result.name, username: result.username, email: result.email, mobile: result.mobile },
          ipAddress,
          userAgent,
        },
        tx,
      );
      return result;
    });

    logger.info("User updated own profile", { userId });
    return toSafeUserWithMeta(updated);
  }

  async getMyStatistics(userId: string): Promise<VolunteerStatistics> {
    const [agg, buildingsVisited] = await Promise.all([
      prisma.transaction.aggregate({
        where: { volunteerId: userId, deletedAt: null, status: "CONFIRMED" },
        _count: true,
        _sum: { amount: true },
        _avg: { amount: true },
        _max: { amount: true },
      }),
      prisma.transaction.findMany({
        where: { volunteerId: userId, deletedAt: null, status: "CONFIRMED" },
        distinct: ["buildingId"],
        select: { buildingId: true },
      }),
    ]);

    return {
      totalCollections: agg._count,
      totalAmount: Number(agg._sum.amount ?? 0),
      highestDonation: Number(agg._max.amount ?? 0),
      averageDonation: Number(agg._avg.amount ?? 0),
      buildingsVisited: buildingsVisited.length,
    };
  }

  async getMyDonations(
    userId: string,
    limit = 10,
  ): Promise<VolunteerDonationListResult> {
    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { volunteerId: userId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          receiptNumber: true,
          amount: true,
          paymentMethod: true,
          status: true,
          createdAt: true,
          donor: { select: { id: true, name: true } },
          building: { select: { id: true, name: true } },
        },
      }),
      prisma.transaction.count({
        where: { volunteerId: userId, deletedAt: null },
      }),
    ]);

    const donations: VolunteerDonation[] = data.map((tx) => ({
      id: tx.id,
      receiptNumber: tx.receiptNumber,
      donorName: tx.donor.name,
      buildingName: tx.building.name,
      amount: Number(tx.amount),
      paymentMethod: tx.paymentMethod,
      status: tx.status,
      createdAt: tx.createdAt.toISOString(),
    }));

    return { data: donations, total };
  }

  private async getUserOrThrow(id: string): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) throw new NotFoundError(USER_MESSAGES.NOT_FOUND);
    return user;
  }
}

export const userService = new UserService();


export { UserService, userService }