import React, { useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProfileImage from './ProfileImage';
import profilePhotoService from '../../services/profilePhotoService';

const ProfilePhotoDirect = React.memo(({ 
  size = 'md', 
  className = '', 
  alt = 'Profile Image',
  showFallback = true,
  onClick,
  border = false,
  borderColor = 'border-white'
}) => {
  const { 
    user, 
    profilePhoto, 
    refreshExpiredUrl, 
    updateProfilePhoto 
  } = useAuth();

  // Handle image load errors
  const handleImageError = useCallback(async (failedUrl) => {
    console.log('Image failed to load, attempting to refresh URL...');
    const newUrl = await refreshExpiredUrl(failedUrl);
    if (newUrl) {
      console.log('URL refreshed successfully after image error');
    } else {
      console.log('Failed to refresh URL after image error');
    }
  }, [refreshExpiredUrl]);

  // Handle successful URL refresh
  const handleUrlRefresh = useCallback((newUrl) => {
    console.log('URL refreshed successfully:', newUrl);
    updateProfilePhoto(newUrl);
  }, [updateProfilePhoto]);

  // Memoize the photo URL to prevent unnecessary re-renders
  const photoUrl = useMemo(() => profilePhoto.url, [profilePhoto.url]);

  return (
    <ProfileImage
      photoUrl={photoUrl}
      size={size}
      className={className}
      alt={alt}
      loading={profilePhoto.loading}
      showFallback={showFallback}
      onClick={onClick}
      onImageError={handleImageError}
      onUrlRefresh={handleUrlRefresh}
      border={border}
      borderColor={borderColor}
    />
  );
});

ProfilePhotoDirect.displayName = 'ProfilePhotoDirect';

export default ProfilePhotoDirect; 