import { User, UserRole, UserStatus } from "@prisma/client";

let counter = 0;

/**
 * Builds a fake `User` row (as Prisma would return it) with sane
 * defaults, overridable per test. Keeps every test's Arrange step
 * short and makes it obvious which fields actually matter for that
 * test.
 */
export function buildUser(overrides: Partial<User> = {}): User {
  counter += 1;

  return {
    id: `user-${counter}`,
    name: "Test User",
    email: `user${counter}@example.com`,
    mobile: "9876543210",
    passwordHash: "$2b$04$placeholderHashValueForTests........................",
    role: UserRole.VOLUNTEER,
    status: UserStatus.ACTIVE,
    lastLoginAt: null,
    deletedAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

export function buildAdmin(overrides: Partial<User> = {}): User {
  return buildUser({ role: UserRole.ADMIN, ...overrides });
}
