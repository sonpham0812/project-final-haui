import axiosClient from "../../axiosClient";

export const adminProductServices = {
  getAllProducts: (params) => axiosClient.get("/admin/products", { params }),
  getProductById: (id) => axiosClient.get(`/admin/products/${id}`),
  createProduct: (data) => axiosClient.post("/admin/products", data),
  updateProduct: (id, data) => axiosClient.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => axiosClient.delete(`/admin/products/${id}`),
};
