import { z } from "zod";
import { UserRole, UserStatus } from "@prisma/client";
import {
  idParamSchema,
  mobileSchema,
  paginationSchema,
  passwordSchema,
} from "../../shared/validators";
import {
  USER_NAME_MAX_LENGTH,
  USER_NAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "./user.constants";

const nameSchema = z
  .string()
  .trim()
  .min(USER_NAME_MIN_LENGTH, `Name must be at least ${USER_NAME_MIN_LENGTH} characters`)
  .max(USER_NAME_MAX_LENGTH, `Name cannot exceed ${USER_NAME_MAX_LENGTH} characters`);

const usernameSchema = z
  .string()
  .trim()
  .min(USERNAME_MIN_LENGTH, `Username must be at least ${USERNAME_MIN_LENGTH} characters`)
  .max(USERNAME_MAX_LENGTH, `Username cannot exceed ${USERNAME_MAX_LENGTH} characters`)
  .regex(/^[a-zA-Z0-9_.-]+$/, "Username can only contain letters, numbers, dots, hyphens and underscores");

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");

export const createUserSchema = z.object({
  name: nameSchema,
  username: usernameSchema,
  email: emailSchema,
  mobile: mobileSchema,
  password: passwordSchema,
  role: z.nativeEnum(UserRole).default(UserRole.VOLUNTEER),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
});

export const updateUserSchema = z.object({
  name: nameSchema.optional(),
  username: usernameSchema.optional(),
  email: emailSchema.optional(),
  mobile: mobileSchema.optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

export const getUserSchema = idParamSchema;

export const listUsersSchema = paginationSchema.extend({
  search: z.string().trim().optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  sortBy: z.enum(["name", "createdAt", "updatedAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});

export const changeStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
});

export type CreateUserBody = z.infer<typeof createUserSchema>;
export type UpdateUserBody = z.infer<typeof updateUserSchema>;
export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>;
export type ChangeStatusBody = z.infer<typeof changeStatusSchema>;
