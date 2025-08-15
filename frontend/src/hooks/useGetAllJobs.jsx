import { setAllJobs, setLoading, setError } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const useGetAllJobs = () => {
    const dispatch = useDispatch();
    const { searchedQuery } = useSelector(store => store.job);
    
    useEffect(() => {
        const fetchAllJobs = async () => {
            console.log('Starting to fetch jobs...');
            dispatch(setLoading(true));
            
            try {
                const url = `${JOB_API_END_POINT}/all${searchedQuery ? `?keyword=${encodeURIComponent(searchedQuery)}` : ''}`;
                console.log('Making request to:', url);
                
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
    }, [dispatch, searchedQuery]);
};

export default useGetAllJobs;