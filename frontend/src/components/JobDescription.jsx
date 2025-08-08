import React, { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import apiClient from '@/utils/apiClient';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

const JobDescription = ({ job: jobProp }) => {
    const { title, description, location, jobType, salary, skills, company, createdAt } = jobProp || useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const params = useParams();
    const jobId = params.id || (jobProp && jobProp._id);
    
    // Use the job from props if available, otherwise use the one from Redux
    const job = jobProp || useSelector(store => store.job);

    // Ensure applications array exists before checking if user has applied
    const isInitiallyApplied = job?.applications?.some(app => app.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isInitiallyApplied);

    // Handle Apply Button Click
    const applyJobHandler = async () => {
        if (!user) {
            toast.error("You need to log in to apply for jobs!");
            return;
        }

        try {
            const res = await apiClient.post(`/api/v1/application/apply/${jobId || job?._id}`);

            if (res.data.success) {
                setIsApplied(true); // Update local state
                const updatedJob = {
                    ...job,
                    applications: [...(job?.applications || []), { applicant: user?._id }]
                };
                // Only update Redux if we're using it
                if (!jobProp) {
                    dispatch(setSingleJob(updatedJob));
                }
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to apply");
        }
    };

    // Fetch Job Details if we don't have the job data
    useEffect(() => {
        // If we already have the job data from props, no need to fetch
        if (jobProp || !jobId) return;
        
        const fetchSingleJob = async () => {
            try {
                const res = await apiClient.get(`/api/v1/job/get/${jobId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));

                    // Ensure applications exist before checking
                    setIsApplied(res.data.job?.applications?.some(app => app.applicant === user?._id) || false);
                }
            } catch (error) {
                console.error("Error fetching job:", error);
            }
        };
        fetchSingleJob();
    }, [jobId, dispatch, user?._id]);

    if (!job && !jobProp) return <div>Loading job details...</div>;

    return (
        <div className='max-w-7xl mx-auto my-10'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='font-bold text-xl'>{title}</h1>
                    <div className='flex items-center gap-2 mt-4'>
                        <Badge className='text-blue-700 font-bold' variant="ghost">{job?.position || job?.postion || 'N/A'} Positions</Badge>
                        <Badge className='text-[#F83002] font-bold' variant="ghost">{job?.jobType || 'N/A'}</Badge>
                        <Badge className='text-[#7209b7] font-bold' variant="ghost">{job?.salary || 'N/A'}LPA</Badge>
                    </div>
                </div>

                {/* Apply Button */}
                <Button
                    onClick={!user || isApplied ? null : applyJobHandler}
                    disabled={!user || isApplied}
                    className={`rounded-lg ${isApplied ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#7209b7] hover:bg-[#5f32ad]'}`}>
                    {!user ? 'Log in to Apply' : isApplied ? 'Already Applied' : 'Apply Now'}
                </Button>
            </div>

            {/* Job Details */}
            <h1 className='border-b-2 border-b-gray-300 font-medium py-4'>Job Description</h1>
            <div className='my-4'>
                <h1 className='font-bold my-1'>Role: <span className='pl-4 font-normal text-gray-800'>{job?.title || title}</span></h1>
                <h1 className='font-bold my-1'>Location: <span className='pl-4 font-normal text-gray-800'>{job?.location || 'Not specified'}</span></h1>
                <h1 className='font-bold my-1'>Description: <span className='pl-4 font-normal text-gray-800'>{job?.description || 'No description provided'}</span></h1>
                <h1 className='font-bold my-1'>Experience: <span className='pl-4 font-normal text-gray-800'>{job?.experienceLevel || 'Not specified'} yrs</span></h1>
                <h1 className='font-bold my-1'>Salary: <span className='pl-4 font-normal text-gray-800'>{job?.salary || 'Not specified'}LPA</span></h1>
                <h1 className='font-bold my-1'>Total Applicants: <span className='pl-4 font-normal text-gray-800'>{job?.applications?.length || 0}</span></h1>
                <h1 className='font-bold my-1'>Posted Date: <span className='pl-4 font-normal text-gray-800'>{job?.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Date not available'}</span></h1>
            </div>
        </div>
    );
};

export default JobDescription;
