import { Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import './Cart.css';

export default function Cart() {
  const { items, updateQty, removeFromCart, total, clearCart } = useCart();
  const { settings } = useSettings();
  const defaultShipping = settings?.shippingFee || 150;
  const shippingFee = total >= 5000 ? 0 : defaultShipping;

  if (items.length === 0) return (
    <div className="page-wrapper empty-page">
      <FiShoppingBag size={64} color="var(--text-muted)" />
      <h2>Your bag is empty</h2>
      <p>Looks like you haven't added anything yet</p>
      <Link to="/shop" className="btn-primary">Browse Collection</Link>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="container cart-page-grid">
        <div className="cart-items-wrap">
          <div className="cart-page-header">
            <h1 className="cart-page-title">Shopping Bag</h1>
            <button className="clear-btn" onClick={clearCart}>Clear All</button>
          </div>
          {items.map(item => (
            <div key={item.key} className="cart-page-item">
              <Link to={`/shop/${item.product.slug}`} className="cart-page-img">
                <img src={item.product.images?.[0]} alt={item.product.name} />
              </Link>
              <div className="cart-page-info">
                <div className="cart-page-info-top">
                  <div>
                    <p className="cart-page-cat">{item.product.category}</p>
                    <Link to={`/shop/${item.product.slug}`} className="cart-page-name">{item.product.name}</Link>
                    <div className="cart-page-meta">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>{item.color.name}</span>}
                    </div>
                  </div>
                  <button className="cart-page-remove" onClick={() => removeFromCart(item.key)}><FiTrash2 size={16} /></button>
                </div>
                <div className="cart-page-info-bottom">
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => updateQty(item.key, item.quantity - 1)}><FiMinus size={12} /></button>
                    <span className="qty-val">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.key, item.quantity + 1)}><FiPlus size={12} /></button>
                  </div>
                  <span className="cart-page-price">Rs. {(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-summary-box">
          <h3 className="cart-summary-title">Order Summary</h3>
          <div className="cart-summary-rows">
            <div className="cart-summary-row"><span>Subtotal ({items.reduce((a,i) => a + i.quantity, 0)} items)</span><span>Rs. {total.toLocaleString()}</span></div>
            <div className="cart-summary-row"><span>Shipping</span><span>{shippingFee === 0 ? <span style={{color:'var(--green)'}}>FREE</span> : `Rs. ${shippingFee}`}</span></div>
            {shippingFee > 0 && <p style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>Add Rs. {(5000 - total).toLocaleString()} more for free delivery</p>}
            <div className="cart-summary-row total"><span>Total</span><span style={{color:'var(--gold)'}}>Rs. {(total + shippingFee).toLocaleString()}</span></div>
          </div>
          <Link to="/checkout" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '15px' }}>Proceed to Checkout</Link>
          <Link to="/shop" className="btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 12 }}>Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
