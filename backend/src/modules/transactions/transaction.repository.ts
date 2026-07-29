import { Prisma, TransactionStatus, WhatsappStatus } from '@prisma/client';

import { prisma } from '../../database';

import type { TransactionListQuery } from './transaction.schema';

const WITH_RELATIONS = {
  donor: {
    select: { id: true, name: true, mobile: true, roomNumber: true },
  },
  building: {
    select: { id: true, name: true },
  },
} satisfies Prisma.TransactionInclude;

export class TransactionRepository {
  async create(
    data: Prisma.TransactionUncheckedCreateInput,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.transaction.create({ data });
  }

  async updateReceiptStatus(
    id: string,
    receiptGenerated: boolean,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.transaction.update({
      where: { id },
      data: { receiptGenerated },
    });
  }

  async updateWhatsAppStatus(
    id: string,
    whatsappStatus: WhatsappStatus,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.transaction.update({
      where: { id },
      data: { whatsappStatus },
    });
  }

  async updateMessageMetadata(
    id: string,
    data: {
      providerMessageId?: string | null;
      providerMediaId?: string | null;
      whatsappDeliveredAt?: Date | null;
      whatsappReadAt?: Date | null;
      whatsappFailureReason?: string | null;
    },
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.transaction.update({
      where: { id },
      data: {
        ...(data.providerMessageId !== undefined && { providerMessageId: data.providerMessageId }),
        ...(data.providerMediaId !== undefined && { providerMediaId: data.providerMediaId }),
        ...(data.whatsappDeliveredAt !== undefined && {
          whatsappDeliveredAt: data.whatsappDeliveredAt,
        }),
        ...(data.whatsappReadAt !== undefined && { whatsappReadAt: data.whatsappReadAt }),
        ...(data.whatsappFailureReason !== undefined && {
          whatsappFailureReason: data.whatsappFailureReason,
        }),
      },
    });
  }

  async findById(id: string) {
    return prisma.transaction.findFirst({
      where: { id, deletedAt: null },
      include: WITH_RELATIONS,
    });
  }

  async findByProviderMessageId(providerMessageId: string) {
    return prisma.transaction.findFirst({
      where: { providerMessageId, deletedAt: null },
      select: {
        id: true,
        receiptNumber: true,
        whatsappStatus: true,
        providerMessageId: true,
        providerMediaId: true,
      },
    });
  }

  /**
   * Used by the duplicate-collection guard: is there already an
   * active (non-cancelled) transaction for this exact room, this
   * festival? Matches idx_transactions_dup_check.
   */
  async findActiveDuplicate(
    festivalId: string,
    buildingId: string,
    roomNumber: string,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.transaction.findFirst({
      where: {
        festivalId,
        buildingId,
        roomNumber,
        deletedAt: null,
        status: { not: TransactionStatus.CANCELLED },
      },
    });
  }

  async update(
    id: string,
    data: Prisma.TransactionUpdateInput,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.transaction.update({
      where: { id },
      data,
      include: WITH_RELATIONS,
    });
  }

  async cancel(id: string, tx: Prisma.TransactionClient = prisma) {
    return tx.transaction.update({
      where: { id },
      data: { status: TransactionStatus.CANCELLED },
      include: WITH_RELATIONS,
    });
  }

  async list(query: TransactionListQuery) {
    return prisma.transaction.findMany({
      where: this.buildWhere(query),
      include: WITH_RELATIONS,
      orderBy: { [query.sortBy ?? 'donationDate']: query.sortOrder ?? 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
  }

  async count(query: TransactionListQuery) {
    return prisma.transaction.count({ where: this.buildWhere(query) });
  }

  private buildWhere(query: TransactionListQuery): Prisma.TransactionWhereInput {
    return {
      deletedAt: null,
      ...(query.paymentMethod && { paymentMethod: query.paymentMethod }),
      ...(query.status && { status: query.status }),
      ...(query.year && { festival: { year: query.year } }),
      ...((query.fromDate || query.toDate) && {
        donationDate: {
          ...(query.fromDate && { gte: query.fromDate }),
          ...(query.toDate && { lte: query.toDate }),
        },
      }),
      ...(query.search && {
        OR: [
          { receiptNumber: { contains: query.search, mode: 'insensitive' as const } },
          { donor: { name: { contains: query.search, mode: 'insensitive' as const } } },
          { donor: { mobile: { contains: query.search } } },
        ],
      }),
    };
  }
}

export const transactionRepository = new TransactionRepository();
