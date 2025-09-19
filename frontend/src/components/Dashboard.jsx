import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Button } from './ui/button';
import { Briefcase, FileText as FileTextIcon, Plus, LogOut, User, ChevronDown, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import { RECRUITER_API_END_POINT } from '../utils/constant';
import Navbar from './shared/Navbar';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [recruiter, setRecruiter] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('manage');
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      if (authChecked) {
        console.log('Dashboard: Auth already checked, skipping...');
        return;
      }

      console.log('Dashboard: Starting auth check...', { pathname: location.pathname });
      const token = localStorage.getItem('recruiterToken');
      const savedRecruiter = localStorage.getItem('recruiterData');

      console.log('Dashboard: Token exists:', !!token, 'Recruiter data exists:', !!savedRecruiter);

      // Since RecruiterRoute already handles authentication, we don't need to redirect here
      // Just log the issue and continue with available data
      if (!token || !savedRecruiter) {
        console.log('Dashboard: No token or recruiter data found, but RecruiterRoute should have caught this');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Setting auth header and verifying token...');
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Only verify token if we don't have valid recruiter data
        try {
          const recruiterData = JSON.parse(savedRecruiter);
          if (recruiterData && recruiterData.email) {
            console.log('Using cached recruiter data');
            if (isMounted) {
              setRecruiter(recruiterData);
              // Only navigate if we're exactly at /dashboard (not /dashboard/manage)
              if (location.pathname === '/dashboard') {
                console.log('Dashboard: Navigating from /dashboard to /dashboard/manage');
                navigate('manage', { replace: true });
              }
              return;
            }
          }
        } catch (e) {
          console.warn('Error parsing saved recruiter data:', e);
        }

        // If we get here, we need to verify the token
        console.log('Dashboard: Verifying token with server...');
        console.log('Dashboard: API headers:', api.defaults.headers.common);

        const response = await api.get(`${RECRUITER_API_END_POINT}/me`);
        console.log('Dashboard: API response:', response);

        if (response.data?.status === 'success' && response.data.data) {
          console.log('Dashboard: Token verified, updating recruiter data');
          const recruiterData = response.data.data.recruiter;
          localStorage.setItem('recruiterData', JSON.stringify(recruiterData));

          if (isMounted) {
            setRecruiter(recruiterData);

            // Only navigate if we're exactly at /dashboard (not /dashboard/manage)
            if (location.pathname === '/dashboard') {
              console.log('Dashboard: Navigating from /dashboard to /dashboard/manage (after API verification)');
              navigate('manage', { replace: true });
            }
          }
        } else {
          console.error('Dashboard: Invalid response format:', response);
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Dashboard: Auth verification failed:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config
        });
        
        if (isMounted) {
          // Only logout on 401 Unauthorized
          if (error.response?.status === 401) {
            console.log('Dashboard: Token invalid, but RecruiterRoute should handle this');
          } else {
            // For other errors, try to use cached data
            try {
              const recruiterData = JSON.parse(savedRecruiter);
              if (recruiterData && recruiterData.email) {
                console.log('Dashboard: Using cached recruiter data after error');
                setRecruiter(recruiterData);
              } else {
                throw new Error('No valid cached data');
              }
            } catch (e) {
              console.error('Dashboard: Error using cached data:', e);
            }
          }
        }
      } finally {
        if (isMounted) {
          console.log('Dashboard: Auth check completed');
          setAuthChecked(true);
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate]); // Removed location.pathname to prevent infinite loops

  useEffect(() => {
    // Set active tab based on URL
    const tabFromUrl = location.pathname.split('/').pop();
    if (['manage', 'applicants', 'post'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [location]);

  const handleTabChange = (tab) => {
    console.log('Dashboard: handleTabChange called with tab:', tab);
    setActiveTab(tab);
    navigate(tab);
  };

  const handleLogout = () => {
    console.log('Dashboard: handleLogout called - clearing auth data');
    // Clear all auth-related data
    localStorage.removeItem('recruiterToken');
    localStorage.removeItem('recruiterData');

    // Clear the auth header
    delete api.defaults.headers.common['Authorization'];

    // Redirect to home with login modal
    console.log('Dashboard: Navigating to home with login modal');
    navigate('/', {
      replace: true,
      state: { showRecruiterLogin: true }
    });

    // Show logout message
    toast.success('Successfully logged out');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  try {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
            <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              {/* Logo/Brand */}
              <div className="flex-shrink-0 flex items-center px-4 mb-8">
                <h1 className="text-xl font-bold text-primary-600">Recruiter Portal</h1>
              </div>

              {/* Navigation */}
              <nav className="mt-5 flex-1 px-2 space-y-1">
                <button
                  onClick={() => handleTabChange('manage')}
                  className={`${
                    activeTab === 'manage'
                      ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-4 py-3 text-sm font-medium w-full text-left rounded-md`}
                >
                  <Briefcase className="mr-3 h-5 w-5 flex-shrink-0" />
                  Manage Jobs
                </button>

                <button
                  onClick={() => handleTabChange('applicants')}
                  className={`${
                    activeTab === 'applicants'
                      ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-4 py-3 text-sm font-medium w-full text-left rounded-md`}
                >
                  <Users className="mr-3 h-5 w-5 flex-shrink-0" />
                  Applicants
                </button>

                <button
                  onClick={() => handleTabChange('post')}
                  className={`${
                    activeTab === 'post'
                      ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-4 py-3 text-sm font-medium w-full text-left rounded-md`}
                >
                  <Plus className="mr-3 h-5 w-5 flex-shrink-0" />
                  Post New Job
                </button>
              </nav>
            </div>

            {/* Profile Section */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {recruiter?.companyName || 'Account'}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile header */}
          <header className="md:hidden bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Tabs */}
            <div className="border-b border-gray-200 px-4">
              <nav className="flex space-x-8 overflow-x-auto">
                <button
                  onClick={() => handleTabChange('manage')}
                  className={`${
                    activeTab === 'manage'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <Briefcase className="inline-block h-5 w-5 mr-2" />
                  Manage
                </button>
                <button
                  onClick={() => handleTabChange('applicants')}
                  className={`${
                    activeTab === 'applicants'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <Users className="inline-block h-5 w-5 mr-2" />
                  Applicants
                </button>
                <button
                  onClick={() => handleTabChange('post')}
                  className={`${
                    activeTab === 'post'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  <Plus className="inline-block h-5 w-5 mr-2" />
                  New Job
                </button>
              </nav>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="bg-white shadow rounded-lg p-6">
                  <Outlet />
                </div>
              </div>
            </div>
          </main>
        </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Dashboard: Render error:', error);
    // Fallback UI to prevent crash
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">Please try refreshing the page</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

export default Dashboard;
