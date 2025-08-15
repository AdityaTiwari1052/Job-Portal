export const getApiBaseUrl = () => {
  // For development, use the full URL to avoid CORS issues
  if (import.meta.env.MODE === 'development') {
    return 'http://localhost:8000/api/v1';
  }
  // In production, use relative URL since frontend is served from the same domain
  return '/api/v1';
};

export const USER_API_END_POINT = "http://localhost:8000/api/v1/user";
export const JOB_API_END_POINT = "http://localhost:8000/api/v1/jobs";
export const APPLICATION_API_END_POINT = "http://localhost:8000/api/v1/application";