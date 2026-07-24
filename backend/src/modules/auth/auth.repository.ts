import { Prisma, User } from "@prisma/client";
import prisma from "../../database/prisma";

/**
 * Repository layer: raw Prisma access only. No business rules, no
 * error throwing beyond what Prisma itself throws — that
 * interpretation belongs to the service layer.
 */
class AuthRepository {
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  findByMobile(mobile: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { mobile } });
  }

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  updateLastLogin(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }
}

export const authRepository = new AuthRepository();
