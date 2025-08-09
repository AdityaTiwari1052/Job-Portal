// middlewares/multer.js
import multer from "multer";

// Use memoryStorage for direct cloud uploads (e.g., Cloudinary)
const storage = multer.memoryStorage();

// File filter to accept only specific file types
const fileFilter = (req, file, cb) => {
  // Log the file being uploaded for debugging
  console.log('Processing file upload:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  // Define allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',  // Added webp support
    'application/pdf'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(`Invalid file type: ${file.mimetype}. Only ${allowedTypes.join(', ')} are allowed.`);
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Configure multer with file size limits and file filter
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only allow one file per request
  },
  fileFilter,
  preservePath: true
});

// Single file upload for company logo
export const companyLogoUpload = (req, res, next) => {
  const uploadSingle = upload.single('logo');
  
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

// Single file upload for profile photo
export const singleUpload = (req, res, next) => {
  const uploadSingle = upload.single('profilePhoto');
  
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
  const uploadMultiple = upload.fields([
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
    if (err.code === 'INVALID_FILE_TYPE' || err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: err.message || 'Invalid file type. Only JPEG, JPG, PNG, and PDF files are allowed.'
      });
    }
    return res.status(500).json({
      success: false,
      message: err.message || 'Error uploading file.'
    });
  }
  next();
};
