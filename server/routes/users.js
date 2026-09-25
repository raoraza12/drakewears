const express = require('express');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Get profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await req.prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, role: true, avatar: true, phone: true, addresses: true,
        wishlist: {
          select: { id: true, name: true, slug: true, price: true, images: true, comparePrice: true, rating: true }
        }
      }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const bcrypt = require('bcryptjs');

// Update profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await req.prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone, avatar },
      select: { id: true, name: true, email: true, role: true, avatar: true, phone: true }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Change / Update password
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    const user = await req.prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // If user already has a password, verify current password
    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect. Please try again.' });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await req.prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password updated successfully! Your device can now save the new password.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle wishlist
router.post('/wishlist', verifyToken, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const user = await req.prisma.user.findUnique({
      where: { id: userId },
      select: { wishlist: { select: { id: true } } }
    });

    const isWishlisted = user.wishlist.some(p => p.id === productId);

    const updatedUser = await req.prisma.user.update({
      where: { id: userId },
      data: {
        wishlist: isWishlisted 
          ? { disconnect: { id: productId } }
          : { connect: { id: productId } }
      },
      select: { wishlist: { select: { id: true } } }
    });

    res.json({ wishlist: updatedUser.wishlist.map(p => p.id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add address
router.post('/addresses', verifyToken, async (req, res) => {
  try {
    const user = await req.prisma.user.findUnique({ where: { id: req.user.id } });
    
    // Addresses are stored as JSON
    const addresses = Array.isArray(user.addresses) ? user.addresses : [];
    addresses.push(req.body);

    const updatedUser = await req.prisma.user.update({
      where: { id: req.user.id },
      data: { addresses }
    });

    res.json(updatedUser.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
