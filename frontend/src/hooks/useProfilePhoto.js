import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import profilePhotoService from '../services/profilePhotoService';

export const useProfilePhoto = () => {
  const { 
    user, 
    profilePhoto, 
    loadProfilePhoto, 
    updateProfilePhoto 
  } = useAuth();

  const uploadPhoto = useCallback(async (file, onProgress) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const response = await profilePhotoService.uploadProfilePhoto(file, onProgress);
      if (response.success) {
        updateProfilePhoto(response.data.photoUrl);
        return response;
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      throw err;
    }
  }, [user, updateProfilePhoto]);

  const updatePhoto = useCallback(async (file, onProgress) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const response = await profilePhotoService.updateProfilePhoto(file, onProgress);
      if (response.success) {
        updateProfilePhoto(response.data.photoUrl);
        return response;
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (err) {
      console.error('Error updating photo:', err);
      throw err;
    }
  }, [user, updateProfilePhoto]);

  const deletePhoto = useCallback(async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      const response = await profilePhotoService.deleteProfilePhoto();
      if (response.success) {
        updateProfilePhoto(null);
        return response;
      } else {
        throw new Error(response.message || 'Delete failed');
      }
    } catch (err) {
      console.error('Error deleting photo:', err);
      throw err;
    }
  }, [user, updateProfilePhoto]);

  const refreshPhoto = useCallback(() => {
    loadProfilePhoto(true); // Force refresh
  }, [loadProfilePhoto]);

  return {
    photoUrl: profilePhoto.url,
    loading: profilePhoto.loading,
    error: profilePhoto.error,
    uploadPhoto,
    updatePhoto,
    deletePhoto,
    refreshPhoto,
    loadProfilePhoto
  };
}; 