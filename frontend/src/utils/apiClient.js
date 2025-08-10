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

// Add request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = store.getState()?.auth?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('🚀 API Request:', config.method.toUpperCase(), config.url);
    console.log('📦 Request Data:', config.data);
    console.log('🔑 Auth Token:', token ? 'Present' : 'Missing');
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors and authentication issues
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.method.toUpperCase(), response.config.url, response.status);
    console.log('📦 Response Data:', response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.log('🛑 Authentication error, logging out...');
        store.dispatch(logout());
      }
      
      console.error('❌ API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.response.config.url,
        method: error.response.config.method,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error('❌ No response received:', error.request);
      toast.error('No response from server. Please check your connection.');
    } else {
      console.error('❌ Request setup error:', error.message);
      toast.error('Error setting up request: ' + error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
