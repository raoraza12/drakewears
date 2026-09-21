import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const { wishlistItems, count, clearWishlist } = useWishlist();

  return (
    <div className="page-wrapper" style={{ minHeight: '80vh', paddingTop: '100px', paddingBottom: '80px' }}>
      <div className="container">
        {/* Wishlist Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 2.5vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, textTransform: 'uppercase' }}>
              My Wishlist ❤️
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
              {count} {count === 1 ? 'saved item' : 'saved items'} in your personal collection
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {count > 0 && (
              <button 
                onClick={clearWishlist}
                className="btn-outline" 
                style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                <FiTrash2 size={14} /> Clear All
              </button>
            )}
            <Link to="/shop" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Empty State */}
        {count === 0 ? (
          <div className="empty-page" style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <FiHeart size={40} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px' }}>Your wishlist is empty</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto 24px' }}>
              Explore our drops, baggy trousers, and oversized tees. Click the heart icon on any product to save your favorites here!
            </p>
            <Link to="/shop" className="btn-primary" style={{ padding: '12px 28px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Explore Collection →
            </Link>
          </div>
        ) : (
          /* Products Grid */
          <div className="products-grid">
            {wishlistItems.map(product => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
