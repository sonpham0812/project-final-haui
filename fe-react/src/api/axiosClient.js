import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosClient = axios.create({
  baseURL: BASE_URL,
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

// Flag tránh vòng lặp refresh vô hạn
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (!error.response) {
      console.error("Network error");
      return Promise.reject(error);
    }

    const { status } = error.response;
    const originalRequest = error.config;

    // Thử silent refresh khi access_token hết hạn (401)
    // _retry tránh retry vô hạn; bỏ qua endpoint /auth/* để tránh loop
    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/")
    ) {
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        // Không có refresh token → logout
        return redirectToLogin();
      }

      if (isRefreshing) {
        // Có request khác đang refresh → xếp hàng chờ
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        const { access_token } = res.data;
        localStorage.setItem("access_token", access_token);
        axiosClient.defaults.headers.Authorization = `Bearer ${access_token}`;
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        processQueue(null, access_token);
        return axiosClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        return redirectToLogin();
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error.response.data);
  },
);

const redirectToLogin = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  const isAuthPage = ["/login", "/register"].includes(window.location.pathname);
  if (!isAuthPage) window.location.href = "/login";
  return Promise.reject({ message: "Session expired" });
};

export default axiosClient;
