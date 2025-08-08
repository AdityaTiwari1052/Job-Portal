import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { Loader2, ChevronLeft, ChevronRight, Pencil, Briefcase, Building2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/utils/apiClient';
import Job from './Job';
import JobDescription from './JobDescription';
import CompanyCreate from './admin/CompanyCreate';
import CompanySetup from './admin/CompanySetup';
import PostJob from './admin/PostJob';
import ApplicantsList from './ApplicantsList';
import { setSingleCompany } from '@/redux/companySlice';
import useGetAllCompanies from '@/hooks/useGetAllCompanies';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Avatar } from './ui/avatar';

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
    const [companyName, setCompanyName] = useState('');
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [selectedJobData, setSelectedJobData] = useState(null);
    const [showCompanyForm, setShowCompanyForm] = useState(false);
    const [newCompanyId, setNewCompanyId] = useState(null);
    const [userJobs, setUserJobs] = useState([]);
    const [showApplicants, setShowApplicants] = useState(false);
    const [currentApplicants, setCurrentApplicants] = useState([]);
    
    const { allJobs = [] } = useSelector(store => store.job);
    const { companies = [] } = useSelector(store => store.company);
    const { user } = useSelector(store => store.auth);
    
    // Fetch all companies
    useGetAllCompanies();
    
    // Fetch user's posted jobs when tab changes to 'your-jobs'
    useEffect(() => {
        const fetchUserJobs = async () => {
            if (activeTab === 'your-jobs' && user?._id) {
                try {
                    const res = await apiClient.get('/api/v1/job/getadminjobs');
                    if (res.data.success) {
                        setUserJobs(res.data.jobs);
                    } else {
                        // If no jobs found, set empty array instead of showing error
                        setUserJobs([]);
                    }
                } catch (error) {
                    console.error('Error fetching user jobs:', error);
                    // If 404 (no jobs found), set empty array instead of showing error
                    if (error.response?.status === 404) {
                        setUserJobs([]);
                    } else {
                        toast.error('Failed to fetch your jobs');
                    }
                }
            }
        };
        fetchUserJobs();
    }, [activeTab, user?._id]);
    
    // Fetch applicants for a job
    const fetchApplicants = async (jobId, jobData) => {
        console.log('Fetching applicants for job:', { jobId, jobData });
        try {
            const res = await apiClient.get(`/api/v1/applications/job/${jobId}`);
            console.log('API Response:', res.data);
            
            if (res.data.success) {
                console.log('Setting applicants:', res.data.applications);
                setCurrentApplicants(res.data.applications || []);
                setShowApplicants(true);
                
                // Set the selected job data
                if (jobData) {
                    console.log('Setting selected job data from props:', jobData);
                    setSelectedJobData(jobData);
                } else {
                    // Fallback to finding the job in userJobs if jobData not provided
                    const job = userJobs.find(j => j._id === jobId);
                    if (job) {
                        console.log('Found job in userJobs:', job);
                        setSelectedJobData(job);
                    } else {
                        console.error('Job not found in userJobs:', jobId);
                    }
                }
            } else {
                console.error('API returned success:false', res.data);
            }
        } catch (error) {
            console.error('Error fetching applicants:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            });
            toast.error(error.response?.data?.message || 'Failed to fetch applicants');
        }
    };

    const handleRegisterCompany = () => {
        setShowCompanyForm(true);
        setSelectedJobId(null);
        setSelectedJobData(null);
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
            const res = await apiClient.post(`/api/v1/application/update-status/${applicationId}`, { status });
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
            
            const res = await apiClient.post('/api/v1/job/post', jobData, {
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



    return (
        <div className="min-h-screen bg-gray-50">
            <style>{scrollbarStyles}</style>
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar - Always visible on desktop, hidden on mobile when job is selected */}
                    <div className={`${selectedJobId ? 'hidden lg:block lg:w-1/4' : 'w-full lg:w-1/4'} flex-shrink-0 space-y-4`}>
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-4 space-y-4">
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
                                
                                {/* Your Jobs Section */}
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium px-4 py-2 text-muted-foreground">
                                        <Briefcase className="inline-block w-4 h-4 mr-2" />
                                        Your Jobs
                                    </h3>
                                    <Button 
                                        variant={activeTab === 'your-jobs' ? 'secondary' : 'ghost'} 
                                        className="w-full justify-start"
                                        onClick={() => setActiveTab('your-jobs')}
                                    >
                                        <Briefcase className="w-4 h-4 mr-2" />
                                        View Your Jobs
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
                                        onClick={() => {
                                            setShowCompanyForm(false);
                                            setNewCompanyId(null);
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Back to Jobs
                                    </Button>
                                    <h1 className="text-2xl font-bold">Register Your Company</h1>
                                    <div className="w-10"></div> {/* For alignment */}
                                </div>
                                {!newCompanyId ? (
                                    <CompanyCreate onCompanyCreated={(companyId) => {
                                        setNewCompanyId(companyId);
                                        // Refresh companies list
                                        apiClient.get('/api/v1/company/all');
                                    }} />
                                ) : (
                                    <CompanySetup id={newCompanyId} onComplete={() => {
                                        setShowCompanyForm(false);
                                        setNewCompanyId(null);
                                        toast.success('Company setup completed successfully!');
                                    }} />
                                )}
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
                                <JobDescription job={selectedJobData} />
                            </div>
                        ) : (
                            !showApplicants && (
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-4 w-full px-4">
                                        {activeTab === 'your-jobs' ? (
                                            userJobs.length > 0 ? (
                                                userJobs.map((job) => (
                                                    <div key={job._id} className="border rounded-lg p-6 hover:bg-muted/50 transition-colors h-full flex flex-col w-full">
                                                        <div className="flex-grow">
                                                            <h3 className="font-medium text-lg">{job.title}</h3>
                                                            <p className="text-sm text-muted-foreground font-medium mt-1">{job.company?.name}</p>
                                                            <p className="text-sm text-muted-foreground">{job.location}</p>
                                                            <p className="text-sm text-muted-foreground mt-2">
                                                                {job.applications?.length || 0} applicants
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t">
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                className="flex-1 min-w-[120px]"
                                                                onClick={(e) => {
                                                                    console.log('View Applicants clicked for job:', job._id);
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    fetchApplicants(job._id, job);
                                                                }}
                                                            >
                                                                View Applicants
                                                            </Button>
                                                            <Button 
                                                                variant="default" 
                                                                size="sm"
                                                                className="flex-1 min-w-[120px]"
                                                                onClick={() => handleJobSelect(job)}
                                                            >
                                                                View Details
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="w-full text-center py-8">
                                                    <p className="text-muted-foreground">You haven't posted any jobs yet.</p>
                                                </div>
                                            )
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
                        {showApplicants && (
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
                                
                                {currentApplicants.length > 0 ? (
                                    <div className="border rounded-md
                                    ">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[150px]">Profile</TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Applied On</TableHead>
                                                    <TableHead>Resume</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {currentApplicants.map((application) => (
                                                    <TableRow key={application._id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {application.applicant?.profile?.profilePhoto ? (
                                                                    <img 
                                                                        src={application.applicant.profile.profilePhoto} 
                                                                        alt="Profile" 
                                                                        className="w-10 h-10 rounded-full object-cover" 
                                                                    />
                                                                ) : (
                                                                    <Avatar className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full">
                                                                        {(application.applicant?.profile?.fullname || 'U').charAt(0).toUpperCase()}
                                                                    </Avatar>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {application.applicant?.profile?.fullname || 'Anonymous'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {application.applicant?.email || 'N/A'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(application.createdAt).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            {application.applicant?.profile?.resume ? (
                                                                <a 
                                                                    href={application.applicant.profile.resume} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:underline text-sm"
                                                                >
                                                                    View Resume
                                                                </a>
                                                            ) : (
                                                                <span className="text-muted-foreground text-sm">No resume</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <CheckCircle2 
                                                                    className="h-5 w-5 text-green-500 cursor-pointer hover:text-green-600" 
                                                                    onClick={() => updateApplicationStatus(application._id, 'Accepted')}
                                                                />
                                                                <XCircle 
                                                                    className="h-5 w-5 text-red-500 cursor-pointer hover:text-red-600" 
                                                                    onClick={() => updateApplicationStatus(application._id, 'Rejected')}
                                                                />
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border rounded-md">
                                        <p className="text-muted-foreground">No applicants found for this job.</p>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Post Job Form */}
                        {activeTab === 'post-job' && (
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
