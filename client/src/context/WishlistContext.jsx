import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState([]);

  useEffect(() => {
    if (user) {
      API.get('/users/profile').then(res => {
        setWishlistIds(res.data.wishlist?.map(p => p.id || p._id || p) || []);
      });
    } else setWishlistIds([]);
  }, [user]);

  const toggleWishlist = async (productId, productName) => {
    if (!user) { toast.error('Please login to use wishlist'); return; }
    const isIn = wishlistIds.includes(productId);
    try {
      const { data } = await API.post('/users/wishlist', { productId });
      setWishlistIds(data.wishlist);
      toast.success(isIn ? 'Removed from wishlist' : `${productName} saved to wishlist ❤️`);
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  const isWishlisted = (productId) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}
