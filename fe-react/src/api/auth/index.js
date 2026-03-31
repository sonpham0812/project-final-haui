import axiosClient from "../axiosClient";

export const authServices = {
  login: (payload) => axiosClient.post("/auth/login", payload),
  register: (payload) => axiosClient.post("/auth/register", payload),
};
