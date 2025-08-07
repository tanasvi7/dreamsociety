import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProfilePhotoDirect from '../common/ProfilePhotoDirect';

const ProfilePhotoMonitor = () => {
  const { profilePhoto, loadProfilePhoto } = useAuth();
  const [renderCount, setRenderCount] = useState(0);
  const [apiCallLog, setApiCallLog] = useState([]);
  const [componentMounts, setComponentMounts] = useState(0);
  const mountTimeRef = useRef(Date.now());

  // Track component renders
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  });

  // Track component mounts
  useEffect(() => {
    setComponentMounts(prev => prev + 1);
    mountTimeRef.current = Date.now();
  }, []);

  // Track profile photo state changes
  useEffect(() => {
    const timestamp = Date.now();
    const logEntry = {
      timestamp,
      timeSinceMount: timestamp - mountTimeRef.current,
      url: profilePhoto.url,
      loading: profilePhoto.loading,
      error: profilePhoto.error,
      lastLoaded: profilePhoto.lastLoaded
    };
    
    setApiCallLog(prev => [...prev, logEntry]);
  }, [profilePhoto.url, profilePhoto.loading, profilePhoto.error, profilePhoto.lastLoaded]);

  const handleForceLoad = () => {
    console.log('Force loading profile photo...');
    loadProfilePhoto(true);
  };

  const clearLog = () => {
    setApiCallLog([]);
  };

  const getUniqueUrls = () => {
    const urls = apiCallLog.map(log => log.url).filter(Boolean);
    return [...new Set(urls)];
  };

  const getLoadingCount = () => {
    return apiCallLog.filter(log => log.loading).length;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Profile Photo Loading Monitor</h2>
      
      {/* Real-time Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Component Renders</h3>
          <p className="text-3xl font-bold text-blue-600">{renderCount}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Component Mounts</h3>
          <p className="text-3xl font-bold text-green-600">{componentMounts}</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Loading States</h3>
          <p className="text-3xl font-bold text-yellow-600">{getLoadingCount()}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">Unique URLs</h3>
          <p className="text-3xl font-bold text-purple-600">{getUniqueUrls().length}</p>
        </div>
      </div>

      {/* Current State */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-3">Current Profile Photo State</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><span className="font-medium">Loading:</span> {profilePhoto.loading ? 'Yes' : 'No'}</p>
            <p><span className="font-medium">Error:</span> {profilePhoto.error || 'None'}</p>
            <p><span className="font-medium">Has URL:</span> {profilePhoto.url ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p><span className="font-medium">Last Loaded:</span> {profilePhoto.lastLoaded ? new Date(profilePhoto.lastLoaded).toLocaleTimeString() : 'Never'}</p>
            <p><span className="font-medium">URL Type:</span> {
              profilePhoto.url ? 
                (profilePhoto.url.includes('?X-Amz-') ? 'Presigned' : 
                 profilePhoto.url.includes('amazonaws.com') ? 'Direct S3' : 'Other') 
                : 'None'
            }</p>
          </div>
        </div>
      </div>

      {/* Profile Photo Display */}
      <div className="flex items-center space-x-4 mb-6">
        <ProfilePhotoDirect size="xl" />
        <div>
          <h3 className="font-semibold mb-2">Direct Profile Photo Component</h3>
          <p className="text-sm text-gray-600 mb-2">
            This component uses AuthContext directly to avoid multiple loading issues.
          </p>
          <button 
            onClick={handleForceLoad}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Force Load
          </button>
        </div>
      </div>

      {/* API Call Log */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Profile Photo State Changes ({apiCallLog.length})</h3>
          <button 
            onClick={clearLog}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Clear Log
          </button>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {apiCallLog.length === 0 ? (
            <p className="text-gray-500">No state changes recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {apiCallLog.slice(-10).reverse().map((log, index) => (
                <div key={index} className="bg-white p-3 rounded border text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <p><span className="font-medium">Time:</span> {new Date(log.timestamp).toLocaleTimeString()}</p>
                      <p><span className="font-medium">Since Mount:</span> {log.timeSinceMount}ms</p>
                      <p><span className="font-medium">Loading:</span> {log.loading ? 'Yes' : 'No'}</p>
                      <p><span className="font-medium">Error:</span> {log.error || 'None'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">URL:</p>
                      <p className="text-gray-600 break-all max-w-xs">
                        {log.url ? (log.url.length > 50 ? log.url.substring(0, 50) + '...' : log.url) : 'None'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Performance Analysis */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Performance Analysis</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• <strong>High render count:</strong> Component is re-rendering too frequently</li>
          <li>• <strong>Multiple loading states:</strong> API calls are being made repeatedly</li>
          <li>• <strong>URL changes:</strong> Profile photo URL is changing unexpectedly</li>
          <li>• <strong>Check browser console:</strong> Look for duplicate API calls in Network tab</li>
        </ul>
      </div>
    </div>
  );
};

export default ProfilePhotoMonitor; 