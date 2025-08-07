// errorHandler.js
export const getErrorMessage = (error) => {
  if (error.code === 'ERR_NETWORK') {
    return {
      message: 'No internet connection. Please check your network and try again.',
      type: 'network',
      icon: 'wifi-off',
      action: 'retry'
    };
  }
  
  if (error.code === 'ECONNABORTED') {
    return {
      message: 'Request timed out. Please try again.',
      type: 'timeout',
      icon: 'clock',
      action: 'retry'
    };
  }
  
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        return {
          message: data?.error || 'Invalid request. Please check your input.',
          type: 'validation',
          icon: 'alert-circle',
          action: 'fix_input'
        };
      case 401:
        return {
          message: 'Invalid credentials. Please check your email and password.',
          type: 'credentials',
          icon: 'lock',
          action: 'check_credentials'
        };
      case 403:
        return {
          message: 'Access denied. Please contact support if this persists.',
          type: 'access_denied',
          icon: 'shield-x',
          action: 'contact_support'
        };
      case 404:
        return {
          message: 'Service not found. Please try again later.',
          type: 'not_found',
          icon: 'search',
          action: 'retry'
        };
      case 429:
        return {
          message: 'Too many requests. Please wait before trying again.',
          type: 'rate_limit',
          icon: 'timer',
          action: 'wait'
        };
      case 500:
        return {
          message: 'Server error. Our team has been notified.',
          type: 'server_error',
          icon: 'server',
          action: 'retry'
        };
      case 502:
      case 503:
      case 504:
        return {
          message: 'Service temporarily unavailable. Please try again later.',
          type: 'service_unavailable',
          icon: 'wifi',
          action: 'retry'
        };
      default:
        return {
          message: data?.error || 'An unexpected error occurred.',
          type: 'unknown',
          icon: 'help-circle',
          action: 'retry'
        };
    }
  }
  
  if (error.request) {
    return {
      message: 'No response from server. Please check your connection.',
      type: 'no_response',
      icon: 'wifi-off',
      action: 'retry'
    };
  }
  
  return {
    message: error.message || 'An unexpected error occurred.',
    type: 'unknown',
    icon: 'help-circle',
    action: 'retry'
  };
};

export const isRetryableError = (error) => {
  const retryableTypes = ['network', 'timeout', 'no_response', 'server_error', 'service_unavailable'];
  const errorInfo = getErrorMessage(error);
  return retryableTypes.includes(errorInfo.type);
};

export const getErrorColor = (errorType) => {
  switch (errorType) {
    case 'credentials':
    case 'validation':
    case 'access_denied':
      return 'red';
    case 'network':
    case 'timeout':
    case 'no_response':
      return 'yellow';
    case 'server_error':
    case 'service_unavailable':
      return 'orange';
    default:
      return 'red';
  }
};

export const getErrorIcon = (errorType) => {
  switch (errorType) {
    case 'credentials':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    case 'network':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
        </svg>
      );
    case 'timeout':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      );
    case 'server_error':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
  }
};

export const logError = (error, context = '') => {
  const errorInfo = getErrorMessage(error);
  console.error(`[ERROR${context ? ` - ${context}` : ''}]`, {
    message: errorInfo.message,
    type: errorInfo.type,
    originalError: error,
    timestamp: new Date().toISOString()
  });
}; 