const { Profile, User } = require('../models');
const { NotFoundError, ValidationError } = require('../middlewares/errorHandler');

exports.getProfile = async (req, res, next) => {
  try {
    let userId = req.user.id;
    if (req.query.user_id && ['admin', 'moderator'].includes(req.user.role)) {
      userId = req.query.user_id;
    }
    let profile = await Profile.findOne({ where: { user_id: userId } });
    
    // If profile doesn't exist, create an empty one
    if (!profile) {
      profile = await Profile.create({ 
        user_id: userId,
        // All other fields will be null/empty by default
      });
    }
    
    res.json(profile);
  } catch (err) { next(err); }
};

exports.createProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log('Creating profile for user:', userId);
    console.log('Request body:', req.body);
    
    const exists = await Profile.findOne({ where: { user_id: userId } });
    if (exists) {
      // If profile exists, update it instead of throwing error
      console.log('Profile already exists, updating instead of creating');
      Object.assign(exists, req.body);
      await exists.save();
      console.log('Profile updated successfully');
      return res.json(exists);
    }
    
    // Handle date of birth validation
    const data = { ...req.body, user_id: userId };
    if (data.dob) {
      const dobDate = new Date(data.dob);
      if (isNaN(dobDate.getTime())) {
        // Invalid date, set to null
        data.dob = null;
      } else {
        // Valid date, format it properly
        data.dob = dobDate.toISOString().split('T')[0];
      }
    }
    
    console.log('Creating new profile with data:', data);
    const profile = await Profile.create(data);
    console.log('Profile created successfully:', profile.id);
    res.status(201).json(profile);
  } catch (err) { 
    console.error('Error in createProfile:', err);
    next(err); 
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log('Updating profile for user:', userId);
    console.log('Update data:', req.body);
    
    // Handle date of birth validation
    const updateData = { ...req.body };
    if (updateData.dob) {
      const dobDate = new Date(updateData.dob);
      if (isNaN(dobDate.getTime())) {
        // Invalid date, set to null
        updateData.dob = null;
      } else {
        // Valid date, format it properly
        updateData.dob = dobDate.toISOString().split('T')[0];
      }
    }
    
    const profile = await Profile.findOne({ where: { user_id: userId } });
    if (!profile) {
      console.log('Profile not found, creating new one');
      const newProfile = await Profile.create({ 
        user_id: userId,
        ...updateData
      });
      console.log('New profile created:', newProfile.id);
      return res.json(newProfile);
    }
    
    console.log('Found existing profile, updating...');
    console.log('Profile before update:', profile.toJSON());
    Object.assign(profile, updateData);
    await profile.save();
    console.log('Profile updated successfully');
    console.log('Profile after update:', profile.toJSON());
    res.json(profile);
  } catch (err) { 
    console.error('Error updating profile:', err);
    next(err); 
  }
}; 