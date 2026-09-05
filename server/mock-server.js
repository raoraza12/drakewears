// Mock server - runs WITHOUT MongoDB for demo purposes
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const app = express();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const JWT_SECRET = 'drakewears_demo_secret_2024';
const PORT = 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// ── MOCK DATA ─────────────────────────────────────────────────
const productsData = [
  {
    _id: "prd_ghost_thorn_1",
    id: "prd_ghost_thorn_1",
    name: "Ghost Thorn Cyber Baggy Trousers",
    slug: "ghost-thorn-cyber-baggy-trousers",
    price: 2300,
    comparePrice: 3000,
    category: "Bottoms",
    rating: 5,
    numReviews: 12,
    images: [
      "http://localhost:5000/uploads/ghost_thorn.jpg",
      "https://images.unsplash.com/photo-1604136172384-b2e9c43271ec?auto=format&fit=crop&q=80&w=800" // Placeholder for hover until user uploads
    ],
    colors: [{ name: "White", hex: "#ffffff" }],
    sizes: ["S", "M", "L", "XL"],
    stock: 50,
    newArrival: true,
    bestseller: true
  },
  { _id: '1', name: 'Obsidian Slim Suit', slug: 'obsidian-slim-suit', description: 'A masterfully tailored slim-fit suit in premium obsidian wool blend. Perfect for boardrooms and black-tie events.', price: 28999, comparePrice: 35000, category: 'Men', subcategory: 'Suits', images: ['https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&q=80','https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80'], sizes: ['S','M','L','XL','XXL'], colors: [{name:'Black',hex:'#1a1a1a'},{name:'Charcoal',hex:'#36454F'}], stock: 45, featured: true, bestseller: true, newArrival: false, material: '80% Wool, 20% Polyester', care: 'Dry clean only', tags: ['suit','formal'], rating: 4.8, numReviews: 124, reviews: [] },
  { _id: '2', name: 'Ivory Linen Blazer', slug: 'ivory-linen-blazer', description: 'Breathable linen blazer for sophisticated summer looks. Crafted with Italian linen for ultimate comfort.', price: 14999, comparePrice: 18500, category: 'Men', subcategory: 'Blazers', images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80','https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&q=80'], sizes: ['S','M','L','XL'], colors: [{name:'Ivory',hex:'#FFFFF0'},{name:'Beige',hex:'#F5F5DC'}], stock: 30, featured: true, newArrival: true, bestseller: false, material: '100% Linen', care: 'Hand wash cold', tags: ['blazer','summer'], rating: 4.6, numReviews: 87, reviews: [] },
  { _id: '3', name: 'Midnight Oxford Shirt', slug: 'midnight-oxford-shirt', description: 'Classic Oxford weave shirt in deep midnight blue. Versatile enough for casual and semi-formal occasions.', price: 5499, comparePrice: 7000, category: 'Men', subcategory: 'Shirts', images: ['https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80','https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'], sizes: ['S','M','L','XL','XXL','XXXL'], colors: [{name:'Navy',hex:'#000080'},{name:'White',hex:'#FFFFFF'},{name:'Slate',hex:'#708090'}], stock: 100, featured: false, bestseller: true, newArrival: false, material: '100% Cotton', care: 'Machine wash cold', tags: ['shirt','oxford'], rating: 4.7, numReviews: 203, reviews: [] },
  { _id: '4', name: 'Noir Cargo Trousers', slug: 'noir-cargo-trousers', description: 'Contemporary cargo trousers with utility pockets. Combines streetwear aesthetics with everyday comfort.', price: 6999, comparePrice: 9000, category: 'Men', subcategory: 'Trousers', images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80','https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80'], sizes: ['S','M','L','XL','XXL'], colors: [{name:'Black',hex:'#1a1a1a'},{name:'Olive',hex:'#556B2F'}], stock: 75, featured: false, newArrival: true, bestseller: false, material: '98% Cotton, 2% Elastane', care: 'Machine wash', tags: ['cargo','streetwear'], rating: 4.5, numReviews: 156, reviews: [] },
  { _id: '5', name: 'Premium Cashmere Sweater', slug: 'premium-cashmere-sweater', description: 'Luxuriously soft cashmere sweater. Timeless design that elevates any outfit with effortless elegance.', price: 19999, comparePrice: 25000, category: 'Men', subcategory: 'Knitwear', images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80'], sizes: ['S','M','L','XL'], colors: [{name:'Camel',hex:'#C19A6B'},{name:'Burgundy',hex:'#800020'}], stock: 25, featured: true, bestseller: false, newArrival: false, material: '100% Pure Cashmere', care: 'Dry clean', tags: ['cashmere','luxury'], rating: 4.9, numReviews: 98, reviews: [] },
  { _id: '6', name: 'Celestial Silk Dress', slug: 'celestial-silk-dress', description: 'Flowing silk midi dress with celestial print. A breathtaking statement piece for special occasions.', price: 18999, comparePrice: 24000, category: 'Women', subcategory: 'Dresses', images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80','https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80'], sizes: ['XS','S','M','L','XL'], colors: [{name:'Emerald',hex:'#50C878'},{name:'Sapphire',hex:'#0F52BA'}], stock: 35, featured: true, bestseller: true, newArrival: false, material: '100% Pure Silk', care: 'Dry clean only', tags: ['dress','silk','luxury'], rating: 4.9, numReviews: 187, reviews: [] },
  { _id: '7', name: 'Golden Hour Maxi Dress', slug: 'golden-hour-maxi-dress', description: 'Stunning maxi dress in rich golden tones perfect for evening events and beach outings alike.', price: 12499, comparePrice: 16000, category: 'Women', subcategory: 'Dresses', images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80','https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80'], sizes: ['XS','S','M','L','XL'], colors: [{name:'Gold',hex:'#FFD700'},{name:'Coral',hex:'#FF6B6B'}], stock: 50, newArrival: true, featured: true, bestseller: false, material: 'Georgette', care: 'Hand wash', tags: ['maxi','evening'], rating: 4.7, numReviews: 142, reviews: [] },
  { _id: '8', name: 'Ivory Lace Blouse', slug: 'ivory-lace-blouse', description: 'Delicately crafted lace blouse with intricate floral patterns. A feminine essential for your wardrobe.', price: 7999, comparePrice: 10000, category: 'Women', subcategory: 'Tops', images: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80','https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=80'], sizes: ['XS','S','M','L','XL','XXL'], colors: [{name:'Ivory',hex:'#FFFFF0'},{name:'Blush',hex:'#FFB6C1'}], stock: 60, featured: false, bestseller: true, newArrival: false, material: 'Cotton Lace', care: 'Gentle machine wash', tags: ['blouse','lace'], rating: 4.6, numReviews: 223, reviews: [] },
  { _id: '9', name: 'Power Suit — Women', slug: 'women-power-suit', description: 'A commanding three-piece power suit designed for modern women who lead. Impeccably tailored for confidence.', price: 24999, comparePrice: 32000, category: 'Women', subcategory: 'Suits', images: ['https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=80','https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80'], sizes: ['XS','S','M','L','XL'], colors: [{name:'Charcoal',hex:'#36454F'},{name:'Deep Red',hex:'#8B0000'}], stock: 20, featured: true, newArrival: true, bestseller: false, material: 'Wool Blend', care: 'Dry clean only', tags: ['suit','formal','women'], rating: 4.8, numReviews: 76, reviews: [] },
  { _id: '10', name: 'Velvet Midnight Gown', slug: 'velvet-midnight-gown', description: 'An elegant floor-length velvet gown exuding old-world glamour. Perfect for galas and upscale events.', price: 32999, comparePrice: 42000, category: 'Women', subcategory: 'Gowns', images: ['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80'], sizes: ['XS','S','M','L','XL'], colors: [{name:'Midnight Blue',hex:'#191970'},{name:'Burgundy',hex:'#800020'}], stock: 15, featured: true, bestseller: true, newArrival: false, material: 'Crushed Velvet', care: 'Dry clean only', tags: ['gown','luxury'], rating: 5.0, numReviews: 58, reviews: [] },
  { _id: '11', name: 'Mini Explorer Set', slug: 'mini-explorer-set', description: 'Adventure-ready outfit set for little explorers. Durable yet stylish with fun prints and vibrant colors.', price: 3999, comparePrice: 5000, category: 'Kids', subcategory: 'Sets', images: ['https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600&q=80','https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&q=80'], sizes: ['XS','S','M','L'], colors: [{name:'Blue',hex:'#4169E1'},{name:'Green',hex:'#32CD32'}], stock: 80, newArrival: true, featured: false, bestseller: false, material: '100% Cotton', care: 'Machine wash warm', tags: ['kids'], rating: 4.7, numReviews: 94, reviews: [] },
  { _id: '12', name: 'Rainbow Unicorn Dress', slug: 'rainbow-unicorn-dress', description: 'Magical unicorn-themed dress with rainbow tulle. Your little princess will love twirling in this dreamlike outfit.', price: 4999, comparePrice: 6500, category: 'Kids', subcategory: 'Dresses', images: ['https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&q=80','https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&q=80'], sizes: ['XS','S','M','L'], colors: [{name:'Pink',hex:'#FFB6C1'},{name:'Lavender',hex:'#E6E6FA'}], stock: 45, featured: true, bestseller: true, newArrival: false, material: 'Polyester Tulle', care: 'Hand wash cold', tags: ['kids','princess'], rating: 4.9, numReviews: 167, reviews: [] },
  { _id: '13', name: 'Artisan Leather Tote', slug: 'artisan-leather-tote', description: 'Hand-stitched full-grain leather tote bag. Spacious, structured and effortlessly luxurious.', price: 26999, comparePrice: 35000, category: 'Accessories', subcategory: 'Bags', images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80','https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&q=80'], sizes: ['Free Size'], colors: [{name:'Cognac',hex:'#9A4522'},{name:'Black',hex:'#1a1a1a'}], stock: 25, featured: true, bestseller: true, newArrival: false, material: 'Full-Grain Leather', care: 'Leather conditioner', tags: ['bag','leather'], rating: 4.9, numReviews: 143, reviews: [] },
  { _id: '14', name: 'Silk Scarf Collection', slug: 'silk-scarf-collection', description: 'Hand-painted silk scarves featuring exclusive DRAKEWEARS patterns. Wear as scarf, belt or bag accessory.', price: 8999, comparePrice: 12000, category: 'Accessories', subcategory: 'Scarves', images: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&q=80','https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80'], sizes: ['Free Size'], colors: [{name:'Multicolor',hex:'#FF69B4'},{name:'Gold',hex:'#FFD700'}], stock: 60, newArrival: true, featured: true, bestseller: false, material: '100% Silk', care: 'Dry clean only', tags: ['scarf','silk'], rating: 4.8, numReviews: 211, reviews: [] },
];

const usersData = [
  { _id: 'admin1', name: 'Admin User', email: 'raoraza5417@gmail.com', passwordHash: bcrypt.hashSync('huzaifaraza123', 10), role: 'admin', wishlist: [], addresses: [] },
  { _id: 'user1', name: 'Test User', email: 'test@drakewears.com', passwordHash: bcrypt.hashSync('test1234', 10), role: 'user', wishlist: [], addresses: [] },
];
const ordersData = [];

const genToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ message: 'Invalid token' }); }
};

// ── AUTH ROUTES ───────────────────────────────────────────────
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (usersData.find(u => u.email === email)) return res.status(400).json({ message: 'Email already registered' });
  const user = { _id: Date.now().toString(), name, email, passwordHash: bcrypt.hashSync(password, 10), role: 'user', wishlist: [], addresses: [] };
  usersData.push(user);
  res.status(201).json({ _id: user._id, name, email, role: 'user', token: genToken(user._id) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = usersData.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: genToken(user._id) });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = usersData.find(u => u._id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  const { passwordHash, ...safe } = user;
  res.json(safe);
});

// ── PRODUCT ROUTES ────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  const { category, featured, newArrival, bestseller, search, size, sort, minPrice, maxPrice } = req.query;
  let list = [...productsData];
  if (category) list = list.filter(p => p.category === category);
  if (featured === 'true') list = list.filter(p => p.featured);
  if (newArrival === 'true') list = list.filter(p => p.newArrival);
  if (bestseller === 'true') list = list.filter(p => p.bestseller);
  if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  if (size) list = list.filter(p => p.sizes.includes(size));
  if (minPrice) list = list.filter(p => p.price >= Number(minPrice));
  if (maxPrice) list = list.filter(p => p.price <= Number(maxPrice));
  if (sort === 'price-asc') list.sort((a,b) => a.price - b.price);
  else if (sort === 'price-desc') list.sort((a,b) => b.price - a.price);
  else if (sort === 'rating') list.sort((a,b) => b.rating - a.rating);
  else list.sort((a,b) => b.numReviews - a.numReviews);
  res.json({ products: list, total: list.length, page: 1, pages: 1 });
});

app.get('/api/products/:slug', (req, res) => {
  const p = productsData.find(p => p.slug === req.params.slug);
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
});

// ── USER ROUTES ───────────────────────────────────────────────
app.get('/api/users/profile', authMiddleware, (req, res) => {
  const user = usersData.find(u => u._id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  const wishlistProducts = productsData.filter(p => user.wishlist.includes(p._id));
  const { passwordHash, ...safe } = user;
  res.json({ ...safe, wishlist: wishlistProducts });
});

app.put('/api/users/profile', authMiddleware, (req, res) => {
  const user = usersData.find(u => u._id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  const { name, phone, avatar } = req.body;
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;
  const { passwordHash, ...safe } = user;
  res.json(safe);
});

app.post('/api/users/wishlist', authMiddleware, (req, res) => {
  const user = usersData.find(u => u._id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  const { productId } = req.body;
  const idx = user.wishlist.indexOf(productId);
  if (idx > -1) user.wishlist.splice(idx, 1); else user.wishlist.push(productId);
  res.json({ wishlist: user.wishlist });
});

// ── ORDER ROUTES ──────────────────────────────────────────────
app.post('/api/orders', authMiddleware, (req, res) => {
  const order = { _id: Date.now().toString(), user: req.user.id, ...req.body, status: 'pending', paymentStatus: 'pending', createdAt: new Date() };
  ordersData.push(order);
  res.status(201).json(order);
});

app.get('/api/orders/mine', authMiddleware, (req, res) => {
  const mine = ordersData.filter(o => o.user === req.user.id).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(mine);
});

app.get('/api/orders/:id', authMiddleware, (req, res) => {
  const order = ordersData.find(o => o._id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });
  res.json(order);
});

// ── ADMIN ROUTES ──────────────────────────────────────────────
app.post('/api/admin/products', authMiddleware, (req, res) => {
  const newProduct = {
    _id: Date.now().toString(),
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  productsData.push(newProduct);
  res.status(201).json(newProduct);
});

app.delete('/api/admin/products/:id', authMiddleware, (req, res) => {
  const index = productsData.findIndex(p => p._id === req.params.id || p.id === req.params.id);
  if (index !== -1) {
    productsData.splice(index, 1);
  }
  res.json({ message: 'Product deleted' });
});
app.get('/api/admin/stats', authMiddleware, (req, res) => {
  const usersCount = usersData.length;
  const productsCount = productsData.length;
  const ordersCount = ordersData.length;
  const totalRevenue = ordersData.reduce((sum, o) => sum + (o.total || 0), 0);
  const lowStockProducts = productsData.filter(p => p.stock < 5).slice(0, 5);
  const avgWatchTime = '8.5';
  res.json({ usersCount, productsCount, ordersCount, totalRevenue, orders: ordersData, lowStockProducts, avgWatchTime });
});

app.get('/api/admin/categories', authMiddleware, (req, res) => {
  const cats = {};
  productsData.forEach(p => {
    if (!cats[p.category]) cats[p.category] = { id: p.category, name: p.category, items: 0, status: 'Active' };
    cats[p.category].items++;
  });
  res.json(Object.values(cats));
});

app.get('/api/admin/reviews', authMiddleware, (req, res) => {
  const allReviews = [];
  productsData.forEach(p => {
    if (p.reviews && p.reviews.length > 0) {
      p.reviews.forEach(r => {
        allReviews.push({
          id: r.id || Math.random().toString(),
          product: p.name,
          customer: r.name,
          rating: r.rating,
          date: r.date || new Date().toISOString().split('T')[0],
          comment: r.comment,
          status: r.status || 'Pending'
        });
      });
    }
  });
  res.json(allReviews);
});

app.put('/api/admin/reviews/:id/status', authMiddleware, (req, res) => {
  const { status } = req.body;
  // Deep search and update review status in productsData
  let found = false;
  for (let p of productsData) {
    if (p.reviews) {
      for (let r of p.reviews) {
        if (r.id === req.params.id) {
          r.status = status;
          found = true;
          break;
        }
      }
    }
    if (found) break;
  }
  res.json({ success: true, status });
});

// ── START ─────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'DRAKEWEARS API Running (Demo Mode) ✨' }));
app.listen(PORT, () => {
  console.log(`✅ DRAKEWEARS Mock Server running at http://localhost:${PORT}`);
  console.log(`📦 ${productsData.length} products loaded`);
  console.log(`🔑 Demo: raoraza5417@gmail.com / huzaifaraza123`);
  console.log(`🔑 Demo: test@drakewears.com / test1234`);
});
