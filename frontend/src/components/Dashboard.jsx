import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Briefcase, FileText as FileTextIcon, Plus, LogOut, User, ChevronDown, Users, Loader2 } from 'lucide-react';
import PostJob from './admin/PostJob';
import ManageJob from './ManageJob';
import ApplicantsTable from './admin/ApplicantsTable';
import { toast } from 'sonner';
import api from '../utils/api';
import RecruiterAuthModal from './auth/RecruiterAuthModal';

// Custom hook to check recruiter auth
const useRecruiterAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recruiter, setRecruiter] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('recruiterToken');
    const savedRecruiter = localStorage.getItem('recruiterData');
    
    if (!token || !savedRecruiter) {
      console.log('No auth data found in localStorage');
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      // Make request to the recruiter/me endpoint with proper headers
      const response = await api.get('/recruiter/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      
      console.log('Auth response:', response.data); // Debug log
      
      if (response.data?.status === 'success' && response.data.data) {
        const recruiterData = response.data.data.recruiter || JSON.parse(savedRecruiter);
        // Update stored recruiter data
        localStorage.setItem('recruiterData', JSON.stringify(recruiterData));
        setRecruiter(recruiterData);
        setIsAuthenticated(true);
        
        if (location.state?.from === '/') {
          navigate('/dashboard', { replace: true, state: {} });
        }
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      // Clear invalid auth data
      localStorage.removeItem('recruiterToken');
      localStorage.removeItem('recruiterData');
      setIsAuthenticated(false);
      
      // Redirect to home if not already on login page
      if (!location.pathname.includes('login')) {
        toast.error('Your session has expired. Please log in again.');
        navigate('/', { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate, location]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { isAuthenticated, isLoading, recruiter, showAuthModal, setShowAuthModal };
};

const Dashboard = () => {
  const { isAuthenticated, isLoading, recruiter, showAuthModal, setShowAuthModal } = useRecruiterAuth();
  const [activeTab, setActiveTab] = useState('manage');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Set initial tab based on URL if provided
  useEffect(() => {
    const tabFromUrl = location.pathname.split('/dashboard/')[1];
    if (tabFromUrl && ['manage', 'applicants', 'post'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Update URL without page reload
    navigate(`/dashboard/${tab}`, { replace: true });
  };

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('recruiterToken');
    localStorage.removeItem('recruiterData');
    
    // Redirect to home with a state to prevent showing login modal immediately
    navigate('/', { 
      state: { from: 'dashboard' },
      replace: true 
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

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <h1 className="text-2xl font-bold mb-4">Recruiter Dashboard</h1>
        <p className="mb-6 text-gray-600">Please sign in to access the recruiter dashboard</p>
        <Button 
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-2"
        >
          <User className="h-4 w-4" />
          Sign In
        </Button>
        <RecruiterAuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={() => {
            setShowAuthModal(false);
            // The auth check will handle the redirect
          }} 
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 flex-col">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 h-16 flex items-center px-6">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="ml-2 text-xl font-semibold">JobPortal</span>
          </div>
          
          <div className="relative">
            <Button 
              variant="ghost" 
              className="flex items-center space-x-2"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <span className="hidden md:inline-block">
                {recruiter?.companyName || 'Recruiter'}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showProfileDropdown ? 'transform rotate-180' : ''}`} />
            </Button>
            
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
          <div className="flex items-center mb-6">
            <Briefcase className="h-6 w-6 text-primary mr-2" />
            <span className="text-lg font-semibold">Dashboard</span>
          </div>
          <nav className="space-y-1 flex-1">
            <button
              onClick={() => handleTabChange('manage')}
              className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                activeTab === 'manage' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileTextIcon className="mr-3 h-5 w-5" />
              Manage Jobs
            </button>
            
            <button
              onClick={() => handleTabChange('applicants')}
              className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                activeTab === 'applicants' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="mr-3 h-5 w-5" />
              Applicants
            </button>
            
            <button
              onClick={() => handleTabChange('post')}
              className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                activeTab === 'post' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Plus className="mr-3 h-5 w-5" />
              Post New Job
            </button>
          </nav>
          
          {/* User profile section */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            <div className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {recruiter?.companyName || 'Recruiter'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {recruiter?.email || ''}
                </p>
              </div>
              <button 
                onClick={handleLogout}
                className="ml-2 p-1 rounded-md hover:bg-gray-100"
                title="Sign out"
              >
                <LogOut className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {activeTab === 'manage' && <ManageJob />}
          {activeTab === 'applicants' && <ApplicantsTable />}
          {activeTab === 'post' && <PostJob onSuccess={() => handleTabChange('manage')} />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
