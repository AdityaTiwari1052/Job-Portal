import React, { useEffect, useState } from 'react';
import apiClient from '@/utils/apiClient';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const Network = () => {
  const [network, setNetwork] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSelector((store) => store.auth);

  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        console.log('🔍 [Network] Fetching user network...');
        const res = await apiClient.get('/user/me');
        console.log('📦 [Network] Network response:', res.data);
        
        if (res.data?.user?.following) {
          console.log(`✅ [Network] Found ${res.data.user.following.length} users in network`);
          setNetwork(Array.isArray(res.data.user.following) ? res.data.user.following : []);
        } else {
          console.log('ℹ️ [Network] No following data found in response');
          setNetwork([]);
        }
      } catch (error) {
        console.error('❌ [Network] Error fetching network:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        toast.error('Failed to load your network');
        setNetwork([]);
      }
    };

    const fetchRecommendedUsers = async () => {
      try {
        console.log('🔍 [Network] Fetching recommended users...');
        const res = await apiClient.get('/user/all');
        console.log('📦 [Network] Recommended users response:', res.data);
        
        if (res.data?.users && Array.isArray(res.data.users)) {
          console.log(`✅ [Network] Found ${res.data.users.length} recommended users`);
          setRecommendedUsers(res.data.users);
        } else {
          console.log('ℹ️ [Network] No recommended users data found');
          setRecommendedUsers([]);
        }
      } catch (error) {
        console.error('❌ [Network] Error fetching recommended users:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        toast.error('Failed to load recommended users');
        setRecommendedUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?._id) {
      setIsLoading(true);
      fetchNetwork();
      fetchRecommendedUsers();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Safe array access
  const safeNetwork = Array.isArray(network) ? network : [];
  const safeRecommendedUsers = Array.isArray(recommendedUsers) ? recommendedUsers : [];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Network</h1>
      
      {safeNetwork.length > 0 ? (
        <div className="flex overflow-x-auto space-x-6 pb-4">
          {safeNetwork.map((person) => (
            person && person._id ? (
              <div key={person._id} className="flex-shrink-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center text-center w-48">
                <Link to={`/profile/${person.username || ''}`}>
                  <img 
                    src={person.profile?.profilePhoto || '/default-avatar.png'} 
                    alt={person.fullname || 'User'} 
                    className="w-24 h-24 rounded-full object-cover mb-4"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                </Link>
                <h2 className="text-lg font-semibold truncate w-full">
                  {person.fullname || 'Unknown User'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm truncate w-full">
                  {person.username ? `@${person.username}` : ''}
                </p>
                <Link 
                  to={`/profile/${person.username || ''}`} 
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-full text-xs hover:bg-blue-600 transition-colors"
                >
                  View Profile
                </Link>
              </div>
            ) : null
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <p className="text-gray-600 dark:text-gray-300">You are not following anyone yet.</p>
        </div>
      )}

      <h2 className="text-2xl font-bold mt-12 mb-6">People you may know</h2>
      
      {safeRecommendedUsers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {safeRecommendedUsers.map((person) => (
            person && person._id && (
              <div key={person._id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center">
                <Link to={`/profile/${person.username || ''}`} className="w-full">
                  <div className="flex flex-col items-center">
                    <img 
                      src={person.profile?.profilePhoto || '/default-avatar.png'} 
                      alt={person.fullname || 'User'}
                      className="w-32 h-32 rounded-full object-cover mb-4"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                    <h2 className="text-xl font-semibold text-center">
                      {person.fullname || 'Unknown User'}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                      {person.username ? `@${person.username}` : ''}
                    </p>
                  </div>
                </Link>
                <div className="mt-4 w-full flex justify-center">
                  <Link 
                    to={`/profile/${person.username || ''}`} 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full text-sm transition-colors w-full text-center"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <p className="text-gray-600 dark:text-gray-300">No recommendations available at this time.</p>
        </div>
      )}
    </div>
  );
};

export default Network;
