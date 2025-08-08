import { Job } from "../models/job.model.js";

import mongoose from 'mongoose';

// admin post krega job
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experienceLevel, position, companyId } = req.body;
        const userId = req.user._id;

        // Log the incoming request body for debugging
        console.log('Request body:', req.body);

        if (!title || !description || !requirements || !salary || !location || !jobType || !experienceLevel || !position || !companyId) {
            return res.status(400).json({
                message: "All fields are required, including company selection.",
                success: false,
                missingFields: {
                    title: !title,
                    description: !description,
                    requirements: !requirements,
                    salary: !salary,
                    location: !location,
                    jobType: !jobType,
                    experienceLevel: !experienceLevel,
                    position: !position,
                    companyId: !companyId
                }
            });
        }

        // Validate companyId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({
                message: "Invalid company ID format.",
                success: false,
                companyId: companyId
            });
        }

        const job = await Job.create({
            title,
            description,
            requirements: Array.isArray(requirements) ? requirements : requirements.split(","),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel,
            position: Number(position),
            company: companyId,
            created_by: userId
        });

        // Populate the company data in the response
        const populatedJob = await Job.findById(job._id).populate('company', 'name');

        return res.status(201).json({
            message: "New job created successfully.",
            job: populatedJob,
            success: true
        });
    } catch (error) {
        console.error('Error in postJob:', error);
        return res.status(500).json({
            message: error.message || "Error creating job",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
// student k liye
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        };
        const jobs = await Job.find(query)
            .populate({ path: "company", select: "name logo" })
            .select("title description requirements salary experienceLevel location jobType position company created_by createdAt")
            .sort({ createdAt: -1 });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
// student
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path:"applications"
        });
        if (!job) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
       
        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.log(error);
    }
}
// admin kitne job create kra hai abhi tk
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.user._id;
        const jobs = await Job.find({ created_by: adminId })
            .populate({
                path: 'company'
            })
            .populate({
                path: 'applications',
                populate: {
                    path: 'applicant',
                    model: 'User',
                    select: 'profile.fullname profile.email'
                }
            })
            .sort({ createdAt: -1 });

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                message: "You have not posted any jobs yet.",
                success: false
            })
        };

        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error." });
    }
}
