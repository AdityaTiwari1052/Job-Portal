import { setAllJobs, setLoading, setError } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const useGetAllJobs = () => {
    const dispatch = useDispatch();
    const { searchedQuery, selectedCategory, selectedLocation } = useSelector(store => store.job);
    
    useEffect(() => {
        const fetchAllJobs = async () => {
            console.log('Starting to fetch jobs...');
            dispatch(setLoading(true));
            
            try {
                // Build query parameters
                const params = new URLSearchParams();

                if (searchedQuery) {
                    params.append('keyword', searchedQuery);
                }
                if (selectedCategory) {
                    params.append('category', selectedCategory);
                }
                if (selectedLocation) {
                    params.append('location', selectedLocation);
                }

                const queryString = params.toString();
                const url = `/api/v1${JOB_API_END_POINT}/all${queryString ? `?${queryString}` : ''}`;
                console.log('Making request to:', url);
                console.log('Filters - Category:', selectedCategory, 'Location:', selectedLocation);

                const res = await axios.get(url, {
                    withCredentials: true,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('Response status:', res.status);
                console.log('Response data:', res.data);
                
                if (res.data && res.data.success) {
                    console.log('Successfully fetched jobs:', res.data.jobs);
                    dispatch(setAllJobs(Array.isArray(res.data.jobs) ? res.data.jobs : []));
                } else {
                    console.error('Unexpected response format:', res.data);
                    dispatch(setError('Failed to fetch jobs: Invalid response format'));
                }
            } catch (error) {
                console.error('Error details:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    config: {
                        url: error.config?.url,
                        method: error.config?.method,
                        headers: error.config?.headers,
                    }
                });
                dispatch(setError(`Error: ${error.response?.data?.message || 'Failed to fetch jobs. Please try again later.'}`));
            } finally {
                dispatch(setLoading(false));
            }
        };

        fetchAllJobs();
    }, [dispatch, searchedQuery, selectedCategory, selectedLocation]);
};

export default useGetAllJobs;