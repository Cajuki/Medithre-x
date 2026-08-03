import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);
const getEffectivePrice = (item) => Number(item.salePrice || item.price || 0);
const normalizeQuantity = (quantity) => Math.max(1, Math.floor(Number(quantity) || 1));

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('medithrex_cart') || '[]');
      return Array.isArray(saved)
        ? saved.filter(item => item?.id).map(item => ({ ...item, quantity: normalizeQuantity(item.quantity) }))
        : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('medithrex_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    const amount = normalizeQuantity(quantity);
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: normalizeQuantity(i.quantity) + amount } : i);
      return [...prev, { ...product, quantity: amount }];
    });
  };

  const addToCart = (product, quantity = 1) => {
    addItem(product, quantity);
  };

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const updateQuantity = (id, quantity) => {
    const amount = Number(quantity);
    if (!Number.isFinite(amount) || amount < 1) return removeItem(id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: normalizeQuantity(amount) } : i));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + getEffectivePrice(i) * normalizeQuantity(i.quantity), 0);
  const count = items.reduce((sum, i) => sum + normalizeQuantity(i.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addItem, addToCart, removeItem, updateQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
