import User from '../models/user.model.js';
import Job from '../models/job.model.js';
import JobApplication from '../models/jobApplication.model.js';

export const getUserData = async (req, res, next) => {
    try {
        const userId = req.params.id;

        // Find user by ID
        const user = await User.findById(userId).select('-__v');

        // Check if user exists
        if (!user) {
            return next(new AppError('No user found with that ID', 404));
        }

        // Return user data
        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });

    } catch (error) {
        next(error);
    }
};

export const applyJob = async (req, res, next) => {
    try {
        const { id: jobId } = req.params;
        const userId = req.user._id; // From our middleware

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return next(new AppError('Job not found', 404));
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
            job: jobId,
            applicant: userId
        });

        if (existingApplication) {
            return next(new AppError('You have already applied to this job', 400));
        }

        // Create new application
        const application = await Application.create({
            job: jobId,
            applicant: userId,
            status: 'pending'
        });

        // Add application to job
        job.applications.push(application._id);
        await job.save();

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            application
        });
    } catch (error) {
        next(error);
    }
};

export const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const application = await Application.find({ applicant: userId }).sort({ createdAt: -1 }).populate({
            path: 'job',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'company',
                options: { sort: { createdAt: -1 } },
            }
        });
        if (!application) {
            return res.status(404).json({
                message: "No Applications",
                success: false
            })
        };
        return res.status(200).json({
            application,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const applyForJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const userId = req.user?._id || req.id; // Handle both authenticated and webhook calls
        const { resume, coverLetter = '' } = req.body;

        if (!jobId || !userId) {
            return next(new AppError('Job ID and User ID are required', 400));
        }

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return next(new AppError('Job not found', 404));
        }

        // Check if already applied
        const existingApplication = await JobApplication.findOne({
            user: userId,
            job: jobId
        });

        if (existingApplication) {
            return next(new AppError('You have already applied to this job', 400));
        }

        // Create new application
        const application = await JobApplication.create({
            user: userId,
            job: jobId,
            recruiter: job.created_by,
            resume,
            coverLetter
        });

        // Populate the application with user and job details
        const populatedApp = await JobApplication.findById(application._id)
            .populate('user', 'name email profilePicture')
            .populate('job', 'title')
            .lean();

        res.status(201).json({
            success: true,
            data: { application: populatedApp }
        });

    } catch (error) {
        next(new AppError('Failed to submit application', 500));
    }
};

export const getUserApplications = async (req, res) => {
    try {
        console.log('getUserApplications - Request user:', req.user);
        console.log('Request headers:', req.headers);
        
        if (!req.user || !req.user._id) {
            console.error('User not authenticated or missing user ID');
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Disable caching for this response
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Get jobs posted by this recruiter
        const jobs = await Job.find({ postedBy: req.user._id }).select('_id');
        const jobIds = jobs.map(job => job._id);
  
        // Get applications for these jobs
        const applications = await JobApplication.find({ job: { $in: jobIds } })
            .populate('applicant', 'name email phone')
            .populate({
                path: 'job',
                select: 'title companyName',
                populate: {
                    path: 'postedBy',
                    select: 'companyName'
                }
            })
            .sort({ appliedAt: -1 });
  
        // Send fresh data
        return res.status(200).json({
            success: true,
            data: {
                applications: applications.map(app => ({
                    _id: app._id,
                    status: app.status,
                    appliedAt: app.appliedAt,
                    job: {
                        _id: app.job?._id,
                        title: app.job?.title,
                        company: app.job?.companyName || (app.job?.postedBy?.companyName || 'N/A')
                    },
                    applicant: {
                        _id: app.applicant?._id,
                        name: app.applicant?.name,
                        email: app.applicant?.email,
                        phone: app.applicant?.phone,
                        resume: app.resume
                    }
                }))
            }
        });
    } catch (error) {
        console.error('Error in getUserApplications:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching applications',
            error: error.message
        });
    }
};