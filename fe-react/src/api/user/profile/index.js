import axiosClient from "../../axiosClient";

export const userProfileServices = {
  getMe: () => axiosClient.get("/me"),
  updateMe: (data) => {
    // data có thể là FormData (khi upload ảnh) hoặc JSON
    if (data instanceof FormData) {
      return axiosClient.patch("/me", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return axiosClient.patch("/me", data);
  },
  changePassword: (data) => axiosClient.patch("/me/password", data),
};
