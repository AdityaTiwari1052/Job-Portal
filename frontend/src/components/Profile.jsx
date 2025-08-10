import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import apiClient from "@/utils/apiClient";
import { setUser } from "@/redux/authSlice";
import toast from 'react-hot-toast';

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

// LinkedIn-style Sidebar Component
const ProfileSidebar = ({ user }) => {
  // Sample data - replace with actual data from props or API
  const profileLanguage = "English";
  const profileUrl = `www.jobportal.com/in/${user?.username || 'user'}`;
  
  const viewersAlsoViewed = [
    { title: "Student at ABES Engineering College", count: 3 },
    { title: "Someone from Greater Delhi Area", count: 3 },
    { title: "Someone at ABES Engineering College", count: 3 }
  ];
  
  const peopleYouMayKnow = [
    {
      name: "Mrinal Sahai",
      title: "SWE Trainee @SalesCode.ai | B.Tech. CSE '26 | ABES Engineering College",
      connect: true
    },
    {
      name: "Alexia Anthony",
      title: "Student at Xavier University of Louisiana",
      connect: true
    },
    {
      name: "Ashish Kanan",
      title: "Intern @ProdigyInfotech | Full Stack Developer | Copywriter",
      connect: true
    }
  ];
  
  const pagesYouMayLike = [
    {
      name: "Google",
      description: "Software Development",
      followers: "38,335,948 followers",
      connections: "11 connections follow this page"
    },
    {
      name: "Accenture in India",
      description: "IT Services and IT Consulting",
      followers: "2,984,084 followers",
      connections: "2 connections follow this page"
    }
  ];

  return (
    <div className="space-y-6 w-80 flex-shrink-0 hidden lg:block">
      {/* Profile Language */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Profile language</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span>{profileLanguage}</span>
            <Button variant="link" className="h-4 p-0 text-blue-600">Edit</Button>
          </div>
        </CardContent>
      </Card>

      {/* Public Profile & URL */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Public profile & URL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-600">{profileUrl}</span>
            <Button variant="link" className="h-4 p-0 text-blue-600">Edit</Button>
          </div>
        </CardContent>
      </Card>

      {/* Viewers Also Viewed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Who your viewers also viewed</CardTitle>
          <span className="text-sm text-gray-500">Private to you</span>
        </CardHeader>
        <CardContent className="space-y-4">
          {viewersAlsoViewed.map((item, index) => (
            <div key={index} className="text-sm">
              <p className="font-medium">{item.title}</p>
              <p className="text-gray-500">{item.count} people</p>
              <Button variant="outline" className="mt-2 w-full">View</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* People You May Know */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">People you may know</CardTitle>
          <span className="text-sm text-gray-500">From your job title</span>
        </CardHeader>
        <CardContent className="space-y-4">
          {peopleYouMayKnow.map((person, index) => (
            <div key={index} className="text-sm">
              <p className="font-medium">{person.name}</p>
              <p className="text-gray-500 line-clamp-2">{person.title}</p>
              <Button variant="outline" className="mt-2 w-full">
                {person.connect ? 'Connect' : 'Follow'}
              </Button>
            </div>
          ))}
          <Button variant="ghost" className="w-full text-blue-600">Show all</Button>
        </CardContent>
      </Card>

      {/* Pages You May Like */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Pages you may like</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pagesYouMayLike.map((page, index) => (
            <div key={index} className="text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  {page.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{page.name}</p>
                  <p className="text-gray-500 text-xs">{page.followers}</p>
                  <p className="text-gray-500 text-xs">{page.connections}</p>
                </div>
              </div>
              <Button variant="outline" className="mt-2 w-full">Follow</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

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
            const currentUserRes = await apiClient.get("/user/me");
            
            if (currentUserRes.data?.user) {
              setProfileUser(currentUserRes.data.user);
              
              // Fetch current user's posts
              const postsRes = await apiClient.get("/user/posts/me");
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
            const searchRes = await apiClient.get(`/user/profile/${urlUsername}`);
            
            if (searchRes.data?.users?.length > 0) {
              const foundUser = searchRes.data.users[0];
              setProfileUser(foundUser);
              
              // Fetch user's posts
              try {
                const postsRes = await apiClient.get(`/posts/user/${foundUser._id}`);
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
      await apiClient.post(`/users/${profileUser._id}/follow`);

    } catch (error) {
      console.error("Failed to toggle follow:", error);
      // Rollback on error
      setProfileUser(originalProfileUser);
      dispatch(setUser(originalReduxUser));
      toast.error(error.response?.data?.message || "Failed to toggle follow status");
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Existing profile content */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : profileUser ? (
                <div className="space-y-6">
                  {/* Existing profile header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24 sm:w-32 sm:h-32">
                        <AvatarImage src={profileUser.profile?.avatar} alt={profileUser.fullname} />
                        <AvatarFallback>
                          {profileUser.fullname?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {isOwnProfile && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8"
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                        >
                          <ImageIcon className="h-4 w-4" />
                          <input
                            id="avatar-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                          />
                        </Button>
                      )}
                    </div>
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold">{profileUser.fullname}</h1>
                      <p className="text-gray-600">{profileUser.profile?.headline}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profileUser.profile?.location && (
                          <span className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-1" />
                            {profileUser.profile.location}
                          </span>
                        )}
                        {profileUser.email && (
                          <span className="flex items-center text-sm text-gray-500">
                            <Mail className="h-4 w-4 mr-1" />
                            {profileUser.email}
                          </span>
                        )}
                      </div>
                    </div>
                    {isOwnProfile && (
                      <Button
                        onClick={handleEditClick}
                        variant="outline"
                        className="mt-4 sm:mt-0"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>

                  {/* Profile View or Edit Form */}
                  {isEditRoute ? (
                    <Outlet context={{ user: profileUser, isOwnProfile, handleEditClick }} />
                  ) : (
                    <ProfileView 
                      user={profileUser} 
                      isOwnProfile={isOwnProfile} 
                      handleEditClick={handleEditClick} 
                    />
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">User not found</p>
                  <Button onClick={() => navigate('/')} className="mt-4">
                    Back to Home
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Posts */}
          {userPosts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Posts</h2>
              {userPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <ProfileSidebar user={profileUser || {}} />
      </div>
    </div>
  );
};

export default Profile;
