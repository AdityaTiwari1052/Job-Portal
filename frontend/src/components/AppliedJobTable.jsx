import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { useSelector } from 'react-redux';

const AppliedJobTable = ({ textColor = "#1E3A8A" }) => {
    const { allAppliedJobs } = useSelector(store => store.job);
  
    return (
      <div>
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
              allAppliedJobs.map((appliedJob) => (
                <TableRow key={appliedJob._id}>
                  <TableCell className={`text-[${textColor}]`}>{appliedJob?.createdAt?.split("T")[0]}</TableCell>
                  <TableCell className={`text-[${textColor}]`}>{appliedJob.job?.title}</TableCell>
                  <TableCell className={`text-[${textColor}]`}>{appliedJob.job?.company?.name}</TableCell>
                  <TableCell className="text-right">
                    <Badge className={`${
                      appliedJob?.status === "rejected" ? 'bg-[#EF4444]' :
                      appliedJob.status === 'pending' ? 'bg-[#F59E0B]' :
                      'bg-[#10B981]'
                    }`}>
                      {appliedJob.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  };
  
export default AppliedJobTable;
