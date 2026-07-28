import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.product.deleteMany();
  console.log('Successfully cleared preloaded products. Deleted count:', result.count);
}

main()
  .catch((err) => {
    console.error('Error clearing products:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
