import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Bell, User, Briefcase, Home,
  LogOut, Users, Settings, Building, Check, Menu
} from 'lucide-react';
import MobileSidebar from '../MobileSidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import apiClient from '@/utils/apiClient';
import { toast } from 'sonner';
import { useSelector, useDispatch } from 'react-redux';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { setUser } from '@/redux/authSlice';

const Navbar = ({ onProfileClick }) => {
  
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data } = await apiClient.get("/user/notifications");
      const notifs = data.notifications || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications", error);
      // Error handling is done by the API client interceptor
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.put("/user/notifications/mark-all-read", {});
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking notifications as read", error);
      // Error handling is done by the API client interceptor
    }
  };

  const logoutHandler = () => {
    dispatch(setUser(null));
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-md z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Link to="/" className="text-2xl font-extrabold">
            <span className="text-blue-500">Job</span><span className="text-gray-800 dark:text-white">Portal</span>
          </Link>
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
              <span className="hidden md:block text-gray-600 dark:text-gray-200">Search</span>
            </Button>
            {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}
          </div>
        </div>

        {/* Center Section */}
        <ul className="hidden md:flex items-center gap-6">
          <li><Link to="/" className="flex flex-col items-center text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"><Home className="w-6 h-6" /><span className="text-xs">Home</span></Link></li>
          {user && (<li><Link to="/network" className="flex flex-col items-center text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"><Users className="w-6 h-6" /><span className="text-xs">My Network</span></Link></li>)}
          {user && (
            <li>
              <Link to="/jobs" className="flex flex-col items-center text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                <Briefcase className="w-6 h-6" />
                <span className="text-xs">Jobs</span>
              </Link>
            </li>
          )}
        </ul>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Notifications Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{unreadCount}</span>}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 dark:bg-gray-800 dark:text-white">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Notifications</h4>
                    {notifications.length > 0 && <Button variant="link" onClick={markAllAsRead}>Mark all as read</Button>}
                  </div>
                  {notifications.length === 0 ? (
                    <p>No new notifications</p>
                  ) : (
                    notifications.map((notif, idx) => (
                      <div key={idx} className={`p-2 rounded-md ${!notif.read ? 'bg-blue-50 dark:bg-blue-900' : ''}`}>
                        <div className="flex items-start gap-2">
                          <Check className={`w-5 h-5 mt-1 ${notif.read ? 'text-green-500' : 'text-blue-500'}`} />
                          <p className="text-sm">
                            {notif.message}
                            <span className="block text-xs text-gray-500 dark:text-gray-400">{new Date(notif.date).toLocaleString()}</span>
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </PopoverContent>
              </Popover>

              {/* Desktop Profile Dropdown */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="hidden md:flex items-center gap-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                      <AvatarFallback>{user?.fullname?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0 dark:bg-gray-800 dark:text-white max-h-[80vh] overflow-y-auto">
                  <div className="flex flex-col">
                    {/* Profile Header */}
                    <div className="p-4 border-b dark:border-gray-700">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-14 w-14">
                          <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                          <AvatarFallback className="text-lg">{user?.fullname?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{user?.fullname}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{user?.profile?.headline || 'Add headline'}</p>
                        </div>
                      </div>
                      <Link to={`/profile/${user?._id}`} className="w-full">
                        <Button variant="outline" className="w-full mt-3 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                          View Profile
                        </Button>
                      </Link>
                    </div>

                    {/* Main Menu */}
                    <div className="p-2 border-b dark:border-gray-700">
                      <button className="w-full text-left p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        <div className="font-medium">Start your 1 month free trial</div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Access exclusive tools & insights</p>
                      </button>
                    </div>

                    {/* Settings Section */}
                    <div className="p-2">
                      <h5 className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">Account</h5>
                      <button className="w-full text-left p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        Settings & Privacy
                      </button>
                      <button className="w-full text-left p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        Help
                      </button>
                      <button className="w-full text-left p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        Language
                      </button>
                    </div>

                    {/* Manage Section */}
                    <div className="p-2 border-t dark:border-gray-700">
                      <h5 className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">Manage</h5>
                      <button className="w-full text-left p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        Posts & Activity
                      </button>
                      <button className="w-full text-left p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        <div>Company: {user?.profile?.company || 'Your Company'}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Job Posting Account</div>
                      </button>
                    </div>

                    {/* Sign Out Section */}
                    <div className="p-2 border-t dark:border-gray-700">
                      <button 
                        onClick={logoutHandler}
                        className="w-full text-left p-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Mobile Menu Button - Only visible on mobile */}
              {/* Mobile Profile Button - Shows full sidebar */}
              <button 
                className="md:hidden flex items-center gap-1 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                  <AvatarFallback className="text-sm">
                    {user?.fullname?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="outline">Login</Button></Link>
              <Link to="/signup"><Button className="bg-[#6A38C2] hover:bg-[#5b30a6]">Signup</Button></Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <MobileSidebar 
          onClose={() => setMobileSidebarOpen(false)}
          onEditClick={() => {
            setMobileSidebarOpen(false);
            navigate('/profile/edit');
          }}
          onLogout={logoutHandler}
        />
      )}
    </nav>
  );
};

const SearchDialog = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && query.trim()) {
      setUsers([]);
      try {
        const response = await apiClient.get(`/user/search/${query}`, {
          withCredentials: true
        });
        if (response.data.users.length === 0) {
          toast.error('No users found');
        } else {
          setUsers(response.data.users);
        }
      } catch (error) {
        console.error('Search error:', error);
        if (error.response?.status === 401) {
          toast.error('Please log in to search');
        } else {
          toast.error('Error searching');
        }
      }
    }
  };

  const handleProfileClick = (username) => {
    navigate(`/profile/${username}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-start pt-20 z-40" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white shadow-lg rounded-lg p-4 w-96 relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b pb-2 mb-2">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            type="text"
            className="w-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search for people..."
            autoFocus
          />
        </div>
        {users.length > 0 && (
          <div className="max-h-60 overflow-y-auto">
            {users.map((user) => (
              <div key={user.username} className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" onClick={() => handleProfileClick(user.username)}>
                <img src={user.profile.profilePhoto} alt="User" className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-semibold">{user.fullname}</p>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
