
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Users, Save, X } from 'lucide-react';
import CustomAlert from '../../common/CustomAlert';
import useCustomAlert from '../../../hooks/useCustomAlert';

const FamilyDetails = ({ data, onUpdate, onSave }) => {
  const [formData, setFormData] = useState(data || { members: [] });
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [saving, setSaving] = useState(false);
  const { alertState, showError, showWarning, showConfirm, closeAlert } = useCustomAlert();

  // Update formData when data prop changes
  React.useEffect(() => {
    console.log('FamilyDetails - useEffect triggered with data:', data);
    if (data) {
      const newData = data || { members: [] };
      if (!newData.members || !Array.isArray(newData.members)) {
        newData.members = [];
      }
      console.log('FamilyDetails - Setting formData to:', newData);
      setFormData(newData);
    }
  }, [data]);

  const updateData = (updatedData) => {
    const safeData = {
      ...updatedData,
      members: Array.isArray(updatedData.members) ? updatedData.members : []
    };
    
    console.log('FamilyDetails - updateData called with:', safeData);
    setFormData(safeData);
    if (isEditing && onUpdate) {
      onUpdate(safeData);
    }
  };

  const addFamilyMember = () => {
    const newMember = {
      id: Date.now(),
      name: '',
      relation: '',
      education: '',
      profession: ''
    };
    const updated = {
      ...formData,
      members: [...formData.members, newMember]
    };
    updateData(updated);
  };

  const updateFamilyMember = (i, field, value) => {
    const updated = {
      ...formData,
      members: formData.members.map((member, index) =>
        index === i ? { ...member, [field]: value } : member
      )
    };
    updateData(updated);
  };

  const removeFamilyMember = (i) => {
    const updated = {
      ...formData,
      members: formData.members.filter((_, index) => index !== i)
    };
    updateData(updated);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setOriginalData(formData);
  };

  const handleSave = async () => {
    if (!onSave) {
      setIsEditing(false);
      return;
    }

    // Validate family members before saving
    const invalidMembers = formData.members.filter(member => 
      !member.name || member.name.trim().length < 2 || !member.relation || member.relation.trim().length === 0
    );

    if (invalidMembers.length > 0) {
      showWarning('Please ensure all family members have a name (at least 2 characters) and relation selected.');
      return;
    }

    setSaving(true);
    try {
      console.log('FamilyDetails - Saving formData:', formData);
      console.log('FamilyDetails - formData.members:', formData.members);
      
      // Call onUpdate before saving to update parent state
      if (onUpdate) {
        onUpdate(formData);
      }
      
      await onSave(formData);
      console.log('FamilyDetails - Save completed successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving family info:', error);
      showError('Failed to save family information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(originalData);
  };

  const handleDeleteAll = () => {
    showConfirm(
      'Are you sure you want to delete all family members? This action cannot be undone.',
      () => {
        const emptyData = { members: [] };
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
      'Delete All',
      'Cancel'
    );
  };

  const relationOptions = [
    { value: 'father', label: 'Father' },
    { value: 'mother', label: 'Mother' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'brother', label: 'Brother' },
    { value: 'sister', label: 'Sister' },
    { value: 'son', label: 'Son' },
    { value: 'daughter', label: 'Daughter' },
    { value: 'grandfather', label: 'Grandfather' },
    { value: 'grandmother', label: 'Grandmother' },
    { value: 'uncle', label: 'Uncle' },
    { value: 'aunt', label: 'Aunt' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Family Details
        </h2>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleDeleteAll}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {formData.members.map((member, index) => (
          <div key={member.id} className="bg-gray-50 p-4 rounded-lg border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Full Name"
                value={member.name || ''}
                onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                className="px-4 py-2 border rounded-lg w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!isEditing}
              />
              
              <select
                value={member.relation || ''}
                onChange={(e) => updateFamilyMember(index, 'relation', e.target.value)}
                className="px-4 py-2 border rounded-lg w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!isEditing}
              >
                <option value="">Select Relation</option>
                {relationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <input
                placeholder="Educational Qualification"
                value={member.education || ''}
                onChange={(e) => updateFamilyMember(index, 'education', e.target.value)}
                className="px-4 py-2 border rounded-lg w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!isEditing}
              />
              
              <input
                placeholder="Current Profession/Occupation"
                value={member.profession || ''}
                onChange={(e) => updateFamilyMember(index, 'profession', e.target.value)}
                className="px-4 py-2 border rounded-lg w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!isEditing}
              />
            </div>
            
            {isEditing && (
              <button
                onClick={() => removeFamilyMember(index)}
                className="text-red-500 flex items-center hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Remove
              </button>
            )}
          </div>
        ))}
        
        {isEditing && (
          <button
            onClick={addFamilyMember}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Family Member
          </button>
        )}
        
        {formData.members.length === 0 && !isEditing && (
          <div className="text-center py-8 text-gray-500">
            <p>No family members added yet</p>
          </div>
        )}
      </div>
      
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

export default FamilyDetails;
