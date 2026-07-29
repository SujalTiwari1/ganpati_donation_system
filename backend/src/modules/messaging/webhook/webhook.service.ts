import { logger } from '../../../config';
import { env } from '../../../config/env';

import { transactionRepository } from '../../transactions/transaction.repository';

import type { WhatsAppWebhookPayload, WhatsAppWebhookStatusValue } from './webhook.types';

import { WhatsappStatus } from '@prisma/client';

const STATUS_MAP: Record<string, WhatsappStatus> = {
  sent: WhatsappStatus.SENT,
  delivered: WhatsappStatus.DELIVERED,
  read: WhatsappStatus.READ,
  failed: WhatsappStatus.FAILED,
};

export class WhatsAppWebhookService {
  async verify(mode?: string, challenge?: string, verifyToken?: string): Promise<string | null> {
    if (mode !== 'subscribe') {
      return null;
    }

    if (!verifyToken || verifyToken !== env.WHATSAPP_VERIFY_TOKEN) {
      return null;
    }

    return challenge ?? null;
  }

  async process(payload: WhatsAppWebhookPayload): Promise<void> {
    try {
      logger.info('WhatsApp webhook received', {
        object: payload.object,
      });

      const statuses = this.extractStatuses(payload);

      for (const status of statuses) {
        await this.applyStatus(status);
      }
    } catch (error) {
      logger.error('WhatsApp webhook processing failed', {
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  private extractStatuses(payload: WhatsAppWebhookPayload): WhatsAppWebhookStatusValue[] {
    return (
      payload.entry?.flatMap(
        (entry) => entry.changes?.flatMap((change) => change.value?.statuses ?? []) ?? [],
      ) ?? []
    );
  }

  private async applyStatus(status: WhatsAppWebhookStatusValue): Promise<void> {
    const transaction = await transactionRepository.findByProviderMessageId(status.id);

    if (!transaction) {
      logger.warn('WhatsApp webhook status received for unknown message', {
        providerMessageId: status.id,
        status: status.status,
      });
      return;
    }

    const mappedStatus = STATUS_MAP[status.status];
    if (!mappedStatus) {
      return;
    }

    await transactionRepository.updateWhatsAppStatus(transaction.id, mappedStatus);

    await transactionRepository.updateMessageMetadata(transaction.id, {
      ...(mappedStatus === WhatsappStatus.DELIVERED && {
        whatsappDeliveredAt: this.parseTimestamp(status.timestamp),
      }),
      ...(mappedStatus === WhatsappStatus.READ && {
        whatsappReadAt: this.parseTimestamp(status.timestamp),
      }),
      ...(mappedStatus === WhatsappStatus.FAILED && {
        whatsappFailureReason:
          status.errors?.[0]?.message ?? status.errors?.[0]?.title ?? 'WhatsApp delivery failed',
      }),
    });

    logger.info('WhatsApp webhook status applied', {
      transactionId: transaction.id,
      providerMessageId: status.id,
      recipient: status.recipient_id,
      status: mappedStatus,
    });

    if (mappedStatus === WhatsappStatus.DELIVERED) {
      logger.info('WhatsApp delivered', {
        transactionId: transaction.id,
        providerMessageId: status.id,
        recipient: status.recipient_id,
      });
    }

    if (mappedStatus === WhatsappStatus.READ) {
      logger.info('WhatsApp read', {
        transactionId: transaction.id,
        providerMessageId: status.id,
        recipient: status.recipient_id,
      });
    }

    if (mappedStatus === WhatsappStatus.FAILED) {
      logger.info('WhatsApp failed', {
        transactionId: transaction.id,
        providerMessageId: status.id,
        recipient: status.recipient_id,
      });
    }
  }

  private parseTimestamp(timestamp?: string): Date | undefined {
    if (!timestamp) {
      return undefined;
    }

    const parsed = new Date(Number(timestamp) * 1000);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
}

export const whatsappWebhookService = new WhatsAppWebhookService();
