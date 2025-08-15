import express from "express";
import { signup, login, getMe, updateMe, updateApplicationStatus } from "../controllers/recruiter.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { companyLogoUpload } from "../middlewares/multer.js";
import cors from 'cors';

const router = express.Router();

// CORS middleware for recruiter routes
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'https://job-portal-v3b1.onrender.com',
      'http://job-portal-v3b1.onrender.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'Content-Type', 'Authorization'],
  maxAge: 600
};

// Apply CORS to all recruiter routes
router.use(cors(corsOptions));
router.options('*', cors(corsOptions));

// Public routes
router.post("/signup", companyLogoUpload, signup);
router.post("/login", cors(corsOptions), login);

// Protected routes (require authentication)
router.use(isAuthenticated);
router.get("/me", getMe);
router.patch("/update-me", updateMe);
router.patch("/applications/status", updateApplicationStatus);

export default router;
