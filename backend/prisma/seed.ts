import "dotenv/config";
import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

/**
 * Creates (or resets) a single bootstrap ADMIN so you have a way into
 * the system at all — /auth/register requires an ADMIN token, so the
 * very first admin can't be created through the API. Run this once
 * per environment via `npx prisma db seed`.
 *
 * Safe to re-run: it upserts by email, so it won't create duplicates.
 */
async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@ganpativargani.local";
  const mobile = process.env.SEED_ADMIN_MOBILE ?? "9999999999";
  const plainPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345";
  const username = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

  const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      username,
      deletedAt: null,
    },
    create: {
      name: "Root Admin",
      username,
      email,
      mobile,
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.log("✅ Seeded ADMIN user:");
  console.log(`   email:    ${admin.email}`);
  console.log(`   username: ${admin.username}`);
  console.log(`   mobile:   ${admin.mobile}`);
  console.log(`   password: ${plainPassword}  (change this after first login)`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
