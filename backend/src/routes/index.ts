import { Router } from "express";
import healthRoutes from "./health.route";
import { authRoutes } from "../modules/auth";
import { buildingRouter } from "../modules/buildings";
import { transactionRouter } from "../modules/transactions";
import { dashboardRouter } from "../modules/dashboard/dashboard.route";
import {  auditRoutes } from "../modules/audit";


const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/buildings", buildingRouter);
router.use("/transactions", transactionRouter);
router.use("/dashboard", dashboardRouter);
router.use("/audit-logs", auditRoutes);


export default router;