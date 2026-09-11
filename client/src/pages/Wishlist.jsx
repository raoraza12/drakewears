import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { wishlistIds } = useWishlist();

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    API.get('/users/profile').then(r => setProducts(r.data.wishlist || [])).finally(() => setLoading(false));
  }, [user, wishlistIds.length]);

  if (!user) return (
    <div className="page-wrapper empty-page">
      <FiHeart size={56} color="var(--text-muted)" />
      <p>Please <Link to="/login" style={{ color:'var(--gold)' }}>login</Link> to view wishlist</p>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 36 }}>
          <div>
            <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:'2rem', color:'var(--cream)' }}>My Wishlist</h1>
            <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginTop:6 }}>{products.length} saved item{products.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/shop" className="btn-outline" style={{ padding:'10px 20px', fontSize:'0.82rem' }}>Continue Shopping</Link>
        </div>
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20 }}>
            {[...Array(4)].map((_,i) => <div key={i} className="skeleton" style={{ aspectRatio:'3/4', borderRadius:'var(--radius-lg)' }} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-page" style={{ paddingTop:60 }}>
            <FiHeart size={56} />
            <h3 style={{ fontFamily:'Playfair Display,serif', color:'var(--cream)' }}>Your wishlist is empty</h3>
            <p style={{ fontSize:'0.9rem' }}>Save products you love and find them here</p>
            <Link to="/shop" className="btn-primary">Explore Collection</Link>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20 }}>
            {products.map(p => <ProductCard key={p.id || p._id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
