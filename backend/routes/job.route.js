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
router.get("/:id", getJobById);  // Moved before authentication middleware

// Protected routes (require authentication)
router.use(isAuthenticated);

// Recruiter routes
router.get("/recruiter/my-jobs", getJobsByRecruiter);
router.post("/", postJob);

export default router;
