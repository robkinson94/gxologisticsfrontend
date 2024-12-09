import axios from "axios";

const API = axios.create({
  baseURL: "https://gxologistics-metrics-tracker.onrender.com/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Prevent infinite retry loops
      const refreshToken = localStorage.getItem("refresh");

      if (refreshToken) {
        try {
          const { data } = await API.post("/token/refresh/", { refresh: refreshToken });
          localStorage.setItem("access", data.access); // Save the new token
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return API(originalRequest); // Retry the original request
        } catch (err) {
          console.error("Token refresh failed:", err);
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login"; // Redirect user to login
        }
      }
    }

    return Promise.reject(error); // Reject all other errors
  }
);

export default API;
