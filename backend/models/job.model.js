import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    requirements: [{
        type: String
    }],
    salaryMin: {
        type: Number,
        required: true
    },
    salaryMax: {
        type: Number,
        required: true
    },
    experienceLevel: {
        type: String,
        required: true,
        enum: ['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Manager', 'Executive']
    },
    location: {
        type: String,
        required: true
    },
    jobType: {
        type: String,
        required: true,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary']
    },
    skills: [{
        type: String,
        required: true
    }],
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    companyLogo: {
        type: String,
        default: ''
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 30*24*60*60*1000) // 30 days from now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add a text index for search functionality
jobSchema.index({
    title: 'text',
    description: 'text',
    companyName: 'text',
    location: 'text',
    skills: 'text'
});

const Job = mongoose.model("Job", jobSchema);
export default Job;
