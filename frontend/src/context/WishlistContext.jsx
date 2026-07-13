import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [itemIds, setItemIds] = useState(() => {
    try {
      const saved = localStorage.getItem('medithrex_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('medithrex_wishlist', JSON.stringify(itemIds));
  }, [itemIds]);

  const addToWishlist = (productId) => {
    setItemIds(prev => {
      if (prev.includes(productId)) return prev;
      return [...prev, productId];
    });
  };

  const removeFromWishlist = (productId) => {
    setItemIds(prev => prev.filter(id => id !== productId));
  };

  const clearWishlist = () => setItemIds([]);

  const count = itemIds.length;

  return (
    <WishlistContext.Provider value={{ itemIds, addToWishlist, removeFromWishlist, clearWishlist, count }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);