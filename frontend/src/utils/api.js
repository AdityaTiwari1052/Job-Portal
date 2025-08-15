import axios from 'axios';
import { getApiBaseUrl } from './constant';

// Create axios instance with default config
const api = axios.create({
  baseURL: getApiBaseUrl(), // Use the base URL without the /recruiter suffix
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('recruiterToken');
    if (token) {
      // Ensure the token is properly formatted (remove any quotes if present)
      const cleanToken = token.replace(/^"|"$/g, '');
      config.headers.Authorization = `Bearer ${cleanToken}`;
      // Ensure we're sending credentials with every request
      config.withCredentials = true;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite retry loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear auth data
      localStorage.removeItem('recruiterToken');
      localStorage.removeItem('recruiterData');
      
      // Only redirect if not already on login page and not an API request
      if (!window.location.pathname.includes('login') && 
          !originalRequest.url.includes('/recruiter/me')) {
        window.location.href = '/';
      }
      
      return Promise.reject(error);
    }
    
    // Handle other error statuses
    if (error.response) {
      // Handle 403 Forbidden
      if (error.response.status === 403) {
        console.error('Forbidden: You do not have permission to access this resource');
        toast.error('You do not have permission to access this resource');
      }
      
      // Handle 500 Internal Server Error
      if (error.response.status >= 500) {
        console.error('Server Error:', error.response.data);
        toast.error('Server error. Please try again later.');
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
      toast.error('No response from server. Please check your connection.');
    } else {
      console.error('Request setup error:', error.message);
      toast.error(`Request error: ${error.message}`);
    }
    
    return Promise.reject(error);
  }
);

export default api;
