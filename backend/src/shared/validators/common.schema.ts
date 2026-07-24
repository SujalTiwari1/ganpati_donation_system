import { z } from "zod";

/** Reusable across every module that needs list pagination. */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

/** Reusable UUID param validator, e.g. `GET /users/:id`. */
export const idParamSchema = z.object({
  id: z.string().uuid("Invalid id format"),
});

/** Reusable strong-password rule shared by auth + password-reset flows. */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters") // bcrypt's max input length
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number");

/** India-format mobile number, 10 digits. Adjust if intl. numbers are needed. */
export const mobileSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");
