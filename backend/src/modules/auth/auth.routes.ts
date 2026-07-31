import { Router } from "express";
import { UserRole } from "@prisma/client";
import { validate } from "../../middleware/validation.middleware";
import { authenticate, requireRole } from "./auth.middleware";
import { login, register, me, logout, changePassword } from "./auth.controller";
import { loginSchema, registerSchema, changePasswordSchema } from "./auth.schema";

const router = Router();

/* ---------------------------------- Public ---------------------------------- */
router.post("/login", validate(loginSchema), login);

/* --------------------------------- Protected --------------------------------- */
router.get("/me", authenticate, me);
router.post("/logout", authenticate, logout);
router.patch("/change-password", authenticate, validate(changePasswordSchema), changePassword);

/* --------------------------------- Admin only --------------------------------- */
router.post(
  "/register",
  authenticate,
  requireRole(UserRole.ADMIN),
  validate(registerSchema),
  register
);

export default router;
