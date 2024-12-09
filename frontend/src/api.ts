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
    console.log("Interceptor Request - Access token:", token); // Debug: Log token being attached
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else {
    console.log("Interceptor Request - Public endpoint detected:", config.url);
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
      console.log("401 Unauthorized - Attempting token refresh");
      originalRequest._retry = true; // Mark the request as retried

      const refreshToken = localStorage.getItem("refresh");
      console.log("Refresh token:", refreshToken); // Debug: Log refresh token

      if (refreshToken) {
        try {
          // Attempt to refresh the token
          console.log("Sending request to refresh token");
          const { data } = await axios.post(
            "https://gxologistics-metrics-tracker.onrender.com/api/token/refresh/",
            { refresh: refreshToken }
          );

          console.log("Token refreshed successfully:", data); // Debug: Log new access token
          // Store the new access token
          localStorage.setItem("access", data.access);

          // Update the Authorization header and retry the original request
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return API(originalRequest);
        } catch (err) {
          console.log("Token refresh failed - Response from server:", err.response);
          console.log("Token refresh failed - Error details:", err);

          // Clear tokens and redirect to login
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          console.log("Redirecting to login due to refresh failure.");
          window.location.href = "/login";
        }
      } else {
        console.log("No refresh token available, redirecting to login.");
        window.location.href = "/login";
      }
    } else if (error.response?.status === 500) {
      console.log("500 Server Error:", error.response.data);
    }

    // Reject the original error if not handled
    console.log("Request error (unhandled):", error);
    return Promise.reject(error);
  }
);

export default API;
