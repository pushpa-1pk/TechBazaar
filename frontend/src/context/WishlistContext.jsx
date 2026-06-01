import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    if (!user?.id) {
      setWishlistItems([]);
      return;
    }

    const saved = localStorage.getItem(`wishlist_${user.id}`);
    setWishlistItems(saved ? JSON.parse(saved) : []);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(wishlistItems));
  }, [wishlistItems, user?.id]);

  const toggleWishlist = (product) => {
    if (!user?.id) {
      return false;
    }

    setWishlistItems((prev) => {
      const exists = prev.some((item) => item._id === product._id);
      if (exists) {
        return prev.filter((item) => item._id !== product._id);
      }
      return [product, ...prev];
    });

    return true;
  };

  const removeFromWishlist = (id) => {
    if (!user?.id) {
      return;
    }

    setWishlistItems((prev) => prev.filter((item) => item._id !== id));
  };

  const isWishlisted = (id) => wishlistItems.some((item) => item._id === id);

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, removeFromWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
