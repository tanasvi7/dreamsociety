import React, { useEffect, useState } from 'react';
import { useProfilePhoto } from '../../hooks/useProfilePhoto';
import ProfileImage from '../common/ProfileImage';

const ProfilePhotoPerformance = () => {
  const { photoUrl, loading, error } = useProfilePhoto();
  const [renderCount, setRenderCount] = useState(0);
  const [apiCallCount, setApiCallCount] = useState(0);

  // Track component renders
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  });

  // Track API calls (this would need to be implemented in the service)
  useEffect(() => {
    if (photoUrl) {
      setApiCallCount(prev => prev + 1);
    }
  }, [photoUrl]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Profile Photo Performance Monitor</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded">
          <h4 className="font-medium text-blue-800">Component Renders</h4>
          <p className="text-2xl font-bold text-blue-600">{renderCount}</p>
        </div>
        
        <div className="bg-green-50 p-3 rounded">
          <h4 className="font-medium text-green-800">API Calls</h4>
          <p className="text-2xl font-bold text-green-600">{apiCallCount}</p>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-2">Current State:</h4>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Loading:</span> {loading ? 'Yes' : 'No'}</p>
          <p><span className="font-medium">Error:</span> {error || 'None'}</p>
          <p><span className="font-medium">Has Photo:</span> {photoUrl ? 'Yes' : 'No'}</p>
          <p><span className="font-medium">URL Type:</span> {
            photoUrl ? 
              (photoUrl.includes('?X-Amz-') ? 'Presigned URL' : 
               photoUrl.includes('amazonaws.com') ? 'Direct S3 URL' : 'Other') 
              : 'None'
          }</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <ProfileImage 
          photoUrl={photoUrl} 
          size="lg" 
          onImageError={(url) => console.log('Image error:', url)}
          onUrlRefresh={(url) => console.log('URL refreshed:', url)}
        />
        
        <div>
          <h4 className="font-medium mb-2">Profile Image Component</h4>
          <p className="text-sm text-gray-600">
            This component should only re-render when the photo URL actually changes, 
            not on every parent component render.
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 rounded">
        <h4 className="font-medium text-yellow-800 mb-2">Performance Tips:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Component renders should be minimal</li>
          <li>• API calls should only happen once per session</li>
          <li>• URL refreshes should only happen when needed</li>
          <li>• Check browser network tab for duplicate requests</li>
        </ul>
      </div>
    </div>
  );
};

export default ProfilePhotoPerformance; 