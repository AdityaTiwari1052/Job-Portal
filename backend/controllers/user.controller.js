import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { setAuthCookie } from "../utils/cookieHelper.js";

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }
        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Google Login
export const googleLogin = async (req, res) => {
    try {
        console.log('Google login request received:', req.body);
        const { email, name, profilePhoto } = req.body;
        
        if (!email || !name) {
            console.log('Missing email or name in request');
            return res.status(400).json({
                message: "Email and name are required",
                success: false
            });
        }
        
        // Find or create user
        console.log('Looking for user with email:', email);
        let user = await User.findOne({ email });
        
        if (!user) {
            console.log('User not found, creating new user...');
            try {
                user = await User.create({
                    fullname: name,
                    email,
                    profilePhoto: profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
                    password: crypto.randomBytes(32).toString('hex'), // Random password for Google users
                    isEmailVerified: true // Mark email as verified for Google users
                });
                console.log('New user created:', user);
            } catch (error) {
                console.error('Error creating user:', error);
                return res.status(500).json({
                    message: "Error creating user account",
                    success: false,
                    error: error.message
                });
            }
        } else {
            console.log('Existing user found:', user);
        }
        
        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });
        console.log('JWT token generated for user:', user._id);
        
        // Set HTTP-only cookie with the token
        setAuthCookie(res, token);
        console.log('Auth cookie set successfully');
        
        // Return user data without sensitive information
        const userData = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            profilePhoto: user.profilePhoto,
            // Role field removed
            isEmailVerified: user.isEmailVerified
        };
        
        return res.status(200).json({
            message: `Welcome ${user.fullname}`,
            user: userData,
            success: true
        });
        
    } catch (error) {
        console.error('Google login error:', error);
        return res.status(500).json({
            message: "Internal server error during Google login",
            success: false,
            error: error.message
        });
    }
};

// Login
export const login = async (req, res) => {
    try {
        console.log('\n=== LOGIN REQUEST ===');
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
        
        const { identifier, password } = req.body; // Changed from email to identifier
        
        // Validate required fields
        if (!identifier || !password) {
            return res.status(400).json({
                message: "Email/Username and password are required",
                success: false
            });
        }
        
        console.log('Looking for user with identifier:', identifier);
        
        // Check if the identifier is an email or username
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
        
        let user;
        if (isEmail) {
            user = await User.findOne({ email: identifier });
        } else {
            user = await User.findOne({ username: identifier });
        }
        
        if (!user) {
            console.log('No user found with identifier:', identifier);
            return res.status(400).json({
                message: "Incorrect email/username or password.",
                success: false
            });
        }
        
        console.log('User found, checking password...');
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            console.log('Password does not match');
            return res.status(400).json({
                message: "Incorrect email/username or password.",
                success: false
            });
        }
        
        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });
        
        // Set HTTP-only cookie with the token
        setAuthCookie(res, token);
        
        // Return user data without sensitive information
        const userData = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            username: user.username, // Include username in the response
            phoneNumber: user.phoneNumber,
            profile: user.profile
        };
        
        console.log('Login successful for user:', user.email);
        return res.status(200).json({
            message: `Welcome back ${user.fullname || user.username}`,
            user: userData,
            success: true
        });
        
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Separate function to handle the login logic
const processLogin = async (req, res) => {
    try {
        console.log('\n=== LOGIN REQUEST ===');
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
        
        
        
        // Log raw body if available
        if (req.rawBody) {
            console.log('Raw body:', req.rawBody);
        } else {
            console.log('No raw body available');
            // Try to read the raw body from the request stream
            let data = [];
            req.on('data', chunk => data.push(chunk));
            req.on('end', () => {
                const rawBody = Buffer.concat(data).toString();
                console.log('Read raw body from stream:', rawBody);
            });
        }
        
        
        // Ensure body is properly parsed
        if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
            console.error('Invalid or empty request body:', req.body);
            return res.status(400).json({
                message: 'Invalid or empty request body',
                success: false,
                error: 'INVALID_REQUEST_BODY',
                receivedBody: req.body ? JSON.stringify(req.body) : 'No body received',
                bodyType: typeof req.body,
                bodyKeys: Object.keys(req.body || {}),
                headers: req.headers,
                rawBody: req.rawBody || 'No raw body',
                rawHeaders: req.rawHeaders
            });
        }
        
        // Destructure and validate required fields
        const { email, password } = req.body;
        
       
        
        // Validate required fields
        const missingFields = [];
        if (!email || typeof email !== 'string' || !email.trim()) missingFields.push('email');
        if (!password || typeof password !== 'string') missingFields.push('password');
        
        if (missingFields.length > 0) {
            const errorMessage = `Missing or invalid fields: ${missingFields.join(', ')}`;
            console.error('Validation failed:', errorMessage);
            
            return res.status(400).json({
                message: errorMessage,
                success: false,
                error: 'VALIDATION_ERROR',
                details: {
                    missingFields,
                    received: {
                        email: email ? 'present' : 'missing',
                        password: password ? 'present' : 'missing',
                        requestContentType: req.get('Content-Type')
                    }
                }
            });
        }
        
        console.log('Looking for user with email:', email);
        let user = await User.findOne({ email });
        if (!user) {
            console.log('No user found with email:', email);
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
                error: "USER_NOT_FOUND"
            });
        }
        
        console.log('User found, checking password...');
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            console.log('Password does not match');
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
                error: "INVALID_CREDENTIALS"
            });
        }
        
        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });
        
        // Set HTTP-only cookie with the token
        setAuthCookie(res, token);
        
        // Return user data without sensitive information
        const userData = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            // Role field removed
            profile: user.profile,
            isEmailVerified: user.isEmailVerified
        };
        
        return res.status(200).json({
            message: `Welcome back ${user.fullname}`,
            user: userData,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Logout
export const logout = async (req, res) => {
    try {
        // Clear the authentication cookie
        return clearAuthCookie(res)
            .status(200)
            .json({
                message: "Logged out successfully.",
                success: true
            });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Register
export const register = async (req, res) => {
    try {
        // For form-data, fields are available directly on req.body
        const { fullname, username, email, phoneNumber, password } = req.body;
        
        // Validate required fields
        if (!fullname || !username || !email || !phoneNumber || !password) {
            return res.status(400).json({
                message: "All fields are required: fullname, username, email, phoneNumber, password",
                success: false
            });
        }
        
        // Check if email already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                message: existingUser.email === email 
                    ? 'User already exists with this email.' 
                    : 'Username is already taken.',
                success: false,
            });
        }
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = await User.create({
            fullname,
            username,
            email,
            phoneNumber,
            password: hashedPassword,
            isEmailVerified: false, // Email verification will be handled separately
            profilePhoto: req.file ? req.file.path : undefined // Save file path if uploaded
        });
        
        // Generate token for the new user
        const token = jwt.sign({ userId: newUser._id }, process.env.SECRET_KEY, { expiresIn: '1d' });
        
        // Set HTTP-only cookie with the token
        setAuthCookie(res, token);
        
        // Return user data without sensitive information
        const userData = {
            _id: newUser._id,
            fullname: newUser.fullname,
            email: newUser.email,
            phoneNumber: newUser.phoneNumber,
            // Role field removed
            isEmailVerified: newUser.isEmailVerified
        };
        
        return res.status(201).json({
            message: "Account created successfully.",
            user: userData,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Update Profile
export const updateProfile = async (req, res) => {
    try {
        
        const { 
            fullname, 
            email, 
            phoneNumber, 
            skills,
            education,
            experience,
            certifications,
            location,
            about
        } = req.body;
        
        console.log("Education:", education);

        const file = req.file;
        let cloudResponse;
        if (file) {
            console.log('\n📝 ======== FILE UPLOAD ========');
            console.log('📝 Processing file upload:', file.originalname);
            try {
                const fileUri = getDataUri(file);
                cloudResponse = await cloudinary.uploader.upload(fileUri.content);
                console.log('📝 File uploaded to Cloudinary:', cloudResponse.secure_url);
            } catch (fileError) {
                console.error('❌ File upload error:', fileError);
                return res.status(500).json({
                    success: false,
                    message: 'Error uploading file',
                    error: fileError.message
                });
            }
        }

        const userId = req.user._id;
        console.log('\n📝 ======== USER UPDATE ========');
        console.log('📝 Updating user ID:', userId);
        
        let user = await User.findById(userId);
        if (!user) {
            console.error('❌ User not found:', userId);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prepare update data with $set operator
        const updateData = { $set: {} };
        
        // Update basic info if provided
        if (fullname) updateData.$set.fullname = fullname;
        if (email) updateData.$set.email = email;
        if (phoneNumber) updateData.$set.phoneNumber = phoneNumber;
        if (location) updateData.$set.location = location;
        
        // Handle about section
        if (about && typeof about === 'object') {
            console.log('📝 Processing about section data:', JSON.stringify(about, null, 2));
            // Save about data under profile.about to match the schema
            updateData.$set['profile.about'] = {
                ...(user.profile?.about || {}), // Preserve existing about data
                ...about // Add/update with new about data
            };
            
            // Also update individual fields at the root level for backward compatibility
            if (about.bio) updateData.$set.about = about.bio;
            if (about.headline) updateData.$set.headline = about.headline;
            if (about.location) updateData.$set.location = about.location;
        }

        // Handle arrays - Update using $set with dot notation
        if (skills) {
            updateData.$set['profile.skills'] = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
        }
        if (education) {
            // Ensure we're not including any _id that could cause casting issues
            const cleanEducation = education.map(edu => {
                const { _id, ...eduWithoutId } = edu;
                return eduWithoutId;
            });
            updateData.$set['profile.education'] = cleanEducation;
        }
        if (experience) updateData.$set['profile.experience'] = experience;
        if (certifications) updateData.$set['profile.certifications'] = certifications;

        // Handle profile photo if uploaded
        if (cloudResponse?.secure_url) {
            updateData.$set['profile.profilePhoto'] = cloudResponse.secure_url;
        }

        console.log('\n📝 ======== FINAL UPDATE DATA ========');
        console.log('📝 Update data to be saved:', JSON.stringify(updateData, null, 2));

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

      

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('\n❌ ======== UPDATE PROFILE ERROR ========');
        console.error('❌ Error:', error);
        console.error('❌ Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code,
            keyPattern: error.keyPattern,
            keyValue: error.keyValue
        });
        
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message,
            ...(process.env.NODE_ENV === 'development' && {
                stack: error.stack,
                name: error.name,
                code: error.code
            })
        });
    }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                message: "Email is required",
                success: false
            });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found with this email",
                success: false
            });
        }
        
        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        user.resetPasswordOTP = otp;
        user.resetPasswordExpiry = otpExpiry;
        await user.save();
        
        // Send OTP via email (configure your email service)
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}. This OTP will expire in 10 minutes.`
        };
        
        await transporter.sendMail(mailOptions);
        
        return res.status(200).json({
            message: "OTP sent to your email",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Verify OTP for forgot password
export const verifyOtpforgotpassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                message: "Email, OTP and new password are required",
                success: false
            });
        }
        
        const user = await User.findOne({ 
            email,
            resetPasswordOTP: otp,
            resetPasswordExpiry: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired OTP",
                success: false
            });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();
        
        return res.status(200).json({
            message: "Password reset successfully",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Change Password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.id;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current password and new password are required",
                success: false
            });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                message: "Current password is incorrect",
                success: false
            });
        }
        
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();
        
        return res.status(200).json({
            message: "Password changed successfully",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Send OTP for phone verification
export const sendOtpForPhoneVerification = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        const userId = req.id;
        
        if (!phoneNumber) {
            return res.status(400).json({
                message: "Phone number is required",
                success: false
            });
        }
        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        
        user.phoneVerificationOTP = otp;
        user.phoneVerificationExpiry = otpExpiry;
        await user.save();
        
        // In a real application, you would send SMS here
        // For now, we'll just return the OTP (remove this in production)
        return res.status(200).json({
            message: "OTP sent successfully",
            otp: otp, // Remove this in production
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Update phone number
export const updatePhoneNumber = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;
        const userId = req.id;
        
        if (!phoneNumber || !otp) {
            return res.status(400).json({
                message: "Phone number and OTP are required",
                success: false
            });
        }
        
        const user = await User.findOne({
            _id: userId,
            phoneVerificationOTP: otp,
            phoneVerificationExpiry: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired OTP",
                success: false
            });
        }
        
        user.phoneNumber = phoneNumber;
        user.phoneVerificationOTP = undefined;
        user.phoneVerificationExpiry = undefined;
        await user.save();
        
        return res.status(200).json({
            message: "Phone number updated successfully",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Toggle Follow
export const toggleFollow = async (req, res) => {
    try {
        const followerId = req.id;
        const followingId = req.params.id;
        
        if (followerId === followingId) {
            return res.status(400).json({
                message: "You cannot follow yourself",
                success: false
            });
        }
        
        const follower = await User.findById(followerId);
        const following = await User.findById(followingId);
        
        if (!follower || !following) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        
        const isFollowing = follower.following.some(id => id.equals(followingId));
        
        if (isFollowing) {
            // Unfollow
            follower.following.pull(followingId);
            following.followers.pull(followerId);
        } else {
            // Follow
            follower.following.push(followingId);
            following.followers.push(followerId);
        }
        
        await follower.save();
        await following.save();
        
        return res.status(200).json({
            message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Get Notifications
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user?._id || req.id; // Handle both req.user (from auth middleware) and req.id
        
        if (!userId) {
            return res.status(401).json({
                message: "Authentication required",
                success: false
            });
        }

        const user = await User.findById(userId)
            .select('notifications')
            .populate({
                path: 'notifications.from',
                select: 'fullname profile.profilePhoto username',
                model: 'User'
            })
            .sort({ 'notifications.date': -1 }); // Sort by most recent first
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        
        // Format the notifications for the response
        const formattedNotifications = (user.notifications || []).map(notification => ({
            _id: notification._id,
            from: notification.from ? {
                _id: notification.from._id,
                fullname: notification.from.fullname,
                username: notification.from.username,
                profilePhoto: notification.from.profile?.profilePhoto
            } : null,
            message: notification.message,
            type: notification.type,
            link: notification.link,
            date: notification.date,
            read: notification.read,
            metadata: notification.metadata ? Object.fromEntries(notification.metadata) : {}
        }));
        
        return res.status(200).json({
            notifications: formattedNotifications,
            success: true,
            count: formattedNotifications.length,
            unreadCount: formattedNotifications.filter(n => !n.read).length
        });
        
    } catch (error) {
        console.error('Error in getNotifications:', error);
        return res.status(500).json({
            message: error.message || "Failed to fetch notifications",
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.id;
        
        await User.findByIdAndUpdate(userId, {
            $set: { "notifications.$[].read": true }
        });
        
        return res.status(200).json({
            message: "All notifications marked as read",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Search Users
export const searchUsers = async (req, res) => {
    try {
        const { username } = req.params;
        
        console.log('🔍 Searching for users with query:', username);
        
        const users = await User.find({
            $or: [
                { username: { $regex: username, $options: 'i' } },
                { fullname: { $regex: username, $options: 'i' } },
                { email: { $regex: username, $options: 'i' } }
            ]
        }).select('-password');
        
        console.log('🔍 Found users:', users);
        
        return res.status(200).json({
            users,
            success: true
        });
    } catch (error) {
        console.error('🔴 Search error:', error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        
        const user = await User.findOne({
            $or: [
                { fullname: username },
                { email: username }
            ]
        }).select('-password');
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        
        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Get All Users
export const getAllUsers = async (req, res) => {
    try {
        // Exclude the current user from the list of all users
        const loggedInUserId = req.user._id;
        const users = await User.find({ _id: { $ne: loggedInUserId } }).select('-password');
        
        return res.status(200).json({
            users,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Get My Profile
export const getMyProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log('\n=== GET MY PROFILE DEBUG ===');
        console.log('Fetching profile for user ID:', userId);
        
        const user = await User.findById(userId)
            .select('-password')
            .populate('following', 'profile.fullname username profile.profilePhoto')
            .populate('followers', 'profile.fullname username profile.profilePhoto')
            .lean();

        if (!user) {
            console.log('User not found');
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        // Log the user data before any modifications
        console.log('\n=== USER DATA BEFORE NORMALIZATION ===');
        console.log('Has profile:', !!user.profile);
        console.log('Profile keys:', user.profile ? Object.keys(user.profile) : 'No profile');
        console.log('Has about:', user.profile?.about ? 'Yes' : 'No');
        console.log('About data:', user.profile?.about || 'No about data');
        console.log('Legacy about field:', user.about || 'Not present');
        console.log('Legacy headline:', user.headline || 'Not present');
        console.log('Legacy location:', user.location || 'Not present');
        console.log('Legacy website:', user.website || 'Not present');

        // Ensure profile.about exists
        if (!user.profile) {
            user.profile = {};
        }
        if (!user.profile.about) {
            user.profile.about = {
                bio: user.about || '',
                headline: user.headline || '',
                location: user.location || '',
                website: user.website || ''
            };
            console.log('\nCreated profile.about from legacy fields');
        }

        // Log the final user data that will be sent
        console.log('\n=== FINAL USER DATA BEING SENT ===');
        console.log('profile.about:', JSON.stringify(user.profile.about, null, 2));
        console.log('===================================\n');
        
        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.error('Error in getMyProfile:', error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Get GitHub Client ID
export const getGitHubClientId = async (req, res) => {
    try {
        return res.status(200).json({
            clientId: process.env.GITHUB_CLIENT_ID,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Handle GitHub Callback
export const handleGitHubCallback = async (req, res) => {
    try {
        const { code } = req.query;
        
        if (!code) {
            return res.status(400).json({
                message: "Authorization code is required",
                success: false
            });
        }
        
        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code: code
            })
        });
        
        const tokenData = await tokenResponse.json();
        
        if (!tokenData.access_token) {
            return res.status(400).json({
                message: "Failed to get access token",
                success: false
            });
        }
        
        // Get user data from GitHub
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${tokenData.access_token}`
            }
        });
        
        const githubUser = await userResponse.json();
        
        // Check if user exists or create new user
        let user = await User.findOne({ email: githubUser.email });
        
        if (!user) {
            user = await User.create({
                fullname: githubUser.name || githubUser.login,
                email: githubUser.email,
                profile: {
                    profilePhoto: githubUser.avatar_url,
                    bio: githubUser.bio
                },
                password: crypto.randomBytes(32).toString('hex') // Random password for GitHub users
            });
        }
        
        const tokenData2 = {
            userId: user._id
        };
        const token = await jwt.sign(tokenData2, process.env.SECRET_KEY, { expiresIn: '1d' });
        
        const cookieOptions = {
            maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true in production for HTTPS
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/'
        };
        
        return res.status(200)
            .cookie("token", token, cookieOptions)
            .json({
            message: `Welcome ${user.fullname}`,
            user,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};