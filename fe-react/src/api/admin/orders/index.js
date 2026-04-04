import axiosClient from "../../axiosClient";

export const adminOrderServices = {
  getAllOrders: (params) => axiosClient.get("/admin/orders", { params }),
  getOrderById: (id) => axiosClient.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, payload) =>
    axiosClient.put(`/admin/orders/${id}/status`, payload),
};
