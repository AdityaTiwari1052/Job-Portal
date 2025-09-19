import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { FileText, User, Check, X, Clock, File } from 'lucide-react';
import { Badge } from '../ui/badge';
import { setApplications, setLoading, setError } from '../../redux/applicationSlice';
import api from '../../utils/api';

const ApplicantsTable = ({ jobId }) => {
  const dispatch = useDispatch();
  
  // Update the selector to access the correct state path
  const { applications = [], status, error } = useSelector(
    (state) => ({
      applications: state.application?.applications || [],
      status: state.application?.status || 'idle',
      error: state.application?.error || null
    })
  );

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        dispatch(setLoading(true));
        console.log('[ApplicantsTable] Fetching applications...');
        
        const token = localStorage.getItem('recruiterToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await api.get('/recruiter/applications', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('[ApplicantsTable] API response:', response.data);

        if (!response.data || !Array.isArray(response.data.data)) {
          throw new Error('Invalid response format from server');
        }

        let filteredData = response.data.data;
        
        // Filter by jobId if provided
        if (jobId) {
          filteredData = filteredData.filter(app => app.job?._id === jobId);
        }

        console.log(`[ApplicantsTable] Fetched ${filteredData.length} applications`);
        dispatch(setApplications(filteredData));
      } catch (err) {
        console.error('[ApplicantsTable] Error fetching applications:', {
          message: err.message,
          response: err.response?.data
        });
        dispatch(setError(err.response?.data?.message || 'Failed to fetch applications'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchApplications();
  }, [dispatch, jobId]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem('recruiterToken');
      const response = await api.patch(
        '/recruiter/applications/status',
        { 
          applicationId,
          status: newStatus 
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.status === 'success') {
        // Update the application in the Redux store
        const updatedApplications = applications.map(app => 
          app._id === applicationId 
            ? { ...app, status: newStatus }
            : app
        );
        dispatch(setApplications(updatedApplications));
      }
    } catch (error) {
      console.error('Error updating application status:', {
        message: error.message,
        response: error.response?.data
      });
    }
  };

  const filteredApplications = applications.filter(application => {
    return jobId ? application.job?._id === jobId : true;
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'applied':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>;
      case 'shortlisted':
        return <Badge variant="outline" className="bg-green-100 text-green-800">
          <Check className="h-3 w-3 mr-1" /> Shortlisted
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">
          <X className="h-3 w-3 mr-1" /> Rejected
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (status === 'loading') {
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

  if (filteredApplications.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
        <p className="mt-1 text-sm text-gray-500">
          No applications have been submitted yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applicant
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resume
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applied On
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredApplications.map((application) => (
              <tr key={application._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {application.user?.name || 
                         application.user?.email?.split('@')[0].charAt(0).toUpperCase() + application.user?.email?.split('@')[0].slice(1) || 
                         'Anonymous'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {application.user?.email || 'N/A'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{application.job?.title || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{application.job?.company || ''}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {application.resume ? (
                    <a
                      href={application.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900 flex items-center"
                    >
                      <File className="h-4 w-4 mr-1" /> View Resume
                    </a>
                  ) : (
                    <span className="text-gray-400">No resume</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(application.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(application.appliedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <div className="flex space-x-2">
                    <Button 
                      variant={application.status === 'shortlisted' ? 'default' : 'outline'}
                      size="sm"
                      className={application.status === 'shortlisted' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                      onClick={() => handleStatusChange(application._id, 'shortlisted')}
                    >
                      <Check className="h-4 w-4 mr-1" /> Accept
                    </Button>
                    <Button 
                      variant={application.status === 'rejected' ? 'default' : 'outline'}
                      size="sm"
                      className={application.status === 'rejected' ? 'bg-red-100 text-red-800 hover:bg-red-200' : ''}
                      onClick={() => handleStatusChange(application._id, 'rejected')}
                    >
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicantsTable;