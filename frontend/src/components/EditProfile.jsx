import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import CleanEditProfile from './CleanEditProfile';
import { useMediaQuery } from '../hooks/use-media-query';

const EditProfile = ({ onClose, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useParams();
  const dispatch = useDispatch();
  const { user: reduxUser } = useSelector((store) => store.auth);
  const [userData, setUserData] = useState(null);
  
  // Get user data from location state if available
  useEffect(() => {
    console.log('Location state:', location.state);
    console.log('Redux user:', reduxUser);
    
    if (location.state?.userData) {
      console.log('Using user data from location state');
      setUserData(location.state.userData);
    } else if (reduxUser) {
      console.log('Using user data from Redux');
      setUserData(reduxUser);
    } else {
      console.error('No user data available in location state or Redux');
    }
  }, [location.state, reduxUser]);

  // Log when userData changes
  useEffect(() => {
    console.log('userData updated:', userData);
    if (userData) {
      console.log('Profile data structure:', {
        hasProfile: !!userData.profile,
        aboutType: typeof userData.about,
        profileAboutType: userData.profile ? typeof userData.profile.about : 'no profile',
        fullData: userData
      });
    }
  }, [userData]);

  const handleClose = () => {
    if (isMobile) {
      // On mobile, navigate back to the profile page
      navigate(`/profile/${username || reduxUser?.username || 'me'}`);
    } else if (onClose) {
      // On desktop, use the provided onClose handler
      onClose();
    } else {
      // Fallback: go back in history
      navigate(-1);
    }
  };

  // Show loading state if we don't have user data yet
  if (!userData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="mr-2"
              >
                <X className="h-5 w-5" />
              </Button>
              <h2 className="text-xl font-semibold">Edit Profile</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg">
          <CleanEditProfile 
            user={userData} 
            loading={!userData}
            onCancel={handleClose}
            isReadOnly={false}
            isEditing={true}
            onSave={(updatedData) => {
              console.log('Profile updated:', updatedData);
              // Handle successful save if needed
              handleClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
