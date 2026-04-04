import axiosClient from "../../axiosClient";

export const adminDashboardServices = {
  getDashboard: (params) => axiosClient.get("/admin/dashboard", { params }),
};
