import Recruiter from "../models/recruiter.model.js";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";

// Sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Create and send token
const createSendToken = (recruiter, statusCode, res) => {
  try {
    const token = signToken(recruiter._id);

    // Set cookie options with default expiration of 30 days
    const cookieOptions = {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    };

    // Set the cookie
    res.cookie('token', token, cookieOptions);

    // Remove password from output
    recruiter.password = undefined;

    res.status(statusCode).json({
      status: "success",
      token,
      data: {
        recruiter,
      },
    });
  } catch (error) {
    console.error('Error in createSendToken:', error);
    throw error; // Re-throw to be caught by the login/signup handlers
  }
};

const signup = async (req, res, next) => {
  try {
    const { companyName, email, password } = req.body;

    if (!companyName || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide company name, email, and password",
      });
    }

    const existingRecruiter = await Recruiter.findOne({ email });
    if (existingRecruiter) {
      return res.status(400).json({
        status: "error",
        message: "Email already in use",
      });
    }

    let logoData = {};
    if (req.file) {
      try {
        console.log("Uploading logo buffer to Cloudinary...");
        logoData = await uploadBufferToCloudinary(req.file.buffer);
        console.log("Cloudinary upload successful:", logoData);
      } catch (uploadError) {
        console.error("Error uploading to Cloudinary:", uploadError);
        return res.status(400).json({
          status: "error",
          message: `Failed to upload logo: ${uploadError.message}`,
        });
      }
    }

    const newRecruiter = await Recruiter.create({
      companyName,
      email,
      password,
      ...(Object.keys(logoData).length > 0 && { companyLogo: logoData }),
    });

    console.log("Recruiter created successfully:", newRecruiter.email);
    createSendToken(newRecruiter, 201, res);
  } catch (error) {
    console.error("Error in signup controller:", error);
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide email and password",
      });
    }

   
    const recruiter = await Recruiter.findOne({ email }).select("+password");

    if (
      !recruiter ||
      !(await recruiter.comparePassword(password, recruiter.password))
    ) {
      return res.status(401).json({
        status: "error",
        message: "Incorrect email or password",
      });
    }

    // 3) If everything ok, send token to client
    createSendToken(recruiter, 200, res);
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};


const getMe = async (req, res, next) => {
  try {
    console.log('Fetching recruiter with ID:', req.id); // Debug log
    const recruiter = await Recruiter.findById(req.id);
    
    if (!recruiter) {
      return res.status(404).json({
        status: "error",
        message: "No recruiter found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        recruiter,
      },
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({
      status: "error",
      message: error.message || 'An error occurred while fetching recruiter data',
    });
  }
};

const updateMe = async (req, res, next) => {
  try {
    const { companyName, email } = req.body;

    const updatedRecruiter = await Recruiter.findByIdAndUpdate(
      req.recruiter.id,
      { companyName, email },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        recruiter: updatedRecruiter,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId, status } = req.body;
    const recruiterId = req.id; // Changed from req.recruiter.id to req.id

    // Validate input
    if (!applicationId || !status) {
      return res.status(400).json({
        status: "error",
        message: "Please provide both applicationId and status",
      });
    }

    // Validate status value
    if (!['pending', 'shortlisted', 'rejected', 'hired'].includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid status. Must be one of: pending, shortlisted, rejected, hired",
      });
    }

    // Find and update the application
    const updatedApplication = await JobApplication.findOneAndUpdate(
      {
        _id: applicationId,
        recruiter: recruiterId, // Use the recruiterId from the request
      },
      { status },
      { new: true, runValidators: true }
    )
    .populate('user', 'name email')
    .populate('job', 'title');

    if (!updatedApplication) {
      return res.status(404).json({
        status: "error",
        message: "Application not found or you don't have permission to update it",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        application: updatedApplication,
      },
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      status: "error",
      message: error.message || "An error occurred while updating the application status",
    });
  }
};



export {
  signup,
  login,
  getMe,
  updateMe,
  updateApplicationStatus
};
