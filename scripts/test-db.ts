import { prisma } from '../lib/prisma';

async function main() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to the database');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 + 1 as result`;
    console.log('Query result:', result);
    
  } catch (e) {
    console.error('Error connecting to database:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
