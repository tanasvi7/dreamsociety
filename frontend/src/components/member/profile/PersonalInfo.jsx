
import React, { useState } from 'react';
import { Upload, Camera, MapPin, Calendar, User, Phone, Mail, Edit, Save, X, Trash2, Loader2 } from 'lucide-react';
import profilePhotoService from '../../../services/profilePhotoService';
import CustomAlert from '../../common/CustomAlert';
import useCustomAlert from '../../../hooks/useCustomAlert';
import ProfileImage from '../../common/ProfileImage';

const PersonalInfo = ({ data, onUpdate, onSave }) => {
  // Add default values to prevent null errors
  const defaultData = {
    profileImage: '',
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: {
      village: '',
      mandal: '',
      district: '',
      pin: ''
    },
    community: {
      caste: '',
      subcaste: '',
      nativePlace: ''
    },
    maritalStatus: ''
  };

  const [formData, setFormData] = useState(data || defaultData);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photoError, setPhotoError] = useState('');
  const { alertState, showError, showConfirm, closeAlert } = useCustomAlert();

  // Update formData when data prop changes
  React.useEffect(() => {
    console.log('PersonalInfo: data prop changed:', data);
    console.log('PersonalInfo: profileImage value:', data?.profileImage);
    console.log('PersonalInfo: name value:', data?.name);
    console.log('PersonalInfo: phone value:', data?.phone);
    if (data) {
      setFormData(data);
      setOriginalData(data);
    }
  }, [data]);

  // Monitor isEditing state changes
  React.useEffect(() => {
    console.log('PersonalInfo: isEditing state changed to:', isEditing);
  }, [isEditing]);

  // Monitor formData changes
  React.useEffect(() => {
    console.log('PersonalInfo: formData changed to:', formData);
  }, [formData]);

  const handleChange = (field, value) => {
    console.log('handleChange called with field:', field, 'value:', value);
    console.log('Current formData:', formData);
    
    let updatedData = { ...formData };
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedData = {
        ...formData,
        [parent]: {
          ...(formData?.[parent] || {}),
          [child]: value
        }
      };
    } else {
      updatedData[field] = value;
    }
    
    console.log('Updated formData:', updatedData);
    setFormData(updatedData);
    
    // Don't call onUpdate during typing - only when saving
    // This prevents the parent component from interfering with local state
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validation = profilePhotoService.validateFile(file);
    if (!validation.valid) {
      setPhotoError(validation.message);
      return;
    }

    setPhotoError('');
    setUploadingPhoto(true);
    setUploadProgress(0);

    try {
      // Show preview immediately
      const previewUrl = await profilePhotoService.fileToBase64(file);
      handleChange('profileImage', previewUrl);

      // Upload to S3
      const result = await profilePhotoService.uploadProfilePhoto(
        file,
        (progress) => setUploadProgress(progress)
      );

      if (result.success) {
        // Update with the actual S3 URL
        handleChange('profileImage', result.data.photoUrl);
        setPhotoError('');
      } else {
        setPhotoError(result.message || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setPhotoError('Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
      setUploadProgress(0);
    }
  };

  const handleEdit = () => {
    console.log('PersonalInfo handleEdit called');
    console.log('Current isEditing state:', isEditing);
    setIsEditing(true);
    setOriginalData(formData);
    console.log('Set isEditing to true');
  };

  const handleSave = async () => {
    console.log('PersonalInfo handleSave called');
    console.log('onSave function exists:', !!onSave);
    console.log('formData to save:', formData);
    
    if (!onSave) {
      console.log('No onSave function provided');
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      console.log('Calling onSave with formData:', formData);
      await onSave(formData);
      console.log('onSave completed successfully');
      
      // Update parent component with the saved data
      if (onUpdate) {
        onUpdate(formData);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving personal info:', error);
      showError('Failed to save personal information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(originalData);
  };

  const handleDelete = () => {
    showConfirm(
      'Are you sure you want to delete your personal information? This action cannot be undone.',
      () => {
        const emptyData = { ...defaultData };
        setFormData(emptyData);
        if (onUpdate) {
          onUpdate(emptyData);
        }
        if (onSave) {
          onSave(emptyData);
        }
        setIsEditing(false);
      },
      'Confirm Delete',
      'Delete',
      'Cancel'
    );
  };

  return (
    <div className="p-6">
      {console.log('PersonalInfo render - isEditing:', isEditing, 'formData:', formData)}
      {console.log('PersonalInfo render - profileImage:', formData?.profileImage)}
      {console.log('PersonalInfo render - name:', formData?.name)}
      {console.log('PersonalInfo render - phone:', formData?.phone)}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
         
          <button
            onClick={handleEdit}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
          >
            <Edit className="w-5 h-5 mr-2" /> Edit Information
          </button>
        </div>
      
      {/* Profile Image */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">Profile Photo</label>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <ProfileImage
              photoUrl={formData?.profileImage || ''}
              size="2xl"
              alt="Profile"
              className="border-4 border-gray-200"
              loading={uploadingPhoto}
              showFallback={true}
            />
            {uploadingPhoto && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <input
              type="file"
              id="profile-upload"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={!isEditing || uploadingPhoto}
            />
            <label
              htmlFor="profile-upload"
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                isEditing && !uploadingPhoto
                  ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700' 
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              {uploadingPhoto ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading... {uploadProgress}%</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo</span>
                </>
              )}
            </label>
            
            {/* Upload Progress Bar */}
            {uploadingPhoto && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
            
            {/* Error Message */}
            {photoError && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {photoError}
              </div>
            )}
            
            {/* File Requirements */}
            <div className="mt-2 text-xs text-gray-500">
              Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
            </div>
            {!isEditing && (
              <div className="mt-2 text-xs text-blue-600">
                Click "Edit Information" to upload a new profile photo
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isEditing ? 'bg-blue-50 p-4 rounded-lg border-2 border-blue-200' : ''}`}>
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={formData?.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500"
              placeholder="Enter your full name"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={formData?.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500"
              placeholder="Enter your email"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData?.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500"
              placeholder="+91 9876543210"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date of Birth
            </label>
            <input
              type="date"
              value={formData?.dateOfBirth || ''}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              value={formData?.gender || ''}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500"
              disabled={!isEditing}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Address Details
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Village/Town</label>
            <input
              type="text"
              value={formData?.address?.village || ''}
              onChange={(e) => handleChange('address.village', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter village/town"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mandal</label>
            <input
              type="text"
              value={formData?.address?.mandal || ''}
              onChange={(e) => handleChange('address.mandal', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter mandal"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
            <input
              type="text"
              value={formData?.address?.district || ''}
              onChange={(e) => handleChange('address.district', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter district"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
            <input
              type="text"
              value={formData?.address?.pin || ''}
              onChange={(e) => handleChange('address.pin', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter PIN code"
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Community Details */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Caste</label>
            <select
              value={formData?.community?.caste || ''}
              onChange={(e) => handleChange('community.caste', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={!isEditing}
            >
              <option value="">Select Caste</option>
              <option value="general">General</option>
              <option value="obc">OBC</option>
              <option value="sc">SC</option>
              <option value="st">ST</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subcaste</label>
            <input
              type="text"
              value={formData?.community?.subcaste || ''}
              onChange={(e) => handleChange('community.subcaste', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter subcaste (optional)"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Native Place</label>
            <input
              type="text"
              value={formData?.community?.nativePlace || ''}
              onChange={(e) => handleChange('community.nativePlace', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter native place"
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Marital Status */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Marital Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
            <select
              value={formData?.maritalStatus || ''}
              onChange={(e) => handleChange('maritalStatus', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={!isEditing}
            >
              <option value="">Select Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save/Cancel/Delete Buttons */}
      {isEditing && (
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            disabled={saving}
          >
            {saving ? 'Saving...' : <><Save className="w-5 h-5 mr-2" /> Save</>}
          </button>
          <button
            onClick={handleCancel}
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            <X className="w-5 h-5 mr-2" /> Cancel
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-5 h-5 mr-2" /> Delete
          </button>
        </div>
      )}
      
      {/* Custom Alert Modal */}
      <CustomAlert
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        showCancel={alertState.showCancel}
        onConfirm={alertState.onConfirm}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
      />
    </div>
  );
};

export default PersonalInfo;
