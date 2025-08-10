import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserPlus, Link2, Building2, MapPin } from 'lucide-react';

const ProfileSidebar = ({ user }) => {
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching recommended users (replace with actual API call)
  useEffect(() => {
    // TODO: Replace with actual API call to fetch recommended users
    const fetchRecommendedUsers = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data - replace with actual API response
        const mockUsers = [
          { id: 1, name: 'John Doe', username: 'johndoe', headline: 'Software Engineer at Tech Corp' },
          { id: 2, name: 'Jane Smith', username: 'janesmith', headline: 'Product Manager at Design Co' },
          { id: 3, name: 'Alex Johnson', username: 'alexj', headline: 'UX Designer at Creative Labs' },
        ];
        
        setRecommendedUsers(mockUsers);
      } catch (error) {
        console.error('Error fetching recommended users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedUsers();
  }, []);

  const handleConnect = (userId) => {
    // TODO: Implement connect functionality
    console.log('Connect clicked for user:', userId);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Profile Summary Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Profile Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-full">
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Profile Completion</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full" 
                  style={{ width: `${user.profileCompletion || 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {user.profileCompletion || 0}% complete
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-full">
              <Link2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Connections</p>
              <p className="text-sm text-gray-500">{user.connectionCount || 0} connections</p>
            </div>
          </div>
          
          {user.company && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-full">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Company</p>
                <p className="text-sm text-gray-500">{user.company}</p>
              </div>
            </div>
          )}
          
          {user.location && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-full">
                <MapPin className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-gray-500">{user.location}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* People You May Know */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">People you may know</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recommendedUsers.length > 0 ? (
            <div className="space-y-4">
              {recommendedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.headline}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleConnect(user.id)}
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1" />
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No recommendations available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSidebar;
