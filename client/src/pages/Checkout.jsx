import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiShoppingBag, FiCheckCircle, FiTag, FiX, FiMessageSquare, FiAlertCircle, FiEdit2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import API from '../api';
import './Checkout.css';

export default function Checkout() {
  const { user, loading: authLoading } = useAuth();
  const { items, total, clearCart } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    name: user?.name || '', 
    phone: user?.phone || '', 
    email: user?.email || '',
    street: '', 
    city: '', 
    state: 'Punjab', 
    zip: '', 
    country: 'Pakistan', 
    paymentMethod: 'Cash on Delivery',
    notes: '' 
  });

  const [errors, setErrors] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const initializedRef = useRef(false);
  const isSubmittingRef = useRef(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Completed order state for confirmation screen
  const [placedOrder, setPlacedOrder] = useState(null);

  // Only initialize form fields once on mount when user profile is loaded
  // Prevents user edits during checkout from being overwritten by profile updates
  useEffect(() => {
    if (user && !initializedRef.current) {
      setForm(p => ({
        ...p,
        name: p.name || user.name || '',
        phone: p.phone || user.phone || '',
        email: p.email || user.email || ''
      }));
      initializedRef.current = true;
    }
  }, [user]);

  const defaultShipping = settings?.shippingFee || 150;
  const isFreeShipCoupon = appliedCoupon?.discountType === 'free_shipping';
  const shippingFee = (total >= 5000 || isFreeShipCoupon) ? 0 : defaultShipping;
  const discountAmount = appliedCoupon ? (isFreeShipCoupon ? 0 : appliedCoupon.discountAmount) : 0;
  const grandTotal = Math.max(0, total - discountAmount + shippingFee);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors(p => ({ ...p, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errs = {};
    const cleanName = form.name.trim();
    if (!cleanName) {
      errs.name = 'Full Name is required.';
    } else if (cleanName.length < 3) {
      errs.name = 'Full Name must be at least 3 characters.';
    } else if (cleanName.length > 60) {
      errs.name = 'Full Name must not exceed 60 characters.';
    } else if (!/^[\p{L}\p{M}\s'.\-()]{3,60}$/u.test(cleanName)) {
      errs.name = 'Name can only contain alphabetic letters, spaces, hyphens, apostrophes, and parentheses.';
    }

    const cleanPhoneDigits = form.phone.replace(/[\s\-\(\)]/g, '').replace(/^0092/, '+92');
    if (!cleanPhoneDigits) {
      errs.phone = 'Phone number is required.';
    } else if (!/^((\+92)?(0)?3[0-9]{9})$/.test(cleanPhoneDigits)) {
      errs.phone = 'Enter a valid Pakistani mobile number (e.g. 0321-8254922, 0092-321-4456677, or +923218254922).';
    } else if (/^(\+92|0)?3(\d)\2{8}$/.test(cleanPhoneDigits)) {
      errs.phone = 'Please enter a genuine active mobile number.';
    }

    const cleanEmail = form.email.trim();
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errs.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    const cleanStreet = form.street.trim();
    if (!cleanStreet) {
      errs.street = 'Complete street address is required.';
    } else if (cleanStreet.length < 5) {
      errs.street = 'Street address must be at least 5 characters (House #, Street, Area).';
    }

    const cleanCity = form.city.trim();
    if (!cleanCity) {
      errs.city = 'City name is required.';
    } else if (cleanCity.length < 2) {
      errs.city = 'City must be at least 2 characters.';
    }

    return { isValid: Object.keys(errs).length === 0, errors: errs };
  };

  const handleApplyCoupon = async (e) => {
    e?.preventDefault();
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    setCouponLoading(true);
    try {
      const res = await API.post('/orders/validate-coupon', {
        code: couponCode.trim(),
        subtotal: total
      });
      setAppliedCoupon(res.data);
      toast.success(res.data.message || 'Coupon applied successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast('Coupon removed', { icon: '🏷️' });
  };

  // Step 1: Triggered on form submit - validates and shows review confirmation modal
  const handleOpenReview = (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const { isValid, errors: valErrors } = validateForm();
    if (!isValid) {
      setErrors(valErrors);
      const firstError = Object.values(valErrors)[0];
      toast.error(firstError);
      return;
    }

    setErrors({});
    setShowReviewModal(true);
  };

  // Step 2: Final confirmation click from modal - guaranteed single submission
  const handleFinalSubmit = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const cleanName = form.name.trim();
      const rawPhone = form.phone.replace(/[\s\-\(\)]/g, '');
      let normalizedPhone = rawPhone;
      if (normalizedPhone.startsWith('+92')) {
        normalizedPhone = '0' + normalizedPhone.slice(3);
      } else if (normalizedPhone.startsWith('92') && normalizedPhone.length === 12) {
        normalizedPhone = '0' + normalizedPhone.slice(2);
      }

      const orderItems = items.map(i => ({ 
        product: i.product.id || i.product._id, 
        name: i.product.name, 
        image: i.product.images?.[0] || '', 
        price: Number(i.product.price), 
        quantity: Math.max(1, Number(i.quantity) || 1), 
        size: i.size || null, 
        color: (typeof i.color === 'object' ? i.color?.name : i.color) || null 
      }));
      
      const orderNotes = [
        form.notes.trim(),
        appliedCoupon ? `[Coupon: ${appliedCoupon.code} - Saved Rs. ${discountAmount}]` : ''
      ].filter(Boolean).join(' | ');

      const res = await API.post('/orders', { 
        items: orderItems, 
        shippingAddress: { 
          name: cleanName, 
          phone: normalizedPhone, 
          email: form.email.trim() || undefined,
          street: form.street.trim(), 
          city: form.city.trim(), 
          state: form.state.trim() || 'Punjab', 
          zip: form.zip.trim() || '', 
          country: 'Pakistan' 
        }, 
        paymentMethod: form.paymentMethod, 
        subtotal: total, 
        shippingFee, 
        discount: discountAmount, 
        couponCode: appliedCoupon?.code || '',
        total: grandTotal,
        notes: orderNotes
      });
      
      const createdOrder = res.data;
      clearCart();
      setShowReviewModal(false);
      toast.success('Order placed successfully! 🎉');
      setPlacedOrder({
        id: createdOrder?.id || 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        total: grandTotal,
        items: orderItems,
        paymentMethod: form.paymentMethod,
        shippingAddress: { 
          name: cleanName,
          phone: normalizedPhone,
          email: form.email.trim(),
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          zip: form.zip.trim()
        }
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // Order Confirmation View
  if (placedOrder) {
    const rawPhone = settings?.contactPhone ? settings.contactPhone.replace(/[^0-9]/g, '') : '923218254922';
    const displayPhone = settings?.contactPhone || '+92 321 8254922';
    const orderNum = placedOrder.orderNumber ? `#${placedOrder.orderNumber}` : `#${placedOrder.id.slice(-8).toUpperCase()}`;
    const waMessage = `Hello DRAKEWEARS! I have placed order ${orderNum} on the website.\nName: ${placedOrder.shippingAddress.name}\nTotal: Rs. ${placedOrder.total.toLocaleString()}\nPayment: ${placedOrder.paymentMethod}\nDelivery: 2 to 4 Working Days\nPlease confirm my order!`;
    const waUrl = `https://wa.me/${rawPhone}?text=${encodeURIComponent(waMessage)}`;

    return (
      <div className="page-wrapper" style={{ padding: '60px 16px', display: 'flex', justifyContent: 'center' }}>
        <div className="order-success-card">
          <div className="success-icon-wrap">
            <FiCheckCircle size={54} color="var(--green, #55c688)" />
          </div>
          <h1 className="success-title">Order Confirmed!</h1>
          <p className="success-subtitle">Thank you, <strong>{placedOrder.shippingAddress.name}</strong>. Your order has been placed.</p>
          
          <div className="order-details-box">
            <div className="detail-row">
              <span className="detail-label">Order Number</span>
              <span className="detail-val highlight">{orderNum}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Estimated Delivery</span>
              <span className="detail-val" style={{ color: '#55c688', fontWeight: 700 }}>2 to 4 Working Days (Max 4 Days)</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Total Amount</span>
              <span className="detail-val highlight">Rs. {placedOrder.total.toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Payment Method</span>
              <span className="detail-val">{placedOrder.paymentMethod}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Shipping To</span>
              <span className="detail-val">{placedOrder.shippingAddress.street}, {placedOrder.shippingAddress.city}</span>
            </div>
          </div>

          {placedOrder.paymentMethod === 'EasyPaisa' && (
            <div className="payment-alert-box">
              <h4 style={{ color: 'var(--gold)', marginBottom: 8, fontSize: '0.95rem' }}>EasyPaisa Payment Instructions:</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--cream)', lineHeight: 1.5 }}>
                Please transfer <strong>Rs. {placedOrder.total.toLocaleString()}</strong> to:
              </p>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 8, marginTop: 8, fontSize: '0.82rem' }}>
                <p><strong>EasyPaisa Number:</strong> 03458999091</p>
                <p><strong>Account Title:</strong> Huzaifa</p>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8 }}>
                Please send a screenshot of the payment receipt on WhatsApp with your Order ID.
              </p>
            </div>
          )}

          <div className="success-actions">
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp-confirm">
              <FiMessageSquare size={18} /> Confirm via WhatsApp
            </a>
            <Link to="/orders" className="btn-primary" style={{ textAlign: 'center', justifyContent: 'center' }}>
              View My Orders
            </Link>
            <Link to="/shop" className="btn-outline" style={{ textAlign: 'center', justifyContent: 'center' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, minHeight: '60vh' }}>
      <FiShoppingBag size={60} color="var(--text-muted)" />
      <h2 style={{ color: 'var(--cream)' }}>Your cart is empty</h2>
      <Link to="/shop" className="btn-primary">Continue Shopping</Link>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="container checkout-grid">
        {/* Form */}
        <div className="checkout-form-wrap">
          <h1 className="checkout-title">Checkout</h1>
          <form onSubmit={handleOpenReview} className="checkout-form" noValidate>
            <div className="checkout-section">
              <h3 className="checkout-section-title">1. Shipping Information</h3>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input 
                    className={`form-input ${errors.name ? 'input-error' : ''}`} 
                    name="name" 
                    autoComplete="name"
                    value={form.name} 
                    onChange={handleChange} 
                    required 
                    placeholder="Ahmed Khan" 
                  />
                  {errors.name && <span className="field-error-text">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input 
                    className={`form-input ${errors.phone ? 'input-error' : ''}`} 
                    name="phone" 
                    type="tel"
                    autoComplete="tel"
                    value={form.phone} 
                    onChange={handleChange} 
                    required 
                    placeholder="0321-8254922" 
                  />
                  {errors.phone && <span className="field-error-text">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 14 }}>
                <label className="form-label">Email Address (Optional / Recommended for order receipts)</label>
                <input 
                  className={`form-input ${errors.email ? 'input-error' : ''}`} 
                  name="email" 
                  type="email"
                  autoComplete="email"
                  value={form.email} 
                  onChange={handleChange} 
                  placeholder="customer@example.com" 
                />
                {errors.email && <span className="field-error-text">{errors.email}</span>}
              </div>

              <div className="form-group" style={{ marginTop: 14 }}>
                <label className="form-label">Complete Street Address *</label>
                <input 
                  className={`form-input ${errors.street ? 'input-error' : ''}`} 
                  name="street" 
                  autoComplete="street-address"
                  value={form.street} 
                  onChange={handleChange} 
                  required 
                  placeholder="House #5, Street 12, Block A" 
                />
                {errors.street && <span className="field-error-text">{errors.street}</span>}
              </div>

              <div className="form-row-3" style={{ marginTop: 14 }}>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input 
                    className={`form-input ${errors.city ? 'input-error' : ''}`} 
                    name="city" 
                    autoComplete="address-level2"
                    value={form.city} 
                    onChange={handleChange} 
                    required 
                    placeholder="Lahore / Karachi / Islamabad" 
                  />
                  {errors.city && <span className="field-error-text">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Province</label>
                  <input 
                    className="form-input" 
                    name="state" 
                    autoComplete="address-level1"
                    value={form.state} 
                    onChange={handleChange} 
                    placeholder="Punjab / Sindh / KPK" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Postal Code</label>
                  <input 
                    className="form-input" 
                    name="zip" 
                    autoComplete="postal-code"
                    value={form.zip} 
                    onChange={handleChange} 
                    placeholder="54000" 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 14 }}>
                <label className="form-label">Order Notes / Delivery Instructions (Optional)</label>
                <input 
                  className="form-input" 
                  name="notes" 
                  value={form.notes} 
                  onChange={handleChange} 
                  placeholder="Call before delivery, leave with guard, etc." 
                />
              </div>
            </div>

            <div className="checkout-section">
              <h3 className="checkout-section-title">2. Payment Method</h3>
              {[
                { method: 'Cash on Delivery', note: 'Pay in cash when order arrives at your door' },
                { method: 'EasyPaisa', note: 'Account: 03458999091 (Huzaifa)' }
              ].map(({ method, note }) => (
                <label key={method} className="payment-option">
                  <input type="radio" name="paymentMethod" value={method} checked={form.paymentMethod === method} onChange={handleChange} />
                  <div className="payment-label">
                    <span className="payment-name">{method}</span>
                    <span className="payment-note">{note}</span>
                  </div>
                </label>
              ))}

              {form.paymentMethod === 'EasyPaisa' && (
                <div className="payment-notice-banner">
                  ⚡ <strong>EasyPaisa Instructions:</strong> Please transfer the exact order amount to <strong>03458999091 (Account Title: Huzaifa)</strong> and send the payment screenshot on WhatsApp after placing the order.
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1.05rem', fontWeight: 700 }} disabled={loading}>
              Review & Place Order — Rs. {grandTotal.toLocaleString()}
            </button>
          </form>
        </div>

        {/* Order Summary & Coupon */}
        <div className="order-summary">
          <h3 className="summary-title">Order Summary</h3>
          <div className="summary-items">
            {items.map(item => (
              <div key={item.key} className="summary-item">
                <div className="summary-item-img">
                  <img src={item.product.images?.[0]} alt={item.product.name} />
                  <span className="summary-item-qty">{item.quantity}</span>
                </div>
                <div className="summary-item-info">
                  <span className="summary-item-name">{item.product.name}</span>
                  {[item.size ? `Size: ${item.size}` : '', (typeof item.color === 'object' ? item.color?.name : item.color) ? `Color: ${typeof item.color === 'object' ? item.color?.name : item.color}` : ''].filter(Boolean).length > 0 && (
                    <span className="summary-item-meta">
                      {[item.size ? `Size: ${item.size}` : '', (typeof item.color === 'object' ? item.color?.name : item.color) ? `Color: ${typeof item.color === 'object' ? item.color?.name : item.color}` : ''].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </div>
                <span className="summary-item-price">Rs. {(item.product.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Coupon Input */}
          <div className="coupon-box">
            <span className="coupon-label"><FiTag size={14} /> Have a Coupon Code?</span>
            {!appliedCoupon ? (
              <form onSubmit={handleApplyCoupon} className="coupon-input-group">
                <input 
                  type="text" 
                  className="coupon-input" 
                  placeholder="e.g. DRAKEFREESHIP / DRAKE10" 
                  value={couponCode} 
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  disabled={couponLoading}
                />
                <button type="submit" className="coupon-btn" disabled={couponLoading || !couponCode.trim()}>
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </form>
            ) : (
              <div className="applied-coupon-tag">
                <div className="applied-coupon-info">
                  <span className="coupon-code-badge">✓ {appliedCoupon.code}</span>
                  <span className="applied-coupon-saved">Saved Rs. {discountAmount.toLocaleString()}</span>
                </div>
                <button type="button" onClick={handleRemoveCoupon} className="remove-coupon-btn" title="Remove Coupon">
                  <FiX size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="summary-totals">
            <div className="summary-row">
              <span className="summary-row-label">Subtotal</span>
              <span className="summary-row-val">Rs. {total.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="summary-row discount">
                <span className="summary-row-label">Discount ({appliedCoupon?.code})</span>
                <span className="summary-row-val">- Rs. {discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="summary-row">
              <span className="summary-row-label">Shipping</span>
              <span className="summary-row-val">
                {shippingFee === 0 ? <strong style={{ color: 'var(--green)' }}>FREE</strong> : `Rs. ${shippingFee.toLocaleString()}`}
              </span>
            </div>
            {shippingFee > 0 && (
              <p className="free-ship-note">
                Add Rs. {(5000 - total).toLocaleString()} more for free shipping or use code <strong>DRAKEFREESHIP</strong>
              </p>
            )}

            <div className="summary-row total-row">
              <span>Total Amount</span>
              <span className="total-amount">Rs. {grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
