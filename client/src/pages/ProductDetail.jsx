import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [activeAccordion, setActiveAccordion] = useState(0);
  const [mainImage, setMainImage] = useState('');

  React.useEffect(() => {
    import('../api').then(module => {
      const API = module.default;
      API.get(`/products/${slug}`).then(res => {
        setProduct(res.data);
        if (res.data?.images?.length > 0) {
          setMainImage(res.data.images[0]);
        }
        if (res.data?.colors?.length > 0) {
          setSelectedColor(res.data.colors[0].name);
        }
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    });
  }, [slug]);
  
  const handleWhatsappOrder = (e) => {
    e.preventDefault();
    const message = `🛍️ *NEW ORDER - DRAKEWEARS*\n\n*Item:* ${product?.name} (Size: ${selectedSize || 'Any'})\n*Name:* ${customerName}\n*Phone:* ${customerPhone}\n*Payment Method:* ${paymentMethod}\n\nHello drakewears! I want to confirm this order.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = '923458999091'; 
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.location.href = `whatsapp://send?phone=${whatsappNumber}&text=${encodedMessage}`;
    } else {
      window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`, '_blank');
    }
    setShowWhatsappModal(false);
  };
  
  const handleAddToCart = () => {
    if (!product) return;
    const colorObj = product.colors?.find(c => c.name === selectedColor) || (selectedColor ? { name: selectedColor } : null);
    addToCart(product, selectedSize || 'M', colorObj, 1);
  };

  if (loading) {
    return <div className="page-wrapper"><main className="main-content"><div className="container">Loading product...</div></main></div>;
  }
  
  if (!product) {
    return <div className="page-wrapper"><main className="main-content"><div className="container">Product not found.</div></main></div>;
  }

  return (
    <div className="page-wrapper">
      <main className="main-content">
        <div className="container">
          <div className="product-detail-layout">
            
            {/* Product Images */}
            <div className="product-gallery">
              <div className="gallery-main">
                <img src={mainImage || product.images?.[0] || 'https://via.placeholder.com/800'} alt={product.name} />
              </div>
              <div className="gallery-thumbnails">
                {product.images?.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt={`Thumbnail ${idx + 1}`} 
                    className={mainImage === img ? 'active' : ''} 
                    onClick={() => setMainImage(img)}
                  />
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="product-detail-info">
              <div className="breadcrumb">
                <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span>{product.name}</span>
              </div>
              
              <div className="product-header">
                <h1 className="product-title h2" style={{ marginTop: '16px', marginBottom: '8px' }}>{product.name}</h1>
                <div className="product-price h3" style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>Rs. {product.price}</div>
              </div>
              
              <div className="product-description text-muted" style={{ marginTop: '32px', marginBottom: '40px' }}>
                <p className="text-body">
                  {product.description || 'Premium quality garment.'}
                </p>
              </div>
              
              <div className="product-variants">
                <div className="product-options">
                
                {product.colors && product.colors.length > 0 && (
                <div className="option-group" style={{ marginBottom: '24px' }}>
                  <div className="option-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span className="text-caption" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Color: <span style={{ fontWeight: 400 }}>{selectedColor}</span></span>
                  </div>
                  <div className="color-selector" style={{ display: 'flex', gap: '12px' }}>
                    {product.colors.map(color => (
                      <button 
                        key={color.name}
                        onClick={() => {
                          setSelectedColor(color.name);
                          if (color.image) setMainImage(color.image);
                        }}
                        style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          backgroundColor: (color.hex === '#000000' && color.name && color.name.toLowerCase() !== 'black') ? color.name.replace(/\s+/g, '').toLowerCase() : color.hex,
                          border: selectedColor === color.name ? '2px solid var(--border-dark)' : '1px solid var(--border-medium)',
                          padding: 0, cursor: 'pointer',
                          boxShadow: selectedColor === color.name ? 'inset 0 0 0 2px white' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                )}
                
                <div className="option-group">
                  <div className="option-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span className="text-caption" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Size</span>
                    <span className="text-caption" style={{ textDecoration: 'underline', cursor: 'pointer' }}>Size Guide</span>
                  </div>
                  <div className="size-selector">
                    {product.sizes?.length > 0 ? product.sizes.map(size => (
                      <button 
                        key={size}
                        className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    )) : (
                      ['S', 'M', 'L', 'XL'].map(size => (
                        <button 
                          key={size}
                          className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      ))
                    )}
                  </div>
                </div>
                </div>
              </div>
              
              <div className="product-actions" style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button className="btn-primary" style={{ width: '100%', padding: '20px' }} onClick={handleAddToCart}>Add to Cart</button>
                <button 
                  className="btn-outline" 
                  style={{ width: '100%', padding: '20px' }}
                  onClick={() => setShowWhatsappModal(true)}
                >
                  Order via WhatsApp
                </button>
              </div>
              
              <div className="product-accordion" style={{ marginTop: '40px' }}>
                <div className={`accordion-item ${activeAccordion === 0 ? 'active' : ''}`} style={{ borderTop: '1px solid var(--border-light)', padding: '24px 0' }}>
                  <button 
                    className="accordion-title" 
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '1.25rem', textTransform: 'uppercase' }}
                    onClick={() => setActiveAccordion(activeAccordion === 0 ? -1 : 0)}
                  >
                    <span>Details</span>
                    <span>{activeAccordion === 0 ? '-' : '+'}</span>
                  </button>
                  {activeAccordion === 0 && (
                    <div className="accordion-content animate-slide-up" style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
                      <p>A classic staple redefined. This piece features a relaxed fit, crafted from premium heavyweight cotton for maximum comfort and durability.</p>
                      <ul style={{ marginTop: '16px', paddingLeft: '20px' }}>
                        <li>100% Organic Cotton</li>
                        <li>Relaxed, slightly boxy fit</li>
                        <li>Garment dyed for vintage feel</li>
                        <li>Machine wash cold</li>
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className={`accordion-item ${activeAccordion === 1 ? 'active' : ''}`} style={{ borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', padding: '24px 0' }}>
                  <button 
                    className="accordion-title" 
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '1.25rem', textTransform: 'uppercase' }}
                    onClick={() => setActiveAccordion(activeAccordion === 1 ? -1 : 1)}
                  >
                    <span>Shipping & Returns</span>
                    <span>{activeAccordion === 1 ? '-' : '+'}</span>
                  </button>
                  {activeAccordion === 1 && (
                    <div className="accordion-content animate-slide-up" style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
                      <p>Free standard shipping on all orders over $200. Delivery typically takes 3-5 business days.</p>
                      <p style={{ marginTop: '8px' }}>Returns are accepted within 14 days of delivery. Items must be unworn with original tags attached.</p>
                    </div>
                  )}
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* WhatsApp Modal */}
        {showWhatsappModal && (
          <>
            <div className="overlay" onClick={() => setShowWhatsappModal(false)}></div>
            <div className="whatsapp-modal">
              <div className="modal-header">
                <h3 className="h3" style={{ fontSize: '1.25rem' }}>Direct WhatsApp Order</h3>
                <button className="icon-btn" onClick={() => setShowWhatsappModal(false)}>×</button>
              </div>
              <form onSubmit={handleWhatsappOrder} className="modal-body">
                <p className="text-body" style={{ marginBottom: '24px' }}>
                  Enter your details and we will direct you to WhatsApp to confirm your order for <strong>{product?.name}</strong>.
                </p>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="wa-name">Your Name</label>
                  <input 
                    type="text" 
                    id="wa-name" 
                    className="form-input" 
                    required 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="wa-phone">Contact Number</label>
                  <input 
                    type="tel" 
                    id="wa-phone" 
                    className="form-input" 
                    required 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label htmlFor="wa-payment">Payment Method</label>
                  <select 
                    id="wa-payment" 
                    className="form-input"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>Proceed to WhatsApp</button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ProductDetail;

