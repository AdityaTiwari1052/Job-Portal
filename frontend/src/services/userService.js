import apiClient from '../utils/apiClient';

const userService = {
  // Update user profile
  updateProfile: async (profileData) => {
    try {
      console.log('Sending profile update to /profile/update', JSON.stringify(profileData, null, 2));
      const response = await apiClient.post('/api/v1/user/profile/update', profileData);
      console.log('Profile update successful:', response.data);
      return response.data;
    } catch (error) {
      const errorDetails = {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data ? JSON.parse(error.config.data) : null,
          headers: error.config?.headers
        },
        stack: error.stack
      };
      console.error('Error updating profile:', JSON.stringify(errorDetails, null, 2));
      throw error;
    }
  },

  // Get user profile
  getProfile: async (userId) => {
    try {
      console.log(`Fetching profile for user ID: ${userId}`);
      
      // Use the helper method which already includes /api/v1/user prefix
      const response = await apiClient.user(`/by-id/${userId}`);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      // The API returns the user data directly in response.data
      const userData = response.data;
      
      // Log the received data structure for debugging
      console.log('Raw profile data received:', JSON.stringify(userData, null, 2));
      
      if (!userData) {
        throw new Error('User not found');
      }
      
      // Transform the data to match our frontend structure
      const profileData = {
        ...userData,
        // If profile is nested, flatten it
        ...(userData.profile || {}),
        experience: Array.isArray(userData.experience) ? userData.experience : 
                   (userData.profile?.experience || []),
        education: Array.isArray(userData.education) ? userData.education : 
                  (userData.profile?.education || []),
        skills: Array.isArray(userData.skills) ? userData.skills : 
               (userData.profile?.skills || [])
      };
      
      console.log('Processed profile data:', profileData);
      return profileData;
      
    } catch (error) {
      const errorDetails = {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers ? Object.keys(error.config.headers) : 'No headers'
        }
      };
      console.error('Error fetching profile:', JSON.stringify(errorDetails, null, 2));
      throw error;
    }
  }
};

export default userService;
