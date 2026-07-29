import 'dotenv/config';
import prisma from './src/database/prisma';
import { transactionService } from './src/modules/transactions/transaction.service';

(async () => {
  try {
    const user = await prisma.user.findFirst();
    const building = await prisma.building.findFirst();
    console.log('user', user?.id);
    console.log('building', building?.id, building?.normalizedName);
    if (!user || !building) {
      console.error('Missing seed user/building');
      process.exit(1);
    }
    const input = {
      buildingNormalizedName: building.normalizedName,
      donorName: 'John Doe',
      mobile: '8898827525',
      roomNumber: 'A-103',
      amount: 501,
      paymentMethod: 'UPI',
      year: 2026,
      overrideDuplicate: false,
      duplicateOverrideReason: 'Optional if overrideDuplicate true',
    };
    const result = await transactionService.create(input as any, user.id, '127.0.0.1', 'test-agent');
    console.log('result', result);
  } catch (error) {
    console.error('error type', error?.constructor?.name);
    console.error(error);
    if (error && error.code) console.error('code', error.code);
    if (error && error.meta) console.error('meta', error.meta);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
