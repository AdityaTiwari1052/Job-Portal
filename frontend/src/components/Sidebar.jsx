import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Briefcase, Bookmark, Star, MapPin } from "lucide-react";

const Sidebar = ({ onEditClick, profile }) => {
  const loggedInUser = useSelector((state) => state.auth.user);
  
  // Debug: Log the received props
  useEffect(() => {
    console.log('=== SIDEBAR RENDERED ===');
    console.log('Profile prop:', profile);
    console.log('Logged in user:', loggedInUser);
  }, [profile, loggedInUser]);
  
  // Use profile from props if available, otherwise use loggedInUser.profile
  const displayProfile = profile || loggedInUser?.profile || {};

  if (!loggedInUser) return null;

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Get the display headline with fallbacks
  const getDisplayHeadline = () => {
    // Debug log
    console.log('=== GETTING HEADLINE ===');
    console.log('Profile:', profile);
    console.log('User profile:', loggedInUser?.profile);
    
    // First priority: Direct profile prop
    if (profile?.headline) {
      console.log('Using profile headline:', profile.headline);
      return profile.headline;
    }
    
    // Second priority: User's profile data
    if (loggedInUser?.profile?.headline) {
      console.log('Using user profile headline:', loggedInUser.profile.headline);
      return loggedInUser.profile.headline;
    }
    
    // Third priority: Direct user headline
    if (loggedInUser?.headline) {
      console.log('Using user headline:', loggedInUser.headline);
      return loggedInUser.headline;
    }
    
    // Fourth priority: About section as fallback
    if (profile?.about) {
      const aboutSnippet = profile.about.length > 100 
        ? profile.about.substring(0, 100) + '...' 
        : profile.about;
      console.log('Using about section as headline:', aboutSnippet);
      return aboutSnippet;
    }
    
    // Final fallback
    console.log('No headline found, using default');
    return 'Update your profile to add a headline';
  };

  return (
    <div className="w-full sticky top-4">
      <Card className="overflow-visible border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* Cover Photo */}
        <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600 relative">
          <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors duration-200" />
        </div>
        
        {/* Profile Section */}
        <div className="px-6 pb-4 -mt-12 relative">
          <div className="flex justify-center">
            <div className="relative group">
              <Avatar 
                className="h-24 w-24 border-4 border-white shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200"
                onClick={onEditClick}
              >
                <AvatarImage 
                  src={displayProfile.profilePhoto || loggedInUser?.profile?.profilePhoto} 
                  alt={displayProfile.fullname || loggedInUser?.fullname || 'User'}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  {getInitials(displayProfile.fullname || loggedInUser?.fullname || '')}
                </AvatarFallback>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Pencil className="h-5 w-5 text-white" />
                </div>
              </Avatar>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <h2 className="text-xl font-bold text-gray-900">
              {displayProfile.fullname || loggedInUser?.fullname || 'Your Name'}
            </h2>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2 min-h-[20px]">
              {getDisplayHeadline()}
            </p>
            
            <div className="mt-2 text-sm text-gray-500 flex items-center justify-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{displayProfile.location || loggedInUser?.profile?.location || 'Add location'}</span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              className="mt-4 w-full border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-center gap-2 transition-colors duration-200"
              onClick={onEditClick}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="border-t border-gray-100 px-4 py-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Connections</span>
            <span className="font-medium text-blue-600">0</span>
          </div>
          <p className="text-xs text-gray-500">Grow your network</p>
        </div>

        <div className="border-t border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-2">Access exclusive tools & insights</p>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
            <span>Try Premium for free</span>
          </div>
        </div>
      </Card>

      {/* Additional Sections */}
      <Card className="mt-4 p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-700">My Items</h3>
          <Bookmark className="h-4 w-4 text-gray-500 flex-shrink-0" />
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-600 cursor-pointer hover:underline">
          <Briefcase className="h-4 w-4 flex-shrink-0" />
          <span>My Jobs</span>
        </div>
      </Card>
    </div>
  );
};

export default Sidebar;
