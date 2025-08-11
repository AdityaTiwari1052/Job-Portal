import React, { useMemo, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent } from "@/components/ui/card";
import ProfileHeader from './ProfileHeader';
import AboutSection from './sections/AboutSection';
import ExperienceSection from './sections/ExperienceSection';
import EducationSection from './sections/EducationSection';
import SkillsSection from './sections/SkillsSection';
import CertificationsSection from './sections/CertificationsSection';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { updateUserProfile } from '@/redux/profileSlice';
import apiClient from '@/utils/apiClient';

// Simple loading placeholder component
const LoadingPlaceholder = ({ height = 'h-24' }) => (
  <div className={`w-full ${height} bg-gray-100 animate-pulse rounded-md`}></div>
);

const CleanEditProfile = ({ user: propUser, loading, error, onSave, onCancel, isReadOnly, isEditing }) => {
  // Get user from Redux if not passed as prop
  const reduxUser = useSelector((state) => state.auth.user);
  const user = propUser || reduxUser;

  // Log user data when component mounts or updates
  useEffect(() => {
    console.log('=== CLEAN EDIT PROFILE DEBUG ===');
    console.log('User prop received:', JSON.stringify({
      hasUser: !!user,
      userId: user?._id,
      hasProfile: !!user?.profile,
      profileKeys: user?.profile ? Object.keys(user.profile) : 'No profile',
      hasAbout: !!user?.profile?.about,
      aboutData: user?.profile?.about || 'No about data'
    }, null, 2));
  }, [user]);

  // Log Redux user data
  useEffect(() => {
    console.log('Redux user data:', JSON.stringify({
      hasReduxUser: !!reduxUser,
      reduxUserId: reduxUser?._id,
      reduxUserProfile: reduxUser?.profile ? {
        hasProfile: true,
        hasAbout: !!reduxUser.profile.about,
        aboutKeys: reduxUser.profile.about ? Object.keys(reduxUser.profile.about) : 'No about'
      } : 'No profile in Redux user'
    }, null, 2));
  }, [reduxUser]);

  // Log the incoming props
  console.log('=== CLEAN EDIT PROFILE DEBUG ===');
  console.log('User prop:', user);
  console.log('Loading:', loading);
  console.log('Is ReadOnly:', isReadOnly);
  console.log('Is Editing:', isEditing);

  // Show loading state only if there's no user data yet
  if (loading && !user) {
    console.log('Showing loading state');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading profile...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    console.error('Error loading profile:', error);
    return (
      <div className="p-4 text-red-500">
        Error loading profile: {error}
      </div>
    );
  }

  // If no user data is available
  if (!user) {
    console.error('No user data available');
    return (
      <div className="p-4 text-red-500">
        No profile data available. Please try again later.
      </div>
    );
  }

  // Log the full user object structure
  console.log('User object structure:', {
    hasProfile: !!user.profile,
    profileKeys: user.profile ? Object.keys(user.profile) : 'No profile',
    userKeys: Object.keys(user)
  });

  const dispatch = useDispatch();
  const { toast } = useToast();

  // Handle saving section data
  const handleSaveSection = async (section, data) => {
    try {
      // Create the update object with the section data
      const updateData = {
        [section]: data
      };

      // Call the API to update the user's profile
      const response = await apiClient.post('/user/profile/update', updateData);
      
      // Update the local state with the new data
      const updatedUser = {
        ...user,
        profile: {
          ...user.profile,
          [section]: data
        }
      };
      
      // Update the Redux store
      dispatch(updateUserProfile(updatedUser));
      
      // Show success message using the correct toast method
      toast.success("Your profile has been updated successfully.", {
        description: `${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully.`
      });
      
      return true;
    } catch (error) {
      console.error(`Error updating ${section}:`, error);
      
      // Show error message using the correct toast method
      toast.error(error.response?.data?.message || `Failed to update ${section}. Please try again.`);
      
      return false;
    }
  };

  // Normalize user data to ensure consistent structure
  const normalizedUser = useMemo(() => {
    if (!user) return null;
    
    console.log('=== NORMALIZING USER DATA ===');
    console.log('Original user data:', user);
    
    // Create a deep copy to avoid mutating the original
    const normalized = JSON.parse(JSON.stringify(user));
    
    // Ensure profile exists
    normalized.profile = normalized.profile || {};
    
    // Handle about data - check multiple possible locations
    if (!normalized.profile.about) {
      if (normalized.about) {
        // If about is at root level, move it to profile.about
        console.log('Moving root level about to profile.about');
        normalized.profile.about = normalized.about;
      } else {
        // Initialize empty about object if it doesn't exist
        normalized.profile.about = {
          bio: '',
          headline: '',
          location: '',
          website: ''
        };
      }
    } else if (typeof normalized.profile.about === 'string') {
      // If about is a string, convert it to an object
      console.log('Converting string about to object');
      normalized.profile.about = {
        bio: normalized.profile.about,
        headline: normalized.profile.headline || '',
        location: normalized.profile.location || '',
        website: normalized.profile.website || ''
      };
    }
    
    // Ensure skills is an array
    if (!Array.isArray(normalized.profile.skills)) {
      normalized.profile.skills = [];
    }
    
    console.log('Normalized user data:', normalized);
    return normalized;
  }, [user]);

  // Check if we have minimal profile data
  const hasMinimalProfile = normalizedUser && normalizedUser._id && normalizedUser.fullname;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content - Left side (wider) */}
          <div className="w-full lg:w-3/4">
            <ProfileHeader 
              user={normalizedUser} 
              loading={loading}
              onCancel={onCancel}
              isReadOnly={isReadOnly}
              isEditing={isEditing}
            />
            
            <div className="mt-6 space-y-6">
              {loading ? (
                // Show loading placeholders when profile is still loading
                <>
                  <LoadingPlaceholder height="h-48" />
                  <LoadingPlaceholder height="h-64" />
                  <LoadingPlaceholder height="h-48" />
                </>
              ) : hasMinimalProfile ? (
                // Show actual content when we have minimal profile data
                <>
                  <AboutSection 
                    user={normalizedUser} 
                    onSave={handleSaveSection}
                    isReadOnly={isReadOnly}
                    isCurrentUser={!isReadOnly}
                  />
                  <ExperienceSection 
                    user={normalizedUser} 
                    onSave={handleSaveSection}
                    isReadOnly={isReadOnly}
                  />
                  <EducationSection 
                    user={normalizedUser} 
                    onSave={handleSaveSection}
                    isReadOnly={isReadOnly}
                  />
                  <SkillsSection 
                    user={normalizedUser} 
                    onSave={handleSaveSection}
                    isReadOnly={isReadOnly}
                    showAddButton={!isReadOnly}
                  />
                  <CertificationsSection 
                    user={normalizedUser} 
                    onSave={handleSaveSection}
                    isReadOnly={isReadOnly}
                  />
                </>
              ) : (
                // Show message if profile data is incomplete
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-600">Profile data is incomplete. Please check back later.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          {/* Sidebar - Right side (narrower) */}
          <div className="w-full lg:w-1/4 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-4">Profile Completion</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: loading ? '0%' : '75%' }}
                  ></div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {loading ? 'Loading...' : 'Complete your profile to increase visibility'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

CleanEditProfile.defaultProps = {
  isReadOnly: false,
  isEditing: false,
  onSave: () => {},
  onCancel: () => {}
};

export default CleanEditProfile;
