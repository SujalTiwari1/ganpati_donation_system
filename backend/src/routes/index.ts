import { Router } from 'express';
import healthRoutes from './health.route';
import { authRoutes } from '../modules/auth';
import { buildingRouter } from '../modules/buildings';
import { transactionRouter } from '../modules/transactions';
import { dashboardRouter } from '../modules/dashboard/dashboard.route';
import { auditRoutes } from '../modules/audit';
import { userRouter } from '../modules/users';
import { whatsappWebhookRouter } from '../modules/messaging';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/buildings', buildingRouter);
router.use('/transactions', transactionRouter);
router.use('/dashboard', dashboardRouter);
router.use('/audit-logs', auditRoutes);
router.use('/users', userRouter);
router.use('/webhooks', whatsappWebhookRouter);

export default router;
