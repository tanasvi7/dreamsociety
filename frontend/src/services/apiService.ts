// apiService.ts
import axios from 'axios';

// API Configuration - Update this URL for production
const API_CONFIG = {
  // Development URL (localhost)
  development: 'http://localhost:3000',
  
  // Production URL - Update this to your production backend URL
  production: 'https://api.dreamssociety.in'
};

// Get API URL based on environment
const getApiUrl = () => {
  // For development, always use localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return API_CONFIG.development;
  }
  
  // For production, use production URL
  // Update the production URL above to your actual backend domain
  return API_CONFIG.production;
};

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 15000, // Increased timeout for production
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    console.log('API Base URL:', getApiUrl());
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

// Check availability function with retry logic
export const checkAvailability = async (email?: string, phone?: string, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (phone) params.append('phone', phone);
      
      const response = await api.get(`/auth/check-availability?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error(`Availability check error (attempt ${attempt + 1}):`, error);
      
      // If this is the last attempt, throw the error
      if (attempt === retries) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
};

export default api;

export const apiPost = (...args: Parameters<typeof api.post>) => api.post(...args);
export const apiGet = (...args: Parameters<typeof api.get>) => api.get(...args);
export const apiPut = (...args: Parameters<typeof api.put>) => api.put(...args);
export const apiDelete = (...args: Parameters<typeof api.delete>) => api.delete(...args);