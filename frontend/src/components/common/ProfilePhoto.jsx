import React, { useState } from 'react';
import { User } from 'lucide-react';

const ProfilePhoto = ({ 
  photoUrl, 
  size = 'md', 
  className = '', 
  alt = 'Profile Photo',
  showFallback = true,
  onClick,
  loading = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Size classes
  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    '2xl': 'w-24 h-24',
    '3xl': 'w-32 h-32'
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const shouldShowImage = photoUrl && !imageError && !loading;
  const shouldShowFallback = (!photoUrl || imageError) && showFallback;

  return (
    <div 
      className={`
        relative rounded-full overflow-hidden bg-gray-200 flex items-center justify-center
        ${sizeClasses[size]} 
        ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Profile Image */}
      {shouldShowImage && (
        <img
          src={photoUrl}
          alt={alt}
          className="w-full h-full object-cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {/* Fallback Icon */}
      {shouldShowFallback && !loading && (
        <User className={`text-gray-400 ${textSizeClasses[size]}`} />
      )}

      {/* Image Loading Overlay */}
      {imageLoading && shouldShowImage && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default ProfilePhoto; 