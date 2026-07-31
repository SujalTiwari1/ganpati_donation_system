import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate, requireRole } from "../auth";
import { validate } from "../../middleware";
import { userController } from "./user.controller";
import {
  changeStatusSchema,
  createUserSchema,
  getUserSchema,
  listUsersSchema,
  resetPasswordSchema,
  updateUserSchema,
} from "./user.schema";

const router = Router();

// All routes are admin-only
router.use(authenticate, requireRole(UserRole.ADMIN));

router.get("/", validate(listUsersSchema, "query"), userController.list);
router.get("/stats", userController.getStats);
router.post("/", validate(createUserSchema), userController.create);
router.get("/:id", validate(getUserSchema, "params"), userController.getById);
router.patch("/:id", validate(updateUserSchema), userController.update);
router.patch("/:id/reset-password", validate(resetPasswordSchema), userController.resetPassword);
router.patch("/:id/change-status", validate(changeStatusSchema), userController.changeStatus);

export { router as userRouter };
