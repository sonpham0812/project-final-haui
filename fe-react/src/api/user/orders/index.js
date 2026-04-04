import axiosClient from "../../axiosClient";

export const userOrderServices = {
  createOrder: (payload) => axiosClient.post("/orders", payload),
  getUserOrders: (params) => axiosClient.get("/orders", { params }),
  getOrderById: (id) => axiosClient.get(`/orders/${id}`),
  cancelOrder: (id) => axiosClient.post(`/orders/${id}/cancel`),
};
