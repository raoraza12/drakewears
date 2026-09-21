const express = require('express');
const bcrypt = require('bcryptjs');
const { verifyToken, optionalAuth, isAdmin } = require('../middleware/auth');
const { 
  sendOrderNotification, 
  sendCustomerOrderConfirmation,
  sendCustomerOrderCancellation,
  sendAdminCancellationNotification
} = require('../lib/mailer');
const router = express.Router();

// Synchronous in-memory locks to block concurrent double-submissions and racing cancellations
const activeOrderLocks = new Map();
const activeCancellationLocks = new Map();

// Helper to find or create a user for guest/whatsapp orders
async function getOrCreateUser(prisma, { name, phone, email }) {
  const rawDigits = (phone || '').replace(/\D/g, '');
  let standardPhone = rawDigits;
  if (standardPhone.startsWith('92') && standardPhone.length === 12) {
    standardPhone = '0' + standardPhone.slice(2);
  }
  const userEmail = email && email.includes('@') 
    ? email.toLowerCase().trim() 
    : (standardPhone ? `customer_${standardPhone}@drakewears.pk` : `guest_${Date.now()}@drakewears.pk`);
  
  let user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) {
    const defaultPassword = await bcrypt.hash(standardPhone || 'customer_pass_123', 10);
    try {
      user = await prisma.user.create({
        data: {
          name: name ? name.trim() : 'Customer',
          email: userEmail,
          password: defaultPassword,
          phone: standardPhone || phone || '',
          role: 'user'
        }
      });
    } catch (createErr) {
      // Gracefully resolve concurrent race condition if another request created the user
      user = await prisma.user.findUnique({ where: { email: userEmail } });
    }
  } else {
    // Keep user record synchronized with latest customer contact info
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name ? name.trim() : user.name,
        phone: standardPhone || phone || user.phone
      }
    }).catch(() => user);
  }
  return user;
}

// Validate Coupon Code (Public)
router.post('/validate-coupon', async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ message: 'Please provide a coupon code' });
    }

    const cleanCode = code.trim().toUpperCase();

    // Built-in announcement bar code: DRAKEFREESHIP
    if (cleanCode === 'DRAKEFREESHIP') {
      return res.json({
        code: cleanCode,
        discountType: 'free_shipping',
        discountValue: 150,
        discountAmount: 150,
        message: 'Free Shipping Coupon Applied! ⚡'
      });
    }

    const coupon = await req.prisma.coupon.findUnique({
      where: { code: cleanCode }
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: 'This coupon is inactive' });
    }

    if (coupon.expirationDate && new Date() > new Date(coupon.expirationDate)) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }

    if (subtotal !== undefined && Number(subtotal) < coupon.minPurchaseAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount of Rs. ${coupon.minPurchaseAmount.toLocaleString()} required` 
      });
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    let calculatedDiscount = 0;
    const currentSubtotal = Number(subtotal) || 0;

    if (coupon.discountType === 'percentage') {
      calculatedDiscount = Math.round((currentSubtotal * coupon.discountValue) / 100);
    } else if (coupon.discountType === 'fixed') {
      calculatedDiscount = Math.min(currentSubtotal, coupon.discountValue);
    } else if (coupon.discountType === 'free_shipping') {
      calculatedDiscount = 150;
    }

    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: calculatedDiscount,
      message: `Coupon ${coupon.code} applied! Saved Rs. ${calculatedDiscount.toLocaleString()}`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create order (Website / Manual) - Supports logged-in & guest checkout
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, subtotal, shippingFee, discount, total, notes } = req.body;
    
    // 1. Strict Name Validation (Allows English, Urdu, Arabic letters, spaces, hyphens, and apostrophes)
    const cleanName = (shippingAddress?.name || '').trim();
    if (!cleanName || cleanName.length < 3) {
      return res.status(400).json({ message: 'Please provide a valid Customer Full Name (at least 3 characters).' });
    }
    if (cleanName.length > 60) {
      return res.status(400).json({ message: 'Customer name cannot exceed 60 characters.' });
    }
    if (!/^[\p{L}\p{M}\s'.\-()]{3,60}$/u.test(cleanName)) {
      return res.status(400).json({ message: 'Customer name contains invalid characters. Only letters, spaces, hyphens, apostrophes, and parentheses are allowed.' });
    }

    // 2. Strict Pakistani Mobile Number Validation & Normalization
    const rawPhone = (shippingAddress?.phone || '').replace(/[\s\-\(\)]/g, '').replace(/^0092/, '+92');
    if (!rawPhone) {
      return res.status(400).json({ message: 'Phone number is required.' });
    }
    const isPakPhone = /^((\+92)?(0)?3[0-9]{9})$/.test(rawPhone);
    if (!isPakPhone) {
      return res.status(400).json({ message: 'Invalid phone number. Must be a valid Pakistani mobile number (e.g. 0321-8254922, 0092-321-4456677, or +923218254922).' });
    }
    // Reject dummy repeating sequences e.g. 03000000000
    if (/^(\+92|0)?3(\d)\2{8}$/.test(rawPhone)) {
      return res.status(400).json({ message: 'Please provide a genuine phone number for delivery verification.' });
    }

    // Standardize to clean 03XXXXXXXXX (11 digits) for database consistency
    let normalizedPhone = rawPhone;
    if (normalizedPhone.startsWith('+92')) {
      normalizedPhone = '0' + normalizedPhone.slice(3);
    } else if (normalizedPhone.startsWith('92') && normalizedPhone.length === 12) {
      normalizedPhone = '0' + normalizedPhone.slice(2);
    } else if (normalizedPhone.startsWith('0092') && normalizedPhone.length === 14) {
      normalizedPhone = '0' + normalizedPhone.slice(4);
    }

    // 3. Email Validation (if provided)
    const cleanEmail = (shippingAddress?.email || '').trim().toLowerCase();
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    // 4. Address Validation
    const cleanStreet = (shippingAddress?.street || '').trim();
    const cleanCity = (shippingAddress?.city || '').trim();
    const cleanState = (shippingAddress?.state || 'Punjab').trim();
    const cleanZip = (shippingAddress?.zip || '').trim();

    if (!cleanStreet || cleanStreet.length < 5) {
      return res.status(400).json({ message: 'Please provide a complete street delivery address (at least 5 characters).' });
    }
    if (!cleanCity || cleanCity.length < 2) {
      return res.status(400).json({ message: 'Please provide a valid city name (at least 2 characters).' });
    }

    // 5. Cart Items Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty. Please add items before checking out.' });
    }

    for (const it of items) {
      if (!it.name || Number(it.price) <= 0) {
        return res.status(400).json({ message: 'Invalid item data in cart.' });
      }
    }

    const formattedItems = items.map(item => {
      const pId = item.product || item.productId;
      const validId = (pId && pId.length > 20 && !pId.includes('custom')) ? pId : null;
      return {
        productId: validId,
        name: String(item.name).trim(),
        image: item.image || '',
        price: Number(item.price) || 0,
        quantity: Math.max(1, Number(item.quantity) || 1),
        size: item.size || null,
        color: item.color || null
      };
    });

    // 6. Total Price Integrity Calculation (Server-side recomputation)
    const calculatedSubtotal = formattedItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);
    const calculatedShipping = Number(shippingFee) >= 0 ? Number(shippingFee) : (calculatedSubtotal >= 5000 ? 0 : 150);
    const calculatedDiscount = Math.max(0, Number(discount) || 0);
    const calculatedTotal = Math.max(0, calculatedSubtotal + calculatedShipping - calculatedDiscount);

    // 7. Backend Concurrency & Duplicate Submission Prevention (Immediate lock before any DB write)
    const idempotencyKey = `${normalizedPhone}_${calculatedTotal}`;
    if (activeOrderLocks.has(idempotencyKey)) {
      console.log(`[Orders API] Concurrent submission blocked for key ${idempotencyKey}`);
      return res.status(429).json({ message: 'Order submission already in progress. Please wait a moment.' });
    }
    activeOrderLocks.set(idempotencyKey, Date.now());

    let userId = req.user?.id;
    if (!userId) {
      const user = await getOrCreateUser(req.prisma, {
        name: cleanName,
        phone: normalizedPhone,
        email: cleanEmail
      });
      userId = user.id;
    }

    // Complete immutable shipping address snapshot
    const shippingAddressSnapshot = {
      name: cleanName,
      phone: normalizedPhone,
      email: cleanEmail || undefined,
      street: cleanStreet,
      city: cleanCity,
      state: cleanState,
      zip: cleanZip,
      country: 'Pakistan'
    };

    // 5-second throttle for same phone & total in database
    const recentDuplicate = await req.prisma.order.findFirst({
      where: {
        createdAt: { gte: new Date(Date.now() - 5000) },
        shippingAddress: {
          path: ['phone'],
          equals: normalizedPhone
        }
      },
      include: { items: true, user: true }
    });

    if (recentDuplicate && Math.abs(recentDuplicate.total - (calculatedTotal > 0 ? calculatedTotal : (Number(total) || calculatedSubtotal))) < 1) {
      activeOrderLocks.delete(idempotencyKey);
      console.log(`[Orders API] Duplicate submission intercepted within 5s for phone ${normalizedPhone}. Returning existing Order #${recentDuplicate.id}`);
      return res.status(200).json(recentDuplicate);
    }

    const order = await req.prisma.order.create({
      data: {
        userId,
        shippingAddress: shippingAddressSnapshot,
        paymentMethod: paymentMethod || 'Cash on Delivery',
        subtotal: calculatedSubtotal,
        shippingFee: calculatedShipping,
        discount: calculatedDiscount,
        total: calculatedTotal > 0 ? calculatedTotal : (Number(total) || calculatedSubtotal),
        notes: notes ? String(notes).trim() : '',
        items: {
          create: formattedItems
        }
      },
      include: { items: true, user: true }
    });

    // Auto-decrement stock for each ordered item
    for (const item of formattedItems) {
      if (item.productId) {
        await req.prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: Math.max(1, item.quantity) } }
        }).catch(err => {
          console.warn('[Orders] Stock decrement failed for item:', item.productId, err.message);
        });
      }
    }

    // Increment coupon used count if coupon applied
    if (req.body.couponCode) {
      const cCode = req.body.couponCode.trim().toUpperCase();
      await req.prisma.coupon.update({
        where: { code: cCode },
        data: { usedCount: { increment: 1 } }
      }).catch(() => {});
    }
    
    // Send email notification to admin (non-blocking)
    sendOrderNotification(order, formattedItems, 'website').catch(err => {
      console.error('[Orders] Admin email notification error:', err.message);
    });

    // Send order confirmation email directly to customer if email exists (non-blocking)
    sendCustomerOrderConfirmation(order, formattedItems).catch(err => {
      console.error('[Orders] Customer confirmation email error:', err.message);
    });
    
    res.status(201).json(order);
    setTimeout(() => {
      activeOrderLocks.delete(idempotencyKey);
    }, 5000);
  } catch (err) {
    if (typeof idempotencyKey !== 'undefined') {
      activeOrderLocks.delete(idempotencyKey);
    }
    console.error('Create order error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create WhatsApp Order (Public endpoint from Cart Drawer or Product Detail)
router.post('/whatsapp', optionalAuth, async (req, res) => {
  try {
    const { 
      items, 
      customerName, 
      phoneNumber, 
      paymentMethod = 'WhatsApp', 
      subtotal, 
      shippingFee = 0, 
      discount = 0, 
      total,
      productId,
      productName,
      price,
      size,
      color,
      notes
    } = req.body;

    let userId = req.user?.id;
    if (!userId) {
      const user = await getOrCreateUser(req.prisma, {
        name: customerName,
        phone: phoneNumber
      });
      userId = user.id;
    }

    // Build items list whether from multi-item cart or single product
    let formattedItems = [];
    if (items && Array.isArray(items) && items.length > 0) {
      formattedItems = items.map(item => {
        const pId = item.product || item.productId;
        const validId = (pId && pId.length > 20 && !pId.includes('custom')) ? pId : null;
        return {
          productId: validId,
          name: item.name,
          image: item.image || '',
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          size: item.size || null,
          color: item.color || null
        };
      });
    } else if (productName) {
      const validId = (productId && productId.length > 20 && !productId.includes('custom')) ? productId : null;
      formattedItems = [{
        productId: validId,
        name: productName,
        image: '',
        price: Number(price) || 0,
        quantity: 1,
        size: size || null,
        color: color || null
      }];
    }

    const calculatedSubtotal = subtotal !== undefined ? Number(subtotal) : (price !== undefined ? Number(price) : formattedItems.reduce((acc, i) => acc + i.price * i.quantity, 0));
    const calculatedTotal = total !== undefined ? Number(total) : calculatedSubtotal;

    const orderNotes = notes || `[WHATSAPP_ORDER] Customer: ${customerName || 'Customer'}, Phone: ${phoneNumber || 'N/A'}`;

    const order = await req.prisma.order.create({
      data: {
        userId,
        shippingAddress: {
          name: customerName || 'WhatsApp Customer',
          phone: phoneNumber || 'N/A',
          street: 'Order via WhatsApp',
          city: 'N/A',
          country: 'Pakistan'
        },
        paymentMethod: paymentMethod || 'WhatsApp',
        subtotal: calculatedSubtotal,
        shippingFee: Number(shippingFee) || 0,
        discount: Number(discount) || 0,
        total: calculatedTotal,
        notes: orderNotes,
        items: {
          create: formattedItems
        }
      },
      include: { items: true, user: true }
    });

    // Send email notification to admin (non-blocking)
    sendOrderNotification(order, formattedItems, 'whatsapp').catch(err => {
      console.error('[Orders] WhatsApp email notification error:', err.message);
    });

    res.status(201).json(order);
  } catch (err) {
    console.error('Create WhatsApp order error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get my orders (Logged in user)
router.get('/mine', verifyToken, async (req, res) => {
  try {
    const orders = await req.prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true
      }
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single order
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await req.prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: true
      }
    });
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public Order Tracking by Order Number, ID, or Phone Number
router.get('/track/:query', async (req, res) => {
  try {
    const rawQuery = (req.params.query || '').trim();
    if (!rawQuery) return res.status(400).json({ message: 'Please provide an Order Number, ID, or Phone number' });

    let order = null;

    // 1. Check if numeric Order Number (e.g. 1, 2, #1, DW-1, #DW-0001)
    const cleanedNumStr = rawQuery.replace(/^[#\s]*(DW-?)?/i, '').trim();
    const parsedOrderNum = parseInt(cleanedNumStr, 10);
    if (!isNaN(parsedOrderNum) && parsedOrderNum > 0 && cleanedNumStr.length <= 8 && /^\d+$/.test(cleanedNumStr)) {
      order = await req.prisma.order.findFirst({
        where: { orderNumber: parsedOrderNum },
        include: { items: true }
      });
    }

    // 2. Check if query is full UUID
    if (!order && rawQuery.length >= 30) {
      order = await req.prisma.order.findUnique({
        where: { id: rawQuery },
        include: { items: true }
      });
    }

    // 3. Check by short ID (last 6-8 hex chars of UUID)
    if (!order && rawQuery.length >= 4 && rawQuery.length <= 12) {
      const cleanHex = rawQuery.replace(/^[#\s]*/, '').toLowerCase();
      const recentOrders = await req.prisma.order.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: { items: true }
      });
      order = recentOrders.find(o => o.id.toLowerCase().endsWith(cleanHex) || o.id.toLowerCase().includes(cleanHex));
    }

    // 4. Find by Phone number or courier tracking number
    if (!order) {
      const cleanPhone = rawQuery.replace(/\D/g, '');
      const orders = await req.prisma.order.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: { items: true }
      });
      order = orders.find(o => {
        const addr = o.shippingAddress || {};
        const p = (addr.phone || '').replace(/\D/g, '');
        return (cleanPhone && cleanPhone.length >= 7 && p.includes(cleanPhone)) || 
               (o.trackingNumber && o.trackingNumber.toLowerCase() === rawQuery.toLowerCase());
      });
    }

    if (!order) {
      return res.status(404).json({ message: 'No matching order found. Please check your Order Number or Phone.' });
    }

    const createdAtTime = new Date(order.createdAt).getTime();
    const minDeliveryDate = new Date(createdAtTime + 2 * 24 * 60 * 60 * 1000).toISOString();
    const maxDeliveryDate = new Date(createdAtTime + 4 * 24 * 60 * 60 * 1000).toISOString();

    // Return sanitized public tracking info with 2 to 4 days delivery timeline
    res.json({
      id: order.id,
      orderNumber: order.orderNumber,
      formattedOrderNumber: `#${order.orderNumber || order.id.slice(-6).toUpperCase()}`,
      status: order.status,
      createdAt: order.createdAt,
      total: order.total,
      shippingFee: order.shippingFee,
      paymentMethod: order.paymentMethod,
      trackingNumber: order.trackingNumber,
      deliveryTimeline: {
        minDays: 2,
        maxDays: 4,
        slaDays: 4,
        minDeliveryDate,
        maxDeliveryDate,
        summary: '2 to 4 Working Days (Max 4 Days)'
      },
      itemsCount: order.items?.length || 0,
      items: (order.items || []).map(i => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
        image: i.image
      })),
      shippingCity: order.shippingAddress?.city || 'Pakistan'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Customer / Guest Order Cancellation Endpoint
 * Supports PATCH & POST /api/orders/:id/cancel
 */
const handleOrderCancellation = async (req, res) => {
  const orderId = req.params.id;
  const { reason = 'Changed my mind', phone, notes } = req.body;

  // 1. Concurrency Mutex Lock against rapid double-clicks
  if (activeCancellationLocks.has(orderId)) {
    return res.status(429).json({ message: 'Cancellation request already in progress. Please wait a moment.' });
  }
  activeCancellationLocks.set(orderId, Date.now());

  try {
    // 2. Fetch order with items
    const order = await req.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true }
    });

    if (!order) {
      activeCancellationLocks.delete(orderId);
      return res.status(404).json({ message: 'Order not found.' });
    }

    // 3. Security & Ownership Verification
    const isOwner = req.user && (req.user.id === order.userId || req.user.role === 'admin');

    let isPhoneVerified = false;
    const orderPhoneRaw = String(order.shippingAddress?.phone || '').replace(/[\s\-\(\)]/g, '').replace(/^0092/, '+92');
    const normOrderPhone = orderPhoneRaw.startsWith('+92') ? '0' + orderPhoneRaw.slice(3) : orderPhoneRaw;

    if (phone) {
      const cleanInputPhone = String(phone).replace(/[\s\-\(\)]/g, '').replace(/^0092/, '+92');
      const normInputPhone = cleanInputPhone.startsWith('+92') ? '0' + cleanInputPhone.slice(3) : cleanInputPhone;
      if (normInputPhone && normInputPhone === normOrderPhone && normInputPhone.length >= 10) {
        isPhoneVerified = true;
      }
    }

    if (!isOwner && !isPhoneVerified) {
      activeCancellationLocks.delete(orderId);
      return res.status(403).json({ 
        message: 'Access Denied: You do not have permission to cancel this order. Please log in with the account that placed it or provide the matching phone number.' 
      });
    }

    // 4. Status Check - Enforce on backend
    const currentStatus = (order.status || '').toLowerCase();
    if (currentStatus === 'cancelled') {
      activeCancellationLocks.delete(orderId);
      return res.status(400).json({ message: 'This order has already been cancelled.' });
    }

    if (currentStatus === 'shipped' || currentStatus === 'delivered') {
      activeCancellationLocks.delete(orderId);
      return res.status(400).json({ 
        message: `This order has already been ${currentStatus} and cannot be cancelled online. Please contact customer support.` 
      });
    }

    // 5. Restore Inventory Stock Atomically
    for (const item of order.items) {
      if (item.productId) {
        await req.prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: Math.max(1, item.quantity) } }
        }).catch(err => {
          console.warn('[Cancel Order] Stock increment warning for item:', item.productId, err.message);
        });
      }
    }

    // 6. Payment Status & Refund Flag
    let newPaymentStatus = order.paymentStatus;
    if (order.paymentStatus === 'paid') {
      newPaymentStatus = 'refund_pending';
    }

    const cancelledBy = (req.user?.role === 'admin' && req.user.id !== order.userId) ? 'admin' : 'customer';
    const cleanReason = String(reason || 'Customer requested cancellation').trim();
    const cancellationTimestamp = new Date().toISOString();

    const updatedShippingAddress = {
      ...(typeof order.shippingAddress === 'object' ? order.shippingAddress : {}),
      cancellation: {
        cancelledBy,
        reason: cleanReason,
        cancelledAt: cancellationTimestamp,
        customerNotes: notes ? String(notes).trim() : ''
      }
    };

    const cancellationNote = `[CANCELLED BY ${cancelledBy.toUpperCase()}: ${cleanReason} on ${new Date().toLocaleDateString('en-PK')} ${new Date().toLocaleTimeString('en-PK')}]`;
    const updatedNotes = order.notes ? `${cancellationNote}\n${order.notes}` : cancellationNote;

    // 7. Update Order in Database
    const updatedOrder = await req.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'cancelled',
        paymentStatus: newPaymentStatus,
        notes: updatedNotes,
        shippingAddress: updatedShippingAddress
      },
      include: { items: true, user: true }
    });

    // 8. Notifications (non-blocking)
    sendCustomerOrderCancellation(updatedOrder, updatedOrder.items, cleanReason).catch(err => {
      console.error('[Orders] Customer cancellation email error:', err.message);
    });

    sendAdminCancellationNotification(updatedOrder, cleanReason, cancelledBy === 'customer' ? 'Customer' : 'Admin').catch(err => {
      console.error('[Orders] Admin cancellation email error:', err.message);
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully. Items have been returned to inventory.',
      order: updatedOrder
    });

    setTimeout(() => activeCancellationLocks.delete(orderId), 3000);
  } catch (err) {
    activeCancellationLocks.delete(orderId);
    console.error('Cancel order error:', err);
    res.status(500).json({ message: err.message || 'Server error while cancelling order.' });
  }
};

router.patch('/:id/cancel', optionalAuth, handleOrderCancellation);
router.post('/:id/cancel', optionalAuth, handleOrderCancellation);

// Update order status (admin) - Automatically restores stock if order is cancelled
router.put('/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const currentOrder = await req.prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });

    if (!currentOrder) return res.status(404).json({ message: 'Order not found' });

    const newStatus = req.body.status;

    // If order was not cancelled previously and is now being cancelled, restore product stock
    if (newStatus === 'cancelled' && currentOrder.status !== 'cancelled') {
      for (const item of currentOrder.items) {
        if (item.productId) {
          await req.prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: Math.max(1, item.quantity) } }
          }).catch(e => console.warn('[Orders] Stock restoration warning:', e.message));
        }
      }
    }

    const order = await req.prisma.order.update({
      where: { id: req.params.id },
      data: { status: newStatus },
      include: { items: true, user: true }
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders (admin)
router.get('/', verifyToken, isAdmin, async (req, res) => {
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

module.exports = router;

