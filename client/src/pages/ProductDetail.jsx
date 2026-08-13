import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiStar, FiTruck, FiRefreshCw, FiShield, FiMinus, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('description');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    API.get(`/products/${slug}`).then(r => {
      setProduct(r.data);
      setSelectedSize(r.data.sizes?.[0] || '');
      setSelectedColor(r.data.colors?.[0] || null);
    }).finally(() => setLoading(false));
  }, [slug]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to submit a review');
    if (!reviewComment.trim()) return toast.error('Comment is required');
    
    setReviewLoading(true);
    try {
      await API.post(`/products/${product._id}/reviews`, { rating: reviewRating, comment: reviewComment });
      toast.success('Review submitted successfully!');
      setReviewComment('');
      setReviewRating(5);
      const r = await API.get(`/products/${slug}`);
      setProduct(r.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setReviewLoading(false);
  };

  if (loading) return (
    <div className="page-wrapper" style={{ padding: '80px 0' }}>
      <div className="container product-detail-grid">
        <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 'var(--radius-lg)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 24, borderRadius: 8, width: `${80 - i * 8}%` }} />)}
        </div>
      </div>
    </div>
  );

  if (!product) return <div className="page-wrapper container" style={{ paddingTop: 120, textAlign: 'center', color: 'var(--text-muted)' }}>Product not found</div>;

  const wishlisted = isWishlisted(product._id);
  const discount = product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <Link to={`/shop?category=${product.category}`}>{product.category}</Link> / <span>{product.name}</span>
        </div>

        <div className="product-detail-grid">
          {/* Gallery */}
          <div className="product-gallery">
            <div className="gallery-thumbs">
              {product.images.map((img, i) => (
                <button key={i} className={`gallery-thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                  <img src={img} alt={`${product.name} ${i+1}`} />
                </button>
              ))}
            </div>
            <div className="gallery-main">
              <img src={product.images[activeImg]} alt={product.name} className="gallery-main-img" />
              {discount > 0 && <span className="badge-sale gallery-badge">-{discount}%</span>}
              {product.newArrival && <span className="badge-new gallery-badge-new">New</span>}
            </div>
          </div>

          {/* Info */}
          <div className="product-info">
            <div className="product-info-top">
              <span className="gold-label">{product.subcategory || product.category}</span>
              <h1 className="product-detail-name">{product.name}</h1>
              <div className="product-info-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} size={16} fill={i < Math.round(product.rating) ? '#c9a84c' : 'none'} color={i < Math.round(product.rating) ? '#c9a84c' : '#5a5468'} />
                  ))}
                </div>
                <span className="rating-val">{product.rating.toFixed(1)}</span>
                <span className="rating-count-big">({product.numReviews} reviews)</span>
              </div>
              <div className="product-info-price">
                <span className="price-big">Rs. {product.price.toLocaleString()}</span>
                {product.comparePrice > 0 && <span className="price-compare-big">Rs. {product.comparePrice.toLocaleString()}</span>}
                {discount > 0 && <span className="price-save">Save {discount}%</span>}
              </div>
            </div>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="selector-group">
                <label className="selector-label">Color: <strong>{selectedColor?.name}</strong></label>
                <div className="color-options">
                  {product.colors.map(c => (
                    <button
                      key={c.name}
                      className={`color-swatch ${selectedColor?.name === c.name ? 'active' : ''}`}
                      style={{ background: c.hex, borderColor: selectedColor?.name === c.name ? 'var(--gold)' : 'transparent' }}
                      onClick={() => setSelectedColor(c)}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="selector-group">
                <label className="selector-label">Size: <strong>{selectedSize}</strong></label>
                <div className="size-options">
                  {product.sizes.map(s => (
                    <button key={s} className={`size-option ${selectedSize === s ? 'active' : ''}`} onClick={() => setSelectedSize(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="selector-group">
              <label className="selector-label">Quantity</label>
              <div className="qty-row">
                <div className="qty-control-big">
                  <button className="qty-btn-big" onClick={() => setQty(q => Math.max(1, q - 1))}><FiMinus /></button>
                  <span className="qty-val-big">{qty}</span>
                  <button className="qty-btn-big" onClick={() => setQty(q => q + 1)}><FiPlus /></button>
                </div>
                <span className="stock-info">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="product-actions">
              <button
                className="btn-primary add-to-cart-btn"
                disabled={!product.stock}
                onClick={() => {
                  if (!user) {
                    toast.error('Please sign in to add to cart');
                    return;
                  }
                  addToCart(product, selectedSize, selectedColor, qty);
                }}
              >
                <FiShoppingBag size={18} />
                {product.stock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button
                className={`wishlist-action-btn ${wishlisted ? 'wishlisted' : ''}`}
                onClick={() => toggleWishlist(product._id, product.name)}
              >
                <FiHeart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Perks */}
            <div className="product-perks">
              <div className="perk"><FiTruck size={16} /><span>Free shipping over Rs. 5,000</span></div>
              <div className="perk"><FiRefreshCw size={16} /><span>30-day easy returns</span></div>
              <div className="perk"><FiShield size={16} /><span>Authenticity guaranteed</span></div>
            </div>

            {/* Tabs */}
            <div className="product-tabs">
              <div className="tabs-nav">
                {['description', 'details', 'reviews'].map(t => (
                  <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                ))}
              </div>
              <div className="tab-content">
                {tab === 'description' && <p className="tab-text">{product.description}</p>}
                {tab === 'details' && (
                  <div className="tab-details">
                    {product.material && <div className="detail-row"><span>Material</span><span>{product.material}</span></div>}
                    {product.care && <div className="detail-row"><span>Care</span><span>{product.care}</span></div>}
                    <div className="detail-row"><span>Category</span><span>{product.category}</span></div>
                    {product.tags?.length > 0 && <div className="detail-row"><span>Tags</span><span>{product.tags.join(', ')}</span></div>}
                  </div>
                )}
                {tab === 'reviews' && (
                  <div className="reviews-list">
                    {product.reviews?.length === 0 ? (
                      <p className="tab-text" style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first!</p>
                    ) : product.reviews?.map((r, i) => (
                      <div key={i} className="review-item">
                        <div className="review-header">
                          <strong className="review-author">{r.name}</strong>
                          <div className="stars">{[...Array(r.rating)].map((_, j) => <FiStar key={j} size={12} fill="#c9a84c" color="#c9a84c" />)}</div>
                        </div>
                        <p className="review-comment">{r.comment}</p>
                      </div>
                    ))}
                    
                    {user ? (
                      <form onSubmit={submitReview} className="review-form" style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                        <h3 style={{ marginBottom: 16 }}>Write a Review</h3>
                        <div className="form-group">
                          <label className="form-label">Rating</label>
                          <div className="stars-input" style={{ display: 'flex', gap: 4, cursor: 'pointer', marginBottom: 12 }}>
                            {[1, 2, 3, 4, 5].map(num => (
                              <FiStar key={num} size={20} fill={num <= reviewRating ? '#c9a84c' : 'none'} color="#c9a84c" onClick={() => setReviewRating(num)} />
                            ))}
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Comment</label>
                          <textarea className="form-input" rows="4" value={reviewComment} onChange={e => setReviewComment(e.target.value)} required placeholder="What did you like or dislike?"></textarea>
                        </div>
                        <button type="submit" className="btn-primary" disabled={reviewLoading}>{reviewLoading ? 'Submitting...' : 'Submit Review'}</button>
                      </form>
                    ) : (
                      <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                        <p className="tab-text">Please <Link to="/login" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>login</Link> to write a review.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
