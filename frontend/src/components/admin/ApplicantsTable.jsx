import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { Button } from '../ui/button';
import { Check, X, Download, User, Mail, Phone, Calendar as CalendarIcon, Briefcase, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { setAllApplicants } from '../../redux/applicationSlice';
import api from '../../utils/api';

const selectApplicants = createSelector(
  (state) => state.application.applicants,
  (applicants) => (Array.isArray(applicants) ? applicants : [])
);

const ApplicantsTable = () => {
  const dispatch = useDispatch();
  const applicants = useSelector(selectApplicants);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApplicants = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get the recruiter token
      const token = localStorage.getItem('recruiterToken');
      console.log('Recruiter Token:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('Fetching applicants...');
      // Use the existing user/me/applicants endpoint
      const response = await api.get('/user/me/applicants', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data?.success) {
        const applications = response.data.data?.applications || [];
        console.log('Fetched applications:', applications);
        
        // Transform the data to match what the frontend expects
        const formattedApplicants = applications.map(app => ({
          _id: app._id,
          status: app.status,
          appliedAt: app.appliedAt,
          job: app.job,
          user: app.applicant,
          resume: app.applicant?.resume
        }));
        
        dispatch(setAllApplicants(formattedApplicants));
      } else {
        throw new Error(response.data?.message || 'Failed to fetch applicants');
      }
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        stack: err.stack
      });
      setError(err.message || 'Failed to load applicants');
      toast.error(err.message || 'Failed to load applicants');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchApplicants();
  }, [dispatch]);

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      const response = await api.patch(
        `/recruiter/applications/status`, 

        { applicationId,status },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('recruiterToken')}`
          }
        }
      );
      
      if (response.data?.success=='success') {
        toast.success('Application status updated successfully');
        // Refresh the applicants list
        await fetchApplicants();
      } else {
        throw new Error(response.data?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error(error.response?.data?.message || 'Failed to update application status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
        <Button 
          variant="outline" 
          onClick={fetchApplicants}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (applicants.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No applicants found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Applicant
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Job Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Applied On
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {applicants.map((application) => (
            <tr key={application._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {application.user?.profilePicture ? (
                      <img 
                        className="h-10 w-10 rounded-full" 
                        src={application.user.profilePicture} 
                        alt={application.user.name} 
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {application.user?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Mail className="h-3.5 w-3.5 mr-1" />
                      {application.user?.email || 'N/A'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {application.job?.title || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${application.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                    application.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'}`}>
                  {application.status || 'pending'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(application.appliedAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleStatusUpdate(application._id, 'accepted')}
                    disabled={application.status === 'accepted'}
                  >
                    <Check className="h-4 w-4 mr-1" /> Accept
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleStatusUpdate(application._id, 'rejected')}
                    disabled={application.status === 'rejected'}
                  >
                    <X className="h-4 w-4 mr-1" /> Reject
                  </Button>
                  {application.resume && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      asChild
                    >
                      <a 
                        href={application.resume} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" /> Resume
                      </a>
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicantsTable;