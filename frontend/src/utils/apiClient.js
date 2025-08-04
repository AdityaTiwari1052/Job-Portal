import axios from 'axios';
import { toast } from 'sonner';
import { USER_API_END_POINT } from './constant';
import { logout } from '@/redux/authSlice';
import store from '@/redux/store';

// Create axios instance with base config
const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true, // This is important for sending/receiving cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to get the full URL for user endpoints
apiClient.user = (endpoint) => apiClient.get(`/api/v1/user${endpoint}`);
apiClient.userPost = (endpoint, data) => apiClient.post(`/api/v1/user${endpoint}`, data);
apiClient.userPut = (endpoint, data) => apiClient.put(`/api/v1/user${endpoint}`, data);
apiClient.userDelete = (endpoint) => apiClient.delete(`/api/v1/user${endpoint}`);

// Request interceptor - no need to manually add token as it's handled by cookies
apiClient.interceptors.request.use(
  (config) => {
    // All requests will automatically include cookies
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401, the user is not authenticated
    if (error.response?.status === 401) {
      // Dispatch logout action to clear user state
      store.dispatch(logout());
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Handle other errors
    if (error.response?.status === 403) {
      toast.error('You are not authorized to perform this action');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.response?.status !== 401) { // Don't show generic error for 401
      toast.error('An error occurred. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
