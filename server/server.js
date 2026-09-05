const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const prisma = require('./lib/prisma');

const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow all origins for now to fix connection issues
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/settings', require('./routes/settings'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'drakewears API Running ✨', status: 'OK' });
});

// Error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server Error' });
});

// Start server locally (not on Vercel)
const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

// Export for Vercel Serverless
module.exports = app;
