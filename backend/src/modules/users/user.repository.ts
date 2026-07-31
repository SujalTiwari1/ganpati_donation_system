import { Prisma, UserRole, UserStatus, type User } from "@prisma/client";
import { prisma } from "../../database";
import type { UserListQuery } from "./user.types";

export class UserRepository {
  async findById(id: string, includeDeleted = false): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { email } });
  }

  async findByMobile(mobile: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { mobile } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { username } });
  }

  async create(
    data: Prisma.UserUncheckedCreateInput,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<User> {
    return tx.user.create({ data });
  }

  async update(
    id: string,
    data: Prisma.UserUncheckedUpdateInput,
    tx: Prisma.TransactionClient = prisma,
  ): Promise<User> {
    return tx.user.update({ where: { id }, data });
  }

  async list(query: UserListQuery) {
    const { page, limit, search, role, status, sortBy, sortOrder } = query;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { username: { contains: search, mode: "insensitive" } },
              { mobile: { contains: search } },
            ],
          }
        : {}),
    };

    return prisma.user.findMany({
      where,
      orderBy: { [sortBy ?? "createdAt"]: sortOrder ?? "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async count(query: Omit<UserListQuery, "page" | "limit" | "sortBy" | "sortOrder">) {
    const { search, role, status } = query;
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { username: { contains: search, mode: "insensitive" } },
              { mobile: { contains: search } },
            ],
          }
        : {}),
    };
    return prisma.user.count({ where });
  }

  async countByStatus(role: UserRole) {
    const [active, inactive, mustChange] = await Promise.all([
      prisma.user.count({ where: { role, status: UserStatus.ACTIVE, deletedAt: null } }),
      prisma.user.count({ where: { role, status: UserStatus.SUSPENDED, deletedAt: null } }),
      prisma.user.count({ where: { role, mustChangePassword: true, deletedAt: null } }),
    ]);
    return { active, inactive, mustChange };
  }
}

export const userRepository = new UserRepository();
