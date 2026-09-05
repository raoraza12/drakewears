const prisma = require('./lib/prisma');

async function main() {
  console.log('Updating Ghost Thorn color to Red...');
  const updatedProduct = await prisma.product.update({ 
    where: { slug: 'ghost-thorn-cyber-baggy-trousers' },
    data: { 
      colors: [{name: 'Red', hex: '#FF0000'}]
    } 
  });
  
  console.log('Successfully updated:', updatedProduct.name, updatedProduct.colors);
}

main().catch(console.error).finally(() => prisma.$disconnect());
