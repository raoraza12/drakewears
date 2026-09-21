import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('drakewears_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('drakewears_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, size, color, quantity = 1) => {
    if (product.stock !== undefined && product.stock <= 0) {
      toast.error(`Sorry, ${product.name} is currently out of stock!`);
      return;
    }

    const sizeVal = size || '';
    const colorName = typeof color === 'string' ? color : (color?.name || '');
    const colorObj = colorName ? (typeof color === 'object' && color.hex ? color : { name: colorName }) : null;
    const key = `${product.id || product._id}-${sizeVal}-${colorName}`;

    setItems(prev => {
      const existing = prev.find(i => i.key === key);
      const currentQty = existing ? existing.quantity : 0;
      const targetQty = currentQty + quantity;

      if (product.stock !== undefined && targetQty > product.stock) {
        toast.error(`Only ${product.stock} units available in stock!`);
        return prev;
      }

      if (existing) {
        return prev.map(i => i.key === key ? { ...i, quantity: targetQty } : i);
      }
      return [...prev, { key, product, size: sizeVal, color: colorObj, quantity }];
    });
    setIsOpen(true);
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (key) => {
    setItems(prev => prev.filter(i => i.key !== key));
  };

  const updateQty = (key, qty) => {
    if (qty <= 0) return removeFromCart(key);
    setItems(prev => prev.map(i => {
      if (i.key === key) {
        if (i.product.stock !== undefined && qty > i.product.stock) {
          toast.error(`Maximum available stock is ${i.product.stock}`);
          return i;
        }
        return { ...i, quantity: qty };
      }
      return i;
    }));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const count = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, total, isOpen, setIsOpen, addToCart, removeFromCart, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}
