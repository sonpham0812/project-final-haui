import axiosClient from "../axiosClient";

export const categoryServices = {
  getAll() {
    return axiosClient.get("/categories");
  },
};
