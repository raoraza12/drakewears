const prisma = require('./lib/prisma');

async function main() {
  console.log('Restoring Grey Trousers...');
  const newProduct = await prisma.product.create({ 
    data: { 
      name: 'Grey Cyber Baggy Trousers', 
      slug: 'grey-cyber-baggy-trousers', 
      price: 2300, 
      category: 'Bottoms', 
      description: 'Premium grey baggy trousers.', 
      images: [
        'http://localhost:5000/uploads/product-1787392912369-984776930.jfif', 
        'http://localhost:5000/uploads/product-1787392912382-486665313.jfif'
      ], 
      stock: 50, 
      colors: [{name: 'Grey', hex: '#808080'}] 
    } 
  });
  
  console.log('Successfully restored:', newProduct.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
