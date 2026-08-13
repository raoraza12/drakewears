// Mock server - runs WITHOUT MongoDB for demo purposes
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();

const JWT_SECRET = 'luxe_demo_secret_2024';
const PORT = 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// ── MOCK DATA ─────────────────────────────────────────────────
let productsData = [];

const loadDummyProducts = async () => {
  // Use exact images provided by user
  const sourceData = [
    { cat: 'Men', sub: 'Casual Wear', title: 'Urban Leather Jacket', img: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80', price: 17166 },
    { cat: 'Men', sub: 'Formal Wear', title: 'Tailored Oxford Shirt', img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80', price: 15449 },
    { cat: 'Women', sub: 'Eastern Pret', title: 'Embroidered Silk Kurti', img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', price: 17110 },
    { cat: 'Women', sub: 'Western Wear', title: 'Chic Summer Dress', img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80', price: 14690 },
    { cat: 'Accessories', sub: 'Watches', title: 'Luxury Chronograph Watch', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', price: 14480 }
  ];

  productsData = sourceData.map((item, idx) => ({
    _id: 'prod_' + idx,
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
    reviews: []
  }));

  console.log(`📦 Loaded ${productsData.length} premium hardcoded products!`);
};

const usersData = [
  { _id: 'admin1', name: 'Admin User', email: 'admin@luxe.com', passwordHash: bcrypt.hashSync('admin123', 10), role: 'admin', wishlist: [], addresses: [] },
  { _id: 'user1', name: 'Test User', email: 'test@luxe.com', passwordHash: bcrypt.hashSync('test1234', 10), role: 'user', wishlist: [], addresses: [] },
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
  const { category, featured, newArrival, bestseller, search, size, sort, minPrice, maxPrice, tag } = req.query;
  let list = [...productsData];
  if (category) list = list.filter(p => p.category === category);
  if (featured === 'true') list = list.filter(p => p.featured);
  if (newArrival === 'true') list = list.filter(p => p.newArrival);
  if (bestseller === 'true') list = list.filter(p => p.bestseller);
  if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  if (size) list = list.filter(p => p.sizes.includes(size));
  if (minPrice) list = list.filter(p => p.price >= Number(minPrice));
  if (maxPrice) list = list.filter(p => p.price <= Number(maxPrice));
  if (tag) list = list.filter(p => p.tags && p.tags.includes(tag));
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

app.post('/api/orders/apply-coupon', authMiddleware, (req, res) => {
  const { code } = req.body;
  if (code.toUpperCase() === 'NOOR20') {
    return res.json({ discountType: 'percentage', discountValue: 20 });
  } else if (code.toUpperCase() === 'MINUS500') {
    return res.json({ discountType: 'fixed', discountValue: 500 });
  }
  return res.status(400).json({ message: 'Invalid coupon code' });
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

// ── START ─────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'NOOR API Running (Demo Mode with DummyJSON) ✨' }));

const startServer = async () => {
  await loadDummyProducts();
  app.listen(PORT, () => {
    console.log(`✅ NOOR Mock Server running at http://localhost:${PORT}`);
    console.log(`🔑 Demo: admin@luxe.com / admin123`);
    console.log(`🔑 Demo: test@luxe.com / test1234`);
  });
};

startServer();
