import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Pencil, Eye, Trash2, Calendar, MapPin, Users, EyeOff, Loader2 } from 'lucide-react';
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
        setJobs(Array.isArray(response.data.jobs) ? response.data.jobs : []);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError(error.response?.data?.message || 'Failed to load jobs. Please try again.');
      setJobs([]);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (jobId, currentVisibility) => {
    try {
      setUpdating(jobId);
      
      const response = await api.patch(`/jobs/${jobId}/visibility`, {
        isVisible: !currentVisibility
      });
      
      if (response.data?.success) {
        setJobs(jobs.map(job => 
          job._id === jobId ? { ...job, isVisible: response.data.isVisible } : job
        ));
        toast.success(`Job ${!currentVisibility ? 'published' : 'hidden'} successfully`);
      } else {
        throw new Error(response.data?.message || 'Failed to update job visibility');
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast.error(error.response?.data?.message || 'Failed to update job visibility');
    } finally {
      setUpdating(null);
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
                Visibility
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
                    variant={job.isVisible ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleVisibility(job._id, job.isVisible)}
                    disabled={updating === job._id}
                    className="w-24"
                  >
                    {updating === job._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : job.isVisible ? (
                      <Eye className="h-4 w-4 mr-1" />
                    ) : (
                      <EyeOff className="h-4 w-4 mr-1" />
                    )}
                    {job.isVisible ? 'Visible' : 'Hidden'}
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