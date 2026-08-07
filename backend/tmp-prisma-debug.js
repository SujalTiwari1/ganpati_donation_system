require('dotenv/config');
const prisma = require('./src/database/prisma').default;
(async () => {
  try {
    console.log('calling aggregate');
    const result = await prisma.transaction.aggregate({
      where: { status: 'CONFIRMED', deletedAt: null },
      _sum: { amount: true },
      _count: true,
    });
    console.log('AGG RESULT', result);
  } catch (error) {
    console.error('ERROR NAME', error.name);
    console.error('ERROR CODE', error.code);
    console.error('ERROR MESSAGE', error.message);
    console.error('ERROR META', error.meta);
    console.error('ERROR STACK', error.stack);
  } finally {
    await prisma.$disconnect();
  }
})();
