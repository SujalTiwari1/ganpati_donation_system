import { z } from "zod";
import { UserRole } from "@prisma/client";
import { mobileSchema, passwordSchema } from "../../shared/validators";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  mobile: mobileSchema,
  password: passwordSchema,
  role: z.nativeEnum(UserRole).default(UserRole.VOLUNTEER),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
