const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Use req.prisma if available (from server.js middleware), otherwise use local instance
    const db = req.prisma || prisma;
    
    req.user = await db.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, avatar: true }
    });
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const db = req.prisma || prisma;
      req.user = await db.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true, avatar: true }
      });
    }
  } catch (err) {
    // Continue as guest
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = { verifyToken, optionalAuth, isAdmin };

