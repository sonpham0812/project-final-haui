import { createContext, useContext } from "react";

export const CartContext = createContext({
  cartItems: [],
  cartCount: 0,
  refreshCart: async () => {},
  setCartItems: () => {},
});

export const useCart = () => useContext(CartContext);
