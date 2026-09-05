const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth');
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
      where: { slug: req.params.slug },
      include: { reviews: true }
    });
    
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
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
router.put('/:id', async (req, res) => {
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

// POST add review
router.post('/:id/reviews', verifyToken, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id; // Now accessing string id, not _id

    const existingReview = await req.prisma.review.findFirst({
      where: { productId, userId }
    });

    if (existingReview) return res.status(400).json({ message: 'Already reviewed' });

    // Create review
    await req.prisma.review.create({
      data: {
        productId,
        userId,
        name: req.user.name,
        rating: Number(req.body.rating),
        comment: req.body.comment
      }
    });

    // Recalculate product rating
    const aggregates = await req.prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true }
    });

    await req.prisma.product.update({
      where: { id: productId },
      data: {
        rating: aggregates._avg.rating || 0,
        numReviews: aggregates._count.rating || 0
      }
    });

    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
