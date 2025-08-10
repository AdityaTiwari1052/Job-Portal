import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, MapPin, Edit } from 'lucide-react';

// Helper function to get initials from fullname
const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const ProfileHeader = ({ user, loading, onEdit, onCancel }) => {
  const profile = user?.profile || {};
  
  if (loading) {
    return (
      <div className="w-full relative">
        {/* Cover Photo Skeleton */}
        <div className="w-full h-48 bg-gray-200 rounded-t-lg animate-pulse"></div>
        
        {/* Profile Info Skeleton */}
        <div className="w-full px-6 pb-6 relative">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-4 w-full">
            <div className="flex items-end gap-4 w-full">
              <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-300 animate-pulse"></div>
              
              <div className="mb-2 flex-1 space-y-2">
                <div className="h-8 w-64 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-5 w-48 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 w-36 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full relative">
      {/* Cover Photo */}
      <div className="w-full h-48 bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-lg">
        <div className="absolute top-4 right-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-white/90 hover:bg-white"
            onClick={onEdit}
          >
            <Camera className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Profile Photo and Basic Info */}
      <div className="w-full px-6 pb-6 relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-4 w-full">
          <div className="flex items-end gap-4 w-full">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-white bg-gray-100">
                {profile?.profilePhoto ? (
                  <AvatarImage src={profile.profilePhoto} alt={user.fullname} />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-blue-100 text-blue-600 text-4xl font-semibold">
                    {getInitials(user?.fullname || '')}
                  </div>
                )}
              </Avatar>
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute bottom-0 right-0 bg-white hover:bg-gray-100 h-10 w-10 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100"
                onClick={onEdit}
              >
                <Camera className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="mb-2 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {user?.fullname || 'Your Name'}
                </h1>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={onEdit}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-gray-600">
                {profile?.headline || 'Add a professional headline'}
              </p>
              {profile?.location && (
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button 
              variant="outline" 
              className="bg-white hover:bg-gray-50"
              onClick={onEdit}
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
