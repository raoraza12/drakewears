import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiStar } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [currentImage, setCurrentImage] = useState(product.images?.[0]);
  const wishlisted = isWishlisted(product.id || product._id);
  const discount = product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    const size = product.sizes?.[0] || '';
    const color = product.colors?.[0] || null;
    addToCart(product, size, color, 1);
  };

  return (
    <Link to={`/shop/${product.slug}`} className="product-card">
      <div className="product-card-img-wrap">
        <img src={currentImage} alt={product.name} className="product-main-img" loading="lazy" />
        <img src={product.images?.[1] || currentImage} alt={product.name} className="product-hover-img" loading="lazy" />
        <div className="product-badges">
          {product.newArrival && <span className="badge-new">New</span>}
          {discount > 0 && <span className="badge-sale">-{discount}%</span>}
          {product.bestseller && <span className="badge-best">Bestseller</span>}
        </div>
        <button
          className={`wishlist-btn ${wishlisted ? 'wishlisted' : ''}`}
          onClick={(e) => { e.preventDefault(); toggleWishlist(product.id || product._id, product.name); }}
          title="Save to Wishlist"
        >
          <FiHeart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
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
                  onMouseEnter={() => { if (color.image) setCurrentImage(color.image); }}
                  onMouseLeave={() => setCurrentImage(product.images?.[0])}
                  onClick={(e) => { e.preventDefault(); if (color.image) setCurrentImage(color.image); }}
                />
              );
            })}
          </div>
        )}
      </div>
    </Link>
  );
}
