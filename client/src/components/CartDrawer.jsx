import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import API from '../api';
import './CartDrawer.css';

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeFromCart, updateQty, total, count, clearCart } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const cartUserInitRef = React.useRef(false);

  useEffect(() => {
    if (user && !cartUserInitRef.current) {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setCustomerPhone(user.phone);
      cartUserInitRef.current = true;
    }
  }, [user]);

  // Listen for custom event to open cart (could be triggered by Navbar)
  useEffect(() => {
    const handleOpenCart = () => setIsOpen(true);
    window.addEventListener('open-cart', handleOpenCart);
    return () => window.removeEventListener('open-cart', handleOpenCart);
  }, [setIsOpen]);

  const handleProceedToCheckout = () => {
    setIsOpen(false);
    if (!user) {
      toast.error('Please login or register to checkout');
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  const handleWhatsappCheckout = async (e) => {
    e.preventDefault();
    
    // Save order to database via public whatsapp orders endpoint
    try {
      const orderItems = items.map(i => ({
        product: i.product.id || i.product._id,
        name: i.product.name,
        image: i.product.images?.[0] || '',
        price: i.product.price,
        quantity: i.quantity,
        size: i.size || null,
        color: (typeof i.color === 'object' ? i.color?.name : i.color) || null
      }));
      
      await API.post('/orders/whatsapp', {
        items: orderItems,
        customerName,
        phoneNumber: customerPhone,
        paymentMethod,
        subtotal: total,
        shippingFee: 0,
        discount: 0,
        total
      });
      clearCart();
    } catch (err) {
      console.error('Failed to save WhatsApp order:', err);
      // Continue to WhatsApp even if save fails
    }
    
    let itemsText = items.map(item => {
      const colorStr = typeof item.color === 'object' ? item.color?.name : item.color;
      const meta = [item.size ? `Size: ${item.size}` : '', colorStr ? `Color: ${colorStr}` : ''].filter(Boolean).join(', ');
      return `• ${item.quantity}x ${item.product.name}${meta ? ` (${meta})` : ''} - Rs. ${(item.product.price * item.quantity).toLocaleString()}`;
    }).join('\n');
    
    const message = `🛍️ *NEW CART ORDER - DRAKEWEARS*\n\n*Items:*\n${itemsText}\n\n*Total:* Rs. ${total.toLocaleString()}\n\n*Customer Details:*\nName: ${customerName}\nPhone: ${customerPhone}\nPayment: ${paymentMethod}\n\nHello drakewears! I want to confirm this order.`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = settings?.contactPhone ? settings.contactPhone.replace(/[^0-9]/g, '') : '923218254922';
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = `whatsapp://send?phone=${whatsappNumber}&text=${encodedMessage}`;
    } else {
      window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`, '_blank');
    }
    setShowCheckoutModal(false);
    setIsOpen(false);
  };



  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)}></div>}
      
      {/* Drawer */}
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2 className="h3">Your Cart ({count})</h2>
          <button className="icon-btn" onClick={() => setIsOpen(false)}><FiX size={24} /></button>
        </div>
        
        <div className="cart-body">
          {items.length === 0 ? (
            <p className="text-body text-center" style={{ marginTop: '40px' }}>Your cart is empty.</p>
          ) : (
            items.map(item => {
              const colorStr = typeof item.color === 'object' ? item.color?.name : item.color;
              const metaText = [item.size ? `Size: ${item.size}` : '', colorStr ? `Color: ${colorStr}` : ''].filter(Boolean).join(' • ');
              return (
                <div key={item.key} className="cart-item">
                  <img src={item.product.images?.[0]} alt={item.product.name} className="cart-item-img" />
                  <div className="cart-item-details">
                    <h4 className="text-body" style={{ fontWeight: 500 }}>{item.product.name}</h4>
                    {metaText && <p className="text-caption">{metaText}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <span className="text-body">Rs. {item.product.price.toLocaleString()}</span>
                      <div className="qty-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-medium)', padding: '2px 8px' }}>
                        <button className="icon-btn" style={{ padding: 0 }} onClick={() => updateQty(item.key, item.quantity - 1)}><FiMinus size={12} /></button>
                        <span className="text-caption">{item.quantity}</span>
                        <button className="icon-btn" style={{ padding: 0 }} onClick={() => updateQty(item.key, item.quantity + 1)}><FiPlus size={12} /></button>
                      </div>
                    </div>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.key)}><FiTrash2 size={16} /></button>
                </div>
              );
            })
          )}
        </div>
        
        <div className="cart-footer">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span className="h3" style={{ fontSize: '1.25rem' }}>Total</span>
            <span className="h3" style={{ fontSize: '1.25rem' }}>Rs. {total.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '14px', fontSize: '0.95rem' }}
              onClick={handleProceedToCheckout}
              disabled={items.length === 0}
            >
              Proceed to Checkout
            </button>
            <button 
              className="btn-outline" 
              style={{ width: '100%', padding: '12px', fontSize: '0.9rem', borderColor: '#25D366', color: '#25D366' }}
              onClick={() => setShowCheckoutModal(true)}
              disabled={items.length === 0}
            >
              Order via WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <>
          <div className="overlay" style={{ zIndex: 1002 }} onClick={() => setShowCheckoutModal(false)}></div>
          <div className="whatsapp-modal" style={{ zIndex: 1003 }}>
            <div className="modal-header">
              <h3 className="h3" style={{ fontSize: '1.25rem' }}>Confirm Details</h3>
              <button className="icon-btn" onClick={() => setShowCheckoutModal(false)}>×</button>
            </div>
            <form onSubmit={handleWhatsappCheckout} className="modal-body">
              <p className="text-body" style={{ marginBottom: '24px' }}>
                Please provide your details. Your cart will be sent via WhatsApp to confirm the order.
              </p>
              
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="cart-name">Your Name</label>
                <input type="text" id="cart-name" className="form-input" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
              
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="cart-phone">Contact Number</label>
                <input type="tel" id="cart-phone" className="form-input" required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
              </div>
              
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label htmlFor="cart-payment">Payment Method</label>
                <select id="cart-payment" className="form-input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                  <option value="EasyPaisa">EasyPaisa (03458999091 - Huzaifa)</option>
                </select>
              </div>
              
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Send Cart to WhatsApp</button>
            </form>
          </div>
        </>
      )}
    </>
  );
};

export default CartDrawer;
