import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FiCheckCircle, 
  FiStar, 
  FiMessageSquare, 
  FiTruck, 
  FiShield, 
  FiUser, 
  FiEdit3, 
  FiHeart,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useSettings } from '../context/SettingsContext';
import API from '../api';
import './ProductDetail.css';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { settings } = useSettings();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const touchStartX = useRef(null);

  // Tabs state
  const [activeTab, setActiveTab] = useState('description');

  // Review submission state
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  React.useEffect(() => {
    setLoading(true);
    setError('');
    API.get(`/products/${slug}`).then(res => {
      const prod = res.data;
      setProduct(prod);
      setReviewsList(prod?.reviews || []);
      if (prod?.colors?.length > 0) {
        setSelectedColor(prod.colors[0].name);
      }
      if (prod?.sizes?.length > 0) {
        setSelectedSize(prod.sizes[0]);
      } else {
        setSelectedSize('M');
      }
      if (user?.name) {
        setReviewName(user.name);
        setCustomerName(user.name);
      }
      if (user?.phone) {
        setCustomerPhone(user.phone);
      }
      if (prod?.name) {
        document.title = `${prod.name} | DRAKEWEARS`;
      }
      setLoading(false);
    }).catch(err => {
      console.error('Product fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load product');
      setLoading(false);
    });
  }, [slug, user]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const list = [];
    if (Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (img && typeof img === 'string' && img.trim() && !list.includes(img.trim())) {
          list.push(img.trim());
        }
      });
    }
    if (Array.isArray(product.colors)) {
      product.colors.forEach(c => {
        if (c?.image && typeof c.image === 'string' && c.image.trim() && !list.includes(c.image.trim())) {
          list.push(c.image.trim());
        }
      });
    }
    return list.length > 0 ? list : ['https://via.placeholder.com/800'];
  }, [product]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [slug, product?.id, product?._id]);

  const handlePrevImage = useCallback((e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (galleryImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  }, [galleryImages.length]);

  const handleNextImage = useCallback((e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (galleryImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  }, [galleryImages.length]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNextImage();
      else handlePrevImage();
    }
    touchStartX.current = null;
  };

  // Keyboard arrow keys navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevImage, handleNextImage]);

  const handleWhatsappOrder = async (e) => {
    e.preventDefault();
    
    const chosenSize = selectedSize || (product.sizes?.length > 0 ? product.sizes[0] : '');
    const chosenColor = selectedColor || (product.colors?.length > 0 ? product.colors[0].name : '');

    // Save order to database via public endpoint (both logged in & guests)
    if (product) {
      try {
        await API.post('/orders/whatsapp', {
          items: [{
            product: product.id || product._id,
            name: product.name,
            image: product.images?.[0] || '',
            price: product.price,
            quantity: 1,
            size: chosenSize || null,
            color: chosenColor || null
          }],
          customerName,
          phoneNumber: customerPhone,
          paymentMethod,
          subtotal: product.price,
          shippingFee: 0,
          discount: 0,
          total: product.price,
          notes: `[WHATSAPP_ORDER] Product: ${product.name}${chosenSize ? `, Size: ${chosenSize}` : ''}${chosenColor ? `, Color: ${chosenColor}` : ''}`
        });
      } catch (err) {
        console.error('Failed to save WhatsApp order:', err);
      }
    }
    
    const sizeLine = chosenSize ? `\n*Size:* ${chosenSize}` : '';
    const colorLine = chosenColor ? `\n*Color:* ${chosenColor}` : '';
    const message = `🛍️ *NEW ORDER - DRAKEWEARS*\n\n*Item:* ${product?.name}${sizeLine}${colorLine}\n*Price:* Rs. ${product?.price?.toLocaleString()}\n*Name:* ${customerName}\n*Phone:* ${customerPhone}\n*Payment Method:* ${paymentMethod}\n\nHello drakewears! I want to confirm this order.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = settings?.contactPhone ? settings.contactPhone.replace(/[^0-9]/g, '') : '923218254922'; 
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
    if (!user) {
      toast.error('Please login or register to add items to your bag');
      navigate(`/login?redirect=/shop/${slug}`);
      return;
    }
    const chosenSize = selectedSize || (product.sizes?.length > 0 ? product.sizes[0] : 'M');
    const colorObj = product.colors?.find(c => c.name === selectedColor) || (selectedColor ? { name: selectedColor } : (product.colors?.[0] || null));
    addToCart(product, chosenSize, colorObj, 1);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      return toast.error('Please enter a review comment');
    }
    setSubmittingReview(true);
    try {
      const prodId = product.id || product._id;
      const res = await API.post(`/products/${prodId}/reviews`, {
        name: reviewName.trim() || 'Verified Buyer',
        rating: reviewRating,
        comment: reviewComment.trim()
      });

      toast.success(res.data?.message || 'Thank you! Your review has been submitted for admin approval.');
      setReviewComment('');
      setShowReviewForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getProductHighlights = (prod) => {
    if (!prod) return [];
    const name = (prod.name || '').toLowerCase();
    const cat = (prod.category || '').toLowerCase();
    const sub = (prod.subcategory || '').toLowerCase();

    if (name.includes('trouser') || cat.includes('trouser') || sub.includes('trouser') || name.includes('cargo')) {
      return [
        'Heavyweight Premium Cotton Twill / French Terry fabric engineered for daily wear',
        'Signature Baggy wide-leg streetwear cut with structured drape',
        'Custom branded metal hardware & reinforced eyelet detailing',
        'Deep functional cargo & utility pockets for effortless storage',
        'Elasticated waistband with durable drawstring for custom fit',
        'Reinforced double-stitch construction throughout high-stress areas'
      ];
    }

    if (name.includes('tee') || cat.includes('tee') || sub.includes('tee') || name.includes('shirt') || name.includes('drop shoulder')) {
      return [
        '100% Premium Heavyweight Combed Cotton (240+ GSM)',
        'Relaxed drop-shoulder oversized streetwear silhouette',
        'High-density screen print with durable fade-resistant graphics',
        'Pre-shrunk fabric to prevent post-wash shrinkage',
        'Ribbed thick crewneck collar with reinforced twin-needle stitching',
        'Bio-washed for ultra-soft handfeel and breathable all-day comfort'
      ];
    }

    return [
      'Premium quality heavyweight fabric engineered for longevity',
      'Custom tailored fit crafted specifically for the modern streetwear aesthetic',
      'Pre-shrunk and bio-washed for superior handfeel and durability',
      'DRAKEWEARS signature finishing and precision stitch construction'
    ];
  };

  const getProductSpecs = (prod) => {
    if (!prod) return [];
    const name = (prod.name || '').toLowerCase();
    const cat = prod.category || 'Streetwear';
    const isTrouser = name.includes('trouser') || cat.toLowerCase().includes('trouser');
    const isTee = name.includes('tee') || cat.toLowerCase().includes('tee');

    return [
      { label: 'Product Type', value: prod.subcategory || prod.category || 'Streetwear' },
      { label: 'Fabric / Material', value: prod.material || (isTrouser ? '100% Heavyweight Cotton Twill / Terry' : (isTee ? '100% Heavyweight Combed Cotton' : 'Premium Luxury Blend')) },
      { label: 'Fabric Weight', value: isTrouser ? '320 GSM Heavyweight' : (isTee ? '240 GSM Heavyweight' : 'Premium Standard') },
      { label: 'Fit Style', value: isTrouser ? 'Baggy Wide-Leg Relaxed Cut' : (isTee ? 'Oversized Drop Shoulder' : 'Tailored Fit') },
      { label: 'Sizes Available', value: prod.sizes?.join(', ') || 'S, M, L, XL, XXL' },
      { label: 'Colors Available', value: prod.colors?.map(c => c.name).join(', ') || 'Black' },
      { label: 'Wash Care', value: prod.care || 'Machine wash cold inside out with like colors. Do not bleach. Hang dry or tumble dry low. Low iron if needed.' },
      { label: 'Origin', value: 'Designed & Crafted by DRAKEWEARS' }
    ];
  };

  if (loading) {
    return <div className="page-wrapper"><main className="main-content"><div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}><p>Loading product...</p></div></main></div>;
  }
  
  if (error || !product) {
    return <div className="page-wrapper"><main className="main-content"><div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}><h2>{error || 'Product not found'}</h2><Link to="/shop" className="btn-primary" style={{ marginTop: '24px', display: 'inline-flex' }}>Back to Shop</Link></div></main></div>;
  }

  const highlights = getProductHighlights(product);
  const specs = getProductSpecs(product);
  const currentRating = product.rating || 5.0;
  const currentNumReviews = reviewsList.length || product.numReviews || 0;

  return (
    <div className="page-wrapper">
      <main className="main-content">
        <div className="container">
          <div className="product-detail-layout">
            
            {/* Product Images Gallery */}
            <div className="product-gallery">
              <div 
                className="gallery-main"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <img 
                  src={galleryImages[activeImageIndex] || 'https://via.placeholder.com/800'} 
                  alt={`${product.name} - view ${activeImageIndex + 1}`} 
                  key={activeImageIndex}
                  className="gallery-main-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://via.placeholder.com/800';
                  }}
                />

                {/* Left and Right Nav Icons on Image */}
                {galleryImages.length > 1 && (
                  <>
                    <button 
                      type="button"
                      className="gallery-nav-btn prev"
                      onClick={handlePrevImage}
                      aria-label="Previous image"
                      title="Previous image"
                    >
                      <FiChevronLeft size={22} />
                    </button>
                    <button 
                      type="button"
                      className="gallery-nav-btn next"
                      onClick={handleNextImage}
                      aria-label="Next image"
                      title="Next image"
                    >
                      <FiChevronRight size={22} />
                    </button>
                    <div className="gallery-counter-badge">
                      {activeImageIndex + 1} / {galleryImages.length}
                    </div>
                  </>
                )}
              </div>

              {/* Small Thumbnail Boxes Below Image */}
              {galleryImages.length > 1 && (
                <div className="gallery-thumbnails">
                  {galleryImages.map((img, idx) => (
                    <button 
                      key={idx} 
                      type="button"
                      className={`thumbnail-box ${activeImageIndex === idx ? 'active' : ''}`} 
                      onClick={() => setActiveImageIndex(idx)}
                      aria-label={`Select view ${idx + 1}`}
                      title={`View image ${idx + 1}`}
                    >
                      <img 
                        src={img} 
                        alt={`${product.name} thumbnail ${idx + 1}`} 
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://via.placeholder.com/150';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="product-detail-info">
              <div className="breadcrumb">
                <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span>{product.name}</span>
              </div>
              
              <div className="product-header">
                <h1 className="product-title h2" style={{ marginTop: '16px', marginBottom: '8px' }}>{product.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '2px', color: '#c9a84c' }}>
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} size={14} fill={i < Math.round(currentRating) ? '#c9a84c' : 'none'} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {currentRating} ({currentNumReviews} review{currentNumReviews !== 1 ? 's' : ''})
                  </span>
                </div>
                <div className="product-price h3" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Rs. {product.price?.toLocaleString()}</div>
              </div>
              
              <div className="product-description text-muted" style={{ marginTop: '24px', marginBottom: '32px' }}>
                <p className="text-body">
                  {product.description || 'Premium quality garment tailored for daily comfort and streetwear aesthetics.'}
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
                          if (color.image) {
                            const idx = galleryImages.indexOf(color.image);
                            if (idx !== -1) setActiveImageIndex(idx);
                          }
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
                    <span className="text-caption" style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => setActiveTab('specs')}>Size Guide</span>
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
              
              <div className="product-actions" style={{ marginTop: '36px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <button className="btn-primary" style={{ width: '100%', padding: '18px', fontSize: '1rem' }} onClick={handleAddToCart}>
                  Add to Cart
                </button>
                <button 
                  className="btn-outline" 
                  style={{ width: '100%', padding: '18px', fontSize: '1rem' }}
                  onClick={() => setShowWhatsappModal(true)}
                >
                  Order via WhatsApp
                </button>
                <button 
                  className="btn-outline wishlist-detail-btn"
                  style={{ 
                    width: '100%', 
                    padding: '14px', 
                    fontSize: '0.95rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px',
                    borderColor: isWishlisted(product.id || product._id) ? '#ef4444' : 'var(--border-medium)',
                    color: isWishlisted(product.id || product._id) ? '#ef4444' : 'inherit'
                  }}
                  onClick={() => toggleWishlist(product)}
                >
                  <FiHeart size={18} fill={isWishlisted(product.id || product._id) ? '#ef4444' : 'none'} color={isWishlisted(product.id || product._id) ? '#ef4444' : 'currentColor'} />
                  {isWishlisted(product.id || product._id) ? 'Saved in Your Wishlist ❤️' : 'Save to Wishlist'}
                </button>
              </div>

            </div>
          </div>

          {/* Product Tabs Navigation & Content */}
          <div className="product-tabs-container">
            <div className="product-tabs-nav">
              <button 
                className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button 
                className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                onClick={() => setActiveTab('specs')}
              >
                Specs
              </button>
              <button 
                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews <span className="tab-badge">{currentNumReviews}</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'qa' ? 'active' : ''}`}
                onClick={() => setActiveTab('qa')}
              >
                Shipping & Q&A
              </button>
            </div>

            {/* Tab 1: Description */}
            {activeTab === 'description' && (
              <div className="tab-content">
                <p className="description-text">
                  {product.description || 'Crafted with premium materials and signature streetwear craftsmanship, this piece delivers the perfect balance of comfort, durability, and contemporary drape.'}
                </p>

                <h3 className="highlights-title">Key Highlights & Features</h3>
                <div className="highlights-list">
                  {highlights.map((h, i) => (
                    <div key={i} className="highlight-item">
                      <FiCheckCircle size={18} className="highlight-icon" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Specs */}
            {activeTab === 'specs' && (
              <div className="tab-content">
                <div className="specs-grid">
                  {specs.map((item, i) => (
                    <div key={i} className="spec-card">
                      <span className="spec-label">{item.label}</span>
                      <span className="spec-value">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Reviews */}
            {activeTab === 'reviews' && (
              <div className="tab-content reviews-section">
                {/* Summary Header */}
                <div className="reviews-summary-header">
                  <div className="rating-score-box">
                    <span className="big-rating-number">{currentRating}</span>
                    <div>
                      <div style={{ display: 'flex', gap: '3px', color: '#c9a84c', marginBottom: '4px' }}>
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} size={18} fill={i < Math.round(currentRating) ? '#c9a84c' : 'none'} />
                        ))}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Based on {currentNumReviews} customer review{currentNumReviews !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <button 
                    className="btn-primary"
                    style={{ padding: '12px 24px', fontSize: '0.9rem' }}
                    onClick={() => setShowReviewForm(!showReviewForm)}
                  >
                    <FiEdit3 style={{ marginRight: '8px' }} />
                    {showReviewForm ? 'Close Review Form' : 'Write a Review'}
                  </button>
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} className="review-form-card animate-slide-up">
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Leave Your Review for {product.name}</h3>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Rating</label>
                      <div className="star-rating-input">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFilled = (reviewHoverRating || reviewRating) >= star;
                          return (
                            <button
                              type="button"
                              key={star}
                              className="star-btn"
                              onClick={() => setReviewRating(star)}
                              onMouseEnter={() => setReviewHoverRating(star)}
                              onMouseLeave={() => setReviewHoverRating(0)}
                            >
                              <FiStar 
                                size={26} 
                                color="#c9a84c"
                                fill={isFilled ? '#c9a84c' : 'none'} 
                              />
                            </button>
                          );
                        })}
                        <span style={{ alignSelf: 'center', fontSize: '0.9rem', marginLeft: '12px', color: 'var(--text-secondary)' }}>
                          {reviewRating} of 5 stars
                        </span>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label className="form-label">Your Name</label>
                      <input 
                        type="text" 
                        required 
                        className="form-input" 
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="e.g. Usman Ali"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label">Review Comment</label>
                      <textarea 
                        required 
                        rows={4}
                        className="form-input" 
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Tell other customers about the fabric quality, fit, and your experience..."
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="btn-primary" 
                      disabled={submittingReview}
                      style={{ padding: '14px 28px' }}
                    >
                      {submittingReview ? 'Submitting Review...' : 'Submit Review'}
                    </button>
                  </form>
                )}

                {/* Reviews List */}
                <div className="reviews-list">
                  {reviewsList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                      <FiMessageSquare size={36} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                      <p style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>No reviews yet for this product</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Be the first customer to share your thoughts!</p>
                      <button 
                        className="btn-outline" 
                        style={{ marginTop: '16px', padding: '10px 20px', fontSize: '0.85rem' }}
                        onClick={() => setShowReviewForm(true)}
                      >
                        Write the First Review
                      </button>
                    </div>
                  ) : (
                    reviewsList.map((rev) => (
                      <div key={rev.id || rev._id} className="review-item-card">
                        <div className="review-item-header">
                          <div className="reviewer-name">
                            <FiUser size={15} />
                            {rev.name}
                            <span className="verified-badge">Verified Buyer</span>
                          </div>
                          <span className="review-date">
                            {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '2px', color: '#c9a84c', marginBottom: '8px' }}>
                          {[...Array(5)].map((_, i) => (
                            <FiStar key={i} size={14} fill={i < (rev.rating || 5) ? '#c9a84c' : 'none'} />
                          ))}
                        </div>
                        <p className="review-comment">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 4: Shipping & Q&A */}
            {activeTab === 'qa' && (
              <div className="tab-content">
                <div className="qa-grid">
                  <div className="qa-card">
                    <h4><FiTruck size={20} color="#e53935" /> Nationwide Delivery</h4>
                    <p>Orders are dispatched within 24 hours. Standard courier delivery takes 3 to 5 business days across all cities in Pakistan.</p>
                  </div>

                  <div className="qa-card">
                    <h4><FiShield size={20} color="#e53935" /> Free Shipping Threshold</h4>
                    <p>Enjoy free nationwide shipping on all orders over Rs. 5,000. Flat rate Rs. 150 shipping applies on smaller orders.</p>
                  </div>

                  <div className="qa-card">
                    <h4><FiCheckCircle size={20} color="#e53935" /> Easy Exchanges & Returns</h4>
                    <p>We offer a 7-day hassle-free size exchange policy. Items must be unworn with original tags attached.</p>
                  </div>

                  <div className="qa-card">
                    <h4><FiMessageSquare size={20} color="#e53935" /> Payment Options</h4>
                    <p>Pay easily with Cash on Delivery (COD) or EasyPaisa (03458999091 - Huzaifa) at checkout or via WhatsApp.</p>
                  </div>
                </div>
              </div>
            )}

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
                    <option value="EasyPaisa">EasyPaisa (03458999091 - Huzaifa)</option>
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


