import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Briefcase, Bookmark, Star, MapPin } from "lucide-react";

const MobileSidebar = ({ onClose, onEditClick, onLogout, profile }) => {
  const loggedInUser = useSelector((state) => state.auth.user);
  
  // Debug: Log the received props
  useEffect(() => {
    console.log('=== MOBILE SIDEBAR RENDERED ===');
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
    // First priority: Direct profile prop
    if (profile?.headline) return profile.headline;
    
    // Second priority: User's profile data
    if (loggedInUser?.profile?.headline) return loggedInUser.profile.headline;
    
    // Third priority: Direct user headline
    if (loggedInUser?.headline) return loggedInUser.headline;
    
    // Fourth priority: About section as fallback
    if (profile?.about) {
      return profile.about.length > 100 
        ? profile.about.substring(0, 100) + '...' 
        : profile.about;
    }
    
    // Final fallback
    return 'Update your profile to add a headline';
  };

  // Calculate height to be viewport height minus navbar height (4rem = 64px)
  const sidebarHeight = 'calc(100vh - 4rem)';

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Backdrop with smooth transition */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-[9998]"
        onClick={onClose}
      />
      
      {/* Sidebar with slide-in animation */}
      <div 
        className="fixed right-0 w-4/5 max-w-sm bg-white dark:bg-gray-900 shadow-xl overflow-y-auto transform transition-transform duration-300 ease-in-out z-[9999]"
        style={{ 
          top: '4rem', // Position below navbar (h-16 = 4rem)
          height: sidebarHeight,
          maxHeight: sidebarHeight
        }}
      >
        <div className="w-full">
          {/* Main Card */}
          <Card className="overflow-visible border-0 rounded-none shadow-none">
            {/* Cover Photo */}
            <div className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 relative">
              <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors duration-200" />
            </div>
            
            {/* Profile Section */}
            <div className="px-4 pb-4 -mt-10 relative">
              <div className="flex justify-center">
                <div className="relative group">
                  <Avatar 
                    className="h-20 w-20 border-4 border-white shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200"
                    onClick={() => {
                      onEditClick();
                      onClose();
                    }}
                  >
                    <AvatarImage 
                      src={displayProfile.profilePhoto || loggedInUser?.profile?.profilePhoto} 
                      alt={displayProfile.fullname || loggedInUser?.fullname || 'User'}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      {getInitials(displayProfile.fullname || loggedInUser?.fullname || '')}
                    </AvatarFallback>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Pencil className="h-5 w-5 text-white" />
                    </div>
                  </Avatar>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {displayProfile.fullname || loggedInUser?.fullname || 'Your Name'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 min-h-[20px]">
                  {getDisplayHeadline()}
                </p>
                
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{displayProfile.location || loggedInUser?.profile?.location || 'Add location'}</span>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-4 w-full border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 flex items-center justify-center gap-2 transition-colors duration-200"
                  onClick={() => {
                    onEditClick();
                    onClose();
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Profile
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>Connections</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">0</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Grow your network</p>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Access exclusive tools & insights</p>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                <span>Try Premium for free</span>
              </div>
            </div>
          </Card>

          {/* My Items Section */}
          <Card className="m-4 p-4 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-200">My Items</h3>
              <Bookmark className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
              <Briefcase className="h-4 w-4 flex-shrink-0" />
              <span>My Jobs</span>
            </div>
          </Card>

          {/* Settings and Logout Section */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-2">
            <Link 
              to="/settings" 
              className="flex items-center gap-2 p-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
              onClick={onClose}
            >
              <Pencil className="h-4 w-4" />
              <span>Settings</span>
            </Link>
            
            <button
              onClick={onLogout}
              className="flex items-center gap-2 p-2 rounded-md text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" x2="9" y1="12" y2="12"></line>
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;
