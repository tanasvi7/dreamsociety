/**
 * Network utilities for handling connectivity issues and retry logic
 * This utility provides consistent network error handling across the application
 */

// Network connectivity detection
export const checkNetworkConnectivity = async () => {
  try {
    // Try to reach a reliable endpoint with a short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    return false;
  }
};

// Clear browser caches on network errors
export const clearBrowserCaches = () => {
  try {
    // Clear service worker caches if available
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear specific auth-related localStorage items
    const authKeys = [
      'token',
      'pendingRegistrationEmail',
      'registrationTimestamp',
      'currentRegistrationEmail',
      'registrationStartTime'
    ];
    
    authKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('Browser caches cleared due to network error');
  } catch (error) {
    console.error('Error clearing browser caches:', error);
  }
};

// Enhanced retry logic with exponential backoff
export const retryWithBackoff = async (operation, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry if it's the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Don't retry certain error types
      if (error.response?.status === 400 || 
          error.response?.status === 401 || 
          error.response?.status === 403 ||
          error.response?.status === 404) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
      const totalDelay = Math.min(delay + jitter, 10000); // Max 10 seconds
      
      console.log(`Retry attempt ${attempt + 1}/${maxRetries + 1} in ${Math.round(totalDelay)}ms`);
      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }
  
  throw lastError;
};

// Network error classification
export const classifyNetworkError = (error) => {
  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    if (error.message?.includes('ERR_CONNECTION_REFUSED') || 
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('net::ERR_CONNECTION_REFUSED')) {
      return {
        type: 'backend_unavailable',
        message: 'Backend server is not running. Please start the backend server or check the connection.',
        retryable: true,
        showContactSupport: true
      };
    } else {
      return {
        type: 'network_error',
        message: 'No internet connection. Please check your network and try again.',
        retryable: true,
        showContactSupport: false
      };
    }
  } else if (error.code === 'ECONNABORTED') {
    return {
      type: 'timeout',
      message: 'Request timed out. Please try again.',
      retryable: true,
      showContactSupport: false
    };
  } else if (error.response?.status >= 500) {
    return {
      type: 'server_error',
      message: 'Server error. Please try again later or contact support.',
      retryable: true,
      showContactSupport: true
    };
  } else if (error.response?.status === 429) {
    return {
      type: 'rate_limit',
      message: 'Too many requests. Please wait a few minutes before trying again.',
      retryable: true,
      showContactSupport: false
    };
  }
  
  return {
    type: 'unknown',
    message: 'An unexpected error occurred. Please try again.',
    retryable: true,
    showContactSupport: false
  };
};

// Enhanced error handler with network-specific logic
export const handleNetworkError = async (error, operation = 'operation') => {
  console.error(`${operation} error:`, error);
  
  const errorInfo = classifyNetworkError(error);
  
  // Check network connectivity for network errors
  if (errorInfo.type === 'network_error' || errorInfo.type === 'backend_unavailable') {
    const isOnline = await checkNetworkConnectivity();
    if (!isOnline) {
      return {
        success: false,
        error: 'No internet connection detected. Please check your network connection.',
        type: 'network_offline',
        retryable: true,
        showContactSupport: false
      };
    }
  }
  
  return {
    success: false,
    error: errorInfo.message,
    type: errorInfo.type,
    retryable: errorInfo.retryable,
    showContactSupport: errorInfo.showContactSupport
  };
};
