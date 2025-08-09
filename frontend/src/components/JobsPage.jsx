import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { Pencil, Briefcase, Building2, X, CheckCircle2, XCircle, Users, Eye, ChevronLeft, Loader2, Bookmark, DollarSign, Clock, MapPin, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/utils/apiClient';
import Job from './Job';
import JobDescription from './JobDescription';
import CompanySetup from './admin/CompanySetup';
import PostJob from './admin/PostJob';
import ApplicantsList from './ApplicantsList';
import { setSingleCompany } from '@/redux/companySlice';
import { setAllAppliedJobs } from '@/redux/jobSlice';
import useGetAllCompanies from '@/hooks/useGetAllCompanies';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar } from './ui/avatar';
import AppliedJobTable from './AppliedJobTable';

// Hide scrollbar but keep functionality
const scrollbarStyles = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

const JobsPage = () => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('all');
    const [isPosting, setIsPosting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ jobType: 'all', location: '' });
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [selectedJobData, setSelectedJobData] = useState(null);
    const [showCompanyForm, setShowCompanyForm] = useState(false);
    const [userJobs, setUserJobs] = useState([]);
    const [showApplicants, setShowApplicants] = useState(false);
    const [currentApplicants, setCurrentApplicants] = useState([]);
    const [isLoadingAppliedJobs, setIsLoadingAppliedJobs] = useState(false);
    
    const { allJobs = [] } = useSelector(store => store.job);
    const { companies = [] } = useSelector(store => store.company);
    const { user } = useSelector(store => store.auth);
    const { allAppliedJobs = [] } = useSelector(store => store.job);
    
    // Fetch all companies
    useGetAllCompanies();
    
    // Debug log when applied jobs change
    useEffect(() => {
        console.log('Applied jobs updated:', allAppliedJobs);
    }, [allAppliedJobs]);

    // Handle tab change
    const handleTabChange = (tab) => {
        console.log('Tab changed to:', tab);
        setActiveTab(tab);
        setSelectedJobId(null);
        setSelectedJobData(null);
    };

    // Fetch user's posted jobs when tab changes to 'your-jobs'
    useEffect(() => {
        const fetchUserJobs = async () => {
            if (activeTab === 'your-jobs' && user?._id) {
                try {
                    console.log('🔍 [JobsPage] Fetching user jobs...');
                    const res = await apiClient.get('/job/getadminjobs');
                    console.log('📦 [JobsPage] User jobs response:', res.data);
                    
                    if (res.data.success) {
                        console.log(`✅ [JobsPage] Found ${res.data.jobs?.length || 0} jobs`);
                        setUserJobs(res.data.jobs || []);
                    } else {
                        console.log('ℹ️ [JobsPage] No jobs found or error in response');
                        setUserJobs([]);
                    }
                } catch (error) {
                    console.error('❌ [JobsPage] Error fetching user jobs:', {
                        message: error.message,
                        status: error.response?.status,
                        data: error.response?.data,
                        config: error.config
                    });
                    
                    if (error.response?.status === 404) {
                        // No jobs found is not an error case
                        setUserJobs([]);
                    } else {
                        toast.error(error.response?.data?.message || 'Failed to fetch your jobs');
                        setUserJobs([]);
                    }
                }
            }
        };
        fetchUserJobs();
    }, [activeTab, user?._id]);
    
    // Fetch applied jobs when the tab is active or when user changes
    useEffect(() => {
        console.log('useEffect - activeTab:', activeTab, 'user._id:', user?._id);
        const fetchAppliedJobs = async () => {
            if (activeTab === 'my-jobs' && user?._id) {
                console.log('Fetching applied jobs for user:', user._id);
                setIsLoadingAppliedJobs(true);
                try {
                    // Using the correct endpoint from the backend
                    const res = await apiClient.get('/application/get', { 
                        withCredentials: true
                    });
                    
                    console.log('API Response:', res.data);
                    
                    if (res.data && res.data.success) {
                        console.log('Successfully fetched applications:', res.data.application);
                        dispatch(setAllAppliedJobs(res.data.application || []));
                    } else {
                        console.error('Unexpected API response format:', res.data);
                        toast.error(res.data?.message || 'Failed to load applications');
                    }
                } catch (error) {
                    console.error('Error fetching applied jobs:', {
                        message: error.message,
                        response: error.response?.data,
                        status: error.response?.status,
                        config: error.config
                    });
                    toast.error(error.response?.data?.message || 'Failed to load your job applications');
                } finally {
                    setIsLoadingAppliedJobs(false);
                }
            }
        };
        
        fetchAppliedJobs();
    }, [activeTab, user?._id, dispatch]);
    
    // Fetch applicants for a job
    const fetchApplicants = async (jobId, jobData) => {
        console.log('🔍 [JobsPage] Fetching applicants for job:', { jobId, jobData });
        setShowApplicants(true); // Show loading state immediately
        
        try {
            // Clear previous applicants
            setCurrentApplicants([]);
            
            // Set the selected job data first to show the loading state
            if (jobData) {
                console.log('📝 [JobsPage] Setting selected job data from props:', jobData);
                setSelectedJobData(jobData);
            } else {
                // Try to find the job in userJobs if jobData not provided
                const job = userJobs.find(j => j._id === jobId);
                if (job) {
                    console.log('📝 [JobsPage] Found job in userJobs:', job);
                    setSelectedJobData(job);
                } else {
                    console.error('❌ [JobsPage] Job not found in userJobs:', jobId);
                    toast.error('Job data not found');
                    return;
                }
            }
            
            // Log the job data to see what we're working with
            console.log('🔍 [JobsPage] Job data:', {
                jobId,
                jobData,
                applicationsCount: jobData?.applications?.length,
                applications: jobData?.applications
            });
            
            // The backend route is defined as /api/v1/application/job/:jobId/applicants
            // The base URL already includes /api/v1, so we just need the application part
            let apiEndpoint = `/application/job/${jobId}/applicants`;
            
            // Log the full URL that will be used
            const fullUrl = `${apiClient.defaults.baseURL}${apiEndpoint}`;
            console.log('🌐 [JobsPage] Full API URL:', fullUrl);
            
            console.log('🔍 [JobsPage] Making API request to:', apiEndpoint);
            console.log('🔧 [JobsPage] API Client Config:', {
                baseURL: apiClient.defaults.baseURL,
                withCredentials: apiClient.defaults.withCredentials,
                headers: apiClient.defaults.headers
            });
            
            const res = await apiClient.get(apiEndpoint).catch(error => {
                console.error('❌ [JobsPage] API Request failed:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    config: {
                        url: error.config?.url,
                        method: error.config?.method,
                        headers: error.config?.headers
                    }
                });
                throw error;
            });

            console.log('📦 [JobsPage] API Response for applicants:', {
                status: res.status,
                statusText: res.statusText,
                data: res.data,
                success: res.data?.success,
                applicantsCount: res.data?.applicants?.length,
                applicants: res.data?.applicants ? '[...]' : 'undefined'
            });
            
            if (res.data?.success) {
                let applicants = [];
                
                // Handle different response formats
                if (Array.isArray(res.data.applicants)) {
                    applicants = res.data.applicants;
                    console.log(`✅ [JobsPage] Found ${applicants.length} applicants in response`);
                } else if (res.data.applicants && typeof res.data.applicants === 'object') {
                    // If applicants is an object, convert it to an array
                    applicants = Object.values(res.data.applicants);
                    console.log(`✅ [JobsPage] Converted object to array with ${applicants.length} applicants`);
                } else if (Array.isArray(res.data)) {
                    // If the response is directly an array
                    applicants = res.data;
                    console.log(`✅ [JobsPage] Response is direct array with ${applicants.length} items`);
                } else {
                    console.warn('⚠️ [JobsPage] Unexpected response format:', res.data);
                }
                
                console.log(`✅ [JobsPage] Processed ${applicants.length} applicants:`, applicants);
                setCurrentApplicants(applicants);
                
                // If no applicants, show a message
                if (applicants.length === 0) {
                    console.log('ℹ️ [JobsPage] No applicants found in the response');
                    toast.info('No applicants found for this job');
                }
            } else {
                console.error('❌ [JobsPage] API returned success:false', res.data);
                toast.error(res.data.message || 'Failed to fetch applicants');
            }
        } catch (error) {
            console.error('❌ [JobsPage] Error fetching applicants:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: {
                    url: error.config?.url,
                    method: error.config?.method
                }
            });
            
            // More specific error messages
            if (error.response?.status === 404) {
                toast.error('No applicants found for this job');
                setCurrentApplicants([]); // Clear any previous applicants
            } else {
                toast.error(error.response?.data?.message || 'Failed to fetch applicants');
            }
        }
    };

    const handleRegisterCompany = () => {
        setShowCompanyForm(true);
    };

    const handleJobSelect = (job, showApplicantsView = false) => {
        if (showApplicantsView) {
            // If showing applicants, fetch the applicants for this job
            setSelectedJobId(job._id);
            setSelectedJobData(job);
            setShowCompanyForm(false);
            fetchApplicants(job._id);
        } else {
            // Otherwise, show the job details
            setSelectedJobId(job._id);
            setSelectedJobData(job);
            setShowCompanyForm(false);
            setShowApplicants(false);
        }
    };

    // Handle going back to jobs list from applicants view
    const updateApplicationStatus = async (applicationId, status) => {
        try {
            const res = await apiClient.post(`/application/update-status/${applicationId}`, { status });
            if (res.data.success) {
                toast.success(`Application ${status.toLowerCase()} successfully`);
                // Refresh the applicants list
                if (selectedJobData?._id) {
                    fetchApplicants(selectedJobData._id);
                }
            }
        } catch (error) {
            console.error('Error updating application status:', error);
            toast.error(error.response?.data?.message || 'Failed to update application status');
        }
    };

    const handleBackToJobs = () => {
        setShowApplicants(false);
        setSelectedJobId(null);
        setSelectedJobData(null);
        setCurrentApplicants([]);
    };

    const scrollContainerRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const checkScrollPosition = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 10);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const cardWidth = 320; // Width of each job card (w-80 = 20rem = 320px)
            const gap = 24; // gap-6 = 1.5rem = 24px
            const scrollAmount = cardWidth + gap;
            
            container.scrollBy({
                left: direction === 'right' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollPosition);
            // Initial check
            checkScrollPosition();
            // Check again after content loads
            const timer = setTimeout(checkScrollPosition, 500);
            return () => {
                container.removeEventListener('scroll', checkScrollPosition);
                clearTimeout(timer);
            };
        }
    }, [allJobs]); // Re-run when jobs change

    const [jobForm, setJobForm] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        jobType: "",
        experienceLevel: "",
        position: 0,
        companyId: ""
    });
    
    const [companyForm, setCompanyForm] = useState({
        name: "",
        description: ""
    });

    const handleJobSubmit = async (e) => {
        e.preventDefault();
        
        // Validate that a company is selected
        if (!jobForm.companyId) {
            toast.error("Please select a company");
            return;
        }

        try {
            setIsPosting(true);
            
            // Prepare the data to send
            const jobData = {
                ...jobForm,
                salary: Number(jobForm.salary),
                position: Number(jobForm.position)
            };
            
            const res = await apiClient.post('/job/post', jobData, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            
            if (res.data.success) {
                toast.success(res.data.message);
                // Reset form
                setJobForm({
                    title: "",
                    description: "",
                    requirements: "",
                    salary: "",
                    location: "",
                    jobType: "",
                    experienceLevel: "",
                    position: 0,
                    companyId: ""
                });
            }
        } catch (error) {
            console.error('Error posting job:', error);
            const errorMessage = error.response?.data?.message || 'Failed to post job';
            toast.error(errorMessage);
        } finally {
            setIsPosting(false);
        }
    };

    const handleJobInputChange = (e) => {
        setJobForm({ ...jobForm, [e.target.name]: e.target.value });
    };

    const filteredJobs = allJobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.company?.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesFilters = Object.entries(filters).every(([key, value]) => {
            if (!value || value === 'all') return true;
            return job[key]?.toLowerCase() === value.toLowerCase();
        });
        
        return matchesSearch && matchesFilters;
    });

    const shouldHideApplyButton = selectedJobData && (
        activeTab === 'your-jobs' || 
        selectedJobData.postedBy?._id === user?._id || 
        selectedJobData.postedBy === user?._id
    );

    useEffect(() => {
        if (selectedJobData) {
            console.log('JobsPage - JobDescription props:', {
                jobId: selectedJobData?._id,
                jobTitle: selectedJobData?.title,
                jobPostedBy: selectedJobData?.postedBy,
                jobPostedById: selectedJobData?.postedBy?._id || selectedJobData?.postedBy,
                currentUserId: user?._id,
                activeTab,
                shouldHideApplyButton,
                jobData: selectedJobData
            });
        }
    }, [selectedJobData, user, activeTab]);

    const handleCompanySetupComplete = () => {
        setShowCompanyForm(false);
        toast.success('Company setup completed successfully!');
        // Refresh the companies list
        apiClient.get('/company/get');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <style>{scrollbarStyles}</style>
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar - Always visible on desktop, hidden on mobile when job is selected */}
                    <div className={`${selectedJobId ? 'hidden lg:block lg:w-1/4' : 'w-full lg:w-1/4'} flex-shrink-0 space-y-4`}>
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-4 space-y-4">
                            {/* My Jobs Section */}
                            <div className="space-y-2">
                                <Button 
                                    variant={activeTab === 'my-jobs' ? 'default' : 'outline'} 
                                    className="w-full justify-start gap-2 h-12 text-base font-medium"
                                    onClick={() => handleTabChange('my-jobs')}
                                >
                                    <Bookmark className="w-5 h-5" />
                                    My Jobs
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Button 
                                    variant={activeTab === 'post' ? 'default' : 'outline'} 
                                    className="w-full justify-start gap-2 h-12 text-base font-medium"
                                    onClick={() => setActiveTab('post')}
                                >
                                    <Pencil className="w-5 h-5" />
                                    Post Job for Free
                                </Button>
                                <p className="text-xs text-muted-foreground text-center">
                                    Reach thousands of job seekers
                                </p>
                            </div>
                            
                            <div className="border-t pt-4">
                                <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                                    <Briefcase className="w-4 h-4" />
                                    Manage Jobs
                                </h3>
                                <Button 
                                    variant={activeTab === 'all' ? 'secondary' : 'ghost'} 
                                    className="w-full justify-start"
                                    onClick={() => setActiveTab('all')}
                                >
                                    All Jobs
                                </Button>
                                
                                {/* Posted Jobs Section */}
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium px-4 py-2 text-muted-foreground">
                                        <Briefcase className="inline-block w-4 h-4 mr-2" />
                                        Posted Jobs
                                    </h3>
                                    <Button 
                                        variant={activeTab === 'your-jobs' ? 'secondary' : 'ghost'} 
                                        className="w-full justify-start"
                                        onClick={() => handleTabChange('your-jobs')}
                                    >
                                        <Briefcase className="w-4 h-4 mr-2" />
                                        View Posted Jobs
                                    </Button>
                                </div>
                                
                                {/* Register Company Section */}
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium px-4 py-2 text-muted-foreground">
                                        <Building2 className="inline-block w-4 h-4 mr-2" />
                                        Company
                                    </h3>
                                    <Button 
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={handleRegisterCompany}
                                        disabled={isPosting}
                                    >
                                        {isPosting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Registering...
                                            </>
                                        ) : (
                                            <>
                                                <Building2 className="w-4 h-4 mr-2" />
                                                Register Company
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {activeTab === 'all' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Filters</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Job Type</Label>
                                    <Select 
                                        value={filters.jobType}
                                        onValueChange={(value) => setFilters({...filters, jobType: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="Full-time">Full-time</SelectItem>
                                            <SelectItem value="Part-time">Part-time</SelectItem>
                                            <SelectItem value="Contract">Contract</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Location</Label>
                                    <Input 
                                        placeholder="Filter by location"
                                        value={filters.location}
                                        onChange={(e) => setFilters({...filters, location: e.target.value})}
                                    />
                                </div>
                                <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={() => setFilters({ jobType: 'all', location: '' })}
                                >
                                    Clear Filters
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                    {/* Main Content - Shows job list, job details, post job form, or company registration */}
                    <div className={`w-full ${(selectedJobId || showCompanyForm || activeTab === 'post') ? 'lg:w-3/4' : 'lg:w-2/3'}`}>
                        {activeTab === 'post' ? (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setActiveTab('all')}
                                        className="flex items-center gap-2"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Back to Jobs
                                    </Button>
                                    <h1 className="text-2xl font-bold">Post a New Job</h1>
                                    <div className="w-10"></div> {/* For alignment */}
                                </div>
                                <PostJob onSuccess={() => setActiveTab('your-jobs')} />
                            </div>
                        ) : showCompanyForm ? (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setShowCompanyForm(false)}
                                        className="flex items-center gap-2"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Back to Jobs
                                    </Button>
                                    <h1 className="text-2xl font-bold">Register Your Company</h1>
                                    <div className="w-10"></div> {/* For alignment */}
                                </div>
                                <CompanySetup 
                                    onComplete={handleCompanySetupComplete} 
                                    showBackButton={false}
                                />
                            </div>
                        ) : selectedJobId ? (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => {
                                            setSelectedJobId(null);
                                            setSelectedJobData(null);
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Back to Jobs
                                    </Button>
                                    <h1 className="text-2xl font-bold">Job Details</h1>
                                    <div className="w-10"></div> {/* For alignment */}
                                </div>
                                <JobDescription 
                                    job={selectedJobData} 
                                    hideApplyButton={shouldHideApplyButton}
                                />
                            </div>
                        ) : (
                            !showApplicants && (
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-4 w-full px-4">
                                        {activeTab === 'your-jobs' ? (
                                            userJobs.length > 0 ? (
                                                userJobs.map((job) => (
                                                    <div key={job._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 bg-white flex flex-col w-full">
                                                        <div className="flex-grow">
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <h3 className="font-bold text-lg text-gray-800">{job.title || 'Untitled Position'}</h3>
                                                                    <p className="text-sm text-blue-600 font-medium mt-1">{job.company?.name || 'No Company'}</p>
                                                                    <div className="flex items-center gap-2 mt-2">
                                                                        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">{job.jobType || 'Full-time'}</span>
                                                                        <span className="text-sm text-gray-500">•</span>
                                                                        <span className="text-sm text-gray-600">{job.location || 'Location not specified'}</span>
                                                                    </div>
                                                                    <div className="mt-3 flex items-center">
                                                                        <Briefcase className="h-4 w-4 text-gray-400 mr-1" />
                                                                        <span className="text-sm text-gray-600">
                                                                            {job.applications?.length || 0} {job.applications?.length === 1 ? 'applicant' : 'applicants'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                                    {job.status || 'Active'}
                                                                </div>
                                                            </div>
                                                            
                                                            <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                                                                {job.description || 'No description provided.'}
                                                            </p>
                                                        </div>
                                                        
                                                        <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-gray-100">
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                className="flex-1 min-w-[140px] bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 font-medium"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    console.log('Viewing applicants for job:', job._id);
                                                                    fetchApplicants(job._id, job);
                                                                }}
                                                            >
                                                                <Users className="h-4 w-4 mr-2" />
                                                                {job.applications?.length > 0 ? (
                                                                    <span>View {job.applications.length} {job.applications.length === 1 ? 'Applicant' : 'Applicants'}</span>
                                                                ) : (
                                                                    <span>No Applicants</span>
                                                                )}
                                                            </Button>
                                                            <Button 
                                                                variant="default" 
                                                                size="sm"
                                                                className="flex-1 min-w-[120px]"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleJobSelect(job);
                                                                }}
                                                            >
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View Details
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="w-full text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                                                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                                    <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs posted yet</h3>
                                                    <p className="text-gray-500 mb-4">Get started by posting your first job</p>
                                                    <Button 
                                                        variant="default" 
                                                        onClick={() => setActiveTab('post')}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        <Pencil className="h-4 w-4 mr-2" />
                                                        Post a Job
                                                    </Button>
                                                </div>
                                            )
                                        ) : activeTab === 'my-jobs' ? (
                                            <div className="bg-white rounded-lg shadow-sm border p-4">
                                                <h2 className="text-xl font-semibold mb-4">My Applied Jobs</h2>
                                                {isLoadingAppliedJobs ? (
                                                    <div className="text-center py-8">
                                                        <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
                                                        <p className="text-sm text-gray-500">Loading your applied jobs...</p>
                                                    </div>
                                                ) : allAppliedJobs?.length > 0 ? (
                                                    <AppliedJobTable />
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                                        <h3 className="text-lg font-medium text-gray-900 mb-1">No applied jobs found</h3>
                                                        <p className="text-gray-500">Start applying to jobs to see them here</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            // Regular job listings
                                            filteredJobs.length > 0 ? (
                                                filteredJobs.map((job) => (
                                                    <div key={job._id} className="w-full">
                                                        <Job 
                                                            job={job} 
                                                            onViewDetails={() => handleJobSelect(job)}
                                                            className="w-full"
                                                        />
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="w-full text-center py-8">
                                                    <p className="text-muted-foreground">No jobs found matching your criteria.</p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )
                        )}
                        
                        {/* Applicants List */}
                        {showApplicants && selectedJobData && (
                            <div className="w-full bg-white rounded-lg shadow-sm border p-6">
                                <div className="flex items-center mb-6">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={handleBackToJobs}
                                        className="mr-4"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Jobs
                                    </Button>
                                    <h2 className="text-2xl font-bold">
                                        Applicants for {selectedJobData?.title}
                                    </h2>
                                </div>
                                
                                <ApplicantsList 
                                    applicants={currentApplicants}
                                    onBack={handleBackToJobs}
                                    onUpdateStatus={updateApplicationStatus}
                                />
                            </div>
                        )}
                        
                        {/* Post Job Form */}
                        {activeTab === 'post' && (
                            <Card>
                                <CardContent className="p-6">
                                    <form onSubmit={handleJobSubmit} className="space-y-4">
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Job Title</Label>
                                                <Input 
                                                    type="text" 
                                                    name="title" 
                                                    value={jobForm.title}
                                                    onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                                                    placeholder="Enter job title"
                                                    required
                                                />
                                            </div>
                                            
                                            <div>
                                                <Label>Job Description</Label>
                                                <textarea
                                                    name="description"
                                                    value={jobForm.description}
                                                    onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                                                    placeholder="Enter job description"
                                                    className="w-full p-2 border rounded-md min-h-[100px]"
                                                    required
                                                />
                                            </div>
                                            
                                            <div>
                                                <Label>Requirements</Label>
                                                <textarea
                                                    name="requirements"
                                                    value={jobForm.requirements}
                                                    onChange={(e) => setJobForm({...jobForm, requirements: e.target.value})}
                                                    placeholder="Enter job requirements (one per line)"
                                                    className="w-full p-2 border rounded-md min-h-[60px]"
                                                    required
                                                />
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Salary</Label>
                                                    <Input 
                                                        type="number" 
                                                        name="salary" 
                                                        value={jobForm.salary}
                                                        onChange={(e) => setJobForm({...jobForm, salary: e.target.value})}
                                                        placeholder="Salary"
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <Label>Location</Label>
                                                    <Input 
                                                        type="text" 
                                                        name="location" 
                                                        value={jobForm.location}
                                                        onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
                                                        placeholder="Location"
                                                        required
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <Label>Job Type</Label>
                                                    <Select
                                                        value={jobForm.jobType}
                                                        onValueChange={(value) => setJobForm({...jobForm, jobType: value})}
                                                        required
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select job type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Full-time">Full-time</SelectItem>
                                                            <SelectItem value="Part-time">Part-time</SelectItem>
                                                            <SelectItem value="Contract">Contract</SelectItem>
                                                            <SelectItem value="Internship">Internship</SelectItem>
                                                            <SelectItem value="Temporary">Temporary</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                
                                                <div>
                                                    <Label>Experience Level</Label>
                                                    <Select
                                                        value={jobForm.experienceLevel}
                                                        onValueChange={(value) => setJobForm({...jobForm, experienceLevel: value})}
                                                        required
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select experience level" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Entry Level">Entry Level</SelectItem>
                                                            <SelectItem value="Mid Level">Mid Level</SelectItem>
                                                            <SelectItem value="Senior Level">Senior Level</SelectItem>
                                                            <SelectItem value="Executive">Executive</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                
                                                <div>
                                                    <Label>Number of Positions</Label>
                                                    <Input 
                                                        type="number" 
                                                        name="position" 
                                                        value={jobForm.position}
                                                        onChange={(e) => setJobForm({...jobForm, position: e.target.value})}
                                                        placeholder="Number of positions"
                                                        min="1"
                                                        required
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <Label>Company</Label>
                                                    {companies.length > 0 ? (
                                                        <Select
                                                            value={jobForm.companyId}
                                                            onValueChange={(value) => setJobForm({...jobForm, companyId: value})}
                                                            required
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a company" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {companies.map((company) => (
                                                                    <SelectItem key={company._id} value={company._id}>
                                                                        {company.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <div className="text-sm text-red-500 p-2 bg-red-50 rounded">
                                                            No companies found. Please register a company first.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex justify-end space-x-3 pt-4">
                                                <Button 
                                                    type="button" 
                                                    variant="outline"
                                                    onClick={() => setActiveTab('all')}
                                                    disabled={isPosting}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit" 
                                                    disabled={isPosting || companies.length === 0}
                                                >
                                                    {isPosting ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Posting...
                                                        </>
                                                    ) : 'Post Job'}
                                                </Button>
                                            </div>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobsPage;
