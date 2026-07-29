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

  /**
   * Validates whether messaging is enabled.
   */
  private ensureMessagingEnabled(): void {
    if (!whatsappConfig.enabled) {
      throw new Error(WHATSAPP_MESSAGES.DISABLED);
    }
  }
}
