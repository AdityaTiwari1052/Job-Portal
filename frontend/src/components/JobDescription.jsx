import React, { useEffect, useState, useMemo } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Calendar, MapPin, Briefcase, DollarSign, Clock, Building2, FileText, UserCheck, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import apiClient from '@/utils/apiClient';

const JobDescription = ({ job: jobProp, hideApplyButton = false, onApplySuccess }) => {
    const { title, description, location, jobType, salary, skills, company, createdAt, applications = [] } = jobProp || useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const jobId = params.id || (jobProp && jobProp._id);
    
    const job = jobProp || useSelector(store => store.job);
    const [isLoading, setIsLoading] = useState(false);
    const [isApplied, setIsApplied] = useState(false);

    // Check if user has already applied
    useEffect(() => {
        if (user && job?.applications) {
            const hasApplied = job.applications.some(app => 
                (app.applicant?._id === user._id) || 
                (app.applicant === user._id) ||
                (typeof app === 'string' && app === user._id)
            );
            setIsApplied(hasApplied);
        }
    }, [user, job]);

    // Check if current user is the job poster
    const isJobPoster = useMemo(() => {
        if (!user || !job) return false;
        const possiblePosterIds = [
            job.postedBy?._id,
            job.postedBy,
            job.created_by,
            job.createdBy?._id,
            job.createdBy
        ].filter(Boolean);
        return possiblePosterIds.includes(user._id);
    }, [user, job]);

    const handleApply = async () => {
        if (!user) {
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }

        if (isApplied) return;

        try {
            setIsLoading(true);
            const response = await apiClient.post(`/application/apply/${job._id}`);
            
            if (response.data.success) {
                setIsApplied(true);
                toast.success('Application submitted successfully!');
                if (onApplySuccess) onApplySuccess();
                
                // Update the job in Redux store to include this application
                if (job) {
                    const updatedJob = {
                        ...job,
                        applications: [...(job.applications || []), { applicant: user._id }]
                    };
                    dispatch(setSingleJob(updatedJob));
                }
            }
        } catch (error) {
            console.error('Error applying to job:', error);
            toast.error(error.response?.data?.message || 'Failed to apply. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Don't show anything if no job data
    if (!job) return null;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
                        <div className="flex items-center text-gray-600 mb-4">
                            <Building2 className="h-4 w-4 mr-1.5" />
                            <span>{company?.name || 'Company Not Specified'}</span>
                        </div>
                    </div>
                    {createdAt && (
                        <div className="text-sm text-gray-500">
                            <Calendar className="inline h-4 w-4 mr-1" />
                            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                        </div>
                    )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        <MapPin className="h-4 w-4 mr-1" />
                        {location || 'Remote'}
                    </div>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <Briefcase className="h-4 w-4 mr-1" />
                        {jobType || 'Full-time'}
                    </div>
                    {salary && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {salary}
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        Job Description
                    </h2>
                    <div className="prose max-w-none text-gray-700">
                        {description || 'No job description provided.'}
                    </div>
                </div>

                {skills?.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-md font-medium text-gray-900 mb-2">Skills Required</h3>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-sm py-1 px-3">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {!hideApplyButton && !isJobPoster && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        {isApplied ? (
                            <Button 
                                disabled 
                                className="w-full bg-green-100 text-green-800 hover:bg-green-100 h-12 text-base"
                            >
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Already Applied
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleApply}
                                disabled={isLoading}
                                className={cn(
                                    "w-full h-12 text-base",
                                    isLoading ? "bg-blue-500/90" : "bg-blue-600 hover:bg-blue-700"
                                )}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Applying...
                                    </>
                                ) : (
                                    "Apply Now"
                                )}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobDescription;
