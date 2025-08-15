import React, { useState, useRef, useEffect } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Upload, ArrowLeft, CheckCircle, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../utils/api';

const RecruiterAuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true); 
  const [currentStep, setCurrentStep] = useState(1);
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
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    
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
  }, [isOpen, isLogin]);

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
    if (!formData.email) {
      toast.error('Please enter email');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email');
      return false;
    }
    if (!formData.password) {
      toast.error('Please enter password');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (!isLogin && !formData.companyName) {
      toast.error('Please enter company name');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (isLogin || validateForm()) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLogin) {
      try {
        setIsLoading(true);
        const response = await api.post('/recruiter/login', {
          email: formData.email,
          password: formData.password,
        });

        if (response.data?.status === 'success' && response.data.token) {
          // Store the token and recruiter data
          localStorage.setItem('recruiterToken', response.data.token);
          localStorage.setItem('recruiterData', JSON.stringify(response.data.recruiter));
          
          // Close the modal and show success message
          onClose();
          toast.success('Login successful!');
          
          // Use window.location.href for a full page reload to ensure proper state
          window.location.href = '/dashboard';
        } else {
          throw new Error(response.data?.message || 'Invalid response from server');
        }
      } catch (error) {
        console.error('Login error:', error);
        toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    if (currentStep === 1) {
      if (!validateForm()) return;
      nextStep();
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('companyName', formData.companyName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      
      if (formData.companyLogo) {
        formDataToSend.append('logo', formData.companyLogo);
      }

      const response = await api.post('/signup', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data?.status === 'success' && response.data.token) {
        localStorage.setItem('recruiterToken', response.data.token);
        localStorage.setItem('recruiterData', JSON.stringify(response.data.recruiter));
        
        toast.success('Registration successful!');
        onClose();
        
        // Use the onSuccess callback if provided, otherwise redirect to home
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        throw new Error(response.data?.message || 'Invalid response from server');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg w-full max-w-md overflow-hidden z-10">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isLogin ? 'Recruiter Login' : currentStep === 1 ? 'Create company account' : 'Upload company logo'}
            </h2>
            <p className="text-gray-600">
              {isLogin 
                ? 'Sign in to your recruiter account' 
                : currentStep === 1 
                  ? 'Fill in your company details' 
                  : 'Add your company logo (optional)'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isLogin ? (
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email address"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    'Signing in...'
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </>
                  )}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(false);
                      setCurrentStep(1);
                    }}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                  >
                    Don't have an account? Sign up
                  </button>
                </div>
              </div>
            ) : (
              currentStep === 1 ? (
                <>
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="Company Name"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email address"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Password (min 6 characters)"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    Next
                  </button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(true);
                        setCurrentStep(1);
                      }}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                    >
                      Already have an account? Sign in
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      {formData.logoPreview ? (
                        <div className="relative">
                          <img
                            src={formData.logoPreview}
                            alt="Company logo preview"
                            className="h-32 w-32 rounded-full object-cover border-2 border-gray-200"
                          />
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-full border border-gray-200 text-xs text-gray-600">
                            {formData.logoFileName}
                          </div>
                        </div>
                      ) : (
                        <div className="h-32 w-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <Upload className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {formData.logoPreview ? 'Change logo' : 'Upload logo'}
                    </button>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isLoading ? (
                        'Creating Account...'
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Create Account
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecruiterAuthModal;
