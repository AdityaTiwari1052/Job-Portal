import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import ProfileHeader from './ProfileHeader';
import AboutSection from './sections/AboutSection';
import ExperienceSection from './sections/ExperienceSection';
import EducationSection from './sections/EducationSection';
import SkillsSection from './sections/SkillsSection';
import CertificationsSection from './sections/CertificationsSection';

// Simple loading placeholder component
const LoadingPlaceholder = ({ height = 'h-24' }) => (
  <div className={`w-full ${height} bg-gray-100 animate-pulse rounded-md`}></div>
);

const CleanEditProfile = ({ user, loading, error, onSave, onCancel }) => {
  // Show loading state only if there's no user data yet
  if (loading && !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading profile...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading profile: {error}
      </div>
    );
  }

  // If no user data is available
  if (!user) {
    return (
      <div className="p-4 text-red-500">
        No profile data available. Please try again later.
      </div>
    );
  }

  // Check if we have minimal profile data
  const hasMinimalProfile = user && user._id && user.fullname;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content - Left side (wider) */}
          <div className="w-full lg:w-3/4">
            <ProfileHeader 
              user={user} 
              loading={loading}
              onCancel={onCancel}
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
                  <AboutSection user={user} onSave={onSave} />
                  <ExperienceSection user={user} onSave={onSave} />
                  <EducationSection user={user} onSave={onSave} />
                  <SkillsSection user={user} onSave={onSave} />
                  <CertificationsSection user={user} onSave={onSave} />
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

export default CleanEditProfile;
