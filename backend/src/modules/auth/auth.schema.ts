import { z } from "zod";
import { UserRole } from "@prisma/client";
import { mobileSchema, passwordSchema } from "../../shared/validators";

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Identifier must be at least 3 characters"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(100, "Username cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Username can only contain letters, numbers, dots, hyphens and underscores"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  mobile: mobileSchema,
  password: passwordSchema,
  role: z.nativeEnum(UserRole).default(UserRole.VOLUNTEER),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password cannot be the same as current password",
  path: ["newPassword"],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
