import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import CleanEditProfile from './CleanEditProfile';
import { fetchProfile } from '@/redux/profileSlice';

// Debug logging helper
const debugLog = (message, data = '') => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[EditProfile] ${message}`, data);
  }
};

const EditProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const initialFetchDone = useRef(false);
  
  // Get auth and profile state from Redux
  const { user: authUser, isAuthenticated, loading: authLoading } = useSelector(state => state.auth);
  const { profile, loading: profileLoading, error: profileError } = useSelector(state => state.profile);
  
  // Use profile data if available, otherwise fall back to auth user
  const user = profile || authUser;
  
  // Only show loading if we don't have any user data yet and we're still loading
  const isLoading = (authLoading || profileLoading) && !user && !initialFetchDone.current;
  
  // Fetch profile data
  const fetchUserProfile = useCallback(async () => {
    if (isAuthenticated && !profile && !profileLoading) {
      try {
        debugLog('Fetching profile data...');
        await dispatch(fetchProfile()).unwrap();
        initialFetchDone.current = true;
        debugLog('Profile fetch completed successfully');
      } catch (error) {
        debugLog('Error fetching profile:', error);
        toast.error(error || 'Failed to load profile data');
      }
    }
  }, [dispatch, isAuthenticated, profile, profileLoading]);

  // Handle authentication and data fetching
  useEffect(() => {
    debugLog('Auth effect running', { isAuthenticated, authLoading });
    
    if (!isAuthenticated && !authLoading) {
      debugLog('User not authenticated, redirecting to login');
      toast.error('Please log in to edit your profile');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    
    // Only fetch if we're authenticated and haven't fetched yet
    if (isAuthenticated && !initialFetchDone.current) {
      fetchUserProfile();
    }
  }, [isAuthenticated, authLoading, navigate, location.pathname, fetchUserProfile]);

  // Handle profile update
  const handleSave = useCallback(async (updatedData) => {
    if (!user) {
      debugLog('Cannot save: No user data available');
      return;
    }
    
    try {
      setIsSaving(true);
      debugLog('Saving profile data:', updatedData);
      
      // Here you would typically call an API to save the data
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Refresh the profile data after successful update
      await dispatch(fetchProfile()).unwrap();
      
      toast.success('Profile updated successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      debugLog('Error updating profile:', { error, errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [dispatch, user]);

  // Show loading state only if we don't have any user data
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="mt-4 text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  // Show error state if there was an error loading the profile
  if (profileError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg max-w-md w-full text-center">
          <h2 className="text-lg font-semibold mb-2">Error Loading Profile</h2>
          <p className="mb-4">{profileError}</p>
          <button
            onClick={fetchUserProfile}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            disabled={profileLoading}
          >
            {profileLoading ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  // Show the profile editor if we have user data
  if (user) {
    debugLog('Rendering CleanEditProfile with user:', user);
    return (
      <div className="w-full">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
        ) : (
          <CleanEditProfile 
            user={user} 
            onSave={handleSave}
            isSaving={isSaving}
          />
        )}
      </div>
    );
  }

  // Fallback in case no conditions above are met
  return null;
};

export default React.memo(EditProfile);
