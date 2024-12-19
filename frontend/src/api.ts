
import axios, { AxiosError } from 'axios';

// Create a single Axios instance for your app
const api = axios.create({
  baseURL: 'https://gxologistics-metrics-tracker.onrender.com/api/', // adjust to your backend URL
  withCredentials: true,           // crucial for HttpOnly cookies and CSRF
});

// Interceptor: automatically refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      // Attempt refresh token
      try {
        console.log('api.ts: 401 received, attempting refresh...');
        await api.post('token/refresh/', {}); 
        // If refresh succeeds, retry original request
        if (error.config) {
          return api.request(error.config);
        }
      } catch (refreshError) {
        console.error('api.ts: Token refresh failed. Logging out.');
        // Optional: dispatch a logout or redirect to login
        return Promise.reject(refreshError);
      }
    }
    // If it's not a 401 or refresh fails, propagate the error
    return Promise.reject(error);
  }
);

export default api;
