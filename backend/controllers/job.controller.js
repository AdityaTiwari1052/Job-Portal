import Job from "../models/job.model.js";
import Recruiter from "../models/recruiter.model.js"; // Added Recruiter model import
import mongoose from 'mongoose'; // Added mongoose import

export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { companyName: { $regex: keyword, $options: "i" } },
        { skills: { $in: [new RegExp(keyword, 'i')] } }
      ]
    };

    const jobs = await Job.find(query).sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      jobs
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs'
    });
  }
};

export const postJob = async (req, res) => {
  try {
    // First, get the recruiter's details to include company info
    const recruiter = await Recruiter.findById(req.id);
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter not found'
      });
    }

    // Parse requirements string into array if it's a string
    const requirements = Array.isArray(req.body.requirements) 
      ? req.body.requirements 
      : req.body.requirements?.split(',').map(r => r.trim()) || [];

    // Parse skills string into array if it's a string
    const skills = Array.isArray(req.body.skills) 
      ? req.body.skills 
      : req.body.skills?.split(',').map(s => s.trim()) || [];

    // Convert salary to numbers and set min/max
    const salary = parseInt(req.body.salary) || 0;
    const salaryMin = salary - (salary * 0.2); // 20% below the provided salary
    const salaryMax = salary + (salary * 0.2); // 20% above the provided salary

    const jobData = {
      ...req.body,
      requirements,
      skills,
      salaryMin: Math.max(0, Math.floor(salaryMin)), // Ensure not negative
      salaryMax: Math.max(0, Math.ceil(salaryMax)),
      created_by: req.id,
      company: req.id,
      companyName: recruiter.companyName,
      companyLogo: recruiter.companyLogo || ''
    };

    const job = new Job(jobData);
    await job.save();

    return res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job
    });
  } catch (error) {
    console.error('Error posting job:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to post job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getJobById = async (req, res) => {
  try {
    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format'
      });
    }

    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    return res.status(200).json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getJobsByRecruiter = async (req, res) => {
  try {
    console.log('Fetching jobs for recruiter ID:', req.id); 
    const jobs = await Job.find({ 
      created_by: req.id 
    }).sort({ createdAt: -1 });

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({
        message: "No jobs found for this recruiter.",
        success: false,
        jobs: []
      });
    }

    return res.status(200).json({
      success: true,
      jobs
    });
  } catch (error) {
    console.error('Error fetching recruiter jobs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
};
