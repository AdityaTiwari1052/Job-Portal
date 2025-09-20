import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Mail, User, Eye, EyeOff, Upload, CheckCircle, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../utils/api';
import { RECRUITER_API_END_POINT } from '../../utils/constant';
import { createPortal } from 'react-dom';

const RecruiterAuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    companyLogo: null,
    logoPreview: '',
    logoFileName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Debug effect to log props changes
  useEffect(() => {
    console.log('Modal props updated:', { isOpen, onClose: typeof onClose });
  }, [isOpen, onClose]);

  const handleClose = useCallback((e) => {
    console.log('🔴 Close button clicked - handleClose called');
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('🔴 Calling onClose, typeof onClose:', typeof onClose);
    if (typeof onClose === 'function') {
      console.log('🔴 onClose is a function, calling it now');
      onClose();
      console.log('🔴 onClose called successfully');
    } else {
      console.error('🔴 onClose is not a function:', onClose);
    }
  }, [onClose]);

  // Handle escape key press
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        console.log('Escape key pressed');
        handleClose(e);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (!isOpen) return;

    // Clean up any leftover temporary data from previous sessions
    localStorage.removeItem('tempRecruiterToken');
    localStorage.removeItem('tempRecruiterData');
    localStorage.removeItem('pendingVerificationEmail');

    // Clear any cached authorization headers from previous sessions
    delete api.defaults.headers.common['Authorization'];

    // Reset form data
    setFormData({
      companyName: '',
      email: '',
      password: '',
      companyLogo: null,
      logoPreview: '',
      logoFileName: ''
    });
    setCurrentStep(1);
    setShowPassword(false);
    setOtp('');
    setOtpError('');
    setIsForgotPassword(false);
    setResetEmail('');
    setResetEmailSent(false);

    // Check API health when modal opens
    checkApiHealth();
  }, [isOpen]);

  // Separate effect for when login/signup mode changes
  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(1);
    setOtp('');
    setOtpError('');
  }, [isLogin]);

  useEffect(() => {
    if (isOpen && closeBtnRef.current) {
      closeBtnRef.current.focus();
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          companyLogo: file,
          logoPreview: reader.result,
          logoFileName: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const email = formData.email.trim();
    const password = formData.password;
    const companyName = formData.companyName?.trim();

    // Email validation
    if (!email) {
      // toast.error('📧 Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      // toast.error('📧 Please enter a valid email address');
      return false;
    }

    // Password validation
    if (!password) {
      // toast.error('🔒 Password is required');
      return false;
    }
    if (password.length < 6) {
      // toast.error('🔒 Password must be at least 6 characters');
      return false;
    }

    // Company name validation (only for signup)
    if (!isLogin && !companyName) {
      // toast.error('🏢 Company name is required for registration');
      return false;
    }

    return true;
  };

  const checkApiHealth = async () => {
    try {
      console.log('🏥 Checking API health...');
      const response = await api.get('/health');
      console.log('✅ API health check successful:', response.data);
      setApiAvailable(true);
      return true;
    } catch (error) {
      console.error('❌ API health check failed:', error.message);
      setApiAvailable(false);
      return false;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log('🔐 Attempting recruiter login with:', { email: formData.email.trim() });

      const response = await api.post(`${RECRUITER_API_END_POINT}/login`, {
        email: formData.email.trim(),
        password: formData.password
      });

      console.log('📥 Login response received:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      // Check for successful response
      if (response.data?.status === 'success' && response.data.token) {
        const { token, data } = response.data;
        const recruiterData = data?.recruiter || {};

        console.log('✅ Login successful! Storing authentication data...');

        // Store authentication data
        localStorage.setItem('recruiterToken', token);
        localStorage.setItem('recruiterData', JSON.stringify(recruiterData));

        // Set authorization header for future requests (clear any existing first)
        delete api.defaults.headers.common['Authorization'];
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        toast.success('Login successful!');

        // Close modal and trigger success callback
        onClose();
        if (onSuccess) {
          onSuccess();
        }

        // Navigate to dashboard with slight delay to ensure modal closes
        setTimeout(() => {
          console.log('🚀 Navigating to dashboard...');
          navigate('/dashboard/manage', { replace: true });
        }, 300);

      } else {
        console.error('❌ Invalid response format:', response.data);
        throw new Error(response.data?.message || 'Login failed - invalid response format');
      }

    } catch (error) {
      console.error('❌ Login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });

      let errorMessage = 'Login failed. Please try again.';

      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your internet connection.';
        setApiAvailable(false);
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
        setApiAvailable(false);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (!error.response) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
        setApiAvailable(false);
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log('📝 Attempting recruiter registration with:', {
        companyName: formData.companyName.trim(),
        email: formData.email.trim(),
        hasLogo: !!formData.companyLogo
      });

      const formDataToSend = new FormData();
      formDataToSend.append('companyName', formData.companyName.trim());
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('password', formData.password);

      if (formData.companyLogo) {
        formDataToSend.append('logo', formData.companyLogo);
        console.log('📎 Company logo attached to registration');
      }

      const response = await api.post(`${RECRUITER_API_END_POINT}/signup`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('📥 Registration response received:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      // Check for successful response
      if (response.data?.status === 'success') {
        console.log('✅ Registration successful! Moving to OTP verification...');

        // Store email for OTP verification
        localStorage.setItem('pendingVerificationEmail', formData.email);

        // Store authentication data temporarily if available (will be confirmed after OTP)
        if (response.data.token) {
          const { token, data } = response.data;
          const recruiterData = data?.recruiter || {};
          localStorage.setItem('tempRecruiterToken', token);
          localStorage.setItem('tempRecruiterData', JSON.stringify(recruiterData));
        }

        // Set loading to false first, then show toast
        setIsLoading(false);

        // Show success message and move to OTP step
        setTimeout(() => {
          toast.success(response.data.message || 'Account created successfully! Please verify your email.');
          console.log('✅ Account created, moving to OTP verification step');
        }, 100);

        // Move to OTP verification step
        setCurrentStep(3);
        setOtp(''); // Clear any previous OTP
        setOtpError(''); // Clear any previous errors

      } else {
        console.error('❌ Invalid response format:', response.data);
        throw new Error(response.data?.message || 'Registration failed - invalid response format');
      }

    } catch (error) {
      console.error('❌ Registration error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });

      // Clean up any temporary data on error
      localStorage.removeItem('tempRecruiterToken');
      localStorage.removeItem('tempRecruiterData');
      localStorage.removeItem('pendingVerificationEmail');

      // Check if this is actually a successful response with email issue
      if (error.response?.status === 201 && error.response?.data?.status === 'success') {
        console.log('✅ Account created but email verification failed - moving to OTP anyway');

        // Store email for OTP verification
        localStorage.setItem('pendingVerificationEmail', formData.email);

        // Set loading to false first, then show toast
        setIsLoading(false);

        // Show success message and move to OTP step
        setTimeout(() => {
          toast.success(error.response.data.message || 'Account created successfully! Please verify your email.');
          console.log('✅ Account created, moving to OTP verification step');
        }, 100);

        // Move to OTP verification step
        setCurrentStep(3);
        setOtp(''); // Clear any previous OTP
        setOtpError(''); // Clear any previous errors
        return;
      }

      let errorMessage = 'Registration failed. Please try again.';

      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your internet connection.';
        setApiAvailable(false);
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid data provided. Please check your information.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
        setApiAvailable(false);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (!error.response) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
        setApiAvailable(false);
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      await handleLogin(e);
    } else {
      if (currentStep === 1) {
        nextStep();
      } else if (currentStep === 2) {
        await handleRegister(e);
      } else if (currentStep === 3) {
        await handleOtpVerification(e);
      }
    }
  };

  const nextStep = () => {
    if (isLogin || validateForm()) {
      setCurrentStep(2);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setOtpError('Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      setOtpError('OTP must be 6 digits');
      return;
    }

    setIsLoading(true);
    setOtpError('');

    try {
      console.log('🔍 Verifying OTP for email:', formData.email);

      const response = await api.post(`${RECRUITER_API_END_POINT}/verify-otp`, {
        email: formData.email.trim(),
        otp: otp.trim()
      });

      console.log('📥 OTP verification response:', response.data);

      if (response.data?.status === 'success') {
        console.log('✅ OTP verified successfully');

        // Get the stored temporary authentication data
        const tempToken = localStorage.getItem('tempRecruiterToken');
        const tempRecruiterData = localStorage.getItem('tempRecruiterData');

        if (tempToken && tempRecruiterData) {
          // Finalize authentication with stored data
          localStorage.setItem('recruiterToken', tempToken);
          localStorage.setItem('recruiterData', tempRecruiterData);
          delete api.defaults.headers.common['Authorization'];
          api.defaults.headers.common['Authorization'] = `Bearer ${tempToken}`;
        } else if (response.data.token) {
          // Use token from OTP response if no temp data
          const { token, data } = response.data;
          const recruiterData = data?.recruiter || {};
          localStorage.setItem('recruiterToken', token);
          localStorage.setItem('recruiterData', JSON.stringify(recruiterData));
          delete api.defaults.headers.common['Authorization'];
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        // Clean up temporary data
        localStorage.removeItem('tempRecruiterToken');
        localStorage.removeItem('tempRecruiterData');
        localStorage.removeItem('pendingVerificationEmail');

        toast.success('Email verified successfully! Welcome to Job Portal!');

        // Close modal and navigate to dashboard
        onClose();
        if (onSuccess) {
          onSuccess();
        }

        setTimeout(() => {
          navigate('/dashboard/manage', { replace: true });
        }, 300);

      } else {
        console.error('❌ OTP verification failed:', response.data);
        setOtpError(response.data?.message || 'Invalid OTP');
      }

    } catch (error) {
      console.error('❌ OTP verification error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to verify OTP';
      setOtpError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!resetEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Sending password reset email to:', resetEmail);

      const response = await api.post(`${RECRUITER_API_END_POINT}/forgot-password`, {
        email: resetEmail.trim()
      });

      console.log('📥 Forgot password response:', response.data);

      if (response.data?.status === 'success') {
        setResetEmailSent(true);
        toast.success('Password reset link sent to your email!');
      } else {
        toast.error(response.data?.message || 'Failed to send reset email');
      }

    } catch (error) {
      console.error('❌ Forgot password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    console.log('Overlay clicked');
    if (e.target === e.currentTarget) {
      console.log('Calling onClose from overlay');
      handleClose(e);
    }
  };

  if (!isOpen) return null;

  console.log('Rendering RecruiterAuthModal, isOpen:', isOpen);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      ref={modalRef}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div 
        className="relative bg-white rounded-lg w-full max-w-sm h-[490px] overflow-hidden z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {isForgotPassword ? 'Forgot Password' : isLogin ? 'Recruiter Login' : 'Create Recruiter Account'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 -mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        {!isForgotPassword && (
          <div className="p-4 pt-1">
            <div className="text-center mb-3">
              <h1 className="text-xl font-bold text-gray-900">
                {isLogin ? 'Sign in to Job Portal' : 'Create Recruiter Account'}
              </h1>
              <p className="text-gray-600 mt-0.5">
                {isLogin ? 'Access your recruiter dashboard' : 'Join our platform to post jobs'}
              </p>
            </div>

          {!isLogin && currentStep === 3 ? (
            <form onSubmit={handleOtpVerification}>
              <div className="space-y-3">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Verify Your Email</h3>
                  <p className="text-gray-600 mb-4">
                    We've sent a verification code to <strong>{formData.email}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter 6-digit OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(value);
                      if (otpError) setOtpError('');
                    }}
                    placeholder="000000"
                    className={`w-full px-4 py-3 text-center text-2xl font-mono border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${otpError ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                    maxLength={6}
                  />
                  {otpError && (
                    <p className="mt-1 text-sm text-red-600">{otpError}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    OTP expires in 10 minutes
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="submit"
                  disabled={isLoading || !apiAvailable}
                  className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                    isLoading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : !apiAvailable
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  } transition-colors duration-200`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      ✅ Verifying OTP...
                    </>
                  ) : !apiAvailable ? (
                    '❌ Server Unavailable'
                  ) : (
                    '✅ Verify OTP'
                  )}
                </button>

                {!apiAvailable && (
                  <p className="mt-2 text-xs text-red-600 text-center">
                    ⚠️ Unable to connect to server. Please check your connection and try again.
                  </p>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <div className="space-y-3">
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          placeholder="Enter company name"
                          className="pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        className="pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        tabIndex="-1"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        Password must be at least 6 characters
                      </p>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setResetEmail('');
                            setResetEmailSent(false);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none"
                          disabled={isLoading}
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Logo (Optional)
                    </label>
                    <div className="mt-1 flex items-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        {formData.logoPreview ? (
                          <img
                            src={formData.logoPreview}
                            alt="Company Logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Upload className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                          disabled={isLoading}
                        >
                          {formData.logoPreview ? 'Change' : 'Upload'}
                        </button>
                        {formData.logoPreview && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                companyLogo: null,
                                logoPreview: '',
                                logoFileName: ''
                              }));
                            }}
                            className="ml-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none"
                            disabled={isLoading}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Recommended size: 200x200px, Max size: 2MB
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isLoading || !apiAvailable}
                  className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                    isLoading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : !apiAvailable
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  } transition-colors duration-200`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isLogin ? 'Logging in...' : currentStep === 1 ? '⏭️ Continue' : '📝 Creating Account...'}
                    </>
                  ) : !apiAvailable ? (
                    '❌ Server Unavailable'
                  ) : isLogin ? (
                    'Login'
                  ) : currentStep === 1 ? (
                    '⏭️ Continue'
                  ) : (
                    '📝 Create Account'
                  )}
                </button>

                {!apiAvailable && (
                  <p className="mt-2 text-xs text-red-600 text-center">
                    ⚠️ Unable to connect to server. Please check your connection and try again.
                  </p>
                )}
              </div>
            </form>
          )}
          </div>
        )}

        {/* Forgot Password Form */}
        {isForgotPassword && (
          <div className="p-4 pt-1">
            <div className="text-center mb-3">
              <h1 className="text-xl font-bold text-gray-900">
                Reset Your Password
              </h1>
              <p className="text-gray-600 mt-0.5">
                Enter your email address and we'll send you a reset link
              </p>
            </div>

            {!resetEmailSent ? (
              <form onSubmit={handleForgotPassword}>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isLoading || !apiAvailable}
                    className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                      isLoading
                        ? 'bg-blue-400 cursor-not-allowed'
                        : !apiAvailable
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    } transition-colors duration-200`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Reset Link...
                      </>
                    ) : !apiAvailable ? (
                      '❌ Server Unavailable'
                    ) : (
                      'Continue'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Your Email</h3>
                <p className="text-gray-600 mb-4">
                  We've sent a password reset link to <strong>{resetEmail}</strong>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  The link will expire in 10 minutes. Check your spam folder if you don't see it.
                </p>
                <p className="text-sm text-gray-600">
                  Click the link in your email to reset your password.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t text-center">
          {isForgotPassword ? (
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setResetEmail('');
                setResetEmailSent(false);
              }}
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
            >
              ← Back to Login
            </button>
          ) : (
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  if (isLoading) return;
                  setIsLogin(!isLogin);
                  setCurrentStep(1);
                  setOtp('');
                  setOtpError('');
                }}
                className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                disabled={isLoading}
              >
                {isLogin ? 'Sign up' : 'Login'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterAuthModal;
