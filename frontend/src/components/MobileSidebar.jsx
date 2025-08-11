import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Briefcase, Bookmark, Star, MapPin } from "lucide-react";

const MobileSidebar = ({ onClose, onEditClick, onLogout, profile }) => {
  const loggedInUser = useSelector((state) => state.auth.user);
  const displayProfile = profile || loggedInUser?.profile || {};

  if (!loggedInUser) return null;

  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getDisplayHeadline = () => {
    if (profile?.headline) return profile.headline;
    if (loggedInUser?.profile?.headline) return loggedInUser.profile.headline;
    if (loggedInUser?.headline) return loggedInUser.headline;
    if (profile?.about) {
      return profile.about.length > 100 
        ? profile.about.substring(0, 100) + '...' 
        : profile.about;
    }
    return 'Update your profile to add a headline';
  };

  useEffect(() => {
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    // Hide top nav/search/notification bar
    const topBar = document.querySelector('#top-bar');
    if (topBar) topBar.style.display = 'none';
    
    return () => {
      document.body.style.overflow = 'unset';
      if (topBar) topBar.style.display = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex">
      {/* Overlay */}
      <div 
        className="flex-1 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div 
        className="w-[80%] max-w-sm bg-white dark:bg-gray-900 shadow-xl flex flex-col h-[calc(100vh-7rem)] mt-16 pb-[4rem] translate-x-0 animate-slideIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <Card className="border-0 rounded-none shadow-none">
            {/* Cover Photo */}
            <div className="h-16 bg-gradient-to-r from-blue-500 to-blue-600 relative">
              <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors duration-200" />
            </div>

            {/* Profile Section */}
            <div className="px-3 pb-2 -mt-8 relative">
              <div className="flex justify-center">
                <div className="relative group">
                  <Avatar 
                    className="h-16 w-16 border-4 border-white shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200"
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
                    <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      {getInitials(displayProfile.fullname || loggedInUser?.fullname || '')}
                    </AvatarFallback>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Pencil className="h-4 w-4 text-white" />
                    </div>
                  </Avatar>
                </div>
              </div>

              <div className="text-center mt-2">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  {displayProfile.fullname || loggedInUser?.fullname || 'Your Name'}
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                  {getDisplayHeadline()}
                </p>

                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>{displayProfile.location || loggedInUser?.profile?.location || 'Add location'}</span>
                </div>

                <Link 
                  to={`/profile/id/${loggedInUser?._id}/edit`}
                  className="mt-2 w-full"
                  onClick={onClose}
                >
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full text-xs h-8 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 flex items-center justify-center gap-1 transition-colors duration-200"
                  >
                    <Pencil className="h-3 w-3" />
                    <span>Edit Profile</span>
                  </Button>
                </Link>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Connections</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">0</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Grow your network</p>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Access exclusive tools & insights</p>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <Star className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
                <span className="text-sm">Try Premium for free</span>
              </div>
            </div>
          </Card>

          <Card className="mx-3 my-3 p-3 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">My Items</h3>
              <Bookmark className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
              <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
              <span>My Jobs</span>
            </div>
          </Card>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2">
          <Link 
            to="/settings" 
            className="flex items-center gap-2 p-1.5 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
            onClick={onClose}
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Settings</span>
          </Link>
          
          <button
            onClick={onLogout}
            className="flex items-center gap-2 p-1.5 rounded-md text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" x2="9" y1="12" y2="12"></line>
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MobileSidebar;
