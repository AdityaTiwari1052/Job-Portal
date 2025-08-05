import { setAllJobs } from '@/redux/jobSlice';
import apiClient from '@/utils/apiClient';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useGetAllJobs = () => {
    const dispatch = useDispatch();
    const { searchedQuery } = useSelector(store => store.job);
    
    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                const res = await apiClient.get(`/api/v1/job/get?keyword=${searchedQuery}`);
                if (res.data.success) {
                    dispatch(setAllJobs(res.data.jobs));
                }
            } catch (error) {
                console.error('Error fetching jobs:', error);
                // Optionally dispatch an error action here
            }
        };
        
        fetchAllJobs();
    }, [searchedQuery, dispatch]);
}

export default useGetAllJobs