// profilemanagement.jsx

import React, { useEffect, useState } from 'react';
// import Navbar from '../../common/Navbar';
import PersonalInfo from './PersonalInfo';
import ProfessionalInfo from './ProfessionalInfo';
import FamilyDetails from './FamilyDetails';
import { User, Briefcase, Users, Save } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../services/apiService';
import { useAuth } from '../../../contexts/AuthContext';
import CustomAlert from '../../common/CustomAlert';
import useCustomAlert from '../../../hooks/useCustomAlert';

const ProfileManagement = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [educationError, setEducationError] = useState(false);
  const { user, updateUser } = useAuth();
  const { alertState, showSuccess, showError, closeAlert } = useCustomAlert();

  // Move function definitions before they are used
  const mapProfileToPersonalInfo = (data, user) => {
    const profile = data?.profile || {};
    console.log('mapProfileToPersonalInfo - profile data:', profile);
    console.log('mapProfileToPersonalInfo - user data:', user);
    
    return {
      profileImage: profile.photo_url || '',
      name: user?.full_name || user?.name || '',
      email: user?.email || '',
      phone: user?.phone || profile.phone || '',
      dateOfBirth: profile.dob ? profile.dob.slice(0, 10) : '',
      gender: profile.gender || '',
      address: {
        village: profile.village || '',
        mandal: profile.mandal || '',
        district: profile.district || '',
        pin: profile.pincode || ''
      },
      community: {
        caste: profile.caste || '',
        subcaste: profile.subcaste || '',
        nativePlace: profile.native_place || ''
      },
      maritalStatus: profile.marital_status || ''
    };
  };

  const mapProfileToProfessionalInfo = (data) => {
    const workExperience = Array.isArray(data?.employment) ? data.employment.map(emp => ({
      id: emp.id,
      company: emp.company_name || '',
      role: emp.role || '',
      yearsOfExperience: emp.years_of_experience || '',
      current: emp.currently_working || false
    })) : [];
  
    // Fix: education endpoint returns { educations: [...] }
    const educationArr = Array.isArray(data?.education?.educations) ? data.education.educations : [];
    const education = educationArr.map(edu => ({
      id: edu.id,
      institution: edu.institution || '',
      degree: edu.degree || '',
      yearOfPassing: edu.year_of_passing || '',
      grade: edu.grade || ''
    }));
  
    return {
      workExperience,
      education
    };
  };
  

  const mapProfileToFamilyInfo = (data) => {
    console.log('mapProfileToFamilyInfo - input data:', data);
    console.log('mapProfileToFamilyInfo - data.family:', data?.family);
    
    let familyData = [];
    
    // Handle different possible data structures
    if (Array.isArray(data?.family)) {
      familyData = data.family;
    } else if (data?.family && Array.isArray(data.family.members)) {
      familyData = data.family.members;
    } else if (data?.family && Array.isArray(data.family.data)) {
      familyData = data.family.data;
    }
    
    const result = {
      members: familyData.map(fam => ({
        id: fam.id,
        name: fam.name || '',
        relation: fam.relation || '',
        education: fam.education || '',
        profession: fam.profession || ''
      }))
    };
    
    console.log('mapProfileToFamilyInfo - processed familyData:', familyData);
    console.log('mapProfileToFamilyInfo - result:', result);
    return result;
  };

  useEffect(() => {
    const fetchAllProfileData = async () => {
      setLoading(true);
      try {
        const [profileRes, employmentRes, educationRes, skillsRes, familyRes] = await Promise.all([
          apiGet('/profiles'),
          apiGet('/employment'),
          apiGet('/education'),
          apiGet('/skills'),
          apiGet('/family')
        ]);
        
        // Handle empty data gracefully
        setProfileData({
          profile: profileRes.data || {},
          employment: employmentRes.data || [],
          education: educationRes.data || { educations: [] },
          skills: skillsRes.data || [],
          family: familyRes.data || []
        });
      } catch (error) {
        console.error('Failed to fetch profile or related data:', error);
        // Set empty data structure instead of null
        setProfileData({
          profile: {},
          employment: [],
          education: { educations: [] },
          skills: [],
          family: []
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAllProfileData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading profile...</div>;
  }

  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: User },
    { id: 'professional', name: 'Professional', icon: Briefcase },
    { id: 'family', name: 'Family Details', icon: Users }
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('Saving profile data:', profileData);
      
      // Save personal info (profile)
      if (profileData.personal) {
        const personalData = profileData.personal;
        const profilePayload = {
          photo_url: personalData.profileImage,
          dob: personalData.dateOfBirth,
          gender: personalData.gender,
          village: personalData.address?.village,
          mandal: personalData.address?.mandal,
          district: personalData.address?.district,
          pincode: personalData.address?.pin,
          caste: personalData.community?.caste,
          subcaste: personalData.community?.subcaste,
          native_place: personalData.community?.nativePlace,
          marital_status: personalData.maritalStatus
        };
        
        // Update profile (PUT request since profile already exists)
        await apiPut('/profiles/', profilePayload);
        console.log('Personal info saved successfully');
      }
      
      // Save employment details
      if (profileData.employment && profileData.employment.length > 0) {
        for (const emp of profileData.employment) {
          const employmentPayload = {
            company_name: emp.company,
            role: emp.role,
            years_of_experience: parseFloat(emp.yearsOfExperience) || 0.0,
            currently_working: emp.current || false
          };
          
          // Only update if it has a real database ID (not a temporary frontend ID)
          if (emp.id && emp.id < 1000000000000) { // Real database IDs are typically smaller
            // Update existing employment
            await apiPut(`/employment/${emp.id}`, employmentPayload);
          } else {
            // Create new employment
            await apiPost('/employment/', employmentPayload);
          }
        }
        console.log('Employment details saved successfully');
      }
      
      // Save education details
      if (profileData.education && profileData.education.educations && profileData.education.educations.length > 0) {
        for (const edu of profileData.education.educations) {
          const educationPayload = {
            institution: edu.institution,
            degree: edu.degree,
            year_of_passing: parseInt(edu.yearOfPassing) || new Date().getFullYear(),
            grade: edu.grade
          };
          
          // Only update if it has a real database ID (not a temporary frontend ID)
          if (edu.id && edu.id < 1000000000000) { // Real database IDs are typically smaller
            // Update existing education
            await apiPut(`/education/${edu.id}`, educationPayload);
          } else {
            // Create new education
            await apiPost('/education/', educationPayload);
          }
        }
        console.log('Education details saved successfully');
      }
      
      // Save family details
      if (profileData.family && profileData.family.length > 0) {
        for (const fam of profileData.family) {
          const familyPayload = {
            name: fam.name,
            relation: fam.relation,
            education: fam.education,
            profession: fam.profession
          };
          
          if (fam.id) {
            // Update existing family member
            await apiPut(`/family/${fam.id}`, familyPayload);
          } else {
            // Create new family member
            await apiPost('/family/', familyPayload);
          }
        }
        console.log('Family details saved successfully');
      }
      
      showSuccess('Profile updated successfully!');
      
      // Refresh the data to show updated information
      const fetchAllProfileData = async () => {
        try {
          const [profileRes, employmentRes, educationRes, skillsRes, familyRes] = await Promise.all([
            apiGet('/profiles'),
            apiGet('/employment'),
            apiGet('/education'),
            apiGet('/skills'),
            apiGet('/family')
          ]);
          
          setProfileData({
            profile: profileRes.data || {},
            employment: employmentRes.data || [],
            education: educationRes.data || { educations: [] },
            skills: skillsRes.data || [],
            family: familyRes.data || []
          });
        } catch (error) {
          console.error('Failed to refresh profile data:', error);
        }
      };
      
      fetchAllProfileData();
      
    } catch (error) {
      console.error('Error saving profile data:', error);
      showError('Failed to save profile data. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Check if user has completed their profile
  const isProfileComplete = () => {
    const profile = profileData?.profile || {};
    return profile.dob && profile.gender && profile.village && profile.district;
  };

  const updateProfileData = (section, data) => {
    setProfileData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  // Save functions for each section
  const savePersonalInfo = async (data) => {
    console.log('ProfileManagement savePersonalInfo called with data:', data);
    setSaving(true);
    try {
      // Update user's basic information (name, email, phone)
      const userPayload = {
        full_name: data.name,
        email: data.email,
        phone: data.phone
      };
      
      console.log('Saving user payload:', userPayload);
      
      // Update user information
      await apiPut(`/users/${user.id}`, userPayload);
      console.log('User info updated successfully');
      
      // Update the user object in AuthContext to reflect changes immediately
      try {
        updateUser({
          full_name: data.name,
          email: data.email,
          phone: data.phone
        });
        console.log('User context updated successfully');
      } catch (updateError) {
        console.warn('Failed to update user context:', updateError);
        // Don't fail the entire operation if context update fails
      }
      
      // Update profile information
      const profilePayload = {
        photo_url: data.profileImage || '',
        dob: data.dateOfBirth || null,
        gender: data.gender || null,
        village: data.address?.village || '',
        mandal: data.address?.mandal || '',
        district: data.address?.district || '',
        pincode: data.address?.pin || '',
        caste: data.community?.caste || '',
        subcaste: data.community?.subcaste || '',
        native_place: data.community?.nativePlace || '',
        marital_status: data.maritalStatus || ''
      };
      
      console.log('Saving profile payload:', profilePayload);
      console.log('Profile payload keys:', Object.keys(profilePayload));
      console.log('Profile payload values:', Object.values(profilePayload));
      
      // For new users, try to create profile first, then update if it exists
      let profileUpdated = false;
      
      try {
        // First try to create a new profile
        await apiPost('/profiles', profilePayload);
        console.log('Profile info created successfully');
        profileUpdated = true;
      } catch (createError) {
        console.log('Profile creation failed, trying to update existing profile:', createError);
        console.log('Create error response:', createError.response?.data);
        
        // If creation fails (profile already exists), try to update
        try {
          await apiPut('/profiles', profilePayload);
          console.log('Profile info updated successfully');
          profileUpdated = true;
        } catch (updateError) {
          console.error('Both profile creation and update failed:', updateError);
          console.log('Update error response:', updateError.response?.data);
          throw new Error(`Failed to save profile information: ${updateError.response?.data?.message || updateError.message}`);
        }
      }
      
      if (profileUpdated) {
        // Refresh the data
        const profileRes = await apiGet('/profiles');
        setProfileData(prev => ({
          ...prev,
          profile: profileRes.data || {}
        }));
        
        showSuccess('Personal information saved successfully!');
      }
    } catch (error) {
      console.error('Error saving personal info:', error);
      showError('Failed to save personal information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const saveEmploymentInfo = async (workExperience) => {
    setSaving(true);
    try {
      const existingEmployment = profileData.employment || [];
      
      // Update existing records or create new ones
      for (const emp of workExperience) {
        if (emp.company && emp.role) { // Only save if required fields are filled
          const employmentPayload = {
            company_name: emp.company,
            role: emp.role,
            years_of_experience: parseFloat(emp.yearsOfExperience) || 0.0,
            currently_working: emp.current || false
          };
          
          if (emp.id && emp.id < 1000000000000) { // Real database ID - update existing
            try {
              await apiPut(`/employment/${emp.id}`, employmentPayload);
              console.log('Updated employment record:', emp.id);
            } catch (error) {
              console.log('Could not update employment record:', emp.id, error);
              // If update fails, try to create new
              await apiPost('/employment/', employmentPayload);
              console.log('Created new employment record');
            }
          } else { // No real ID - create new
            await apiPost('/employment/', employmentPayload);
            console.log('Created new employment record');
          }
        }
      }
      
      // Delete records that are no longer in the list
      const currentIds = workExperience
        .filter(emp => emp.id && emp.id < 1000000000000)
        .map(emp => emp.id);
      
      for (const existingEmp of existingEmployment) {
        if (existingEmp.id && existingEmp.id < 1000000000000 && !currentIds.includes(existingEmp.id)) {
          try {
            await apiDelete(`/employment/${existingEmp.id}`);
            console.log('Deleted employment record:', existingEmp.id);
          } catch (error) {
            console.log('Could not delete employment record:', existingEmp.id, error);
          }
        }
      }
      
      console.log('Employment details saved successfully');
      
      // Refresh the data
      const employmentRes = await apiGet('/employment');
      setProfileData(prev => ({
        ...prev,
        employment: employmentRes.data || []
      }));
      
      showSuccess('Employment information saved successfully!');
    } catch (error) {
      console.error('Error saving employment info:', error);
      showError('Failed to save employment information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const saveEducationInfo = async (education) => {
    setSaving(true);
    try {
      const existingEducation = profileData.education?.educations || [];
      
      // Update existing records or create new ones
      for (const edu of education) {
        if (edu.institution && edu.degree) { // Only save if required fields are filled
          const educationPayload = {
            institution: edu.institution,
            degree: edu.degree,
            year_of_passing: parseInt(edu.yearOfPassing) || new Date().getFullYear(),
            grade: edu.grade
          };
          
          if (edu.id && edu.id < 1000000000000) { // Real database ID - update existing
            try {
              await apiPut(`/education/${edu.id}`, educationPayload);
              console.log('Updated education record:', edu.id);
            } catch (error) {
              console.log('Could not update education record:', edu.id, error);
              // If update fails, try to create new
              await apiPost('/education/', educationPayload);
              console.log('Created new education record');
            }
          } else { // No real ID - create new
            await apiPost('/education/', educationPayload);
            console.log('Created new education record');
          }
        }
      }
      
      // Delete records that are no longer in the list
      const currentIds = education
        .filter(edu => edu.id && edu.id < 1000000000000)
        .map(edu => edu.id);
      
      for (const existingEdu of existingEducation) {
        if (existingEdu.id && existingEdu.id < 1000000000000 && !currentIds.includes(existingEdu.id)) {
          try {
            await apiDelete(`/education/${existingEdu.id}`);
            console.log('Deleted education record:', existingEdu.id);
          } catch (error) {
            console.log('Could not delete education record:', existingEdu.id, error);
          }
        }
      }
      
      console.log('Education details saved successfully');
      
      // Refresh the data
      const educationRes = await apiGet('/education');
      setProfileData(prev => ({
        ...prev,
        education: educationRes.data || { educations: [] }
      }));
      
      showSuccess('Education information saved successfully!');
    } catch (error) {
      console.error('Error saving education info:', error);
      showError('Failed to save education information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const saveFamilyInfo = async (familyData) => {
    setSaving(true);
    try {
      // Handle different possible data structures for existing family
      let existingFamily = [];
      if (Array.isArray(profileData.family)) {
        existingFamily = profileData.family;
      } else if (profileData.family && Array.isArray(profileData.family.members)) {
        existingFamily = profileData.family.members;
      } else if (profileData.family && Array.isArray(profileData.family.data)) {
        existingFamily = profileData.family.data;
      }
      
      console.log('Existing family data:', existingFamily);
      
      const membersToSave = familyData?.members || [];
      console.log('Members to save:', membersToSave);
      
      if (!Array.isArray(membersToSave)) {
        console.error('membersToSave is not an array:', membersToSave);
        throw new Error('Family members data is not in the expected format');
      }
      
      // Handle both creating new and updating existing family members
      let createdCount = 0;
      let updatedCount = 0;
      
      for (const fam of membersToSave) {
        // Validate required fields before sending to API
        if (fam && fam.name && fam.name.trim().length >= 2 && fam.relation && fam.relation.trim().length > 0) {
          const familyPayload = {
            name: fam.name.trim(),
            relation: fam.relation.trim(),
            education: fam.education || '',
            profession: fam.profession || ''
          };
          
          if (fam.id && fam.id < 1000000000000) { // Real database ID - update existing
            try {
              await apiPut(`/family/${fam.id}`, familyPayload);
              console.log('Updated family member:', fam.id);
              updatedCount++;
            } catch (error) {
              console.log('Could not update family member:', fam.id, error);
              throw new Error(`Failed to update family member: ${error.message}`);
            }
          } else { // No real ID - create new
            try {
              await apiPost('/family', familyPayload);
              console.log('Created new family member');
              createdCount++;
            } catch (error) {
              console.log('Could not create family member:', error);
              throw new Error(`Failed to create family member: ${error.message}`);
            }
          }
        }
      }
      
      console.log(`Created ${createdCount} and updated ${updatedCount} family members`);
      
      // Delete records that are no longer in the list
      const currentIds = membersToSave
        .filter(fam => fam.id && fam.id < 1000000000000)
        .map(fam => fam.id);
      
      for (const existingFam of existingFamily) {
        if (existingFam.id && existingFam.id < 1000000000000 && !currentIds.includes(existingFam.id)) {
          try {
            await apiDelete(`/family/${existingFam.id}`);
            console.log('Deleted family member:', existingFam.id);
          } catch (error) {
            console.log('Could not delete family member:', existingFam.id, error);
          }
        }
      }
      
      console.log('Family details saved successfully');
      
      // Refresh the data
      const familyRes = await apiGet('/family');
      console.log('Refreshed family data:', familyRes.data);
      
      // Update profileData with the refreshed family data
      setProfileData(prev => ({
        ...prev,
        family: familyRes.data || []
      }));
      
      showSuccess('Family information saved successfully!');
    } catch (error) {
      console.error('Error saving family info:', error);
      showError('Failed to save family information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Management</h1>
              <p className="text-gray-600">Manage your personal and professional information. Each section has its own edit, save, and delete controls.</p>
            </div>
          </div>
        </div>

        {/* Welcome Message for New Users */}
        {!isProfileComplete() && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to DreamSociety! 🎉</h3>
                <p className="text-gray-700 mb-3">
                  We're excited to have you here! To get the most out of your DreamSociety experience, 
                  please complete your profile by filling out the sections below. This helps us connect 
                  you with the right opportunities and community members.
                </p>
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <h4 className="font-medium text-gray-900 mb-2">What you can do here:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Personal Info:</strong> Add your basic details, address, and community information</li>
                    <li>• <strong>Professional:</strong> Share your education, work experience, and skills</li>
                    <li>• <strong>Family Details:</strong> Add information about your family members</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
              {/* Mobile Tab Navigation */}
              <div className="lg:hidden mb-6">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop Sidebar Navigation */}
              <nav className="hidden lg:block space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg">
              {activeTab === 'personal' && (
                <>
                  {console.log('Rendering PersonalInfo with data:', mapProfileToPersonalInfo(profileData, user))}
                  {console.log('User object:', user)}
                  {console.log('ProfileData:', profileData)}
                  <PersonalInfo
                    data={mapProfileToPersonalInfo(profileData, user)}
                    onUpdate={(data) => updateProfileData('personal', data)}
                    onSave={savePersonalInfo}
                  />
                </>
              )}
              {activeTab === 'professional' && (
                <>
                  {educationError && <div className="text-red-500 p-6">Failed to load education details.</div>}
                  <ProfessionalInfo
                    key={activeTab}
                    data={mapProfileToProfessionalInfo(profileData)}
                    onUpdate={data => {
                      updateProfileData('employment', data.workExperience);
                      updateProfileData('education', { educations: data.education });
                    }}
                    onSaveWork={saveEmploymentInfo}
                    onSaveEducation={saveEducationInfo}
                  />
                </>
              )}
              {activeTab === 'family' && (
                <FamilyDetails
                  data={mapProfileToFamilyInfo(profileData)}
                  onUpdate={(data) => {
                    console.log('ProfileManagement - Family onUpdate called with:', data);
                    updateProfileData('family', data);
                  }}
                  onSave={saveFamilyInfo}
                />
              )}
            </div>
          </div>
        </div>
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

export default ProfileManagement;