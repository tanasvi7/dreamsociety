const { Profile } = require('../models');
const s3Service = require('../services/s3Service');
const { ValidationError, NotFoundError } = require('../middlewares/errorHandler');

/**
 * Upload a new profile photo
 * @route POST /api/profile-photo/upload
 * @access Private
 */
exports.uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    const userId = req.user.id;
    const file = req.file;

    console.log('Profile photo upload request:', {
      userId,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype
    });

    // Validate file using S3 service
    const validation = s3Service.validateFile(file);
    if (!validation.valid) {
      throw new ValidationError(validation.message);
    }

    // Get current profile to check if there's an existing photo
    let profile = await Profile.findOne({ where: { user_id: userId } });
    let oldPhotoUrl = null;

    if (profile && profile.photo_url) {
      oldPhotoUrl = profile.photo_url;
      console.log('Found existing photo URL:', oldPhotoUrl);
    }

    // Upload to S3
    const uploadResult = await s3Service.uploadProfilePhoto(
      file.buffer,
      file.originalname,
      userId,
      file.mimetype
    );

    // Delete old photo if it exists
    if (oldPhotoUrl) {
      try {
        await s3Service.deleteProfilePhoto(oldPhotoUrl);
        console.log('Old photo deleted successfully');
      } catch (deleteError) {
        console.warn('Failed to delete old photo:', deleteError.message);
        // Don't fail the upload if deletion fails
      }
    }

    // Update profile with new photo URL (direct S3 URL)
    if (profile) {
      profile.photo_url = uploadResult.photoUrl;
      await profile.save();
      console.log('Profile updated with new photo URL:', uploadResult.photoUrl);
    } else {
      // Create new profile if it doesn't exist
      profile = await Profile.create({
        user_id: userId,
        photo_url: uploadResult.photoUrl
      });
      console.log('New profile created with photo URL:', uploadResult.photoUrl);
    }

    console.log('Upload completed successfully:', {
      userId,
      photoUrl: uploadResult.photoUrl
    });

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        photoUrl: uploadResult.photoUrl,
        fileName: uploadResult.fileName,
        profile: profile
      }
    });

  } catch (error) {
    console.error('Profile photo upload error:', error);
    next(error);
  }
};

/**
 * Update an existing profile photo
 * @route PUT /api/profile-photo/update
 * @access Private
 */
exports.updateProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    const userId = req.user.id;
    const file = req.file;

    console.log('Profile photo update request:', {
      userId,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype
    });

    // Validate file
    const validation = s3Service.validateFile(file);
    if (!validation.valid) {
      throw new ValidationError(validation.message);
    }

    // Get current profile
    const profile = await Profile.findOne({ where: { user_id: userId } });
    if (!profile) {
      throw new NotFoundError('Profile not found');
    }

    const oldPhotoUrl = profile.photo_url;
    console.log('Current photo URL:', oldPhotoUrl);

    // Update photo in S3
    const updateResult = await s3Service.updateProfilePhoto(
      file.buffer,
      file.originalname,
      userId,
      file.mimetype,
      oldPhotoUrl
    );

    // Update profile with new photo URL (direct S3 URL)
    profile.photo_url = updateResult.photoUrl;
    await profile.save();
    console.log('Profile updated with new photo URL:', updateResult.photoUrl);

    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully',
      data: {
        photoUrl: updateResult.photoUrl,
        fileName: updateResult.fileName,
        profile: profile
      }
    });

  } catch (error) {
    console.error('Profile photo update error:', error);
    next(error);
  }
};

/**
 * Delete profile photo
 * @route DELETE /api/profile-photo/delete
 * @access Private
 */
exports.deleteProfilePhoto = async (req, res, next) => {
  try {
    const userId = req.user.id;

    console.log('Profile photo delete request:', { userId });

    // Get current profile
    const profile = await Profile.findOne({ where: { user_id: userId } });
    if (!profile || !profile.photo_url) {
      throw new NotFoundError('No profile photo found');
    }

    const photoUrl = profile.photo_url;
    console.log('Deleting photo URL:', photoUrl);

    // Delete from S3
    await s3Service.deleteProfilePhoto(photoUrl);

    // Remove photo URL from profile
    profile.photo_url = null;
    await profile.save();

    console.log('Profile photo deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Profile photo deleted successfully',
      data: {
        profile: profile
      }
    });

  } catch (error) {
    console.error('Profile photo delete error:', error);
    next(error);
  }
};

/**
 * Get profile photo
 * @route GET /api/profile-photo
 * @access Private
 */
exports.getProfilePhoto = async (req, res, next) => {
  try {
    const userId = req.user.id;

    console.log('Profile photo get request:', { userId });

    // Get profile
    const profile = await Profile.findOne({ where: { user_id: userId } });
    
    if (!profile || !profile.photo_url) {
      return res.status(200).json({
        success: true,
        message: 'No profile photo found',
        data: {
          hasPhoto: false,
          photoUrl: null
        }
      });
    }

    console.log('Profile photo found:', profile.photo_url);

    res.status(200).json({
      success: true,
      message: 'Profile photo retrieved successfully',
      data: {
        hasPhoto: true,
        photoUrl: profile.photo_url
      }
    });

  } catch (error) {
    console.error('Profile photo get error:', error);
    next(error);
  }
}; 