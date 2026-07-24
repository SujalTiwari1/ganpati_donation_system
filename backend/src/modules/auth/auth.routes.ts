import { Router } from "express";
import { UserRole } from "@prisma/client";
import { validate } from "../../middleware/validation.middleware";
import { authenticate, requireRole } from "./auth.middleware";
import { login, register, me, logout } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schema";

const router = Router();

/* ---------------------------------- Public ---------------------------------- */
router.post("/login", validate(loginSchema), login);

/* --------------------------------- Protected --------------------------------- */
router.get("/me", authenticate, me);
router.post("/logout", authenticate, logout);

/* --------------------------------- Admin only --------------------------------- */
router.post(
  "/register",
  authenticate,
  requireRole(UserRole.ADMIN),
  validate(registerSchema),
  register
);

export default router;
