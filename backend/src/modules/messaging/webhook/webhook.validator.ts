import { z } from 'zod';

export const whatsappWebhookVerificationSchema = z.object({
  'hub.mode': z.string().optional(),
  'hub.challenge': z.string().optional(),
  'hub.verify_token': z.string().optional(),
});
