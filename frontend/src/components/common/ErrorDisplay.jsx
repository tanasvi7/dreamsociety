import React from 'react';
import { getErrorColor, getErrorIcon } from '../../utils/errorHandler';

const ErrorDisplay = ({ 
  error, 
  errorType = 'general', 
  showRetry = false, 
  showContactSupport = false,
  className = '',
  onRetry,
  onContactSupport 
}) => {
  if (!error) return null;

  const color = getErrorColor(errorType);
  const icon = getErrorIcon(errorType);

  const getColorClasses = () => {
    switch (color) {
      case 'red':
        return 'bg-red-50 border-red-400 text-red-700';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-400 text-yellow-700';
      case 'orange':
        return 'bg-orange-50 border-orange-400 text-orange-700';
      default:
        return 'bg-red-50 border-red-400 text-red-700';
    }
  };

  return (
    <div className={`mb-4 p-4 rounded-lg border-l-4 flex items-start space-x-3 ${getColorClasses()} ${className}`}>
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{error}</p>
        {showRetry && (
          <p className="text-xs mt-1 opacity-75">
            You can try again in a few moments.
            {onRetry && (
              <button 
                onClick={onRetry}
                className="ml-2 underline hover:no-underline font-medium"
              >
                Try again
              </button>
            )}
          </p>
        )}
        {showContactSupport && (
          <p className="text-xs mt-1 opacity-75">
            If this problem persists, please contact our support team.
            {onContactSupport && (
              <button 
                onClick={onContactSupport}
                className="ml-2 underline hover:no-underline font-medium"
              >
                Contact support
              </button>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay; 