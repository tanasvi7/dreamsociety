// apiService.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // HTTP backend URL
  timeout: 10000, // 10 seconds timeout
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    console.log('Token available:', !!token);
    console.log('Token value:', token ? token.substring(0, 20) + '...' : 'null');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log('No token found, request will be made without authorization');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for debugging and error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      code: error.code,
      message: error.message
    });

    // Enhanced error logging
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - no internet connection');
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.response) {
      console.error(`Server error ${error.response.status}: ${error.response.statusText}`);
    } else if (error.request) {
      console.error('No response received from server');
    }

    return Promise.reject(error);
  }
);

export default api;

export const apiPost = (...args: Parameters<typeof api.post>) => api.post(...args);
export const apiGet = (...args: Parameters<typeof api.get>) => api.get(...args);
export const apiPut = (...args: Parameters<typeof api.put>) => api.put(...args);
export const apiDelete = (...args: Parameters<typeof api.delete>) => api.delete(...args);