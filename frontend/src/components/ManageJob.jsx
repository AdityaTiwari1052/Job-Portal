import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Pencil, Trash2, Calendar, MapPin, Users, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../utils/api';

const ManageJob = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/jobs/recruiter/my-jobs');
      
      if (response.data?.success) {
        // Make sure we have an array, even if empty
        const jobsData = Array.isArray(response.data.jobs) ? response.data.jobs : [];
        setJobs(jobsData);
        
        if (jobsData.length === 0) {
          console.log('No jobs found for this recruiter');
        }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load jobs. Please try again.';
      setError(errorMessage);
      setJobs([]);
      toast.error(errorMessage);
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('recruiterToken');
        localStorage.removeItem('recruiterData');
        navigate('/recruiter-login');
      }
    } finally {
      setLoading(false);
    }
  };



  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      try {
        await api.delete(`/jobs/${jobId}`);
        toast.success('Job deleted successfully');
        // Refresh the jobs list
        await fetchJobs();
      } catch (error) {
        console.error('Error deleting job:', error);
        toast.error(error.response?.data?.message || 'Failed to delete job');
      }
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <Button 
          className="mt-4" 
          onClick={fetchJobs}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Date Posted
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Location
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Applicants
                </div>
              </th>

              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobs.map((job) => (
              <tr key={job._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{job.title}</div>
                  <div className="text-sm text-gray-500">{job.jobType}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(job.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {job.location || 'Remote'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {job.applications?.length || 0} applicant{job.applications?.length !== 1 ? 's' : ''}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteJob(job._id)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {jobs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No jobs found. Create your first job post.
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageJob;
