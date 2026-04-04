import axiosClient from "../../axiosClient";

export const adminUserServices = {
  getAllUsers: (params) => axiosClient.get("/admin/users", { params }),
  updateUserStatus: (id, payload) =>
    axiosClient.put(`/admin/users/${id}/status`, payload),
};
