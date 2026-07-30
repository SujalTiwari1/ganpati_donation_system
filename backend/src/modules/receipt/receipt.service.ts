import { PaymentMethod } from '@prisma/client';

import { InternalServerError, NotFoundError } from '../../shared/errors';

import { RECEIPT_MESSAGES, RECEIPT_PATHS } from './receipt.constants';

import { ReceiptTemplateData, ReceiptTransaction } from './receipt.types';

import { receiptRepository } from './receipt.repository';

import { amountToWords, formatCurrency } from './utils/currency.util';

import { formatReceiptDate, formatReceiptTime } from './utils/date.util';

import { renderTemplate } from './utils/template-renderer';

import { pdfGenerator } from './utils/pdf-generator';

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  UPI: 'UPI',
  CHEQUE: 'Cheque',
  BANK_TRANSFER: 'Bank Transfer',
  CARD: 'Card',
  OTHER: 'Other',
};

export interface ReceiptDocument {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}

export class ReceiptService {
  async generateReceipt(transactionId: string): Promise<ReceiptDocument> {
    try {
      const transaction = await receiptRepository.getReceiptData(transactionId);

      if (!transaction) {
        throw new NotFoundError(RECEIPT_MESSAGES.NOT_FOUND);
      }

      const templateData = this.buildTemplateData(transaction);

      const html = await renderTemplate(RECEIPT_PATHS.TEMPLATE, templateData);

      const buffer = await pdfGenerator.generate({
        html,
        cssPath: RECEIPT_PATHS.CSS,
      });

      return {
        buffer,
        fileName: `${transaction.receiptNumber}.pdf`,
        mimeType: 'application/pdf',
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new InternalServerError('Unable to generate receipt.');
    }
  }

  private buildTemplateData(transaction: ReceiptTransaction): ReceiptTemplateData {
    return {
      receiptNumber: transaction.receiptNumber,

      donorName: transaction.donor.name,

      donorMobile: transaction.donor.mobile,

      buildingName: transaction.building.name,

      roomNumber: transaction.roomNumber,

      amount: formatCurrency(transaction.amount),

      amountInWords: amountToWords(transaction.amount),

      paymentMethod: PAYMENT_METHOD_LABEL[transaction.paymentMethod],

      donationDate: formatReceiptDate(transaction.donationDate),

      donationTime: formatReceiptTime(transaction.createdAt),

      volunteerName: transaction.volunteer.name,

      festivalName: transaction.festival.name,
    };
  }
}

export const receiptService = new ReceiptService();
