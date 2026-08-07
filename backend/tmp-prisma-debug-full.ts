import 'dotenv/config';
import prisma from './src/database/prisma';

(async () => {
  try {
    console.log('connecting...');
    await prisma.$connect();
    console.log('connected');
    const count = await prisma.transaction.count({ where: { status: 'CONFIRMED', deletedAt: null } });
    console.log('count', count);
  } catch (error: any) {
    console.error('NAME', error.name);
    console.error('CODE', error.code);
    console.error('MESSAGE', error.message);
    console.error('META', error.meta);
    console.error('CAUSE', error.cause);
    console.error('ORIGINAL', error.original);
    console.error('FULL', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error('DIR', util.inspect(error, { depth: 5 }));
  } finally {
    await prisma.$disconnect();
  }
})();
