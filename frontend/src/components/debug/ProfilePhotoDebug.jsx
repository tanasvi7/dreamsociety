import React, { useState, useEffect } from 'react';
import { useProfilePhoto } from '../../hooks/useProfilePhoto';
import ProfileImage from '../common/ProfileImage';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { RefreshCw, Upload, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

const ProfilePhotoDebug = () => {
  const { 
    photoUrl, 
    loading, 
    error, 
    uploadPhoto, 
    deletePhoto, 
    refreshPhoto, 
    refreshExpiredUrl 
  } = useProfilePhoto();
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastError, setLastError] = useState(null);
  const [refreshAttempts, setRefreshAttempts] = useState(0);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setLastError(null);

    try {
      await uploadPhoto(file, (progress) => {
        setUploadProgress(progress);
      });
      console.log('Upload successful');
    } catch (err) {
      console.error('Upload failed:', err);
      setLastError(err.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePhoto();
      console.log('Delete successful');
    } catch (err) {
      console.error('Delete failed:', err);
      setLastError(err.message);
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshPhoto();
      console.log('Refresh successful');
    } catch (err) {
      console.error('Refresh failed:', err);
      setLastError(err.message);
    }
  };

  const handleRefreshExpiredUrl = async () => {
    try {
      setRefreshAttempts(prev => prev + 1);
      const newUrl = await refreshExpiredUrl(photoUrl);
      if (newUrl) {
        console.log('URL refresh successful:', newUrl);
      }
    } catch (err) {
      console.error('URL refresh failed:', err);
      setLastError(err.message);
    }
  };

  const handleImageError = async (expiredUrl) => {
    console.log('Image failed to load, attempting to refresh URL:', expiredUrl);
    try {
      const newUrl = await refreshExpiredUrl(expiredUrl);
      if (newUrl) {
        console.log('URL refreshed after image error:', newUrl);
      }
    } catch (err) {
      console.error('Failed to refresh URL after image error:', err);
    }
  };

  const isPresignedUrl = photoUrl && photoUrl.includes('?X-Amz-');
  const isExpired = isPresignedUrl && photoUrl.includes('X-Amz-Expires=');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Profile Photo Debug Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Current Status</h3>
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <span>Loading:</span>
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span>Has Photo:</span>
                  {photoUrl ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span>URL Type:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    isPresignedUrl ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {isPresignedUrl ? 'Presigned URL' : 'Direct URL'}
                  </span>
                </div>
                {isPresignedUrl && (
                  <div className="flex items-center gap-2">
                    <span>Expiration:</span>
                    <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-800">
                      {isExpired ? 'Expired' : 'Valid'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Debug Info</h3>
              <div className="text-sm space-y-1">
                <div>Refresh Attempts: {refreshAttempts}</div>
                {uploadProgress > 0 && (
                  <div>Upload Progress: {uploadProgress}%</div>
                )}
                {lastError && (
                  <div className="text-red-600">Last Error: {lastError}</div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Image Display */}
          <div className="flex justify-center">
            <div className="text-center space-y-4">
              <ProfileImage
                photoUrl={photoUrl}
                size="3xl"
                alt="Debug Profile"
                loading={loading}
                onImageError={handleImageError}
                className="border-4 border-gray-300"
              />
              <div className="text-sm text-gray-600 max-w-md break-all">
                {photoUrl || 'No photo URL'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              onClick={() => document.getElementById('file-upload').click()}
              disabled={uploading}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploading ? `Uploading ${uploadProgress}%` : 'Upload Photo'}
            </Button>
            
            <Button
              onClick={handleDelete}
              disabled={!photoUrl || loading}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Photo
            </Button>
            
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Photo
            </Button>
            
            {isPresignedUrl && (
              <Button
                onClick={handleRefreshExpiredUrl}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh URL
              </Button>
            )}
          </div>

          {/* Hidden file input */}
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Error:</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePhotoDebug; 