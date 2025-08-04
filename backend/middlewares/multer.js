// middlewares/multer.js
import multer from "multer";

// Use memoryStorage for direct cloud uploads (e.g., Cloudinary)
const storage = multer.memoryStorage();

// File filter to accept only specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and PDF files are allowed.'), false);
  }
};

// Configure multer with file size limits and file filter
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter
});

// Define fields you're expecting from frontend
export const multiUpload = upload.fields([
  { name: "resumeFile", maxCount: 1 },
  { name: "profilePhoto", maxCount: 1 },
  { name: "coverPhoto", maxCount: 1 },
  { name: "image", maxCount: 1 } // for post image
]);

// Single file upload middleware
export const singleUpload = upload.single('file');
