import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, Building2, User } from 'lucide-react';
import api from '../../utils/api';

const RecruiterLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const { email, password, companyName } = formData;

    if (!email.trim()) {
      toast.error('Email is required');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (!password) {
      toast.error('Password is required');
      return false;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }

    if (!isLogin && !companyName.trim()) {
      toast.error('Company name is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/recruiter/auth/login' : '/recruiter/auth/signup';
      const payload = isLogin
        ? { email: formData.email.trim(), password: formData.password }
        : {
            companyName: formData.companyName.trim(),
            email: formData.email.trim(),
            password: formData.password
          };

      console.log(`Attempting ${isLogin ? 'login' : 'signup'} with:`, payload);

      const response = await api.post(endpoint, payload);

      console.log('Response received:', response.data);

      if (response.data.status === 'success' && response.data.token) {
        // Store authentication data
        localStorage.setItem('recruiterToken', response.data.token);
        localStorage.setItem('recruiterData', JSON.stringify(response.data.data.recruiter));

        // Set authorization header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        toast.success(`${isLogin ? 'Login' : 'Registration'} successful!`);

        // Navigate to dashboard (will automatically redirect to /dashboard/manage)
        navigate('/dashboard');
      } else {
        throw new Error(response.data.message || 'Authentication failed');
      }

    } catch (error) {
      console.error('Authentication error:', error);

      let errorMessage = 'Something went wrong. Please try again.';

      if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'Invalid input data';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.status === 409) {
        errorMessage = 'Email already exists';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your connection.';
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Building2 className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLogin ? 'Sign in to your account' : 'Create your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? 'Welcome back!' : 'Join our platform as a recruiter'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required={!isLogin}
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your company name"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 6 characters
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                  isLoading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                } transition-colors duration-200`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  isLogin ? 'Sign in' : 'Create account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  if (!isLoading) {
                    setIsLogin(!isLogin);
                    setFormData({
                      companyName: '',
                      email: '',
                      password: ''
                    });
                  }
                }}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                disabled={isLoading}
              >
                {isLogin ? 'Create new account' : 'Sign in to existing account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterLogin;