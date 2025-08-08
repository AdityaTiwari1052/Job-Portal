import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import apiClient from "@/utils/apiClient";
import { setUser } from "@/redux/authSlice";

// UI Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Icons
import { 
  User2, 
  Edit, 
  Briefcase, 
  MapPin, 
  Mail, 
  Calendar, 
  Link as LinkIcon, 
  Users, 
  Building,
  Image as ImageIcon
} from 'lucide-react';

// Constants


// 👤 Profile View
const ProfileView = ({ user, isOwnProfile, handleEditClick }) => (
  <>
    <p><strong>Role:</strong> {user.role}</p>
    <p><strong>Bio:</strong> {user.profile?.bio || "No bio available."}</p>

    <h2 className="text-lg font-semibold mt-4">Skills</h2>
    <div className="flex gap-2 flex-wrap mt-1">
      {user.profile?.skills?.length > 0 ? (
        user.profile.skills.map((skill, index) => (
          <Badge key={index} variant="secondary">{skill}</Badge>
        ))
      ) : (
        <p>No skills added.</p>
      )}
    </div>

    {user.role !== "recruiter" && (
      <>
        <h2 className="text-lg font-semibold mt-4">Resume</h2>
        {user.profile?.resume ? (
          <a href={user.profile.resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            View Resume
          </a>
        ) : (
          <p>No resume uploaded.</p>
        )}
      </>
    )}

    {isOwnProfile && (
      <Button
        onClick={handleEditClick}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 block mx-auto"
      >
        Edit Profile
      </Button>
    )}
  </>
);

// 🧠 Main Component
const Profile = ({ refreshPosts }) => {
  const { username: urlUsername } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { user: reduxUser } = useSelector((store) => store.auth);
  
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    console.log('Profile Debug:', {
      urlUsername,
      reduxUser: {
        _id: reduxUser?._id,
        username: reduxUser?.username,
        fullname: reduxUser?.fullname
      },
      profileUser: {
        _id: profileUser?._id,
        username: profileUser?.username,
        fullname: profileUser?.fullname
      },
      loading,
      error: !profileUser && !loading
    });
  }, [urlUsername, reduxUser, profileUser, loading]);

  const isEditRoute = location.pathname.endsWith("/edit");
  
  // Check if the current user is following the profile user
  const isFollowing = useMemo(() => {
    if (!reduxUser || !profileUser) return false;
    return profileUser.followers?.some(follower => 
      (typeof follower === 'object' ? follower._id : follower) === reduxUser._id
    );
  }, [reduxUser, profileUser]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setLoadingPosts(true);
        
        // If no username in URL and we have a logged-in user, show their profile
        if (!urlUsername && reduxUser) {
          try {
            // Get current user's profile
            const currentUserRes = await apiClient.get("/api/v1/user/me");
            
            if (currentUserRes.data?.user) {
              setProfileUser(currentUserRes.data.user);
              
              // Fetch current user's posts
              const postsRes = await apiClient.get("/api/v1/user/posts/me");
              setUserPosts(postsRes.data.posts || []);
              return;
            }
          } catch (currentUserError) {
            console.error("Error fetching current user:", currentUserError);
            // Fall back to using reduxUser if available
            if (reduxUser) {
              setProfileUser(reduxUser);
              return;
            }
          }
        }

        // If we have a username in URL, try to fetch that user's profile
        if (urlUsername) {
          // First try to search for the user
          try {
            const searchRes = await apiClient.get(`/api/v1/user/profile/${urlUsername}`);
            
            if (searchRes.data?.users?.length > 0) {
              const foundUser = searchRes.data.users[0];
              setProfileUser(foundUser);
              
              // Fetch user's posts
              try {
                const postsRes = await apiClient.get(`/api/v1/posts/user/${foundUser._id}`);
                setUserPosts(postsRes.data.posts || []);
              } catch (postsError) {
                console.error("Error fetching user posts:", postsError);
                setUserPosts([]);
              }
              return;
            }
          } catch (searchError) {
            console.error("Error searching for user:", searchError);
          }
        }
        
        // If we get here, we couldn't find the user
        setProfileUser(null);
        setUserPosts([]);
        
      } catch (error) {
        console.error("Error in fetchUserData:", error);
        setProfileUser(null);
        setUserPosts([]);
      } finally {
        setLoading(false);
        setLoadingPosts(false);
      }
    };

    fetchUserData();
  }, [urlUsername, reduxUser]);

  const handleFollowToggle = async () => {
    if (!profileUser || !reduxUser) return;

    const originalProfileUser = profileUser;
    const originalReduxUser = reduxUser;

    // Optimistically update UI
    try {
      // 1. Update local profile user state
      setProfileUser(prevUser => {
        if (!prevUser) return null;
        const alreadyFollowing = prevUser.followers.some(f => (typeof f === 'object' ? f._id : f) === reduxUser._id);
        const newFollowers = alreadyFollowing
          ? prevUser.followers.filter(f => (typeof f === 'object' ? f._id : f) !== reduxUser._id)
          : [...prevUser.followers, { _id: reduxUser._id }]; // Add placeholder
        return { ...prevUser, followers: newFollowers };
      });

      // 2. Update global redux user state
      const isFollowingInRedux = reduxUser.following.some(id => id === profileUser._id);
      const newFollowing = isFollowingInRedux
        ? reduxUser.following.filter(id => id !== profileUser._id)
        : [...reduxUser.following, profileUser._id];
      dispatch(setUser({ ...reduxUser, following: newFollowing }));

      // 3. Make API call
      await apiClient.post(`/api/v1/user/${profileUser._id}/follow`);

    } catch (error) {
      console.error("Failed to toggle follow:", error);
      // Rollback on error
      setProfileUser(originalProfileUser);
      dispatch(setUser(originalReduxUser));
      alert(error.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  const handleEditClick = () => {
    navigate(`/profile/${profileUser.username}/edit`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!profileUser) {
    return (
      <div className="text-center mt-10 p-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">User not found</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          The user you're looking for doesn't exist or you don't have permission to view this profile.
        </p>
        <Button 
          onClick={() => navigate('/home')} 
          className="mt-4"
          variant="outline"
        >
          Return Home
        </Button>
      </div>
    );
  }

  // Determine if this is the current user's profile or a searched profile
  const isOwnProfile = reduxUser?._id === profileUser?._id;

  return (
    <div className={`${!isOwnProfile ? 'w-full' : 'max-w-3xl mx-auto mt-10 p-6'}`}>
      <Card className={!isOwnProfile ? 'min-h-screen rounded-none border-x-0' : ''}>
        <CardHeader className="flex flex-row items-center justify-between gap-4 bg-gray-100 p-4 rounded-t-lg">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profileUser.profile?.profilePhoto} alt="Profile" />
              <AvatarFallback>{profileUser.fullname?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl font-bold text-blue-600">{profileUser.fullname}</CardTitle>
              <p className="text-gray-600">@{profileUser.username}</p>
            </div>
          </div>
          {!isOwnProfile && (
            <Button 
              onClick={handleFollowToggle} 
              size="sm"
              variant={isFollowing ? 'outline' : 'default'}
              className={isFollowing ? 'text-gray-600' : ''}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6">
          {isEditRoute ? (
            <Outlet context={{ user: profileUser, isOwnProfile, handleEditClick }} />
          ) : (
            <ProfileView user={profileUser} isOwnProfile={isOwnProfile} handleEditClick={handleEditClick} />
          )}
        </CardContent>
      </Card>

      {/* Photo Gallery */}
      {!isEditRoute && userPosts.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Photos</h2>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-2">
              {userPosts
                .filter(post => post.imageUrl)
                .map((post, index) => (
                  <div key={post._id || index} className="aspect-square overflow-hidden rounded-md">
                    <img
                      src={post.imageUrl}
                      alt={`Post ${index + 1}`}
                      className="h-full w-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
                      onClick={() => {
                        // You can implement a lightbox or modal here
                        window.open(post.imageUrl, '_blank');
                      }}
                    />
                  </div>
                ))}
            </div>
            {userPosts.filter(post => post.imageUrl).length === 0 && (
              <p className="text-center text-gray-500 py-4">No photos to display</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;
