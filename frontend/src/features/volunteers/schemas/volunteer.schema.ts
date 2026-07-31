import { z } from "zod";

export const createVolunteerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(150),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(100, "Username cannot exceed 100 characters")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Username can only contain letters, numbers, dots, hyphens and underscores",
    ),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
  status: z.enum(["ACTIVE", "SUSPENDED"]).default("ACTIVE"),
});

export const editVolunteerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(150),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(100, "Username cannot exceed 100 characters")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Username can only contain letters, numbers, dots, hyphens and underscores",
    ),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export type CreateVolunteerForm = z.infer<typeof createVolunteerSchema>;
export type EditVolunteerForm = z.infer<typeof editVolunteerSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
