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

const upload = multer({ storage, fileFilter });

module.exports = upload; 