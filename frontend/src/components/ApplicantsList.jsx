import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Download, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'U';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const ApplicantsList = ({ applicants = [], onBack, onUpdateStatus }) => {
    // Normalize the applicants data from the backend response
    const safeApplicants = (() => {
        if (!applicants) return [];
        
        // Handle different response formats
        const data = Array.isArray(applicants) ? applicants : (applicants.applicants || []);
        
        return data.map(app => {
            // Extract nested properties with proper fallbacks
            const applicant = app.applicant || {};
            const profile = applicant.profile || {};
            
            return {
                _id: app._id,
                applicant: {
                    _id: applicant._id,
                    name: applicant.name || applicant.fullname || 'Anonymous',
                    email: applicant.email || 'No email provided',
                    profilePhoto: profile.profilePhoto,
                    skills: Array.isArray(profile.skills) ? profile.skills : [],
                    bio: profile.bio,
                },
                resume: profile.resume || app.resume,
                resumeOriginalName: profile.resumeOriginalName || 'resume.pdf',
                appliedAt: app.appliedAt || app.createdAt,
                status: app.status || 'Pending',
                coverLetter: app.coverLetter
            };
        });
    })();
    
    const handleDownloadResume = (resumeUrl, resumeName = 'resume.pdf') => {
        if (resumeUrl) {
            // Create a temporary anchor element
            const link = document.createElement('a');
            link.href = resumeUrl;
            link.download = resumeName.endsWith('.pdf') ? resumeName : `${resumeName}.pdf`;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('No resume available for this applicant');
        }
    };

    const handleStatusUpdate = async (applicationId, status) => {
        try {
            if (onUpdateStatus) {
                await onUpdateStatus(applicationId, status);
            }
        } catch (error) {
            console.error('Error updating application status:', error);
        }
    };

    if (safeApplicants.length === 0) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <Button 
                    variant="outline" 
                    onClick={onBack}
                    className="mb-6 flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Jobs
                </Button>
                <div className="bg-white rounded-lg border p-8 text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Applicants Yet</h3>
                    <p className="text-gray-500">There are no applicants for this job posting at the moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <Button 
                variant="outline" 
                onClick={onBack}
                className="mb-6 flex items-center gap-2"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Jobs
            </Button>
            
            <div className="bg-white rounded-lg border overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Job Applicants</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {safeApplicants.length} {safeApplicants.length === 1 ? 'applicant' : 'applicants'} found
                    </p>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Applicant
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Applied On
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Resume
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {safeApplicants.map((app) => (
                                <tr key={app._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={app.applicant.profilePhoto} alt={app.applicant.name} />
                                                    <AvatarFallback className="bg-blue-100 text-blue-600">
                                                        {getInitials(app.applicant.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {app.applicant.name}
                                                </div>
                                                {app.applicant.skills?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {app.applicant.skills.slice(0, 2).map((skill, idx) => (
                                                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                        {app.applicant.skills.length > 2 && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                                                +{app.applicant.skills.length - 2} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {app.applicant.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {app.appliedAt ? format(new Date(app.appliedAt), 'MMM d, yyyy') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {app.resume ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDownloadResume(app.resume, app.resumeOriginalName)}
                                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                            >
                                                <Download className="w-4 h-4 mr-1" />
                                                Download
                                            </Button>
                                        ) : (
                                            <span className="text-gray-400 text-sm">No resume</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                            app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {app.status?.charAt(0).toUpperCase() + app.status?.slice(1) || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleStatusUpdate(app._id, 'accepted')}
                                                className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50"
                                                title="Accept"
                                            >
                                                <CheckCircle2 className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(app._id, 'rejected')}
                                                className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                                                title="Reject"
                                            >
                                                <XCircle className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ApplicantsList;
