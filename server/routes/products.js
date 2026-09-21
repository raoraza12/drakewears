const express = require('express');
const { verifyToken, optionalAuth, isAdmin } = require('../middleware/auth');
const router = express.Router();

// GET all products with filters
router.get('/', async (req, res) => {
  try {
    const { category, subcategory, featured, newArrival, bestseller, search, minPrice, maxPrice, size, sort, limit = 20, page = 1 } = req.query;
    const where = {};
    
    if (category) where.category = category;
    if (subcategory) where.subcategory = subcategory;
    if (featured === 'true') where.featured = true;
    if (newArrival === 'true') where.newArrival = true;
    if (bestseller === 'true') where.bestseller = true;
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    
    if (size) {
      where.sizes = { has: size };
    }

    if (req.query.tag) {
      where.tags = { has: req.query.tag };
    }

    if (req.query.color) {
      where.colors = { path: ['$[*].name'], array_contains: req.query.color };
    }


    const sortOptions = {
      'price-asc': { price: 'asc' },
      'price-desc': { price: 'desc' },
      'newest': { createdAt: 'desc' },
      'rating': { rating: 'desc' },
      'popular': { numReviews: 'desc' }
    };
    const orderBy = sortOptions[sort] || { createdAt: 'desc' };
    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      req.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: Number(limit)
      }),
      req.prisma.product.count({ where })
    ]);

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET product by slug
router.get('/:slug', async (req, res) => {
  try {
    const product = await req.prisma.product.findUnique({
      where: { slug: req.params.slug }
    });
    
    if (!product) return res.status(404).json({ message: 'Product not found' });

    try {
      const reviews = await req.prisma.review.findMany({
        where: { productId: product.id, status: 'approved' },
        select: { id: true, name: true, rating: true, comment: true, createdAt: true }
      });
      product.reviews = reviews;
    } catch (e) {
      product.reviews = [];
    }

    res.json(product);
  } catch (err) {
    console.error('Error fetching product by slug:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST add product (admin)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const product = await req.prisma.product.create({
      data: req.body
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update product (admin)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
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
    console.error('Update error:', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE product (admin)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await req.prisma.product.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add review (Supports logged-in & guest customers)
router.post('/:id/reviews', optionalAuth, async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, rating, comment } = req.body;

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ message: 'Please provide a rating between 1 and 5 stars' });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Please provide a review comment' });
    }

    let userId = req.user?.id;
    let reviewerName = req.user?.name || name || 'Customer';

    if (!userId) {
      const bcrypt = require('bcryptjs');
      const dummyEmail = `reviewer_${Date.now()}_${Math.floor(Math.random()*1000)}@drakewearsbrand.local`;
      const hashedPassword = await bcrypt.hash('reviewer_pass_123', 10);
      const guestUser = await req.prisma.user.create({
        data: {
          name: reviewerName,
          email: dummyEmail,
          password: hashedPassword,
          role: 'user'
        }
      });
      userId = guestUser.id;
    }

    // Create review with pending status for admin moderation
    const review = await req.prisma.review.create({
      data: {
        productId,
        userId,
        name: reviewerName,
        rating: Number(rating),
        comment: comment.trim(),
        status: 'pending'
      }
    });

    res.status(201).json({ 
      message: 'Review submitted successfully! It will appear once approved by admin.',
      review,
      pendingApproval: true
    });
  } catch (err) {
    console.error('Submit review error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
