const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const prisma = require('./lib/prisma');

const app = express();

// Trust reverse proxy (Vercel / Cloudflare / Nginx) for accurate client IP detection
app.set('trust proxy', 1);

// Z+ Security: Helmet HTTP Headers protection (allowing Cloudinary images)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
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

    // In production, permit exact allowed domains or vercel subdomains
    const isAllowed = allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.drakewears.com');

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS Error: Origin ${origin} not permitted by DRAKEWEARS policy.`));
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
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({ message: 'API route not found' });
    }
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
