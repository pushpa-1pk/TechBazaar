import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (!user?.id) {
      setCartItems([]);
      return;
    }

    const saved = localStorage.getItem(`cart_${user.id}`);
    setCartItems(saved ? JSON.parse(saved) : []);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    localStorage.setItem(`cart_${user.id}`, JSON.stringify(cartItems));
  }, [cartItems, user?.id]);

  const addToCart = (product, quantity = 1) => {
    if (!user?.id) {
      return false;
    }

    setCartItems((prev) => {
      const existing = prev.find((i) => i.product._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i.product._id === product._id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity }];
    });

    return true;
  };

  const updateQuantity = (id, quantity) => {
    if (!user?.id) {
      return;
    }

    setCartItems((prev) =>
      prev.map((i) =>
        i.product._id === id ? { ...i, quantity } : i
      )
    );
  };

  const removeFromCart = (id) => {
    if (!user?.id) {
      return;
    }

    setCartItems((prev) => prev.filter((i) => i.product._id !== id));
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
