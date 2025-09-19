import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const recruiterSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  companyLogo: {
    public_id: String,
    url: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationOTP: String,
  emailVerificationOTPExpires: Date,
  passwordChangedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before saving
recruiterSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to update passwordChangedAt when password is modified
recruiterSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  // Set passwordChangedAt to current time minus 1 second
  // to ensure token is always created after the password has been changed
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Method to compare passwords
recruiterSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if password was changed after the token was issued
recruiterSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

// Method to create email verification OTP
recruiterSchema.methods.createEmailVerificationOTP = function() {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  this.emailVerificationOTP = otp;

  // OTP expires in 10 minutes
  this.emailVerificationOTPExpires = Date.now() + 10 * 60 * 1000;

  return otp;
};

// Check if the model exists before compiling it
const Recruiter = mongoose.models.Recruiter || mongoose.model('Recruiter', recruiterSchema);

export default Recruiter;
