import { whatsappConfig } from '../../config/whatsapp.config';

import type { IMessagingProvider } from './interfaces';

import type { MessagingResult, SendDocumentPayload, SendTextPayload } from './types';

import { WHATSAPP_MESSAGES } from './messaging.constants';

export class MessagingService {
  constructor(private readonly provider: IMessagingProvider) {}

  isEnabled(): boolean {
    return whatsappConfig.enabled;
  }

  async sendText(payload: SendTextPayload): Promise<MessagingResult> {
    this.ensureMessagingEnabled();

    return this.provider.sendText(payload);
  }

  async sendDocument(payload: SendDocumentPayload): Promise<MessagingResult> {
    this.ensureMessagingEnabled();

    return this.provider.sendDocument(payload);
  }

  async sendReceiptDocument(
    transaction: any,
    receiptDocument: { buffer: Buffer; fileName: string; mimeType: string },
    recipient: string
  ): Promise<MessagingResult> {
    this.ensureMessagingEnabled();

    // Dynamically require to avoid circular dependencies if any, or just import at top.
    // We already have FESTIVAL_NAME from config.
    const { FESTIVAL_NAME } = require('../../config/constants');
    const { buildReceiptCaption } = require('./templates/whatsapp.templates');

    // transaction payload might differ based on Prisma relations.
    // Format the date properly
    const date = new Date(transaction.donationDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    // Capitalize payment mode nicely
    const pMode = transaction.paymentMethod.replace(/_/g, ' ');
    const paymentMode = pMode.charAt(0).toUpperCase() + pMode.slice(1).toLowerCase();

    const caption = buildReceiptCaption({
      donorName: transaction.donor?.name || 'Devotee',
      receiptNumber: transaction.receiptNumber,
      amount: transaction.amount,
      buildingName: transaction.building?.name || '',
      roomNumber: transaction.roomNumber || transaction.donor?.roomNumber || '',
      paymentMode,
      date
    }, FESTIVAL_NAME);

    return this.provider.sendDocument({
      recipient,
      fileName: receiptDocument.fileName,
      mimeType: receiptDocument.mimeType,
      file: receiptDocument.buffer,
      caption,
    });
  }

  /**
   * Validates whether messaging is enabled.
   */
  private ensureMessagingEnabled(): void {
    if (!whatsappConfig.enabled) {
      throw new Error(WHATSAPP_MESSAGES.DISABLED);
    }
  }
}
