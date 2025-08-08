import { setAllJobs } from '@/redux/jobSlice';
import apiClient from '@/utils/apiClient';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useGetAllJobs = () => {
    const dispatch = useDispatch();
    const { searchedQuery } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    
    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                console.log('=== FETCHING JOBS ===');
                console.log('User authenticated:', !!user);
                console.log('Search query:', searchedQuery);
                
                if (!user) {
                    console.log('No user authenticated, skipping job fetch');
                    return;
                }
                
                const res = await apiClient.get(`/api/v1/job/get?keyword=${searchedQuery || ''}`);
                console.log('Jobs API response:', res.data);
                
                if (res.data.success) {
                    dispatch(setAllJobs(res.data.jobs));
                    console.log('Jobs fetched successfully:', res.data.jobs.length, 'jobs');
                } else {
                    console.warn('Job fetch unsuccessful:', res.data.message);
                }
            } catch (error) {
                console.error('Error fetching jobs:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    statusText: error.response?.statusText
                });
                
                // If it's a 401 error, the user is not authenticated
                if (error.response?.status === 401) {
                    console.log('Authentication required for job fetching');
                } else if (error.response?.status === 403) {
                    console.log('Access forbidden for job fetching');
                } else {
                    console.log('Other error during job fetching:', error.message);
                }
            }
        };
        
        fetchAllJobs();
    }, [searchedQuery, dispatch, user]);
}

export default useGetAllJobs