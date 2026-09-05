const prisma = require('./lib/prisma');
const bcrypt = require('bcryptjs');

const unsplashMen = [
  'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&q=80',
  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80',
  'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
];
const unsplashWomen = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80',
  'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=80',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80',
];
const unsplashKids = [
  'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600&q=80',
  'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&q=80',
  'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&q=80',
];
const unsplashAcc = [
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&q=80',
];

const products = [
  { name: 'Obsidian Slim Suit', slug: 'obsidian-slim-suit', description: 'A masterfully tailored slim-fit suit in premium obsidian wool blend. Perfect for boardrooms and black-tie events.', price: 28999, comparePrice: 35000, category: 'Men', subcategory: 'Suits', images: [unsplashMen[0], unsplashMen[1]], sizes: ['S','M','L','XL','XXL'], colors: [{name:'Black',hex:'#1a1a1a'},{name:'Charcoal',hex:'#36454F'}], stock: 45, featured: true, bestseller: true, material: '80% Wool, 20% Polyester', care: 'Dry clean only', tags: ['suit','formal','premium'], rating: 4.8, numReviews: 124 },
  { name: 'Ivory Linen Blazer', slug: 'ivory-linen-blazer', description: 'Breathable linen blazer for sophisticated summer looks. Crafted with Italian linen for ultimate comfort.', price: 14999, comparePrice: 18500, category: 'Men', subcategory: 'Blazers', images: [unsplashMen[1], unsplashMen[0]], sizes: ['S','M','L','XL'], colors: [{name:'Ivory',hex:'#FFFFF0'},{name:'Beige',hex:'#F5F5DC'}], stock: 30, featured: true, newArrival: true, material: '100% Linen', care: 'Hand wash cold', tags: ['blazer','summer','linen'], rating: 4.6, numReviews: 87 },
  { name: 'Midnight Oxford Shirt', slug: 'midnight-oxford-shirt', description: 'Classic Oxford weave shirt in deep midnight blue. Versatile enough for casual and semi-formal occasions.', price: 5499, comparePrice: 7000, category: 'Men', subcategory: 'Shirts', images: [unsplashMen[2], unsplashMen[3]], sizes: ['S','M','L','XL','XXL','XXXL'], colors: [{name:'Navy',hex:'#000080'},{name:'White',hex:'#FFFFFF'},{name:'Slate',hex:'#708090'}], stock: 100, bestseller: true, material: '100% Cotton', care: 'Machine wash cold', tags: ['shirt','oxford','casual'], rating: 4.7, numReviews: 203 },
  { name: 'Noir Cargo Trousers', slug: 'noir-cargo-trousers', description: 'Contemporary cargo trousers with utility pockets. Combines streetwear aesthetics with everyday comfort.', price: 6999, comparePrice: 9000, category: 'Men', subcategory: 'Trousers', images: [unsplashMen[3], unsplashMen[4]], sizes: ['S','M','L','XL','XXL'], colors: [{name:'Black',hex:'#1a1a1a'},{name:'Olive',hex:'#556B2F'},{name:'Khaki',hex:'#C3B091'}], stock: 75, newArrival: true, material: '98% Cotton, 2% Elastane', care: 'Machine wash', tags: ['cargo','streetwear','trousers'], rating: 4.5, numReviews: 156 },
  { name: 'Premium Cashmere Sweater', slug: 'premium-cashmere-sweater', description: 'Luxuriously soft cashmere sweater. Timeless design that elevates any outfit with effortless elegance.', price: 19999, comparePrice: 25000, category: 'Men', subcategory: 'Knitwear', images: [unsplashMen[4], unsplashMen[0]], sizes: ['S','M','L','XL'], colors: [{name:'Camel',hex:'#C19A6B'},{name:'Burgundy',hex:'#800020'},{name:'Forest',hex:'#228B22'}], stock: 25, featured: true, material: '100% Pure Cashmere', care: 'Dry clean recommended', tags: ['cashmere','luxury','sweater'], rating: 4.9, numReviews: 98 },

  { name: 'Celestial Silk Dress', slug: 'celestial-silk-dress', description: 'Flowing silk midi dress with celestial print. A breathtaking statement piece for special occasions.', price: 18999, comparePrice: 24000, category: 'Women', subcategory: 'Dresses', images: [unsplashWomen[0], unsplashWomen[1]], sizes: ['XS','S','M','L','XL'], colors: [{name:'Emerald',hex:'#50C878'},{name:'Sapphire',hex:'#0F52BA'},{name:'Rose Gold',hex:'#B76E79'}], stock: 35, featured: true, bestseller: true, material: '100% Pure Silk', care: 'Dry clean only', tags: ['dress','silk','formal','luxury'], rating: 4.9, numReviews: 187 },
  { name: 'Golden Hour Maxi Dress', slug: 'golden-hour-maxi-dress', description: 'Stunning maxi dress in rich golden tones perfect for evening events and beach outings alike.', price: 12499, comparePrice: 16000, category: 'Women', subcategory: 'Dresses', images: [unsplashWomen[1], unsplashWomen[2]], sizes: ['XS','S','M','L','XL'], colors: [{name:'Gold',hex:'#FFD700'},{name:'Sunset',hex:'#FF4500'},{name:'Coral',hex:'#FF6B6B'}], stock: 50, newArrival: true, featured: true, material: 'Georgette', care: 'Hand wash', tags: ['maxi','evening','summer'], rating: 4.7, numReviews: 142 },
  { name: 'Ivory Lace Blouse', slug: 'ivory-lace-blouse', description: 'Delicately crafted lace blouse with intricate floral patterns. A feminine essential for your wardrobe.', price: 7999, comparePrice: 10000, category: 'Women', subcategory: 'Tops', images: [unsplashWomen[2], unsplashWomen[3]], sizes: ['XS','S','M','L','XL','XXL'], colors: [{name:'Ivory',hex:'#FFFFF0'},{name:'Blush',hex:'#FFB6C1'},{name:'Black',hex:'#1a1a1a'}], stock: 60, bestseller: true, material: 'Cotton Lace', care: 'Gentle machine wash', tags: ['blouse','lace','feminine'], rating: 4.6, numReviews: 223 },
  { name: 'Power Suit — Women', slug: 'women-power-suit', description: 'A commanding three-piece power suit designed for modern women who lead. Impeccably tailored for confidence.', price: 24999, comparePrice: 32000, category: 'Women', subcategory: 'Suits', images: [unsplashWomen[3], unsplashWomen[4]], sizes: ['XS','S','M','L','XL'], colors: [{name:'Charcoal',hex:'#36454F'},{name:'Ivory',hex:'#FFFFF0'},{name:'Deep Red',hex:'#8B0000'}], stock: 20, featured: true, newArrival: true, material: 'Wool Blend', care: 'Dry clean only', tags: ['suit','formal','women','power'], rating: 4.8, numReviews: 76 },
  { name: 'Velvet Midnight Gown', slug: 'velvet-midnight-gown', description: 'An elegant floor-length velvet gown exuding old-world glamour. Perfect for galas and upscale events.', price: 32999, comparePrice: 42000, category: 'Women', subcategory: 'Gowns', images: [unsplashWomen[4], unsplashWomen[0]], sizes: ['XS','S','M','L','XL'], colors: [{name:'Midnight Blue',hex:'#191970'},{name:'Burgundy',hex:'#800020'},{name:'Emerald',hex:'#50C878'}], stock: 15, featured: true, bestseller: true, material: 'Crushed Velvet', care: 'Dry clean only', tags: ['gown','velvet','luxury','evening'], rating: 5.0, numReviews: 58 },

  { name: 'Mini Explorer Set', slug: 'mini-explorer-set', description: 'Adventure-ready outfit set for little explorers. Durable yet stylish with fun prints and vibrant colors.', price: 3999, comparePrice: 5000, category: 'Kids', subcategory: 'Sets', images: [unsplashKids[0], unsplashKids[1]], sizes: ['XS','S','M','L'], colors: [{name:'Blue',hex:'#4169E1'},{name:'Green',hex:'#32CD32'},{name:'Orange',hex:'#FF8C00'}], stock: 80, newArrival: true, material: '100% Cotton', care: 'Machine wash warm', tags: ['kids','set','casual'], rating: 4.7, numReviews: 94 },
  { name: 'Rainbow Unicorn Dress', slug: 'rainbow-unicorn-dress', description: 'Magical unicorn-themed dress with rainbow tulle. Your little princess will love twirling in this dreamlike outfit.', price: 4999, comparePrice: 6500, category: 'Kids', subcategory: 'Dresses', images: [unsplashKids[1], unsplashKids[2]], sizes: ['XS','S','M','L'], colors: [{name:'Pink',hex:'#FFB6C1'},{name:'Lavender',hex:'#E6E6FA'}], stock: 45, featured: true, bestseller: true, material: 'Polyester Tulle', care: 'Hand wash cold', tags: ['kids','dress','princess','unicorn'], rating: 4.9, numReviews: 167 },
  { name: 'Denim Stars Jacket', slug: 'denim-stars-jacket', description: 'Cool denim jacket with star embroidery for trendy little ones. Built tough for active kids.', price: 5499, comparePrice: 7000, category: 'Kids', subcategory: 'Jackets', images: [unsplashKids[2], unsplashKids[0]], sizes: ['XS','S','M','L'], colors: [{name:'Blue Denim',hex:'#4169E1'},{name:'Black Denim',hex:'#1a1a1a'}], stock: 55, newArrival: true, material: 'Denim', care: 'Machine wash', tags: ['kids','denim','jacket'], rating: 4.6, numReviews: 89 },

  { name: 'Artisan Leather Tote', slug: 'artisan-leather-tote', description: 'Hand-stitched full-grain leather tote bag. Spacious, structured and effortlessly luxurious.', price: 26999, comparePrice: 35000, category: 'Accessories', subcategory: 'Bags', images: [unsplashAcc[0], unsplashAcc[1]], sizes: ['Free Size'], colors: [{name:'Cognac',hex:'#9A4522'},{name:'Black',hex:'#1a1a1a'},{name:'Tan',hex:'#D2B48C'}], stock: 25, featured: true, bestseller: true, material: 'Full-Grain Leather', care: 'Leather conditioner recommended', tags: ['bag','leather','tote','luxury'], rating: 4.9, numReviews: 143 },
  { name: 'Silk Scarf Collection', slug: 'silk-scarf-collection', description: 'Hand-painted silk scarves featuring exclusive DRAKEWEARS patterns. Wear as scarf, belt or bag accessory.', price: 8999, comparePrice: 12000, category: 'Accessories', subcategory: 'Scarves', images: [unsplashAcc[1], unsplashAcc[0]], sizes: ['Free Size'], colors: [{name:'Multicolor',hex:'#FF69B4'},{name:'Gold',hex:'#FFD700'},{name:'Navy',hex:'#000080'}], stock: 60, newArrival: true, featured: true, material: '100% Silk', care: 'Dry clean only', tags: ['scarf','silk','accessory'], rating: 4.8, numReviews: 211 },
];

async function seed() {
  try {
    console.log('✨ Starting database seed...');
    
    // Clear existing data (orders/reviews first due to FKs)
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.coupon.deleteMany({});
    
    console.log('🗑️  Cleared existing data.');

    // Seed Products
    for (const p of products) {
        await prisma.product.create({ data: p });
    }
    console.log(`✅ Seeded ${products.length} products`);

    // Seed Users (Manually hash passwords)
    const adminPassword = await bcrypt.hash('huzaifaraza123', 12);
    const userPassword = await bcrypt.hash('test1234', 12);

    await prisma.user.create({
      data: { name: 'Admin User', email: 'raoraza5417@gmail.com', password: adminPassword, role: 'admin' }
    });
    await prisma.user.create({
      data: { name: 'Test User', email: 'test@drakewears.com', password: userPassword, role: 'user' }
    });

    console.log('✅ Seeded admin and test users');
    
    // Seed a Coupon
    await prisma.coupon.create({
        data: {
            code: 'DRAKEWEARS10',
            discountType: 'percentage',
            discountValue: 10,
            minPurchaseAmount: 1000,
            expirationDate: new Date('2026-12-31'),
            isActive: true
        }
    });
    console.log('✅ Seeded sample coupon');

    console.log('✨ Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
