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
      about: {
        headline: { type: String, default: '' },
        bio: { type: String, default: '' },
        location: { type: String, default: '' },
        website: { type: String, default: '' },
        resumeUrl: { type: String, default: '' },
        resumeName: { type: String, default: '' }
      },
      
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
        credentialUrl: { type: String },
        description: { type: String }
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
      profilePhoto: { type: String, default: "" },
      coverPhoto: { type: String }
    },

    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },

    phoneVerificationOtp: { type: String },
    phoneVerificationExpire: { type: Date },
    isPhoneVerified: { type: Boolean, default: false },

    forgotPasswordOTP: { type: String, default: null },
    forgotPasswordExpires: { type: Date, default: Date.now },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpire: { type: Date },

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    notifications: [{
      type: { type: String, required: true },
      from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      metadata: { type: mongoose.Schema.Types.Mixed }
    }],

    lastActive: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    isProfileComplete: { type: Boolean, default: false },
    
    // Social Logins
    githubId: { type: String },
    linkedinId: { type: String },
    
    // Preferences
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      privacy: {
        profileVisibility: { type: String, enum: ['public', 'connections', 'private'], default: 'public' },
        emailVisibility: { type: Boolean, default: false },
        phoneVisibility: { type: Boolean, default: false }
      }
    },
    
    // Account Status
    status: {
      isBanned: { type: Boolean, default: false },
      banReason: { type: String },
      banExpires: { type: Date }
    },
    
    // Timestamps
    lastLogin: { type: Date },
    lastPasswordChange: { type: Date },
    accountCreated: { type: Date, default: Date.now },
    
    // Additional Metadata
    metadata: {
      signupSource: { type: String },
      ipAddress: { type: String },
      userAgent: { type: String },
      lastIpAddress: { type: String },
      lastUserAgent: { type: String },
      timezone: { type: String },
      locale: { type: String },
      deviceInfo: { type: mongoose.Schema.Types.Mixed }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'profile.location': 'text', fullname: 'text', 'profile.about.headline': 'text' });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.fullname || `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Pre-save hook to ensure username is lowercase
userSchema.pre('save', function(next) {
  if (this.isModified('username') && this.username) {
    this.username = this.username.toLowerCase();
  }
  next();
});

// Method to generate auth token
userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    { _id: this._id, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
  return token;
};

// Method to generate password reset token
userSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return resetToken;
};

export const User = mongoose.model('User', userSchema);
