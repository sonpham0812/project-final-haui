import axiosClient from "../../axiosClient";

export const adminCategoryServices = {
  getAllCategories: (params) =>
    axiosClient.get("/admin/categories", { params }),
  getCategoryById: (id) => axiosClient.get(`/admin/categories/${id}`),
  createCategory: (data) => axiosClient.post("/admin/categories", data),
  updateCategory: (id, data) =>
    axiosClient.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => axiosClient.delete(`/admin/categories/${id}`),
};
