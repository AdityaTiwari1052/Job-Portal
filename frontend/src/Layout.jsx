import React, { useState, useEffect } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import Navbar from "./components/shared/Navbar";
import Sidebar from "./components/Sidebar";
import EditProfile from "./components/EditProfile";
import News from "./components/News";
import { useSelector } from "react-redux";
import { Button } from "./components/ui/button";
import { X, Globe, User, Users, BookOpen } from "lucide-react";
import { Avatar, AvatarImage } from "./components/ui/avatar";
import MobileBottomNav from "./components/MobileBottomNav";
import { useMediaQuery } from "./hooks/use-media-query";

const Layout = () => {
  const { user } = useSelector((store) => store.auth);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const location = useLocation();
  const navigate = useNavigate();
  
  // State to store the latest profile data
  const [profileData, setProfileData] = useState(() => ({
    ...(user?.profile || {}),
    fullname: user?.fullname || '',
    headline: user?.profile?.headline || user?.headline || '',
    about: user?.profile?.about || '',
    location: user?.profile?.location || '',
    profilePhoto: user?.profile?.profilePhoto || ''
  }));

  // Update profile data when user data changes
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        ...user.profile,
        fullname: user.fullname || prev.fullname,
        headline: user.profile?.headline || user.headline || prev.headline,
        about: user.profile?.about || prev.about,
        location: user.profile?.location || prev.location,
        profilePhoto: user.profile?.profilePhoto || prev.profilePhoto
      }));
    }
  }, [user]);

  // Route helpers
  const isProfilePage = location.pathname.startsWith("/profile/");
  const isEditProfilePage = location.pathname === "/edit-profile";
  const isOwnProfile = location.pathname === "/profile/me" || 
                     (user && location.pathname === `/profile/${user.username}`);
  
  // Define routes where sidebars should be hidden
  const hideSidebarRoutes = ['/jobs', '/network', '/messaging', '/notifications'];
  const shouldHideSidebars = hideSidebarRoutes.some(route => 
    location.pathname.startsWith(route)
  );
  
  // Determine what to show
  const showSidebar = user && (!isProfilePage || isOwnProfile) && 
                    !showEditProfile && !showProfileSidebar && 
                    !shouldHideSidebars && !isEditProfilePage;
  
  const showNews = !showEditProfile && !showProfileSidebar && 
                 !shouldHideSidebars && !isEditProfilePage;

  // Close all sidebars and modals
  const closeAll = () => {
    setShowEditProfile(false);
    setShowProfileSidebar(false);
  };

  // Handle profile click from Navbar
  const handleProfileClick = () => {
    if (isMobile) {
      // On mobile, navigate to the profile page
      navigate('/profile/me');
    } else if (showProfileSidebar) {
      // If sidebar is already showing, show edit profile
      setShowEditProfile(true);
      setShowProfileSidebar(false);
    } else {
      // Otherwise, show the profile sidebar
      setShowProfileSidebar(true);
    }
  };

  // Close edit profile
  const closeEditProfile = () => {
    if (isMobile && isEditProfilePage) {
      // On mobile, navigate back
      window.history.back();
    } else {
      // On desktop, just close the modal
      closeAll();
    }
  };

  // Handle profile updates
  const handleProfileUpdate = (updatedProfile) => {
    setProfileData(prev => ({
      ...prev,
      ...updatedProfile,
      fullname: updatedProfile.fullname || prev.fullname,
      headline: updatedProfile.headline || prev.headline,
      about: updatedProfile.about || prev.about,
      location: updatedProfile.location || prev.location,
      profilePhoto: updatedProfile.profilePhoto || prev.profilePhoto
    }));
  };

  // Render the edit profile content
  const renderEditProfile = () => {
    if (isMobile && isEditProfilePage) {
      return <EditProfile onClose={closeEditProfile} isMobile={isMobile} />;
    } else if (showEditProfile && !isMobile) {
      return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <EditProfile 
              onClose={closeEditProfile} 
              isMobile={isMobile}
              onProfileUpdate={handleProfileUpdate}
            />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f2ee] pb-16 md:pb-0">
      <header className="fixed top-0 left-0 right-0 z-50">
        <Navbar onProfileClick={handleProfileClick} />
      </header>

      <div className="flex-1 flex pt-16">
        {/* Regular Sidebar */}
        <div className={`${showSidebar ? 'w-72' : 'w-0'} transition-all duration-300 hidden md:block`}>
          {showSidebar && (
            <Sidebar 
              onEditClick={() => setShowEditProfile(true)}
              profile={profileData}
              isMobileMenuOpen={showProfileSidebar}
              onMobileMenuClose={closeAll}
            />
          )}
        </div>

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto p-4 ${isEditProfilePage ? 'md:px-8' : ''}`}>
          <Outlet context={{ profile: profileData, onProfileUpdate: handleProfileUpdate }} />
        </main>

        {/* News Sidebar */}
        {showNews && (
          <div className="hidden lg:block w-80 p-4">
            <News />
          </div>
        )}

        {/* Edit Profile Modal */}
        {renderEditProfile()}
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav onProfileClick={handleProfileClick} />}
    </div>
  );
};

export default Layout;
