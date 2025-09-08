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
  development: 'http://localhost:2168',
  
  // Production URL (your server IP)
  production: 'http://localhost:2168'
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

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  retryableStatuses: [429, 500, 502, 503, 504],
  retryableErrors: ['ERR_NETWORK', 'ECONNABORTED']
};

// Exponential backoff delay
const getRetryDelay = (attempt: number): number => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
};

// Check if error is retryable
const isRetryableError = (error: any): boolean => {
  if (error.response) {
    return RETRY_CONFIG.retryableStatuses.includes(error.response.status);
  }
  return RETRY_CONFIG.retryableErrors.includes(error.code);
};

// Retry wrapper function
const withRetry = async <T>(operation: () => Promise<T>, maxRetries = RETRY_CONFIG.maxRetries): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry if it's the last attempt or if error is not retryable
      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error;
      }
      
      // Don't retry rate limit errors immediately
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : getRetryDelay(attempt);
        console.log(`Rate limited. Waiting ${delay}ms before retry ${attempt + 1}/${maxRetries + 1}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        const delay = getRetryDelay(attempt);
        console.log(`Request failed. Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

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
    // Only log errors, not successful responses to reduce console noise
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
        // Add retry-after header information
        const retryAfter = error.response.headers['retry-after'];
        if (retryAfter) {
          console.log(`Rate limit retry-after: ${retryAfter} seconds`);
        }
      }
    } else if (error.request) {
      console.error('No response received from server');
    }

    return Promise.reject(error);
  }
);

// Enhanced API methods with retry logic
const apiWithRetry = {
  get: (url: string, config?: any) => withRetry(() => api.get(url, config)),
  post: (url: string, data?: any, config?: any) => withRetry(() => api.post(url, data, config)),
  put: (url: string, data?: any, config?: any) => withRetry(() => api.put(url, data, config)),
  delete: (url: string, config?: any) => withRetry(() => api.delete(url, config)),
  patch: (url: string, data?: any, config?: any) => withRetry(() => api.patch(url, data, config))
};

// Check availability function with retry logic
export const checkAvailability = async (email?: string, phone?: string, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (phone) params.append('phone', phone);
      
      const response = await apiWithRetry.get(`/auth/check-availability?${params.toString()}`);
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
    const response = await apiWithRetry.post('/auth/clear-pending-registration', { email });
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

export default apiWithRetry;

export const apiPost = (...args: Parameters<typeof apiWithRetry.post>) => apiWithRetry.post(...args);
export const apiGet = (...args: Parameters<typeof apiWithRetry.get>) => apiWithRetry.get(...args);
export const apiPut = (...args: Parameters<typeof apiWithRetry.put>) => apiWithRetry.put(...args);
export const apiDelete = (...args: Parameters<typeof apiWithRetry.delete>) => apiWithRetry.delete(...args);