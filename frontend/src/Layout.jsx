import React, { useState, useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import Navbar from "./components/shared/Navbar";
import Sidebar from "./components/Sidebar";
import EditProfile from "./components/EditProfile";
import News from "./components/News";
import { useSelector } from "react-redux";
import { Button } from "./components/ui/button";
import { X, Globe, User, Users, BookOpen } from "lucide-react";
import { Avatar, AvatarImage } from "./components/ui/avatar";

const Layout = () => {
  const { user } = useSelector((store) => store.auth);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  
  // State to store the latest profile data
  const [profileData, setProfileData] = useState(() => {
    const initialData = {
      ...(user?.profile || {}),
      fullname: user?.fullname,
      // Ensure we have all required fields with defaults
      headline: user?.profile?.headline || user?.headline || '',
      about: user?.profile?.about || '',
      location: user?.profile?.location || '',
      profilePhoto: user?.profile?.profilePhoto || ''
    };
    console.log('Initial profile data in Layout:', initialData);
    return initialData;
  });

  // Update profile data when user data changes
  useEffect(() => {
    console.log('User data changed in Layout:', user);
    if (user) {
      const newProfileData = {
        ...profileData, // Keep existing data
        ...user.profile,
        fullname: user.fullname || profileData.fullname,
        headline: user.profile?.headline || user.headline || profileData.headline,
        about: user.profile?.about || profileData.about,
        location: user.profile?.location || profileData.location,
        profilePhoto: user.profile?.profilePhoto || profileData.profilePhoto
      };
      console.log('Updating profile data in Layout:', newProfileData);
      setProfileData(newProfileData);
    }
  }, [user]);
  const location = useLocation();
  const isProfilePage = location.pathname.startsWith("/profile/");
  const isOwnProfile = location.pathname === "/profile/me" || 
                     (user && location.pathname === `/profile/${user.username}`);
  const showSidebar = user && (!isProfilePage || isOwnProfile) && !showEditProfile && !showProfileSidebar;
  const showNews = !showEditProfile && !showProfileSidebar; // Hide news when editing or showing profile

  // Handle profile click from Navbar
  const handleProfileClick = () => {
    if (showProfileSidebar) {
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
    setShowEditProfile(false);
    setShowProfileSidebar(false);
  };

  // Toggle edit profile
  const toggleEditProfile = () => {
    setShowEditProfile(!showEditProfile);
  };

  // Mock data for suggestions
  const suggestions = [
    { id: 1, name: "John Doe", title: "Software Engineer at Tech Corp", mutual: 3 },
    { id: 2, name: "Jane Smith", title: "Product Manager at Design Co", mutual: 5 },
    { id: 3, name: "Alex Johnson", title: "UX Designer at Creative Inc", mutual: 2 },
  ];

  const profileSettings = [
    { icon: <User className="h-4 w-4" />, label: "Profile language", value: "English" },
    { 
      icon: <Globe className="h-4 w-4" />, 
      label: "Public profile & URL", 
      value: (
        <a 
          href={`https://www.linkedin.com/in/${user?.username || 'user'}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          www.linkedin.com/in/{user?.username || 'user'}
        </a>
      ) 
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f2ee]">
      <header className="fixed top-0 left-0 right-0 z-50">
        <Navbar onProfileClick={handleProfileClick} />
      </header>

      <main className="flex-grow pt-20">
        <div className="flex flex-1 pt-2">
          {/* Regular Sidebar */}
          <div className={`${showSidebar ? 'w-72' : 'w-0'} transition-all duration-300 hidden md:block md:ml-4`}>
            {showSidebar && (
              <Sidebar 
                onEditClick={() => setShowEditProfile(true)}
                profile={profileData}
              />
            )}
          </div>

          {/* Profile Sidebar (visible on mobile and desktop) */}
          <div 
            className={`${showProfileSidebar ? 'fixed inset-0 z-50 bg-black bg-opacity-50' : 'hidden'}`}
            onClick={() => setShowProfileSidebar(false)}
          >
            <div 
              className={`fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ${
                showProfileSidebar ? 'translate-x-0' : '-translate-x-full'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end p-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 md:hidden"
                  onClick={() => setShowProfileSidebar(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="h-[calc(100%-2rem)]">
                <Sidebar 
                  onEditClick={() => {
                    setShowEditProfile(true);
                    setShowProfileSidebar(false);
                  }}
                  profile={profileData}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={`flex-1 ${showEditProfile ? 'max-w-4xl mx-auto' : ''} w-full`}>
            <div className="h-full flex flex-col">
              <div className={`${showEditProfile ? 'bg-white dark:bg-gray-800 rounded-lg shadow-md p-6' : ''} flex-1`}>
                {showEditProfile ? (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h1 className="text-2xl font-bold">Edit Profile</h1>
                      <Button variant="ghost" size="icon" onClick={closeEditProfile}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <EditProfile 
                      onClose={closeEditProfile} 
                      user={user} 
                      onProfileUpdate={(updatedProfile) => {
                        console.log('=== PROFILE UPDATE RECEIVED IN LAYOUT ===');
                        console.log('Updated profile data from EditProfile:', updatedProfile);
                        console.log('Current profile data in Layout:', profileData);
                        
                        // Update the local profile data when EditProfile updates it
                        const newProfileData = {
                          ...profileData, // Keep existing data
                          ...updatedProfile,
                          // Only update if the value is defined
                          fullname: updatedProfile.fullname !== undefined ? updatedProfile.fullname : profileData.fullname,
                          headline: updatedProfile.headline !== undefined ? updatedProfile.headline : profileData.headline,
                          location: updatedProfile.location !== undefined ? updatedProfile.location : profileData.location,
                          about: updatedProfile.about !== undefined ? updatedProfile.about : profileData.about,
                          pronouns: updatedProfile.pronouns !== undefined ? updatedProfile.pronouns : profileData.pronouns,
                          profilePhoto: updatedProfile.profilePhoto !== undefined ? updatedProfile.profilePhoto : profileData.profilePhoto
                        };
                        
                        console.log('New profile data after update:', newProfileData);
                        setProfileData(newProfileData);
                      }} 
                    />
                  </>
                ) : (
                  <Outlet />
                )}
              </div>
            </div>
          </div>

          {/* News Section - Hidden when editing profile or showing profile sidebar */}
          {showNews && !isProfilePage && (
            <aside className="w-80 shrink-0 hidden lg:block">
              <News />
            </aside>
          )}
        </div>
      </main>
    </div>
  );
};

export default Layout;
