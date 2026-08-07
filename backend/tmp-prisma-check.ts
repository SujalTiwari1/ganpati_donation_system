import 'dotenv/config';
import prisma from './src/database/prisma';

async function run() {
  try {
    console.log('starting check');
    const count = await prisma.transaction.count({ where: { status: 'CONFIRMED', deletedAt: null } });
    console.log('count', count);
    const agg = await prisma.transaction.aggregate({ where: { status: 'CONFIRMED', deletedAt: null }, _sum: { amount: true }, _count: true });
    console.log('aggregate', agg);
    const group = await prisma.transaction.groupBy({ by: ['paymentMethod'], where: { status: 'CONFIRMED', deletedAt: null }, _sum: { amount: true }, _count: true });
    console.log('groupBy', group);
    const recent = await prisma.transaction.findMany({ where: { status: 'CONFIRMED', deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 3, select: { id: true, amount: true } });
    console.log('recent', recent.length);
  } catch (error: any) {
    console.error('ERR NAME', error.name);
    console.error('ERR CODE', error.code);
    console.error('ERR MSG', error.message);
    console.error('ERR META', error.meta);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}
run();
