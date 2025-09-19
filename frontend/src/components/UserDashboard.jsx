import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Briefcase, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

const UserDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [stats, setStats] = useState({
    totalApplied: 0,
    inReview: 0,
    accepted: 0,
    rejected: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const response = await api.get('/applications/user');
        if (response.data?.status === 'success') {
          const jobs = response.data.data || [];
          setAppliedJobs(jobs);
          
          // Calculate stats
          setStats({
            totalApplied: jobs.length,
            inReview: jobs.filter(job => job.status === 'applied').length,
            accepted: jobs.filter(job => job.status === 'accepted').length,
            rejected: jobs.filter(job => job.status === 'rejected').length
          });
        }
      } catch (error) {
        console.error('Error fetching applied jobs:', error);
        toast.error('Failed to load your applications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppliedJobs();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Applications */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Applications
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.totalApplied}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* In Review */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      In Review
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.inReview}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Accepted */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Accepted
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.accepted}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Rejected */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Rejected
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.rejected}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Applications
            </h3>
          </div>
          <div className="bg-white overflow-hidden">
            {appliedJobs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You haven't applied to any jobs yet.
                </p>
                <div className="mt-6">
                  <Button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Browse Jobs
                  </Button>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {appliedJobs.slice(0, 5).map((application) => (
                  <li key={application._id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {application.job?.title || 'Job Title'}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {application.job?.company?.name || 'Company Name'}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            {application.job?.location || 'Location'}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          Applied on {new Date(application.appliedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {appliedJobs.length > 5 && (
              <div className="px-4 py-4 sm:px-6 border-t border-gray-200">
                <Button
                  onClick={() => navigate('/applied-jobs')}
                  variant="outline"
                  className="w-full"
                >
                  View all applications
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
