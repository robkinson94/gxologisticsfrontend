import axios from 'axios';

const API = axios.create({
  baseURL: 'https://gxologistics-metrics-tracker.onrender.com/api',
});

// Attach access token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh');
      try {
        const { data } = await axios.post('https://gxologistics-metrics-tracker.onrender.com/api/token/refresh/', {
          refresh: refreshToken,
        });
        localStorage.setItem('access', data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return axios(originalRequest);
      } catch (err) {
        console.error('Refresh token failed!', err);
      }
    }
    return Promise.reject(error);
  }
);

export default API;
