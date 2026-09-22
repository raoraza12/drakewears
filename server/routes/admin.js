const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { sendOrderNotification } = require('../lib/mailer');

// Protect all admin routes
router.use(verifyToken, isAdmin);

// --- PRODUCT MANAGEMENT ---
router.post('/products', async (req, res) => {
  try {
    const product = await req.prisma.product.create({ data: req.body });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const updateData = {};
    if (req.body.stock !== undefined) updateData.stock = parseInt(req.body.stock);
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.price !== undefined) updateData.price = parseFloat(req.body.price);
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.images !== undefined) updateData.images = req.body.images;
    if (req.body.colors !== undefined) updateData.colors = req.body.colors;
    if (req.body.sizes !== undefined) updateData.sizes = req.body.sizes;

    const product = await req.prisma.product.update({
      where: { id: req.params.id },
      data: updateData
    });
    res.json(product);
  } catch (err) {
    console.error('Admin update error:', err);
    res.status(400).json({ message: err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await req.prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- USER MANAGEMENT ---
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await req.prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await req.prisma.user.create({
      data: { name, email, password: hashedPassword, role }
    });
    res.status(201).json({ _id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await req.prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, avatar: true, phone: true, createdAt: true }
    });
    // Add _id field for backwards compatibility if frontend expects it
    const formatted = users.map(u => ({...u, _id: u.id}));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const user = await req.prisma.user.update({
      where: { id: req.params.id },
      data: { role: req.body.role },
      select: { id: true, name: true, email: true, role: true }
    });
    res.json({...user, _id: user.id});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const targetUser = await req.prisma.user.findUnique({ where: { id: req.params.id } });
    if (!targetUser) return res.status(404).json({ message: 'User not found' });
    
    if (targetUser.role === 'admin' || targetUser.email === 'drakewearsofficial@gmail.com') {
      return res.status(400).json({ message: 'Cannot delete an administrator account.' });
    }

    await req.prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// --- ORDER / PAYMENT / DELIVERY MANAGEMENT ---
router.post('/orders/whatsapp', async (req, res) => {
  try {
    const { customerName, phoneNumber, productId, productName, price, size, color } = req.body;
    
    // Create or find dummy user for this whatsapp customer
    const dummyEmail = `wa_${phoneNumber}@drakewearsbrand.local`;
    let user = await req.prisma.user.findUnique({ where: { email: dummyEmail } });
    if (!user) {
      const hashedPassword = await bcrypt.hash(phoneNumber, 10);
      user = await req.prisma.user.create({
        data: { name: customerName, email: dummyEmail, password: hashedPassword, phone: phoneNumber, role: 'user' }
      });
    }

    const validProductId = (productId && productId.length > 20 && !productId.includes('custom')) ? productId : null;

    const order = await req.prisma.order.create({
      data: {
        userId: user.id,
        shippingAddress: { name: customerName, phone: phoneNumber, city: 'N/A', country: 'N/A' },
        paymentMethod: 'WhatsApp',
        subtotal: Number(price),
        shippingFee: 0,
        discount: 0,
        total: Number(price),
        notes: `[WHATSAPP_ORDER] Customer: ${customerName}, Phone: ${phoneNumber}`,
        items: {
          create: [{
            productId: validProductId,
            name: productName,
            image: '',
            price: Number(price),
            quantity: 1,
            size: size || null,
            color: color || null
          }]
        }
      },
      include: { items: true, user: true }
    });
    res.status(201).json(order);
    
    // Send email notification to admin (non-blocking)
    const emailItems = [{
      name: productName,
      price: Number(price),
      quantity: 1,
      size: size || 'N/A',
      color: color || 'N/A'
    }];
    sendOrderNotification(order, emailItems, 'whatsapp').catch(err => {
      console.error('[Admin] WhatsApp order email error:', err.message);
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await req.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        user: { select: { name: true, email: true, phone: true } },
        items: true
      }
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/orders/:id', async (req, res) => {
  try {
    const { status, paymentStatus, refundedAmount } = req.body;
    
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (refundedAmount !== undefined) updateData.refundedAmount = Number(refundedAmount);

    const order = await req.prisma.order.update({
      where: { id: req.params.id },
      data: updateData
    });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/orders/:id', async (req, res) => {
  try {
    await req.prisma.order.delete({ where: { id: req.params.id } });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- COUPON MANAGEMENT ---
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await req.prisma.coupon.findMany();
    // Add _id for backwards compatibility
    res.json(coupons.map(c => ({...c, _id: c.id})));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/coupons', async (req, res) => {
  try {
    const data = {...req.body};
    if (data.expirationDate) {
      data.expirationDate = new Date(data.expirationDate);
    }
    const coupon = await req.prisma.coupon.create({ data });
    res.status(201).json({...coupon, _id: coupon.id});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/coupons/:id', async (req, res) => {
  try {
    await req.prisma.coupon.delete({ where: { id: req.params.id } });
    res.json({ message: 'Coupon deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- DASHBOARD STATS ---
router.get('/stats', async (req, res) => {
  try {
    const [usersCount, productsCount, ordersCount] = await Promise.all([
      req.prisma.user.count(),
      req.prisma.product.count(),
      req.prisma.order.count()
    ]);

    const lowStockProducts = await req.prisma.product.findMany({
      where: { stock: { lt: 5 } },
      take: 5
    });

    const orders = await req.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    });

    const totalRevenueResult = await req.prisma.order.aggregate({
      where: { paymentStatus: 'paid' },
      _sum: { total: true }
    });
    
    const totalRevenue = totalRevenueResult._sum.total || 0;
    
    // Simulate Average Watchtime (Duration in minutes) for demo
    const avgWatchTime = (Math.random() * 10 + 5).toFixed(1); 

    res.json({ 
      usersCount, 
      productsCount, 
      ordersCount, 
      totalRevenue, 
      orders, 
      lowStockProducts,
      avgWatchTime 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- SETTINGS MANAGEMENT ---
router.get('/settings', async (req, res) => {
  try {
    const settings = await req.prisma.setting.findMany();
    res.json(settings);
  } catch (err) {
    console.error('Settings Fetch Error:', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/settings', async (req, res) => {
  try {
    const { key, value } = req.body;
    const setting = await req.prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
    res.json(setting);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/settings/bulk', async (req, res) => {
  try {
    const { settings } = req.body; // Expecting { key: value, ... }
    const results = await Promise.all(
      Object.entries(settings).map(([key, value]) => 
        req.prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value }
        })
      )
    );
    res.json({ message: 'Settings updated successfully', count: results.length });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- REVIEW MANAGEMENT ---
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await req.prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, images: true } },
        user: { select: { name: true, email: true } }
      }
    });

    const formatted = reviews.map(r => ({
      id: r.id,
      customer: r.name || r.user?.name || 'Customer',
      date: new Date(r.createdAt).toLocaleDateString(),
      product: r.product?.name || 'Product',
      rating: r.rating,
      comment: r.comment,
      status: r.status ? (r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase()) : 'Pending'
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/reviews/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const normalizedStatus = (status || 'approved').toLowerCase();
    const review = await req.prisma.review.update({
      where: { id: req.params.id },
      data: { status: normalizedStatus }
    });

    // Recalculate product rating considering approved reviews
    const aggregates = await req.prisma.review.aggregate({
      where: { productId: review.productId, status: 'approved' },
      _avg: { rating: true },
      _count: { rating: true }
    });

    await req.prisma.product.update({
      where: { id: review.productId },
      data: {
        rating: aggregates._avg.rating ? Number(aggregates._avg.rating.toFixed(1)) : 0,
        numReviews: aggregates._count.rating || 0
      }
    });

    res.json({ message: `Review marked as ${normalizedStatus}`, review });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    const review = await req.prisma.review.findUnique({ where: { id: req.params.id } });
    await req.prisma.review.delete({ where: { id: req.params.id } });

    if (review) {
      const aggregates = await req.prisma.review.aggregate({
        where: { productId: review.productId, status: 'approved' },
        _avg: { rating: true },
        _count: { rating: true }
      });
      await req.prisma.product.update({
        where: { id: review.productId },
        data: {
          rating: aggregates._avg.rating ? Number(aggregates._avg.rating.toFixed(1)) : 0,
          numReviews: aggregates._count.rating || 0
        }
      });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

