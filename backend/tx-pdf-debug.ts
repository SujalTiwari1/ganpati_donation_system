import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { renderTemplate } from './src/modules/receipt/utils/template-renderer';
import { pdfGenerator } from './src/modules/receipt/utils/pdf-generator';
import { RECEIPT_PATHS } from './src/modules/receipt/receipt.constants';

(async () => {
  try {
    const html = await renderTemplate(RECEIPT_PATHS.TEMPLATE, {
      receiptNumber: '2026-000001',
      donorName: 'John Doe',
      donorMobile: '8898827525',
      buildingName: 'Wing B',
      roomNumber: 'A-103',
      amount: '₹501.00',
      amountInWords: 'Five Hundred One Rupees Only',
      paymentMethod: 'UPI',
      donationDate: '29-07-2026',
      donationTime: '19:00',
      volunteerName: 'Volunteer',
      festivalName: 'Ganpati Vargani 2026',
    });
    console.log('html length', html.length);
    const buffer = await pdfGenerator.generate({
      html,
      cssPath: RECEIPT_PATHS.CSS,
    });
    console.log('buffer length', buffer.length);
  } catch (error) {
    console.error('ERROR', error);
    console.error('STACK', error?.stack);
    process.exit(1);
  }
})();
