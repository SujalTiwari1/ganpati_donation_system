import 'dotenv/config';
import prisma from './src/database/prisma';
(async () => {
  try {
    console.log('raw query start');
    const res = await prisma.$queryRaw`SELECT 1 as ok`;
    console.log('res', res);
  } catch (error: any) {
    console.error('ERR', error.name, error.code, error.message, error.meta);
  } finally {
    await prisma.$disconnect();
  }
})();
