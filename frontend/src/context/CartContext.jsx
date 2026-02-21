import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cartApi } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart({ items: [], total: 0, itemCount: 0 }); return; }
    try {
      setLoading(true);
      const res = await cartApi.get();
      setCart(res.data);
    } catch (e) {
      console.error('Cart fetch error', e);
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    const res = await cartApi.add({ productId, quantity });
    setCart(res.data);
  }, []);

  const updateItem = useCallback(async (itemId, quantity) => {
    const res = await cartApi.update(itemId, quantity);
    setCart(res.data);
  }, []);

  const clearCart = useCallback(async () => {
    await cartApi.clear();
    setCart({ items: [], total: 0, itemCount: 0 });
  }, []);

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addToCart, updateItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
