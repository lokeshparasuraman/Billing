import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing all existing products from database...');
  const deleted = await prisma.product.deleteMany({});
  console.log(`Successfully removed ${deleted.count} preloaded products from database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
