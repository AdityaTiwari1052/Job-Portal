import React, { useEffect } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { useSelector } from 'react-redux';

const AppliedJobTable = ({ textColor = "#1E3A8A" }) => {
    const { allAppliedJobs = [] } = useSelector(store => {
        console.log('Redux store state:', store.job);
        return store.job;
    });
    
    // Debug: Log the applied jobs whenever they change
    useEffect(() => {
        console.log('Applied jobs in component:', allAppliedJobs);
    }, [allAppliedJobs]);
  
    return (
      <div className="w-full">
        <Table>
          <TableCaption className={`text-[${textColor}] font-semibold`}>A list of your applied jobs</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className={`text-[${textColor}]`}>Date</TableHead>
              <TableHead className={`text-[${textColor}]`}>Job Role</TableHead>
              <TableHead className={`text-[${textColor}]`}>Company</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allAppliedJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan="4" className="text-center text-gray-500">
                  You haven't applied to any job yet.
                </TableCell>
              </TableRow>
            ) : (
              allAppliedJobs.map((appliedJob) => {
                console.log('Rendering job application:', appliedJob);
                return (
                  <TableRow key={appliedJob._id}>
                    <TableCell className={`text-[${textColor}]`}>
                      {appliedJob?.createdAt ? new Date(appliedJob.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className={`text-[${textColor}]`}>
                      {appliedJob.job?.title || 'N/A'}
                    </TableCell>
                    <TableCell className={`text-[${textColor}]`}>
                      {appliedJob.job?.company?.name || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className={`${
                        appliedJob?.status === "rejected" ? 'bg-[#EF4444]' :
                        appliedJob?.status === 'pending' ? 'bg-[#F59E0B]' :
                        appliedJob?.status === 'accepted' ? 'bg-[#10B981]' :
                        'bg-gray-400' // Default color for unknown status
                      }`}>
                        {appliedJob?.status?.toUpperCase() || 'UNKNOWN'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    );
};

export default AppliedJobTable;
