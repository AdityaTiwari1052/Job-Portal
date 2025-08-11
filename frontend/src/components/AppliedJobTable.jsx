import React, { useEffect } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { useSelector } from 'react-redux';
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar, Briefcase, Building2, ArrowUpRight } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      label: 'Pending',
      icon: <Clock className="h-3.5 w-3.5 mr-1.5" />,
      className: 'bg-amber-100 text-amber-800 hover:bg-amber-100'
    },
    accepted: {
      label: 'Accepted',
      icon: <CheckCircle className="h-3.5 w-3.5 mr-1.5" />,
      className: 'bg-green-100 text-green-800 hover:bg-green-100'
    },
    rejected: {
      label: 'Rejected',
      icon: <XCircle className="h-3.5 w-3.5 mr-1.5" />,
      className: 'bg-red-100 text-red-800 hover:bg-red-100'
    },
    default: {
      label: status || 'Unknown',
      icon: <AlertCircle className="h-3.5 w-3.5 mr-1.5" />,
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
  };

  const { label, icon, className } = statusConfig[status?.toLowerCase()] || statusConfig.default;

  return (
    <div className="flex items-center justify-end">
      <Badge className={`${className} font-medium inline-flex items-center`}>
        {icon}
        {label}
      </Badge>
    </div>
  );
};

const AppliedJobTable = ({ textColor = "#1E3A8A" }) => {
    const { allAppliedJobs = [] } = useSelector(store => store.job);
    
    // Sort jobs by date (newest first)
    const sortedJobs = [...allAppliedJobs].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  
    return (
      <div className="w-full border rounded-lg overflow-hidden">
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader className="bg-gray-50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Job Details
                </div>
              </TableHead>
              <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {sortedJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan="2" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Briefcase className="h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
                    <p className="mt-1">Your job applications will appear here</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedJobs.map((appliedJob) => (
                <TableRow 
                  key={appliedJob._id} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-50 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {appliedJob.job?.title || 'Unspecified Position'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appliedJob.job?.company?.name || 'No company name'}
                        </div>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <Calendar className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                          <span>Applied {formatDistanceToNow(new Date(appliedJob.createdAt), { addSuffix: true })}</span>
                          <span className="mx-2">•</span>
                          <span>{format(new Date(appliedJob.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={appliedJob.status} />
                    {appliedJob.job?.jobId && (
                      <a 
                        href={`/description/${appliedJob.job.jobId}`}
                        className="mt-2 flex items-center text-xs text-blue-600 hover:text-blue-800 justify-end"
                      >
                        View job details
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {sortedJobs.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500 border-t">
            Showing {sortedJobs.length} {sortedJobs.length === 1 ? 'application' : 'applications'}
          </div>
        )}
      </div>
    );
};

export default AppliedJobTable;
