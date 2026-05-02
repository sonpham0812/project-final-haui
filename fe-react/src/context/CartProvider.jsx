import { useState, useEffect, useCallback } from "react";
import { CartContext } from "./CartContext";
import { userCartServices } from "../api";
import useAuth from "../hooks/useAuth";

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { isAuthenticated } = useAuth();

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }
    try {
      const cart = await userCartServices.getCart();
      setCartItems(cart?.items || []);
    } catch {
      setCartItems([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount: cartItems.length,
        refreshCart,
        setCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
