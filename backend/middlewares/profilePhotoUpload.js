const multer = require('multer');
const path = require('path');

// Configure multer for profile photo uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed for profile photos'), false);
  }
};

const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB limit
  files: 1 // Only allow 1 file
};

const profilePhotoUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits
});

module.exports = profilePhotoUpload; 