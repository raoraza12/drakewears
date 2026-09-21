import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import './ProductCard.css';

const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect fill='%23162421' width='400' height='500'/%3E%3Ctext fill='%23c9a84c' font-family='sans-serif' font-size='14' letter-spacing='2' font-weight='700' x='50%25' y='50%25' text-anchor='middle'%3EDRAKEWEARS%3C/text%3E%3C/svg%3E";

export default function ProductCard({ product }) {
  const cardRef = useRef(null);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [currentImage, setCurrentImage] = useState(product.images?.[0] || FALLBACK_IMG);
  const wishlisted = isWishlisted(product.id || product._id);
  const discount = product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;

  const [selectedVariantImg, setSelectedVariantImg] = useState(null);

  // 3D Perspective Tilt & Specular Glare (120 FPS GPU Accelerated)
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rx = ((y - cy) / cy) * -9;
    const ry = ((x - cx) / cx) * 9;
    cardRef.current.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
    cardRef.current.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
    cardRef.current.style.setProperty('--gx', `${((x / rect.width) * 100).toFixed(1)}%`);
    cardRef.current.style.setProperty('--gy', `${((y / rect.height) * 100).toFixed(1)}%`);
    cardRef.current.style.setProperty('--glare-op', '0.22');
  };

  const handleMouseEnter = () => {
    // If not locked into a color swatch, show secondary image on hover if available
    if (!selectedVariantImg && product.images && product.images.length > 1) {
      setCurrentImage(product.images[1]);
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--rx', '0deg');
    cardRef.current.style.setProperty('--ry', '0deg');
    cardRef.current.style.setProperty('--glare-op', '0');
    if (!selectedVariantImg && product.images && product.images.length > 0) {
      setCurrentImage(product.images[0]);
    }
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login or register to add items to your bag');
      navigate('/login');
      return;
    }
    const size = product.sizes?.[0] || 'M';
    const color = product.colors?.[0] || null;
    addToCart(product, size, color, 1);
  };

  return (
    <Link 
      to={`/shop/${product.slug}`} 
      className="product-card scroll-reveal" 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="product-card-img-wrap">
        <img 
          src={currentImage} 
          alt={product.name} 
          className="product-main-img" 
          loading="lazy" 
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
        />
        <div className="product-badges">
          {product.newArrival && <span className="badge-new">New</span>}
          {discount > 0 && <span className="badge-sale">-{discount}%</span>}
          {product.bestseller && <span className="badge-best">Bestseller</span>}
        </div>
        <button
          className={`wishlist-btn ${wishlisted ? 'wishlisted' : ''}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
          title={wishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
          aria-label={wishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
        >
          <FiHeart size={16} fill={wishlisted ? '#ef4444' : 'none'} color={wishlisted ? '#ef4444' : 'currentColor'} />
        </button>
        <div className="quick-add-overlay">
          <button className="quick-add-btn" onClick={handleQuickAdd}>
            <FiShoppingBag size={14} /> Quick Add
          </button>
        </div>
      </div>
      <div className="product-card-info">
        <p className="product-category">{product.subcategory || product.category}</p>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} size={12} fill={i < Math.round(product.rating) ? '#c9a84c' : 'none'} color={i < Math.round(product.rating) ? '#c9a84c' : '#5a5468'} />
            ))}
          </div>
          <span className="rating-count">({product.numReviews})</span>
        </div>
        <div className="product-pricing">
          <span className="product-price">Rs. {product.price.toLocaleString()}</span>
          {product.comparePrice > 0 && (
            <span className="product-compare">Rs. {product.comparePrice.toLocaleString()}</span>
          )}
        </div>
        <div className="product-sizes">
          {product.sizes?.slice(0, 5).map(s => (
            <span key={s} className="size-dot">{s}</span>
          ))}
          {product.sizes?.length > 5 && <span className="size-dot more">+{product.sizes.length - 5}</span>}
        </div>
        {product.colors && product.colors.length > 0 && (
          <div className="product-colors" style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            {product.colors.map(color => {
              const COLOR_MAP = {
                red: '#dc2626', blue: '#2563eb', navy: '#1e3a8a', lightblue: '#38bdf8',
                white: '#ffffff', black: '#000000', grey: '#6b7280', gray: '#6b7280',
                beige: '#d4b996', khaki: '#c3b091', olive: '#556b2f', green: '#16a34a',
                yellow: '#eab308', orange: '#f97316', purple: '#9333ea', pink: '#ec4899',
                brown: '#854d0e', maroon: '#800000', charcoal: '#374151', cream: '#fdfbf7'
              };
              let bg = (color.hex && color.hex !== '#000000') ? color.hex : null;
              if (!bg && color.name) {
                const cleanName = color.name.toLowerCase().replace(/\s+/g, '');
                if (COLOR_MAP[cleanName]) bg = COLOR_MAP[cleanName];
                else {
                  for (const [k, v] of Object.entries(COLOR_MAP)) {
                    if (cleanName.includes(k)) { bg = v; break; }
                  }
                }
              }
              if (!bg) bg = color.name ? color.name.replace(/\s+/g, '').toLowerCase() : (color.hex || '#000000');

              return (
                <span 
                  key={color.name} 
                  className="color-swatch" 
                  style={{ backgroundColor: bg }}
                  title={color.name}
                  onClick={(e) => { 
                    e.preventDefault(); 
                    if (color.image) {
                      setSelectedVariantImg(color.image);
                      setCurrentImage(color.image);
                    }
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </Link>
  );
}
