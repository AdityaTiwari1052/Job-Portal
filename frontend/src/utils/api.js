import axios from 'axios';
import { getApiBaseUrl } from './constant';

// Create axios instance with default config
const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Get the Clerk session token
      const token = window.Clerk?.session?.getToken();
      if (token) {
        const sessionToken = await token;
        if (sessionToken) {
          config.headers.Authorization = `Bearer ${sessionToken}`;
        }
      }
    } catch (error) {
      console.error('Error getting Clerk token:', error);
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
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear any existing session
      if (window.Clerk?.signOut) {
        window.Clerk.signOut();
      }
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('login')) {
        window.location.href = '/';
      }
    }
    
    // Handle other error statuses
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
