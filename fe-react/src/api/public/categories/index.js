import axiosClient from "../../axiosClient";

export const publicCategoryServices = {
  getAll: () => axiosClient.get("/categories"),
};
