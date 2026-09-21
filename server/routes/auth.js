const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existing = await req.prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    
    // Hash password manually (previously Mongoose pre-save hook)
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await req.prisma.user.create({
      data: { name, email, password: hashedPassword }
    });
    
    res.status(201).json({
      _id: user.id, name: user.name, email: user.email, role: user.role,
      token: generateToken(user.id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await req.prisma.user.findUnique({ where: { email } });
    
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      _id: user.id, name: user.name, email: user.email, role: user.role,
      token: generateToken(user.id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  res.json(req.user); // Handled by auth middleware
});

// Forgot Password - Generate 1-hour signed reset token
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Please provide an email address' });

    const user = await req.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      // Return 200 to prevent email enumeration, but with clear message
      return res.json({ message: 'If an account exists with this email, a reset link has been dispatched.' });
    }

    // Sign 1-hour reset token
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, type: 'pwd_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetUrl = `${req.headers.origin || 'http://localhost:5173'}/reset-password/${resetToken}`;

    res.json({
      message: 'Password reset instructions have been generated.',
      resetToken,
      resetUrl
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reset Password - Verify token and hash new password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired. Please request a new one.' });
    }

    if (decoded.type !== 'pwd_reset') {
      return res.status(400).json({ message: 'Invalid reset token type' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await req.prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password has been successfully updated! You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
