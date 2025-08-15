// Determine base URL based on environment
const isDev = import.meta.env.MODE === 'development';
const BASE_URL = isDev 
  ? 'http://localhost:8000/api/v1' 
  : 'https://job-portal-v3b1.onrender.com/api/v1';

// Add CORS settings
export const CORS_OPTIONS = {
  origin: isDev 
    ? ['http://localhost:5173', 'http://127.0.0.1:5173']
    : ['https://job-portal-v3b1.onrender.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept',
    'Origin',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods'
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'Authorization',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials'
  ]
};

console.log(`Using ${isDev ? 'development' : 'production'} API URL:`, BASE_URL);

export const getApiBaseUrl = () => BASE_URL;
export const USER_API_END_POINT = `${BASE_URL}/user`;
export const JOB_API_END_POINT = `${BASE_URL}/jobs`;
export const APPLICATION_API_END_POINT = `${BASE_URL}/user`;
export const RECRUITER_API_END_POINT = `${BASE_URL}/recruiter`;