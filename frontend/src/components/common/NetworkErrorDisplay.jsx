import React, { useState } from 'react';
import { AlertCircle, RefreshCw, Wifi, WifiOff, Loader } from 'lucide-react';
import { clearBrowserCaches } from '../../utils/networkUtils';

const NetworkErrorDisplay = ({ 
  error, 
  onRetry, 
  onClearCache, 
  isRetrying = false,
  showClearCache = true,
  className = ""
}) => {
  const [isClearingCache, setIsClearingCache] = useState(false);

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      clearBrowserCaches();
      if (onClearCache) {
        await onClearCache();
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    } finally {
      setIsClearingCache(false);
    }
  };

  const getErrorIcon = () => {
    if (error?.type === 'network_offline' || error?.type === 'network_error') {
      return <WifiOff className="w-5 h-5 text-red-500 flex-shrink-0" />;
    } else if (error?.type === 'backend_unavailable') {
      return <Wifi className="w-5 h-5 text-orange-500 flex-shrink-0" />;
    }
    return <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
  };

  const getErrorColor = () => {
    if (error?.type === 'network_offline' || error?.type === 'network_error') {
      return 'bg-red-50 border-red-200 text-red-700';
    } else if (error?.type === 'backend_unavailable') {
      return 'bg-orange-50 border-orange-200 text-orange-700';
    }
    return 'bg-red-50 border-red-200 text-red-700';
  };

  return (
    <div className={`p-4 border rounded-lg ${getErrorColor()} ${className}`}>
      <div className="flex items-start space-x-3">
        {getErrorIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium mb-2">
            {error?.error || error || 'Network error occurred'}
          </p>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                disabled={isRetrying}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRetrying ? (
                  <>
                    <Loader className="w-3 h-3 mr-1 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Try Again
                  </>
                )}
              </button>
            )}
            
            {showClearCache && (
              <button
                onClick={handleClearCache}
                disabled={isClearingCache}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClearingCache ? (
                  <>
                    <Loader className="w-3 h-3 mr-1 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  'Clear Cache & Retry'
                )}
              </button>
            )}
          </div>
          
          {/* Additional help text */}
          {error?.type === 'network_offline' && (
            <p className="text-xs text-gray-600 mt-2">
              Please check your internet connection and try again.
            </p>
          )}
          
          {error?.type === 'backend_unavailable' && (
            <p className="text-xs text-gray-600 mt-2">
              The server might be temporarily unavailable. Please try again in a few moments.
            </p>
          )}
          
          {error?.showContactSupport && (
            <p className="text-xs text-gray-600 mt-2">
              If the problem persists, please contact support.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkErrorDisplay;
