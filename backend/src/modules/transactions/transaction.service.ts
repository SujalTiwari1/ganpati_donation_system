import {
  AuditAction,
  AuditEntity,
  Prisma,
  TransactionStatus,
  WhatsappStatus,
} from '@prisma/client';
import { prisma } from '../../database';
import { logger } from '../../config';
import { BadRequestError, ConflictError, NotFoundError } from '../../shared/errors';

import { normalizeBuildingName } from '../buildings/building.utils';
import { buildingRepository } from '../buildings/building.repository';
import { donorRepository } from '../donors/donor.repository';
import { festivalRepository } from '../festivals/festival.repository';

import {
  RECEIPT_NUMBER_PREFIX,
  RECEIPT_SEQ_PAD_LENGTH,
  TRANSACTION_MESSAGES,
} from './transaction.constants';
import { auditService } from '../audit/audit.service';
import { messagingService as messagingServiceInstance } from '../messaging/container';
import { receiptService as receiptServiceInstance } from '../receipt/receipt.service';
import { TransactionRepository, transactionRepository } from './transaction.repository';
import type { MessagingService } from '../messaging/messaging.service';
import type { ReceiptDocument, ReceiptService } from '../receipt/receipt.service';
import type {
  CreateTransactionInput,
  TransactionListQuery,
  UpdateTransactionInput,
} from './transaction.schema';
import type { MessagingResult } from '../messaging/types/messaging.types';

const WHATSAPP_PENDING_STATUS = 'PENDING' as WhatsappStatus;
const WHATSAPP_SKIPPED_STATUS = 'SKIPPED' as WhatsappStatus;

export class TransactionService {
  constructor(
    private readonly repository: TransactionRepository = transactionRepository,
    private readonly receiptService: ReceiptService = receiptServiceInstance,
    private readonly messagingService: MessagingService = messagingServiceInstance,
  ) {}

  async create(
    input: CreateTransactionInput,
    currentUserId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const buildingId = await this.resolveBuildingId(input);
    await this.ensureBuildingExists(buildingId);

    const transaction = await prisma.$transaction(
      async (tx) => {
        const festival = await this.resolveFestival(input.year, currentUserId, tx);

        const donor = await this.resolveDonor(
          {
            mobile: input.mobile,
            name: input.donorName,
            buildingId,
            roomNumber: input.roomNumber,
          },
          currentUserId,
          tx,
        );

        const duplicate = await this.repository.findActiveDuplicate(
          festival.id,
          buildingId,
          input.roomNumber,
          tx,
        );

        if (duplicate && !input.overrideDuplicate) {
          throw new ConflictError(TRANSACTION_MESSAGES.DUPLICATE_ROOM_COLLECTION);
        }

        const receiptNumber = await this.generateReceiptNumber(festival.id, festival.year, tx);

        const transaction = await this.repository.create(
          {
            festivalId: festival.id,
            donorId: donor.id,
            volunteerId: currentUserId,
            buildingId,
            receiptNumber,
            roomNumber: input.roomNumber,
            amount: input.amount,
            paymentMethod: input.paymentMethod,
            whatsappStatus: WHATSAPP_PENDING_STATUS,
            isDuplicate: Boolean(duplicate),
            duplicateOfTransactionId: duplicate?.id,
            duplicateOverrideReason: duplicate ? input.duplicateOverrideReason : undefined,
            createdById: currentUserId,
          },
          tx,
        );

        await auditService.record(
          {
            userId: currentUserId,
            entity: AuditEntity.TRANSACTION,
            action: AuditAction.CREATE,
            entityId: transaction.id,
            entityLabel: transaction.receiptNumber,
            newValue: JSON.parse(JSON.stringify(transaction)),
            ipAddress,
            userAgent,
          },
          tx,
        );

        logger.info('Transaction created', {
          transactionId: transaction.id,
          receiptNumber: transaction.receiptNumber,
          amount: transaction.amount.toString(),
          createdBy: currentUserId,
          isDuplicate: transaction.isDuplicate,
        });

        return transaction;
      },
      {
        timeout: 15000,
      },
    );

    try {
      const receiptDocument = await this.receiptService.generateReceipt(transaction.id);

      await this.repository.updateReceiptStatus(transaction.id, true);

      logger.info('Receipt status updated', {
        transactionId: transaction.id,
        receiptNumber: transaction.receiptNumber,
        receiptGenerated: true,
      });

      logger.info('Receipt generated', {
        transactionId: transaction.id,
        receiptNumber: transaction.receiptNumber,
      });

      await this.sendReceipt(input.mobile, receiptDocument, transaction);
    } catch (error) {
      logger.error('Receipt generation failed', {
        transactionId: transaction.id,
        receiptNumber: transaction.receiptNumber,
        error: error instanceof Error ? error.message : error,
      });
    }

    return transaction;
  }

  async getById(id: string) {
    return this.ensureTransactionExists(id);
  }

  async list(query: TransactionListQuery) {
    const [data, total] = await Promise.all([
      this.repository.list(query),
      this.repository.count(query),
    ]);

    return {
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async update(
    id: string,
    input: UpdateTransactionInput,
    currentUserId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const transaction = await this.ensureTransactionExists(id);
    this.ensureEditable(transaction.status);

    const data: Prisma.TransactionUpdateInput = {
      updatedBy: {
        connect: { id: currentUserId },
      },
    };

    if (input.roomNumber !== undefined) {
      data.roomNumber = input.roomNumber;
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (input.donorName !== undefined) {
        await tx.donor.update({
          where: { id: transaction.donorId },
          data: { name: input.donorName },
        });
      }

      const result = await this.repository.update(id, data, tx);

      await auditService.record(
        {
          userId: currentUserId,
          entity: AuditEntity.TRANSACTION,
          action: AuditAction.UPDATE,
          entityId: result.id,
          entityLabel: result.receiptNumber,
          oldValue: JSON.parse(JSON.stringify(transaction)),
          newValue: JSON.parse(JSON.stringify(result)),
          ipAddress,
          userAgent,
        },
        tx,
      );

      return result;
    });

    logger.info('Transaction updated', { transactionId: id, updatedBy: currentUserId });

    return updated;
  }

  async cancel(id: string, currentUserId: string, ipAddress?: string, userAgent?: string) {
    const transaction = await this.ensureTransactionExists(id);

    if (transaction.status === TransactionStatus.CANCELLED) {
      throw new BadRequestError(TRANSACTION_MESSAGES.ALREADY_CANCELLED);
    }

    const cancelled = await prisma.$transaction(async (tx) => {
      const result = await this.repository.cancel(id, tx);

      await auditService.record(
        {
          userId: currentUserId,
          entity: AuditEntity.TRANSACTION,
          action: AuditAction.STATUS_CHANGE,
          entityId: result.id,
          entityLabel: result.receiptNumber,
          oldValue: { status: transaction.status },
          newValue: { status: result.status },
          ipAddress,
          userAgent,
        },
        tx,
      );

      return result;
    });

    logger.info('Transaction cancelled', { transactionId: id, cancelledBy: currentUserId });
    return cancelled;
  }

  // ---- private helpers ----

  private async ensureBuildingExists(buildingId: string): Promise<void> {
    const building = await buildingRepository.findById(buildingId);
    if (!building) {
      throw new NotFoundError(TRANSACTION_MESSAGES.BUILDING_NOT_FOUND);
    }
  }

  private async resolveBuildingId(input: CreateTransactionInput): Promise<string> {
    if (input.buildingId) {
      return input.buildingId;
    }

    if (!input.buildingNormalizedName) {
      throw new BadRequestError('buildingId or buildingNormalizedName is required');
    }

    const normalizedName = normalizeBuildingName(input.buildingNormalizedName);
    const building = await buildingRepository.findByNormalizedName(normalizedName);

    if (!building) {
      throw new NotFoundError(TRANSACTION_MESSAGES.BUILDING_NOT_FOUND);
    }

    return building.id;
  }

  private async ensureTransactionExists(id: string) {
    const transaction = await this.repository.findById(id);
    if (!transaction) {
      throw new NotFoundError(TRANSACTION_MESSAGES.NOT_FOUND);
    }
    return transaction;
  }

  private ensureEditable(status: TransactionStatus): void {
    if (status === TransactionStatus.CANCELLED) {
      throw new BadRequestError(TRANSACTION_MESSAGES.CANNOT_EDIT_CANCELLED);
    }
  }

  private async resolveFestival(year: number, currentUserId: string, tx: Prisma.TransactionClient) {
    const existing = await festivalRepository.findByYear(year, tx);
    if (existing) return existing;

    // Auto-created: there's no festival-management UI yet, so
    // startDate/endDate are placeholders (today) rather than a
    // real collection window. Revisit once one exists.
    const today = new Date();
    return festivalRepository.create(
      {
        year,
        name: `Ganpati Vargani ${year}`,
        startDate: today,
        endDate: today,
        status: 'ACTIVE',
        lastReceiptSeq: 0,
        createdById: currentUserId,
      },
      tx,
    );
  }

  private async resolveDonor(
    input: { mobile: string; name: string; buildingId: string; roomNumber: string },
    currentUserId: string,
    tx: Prisma.TransactionClient,
  ) {
    const existing = await donorRepository.findByMobileBuildingRoom(
      input.mobile,
      input.buildingId,
      input.roomNumber,
      tx,
    );
    // Deliberately not syncing name on a repeat visit — if the same
    // mobile+building+room shows up with a different name typed in
    // (different family member answered the door), the existing
    // Donor record wins. There's no donor-edit UI to reconcile this
    // properly yet; revisit if that becomes a real problem.
    if (existing) return existing;

    return donorRepository.create(
      {
        name: input.name,
        mobile: input.mobile,
        buildingId: input.buildingId,
        roomNumber: input.roomNumber,
        createdById: currentUserId,
      },
      tx,
    );
  }

  private async generateReceiptNumber(
    festivalId: string,
    year: number,
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const seq = await festivalRepository.incrementReceiptSeq(festivalId, tx);
    return `${RECEIPT_NUMBER_PREFIX}${year}-${String(seq).padStart(RECEIPT_SEQ_PAD_LENGTH, '0')}`;
  }

  private async sendReceipt(
    recipient: string | undefined,
    receiptDocument: ReceiptDocument,
    transaction: any,
  ): Promise<void> {
    const transactionId = transaction.id;

    if (!recipient) {
      logger.warn('Skipping WhatsApp delivery because donor mobile is missing', {
        transactionId,
      });
      return;
    }

    if (!this.messagingService.isEnabled()) {
      await this.repository.updateWhatsAppStatus(transactionId, WHATSAPP_SKIPPED_STATUS);

      logger.info('WhatsApp delivery skipped because messaging is disabled', {
        transactionId,
        recipient,
      });

      return;
    }

    try {
      const result: MessagingResult = await this.messagingService.sendReceiptDocument(
        transaction,
        receiptDocument,
        recipient,
      );

      if (!result.success) {
        await this.repository.updateWhatsAppStatus(transactionId, WhatsappStatus.FAILED);
        await this.repository.updateMessageMetadata(transactionId, {
          providerMediaId: result.providerMediaId,
          whatsappFailureReason: result.error ?? 'WhatsApp delivery failed',
        });

        logger.error('WhatsApp receipt delivery failed', {
          transactionId,
          recipient,
          error: result.error,
          providerName: result.providerName,
          providerMediaId: result.providerMediaId,
        });
        return;
      }

      await this.repository.updateMessageMetadata(transactionId, {
        providerMessageId: result.providerMessageId,
        providerMediaId: result.providerMediaId,
        whatsappFailureReason: null,
      });

      await this.repository.updateWhatsAppStatus(transactionId, WhatsappStatus.SENT);

      logger.info('WhatsApp message sent', {
        transactionId,
        recipient,
        providerMessageId: result.providerMessageId,
        providerMediaId: result.providerMediaId,
      });
    } catch (error) {
      await this.repository.updateWhatsAppStatus(transactionId, WhatsappStatus.FAILED);
      await this.repository.updateMessageMetadata(transactionId, {
        whatsappFailureReason: error instanceof Error ? error.message : 'Unexpected WhatsApp error',
      });

      logger.error('Unexpected error while sending WhatsApp receipt', {
        transactionId,
        recipient,
        error: error instanceof Error ? error.message : error,
      });
    }
  }
}

export const transactionService = new TransactionService();
