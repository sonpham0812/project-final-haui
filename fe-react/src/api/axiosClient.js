import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response) => {
    // BE thường trả data trong response.data
    return response.data;
  },
  (error) => {
    if (!error.response) {
      console.error("Network error");
      return Promise.reject(error);
    }

    const { status } = error.response;

    if (status === 401) {
      // token hết hạn — chỉ redirect nếu KHÔNG đang ở trang login/register
      const isAuthPage = ["/login", "/register"].includes(
        window.location.pathname,
      );
      if (!isAuthPage) {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error.response.data);
  },
);

export default axiosClient;
