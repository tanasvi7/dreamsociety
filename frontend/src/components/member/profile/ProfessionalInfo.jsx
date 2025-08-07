import React, { useState } from 'react';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import CustomAlert from '../../common/CustomAlert';
import useCustomAlert from '../../../hooks/useCustomAlert';

const ProfessionalInfo = ({ data, onUpdate, onSaveWork, onSaveEducation }) => {
  const [workExperience, setWorkExperience] = useState(data?.workExperience || []);
  const [education, setEducation] = useState(data?.education || []);
  const [isEditingWork, setIsEditingWork] = useState(false);
  const [isEditingEducation, setIsEditingEducation] = useState(false);
  const [originalWorkData, setOriginalWorkData] = useState([]);
  const [originalEducationData, setOriginalEducationData] = useState([]);
  const [savingWork, setSavingWork] = useState(false);
  const [savingEducation, setSavingEducation] = useState(false);
  const { alertState, showConfirm, closeAlert } = useCustomAlert();

  // Work Experience
  const handleWorkExperienceChange = (newWork) => {
    setWorkExperience(newWork);
    if (isEditingWork && onUpdate) {
      onUpdate({ workExperience: newWork, education });
    }
  };

  const addWorkExperience = () => {
    const newWork = [
      ...workExperience,
      { id: Date.now(), company: '', role: '', yearsOfExperience: '', current: false }
    ];
    handleWorkExperienceChange(newWork);
  };

  const updateWorkExperience = (i, field, value) => {
    const clone = [...workExperience];
    clone[i][field] = value;
    handleWorkExperienceChange(clone);
  };

  const removeWorkExperience = (i) => {
    const newWork = workExperience.filter((_, idx) => idx !== i);
    handleWorkExperienceChange(newWork);
  };

  const handleEditWork = () => {
    setIsEditingWork(true);
    setOriginalWorkData([...workExperience]);
  };

  const handleSaveWork = async () => {
    if (!onSaveWork) {
      setIsEditingWork(false);
      return;
    }

    setSavingWork(true);
    try {
      await onSaveWork(workExperience);
      setIsEditingWork(false);
    } catch (error) {
      console.error('Error saving work experience:', error);
    } finally {
      setSavingWork(false);
    }
  };

  const handleCancelWork = () => {
    setIsEditingWork(false);
    setWorkExperience(originalWorkData);
  };

  const handleDeleteWork = () => {
    showConfirm(
      'Are you sure you want to delete all work experience? This action cannot be undone.',
      () => {
        const emptyWork = [];
        setWorkExperience(emptyWork);
        if (onUpdate) {
          onUpdate({ workExperience: emptyWork, education });
        }
        if (onSaveWork) {
          onSaveWork(emptyWork);
        }
        setIsEditingWork(false);
      },
      'Confirm Delete',
      'Delete All',
      'Cancel'
    );
  };

  // Education
  const handleEducationChange = (newEdu) => {
    setEducation(newEdu);
    if (isEditingEducation && onUpdate) {
      onUpdate({ workExperience, education: newEdu });
    }
  };

  const addEducation = () => {
    const newEdu = [
      ...education,
      { id: Date.now(), institution: '', degree: '', yearOfPassing: '', grade: '' }
    ];
    handleEducationChange(newEdu);
  };

  const updateEducation = (i, field, value) => {
    const clone = [...education];
    clone[i][field] = value;
    handleEducationChange(clone);
  };

  const removeEducation = (i) => {
    const newEdu = education.filter((_, idx) => idx !== i);
    handleEducationChange(newEdu);
  };

  const handleEditEducation = () => {
    setIsEditingEducation(true);
    setOriginalEducationData([...education]);
  };

  const handleSaveEducation = async () => {
    if (!onSaveEducation) {
      setIsEditingEducation(false);
      return;
    }

    setSavingEducation(true);
    try {
      await onSaveEducation(education);
      setIsEditingEducation(false);
    } catch (error) {
      console.error('Error saving education:', error);
    } finally {
      setSavingEducation(false);
    }
  };

  const handleCancelEducation = () => {
    setIsEditingEducation(false);
    setEducation(originalEducationData);
  };

  const handleDeleteEducation = () => {
    showConfirm(
      'Are you sure you want to delete all education details? This action cannot be undone.',
      () => {
        const emptyEducation = [];
        setEducation(emptyEducation);
        if (onUpdate) {
          onUpdate({ workExperience, education: emptyEducation });
        }
        if (onSaveEducation) {
          onSaveEducation(emptyEducation);
        }
        setIsEditingEducation(false);
      },
      'Confirm Delete',
      'Delete All',
      'Cancel'
    );
  };

  return (
    <div className="p-6 space-y-10">

      {/* Work Experience */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Work Experience</h2>
          {!isEditingWork ? (
            <button
              onClick={handleEditWork}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSaveWork}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                disabled={savingWork}
              >
                {savingWork ? (
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
                onClick={handleCancelWork}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleDeleteWork}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All
              </button>
            </div>
          )}
        </div>
        
        {workExperience.map((exp, i) => (
          <div key={exp.id} className="bg-gray-50 p-4 rounded-lg mb-4 border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Company"
                value={exp.company || ''}
                onChange={e => updateWorkExperience(i, 'company', e.target.value)}
                className="px-4 py-2 border rounded-lg w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!isEditingWork}
              />
              <input
                placeholder="Role"
                value={exp.role || ''}
                onChange={e => updateWorkExperience(i, 'role', e.target.value)}
                className="px-4 py-2 border rounded-lg w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!isEditingWork}
              />
              <input
                placeholder="Years of Experience"
                value={exp.yearsOfExperience || ''}
                onChange={e => updateWorkExperience(i, 'yearsOfExperience', e.target.value)}
                className="px-4 py-2 border rounded-lg w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!isEditingWork}
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exp.current || false}
                  onChange={e => updateWorkExperience(i, 'current', e.target.checked)}
                  disabled={!isEditingWork}
                  className="disabled:opacity-50"
                />
                <span>Currently Working</span>
              </label>
            </div>
            {isEditingWork && (
              <button
                onClick={() => removeWorkExperience(i)}
                className="text-red-500 flex items-center hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Remove
              </button>
            )}
          </div>
        ))}
        
        {isEditingWork && (
          <button
            onClick={addWorkExperience}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Work Experience
          </button>
        )}
        
        {workExperience.length === 0 && !isEditingWork && (
          <div className="text-center py-8 text-gray-500">
            <p>No work experience added yet</p>
          </div>
        )}
      </section>

      {/* Education */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Education</h2>
          {!isEditingEducation ? (
            <button
              onClick={handleEditEducation}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSaveEducation}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                disabled={savingEducation}
              >
                {savingEducation ? (
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
                onClick={handleCancelEducation}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleDeleteEducation}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All
              </button>
            </div>
          )}
        </div>
        
        {education.map((edu, i) => (
          <div key={edu.id} className="bg-gray-50 p-4 rounded-lg mb-4 border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Institution"
                value={edu.institution || ''}
                onChange={e => updateEducation(i, 'institution', e.target.value)}
                className="px-4 py-2 border rounded-lg w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!isEditingEducation}
              />
              <input
                placeholder="Degree"
                value={edu.degree || ''}
                onChange={e => updateEducation(i, 'degree', e.target.value)}
                className="px-4 py-2 border rounded-lg w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!isEditingEducation}
              />
              <input
                placeholder="Year of Passing"
                value={edu.yearOfPassing || ''}
                onChange={e => updateEducation(i, 'yearOfPassing', e.target.value)}
                className="px-4 py-2 border rounded-lg w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!isEditingEducation}
              />
              <input
                placeholder="Grade/CGPA"
                value={edu.grade || ''}
                onChange={e => updateEducation(i, 'grade', e.target.value)}
                className="px-4 py-2 border rounded-lg w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!isEditingEducation}
              />
            </div>
            {isEditingEducation && (
              <button
                onClick={() => removeEducation(i)}
                className="text-red-500 flex items-center hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Remove
              </button>
            )}
          </div>
        ))}
        
        {isEditingEducation && (
          <button
            onClick={addEducation}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Education
          </button>
        )}
        
        {education.length === 0 && !isEditingEducation && (
          <div className="text-center py-8 text-gray-500">
            <p>No education details added yet</p>
          </div>
        )}
      </section>
      
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

export default ProfessionalInfo;
