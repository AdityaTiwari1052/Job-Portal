import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';
import { Trash2, Download, FileText, Upload, X } from 'lucide-react';
import api from '@/utils/api';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { useDispatch, useSelector } from 'react-redux';
import { setAllAppliedJobs } from '@/redux/jobSlice';

const AppliedJobTable = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userResume, setUserResume] = useState(null);
    const [userResumeName, setUserResumeName] = useState('');
    const [resumeNameInput, setResumeNameInput] = useState('');
    const dispatch = useDispatch();
    const { allAppliedJobs } = useSelector(store => store.job || { allAppliedJobs: [] });

    useEffect(() => {
        const fetchAppliedJobs = async () => {
            try {
                setIsLoading(true);
                setError(null);
                

                console.log('API base URL:', api.defaults.baseURL);
                console.log('Full request URL will be:', `${api.defaults.baseURL}/user/me/applications`);

                // Get Clerk session token for manual authentication
                const token = await window.Clerk?.session?.getToken();
                console.log('Clerk token for request:', token ? 'Token present' : 'No token');

                const response = await api.get('/user/me/applications', {
                    headers: token ? {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } : {
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Request made to:', response.config.url);
                console.log('API Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: response.data
                });
                
                if (response?.data?.success) {
                    const applications = response.data.application || [];
                    console.log('Applications data:', applications);
                    dispatch(setAllAppliedJobs(Array.isArray(applications) ? applications : []));
                } else {
                    console.warn('Unexpected response format:', response.data);
                    throw new Error(response?.data?.message || 'Invalid response format from server');
                }
            } catch (error) {
                console.error('Error details:', {
                    name: error.name,
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                
                let errorMessage = 'Failed to fetch applied jobs';
                if (error.response && error.response.data) {
                    // Server responded with a status code outside 2xx
                    errorMessage = error.response.data?.message ||
                                  error.response.statusText ||
                                  `Server error: ${error.response.status}`;
                } else if (error.request) {
                    // Request was made but no response received
                    errorMessage = 'No response from server. Please check your connection.';
                } else if (error.message && error.message.includes('No authentication token')) {
                    errorMessage = 'Please log in to view your applications';
                }
                
                setError(errorMessage);

                toast.error(errorMessage);

                // If unauthorized, redirect to login
                if (error.response && error.response.status === 401) {
                    window.location.href = '/sign-in';
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppliedJobs();
        fetchUserResume();
    }, [dispatch]);

    const fetchUserResume = async () => {
        try {
            const token = await window.Clerk?.session?.getToken();
            const response = await api.get('/user/me', {
                headers: token ? {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                } : {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data?.success && response.data?.data?.user) {
                const user = response.data.data.user;
                setUserResume(user.resume);
                setUserResumeName(user.resumeName || '');
                console.log('User resume data:', { resume: user.resume, resumeName: user.resumeName });
            }
        } catch (error) {
            console.error('Error fetching user resume:', error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setResumeFile(file);
            // Auto-populate resume name from filename
            const fileName = file.name.replace('.pdf', '').replace(/[_-]/g, ' ');
            setResumeNameInput(fileName);
        } else {
            toast.error('Please upload a PDF file');
        }
    };

    const handleUploadResume = async () => {
        if (!resumeFile) {
            toast.error('Please select a resume file to upload');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('resumeName', resumeNameInput || resumeFile.name);

        try {
            // Get Clerk session token for resume upload
            const token = await window.Clerk?.session?.getToken();

            const response = await api.put(
                `${APPLICATION_API_END_POINT}/resume`,
                formData,
                {
                    headers: token ? {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    } : {
                        'Content-Type': 'multipart/form-data'
                    },
                    timeout: 30000
                }
            );

            toast.success(response.data?.message || 'Resume uploaded successfully');
            setResumeFile(null);
            setResumeNameInput('');
            document.getElementById('resume-upload-modal')?.value && (document.getElementById('resume-upload-modal').value = '');
            const user = response.data?.data?.user;
            setUserResume(user?.resume || null);
            setUserResumeName(user?.resumeName || '');
            console.log('Resume uploaded successfully:', { resume: user?.resume, resumeName: user?.resumeName });
            setIsModalOpen(false);
        } catch (error) {
            console.error('Upload error:', error);

            if (error.response && error.response.status === 401) {
                toast.error('Session expired. Please log in again.');
                if (window.Clerk?.signOut) {
                    await window.Clerk.signOut();
                    window.location.href = '/';
                }
            } else if (error.code === 'ECONNABORTED') {
                toast.error('Request timed out. Please try again.');
            } else {
                toast.error((error.response && error.response.data?.message) || 'Failed to upload resume');
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteResume = async () => {
        try {
            // Get Clerk session token for resume deletion
            const token = await window.Clerk?.session?.getToken();

            const response = await api.delete(
                `${APPLICATION_API_END_POINT}/resume`,
                {
                    headers: token ? {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } : {
                        'Content-Type': 'application/json'
                    }
                }
            );

            toast.success(response.data?.message || 'Resume deleted successfully');
            setUserResume(null);
            setUserResumeName('');
            setIsModalOpen(false);
        } catch (error) {
            console.error('Delete error:', error);

            if (error.response && error.response.status === 401) {
                toast.error('Session expired. Please log in again.');
                if (window.Clerk?.signOut) {
                    await window.Clerk.signOut();
                    window.location.href = '/';
                }
            } else {
                toast.error((error.response && error.response.data?.message) || 'Failed to delete resume');
            }
        }
    };

    const getResumeDisplayName = (application) => {
        // If the application has a custom resume name from the user profile, use it
        if (application.userResumeName) {
            return application.userResumeName;
        }
        // Otherwise, try to extract from the resume URL
        if (application.resume) {
            try {
                const urlParts = application.resume.split('/');
                const fileName = urlParts[urlParts.length - 1];
                // Remove the file extension and clean up the name
                return fileName.split('.')[0].replace(/[_-]/g, ' ');
            } catch (error) {
                return 'Resume';
            }
        }
        return 'No resume';
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Resume Management Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-medium">Resume Management</h2>
                        {userResume ? (
                            <div className="flex items-center gap-2 mt-2">
                                <FileText className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-gray-600">{userResumeName || 'My Resume'}</span>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 mt-2">No resume uploaded</p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {!userResume ? (
                            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        className="flex items-center gap-2"
                                        onClick={() => {
                                            setResumeNameInput('');
                                            setResumeFile(null);
                                        }}
                                    >
                                        <Upload className="w-4 h-4" />
                                        Upload Resume
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Upload Resume</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="resume-upload-modal" className="text-sm font-medium">
                                                Resume File
                                            </Label>
                                            <Input
                                                id="resume-upload-modal"
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleFileChange}
                                                className="cursor-pointer mt-1"
                                            />
                                            <p className="mt-1 text-sm text-gray-500">Upload your resume in PDF format</p>
                                            {resumeNameInput && (
                                                <p className="mt-2 text-sm text-blue-600">
                                                    Resume name: <strong>{resumeNameInput}</strong>
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                onClick={() => setIsModalOpen(false)}
                                                variant="outline"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleUploadResume}
                                                disabled={!resumeFile || isUploading}
                                            >
                                                {isUploading ? 'Uploading...' : 'Upload Resume'}
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        ) : (
                            <Button
                                onClick={handleDeleteResume}
                                variant="destructive"
                                className="flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Resume
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Jobs Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableCaption>A list of your applied jobs</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Job Role</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Resume</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allAppliedJobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4">
                                    You haven't applied to any jobs yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            allAppliedJobs.map((appliedJob) => (
                                <TableRow key={appliedJob._id}>
                                    <TableCell>
                                        {appliedJob?.createdAt
                                            ? new Date(appliedJob.createdAt).toLocaleDateString()
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell>{appliedJob.job?.title || 'N/A'}</TableCell>
                                    <TableCell>{appliedJob.job?.companyName || appliedJob.job?.company?.name || 'N/A'}</TableCell>
                                    <TableCell>
                                        {appliedJob.resume ? (
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-blue-500" />
                                                <a
                                                    href={appliedJob.resume}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                                                >
                                                    {userResumeName || getResumeDisplayName({ resume: appliedJob.resume })}
                                                </a>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500 text-sm">No resume</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge
                                            className={`${!appliedJob.status || appliedJob.status === 'pending'
                                                ? 'bg-gray-400'
                                                : appliedJob.status.toLowerCase() === 'rejected'
                                                    ? 'bg-red-400'
                                                    : 'bg-green-400'}`}
                                        >
                                            {(appliedJob.status || 'PENDING').toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default AppliedJobTable;