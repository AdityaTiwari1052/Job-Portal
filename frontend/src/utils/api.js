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
  (config) => {
    // Skip Content-Type for FormData to allow browser to set it with the correct boundary
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    // Get the appropriate token based on the request URL
    const isRecruiterEndpoint = config.url?.startsWith('/recruiter');
    const isUserEndpoint = config.url?.startsWith('/user');

    if (isRecruiterEndpoint) {
      // For recruiter endpoints, use manual token
      const token = localStorage.getItem('recruiterToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`[API] Added recruiter token to ${config.method?.toUpperCase()} ${config.url}`);
      } else {
        console.warn(`[API] No recruiter token found for ${config.url}`);
      }
    } else if (isUserEndpoint) {
      // For user endpoints, check if Authorization header is already set
      if (config.headers.Authorization) {
        console.log(`[API] 📤 Sending request to ${config.method?.toUpperCase()} ${config.url}`);
        console.log(`[API] 🔑 Authorization header: Bearer ${config.headers.Authorization.substring(7, 20)}...`);
      } else {
        console.log(`[API] ⚠️ No Authorization header for ${config.method?.toUpperCase()} ${config.url}`);
      }
    } else {
      // For other endpoints, use user token if available
      const token = localStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`[API] Added user token to ${config.method?.toUpperCase()} ${config.url}`);
      } else {
        console.warn(`[API] No token found for ${config.url}`);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    const { response, config, request } = error;
    const errorMessage = response?.data?.message || error.message;

    console.error(`[API] ❌ Error ${response?.status || 'N/A'} ${config?.method?.toUpperCase() || 'N/A'} ${config?.url || 'N/A'}:`, {
      message: errorMessage,
      status: response?.status,
      data: response?.data,
      request: request ? 'Request sent' : 'Request failed to send',
      code: error.code
    });

    // Handle 401 Unauthorized
    if (response?.status === 401) {
      console.warn('[API] Unauthorized access - redirecting to login');
      // Clear invalid tokens
      if (config?.url?.includes('/recruiter')) {
        localStorage.removeItem('recruiterToken');
        localStorage.removeItem('recruiterData');
      } else {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
      }

      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
