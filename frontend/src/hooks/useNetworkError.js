import { useState, useCallback } from 'react';
import { handleNetworkError, clearBrowserCaches } from '../utils/networkUtils';

/**
 * Custom hook for handling network errors with retry functionality
 * Provides a consistent way to handle network errors across components
 */
export const useNetworkError = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState(null);

  const handleError = useCallback(async (error, operation = 'operation') => {
    const errorResult = await handleNetworkError(error, operation);
    setError(errorResult);
    return errorResult;
  }, []);

  const retry = useCallback(async (retryFunction) => {
    if (!retryFunction) return;
    
    setIsRetrying(true);
    setError(null);
    
    try {
      const result = await retryFunction();
      setError(null);
      return result;
    } catch (error) {
      const errorResult = await handleNetworkError(error, 'Retry operation');
      setError(errorResult);
      throw errorResult;
    } finally {
      setIsRetrying(false);
    }
  }, []);

  const clearCacheAndRetry = useCallback(async (retryFunction) => {
    if (!retryFunction) return;
    
    setIsRetrying(true);
    setError(null);
    
    try {
      // Clear browser caches first
      clearBrowserCaches();
      
      // Then retry the operation
      const result = await retryFunction();
      setError(null);
      return result;
    } catch (error) {
      const errorResult = await handleNetworkError(error, 'Cache clear and retry');
      setError(errorResult);
      throw errorResult;
    } finally {
      setIsRetrying(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    isRetrying,
    handleError,
    retry,
    clearCacheAndRetry,
    clearError
  };
};
