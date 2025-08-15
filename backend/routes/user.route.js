import express from 'express';
import { 
    getUserData, 
    getAppliedJobs,
    applyForJob,
    getUserApplications,
    applyJob
} from '../controllers/user.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();

// Public routes
router.get('/:id', getUserData);

// Protected routes (require authentication)
router.use(isAuthenticated);

// Job application routes
router.post('/jobs/:jobId/apply', applyForJob);
router.get('/me/applications', getAppliedJobs);
router.get('/me/applicants', getUserApplications);

export default router;