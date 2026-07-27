import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Clean product catalog - Owner will add their own products & services
const sampleProducts: any[] = [];

async function main() {
  console.log("Starting Prisma seed for Owshika Enterprises...");

  if (sampleProducts.length > 0) {
    console.log(`Seeding ${sampleProducts.length} products...`);
    for (const prod of sampleProducts) {
      await prisma.product.upsert({
        where: { partNumber: prod.partNumber },
        update: prod,
        create: prod,
      });
    }
  } else {
    console.log("Clean initial catalog ready. Owner can add custom products & services.");
  }

  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
