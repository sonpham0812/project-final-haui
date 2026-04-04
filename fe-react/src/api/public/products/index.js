import axiosClient from "../../axiosClient";

export const publicProductServices = {
  getProducts: (params) => axiosClient.get("/products", { params }),
  getProductDetails: (id) => axiosClient.get(`/products/${id}`),
};
