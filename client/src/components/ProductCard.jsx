import { useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to add to cart');
      navigate('/login');
      return;
    }
    if (product.stock > 0) {
      addToCart(product, 1, product.sizes?.[0] || 'M', product.colors?.[0]?.name || 'Default');
      toast.success('Added to bag');
    }
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const isWished = isWishlisted(product._id);

  return (
    <div className="product-card maison-card" onClick={() => navigate(`/shop/${product.slug || product._id}`)}>
      <div className="product-card-img-wrap">
        <img src={product.images[0]} alt={product.name} className="product-card-img primary" />
        {product.images[1] && (
          <img src={product.images[1]} alt={product.name} className="product-card-img secondary" />
        )}
        
        {/* Badges */}
        <div className="product-badges">
          {product.newArrival && <span className="badge new">NEW</span>}
          {product.stock === 0 && <span className="badge sale">SOLD OUT</span>}
        </div>

        {/* Wishlist */}
        <button 
          className={`wishlist-btn ${isWished ? 'wishlisted' : ''}`} 
          onClick={handleWishlist}
          aria-label="Wishlist"
        >
          <FiHeart size={16} fill={isWished ? 'var(--gold)' : 'none'} stroke={isWished ? 'var(--gold)' : 'currentColor'} />
        </button>

        {/* Slide-Up Quick Add */}
        <div className="quick-add-slide">
          <button className="quick-add-btn" onClick={handleQuickAdd} disabled={product.stock === 0}>
            {product.stock > 0 ? <><FiShoppingBag size={14} /> QUICK ADD</> : 'OUT OF STOCK'}
          </button>
        </div>
      </div>

      <div className="product-card-info">
        <span className="product-category">{product.category}</span>
        <div className="product-name-row">
          <h3 className="product-name">{product.name}</h3>
        </div>
        <span className="product-price">${product.price.toFixed(2)}</span>
      </div>
    </div>
  );
}
