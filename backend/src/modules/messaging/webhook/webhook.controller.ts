import { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler';
import { whatsappWebhookService } from './webhook.service';

export class WhatsAppWebhookController {
  verify = asyncHandler(async (req: Request, res: Response) => {
    const challenge = await whatsappWebhookService.verify(
      req.query['hub.mode'] as string | undefined,
      req.query['hub.challenge'] as string | undefined,
      req.query['hub.verify_token'] as string | undefined,
    );

    if (!challenge) {
      return res.sendStatus(403);
    }

    res.status(200).send(challenge);
  });

  handle = asyncHandler(async (req: Request, res: Response) => {
    await whatsappWebhookService.process(req.body);
    res.sendStatus(200);
  });
}

export const whatsappWebhookController = new WhatsAppWebhookController();
