import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Download, ArrowLeft, CheckCircle2, XCircle, Mail, Phone, FileText, User, Briefcase, Clock } from 'lucide-react';
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

const StatusBadge = ({ status }) => {
  const statusConfig = {
    'Pending': { bg: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-3 h-3 mr-1" /> },
    'accepted': { bg: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-3 h-3 mr-1" /> },
    'Rejected': { bg: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3 mr-1" /> },
    'Interview': { bg: 'bg-blue-100 text-blue-800', icon: <Briefcase className="w-3 h-3 mr-1" /> },
  }[status] || { bg: 'bg-gray-100 text-gray-800', icon: null };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg}`}>
      {statusConfig.icon}
      {status}
    </span>
  );
};

const ApplicantCard = ({ applicant, onUpdateStatus, onDownloadResume }) => {
  const { _id, applicant: user, status, appliedAt, resume, coverLetter } = applicant;
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-4 sm:p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16 border-2 border-blue-100">
            {user.profilePhoto ? (
              <AvatarImage src={user.profilePhoto} alt={user.name} />
            ) : (
              <AvatarFallback className="bg-blue-50 text-blue-600 text-lg">
                {getInitials(user.name)}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{user.name}</h3>
              <div className="ml-2">
                <StatusBadge status={status} />
              </div>
            </div>
            
            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-4">
              <div className="flex items-center text-sm text-gray-500">
                <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                <span className="truncate">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
            
            {user.skills && user.skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {user.skills.slice(0, 5).map((skill, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {skill}
                  </span>
                ))}
                {user.skills.length > 5 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    +{user.skills.length - 5} more
                  </span>
                )}
              </div>
            )}
            
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full sm:w-auto justify-center"
                onClick={() => onDownloadResume(resume, user.resumeOriginalName)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download CV
              </Button>
              
              <div className="flex space-x-2">
                <Button 
                  variant={status === 'accepted' ? 'default' : 'outline'} 
                  size="sm" 
                  className={`w-full mb-2 ${status === 'accepted' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                  onClick={() => onUpdateStatus(_id, 'accepted')}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Accept
                </Button>
                <Button 
                  variant={status === 'Rejected' ? 'destructive' : 'outline'} 
                  size="sm" 
                  className="flex-1 sm:flex-none"
                  onClick={() => onUpdateStatus(_id, 'Rejected')}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
              </div>
            </div>
            
            {coverLetter && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FileText className="w-4 h-4 mr-1.5 text-gray-400" />
                  Cover Letter
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2">{coverLetter}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between items-center">
        <span>Applied {format(new Date(appliedAt), 'MMM d, yyyy')}</span>
        <span className="flex items-center">
          <User className="w-3 h-3 mr-1" />
          {user.experience || 'No'} experience
        </span>
      </div>
    </div>
  );
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
          phone: applicant.phone || profile.phone,
          profilePhoto: profile.profilePhoto,
          skills: Array.isArray(profile.skills) ? profile.skills : [],
          bio: profile.bio,
          experience: profile.experience,
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
      <div className="text-center p-8">
        <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
          <User className="w-full h-full" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No applicants yet</h3>
        <p className="text-gray-500 mb-6">There are no applicants for this job posting at the moment.</p>
        <Button 
          variant="outline" 
          onClick={onBack}
          className="inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Applicants</h2>
          <p className="text-sm text-gray-500 mt-1">
            {safeApplicants.length} {safeApplicants.length === 1 ? 'applicant' : 'applicants'} found
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {safeApplicants.map((applicant) => (
          <ApplicantCard 
            key={applicant._id}
            applicant={applicant}
            onUpdateStatus={handleStatusUpdate}
            onDownloadResume={handleDownloadResume}
          />
        ))}
      </div>
    </div>
  );
};

export default ApplicantsList;
