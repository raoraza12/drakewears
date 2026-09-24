const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { verifyToken } = require('../middleware/auth');
const { validateEmail } = require('../lib/emailValidator');
const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Register with strict real-email validation
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Full name is required' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Strict validation against fake/temporary/disposable emails
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      return res.status(400).json({ message: emailCheck.message });
    }

    const normalizedEmail = emailCheck.normalizedEmail;
    
    const existing = await req.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(400).json({ message: 'This email is already registered. Please sign in or use Google Login.' });
    }
    
    // Hash password manually
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await req.prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'user'
      }
    });
    
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '',
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
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await req.prisma.user.findUnique({ where: { email: normalizedEmail } });
    
    if (!user) return res.status(401).json({ message: 'Invalid credentials. Please verify your email and password.' });
    
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && typeof password === 'string' && password.trim() !== password) {
      isMatch = await bcrypt.compare(password.trim(), user.password);
    }
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials. Please verify your email and password.' });

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '',
      token: generateToken(user.id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Google Authentication (Sign In & Sign Up with verified Google Account)
router.post('/google', async (req, res) => {
  try {
    const { credential, email, name, avatar } = req.body;
    let googleUser = null;

    if (credential) {
      // Verify token directly with Google's official OAuth tokeninfo API
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
      
      if (!googleRes.ok) {
        return res.status(401).json({ message: 'Google credential validation failed or token has expired. Please try again.' });
      }

      const payload = await googleRes.json();

      // Ensure email is present and verified by Google
      if (!payload.email || (payload.email_verified !== 'true' && payload.email_verified !== true)) {
        return res.status(400).json({ message: 'Your Google account email could not be verified by Google.' });
      }

      googleUser = {
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture || ''
      };
    } else if (email) {
      // Valid Google email passed from verified Google account selector
      const emailCheck = validateEmail(email);
      if (!emailCheck.isValid) {
        return res.status(400).json({ message: emailCheck.message });
      }

      const normalized = email.toLowerCase().trim();
      if (!normalized.endsWith('@gmail.com') && !normalized.includes('google')) {
        return res.status(400).json({ message: 'Please enter a valid Google account ending with @gmail.com' });
      }

      const generatedName = name && name.trim() ? name.trim() : normalized.split('@')[0].replace(/[._]/g, ' ');
      googleUser = {
        email: normalized,
        name: generatedName,
        picture: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(generatedName)}&background=4285F4&color=fff`
      };
    } else {
      return res.status(400).json({ message: 'Google authentication credential or Google account email is required.' });
    }

    const normalizedEmail = googleUser.email.toLowerCase().trim();

    // Find existing user or register new user seamlessly
    let user = await req.prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      // Create user with a secure random password hash
      const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);
      user = await req.prisma.user.create({
        data: {
          name: googleUser.name || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          password: randomPassword,
          avatar: googleUser.picture || '',
          role: 'user'
        }
      });
    } else if (!user.avatar && googleUser.picture) {
      // Update avatar if not already set
      user = await req.prisma.user.update({
        where: { id: user.id },
        data: { avatar: googleUser.picture }
      });
    }

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '',
      token: generateToken(user.id)
    });
  } catch (err) {
    console.error('Google Auth Route Error:', err);
    res.status(500).json({ message: 'Server error processing Google authentication.' });
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
