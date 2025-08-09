import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { Pencil, Briefcase, Building2, X, CheckCircle2, XCircle, Users, Eye, ChevronLeft, Loader2, Bookmark, DollarSign, Clock, MapPin, AlertCircle, Plus, ArrowLeft } from 'lucide-react';
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
    const [userCompanies, setUserCompanies] = useState([]);
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
    
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

    // Fetch user's companies when component mounts
    useEffect(() => {
        const fetchUserCompanies = async () => {
            if (user?._id) {
                setIsLoadingCompanies(true);
                try {
                    const res = await apiClient.get('/company/get', { withCredentials: true });
                    if (res.data?.success) {
                        setUserCompanies(res.data.companies || []);
                    }
                } catch (error) {
                    console.error('Error fetching user companies:', error);
                    toast.error('Failed to load your companies');
                } finally {
                    setIsLoadingCompanies(false);
                }
            }
        };
        
        fetchUserCompanies();
    }, [user?._id]);

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
                        config: {
                            url: error.config?.url,
                            method: error.config?.method,
                            headers: error.config?.headers
                        }
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
        apiClient.get('/company/get')
            .then(res => {
                if (res.data?.success) {
                    const companies = res.data.companies || [];
                    setUserCompanies(companies);
                    
                    // If there's only one company, select it automatically
                    if (companies.length === 1) {
                        setJobForm(prev => ({
                            ...prev,
                            companyId: companies[0]._id
                        }));
                    }
                }
            })
            .catch(error => {
                console.error('Error refreshing companies:', error);
                toast.error('Failed to refresh companies list');
            });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <style>{scrollbarStyles}</style>
            <div className="container mx-auto px-4 py-4 sm:py-8">
                {/* Mobile Tabs - Horizontal, only on mobile */}
                <div className="lg:hidden mb-4 overflow-x-auto pb-2">
                    <div className="flex space-x-2 w-max min-w-full">
                        <Button 
                            variant={activeTab === 'my-jobs' ? 'default' : 'outline'} 
                            className="whitespace-nowrap h-10 text-sm px-3"
                            onClick={() => handleTabChange('my-jobs')}
                        >
                            <Bookmark className="w-4 h-4 mr-1" />
                            My Jobs
                        </Button>
                        <Button 
                            variant={activeTab === 'all' ? 'default' : 'outline'} 
                            className="whitespace-nowrap h-10 text-sm px-3"
                            onClick={() => handleTabChange('all')}
                        >
                            All Jobs
                        </Button>
                        <Button 
                            variant={activeTab === 'your-jobs' ? 'default' : 'outline'} 
                            className="whitespace-nowrap h-10 text-sm px-3"
                            onClick={() => handleTabChange('your-jobs')}
                        >
                            Posted Jobs
                        </Button>
                        <Button 
                            variant={activeTab === 'post' ? 'default' : 'outline'} 
                            className="whitespace-nowrap h-10 text-sm px-3"
                            onClick={() => handleTabChange('post')}
                        >
                            <Pencil className="w-4 h-4 mr-1" />
                            Post Job
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Desktop Vertical Tabs - Hidden on mobile */}
                    <div className="hidden lg:block w-56 flex-shrink-0">
                        <div className="space-y-1">
                            {[
                                { id: 'all', label: 'All Jobs', icon: null },
                                { id: 'your-jobs', label: 'Posted Jobs', icon: <Briefcase className="w-4 h-4 mr-2" /> },
                                { id: 'my-jobs', label: 'My Applications', icon: <Bookmark className="w-4 h-4 mr-2" /> },
                                { id: 'post', label: 'Post a Job', icon: <Pencil className="w-4 h-4 mr-2" /> },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {(activeTab === 'all' || activeTab === 'your-jobs') && (
                            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
                                {activeTab === 'all' && (
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <h1 className="text-2xl font-bold hidden sm:block">All Jobs</h1>
                                            <div className="w-full sm:w-64">
                                                <Input 
                                                    placeholder="Search jobs..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* Mobile Search - Only show on mobile */}
                                        <div className="sm:hidden mb-6">
                                            <h1 className="text-2xl font-bold mb-4">All Jobs</h1>
                                            <div className="w-full mb-4">
                                                <Input 
                                                    placeholder="Search jobs..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* Jobs List */}
                                        <div className="space-y-4 mt-6">
                                            {filteredJobs.length > 0 ? (
                                                filteredJobs.map((job) => {
                                                    const jobData = {
                                                        ...job,
                                                        company: job.company || {},
                                                        description: job.description || "No description provided"
                                                    };
                                                    
                                                    return (
                                                        <Job 
                                                            key={job._id} 
                                                            job={jobData}
                                                            showApplicantCount={activeTab === 'your-jobs'}
                                                            showViewApplicants={activeTab === 'your-jobs'}
                                                            onViewApplicants={() => {
                                                                setSelectedJobId(job._id);
                                                                setSelectedJobData(job);
                                                                setShowApplicants(true);
                                                                fetchApplicants(job._id);
                                                            }}
                                                            isSelected={selectedJobId === job._id}
                                                            onClick={() => {
                                                                setSelectedJobId(job._id);
                                                                setSelectedJobData(job);
                                                                setShowApplicants(false);
                                                            }}
                                                        />
                                                    );
                                                })
                                            ) : (
                                                <div className="text-center py-8">
                                                    <p className="text-muted-foreground">No jobs found</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'your-jobs' && (
                                    <div className="space-y-4">
                                        <h1 className="text-2xl font-bold mb-6">Your Posted Jobs</h1>
                                        {userJobs.length > 0 ? (
                                            <div className="space-y-4">
                                                {userJobs.map((job) => (
                                                    <Job 
                                                        key={job._id} 
                                                        job={job}
                                                        showApplicantCount
                                                        showViewApplicants={true}
                                                        onViewApplicants={() => {
                                                            setSelectedJobId(job._id);
                                                            setSelectedJobData(job);
                                                            setShowApplicants(true);
                                                            fetchApplicants(job._id);
                                                        }}
                                                        isSelected={selectedJobId === job._id}
                                                        onClick={() => {
                                                            setSelectedJobId(job._id);
                                                            setSelectedJobData(job);
                                                            setShowApplicants(false);
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-muted-foreground">You haven't posted any jobs yet</p>
                                                <Button 
                                                    className="mt-4" 
                                                    onClick={() => setActiveTab('post')}
                                                >
                                                    Post a Job
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'my-jobs' && (
                            <div className="space-y-4">
                                <h1 className="text-2xl font-bold mb-6">My Applications</h1>
                                {allAppliedJobs?.length > 0 ? (
                                    <AppliedJobTable jobs={allAppliedJobs} />
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground">You haven't applied to any jobs yet</p>
                                        <Button 
                                            className="mt-4" 
                                            onClick={() => setActiveTab('all')}
                                        >
                                            Browse Jobs
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Side - Job Details, Post Job Form, or Applicants List */}
                    <div className={`w-full ${(selectedJobId || activeTab === 'post' || showApplicants) ? 'lg:block' : 'lg:hidden'}`}>
                        {/* Show Post Job Form when activeTab is 'post' */}
                        {activeTab === 'post' && (
                            <div className="sticky top-6">
                                {userCompanies.length > 0 ? (
                                    <PostJob 
                                        companies={userCompanies}
                                        onJobCreated={(newJob) => {
                                            // Add the new job to the user's jobs list
                                            setUserJobs(prev => [newJob, ...prev]);
                                            // Switch to the 'your-jobs' tab
                                            setActiveTab('your-jobs');
                                            // Select the newly created job
                                            setSelectedJobId(newJob._id);
                                            setSelectedJobData(newJob);
                                            setShowApplicants(false);
                                            // Show success message
                                            toast.success('Job posted successfully!');
                                        }}
                                    />
                                ) : (
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="text-center">
                                            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-lg font-medium text-gray-900">No company registered</h3>
                                            <p className="mt-1 text-sm text-gray-500">You need to register a company before posting a job.</p>
                                            <div className="mt-6">
                                                <Button 
                                                    onClick={() => window.location.href = '/admin/companies/create'}
                                                    className="inline-flex items-center"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Register Company
                                                </Button>
                                            </div>
                                            <div className="mt-4">
                                                <Button 
                                                    variant="outline"
                                                    onClick={() => setActiveTab('all')}
                                                >
                                                    Back to Jobs
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Show Applicants List when showApplicants is true */}
                        {showApplicants && selectedJobData && (
                            <div className="sticky top-6">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                                        <div className="flex items-center">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="mr-4 text-white hover:bg-white/20"
                                                onClick={() => setShowApplicants(false)}
                                            >
                                                <ArrowLeft className="h-5 w-5" />
                                            </Button>
                                            <div>
                                                <h2 className="text-xl font-bold">Applicants for {selectedJobData.title}</h2>
                                                <p className="text-blue-100 text-sm mt-1">
                                                    {currentApplicants.length} {currentApplicants.length === 1 ? 'applicant' : 'applicants'} found
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <ApplicantsList 
                                            applicants={currentApplicants}
                                            onBack={() => setShowApplicants(false)}
                                            onUpdateStatus={updateApplicationStatus}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Show Job Details when a job is selected and not showing applicants */}
                        {selectedJobId && selectedJobData && !showApplicants && activeTab !== 'post' && (
                            <div className="sticky top-6">
                                <JobDescription 
                                    jobId={selectedJobId}
                                    jobData={selectedJobData}
                                    onBack={() => {
                                        setSelectedJobId(null);
                                        setSelectedJobData(null);
                                    }}
                                    hideApplyButton={shouldHideApplyButton}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobsPage;
