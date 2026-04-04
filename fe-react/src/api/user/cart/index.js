import axiosClient from "../../axiosClient";

export const userCartServices = {
  getCart: () => axiosClient.get("/cart"),
  addToCart: (payload) => axiosClient.post("/cart/add", payload),
  updateCartItem: (payload) => axiosClient.put("/cart/update", payload),
  removeFromCart: (productId) =>
    axiosClient.delete(`/cart/remove/${productId}`),
  clearCart: () => axiosClient.delete("/cart"),
};
