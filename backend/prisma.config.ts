// prisma.config.ts — project root, next to package.json
//
// Prisma ORM v7 no longer reads DATABASE_URL from schema.prisma or
// from an auto-loaded .env file for the CLI. Both must be handled here.

import "dotenv/config"; // v7 does not auto-load .env — this line is required
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // Path to your schema file
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
    // seed: "tsx prisma/seed.ts", // uncomment once you add a seed script
  },

  // Used by the Prisma CLI (migrate, db execute, studio, etc.)
  // Runtime PrismaClient in your app code does NOT read this —
  // it gets its connection string via the driver adapter instead
  // (see src/lib/prisma.ts).
  datasource: {
    url: env("DATABASE_URL"),
    // If you use Neon's pooled connection string as DATABASE_URL,
    // point shadowDatabaseUrl at Neon's unpooled/direct connection
    // string so `migrate dev` can create its shadow database:
    // shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
  },
});