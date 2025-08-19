// apiService.ts
import axios from 'axios';

// Extend AxiosRequestConfig to include metadata
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: Date;
    };
  }
}

// API Configuration - Cleaned up URLs
const API_CONFIG = {
  // Development URL (localhost backend)
  development: 'http://103.127.146.54:3000',
  
  // Production URL (your server IP)
  production: 'http://103.127.146.54:3000'
};

// Force production API (set to true to always use production backend)
const FORCE_PRODUCTION_API = true;

// Get API URL based on environment
const getApiUrl = () => {
  // If force production is enabled, always use production URL
  if (FORCE_PRODUCTION_API) {
    console.log('Using production API URL:', API_CONFIG.production);
    return API_CONFIG.production;
  }
  
  // Check if we're in development mode (running on localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // For development, use localhost backend
    console.log('Using development API URL:', API_CONFIG.development);
    return API_CONFIG.development;
  }
  
  // For production, use production URL
  console.log('Using production API URL:', API_CONFIG.production);
  return API_CONFIG.production;
};

// Validate HTTPS in production
const validateHttps = () => {
  if (process.env.NODE_ENV === 'production' && window.location.protocol !== 'https:') {
    console.warn('⚠️ Production environment should use HTTPS');
  }
};

// Initialize HTTPS validation
validateHttps();

const api = axios.create({

  baseURL: getApiUrl(),
  timeout: process.env.NODE_ENV === 'production' ? 60000 : 60000, // 60s timeout for both production and development
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
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
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
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
    const endTime = new Date();
    const duration = endTime.getTime() - response.config.metadata?.startTime.getTime();
    console.log(`API Response: ${response.status} ${response.config.url} (${duration}ms)`);
    return response;
  },
  (error) => {
    const endTime = new Date();
    const duration = error.config?.metadata?.startTime 
      ? endTime.getTime() - error.config.metadata.startTime.getTime()
      : 'unknown';
      
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      code: error.code,
      message: error.message,
      duration: `${duration}ms`
    });

    // Enhanced error logging
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - no internet connection');
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.response) {
      console.error(`Server error ${error.response.status}: ${error.response.statusText}`);
      
      // Handle specific error codes
      if (error.response.status === 401) {
        // Token expired or invalid - redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (error.response.status === 403) {
        console.error('Access forbidden - insufficient permissions');
      } else if (error.response.status === 429) {
        console.error('Rate limit exceeded');
      }
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

// Clear pending registration
export const clearPendingRegistration = async (email: string) => {
  try {
    const response = await api.post('/auth/clear-pending-registration', { email });
    return response.data;
  } catch (error) {
    console.error('Error clearing pending registration:', error);
    throw error;
  }
};

// Secure token storage utility
export const secureTokenStorage = {
  setToken: (token: string) => {
    try {
      // In production, consider using httpOnly cookies instead of localStorage
      localStorage.setItem('token', token);
      return true;
    } catch (error) {
      console.error('Failed to store token:', error);
      return false;
    }
  },
  
  getToken: (): string | null => {
    try {
      return localStorage.getItem('token');
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  },
  
  removeToken: () => {
    try {
      localStorage.removeItem('token');
      return true;
    } catch (error) {
      console.error('Failed to remove token:', error);
      return false;
    }
  },
  
  isTokenValid: (token: string): boolean => {
    try {
      // Basic JWT validation (check if it has 3 parts)
      const parts = token.split('.');
      return parts.length === 3;
    } catch (error) {
      return false;
    }
  }
};

export default api;

export const apiPost = (...args: Parameters<typeof api.post>) => api.post(...args);
export const apiGet = (...args: Parameters<typeof api.get>) => api.get(...args);
export const apiPut = (...args: Parameters<typeof api.put>) => api.put(...args);
export const apiDelete = (...args: Parameters<typeof api.delete>) => api.delete(...args);