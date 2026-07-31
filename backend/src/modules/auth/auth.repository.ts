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

  findByIdentifier(identifier: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
          { mobile: identifier },
        ],
      },
    });
  }

  findByMobile(mobile: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { mobile } });
  }

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  create(data: Prisma.UserCreateInput, tx: Prisma.TransactionClient = prisma): Promise<User> {
    return tx.user.create({ data });
  }

  updateLastLogin(id: string, tx: Prisma.TransactionClient = prisma): Promise<User> {
    return tx.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  updatePassword(id: string, passwordHash: string, tx: Prisma.TransactionClient = prisma): Promise<User> {
    return tx.user.update({
      where: { id },
      data: { 
        passwordHash,
        mustChangePassword: false,
        passwordChangedAt: new Date()
      },
    });
  }
}

export const authRepository = new AuthRepository();
