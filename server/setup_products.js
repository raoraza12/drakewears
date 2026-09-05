const prisma = require('./lib/prisma');

async function main() {
  console.log('Deleting all products...');
  await prisma.product.deleteMany();
  
  console.log('Adding Ghost Thorn Trousers...');
  const newProduct = await prisma.product.create({ 
    data: { 
      name: 'Ghost Thorn Cyber Baggy Trousers', 
      slug: 'ghost-thorn-cyber-baggy-trousers', 
      price: 2300, 
      category: 'Bottoms', 
      description: 'Ghost Thorn Cyber Baggy Trousers - Premium quality streetwear.', 
      images: [
        'http://localhost:5000/uploads/ghost_thorn.jpg', 
        'https://images.unsplash.com/photo-1604136172384-b2e9c43271ec?auto=format&fit=crop&q=80&w=800'
      ], 
      stock: 50, 
      colors: [{name: 'White', hex: '#ffffff'}] 
    } 
  });
  
  console.log('Successfully added:', newProduct.name);
  
  const allProducts = await prisma.product.findMany();
  console.log('Total products in DB:', allProducts.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
