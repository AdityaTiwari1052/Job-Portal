import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Briefcase, FileText as FileTextIcon, Plus, LogOut, User, ChevronDown, Users } from 'lucide-react';
import PostJob from './admin/PostJob';
import ManageJob from './ManageJob';
import ApplicantsTable from './admin/ApplicantsTable';
import { toast } from 'sonner';

import RecruiterAuthModal from './auth/RecruiterAuthModal';

// Custom hook to check recruiter auth
const useRecruiterAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recruiter, setRecruiter] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('recruiterToken');
        const savedRecruiter = localStorage.getItem('recruiterData');
        
        if (!token || !savedRecruiter) {
          throw new Error('No authentication data found');
        }

        try {
          // Try to verify the token with the backend
          const response = await fetch('http://localhost:8000/api/v1/recruiter/me', {
            method: 'GET',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
          
          const responseData = await response.json();
          
          if (response.ok && responseData.status === 'success' && responseData.data) {
            // Update the stored recruiter data
            const recruiterData = responseData.data.recruiter || JSON.parse(savedRecruiter);
            localStorage.setItem('recruiterData', JSON.stringify(recruiterData));
            setRecruiter(recruiterData);
            setIsAuthenticated(true);
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          localStorage.removeItem('recruiterToken');
          localStorage.removeItem('recruiterData');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, isLoading, recruiter, showAuthModal, setShowAuthModal };
};

const Dashboard = () => {
  const { isAuthenticated, isLoading, recruiter, showAuthModal, setShowAuthModal } = useRecruiterAuth();
  const [activeTab, setActiveTab] = useState('manage');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('recruiterToken');
    localStorage.removeItem('recruiterData');
    navigate('/');
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <h1 className="text-2xl font-bold mb-4">Recruiter Dashboard</h1>
        <p className="mb-6 text-gray-600">Please sign in to access the recruiter dashboard</p>
        <Button onClick={() => setShowAuthModal(true)}>
          Sign In
        </Button>
        <RecruiterAuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={() => {
            setShowAuthModal(false);
            window.location.reload();
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
                {recruiter?.name || 'Recruiter'}
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
              onClick={() => setActiveTab('manage')}
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
              onClick={() => setActiveTab('applicants')}
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
              onClick={() => setActiveTab('post')}
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
          {activeTab === 'post' && <PostJob onSuccess={() => setActiveTab('manage')} />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
