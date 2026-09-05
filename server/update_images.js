const prisma = require('./lib/prisma');

async function main() {
  console.log('Updating Ghost Thorn Trousers with actual user images...');
  const updatedProduct = await prisma.product.update({ 
    where: { slug: 'ghost-thorn-cyber-baggy-trousers' },
    data: { 
      images: [
        'http://localhost:5000/uploads/ghost_thorn_1.png', 
        'http://localhost:5000/uploads/ghost_thorn_2.png'
      ]
    } 
  });
  
  console.log('Successfully updated:', updatedProduct.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
