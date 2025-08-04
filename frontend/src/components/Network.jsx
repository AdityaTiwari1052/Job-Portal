import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Network = () => {
    const [network, setNetwork] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const { user } = useSelector((store) => store.auth);

  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        const res = await axios.get(`${USER_API_END_POINT}/me`, {
          withCredentials: true,
        });
        if (res.data.following) {
          setNetwork(res.data.following);
        }
      } catch (error) {
        console.error("Error fetching network:", error);
      }
    };

        const fetchRecommendedUsers = async () => {
      try {
        const res = await axios.get(`${USER_API_END_POINT}/all`, {
          withCredentials: true,
        });
        setRecommendedUsers(res.data);
      } catch (error) {
        console.error("Error fetching recommended users:", error);
      }
    };

    if (user) {
      fetchNetwork();
      fetchRecommendedUsers();
    }
  }, [user]);

  return (
        <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Network</h1>
      {
        network.length > 0 ? (
          <div className="flex overflow-x-auto space-x-6 pb-4">
            {network.map((person) => (
              <div key={person._id} className="flex-shrink-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center text-center w-48">
                <Link to={`/profile/${person.username}`}>
                  <img src={person.profile?.profilePhoto} alt={person.fullname} className="w-24 h-24 rounded-full object-cover mb-4" />
                </Link>
                <h2 className="text-lg font-semibold truncate w-full">{person.fullname}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm truncate w-full">@{person.username}</p>
                <Link to={`/profile/${person.username}`} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-full text-xs hover:bg-blue-600 transition-colors">
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p>You are not following anyone yet.</p>
        )
      }

      <h2 className="text-2xl font-bold mt-12 mb-6">People you may know</h2>
      {
        recommendedUsers.length > 0 ? (
          <div className="flex overflow-x-auto space-x-6 pb-4">
            {recommendedUsers.map((person) => (
                            <div key={person._id} className="flex-shrink-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center text-center w-48">
                <Link to={`/profile/${person.username}`}>
                  <img src={person.profile?.profilePhoto} alt={person.fullname} className="w-24 h-24 rounded-full object-cover mb-4" />
                </Link>
                <h2 className="text-xl font-semibold">{person.fullname}</h2>
                <p className="text-gray-500 dark:text-gray-400">@{person.username}</p>
                <Link to={`/profile/${person.username}`} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-600 transition-colors">
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p>No recommendations at this time.</p>
        )
      }
    </div>
  );
};

export default Network;
