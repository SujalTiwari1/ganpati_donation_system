import { Router } from 'express';

import { validate } from '../../../middleware';
import { whatsappWebhookVerificationSchema } from './webhook.validator';
import { whatsappWebhookController } from './webhook.controller';

const router = Router();

router.get(
  '/whatsapp',
  validate(whatsappWebhookVerificationSchema, 'query'),
  whatsappWebhookController.verify,
);
router.post('/whatsapp', whatsappWebhookController.handle);

export { router as whatsappWebhookRouter };
