import axios from 'axios';
import { toast } from 'sonner';
import { getApiBaseUrl } from './constant';
import { logout } from '@/redux/authSlice';
import store from '@/redux/store';

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // This is important for sending/receiving cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle common errors and authentication issues
apiClient.interceptors.response.use(
  (response) => response, // Simply return successful responses
  async (error) => {
    // Handle specific error statuses
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401: // Unauthorized
          toast.error(data.message || 'You are not authenticated. Please log in.');
          // Dispatch logout action to clear user state from Redux
          store.dispatch(logout());
          // Redirect to login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403: // Forbidden
          toast.error(data.message || 'You are not authorized to perform this action.');
          break;
        case 404: // Not Found
          toast.error(data.message || 'The requested resource was not found.');
          break;
        default:
          // For other server-side errors, show the message from the backend if available
          toast.error(data.message || 'An unexpected error occurred. Please try again.');
          break;
      }
    } else if (error.request) {
      // The request was made but no response was received (e.g., network error)
      toast.error('Network Error: Could not connect to the server. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error(`An error occurred: ${error.message}`);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
