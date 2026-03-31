import axiosClient from "../axiosClient";

export const productServices = {
  getProducts: (params) => axiosClient.get("/products", { params }),
  getProductDetails: (id) => axiosClient.get(`/products/${id}`),
  addProduct: (data) => axiosClient.post("/products", data),
  deleteProduct: (id) => axiosClient.delete(`/products/${id}`),
  updateProduct: (id, data) => axiosClient.put(`/products/${id}`, data),
};
