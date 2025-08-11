const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.csv', '.xlsx', '.json'].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV, XLSX, and JSON files are allowed'));
  }
};

// Add file size limits
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB limit
  files: 1 // Only allow 1 file
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits 
});

module.exports = upload; 