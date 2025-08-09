export const getApiBaseUrl = () => {
  // For development, use the full URL to avoid CORS issues
  if (import.meta.env.MODE === 'development') {
    return 'http://localhost:8000/api/v1';
  }
  // In production, use relative URL since frontend is served from the same domain
  return '/api/v1';
};