import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  
  // Local storage cache for instant guest & offline wishlist
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('drakewears_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync with DB if logged in
  useEffect(() => {
    if (user) {
      API.get('/users/profile')
        .then(res => {
          const dbWishlist = res.data?.wishlist || [];
          if (Array.isArray(dbWishlist)) {
            setWishlistItems(dbWishlist);
            localStorage.setItem('drakewears_wishlist', JSON.stringify(dbWishlist));
          }
        })
        .catch(err => {
          console.warn('[Wishlist] Could not fetch user wishlist:', err?.message);
        });
    }
  }, [user]);

  // Persist to local storage whenever wishlistItems changes
  useEffect(() => {
    try {
      localStorage.setItem('drakewears_wishlist', JSON.stringify(wishlistItems));
    } catch (e) {
      console.error('[Wishlist] LocalStorage save error:', e);
    }
  }, [wishlistItems]);

  const wishlistIds = wishlistItems.map(p => p.id || p._id);

  const isWishlisted = (productId) => {
    if (!productId) return false;
    return wishlistItems.some(p => (p.id === productId || p._id === productId));
  };

  /**
   * Toggle wishlist status for a product.
   * Accepts either product object OR (productId, productName).
   */
  const toggleWishlist = async (productOrId, optionalName) => {
    const product = typeof productOrId === 'object' && productOrId !== null
      ? productOrId 
      : { id: productOrId, _id: productOrId, name: optionalName || 'Product' };

    const prodId = product.id || product._id;
    const prodName = product.name || optionalName || 'Product';
    const exists = isWishlisted(prodId);

    // Update local state immediately for instant responsive UI
    let updated;
    if (exists) {
      updated = wishlistItems.filter(p => (p.id !== prodId && p._id !== prodId));
      toast.success(`${prodName} removed from wishlist`);
    } else {
      updated = [product, ...wishlistItems.filter(p => (p.id !== prodId && p._id !== prodId))];
      toast.success(`${prodName} saved to wishlist ❤️`);
    }
    setWishlistItems(updated);

    // If logged in, sync to database in background
    if (user) {
      try {
        await API.post('/users/wishlist', { productId: prodId });
      } catch (err) {
        console.warn('[Wishlist] Backend sync failed, kept in local session:', err?.message);
      }
    }
  };

  const removeFromWishlist = (productId) => {
    const updated = wishlistItems.filter(p => (p.id !== productId && p._id !== productId));
    setWishlistItems(updated);
    if (user) {
      API.post('/users/wishlist', { productId }).catch(() => {});
    }
    toast.success('Item removed from wishlist');
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    localStorage.removeItem('drakewears_wishlist');
  };

  return (
    <WishlistContext.Provider 
      value={{ 
        wishlistItems, 
        wishlistIds, 
        count: wishlistItems.length,
        isWishlisted, 
        toggleWishlist, 
        removeFromWishlist,
        clearWishlist 
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
