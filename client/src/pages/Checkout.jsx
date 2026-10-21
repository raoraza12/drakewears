import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiShoppingBag, FiCheckCircle, FiTag, FiX, FiMessageSquare, FiAlertCircle, FiEdit2, FiUploadCloud, FiImage } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import API from '../api';
import './Checkout.css';

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const { settings } = useSettings();

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

  const [paymentReceipt, setPaymentReceipt] = useState('');
  const [receiptUploading, setReceiptUploading] = useState(false);
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

  // Lock body scroll when review confirmation modal is active to prevent background scrolling
  useEffect(() => {
    if (showReviewModal) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [showReviewModal]);

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

    const cleanPhoneDigits = form.phone.replace(/[\s\-()]/g, '');
    if (!cleanPhoneDigits) {
      errs.phone = 'Active mobile number is required.';
    } else if (!/^((\+92|0092|92)?(0)?3[0-5][0-9]{8})$/.test(cleanPhoneDigits)) {
      errs.phone = 'Enter a valid Pakistani mobile number (e.g. 0321-8254922 or 0300-1234567).';
    } else if (/^(\+92|0092|92|0)?3(\d)\2{8}$/.test(cleanPhoneDigits)) {
      errs.phone = 'Please enter a genuine active mobile number (repeating digits rejected).';
    } else if (['12345678', '87654321', '01234567', '11223344', '00112233'].some(seq => cleanPhoneDigits.includes(seq))) {
      errs.phone = 'Please enter a genuine mobile number for delivery verification.';
    }

    const cleanEmail = form.email.trim();
    if (!cleanEmail) {
      errs.email = 'Email address is compulsory for order confirmation and tracking.';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanEmail)) {
      errs.email = 'Please enter a valid email address (e.g. customer@gmail.com).';
    }

    const cleanStreet = form.street.trim();
    if (!cleanStreet) {
      errs.street = 'Complete street delivery address is required.';
    } else if (cleanStreet.length < 10) {
      errs.street = 'Please provide detailed delivery address (House/Flat #, Street #, Sector/Area).';
    }

    const cleanCity = form.city.trim();
    if (!cleanCity) {
      errs.city = 'City name is required.';
    } else if (cleanCity.length < 2) {
      errs.city = 'City must be at least 2 characters.';
    } else if (!/^[\p{L}\p{M}\s'.-]{2,50}$/u.test(cleanCity)) {
      errs.city = 'City can only contain letters and spaces.';
    }

    if (form.paymentMethod === 'EasyPaisa' && !paymentReceipt) {
      errs.paymentReceipt = 'Please upload your EasyPaisa payment screenshot (SS) to verify payment.';
    }

    return { isValid: Object.keys(errs).length === 0, errors: errs };
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, JPEG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size cannot exceed 5MB');
      return;
    }

    setReceiptUploading(true);

    try {
      let uploadedUrl = null;

      // Primary Attempt: standard multipart FormData without manual Content-Type override
      try {
        const formData = new FormData();
        formData.append('receipt', file);
        const res = await API.post('/upload/receipt', formData);
        if (res.data?.url) {
          uploadedUrl = res.data.url;
        }
      } catch (formErr) {
        console.warn('FormData upload attempt failed, trying base64 fallback:', formErr);
      }

      // Secondary Attempt: Base64 JSON fallback for mobile/web compatibility
      if (!uploadedUrl) {
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res2 = await API.post('/upload/receipt', { imageBase64: base64Data });
        if (res2.data?.url) {
          uploadedUrl = res2.data.url;
        }
      }

      if (uploadedUrl) {
        setPaymentReceipt(uploadedUrl);
        setErrors(prev => {
          const next = { ...prev };
          delete next.paymentReceipt;
          return next;
        });
        toast.success('Payment screenshot uploaded successfully! 🎉');
      } else {
        throw new Error('Upload returned empty response');
      }
    } catch (err) {
      console.error('Receipt upload failed:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to upload screenshot. Please try again.');
    } finally {
      setReceiptUploading(false);
      try {
        e.target.value = '';
      } catch (_) {}
    }
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
      const firstKey = Object.keys(valErrors)[0];
      const targetInput = document.querySelector(`[name="${firstKey}"]`);
      if (targetInput) {
        targetInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetInput.focus();
      }
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
      const rawPhone = form.phone.replace(/[\s\-()]/g, '');
      let normalizedPhone = rawPhone;
      if (normalizedPhone.startsWith('+92')) {
        normalizedPhone = '0' + normalizedPhone.slice(3);
      } else if (normalizedPhone.startsWith('0092')) {
        normalizedPhone = '0' + normalizedPhone.slice(4);
      } else if (normalizedPhone.startsWith('92') && normalizedPhone.length === 12) {
        normalizedPhone = '0' + normalizedPhone.slice(2);
      } else if (normalizedPhone.length === 10 && normalizedPhone.startsWith('3')) {
        normalizedPhone = '0' + normalizedPhone;
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
          email: form.email.trim(),
          street: form.street.trim(), 
          city: form.city.trim(), 
          state: form.state.trim() || 'Punjab', 
          zip: form.zip.trim() || '', 
          country: 'Pakistan',
          paymentReceipt: form.paymentMethod === 'EasyPaisa' ? paymentReceipt : undefined
        }, 
        paymentMethod: form.paymentMethod, 
        paymentReceipt: form.paymentMethod === 'EasyPaisa' ? paymentReceipt : undefined,
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
        orderNumber: createdOrder?.orderNumber,
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
          <p className="success-subtitle">Thank you, <strong>{placedOrder.shippingAddress.name}</strong>. Your order has been placed. VIP Helpline: {displayPhone}</p>
          
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
            {user ? (
              <Link to="/orders" className="btn-primary" style={{ textAlign: 'center', justifyContent: 'center' }}>
                View My Orders
              </Link>
            ) : (
              <Link to={`/track?query=${placedOrder.orderNumber || placedOrder.id}`} className="btn-primary" style={{ textAlign: 'center', justifyContent: 'center' }}>
                Track Order Status
              </Link>
            )}
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
                    placeholder="Full Name" 
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
                <label className="form-label">Email Address * (Compulsory for order confirmation & tracking updates)</label>
                <input 
                  className={`form-input ${errors.email ? 'input-error' : ''}`} 
                  name="email" 
                  type="email"
                  autoComplete="email"
                  value={form.email} 
                  onChange={handleChange} 
                  required
                  placeholder="e.g. customer@gmail.com" 
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
                    list="pak-cities"
                    autoComplete="address-level2"
                    value={form.city} 
                    onChange={handleChange} 
                    required 
                    placeholder="Lahore / Karachi / Islamabad" 
                  />
                  <datalist id="pak-cities">
                    <option value="Karachi" />
                    <option value="Lahore" />
                    <option value="Islamabad" />
                    <option value="Rawalpindi" />
                    <option value="Faisalabad" />
                    <option value="Multan" />
                    <option value="Peshawar" />
                    <option value="Quetta" />
                    <option value="Sialkot" />
                    <option value="Gujranwala" />
                    <option value="Hyderabad" />
                    <option value="Bahawalpur" />
                    <option value="Sargodha" />
                    <option value="Abbottabad" />
                    <option value="Sukkur" />
                    <option value="Gujrat" />
                    <option value="Mardan" />
                    <option value="Kasur" />
                    <option value="Sahiwal" />
                    <option value="Wah Cantt" />
                    <option value="Mirpur" />
                  </datalist>
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
                <div className="easypaisa-upload-card" style={{ marginTop: '16px', padding: '18px', background: 'var(--bg-card, #121217)', border: '1px solid #38bdf844', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, color: '#38bdf8', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      ⚡ EasyPaisa Transfer Details
                    </h4>
                    <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      Step 1: Send Money
                    </span>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-light, #282830)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary, #aaa)', fontSize: '13px' }}>Account Title:</span>
                      <strong style={{ color: 'var(--text-primary, #fff)', fontSize: '14px' }}>Huzaifa</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary, #aaa)', fontSize: '13px' }}>EasyPaisa Number:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: '#55c688', fontSize: '15px', letterSpacing: '0.5px' }}>0345-8999091</strong>
                        <button 
                          type="button" 
                          onClick={() => { 
                            navigator.clipboard.writeText('03458999091'); 
                            toast.success('EasyPaisa number copied! 📋'); 
                          }}
                          style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary, #aaa)', fontSize: '13px' }}>Exact Amount:</span>
                      <strong style={{ color: '#c9a84c', fontSize: '16px' }}>Rs. {grandTotal.toLocaleString()}</strong>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-light, #282830)', paddingTop: '14px' }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary, #fff)' }}>Step 2: Upload Payment Screenshot (SS) *</span>
                      <span style={{ fontSize: '11px', color: '#888' }}>Required for approval</span>
                    </label>

                    {!paymentReceipt && !receiptUploading && (
                      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '22px 16px', border: '2px dashed #444', borderRadius: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', textAlign: 'center', transition: 'border-color 0.2s' }}>
                        <FiUploadCloud size={28} color="#38bdf8" style={{ marginBottom: '8px' }} />
                        <span style={{ fontSize: '13px', color: 'var(--text-primary, #eee)', fontWeight: 600 }}>Tap or Click to Select Screenshot (SS)</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted, #888)', marginTop: '4px' }}>Supports JPG, PNG, WEBP (Max 5MB)</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleReceiptUpload} 
                          style={{ display: 'none' }} 
                        />
                      </label>
                    )}

                    {receiptUploading && (
                      <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid #333' }}>
                        <div style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <span>⏳</span> Uploading payment screenshot...
                        </div>
                      </div>
                    )}

                    {paymentReceipt && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(85, 198, 136, 0.08)', border: '1px solid rgba(85, 198, 136, 0.35)', padding: '10px 14px', borderRadius: '8px' }}>
                        <img src={paymentReceipt} alt="Receipt Preview" style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #444' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ color: '#55c688', fontSize: '13px', fontWeight: 700 }}>✓ Screenshot Attached</div>
                          <div style={{ color: 'var(--text-muted, #aaa)', fontSize: '11px', marginTop: '2px' }}>Admin will verify this proof to approve your order</div>
                        </div>
                        <label style={{ cursor: 'pointer', color: '#38bdf8', fontSize: '12px', fontWeight: 600, textDecoration: 'underline' }}>
                          Change
                          <input type="file" accept="image/*" onChange={handleReceiptUpload} style={{ display: 'none' }} />
                        </label>
                      </div>
                    )}

                    {errors.paymentReceipt && (
                      <span className="field-error-text" style={{ display: 'block', marginTop: '6px', color: '#ef4444' }}>
                        {errors.paymentReceipt}
                      </span>
                    )}
                  </div>
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
                <span className="summary-item-price">Rs. {((Number(item.product?.price) || 0) * (Number(item.quantity) || 1)).toLocaleString()}</span>
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

      {/* Pre-Order Confirmation Review Modal */}
      {showReviewModal && (
        <div className="checkout-modal-overlay" onClick={() => !loading && setShowReviewModal(false)}>
          <div className="checkout-review-card" onClick={e => e.stopPropagation()}>
            <div className="checkout-review-header">
              <div>
                <h3 className="checkout-review-title">Review & Confirm Your Order</h3>
                <p className="checkout-review-subtitle">Please double-check your shipping details before finalizing.</p>
              </div>
              <button 
                type="button" 
                className="review-modal-close" 
                onClick={() => !loading && setShowReviewModal(false)}
                aria-label="Close review modal"
              >
                <FiX size={20} />
              </button>
            </div>
            
            {/* Scrollable Body Content */}
            <div className="checkout-review-body">
              {/* Delivery Information */}
              <div className="review-info-section">
                <h4 className="review-info-heading">Delivery Information</h4>
                <div className="review-row">
                  <span className="review-label">Recipient:</span>
                  <span className="review-value">{form.name}</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Phone:</span>
                  <span className="review-value">{form.phone}</span>
                </div>
                {form.email && (
                  <div className="review-row">
                    <span className="review-label">Email:</span>
                    <span className="review-value">{form.email}</span>
                  </div>
                )}
                <div className="review-row">
                  <span className="review-label">Delivery Address:</span>
                  <span className="review-value">{form.street}, {form.city}, {form.state} {form.zip}</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Payment Mode:</span>
                  <span className="review-value">{form.paymentMethod}</span>
                </div>
                {form.paymentMethod === 'EasyPaisa' && paymentReceipt && (
                  <div className="review-row" style={{ alignItems: 'center' }}>
                    <span className="review-label">Payment Proof (SS):</span>
                    <span className="review-value" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <img src={paymentReceipt} alt="Payment SS" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #444' }} />
                      <span style={{ color: '#55c688', fontSize: '12px' }}>✓ Attached</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Pricing Summary */}
              <div className="review-info-section">
                <h4 className="review-info-heading">Order Total</h4>
                <div className="review-row">
                  <span className="review-label">Items ({items.reduce((acc, i) => acc + i.quantity, 0)}):</span>
                  <span className="review-value">Rs. {total.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="review-row" style={{ color: 'var(--green, #55c688)' }}>
                    <span className="review-label">Discount ({appliedCoupon?.code}):</span>
                    <span className="review-value">- Rs. {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="review-row">
                  <span className="review-label">Delivery Shipping:</span>
                  <span className="review-value">{shippingFee === 0 ? 'FREE' : `Rs. ${shippingFee.toLocaleString()}`}</span>
                </div>
                <div className="review-row review-total-row">
                  <span className="review-total-label">Total Payable:</span>
                  <span className="review-total-val">Rs. {grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="review-modal-actions">
              <button 
                type="button" 
                className="btn-review-edit" 
                onClick={() => setShowReviewModal(false)}
                disabled={loading}
              >
                Edit Details
              </button>
              <button 
                type="button" 
                className="btn-review-confirm" 
                onClick={handleFinalSubmit}
                disabled={loading}
              >
                {loading ? 'Confirming Order...' : 'Confirm & Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
