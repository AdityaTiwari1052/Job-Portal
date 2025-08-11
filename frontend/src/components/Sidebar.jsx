import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Briefcase, Bookmark, Star, MapPin, LogOut } from "lucide-react";
import { useMediaQuery } from '@/hooks/use-media-query';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = ({ onEditClick, profile, isMobileMenuOpen, onMobileMenuClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const loggedInUser = useSelector((state) => state.auth.user);
  
  // Use profile from props if available, otherwise use loggedInUser.profile
  const displayProfile = profile || loggedInUser?.profile || {};

  // Handle edit profile click
  const handleEditProfile = (e) => {
    if (e) e.stopPropagation();
    
    if (isMobile) {
      // Get the username from the logged-in user
      const username = loggedInUser?.username || 'me';
      
      // Navigate directly to the edit profile page with the correct path
      // Using absolute path to avoid any relative path issues
      navigate(`/profile/${username}/edit`, { 
        state: { 
          from: 'sidebar',
          // Include the user data we already have to prevent extra API calls
          userData: loggedInUser 
        } 
      });
      
      // Close mobile menu if it's open
      if (onMobileMenuClose) onMobileMenuClose();
    } else if (onEditClick) {
      // On desktop, use the provided click handler if available
      onEditClick(e);
    }
  };

  // Handle sign out
  const handleSignOut = async (e) => {
    e.stopPropagation();
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!loggedInUser) return null;

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Get the display headline with fallbacks
  const getDisplayHeadline = () => {
    if (displayProfile.headline) return displayProfile.headline;
    if (loggedInUser?.profile?.headline) return loggedInUser.profile.headline;
    if (loggedInUser?.headline) return loggedInUser.headline;
    if (displayProfile.about) {
      return displayProfile.about.length > 100 
        ? displayProfile.about.substring(0, 100) + '...' 
        : displayProfile.about;
    }
    return 'Update your profile to add a headline';
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Cover Photo */}
        <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600 relative">
          <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors duration-200" />
        </div>
        
        {/* Profile Section */}
        <div className="px-6 pb-4 -mt-12 relative flex-1 flex flex-col">
          <div className="flex justify-center">
            <div className="relative group">
              <Avatar 
                className="h-24 w-24 border-4 border-white shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200"
                onClick={handleEditProfile}
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
              onClick={handleEditProfile}
            >
              <Pencil className="h-3.5 w-3.5" />
              {isMobile ? 'Edit Profile' : 'Edit Profile'}
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

      {/* Sign Out Button - Only show on mobile */}
      {isMobile && (
        <Button 
          variant="ghost" 
          className="mt-4 w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      )}
    </div>
  );
};

export default Sidebar;
