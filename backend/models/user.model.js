import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    pendingEmail: { type: String },
    phoneNumber: { type: String },
    password: { type: String },
    googleId: { type: String, unique: true, sparse: true },

    profile: {
      // Basic Info
      bio: { type: String },
      headline: { type: String },
      location: { type: String },
      pronouns: { type: String },
      website: { type: String },
      
      // Skills & Expertise
      skills: [{ type: String }],
      projects: [{
        title: { type: String, required: true },
        url: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        description: { type: String },
        technologies: [{ type: String }]
      }],
      // Experience
      experience: [{
        title: { type: String, required: true },
        company: { type: String, required: true },
        employmentType: {
          type: String,
          enum: ['Full-time', 'Part-time', 'Self-employed', 'Freelance', 'Contract', 'Internship', 'Apprenticeship', 'Seasonal'],
          default: 'Full-time'
        },
        location: { type: String },
        current: { type: Boolean, default: false },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        description: { type: String },
        skills: [{ type: String }]
      }],

      // Education
      education: [{
        school: { type: String, required: true },
        degree: { type: String, required: true },
        field: { type: String, required: true },
        grade: { type: String },
        activities: { type: String },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        current: { type: Boolean, default: false },
        description: { type: String }
      }],

      // Certifications
      certifications: [{
        name: { type: String, required: true },
        issuingOrganization: { type: String, required: true },
        issueDate: { type: Date, required: true },
        expirationDate: { type: Date },
        credentialId: { type: String },
        credentialUrl: { type: String }
      }],

      // Languages
      languages: [{
        name: { type: String, required: true },
        proficiency: { 
          type: String, 
          enum: ['Elementary', 'Limited Working', 'Professional', 'Full Professional', 'Native/Bilingual'],
          required: true 
        }
      }],

      // Files
      resume: { type: String },
      resumeOriginalName: { type: String },
      profilePhoto: { type: String, default: "" },
      coverPhoto: { type: String },
    },

    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },

    phoneVerificationOtp: { type: String },
    phoneVerificationExpire: { type: Date },
    isPhoneVerified: { type: Boolean, default: false },

    forgotPasswordOTP: { type: String, default: null },
    forgotPasswordExpires: { type: Date, default: Date.now },

    // ✅ Added for follow/unfollow
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    notifications: [
      {
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        message: {
          type: String,
          required: true
        },
        type: {
          type: String,
          enum: ['follow', 'like', 'comment', 'message', 'application', 'other'],
          required: true
        },
        link: String,
        date: {
          type: Date,
          default: Date.now,
        },
        read: {
          type: Boolean,
          default: false,
        },
        metadata: {
          type: Map,
          of: mongoose.Schema.Types.Mixed
        }
      }
    ],
    
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
