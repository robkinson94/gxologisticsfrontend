import axios from "axios";

const API = axios.create({
  baseURL: "https://gxologistics-metrics-tracker.onrender.com/api",
});

// Public endpoints that do not require tokens
const publicEndpoints = ["/register/", "/login/", "/token/refresh/"];

// Attach access token to requests
API.interceptors.request.use((config) => {
  // Skip adding Authorization header for public endpoints
  if (!publicEndpoints.some((endpoint) => config.url?.includes(endpoint))) {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle token refresh on 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check for 401 response and ensure it's not a public endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !publicEndpoints.some((endpoint) => originalRequest.url?.includes(endpoint))
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh");

      if (refreshToken) {
        try {
          // Attempt to refresh the access token
          const { data } = await axios.post(
            "https://gxologistics-metrics-tracker.onrender.com/api/token/refresh/",
            {
              refresh: refreshToken,
            }
          );
          localStorage.setItem("access", data.access);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return axios(originalRequest);
        } catch (err) {
          console.error("Refresh token failed!", err);
          // Clear tokens if refresh fails
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
        }
      }
    }

    return Promise.reject(error);
  }
);

export default API;
