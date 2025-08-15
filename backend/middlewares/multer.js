// middlewares/multer.js
import multer from "multer";

// Configure multer for memory storage
const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

export const companyLogoUpload = multer({
  storage: memoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB file size limit
  },
}).single("logo");

// Single file upload for profile photo
export const singleUpload = (req, res, next) => {
  const uploadSingle = multer({
    storage: memoryStorage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 1024 * 1024 * 5, // 5 MB file size limit
    },
  }).single('profilePhoto');
  
  uploadSingle(req, res, function(err) {
    if (err) {
      console.error('File upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading file.',
        code: err.code
      });
    }
    next();
  });
};

// Multiple file uploads for other routes
export const multiUpload = (req, res, next) => {
  const uploadMultiple = multer({
    storage: memoryStorage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 1024 * 1024 * 5, // 5 MB file size limit
    },
  }).fields([
    { name: "resumeFile", maxCount: 1 },
    { name: "profilePhoto", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "logo", maxCount: 1 }
  ]);

  uploadMultiple(req, res, function(err) {
    if (err) {
      console.error('Multiple file upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading files.',
        code: err.code
      });
    }
    next();
  });
};

// Error handling middleware for multer
export const handleMulterErrors = (err, req, res, next) => {
  if (err) {
    console.error('Multer error:', {
      code: err.code,
      message: err.message,
      field: err.field,
      stack: err.stack
    });

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size is too large. Maximum size is 5MB.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: err.message || 'Invalid file type. Only images are allowed.'
      });
    }
    return res.status(500).json({
      success: false,
      message: err.message || 'Error uploading file.'
    });
  }
  next();
};
