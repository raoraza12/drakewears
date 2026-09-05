const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: { name: true, colors: true }
  });
  console.dir(products, { depth: null });
}
main().finally(() => prisma.$disconnect());
