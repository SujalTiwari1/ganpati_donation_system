import { Request, Response, NextFunction } from 'express';

import { receiptService } from './receipt.service';

export class ReceiptController {
  async generateReceipt(
    req: Request<{ transactionId: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { transactionId } = req.params;

      const receiptDocument = await receiptService.generateReceipt(transactionId);

      res.setHeader('Content-Type', receiptDocument.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${receiptDocument.fileName}"`);

      res.send(receiptDocument.buffer);
    } catch (error) {
      next(error);
    }
  }
}

export const receiptController = new ReceiptController();
