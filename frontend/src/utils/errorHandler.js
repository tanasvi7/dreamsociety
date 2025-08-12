// Error Handling Utility for Production
// This utility provides centralized error handling and user feedback

export class AppError extends Error {
  constructor(message, type = 'general', code = null, details = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 'validation', 'VALIDATION_ERROR', { field });
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class NetworkError extends AppError {
  constructor(message, originalError = null) {
    super(message, 'network', 'NETWORK_ERROR', { originalError });
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message, action = null) {
    super(message, 'authentication', 'AUTH_ERROR', { action });
    this.name = 'AuthenticationError';
  }
}

// Error types mapping
export const ERROR_TYPES = {
  // Network errors
  NETWORK_OFFLINE: 'No internet connection. Please check your network and try again.',
  NETWORK_TIMEOUT: 'Request timed out. Please try again.',
  NETWORK_SERVER_ERROR: 'Server error. Please try again later.',
  NETWORK_SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again later.',
  
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password. Please check your credentials.',
  AUTH_SESSION_EXPIRED: 'Your session has expired. Please login again.',
  AUTH_ACCOUNT_LOCKED: 'Your account has been locked. Please contact support.',
  AUTH_EMAIL_NOT_VERIFIED: 'Please verify your email address before logging in.',
  
  // Registration errors
  REG_EMAIL_EXISTS: 'Email address is already registered. Please try a different email address.',
  REG_PHONE_EXISTS: 'Phone number is already registered. Please try a different phone number.',
  REG_BOTH_EXIST: 'Email and phone number are already registered. Please use different credentials.',
  REG_IN_PROGRESS: 'Registration already in progress. Please check your email for OTP.',
  REG_SESSION_EXPIRED: 'Registration session expired. Please start registration again.',
  
  // OTP errors
  OTP_INVALID: 'Invalid OTP. Please check and try again.',
  OTP_EXPIRED: 'OTP has expired. Please request a new one.',
  OTP_MAX_ATTEMPTS: 'Too many failed attempts. Please request a new OTP.',
  OTP_NOT_FOUND: 'No pending registration found. Please start registration again.',
  
  // Validation errors
  VALIDATION_REQUIRED: 'This field is required.',
  VALIDATION_EMAIL: 'Please enter a valid email address.',
  VALIDATION_PHONE: 'Please enter a valid phone number.',
  VALIDATION_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, and number.',
  VALIDATION_PASSWORD_MISMATCH: 'Passwords do not match.',
  VALIDATION_NAME_LENGTH: 'Name must be between 2 and 50 characters.',
  
  // General errors
  GENERAL_ERROR: 'An unexpected error occurred. Please try again.',
  GENERAL_TIMEOUT: 'Operation timed out. Please try again.',
  GENERAL_SERVICE_UNAVAILABLE: 'Service is currently unavailable. Please try again later.',
};

// Error handler class
export class ErrorHandler {
  constructor(options = {}) {
    this.options = {
      enableLogging: true,
      enableUserFeedback: true,
      enableErrorReporting: false,
      logLevel: 'error',
      ...options
    };
    
    this.errorCount = 0;
    this.maxErrorsPerMinute = 10;
    this.errorWindow = 60000; // 1 minute
    this.recentErrors = [];
  }

  // Handle different types of errors
  handleError(error, context = {}) {
    // Increment error count
    this.errorCount++;
    
    // Add to recent errors for rate limiting
    this.addToRecentErrors(error);
    
    // Log error if enabled
    if (this.options.enableLogging) {
      this.logError(error, context);
    }
    
    // Report error if enabled
    if (this.options.enableErrorReporting) {
      this.reportError(error, context);
    }
    
    // Return user-friendly error message
    return this.getUserFriendlyMessage(error, context);
  }

  // Add error to recent errors list
  addToRecentErrors(error) {
    const now = Date.now();
    this.recentErrors.push({ error, timestamp: now });
    
    // Remove errors older than 1 minute
    this.recentErrors = this.recentErrors.filter(
      item => now - item.timestamp < this.errorWindow
    );
    
    // Check if too many errors in short time
    if (this.recentErrors.length > this.maxErrorsPerMinute) {
      console.warn('Too many errors detected. Consider implementing circuit breaker.');
    }
  }

  // Log error with context
  logError(error, context = {}) {
    const errorInfo = {
      message: error.message,
      type: error.type || 'unknown',
      code: error.code,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    switch (this.options.logLevel) {
      case 'debug':
        console.debug('Error Details:', errorInfo);
        break;
      case 'info':
        console.info('Error:', errorInfo.message, errorInfo);
        break;
      case 'warn':
        console.warn('Error:', errorInfo.message, errorInfo);
        break;
      case 'error':
      default:
        console.error('Error:', errorInfo.message, errorInfo);
        break;
    }
  }

  // Report error to external service (placeholder)
  reportError(error, context = {}) {
    // This would typically send to Sentry, LogRocket, or similar service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_map: {
          error_type: error.type,
          error_code: error.code,
        }
      });
    }
  }

  // Get user-friendly error message
  getUserFriendlyMessage(error, context = {}) {
    // If it's already an AppError, use its message
    if (error instanceof AppError) {
      return error.message;
    }
    
    // Handle axios errors
    if (error.isAxiosError) {
      return this.handleAxiosError(error);
    }
    
    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      return ERROR_TYPES.NETWORK_OFFLINE;
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return ERROR_TYPES.NETWORK_TIMEOUT;
    }
    
    // Handle HTTP errors
    if (error.response) {
      return this.handleHttpError(error.response);
    }
    
    // Handle request errors (no response)
    if (error.request) {
      return ERROR_TYPES.NETWORK_SERVER_ERROR;
    }
    
    // Default error message
    return ERROR_TYPES.GENERAL_ERROR;
  }

  // Handle axios-specific errors
  handleAxiosError(error) {
    if (error.response) {
      return this.handleHttpError(error.response);
    }
    
    if (error.code === 'ERR_NETWORK') {
      return ERROR_TYPES.NETWORK_OFFLINE;
    }
    
    if (error.code === 'ECONNABORTED') {
      return ERROR_TYPES.NETWORK_TIMEOUT;
    }
    
    return ERROR_TYPES.GENERAL_ERROR;
  }

  // Handle HTTP response errors
  handleHttpError(response) {
    const { status, data } = response;
    
    // Check for custom error message from backend
    if (data && data.message) {
      return data.message;
    }
    
    // Handle specific HTTP status codes
    switch (status) {
      case 400:
        return data?.error || ERROR_TYPES.VALIDATION_REQUIRED;
      case 401:
        return ERROR_TYPES.AUTH_INVALID_CREDENTIALS;
      case 403:
        return ERROR_TYPES.AUTH_ACCOUNT_LOCKED;
      case 404:
        return 'Service not found. Please try again later.';
      case 429:
        return 'Too many requests. Please wait before trying again.';
      case 500:
        return ERROR_TYPES.NETWORK_SERVER_ERROR;
      case 502:
      case 503:
      case 504:
        return ERROR_TYPES.NETWORK_SERVICE_UNAVAILABLE;
      default:
        return ERROR_TYPES.GENERAL_ERROR;
    }
  }

  // Create specific error types
  createValidationError(message, field = null) {
    return new ValidationError(message, field);
  }

  createNetworkError(message, originalError = null) {
    return new NetworkError(message, originalError);
  }

  createAuthenticationError(message, action = null) {
    return new AuthenticationError(message, action);
  }

  // Reset error count (useful for testing)
  reset() {
    this.errorCount = 0;
    this.recentErrors = [];
  }

  // Get error statistics
  getStats() {
    return {
      totalErrors: this.errorCount,
      recentErrors: this.recentErrors.length,
      maxErrorsPerMinute: this.maxErrorsPerMinute,
    };
  }
}

// Utility functions for ErrorDisplay component
export const getErrorColor = (errorType) => {
  switch (errorType) {
    case 'validation':
    case 'authentication':
    case 'network':
      return 'red';
    case 'warning':
      return 'yellow';
    case 'info':
      return 'blue';
    default:
      return 'red';
  }
};

export const getErrorIcon = (errorType) => {
  // You can import icons from lucide-react here if needed
  // For now, returning a simple text representation
  switch (errorType) {
    case 'validation':
      return '⚠️';
    case 'authentication':
      return '🔒';
    case 'network':
      return '🌐';
    case 'warning':
      return '⚠️';
    case 'info':
      return 'ℹ️';
    default:
      return '❌';
  }
};

// Create default error handler instance
export const errorHandler = new ErrorHandler({
  enableLogging: process.env.NODE_ENV !== 'production',
  enableUserFeedback: true,
  enableErrorReporting: process.env.NODE_ENV === 'production',
  logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
});

// Export default error handler
export default errorHandler;
