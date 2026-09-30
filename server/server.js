require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const prisma = require('./lib/prisma');

const app = express();

// Trust reverse proxy (Vercel / Cloudflare / Nginx) for accurate client IP detection
app.set('trust proxy', 1);

// Z+ Security: Helmet HTTP Headers protection (allowing Cloudinary images & Google Auth popup)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false // Disabled so frontend can load Cloudinary & Google Fonts seamlessly
}));


// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1' || req.ip?.includes('127.0.0.1'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api', globalLimiter);

// Auth Limiter: Skip localhost so developers/testers don't get locked out
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1' || req.ip?.includes('127.0.0.1'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Security alert: Too many login/register attempts. Please wait 15 minutes.' }
});

// Production-Ready Strict CORS Configuration
const allowedOrigins = [
  'https://drakewears.com',
  'https://www.drakewears.com',
  'http://drakewears.com',
  'http://www.drakewears.com',
  'https://drakewears.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server, or same-origin serverless)
    if (!origin) return callback(null, true);

    // In local development, permit localhost ports
    if (process.env.NODE_ENV !== 'production') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }

    // In production, permit exact allowed domains or subdomains
    const isAllowed = allowedOrigins.includes(origin) ||
      origin.includes('drakewears.com') ||
      origin.endsWith('.vercel.app') ||
      origin.includes('hostinger');

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Attach Prisma to Req so routes can use it without importing everywhere
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});


const path = require('path');

// Serve uploaded static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/settings', require('./routes/settings'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'drakewears API Running ✨', status: 'OK' });
});

// Google Search Console Site Verification
app.get('/googlecbd639bd70f468f7.html', (req, res) => {
  res.type('text/html').send('google-site-verification: googlecbd639bd70f468f7.html');
});

// Dynamic XML Sitemap for Google, Bing & Search Engines (Auto-syncs with Products DB)
app.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        slug: true,
        updatedAt: true,
        name: true,
        images: true,
        category: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    const baseUrl = 'https://drakewears.com';
    const nowIso = new Date().toISOString().split('T')[0];

    // Core Brand Pages
    const staticPages = [
      { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily', lastmod: nowIso },
      { loc: `${baseUrl}/shop`, priority: '0.9', changefreq: 'daily', lastmod: nowIso },
      { loc: `${baseUrl}/shop?category=baggy-trousers`, priority: '0.85', changefreq: 'weekly', lastmod: nowIso },
      { loc: `${baseUrl}/shop?category=drop-shoulder-tees`, priority: '0.85', changefreq: 'weekly', lastmod: nowIso },
      { loc: `${baseUrl}/about`, priority: '0.7', changefreq: 'monthly', lastmod: nowIso },
      { loc: `${baseUrl}/contact`, priority: '0.7', changefreq: 'monthly', lastmod: nowIso },
      { loc: `${baseUrl}/terms`, priority: '0.5', changefreq: 'yearly', lastmod: nowIso },
      { loc: `${baseUrl}/privacy`, priority: '0.5', changefreq: 'yearly', lastmod: nowIso },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // Static pages
    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${page.loc}</loc>\n`;
      xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Dynamic Products with Google Image Extension
    for (const prod of products) {
      if (!prod.slug) continue;
      const prodUrl = `${baseUrl}/shop/${prod.slug}`;
      const lastModDate = prod.updatedAt ? new Date(prod.updatedAt).toISOString().split('T')[0] : nowIso;

      xml += `  <url>\n`;
      xml += `    <loc>${prodUrl}</loc>\n`;
      xml += `    <lastmod>${lastModDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.85</priority>\n`;

      if (Array.isArray(prod.images) && prod.images.length > 0) {
        const imgUrl = prod.images[0].replace(/&/g, '&amp;');
        const imgTitle = (prod.name || 'DRAKEWEARS Streetwear').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${imgUrl}</image:loc>\n`;
        xml += `      <image:title>${imgTitle}</image:title>\n`;
        xml += `    </image:image>\n`;
      }

      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    return res.send(xml);
  } catch (err) {
    console.error('Sitemap generation error:', err);
    res.status(500).send('Error generating sitemap');
  }
});

// Serve Frontend build in Production
const fs = require('fs');
const candidatePaths = [
  path.join(__dirname, '../client/dist'),
  path.join(process.cwd(), 'client/dist'),
  path.join(process.cwd(), 'dist'),
  path.join(__dirname, 'client/dist')
];

let clientDist = candidatePaths.find(p => fs.existsSync(p));

if (clientDist) {
  console.log(`Serving frontend build from: ${clientDist}`);
  
  // Serve static assets with proper caching (never cache index.html, long cache hashed assets)
  app.use(express.static(clientDist, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      } else if (filePath.includes('assets')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));

  // SPA Fallback: Never return index.html for missing API or missing static assets
  app.get('*', (req, res) => {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({ message: 'API route not found' });
    }
    if (req.originalUrl.startsWith('/assets/') || req.originalUrl.endsWith('.js') || req.originalUrl.endsWith('.css')) {
      return res.status(404).type('text/plain').send('Asset not found');
    }
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  console.warn('Frontend build folder not found in candidates:', candidatePaths);
  app.get('/', (req, res) => {
    res.json({ message: 'drakewears API Running ✨', status: 'OK' });
  });
}

// Error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server Error' });
});

// Start server locally (not on Vercel)
const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
}

// Export for Vercel Serverless
module.exports = app;
