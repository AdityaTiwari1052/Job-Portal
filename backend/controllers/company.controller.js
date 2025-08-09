import { Company } from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const registerCompany = async (req, res) => {
    try {
        console.log('=== REGISTER COMPANY REQUEST ===');
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            buffer: req.file.buffer ? `Buffer (${req.file.buffer.length} bytes)` : 'No buffer'
        } : 'No file uploaded');

        const { name, description, website, location } = req.body;
        
        // Validate required fields
        if (!name) {
            console.log('Validation failed: Company name is required');
            return res.status(400).json({
                message: "Company name is required.",
                success: false
            });
        }

        // Check if company with same name already exists
        const existingCompany = await Company.findOne({ name });
        if (existingCompany) {
            console.log('Company already exists:', name);
            return res.status(400).json({
                message: "A company with this name already exists.",
                success: false
            });
        }

        // Handle file upload if present
        let logoUrl = '';
        if (req.file) {
            console.log('Processing file upload...');
            try {
                console.log('Converting file to data URI...');
                const file = getDataUri(req.file);
                console.log('File converted to data URI successfully');
                
                console.log('Uploading to Cloudinary...');
                const uploadResult = await cloudinary.uploader.upload(file.content, {
                    folder: 'company-logos',
                    resource_type: 'auto', // Changed from 'image' to 'auto' to handle all file types
                    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET // Make sure this is set
                });
                
                console.log('Cloudinary upload result:', {
                    url: uploadResult.secure_url,
                    public_id: uploadResult.public_id,
                    format: uploadResult.format
                });
                
                logoUrl = uploadResult.secure_url;
            } catch (uploadError) {
                console.error('Error uploading to Cloudinary:', {
                    message: uploadError.message,
                    stack: uploadError.stack,
                    response: uploadError.response?.data
                });
                return res.status(500).json({
                    message: "Failed to upload company logo. Please try again.",
                    success: false,
                    error: uploadError.message
                });
            }
        } else {
            console.log('No file was uploaded with the request');
        }

        // Create new company with all provided details
        const companyData = {
            name,
            description: description || '',
            website: website || '',
            location: location || '',
            logo: logoUrl,
            userId: req.user._id
        };

        console.log('Creating company with data:', companyData);
        const company = await Company.create(companyData);
        console.log('Company created successfully:', company);

        return res.status(201).json({
            message: "Company registered successfully.",
            company,
            success: true
        });

    } catch (error) {
        console.error('Error in registerCompany:', {
            message: error.message,
            stack: error.stack,
            request: {
                body: req.body,
                file: req.file ? 'File present' : 'No file',
                user: req.user
            }
        });
        return res.status(500).json({
            message: error.message || "Internal server error",
            success: false
        });
    }
};

export const getCompany = async (req, res) => {
    try {
        const userId = req.user._id; // logged in user id
        const companies = await Company.find({ userId });
        if (!companies) {
            return res.status(404).json({
                message: "Companies not found.",
                success: false
            })
        }
        return res.status(200).json({
            companies,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}
// get company by id
export const getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            })
        }
        return res.status(200).json({
            company,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

// Get companies by user ID
export const getUserCompanies = async (req, res) => {
    try {
        const companies = await Company.find({ userId: req.user._id });
        return res.status(200).json({
            success: true,
            companies
        });
    } catch (error) {
        console.error('Error in getUserCompanies:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching user companies',
            error: error.message
        });
    }
};

export const updateCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;
 
        const file = req.file;
        // idhar cloudinary ayega
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        const logo = cloudResponse.secure_url;
    
        const updateData = { name, description, website, location, logo };

        const company = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            })
        }
        return res.status(200).json({
            message:"Company information updated.",
            success:true
        })

    } catch (error) {
        console.log(error);
    }
}