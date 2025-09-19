import React, { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Briefcase, MapPin, Clock, DollarSign, ArrowLeft, Calendar } from 'lucide-react';
import { JOB_API_END_POINT, APPLICATION_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { useUser, useAuth } from '@clerk/clerk-react';

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const [isApplied, setIsApplied] = useState(false);
    const { id: jobId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user, isSignedIn } = useUser();
    const { getToken } = useAuth();
    const applyJobHandler = async () => {
        try {
            if (!isSignedIn) {
                toast.info('Please sign in to apply for jobs');
                navigate('/sign-in');
                return;
            }
    
            const token = await getToken();
            const res = await axios.post(
                `/api/v1${APPLICATION_API_END_POINT}/apply/${jobId}`,
                {
                    userId: user.id,
                    resume: user.resume || '',
                    coverLetter: ''
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            if (res.data.success) {
                setIsApplied(true);
                // Create a new application object with the current user's ID
                const newApplication = {
                    _id: res.data.data?.application?._id || Date.now().toString(),
                    applicant: user.id,
                    job: jobId,
                    status: 'applied',
                    appliedAt: new Date().toISOString()
                };
                
                // Update the single job in Redux with the new application
                const updatedSingleJob = {
                    ...singleJob,
                    applications: [
                        ...(singleJob?.applications || []),
                        newApplication
                    ]
                };
                
                dispatch(setSingleJob(updatedSingleJob));
                toast.success('Application submitted successfully!');
            }
        } catch (error) {
            console.error('Error applying to job:', error);
            toast.error(error.response?.data?.message || 'Failed to apply for the job');
        }
    };
    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const token = await getToken();
                const res = await axios.get(
                    `/api/v1${JOB_API_END_POINT}/${jobId}`,
                    {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                        params: { userId: user?.id }
                    }
                );
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    // Use the hasApplied flag from the backend
                    setIsApplied(res.data.job.hasApplied || false);
                }
            } catch (error) {
                console.error('Error fetching job:', error);
                toast.error('Failed to load job details');
            }
        };
        
        if (jobId) {
            fetchSingleJob();
        }
    }, [jobId, dispatch, user?.id, getToken]);

    if (!singleJob) {
        return (
            <div className="max-w-7xl mx-auto my-10 p-4">
                <p>Loading job details...</p>
            </div>
        );
    }

    return (
        <div className='max-w-7xl mx-auto my-10 px-4 sm:px-6 lg:px-8'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                {/* Job Header */}
                <div className='bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100'>
                    <Button 
                        onClick={() => navigate(-1)}
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-600 hover:bg-white/50 -ml-2 mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Jobs
                    </Button>
                    
                    <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6'>
                        <div>
                            <h1 className='text-2xl font-bold text-gray-900'>{singleJob?.title}</h1>
                            <div className='flex items-center gap-2 mt-2 text-gray-600 text-sm'>
                                <Briefcase className='h-4 w-4' />
                                <span>{singleJob?.position || 'N/A'} Position</span>
                            </div>
                            
                            <div className='flex flex-wrap gap-2 mt-4'>
                                <Badge variant="outline" className='bg-white/80 backdrop-blur-sm border-blue-200 text-blue-700'>
                                    <MapPin className='h-4 w-4 mr-1' />
                                    {singleJob?.location || 'Remote'}
                                </Badge>
                                <Badge variant="outline" className='bg-white/80 backdrop-blur-sm border-purple-200 text-purple-700'>
                                    <Clock className='h-4 w-4 mr-1' />
                                    {singleJob?.jobType || 'Full-time'}
                                </Badge>
                                <Badge variant="outline" className='bg-white/80 backdrop-blur-sm border-green-200 text-green-700'>
                                    <DollarSign className='h-4 w-4 mr-1' />
                                    {singleJob?.salary ? `${singleJob.salary} LPA` : 'Negotiable'}
                                </Badge>
                            </div>
                        </div>
                        
                        <div className='flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto'>
                            <Button
                                onClick={isApplied ? null : applyJobHandler}
                                disabled={isApplied}
                                className={`rounded-lg h-12 px-6 ${
                                    isApplied 
                                        ? 'bg-gray-100 text-gray-600 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                }`}
                            >
                                {isApplied ? 'Applied' : 'Apply Now'}
                            </Button>
                        </div>
                    </div>
                </div>
                
                {/* Job Content */}
                <div className='p-6'>
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                        {/* Main Content */}
                        <div className='lg:col-span-2 space-y-8'>
                            {/* Job Overview */}
                            <div className='space-y-4'>
                                <h2 className='text-xl font-semibold text-gray-900'>Job Description</h2>
                                <p className='text-gray-700 whitespace-pre-line'>{singleJob?.description}</p>
                            </div>
                            
                            {/* Requirements */}
                            {Array.isArray(singleJob?.requirements) && singleJob.requirements.length > 0 && (
                                <div className='space-y-4'>
                                    <h3 className='text-lg font-semibold text-gray-900'>Requirements</h3>
                                    <ul className='space-y-3'>
                                        {singleJob.requirements.map((req, index) => (
                                            <li key={index} className='flex items-start'>
                                                <span className='text-blue-500 mr-2 mt-1'>•</span>
                                                <span className='text-gray-700'>{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        
                        {/* Sidebar */}
                        <div className='space-y-6'>
                            <div className='bg-gray-50 p-5 rounded-lg border border-gray-100'>
                                <h3 className='font-medium text-gray-900 mb-4'>Job Overview</h3>
                                <div className='space-y-4'>
                                    <div className='flex items-start'>
                                        <Calendar className='h-5 w-5 text-gray-400 mr-3 mt-0.5' />
                                        <div>
                                            <p className='text-sm text-gray-500'>Posted Date</p>
                                            <p className='text-gray-900 font-medium'>
                                                {singleJob?.createdAt 
                                                    ? new Date(singleJob.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className='flex items-start'>
                                        <Clock className='h-5 w-5 text-gray-400 mr-3 mt-0.5' />
                                        <div>
                                            <p className='text-sm text-gray-500'>Job Type</p>
                                            <p className='text-gray-900 font-medium'>{singleJob?.jobType || 'Full-time'}</p>
                                        </div>
                                    </div>
                                    <div className='flex items-start'>
                                        <MapPin className='h-5 w-5 text-gray-400 mr-3 mt-0.5' />
                                        <div>
                                            <p className='text-sm text-gray-500'>Location</p>
                                            <p className='text-gray-900 font-medium'>{singleJob?.location || 'Remote'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className='bg-blue-50 p-5 rounded-lg border border-blue-100'>
                                <h3 className='font-medium text-blue-900 mb-3'>Ready to apply?</h3>
                                <p className='text-sm text-blue-800 mb-4'>
                                    Submit your application with just one click and take the next step in your career journey.
                                </p>
                                <Button 
                                    onClick={isApplied ? null : applyJobHandler}
                                    disabled={isApplied}
                                    className={`w-full h-12 ${
                                        isApplied 
                                            ? 'bg-gray-100 text-gray-600 cursor-not-allowed' 
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                    {isApplied ? 'Application Submitted' : 'Apply for this position'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDescription;
