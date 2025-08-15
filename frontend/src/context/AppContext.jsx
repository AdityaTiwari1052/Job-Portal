import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { RECRUITER_API_END_POINT } from '../utils/constant';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Search filters state
  const [searchFilters, setSearchFilters] = useState({
    query: '',
    location: '',
    jobType: '',
    experience: '',
  });

  // Recruiter and company data
  const [recruiterData, setRecruiterData] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create axios instance with default config
  const api = axios.create({
    baseURL: RECRUITER_API_END_POINT,
    withCredentials: true,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  // Fetch recruiter and company data
  const fetchRecruiterData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('recruiterToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.get('/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data?.success) {
        setRecruiterData(response.data.data.recruiter);
        setCompanyData(response.data.data.company);
      }
    } catch (err) {
      console.error('Error fetching recruiter data:', err);
      setError(err.response?.data?.message || 'Failed to load recruiter data');
      
      // Clear invalid token if request fails with 401
      if (err.response?.status === 401) {
        localStorage.removeItem('recruiterToken');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update search filters
  const updateSearchFilters = (newFilters) => {
    setSearchFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchFilters({
      query: '',
      location: '',
      jobType: '',
      experience: '',
    });
  };

  // Initial data fetch
  useEffect(() => {
    const token = localStorage.getItem('recruiterToken');
    if (token) {
      fetchRecruiterData();
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        // State
        searchFilters,
        recruiterData,
        companyData,
        isLoading,
        error,
        
        // Actions
        updateSearchFilters,
        clearFilters,
        setRecruiterData,
        setCompanyData,
        fetchRecruiterData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
