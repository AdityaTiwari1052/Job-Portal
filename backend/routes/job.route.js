import express from "express";
import {
  getAllJobs,
  getJobById,
  postJob,
  getJobsByRecruiter,
} from "../controllers/job.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Public routes
router.get("/all", getAllJobs);

// Protected routes (require authentication)
router.use(isAuthenticated);

// Recruiter routes
router.get("/recruiter/my-jobs", getJobsByRecruiter);  // Moved before /:id route
router.post("/", postJob);

// This should be the last route as it's a catch-all for IDs
router.get("/:id", getJobById);

export default router;
