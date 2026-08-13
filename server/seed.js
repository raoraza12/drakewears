const prisma = require('./lib/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Clearing database...');
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding 5 premium products...');
  
  const sourceData = [
    { cat: 'Men', sub: 'Casual Wear', title: 'Urban Leather Jacket', img: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80', price: 17166 },
    { cat: 'Men', sub: 'Formal Wear', title: 'Tailored Oxford Shirt', img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80', price: 15449 },
    { cat: 'Women', sub: 'Eastern Pret', title: 'Embroidered Silk Kurti', img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', price: 17110 },
    { cat: 'Women', sub: 'Western Wear', title: 'Chic Summer Dress', img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80', price: 14690 },
    { cat: 'Accessories', sub: 'Watches', title: 'Luxury Chronograph Watch', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', price: 14480 }
  ];

  for (const item of sourceData) {
    await prisma.product.create({
      data: {
        name: item.title,
        slug: item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: 'Experience premium quality and unmatched style with our exclusive piece.',
        price: item.price,
        comparePrice: Math.round(item.price * 1.2),
        category: item.cat,
        subcategory: item.sub,
        images: [item.img],
        sizes: item.cat === 'Accessories' ? ['One Size'] : ['S', 'M', 'L', 'XL'],
        colors: [{name: 'Classic Black', hex: '#1a1a1a'}, {name: 'Pearl White', hex: '#f0f0f0'}],
        tags: ['Premium', 'Luxury', 'New'].sort(() => 0.5 - Math.random()).slice(0, 2),
        stock: 100,
        featured: true,
        newArrival: true,
        bestseller: true,
        rating: +(4.5 + Math.random() * 0.5).toFixed(1),
        numReviews: Math.floor(Math.random() * 300) + 10,
      }
    });
  }

  console.log('Seeding demo admin user...');
  const adminPass = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      name: 'Admin Noor',
      email: 'admin@luxe.com',
      password: adminPass,
      role: 'admin',
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
