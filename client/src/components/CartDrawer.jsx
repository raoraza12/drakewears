import React, { useState } from 'react';
import { FiX, FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeFromCart, updateQty, total, count } = useCart();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  // Listen for custom event to open cart (could be triggered by Navbar)
  React.useEffect(() => {
    const handleOpenCart = () => setIsOpen(true);
    window.addEventListener('open-cart', handleOpenCart);
    return () => window.removeEventListener('open-cart', handleOpenCart);
  }, [setIsOpen]);

  const handleWhatsappCheckout = (e) => {
    e.preventDefault();
    
    let itemsText = items.map(item => `${item.quantity}x ${item.product.name} (Size: ${item.size}) - $${item.product.price}`).join('\n');
    
    const message = `🛍️ *NEW CART ORDER - DRAKEWEARS*\n\n*Items:*\n${itemsText}\n\n*Total:* $${total}\n\n*Customer Details:*\nName: ${customerName}\nPhone: ${customerPhone}\nPayment: ${paymentMethod}\n\nHello drakewears! I want to confirm this order.`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '923458999091';
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
            items.map(item => (
              <div key={item.key} className="cart-item">
                <img src={item.product.images?.[0]} alt={item.product.name} className="cart-item-img" />
                <div className="cart-item-details">
                  <h4 className="text-body" style={{ fontWeight: 500 }}>{item.product.name}</h4>
                  <p className="text-caption">Size: {item.size}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span className="text-body">${item.product.price}</span>
                    <div className="qty-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-medium)', padding: '2px 8px' }}>
                      <button className="icon-btn" style={{ padding: 0 }} onClick={() => updateQty(item.key, item.quantity - 1)}><FiMinus size={12} /></button>
                      <span className="text-caption">{item.quantity}</span>
                      <button className="icon-btn" style={{ padding: 0 }} onClick={() => updateQty(item.key, item.quantity + 1)}><FiPlus size={12} /></button>
                    </div>
                  </div>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item.key)}><FiTrash2 size={16} /></button>
              </div>
            ))
          )}
        </div>
        
        <div className="cart-footer">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <span className="h3" style={{ fontSize: '1.25rem' }}>Total</span>
            <span className="h3" style={{ fontSize: '1.25rem' }}>${total}</span>
          </div>
          <button 
            className="btn-primary" 
            style={{ width: '100%' }}
            onClick={() => setShowCheckoutModal(true)}
          >
            Checkout via WhatsApp
          </button>
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
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
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
