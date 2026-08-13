import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiShoppingBag } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API from '../api';
import './Checkout.css';

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: '', street: '', city: '', state: '', zip: '', country: 'Pakistan', paymentMethod: 'Cash on Delivery' });
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const shippingFee = total >= 5000 ? 0 : 150;
  const grandTotal = total + shippingFee - discount;

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (items.length === 0) return;
    setLoading(true);
    try {
      const orderItems = items.map(i => ({ product: i.product._id, name: i.product.name, image: i.product.images?.[0], price: i.product.price, quantity: i.quantity, size: i.size, color: i.color?.name || '' }));
      await API.post('/orders', { items: orderItems, shippingAddress: { name: form.name, phone: form.phone, street: form.street, city: form.city, state: form.state, zip: form.zip, country: form.country }, paymentMethod: form.paymentMethod, subtotal: total, shippingFee, discount, total: grandTotal });
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    }
    setLoading(false);
  };

  const applyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    try {
      const res = await API.post('/orders/apply-coupon', { code: couponCode });
      let val = 0;
      if (res.data.discountType === 'percentage') {
        val = (total * res.data.discountValue) / 100;
      } else {
        val = res.data.discountValue;
      }
      setDiscount(val);
      toast.success('Coupon applied successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon code');
      setDiscount(0);
    }
  };

  if (items.length === 0) return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
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
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="checkout-section">
              <h3 className="checkout-section-title">Shipping Information</h3>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" name="name" value={form.name} onChange={handleChange} required placeholder="Ahmed Khan" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" name="phone" value={form.phone} onChange={handleChange} required placeholder="0300-1234567" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input className="form-input" name="street" value={form.street} onChange={handleChange} required placeholder="House #5, Street 12, Block A" />
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" name="city" value={form.city} onChange={handleChange} required placeholder="Lahore" />
                </div>
                <div className="form-group">
                  <label className="form-label">Province</label>
                  <input className="form-input" name="state" value={form.state} onChange={handleChange} placeholder="Punjab" />
                </div>
                <div className="form-group">
                  <label className="form-label">Postal Code</label>
                  <input className="form-input" name="zip" value={form.zip} onChange={handleChange} placeholder="54000" />
                </div>
              </div>
            </div>

            <div className="checkout-section">
              <h3 className="checkout-section-title">Payment Method</h3>
              {['Cash on Delivery', 'Bank Transfer', 'JazzCash', 'EasyPaisa'].map(method => (
                <label key={method} className="payment-option">
                  <input type="radio" name="paymentMethod" value={method} checked={form.paymentMethod === method} onChange={handleChange} />
                  <div className="payment-label">
                    <span className="payment-name">{method}</span>
                    {method === 'Cash on Delivery' && <span className="payment-note">Pay when you receive</span>}
                  </div>
                </label>
              ))}
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1rem' }} disabled={loading}>
              {loading ? 'Placing Order...' : `Place Order — Rs. ${grandTotal.toLocaleString()}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
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
                  {item.size && <span className="summary-item-meta">Size: {item.size}</span>}
                </div>
                <span className="summary-item-price">Rs. {(item.product.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="summary-totals">
            <div className="summary-row"><span>Subtotal</span><span>Rs. {total.toLocaleString()}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{shippingFee === 0 ? <span style={{color:'var(--green)'}}>FREE</span> : `Rs. ${shippingFee}`}</span></div>
            {shippingFee > 0 && <p className="free-ship-note">Add Rs. {(5000 - total).toLocaleString()} more for free shipping</p>}
            
            <form onSubmit={applyCoupon} className="coupon-form" style={{ display: 'flex', gap: 8, margin: '16px 0', borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
              <input type="text" className="form-input" style={{ padding: '10px 14px' }} placeholder="Coupon code (e.g. NOOR20)" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
              <button type="submit" className="btn-outline" style={{ padding: '10px 20px' }}>Apply</button>
            </form>

            {discount > 0 && <div className="summary-row" style={{ color: 'var(--gold)' }}><span>Discount</span><span>- Rs. {discount.toLocaleString()}</span></div>}
            
            <div className="summary-row total-row"><span>Total</span><span className="total-amount">Rs. {grandTotal.toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
