import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  PORT: z.coerce.number().default(5000),

  DATABASE_URL: z.string().min(1),

  JWT_SECRET: z.string().min(32, "JWT_SECRET should be at least 32 characters"),

  JWT_EXPIRES_IN: z.string().default("7d"),

  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),

  CLIENT_URL: z.string().url(),

  API_VERSION: z.string().default("v1"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables\n");
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;