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

    if (
      error.response?.status === 401 && // If the error is due to token expiration
      !originalRequest._retry && // Prevent infinite retry loops
      !publicEndpoints.some((endpoint) => originalRequest.url?.includes(endpoint)) // Don't retry for public endpoints
    ) {
      originalRequest._retry = true; // Mark the request as retried
      const refreshToken = localStorage.getItem("refresh");

      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const { data } = await axios.post(
            "https://gxologistics-metrics-tracker.onrender.com/api/token/refresh/",
            { refresh: refreshToken }
          );

          // Store the new access token
          localStorage.setItem("access", data.access);

          // Update the Authorization header and retry the original request
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return API(originalRequest);
        } catch (err) {
          console.error("Token refresh failed:", err);

          // Clear tokens and redirect to login
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
        }
      } else {
        console.warn("No refresh token available, redirecting to login.");
        window.location.href = "/login";
      }
    }

    // Reject the original error if not handled
    return Promise.reject(error);
  }
);

export default API;
