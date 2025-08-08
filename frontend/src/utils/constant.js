export const getApiBaseUrl = () => {
  // By returning an empty string, the API client will use the current host as the base URL.
  // This works for both local development (http://localhost:8000) and the deployed environment.
  return '';
};